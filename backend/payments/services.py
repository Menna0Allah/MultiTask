import stripe
from django.conf import settings
from decimal import Decimal
import uuid
from django.utils import timezone
from .models import (
    StripeAccount, Escrow, Transaction, Refund,
    Wallet, Withdrawal, PaymentMethod
)
from tasks.models import Task, TaskApplication
from notifications.models import Notification

stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """
    Centralized Stripe integration service for escrow payments
    """

    PLATFORM_FEE_PERCENTAGE = Decimal('15.00')  # 15%

    @staticmethod
    def create_connect_account(user):
        """
        Create Stripe Connect Express account for freelancer
        """
        try:
            # Create Stripe Express account
            account = stripe.Account.create(
                type='express',
                country='EG',  # Egypt
                email=user.email,
                capabilities={
                    'card_payments': {'requested': True},
                    'transfers': {'requested': True},
                },
                business_type='individual',
                metadata={
                    'user_id': user.id,
                    'username': user.username,
                }
            )

            # Save to database
            stripe_account = StripeAccount.objects.create(
                user=user,
                stripe_account_id=account.id,
                account_type='express',
                country='EG',
                currency='EGP'
            )

            return stripe_account

        except stripe.error.StripeError as e:
            raise Exception(f"Stripe account creation failed: {str(e)}")

    @staticmethod
    def create_account_link(stripe_account, return_url, refresh_url):
        """
        Create onboarding link for Stripe Connect account
        """
        try:
            account_link = stripe.AccountLink.create(
                account=stripe_account.stripe_account_id,
                refresh_url=refresh_url,
                return_url=return_url,
                type='account_onboarding',
            )

            stripe_account.onboarding_url = account_link.url
            stripe_account.save(update_fields=['onboarding_url'])

            return account_link.url

        except stripe.error.StripeError as e:
            raise Exception(f"Account link creation failed: {str(e)}")

    @classmethod
    def create_escrow_payment_intent(cls, task, application, amount):
        """
        Create Payment Intent for escrow deposit
        Client pays: task amount (platform fee deducted on release)
        """
        try:
            # Calculate fees
            platform_fee = (amount * cls.PLATFORM_FEE_PERCENTAGE / 100).quantize(Decimal('0.01'))
            total_amount = amount  # Client pays the full task amount
            freelancer_amount = amount - platform_fee

            # Create or get escrow
            escrow = Escrow.objects.create(
                escrow_id=f"ESC-{uuid.uuid4().hex[:12].upper()}",
                task=task,
                task_application=application,
                client=task.client,
                freelancer=application.freelancer,
                total_amount=total_amount,
                platform_fee_percentage=cls.PLATFORM_FEE_PERCENTAGE,
                platform_fee_amount=platform_fee,
                freelancer_amount=freelancer_amount,
                currency='EGP',
                status='pending_payment'
            )

            # Convert to smallest currency unit (piastres for EGP)
            amount_piastres = int(total_amount * 100)

            # Create Payment Intent
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_piastres,
                currency='egp',
                payment_method_types=['card'],
                capture_method='automatic',  # Capture immediately
                metadata={
                    'escrow_id': escrow.escrow_id,
                    'task_id': task.id,
                    'client_id': task.client.id,
                    'freelancer_id': application.freelancer.id,
                    'platform_fee': str(platform_fee),
                },
                description=f"Escrow payment for task: {task.title}",
            )

            # Update escrow
            escrow.stripe_payment_intent_id = payment_intent.id
            escrow.save(update_fields=['stripe_payment_intent_id'])

            # Create pending transaction
            transaction = Transaction.objects.create(
                transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
                sender=task.client,
                recipient=None,  # Platform holds for now
                task=task,
                escrow=escrow,
                transaction_type='escrow_deposit',
                status='pending',
                amount=total_amount,
                platform_fee=platform_fee,
                net_amount=freelancer_amount,
                currency='EGP',
                stripe_payment_intent_id=payment_intent.id,
                description=f"Escrow deposit for {task.title}",
                idempotency_key=f"escrow-{escrow.escrow_id}-deposit",
            )

            return {
                'escrow': escrow,
                'payment_intent': payment_intent,
                'transaction': transaction,
                'client_secret': payment_intent.client_secret,
            }

        except stripe.error.StripeError as e:
            raise Exception(f"Payment Intent creation failed: {str(e)}")

    @classmethod
    def confirm_escrow_funded(cls, payment_intent_id):
        """
        Confirm escrow is funded after successful payment
        Called by webhook handler
        Auto-releases payment immediately since task is already completed
        """
        try:
            # Get payment intent with charges expanded
            payment_intent = stripe.PaymentIntent.retrieve(
                payment_intent_id,
                expand=['latest_charge']
            )

            # Find escrow
            escrow = Escrow.objects.get(stripe_payment_intent_id=payment_intent_id)
            transaction = Transaction.objects.get(stripe_payment_intent_id=payment_intent_id)

            # Get charge ID safely
            charge_id = None
            if hasattr(payment_intent, 'latest_charge') and payment_intent.latest_charge:
                charge_id = payment_intent.latest_charge if isinstance(payment_intent.latest_charge, str) else payment_intent.latest_charge.id

            # Update escrow status
            escrow.status = 'funded'
            escrow.funded_at = timezone.now()
            if charge_id:
                escrow.stripe_charge_id = charge_id
                escrow.save(update_fields=['status', 'funded_at', 'stripe_charge_id'])
            else:
                escrow.save(update_fields=['status', 'funded_at'])

            # Update transaction
            transaction.status = 'succeeded'
            transaction.processed_at = timezone.now()
            if charge_id:
                transaction.stripe_charge_id = charge_id
                transaction.save(update_fields=['status', 'stripe_charge_id', 'processed_at'])
            else:
                transaction.save(update_fields=['status', 'processed_at'])

            # Update client wallet
            client_wallet, _ = Wallet.objects.get_or_create(user=escrow.client)
            client_wallet.lifetime_spent += escrow.total_amount
            client_wallet.save(update_fields=['lifetime_spent'])

            # Update task payment status temporarily (will be updated to 'released' immediately)
            task = escrow.task
            task.payment_status = 'escrowed'
            task.final_amount = escrow.total_amount
            task.save(update_fields=['payment_status', 'final_amount'])

            # Immediately release payment since task is already completed
            if task.status == 'COMPLETED':
                try:
                    cls.release_escrow(escrow)

                    # Send success notification
                    Notification.create_notification(
                        recipient=escrow.freelancer,
                        notification_type='payment_received',
                        title='Payment Released',
                        message=f'You received {escrow.freelancer_amount} EGP for completing {task.title}',
                        task_id=task.id,
                        link=f'/wallet'
                    )

                    Notification.create_notification(
                        recipient=escrow.client,
                        notification_type='task_completed',
                        title='Payment Completed',
                        message=f'Payment of {escrow.freelancer_amount} EGP released to freelancer for {task.title}',
                        task_id=task.id,
                        link=f'/tasks/{task.id}'
                    )
                except Exception as release_error:
                    # If release fails, still funded - log error
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to auto-release escrow {escrow.escrow_id}: {str(release_error)}")

                    # Send escrow notification instead
                    Notification.create_notification(
                        recipient=escrow.freelancer,
                        notification_type='payment_received',
                        title='Payment Secured in Escrow',
                        message=f'Client has paid {escrow.total_amount} EGP for {task.title}.',
                        task_id=task.id,
                        link=f'/tasks/{task.id}'
                    )

            return escrow

        except Exception as e:
            raise Exception(f"Escrow confirmation failed: {str(e)}")

    @classmethod
    def release_escrow(cls, escrow):
        """
        Release funds from escrow to freelancer
        Called when task is completed
        """
        try:
            # Verify escrow is funded
            if escrow.status != 'funded':
                raise Exception("Escrow must be funded before release")

            # Get freelancer's Stripe account
            freelancer_account = StripeAccount.objects.get(user=escrow.freelancer)

            if not freelancer_account.payouts_enabled:
                raise Exception("Freelancer account not ready for payouts. Please complete Stripe onboarding.")

            # Convert to smallest currency unit
            amount_piastres = int(escrow.freelancer_amount * 100)

            # Create transfer to freelancer's connected account
            transfer = stripe.Transfer.create(
                amount=amount_piastres,
                currency='egp',
                destination=freelancer_account.stripe_account_id,
                transfer_group=escrow.escrow_id,
                metadata={
                    'escrow_id': escrow.escrow_id,
                    'task_id': escrow.task.id,
                    'freelancer_id': escrow.freelancer.id,
                },
                description=f"Payment for task: {escrow.task.title}",
            )

            # Update escrow
            escrow.status = 'released'
            escrow.released_at = timezone.now()
            escrow.save(update_fields=['status', 'released_at'])

            # Create release transaction
            transaction = Transaction.objects.create(
                transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
                sender=None,  # Platform
                recipient=escrow.freelancer,
                task=escrow.task,
                escrow=escrow,
                transaction_type='escrow_release',
                status='succeeded',
                amount=escrow.freelancer_amount,
                platform_fee=Decimal('0.00'),
                net_amount=escrow.freelancer_amount,
                currency='EGP',
                stripe_transfer_id=transfer.id,
                description=f"Escrow release for {escrow.task.title}",
                idempotency_key=f"escrow-{escrow.escrow_id}-release",
                processed_at=timezone.now(),
            )

            # Update task
            escrow.task.payment_status = 'released'
            escrow.task.save(update_fields=['payment_status'])

            # Update freelancer wallet
            freelancer_wallet, _ = Wallet.objects.get_or_create(user=escrow.freelancer)
            freelancer_wallet.escrowed_balance -= escrow.freelancer_amount
            freelancer_wallet.available_balance += escrow.freelancer_amount
            freelancer_wallet.lifetime_earnings += escrow.freelancer_amount
            freelancer_wallet.save()

            # Send notifications
            Notification.create_notification(
                recipient=escrow.freelancer,
                notification_type='payment_received',
                title='Payment Released',
                message=f'You received {escrow.freelancer_amount} EGP for completing {escrow.task.title}',
                task_id=escrow.task.id,
                link=f'/wallet'
            )

            Notification.create_notification(
                recipient=escrow.client,
                notification_type='task_completed',
                title='Payment Released',
                message=f'Payment of {escrow.freelancer_amount} EGP released to freelancer for {escrow.task.title}',
                task_id=escrow.task.id,
                link=f'/tasks/{escrow.task.id}'
            )

            return {
                'escrow': escrow,
                'transfer': transfer,
                'transaction': transaction,
            }

        except stripe.error.StripeError as e:
            raise Exception(f"Escrow release failed: {str(e)}")

    @staticmethod
    def refund_escrow(escrow, reason, amount=None):
        """
        Refund escrow to client
        """
        try:
            # Verify escrow can be refunded
            if escrow.status not in ['funded', 'disputed']:
                raise Exception("Escrow cannot be refunded in current status")

            # Verify stripe_charge_id exists
            if not escrow.stripe_charge_id:
                raise Exception("Cannot refund: No payment charge ID found")

            # Determine refund amount
            refund_amount = amount or escrow.total_amount

            # Convert to smallest currency unit
            amount_piastres = int(refund_amount * 100)

            # Create Stripe refund
            refund = stripe.Refund.create(
                charge=escrow.stripe_charge_id,
                amount=amount_piastres,
                reason=reason if reason in ['duplicate', 'fraudulent', 'requested_by_customer'] else 'requested_by_customer',
                metadata={
                    'escrow_id': escrow.escrow_id,
                    'task_id': escrow.task.id,
                },
            )

            # Update escrow
            escrow.status = 'refunded'
            escrow.refunded_at = timezone.now()
            escrow.save(update_fields=['status', 'refunded_at'])

            # Create refund record
            refund_record = Refund.objects.create(
                refund_id=f"REF-{uuid.uuid4().hex[:12].upper()}",
                escrow=escrow,
                amount=refund_amount,
                currency='EGP',
                refund_type='full' if refund_amount == escrow.total_amount else 'partial',
                reason=reason,
                status='succeeded',
                stripe_refund_id=refund.id,
                processed_at=timezone.now(),
            )

            # Create refund transaction
            transaction = Transaction.objects.create(
                transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
                sender=None,  # Platform
                recipient=escrow.client,
                task=escrow.task,
                escrow=escrow,
                transaction_type='refund',
                status='succeeded',
                amount=refund_amount,
                platform_fee=Decimal('0.00'),
                net_amount=refund_amount,
                currency='EGP',
                stripe_refund_id=refund.id,
                description=f"Refund for {escrow.task.title}",
                idempotency_key=f"escrow-{escrow.escrow_id}-refund",
                processed_at=timezone.now(),
            )

            # Update task
            escrow.task.payment_status = 'refunded'
            escrow.task.save(update_fields=['payment_status'])

            # Update wallets
            freelancer_wallet, _ = Wallet.objects.get_or_create(user=escrow.freelancer)
            if freelancer_wallet.escrowed_balance >= escrow.freelancer_amount:
                freelancer_wallet.escrowed_balance -= escrow.freelancer_amount
                freelancer_wallet.save(update_fields=['escrowed_balance'])

            # Send notifications
            Notification.create_notification(
                recipient=escrow.client,
                notification_type='payment_received',
                title='Refund Processed',
                message=f'You received a refund of {refund_amount} EGP for {escrow.task.title}',
                task_id=escrow.task.id,
                link=f'/tasks/{escrow.task.id}'
            )

            return {
                'escrow': escrow,
                'refund': refund,
                'refund_record': refund_record,
                'transaction': transaction,
            }

        except stripe.error.StripeError as e:
            raise Exception(f"Refund failed: {str(e)}")

    @staticmethod
    def create_payout(user, amount):
        """
        Create payout/withdrawal for freelancer
        Transfers money from wallet to their bank account via Stripe
        """
        try:
            # Get freelancer's Stripe account
            stripe_account = StripeAccount.objects.get(user=user)

            if not stripe_account.payouts_enabled:
                raise Exception("Your Stripe account is not ready for payouts. Please complete onboarding.")

            # Get wallet
            wallet = Wallet.objects.get(user=user)

            # Verify sufficient balance
            if wallet.available_balance < amount:
                raise Exception(f"Insufficient balance. Available: {wallet.available_balance} EGP")

            # Create withdrawal record
            withdrawal = Withdrawal.objects.create(
                withdrawal_id=f"WTH-{uuid.uuid4().hex[:12].upper()}",
                user=user,
                amount=amount,
                currency='EGP',
                status='processing'
            )

            # Convert to smallest currency unit
            amount_piastres = int(amount * 100)

            # Create Stripe payout to connected account
            payout = stripe.Payout.create(
                amount=amount_piastres,
                currency='egp',
                description=f"Withdrawal {withdrawal.withdrawal_id}",
                metadata={
                    'withdrawal_id': withdrawal.withdrawal_id,
                    'user_id': user.id,
                },
                stripe_account=stripe_account.stripe_account_id
            )

            # Update withdrawal
            withdrawal.stripe_payout_id = payout.id
            withdrawal.status = 'completed'
            withdrawal.processed_at = timezone.now()
            withdrawal.save()

            # Update wallet
            wallet.available_balance -= amount
            wallet.save(update_fields=['available_balance'])

            # Create transaction record
            transaction = Transaction.objects.create(
                transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
                sender=user,
                recipient=None,
                transaction_type='withdrawal',
                status='succeeded',
                amount=amount,
                platform_fee=Decimal('0.00'),
                net_amount=amount,
                currency='EGP',
                description=f"Withdrawal to bank account",
                idempotency_key=f"withdrawal-{withdrawal.withdrawal_id}",
                processed_at=timezone.now(),
            )

            # Send notification
            Notification.create_notification(
                recipient=user,
                notification_type='payment_received',
                title='Withdrawal Processed',
                message=f'Your withdrawal of {amount} EGP has been processed successfully',
                link=f'/wallet'
            )

            return {
                'withdrawal': withdrawal,
                'payout': payout,
                'transaction': transaction,
            }

        except StripeAccount.DoesNotExist:
            raise Exception("No Stripe account found. Please complete payment setup first.")
        except Wallet.DoesNotExist:
            raise Exception("Wallet not found.")
        except stripe.error.StripeError as e:
            # Update withdrawal status
            if 'withdrawal' in locals():
                withdrawal.status = 'failed'
                withdrawal.failed_at = timezone.now()
                withdrawal.failure_reason = str(e)
                withdrawal.save()
            raise Exception(f"Payout failed: {str(e)}")

    @staticmethod
    def add_payment_method(user, payment_method_id):
        """
        Add and save payment method for user
        """
        try:
            # Retrieve payment method from Stripe
            payment_method = stripe.PaymentMethod.retrieve(payment_method_id)

            # Attach to customer (create customer if needed)
            stripe_account = StripeAccount.objects.filter(user=user).first()

            if not stripe_account or not stripe_account.stripe_customer_id:
                # Create Stripe customer
                customer = stripe.Customer.create(
                    email=user.email,
                    name=user.get_full_name(),
                    metadata={
                        'user_id': user.id,
                        'username': user.username,
                    }
                )

                # Update or create stripe account record
                if stripe_account:
                    stripe_account.stripe_customer_id = customer.id
                    stripe_account.save(update_fields=['stripe_customer_id'])
                else:
                    # Create minimal stripe account for customer ID storage
                    stripe_account = StripeAccount.objects.create(
                        user=user,
                        stripe_account_id='',  # Will be set when they become freelancer
                        stripe_customer_id=customer.id,
                        account_type='express'
                    )

            # Attach payment method to customer
            stripe.PaymentMethod.attach(
                payment_method_id,
                customer=stripe_account.stripe_customer_id,
            )

            # Save payment method
            card = payment_method.card
            payment_method_obj = PaymentMethod.objects.create(
                user=user,
                stripe_payment_method_id=payment_method_id,
                card_brand=card.brand,
                card_last4=card.last4,
                card_exp_month=card.exp_month,
                card_exp_year=card.exp_year,
                is_default=False,
                is_active=True
            )

            # If this is the first payment method, make it default
            if PaymentMethod.objects.filter(user=user, is_active=True).count() == 1:
                payment_method_obj.is_default = True
                payment_method_obj.save(update_fields=['is_default'])

                # Set as default in Stripe
                stripe.Customer.modify(
                    stripe_account.stripe_customer_id,
                    invoice_settings={'default_payment_method': payment_method_id}
                )

            return payment_method_obj

        except stripe.error.StripeError as e:
            raise Exception(f"Failed to add payment method: {str(e)}")
