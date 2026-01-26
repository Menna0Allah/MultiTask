from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.db import models
import stripe
from .models import (
    StripeAccount, Wallet, Transaction, Escrow,
    Refund, Withdrawal, PaymentMethod
)
from .serializers import (
    StripeAccountSerializer, WalletSerializer,
    TransactionSerializer, EscrowSerializer,
    RefundSerializer, WithdrawalSerializer,
    PaymentMethodSerializer
)
from .services import StripeService
from tasks.models import Task, TaskApplication


class CreateConnectAccountView(APIView):
    """
    Create Stripe Connect account for freelancer
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user

        # Check if user is freelancer
        if not user.is_freelancer:
            return Response({
                'error': 'Only freelancers can create payment accounts'
            }, status=status.HTTP_403_FORBIDDEN)

        # Check if account already exists
        if hasattr(user, 'stripe_account'):
            return Response({
                'error': 'Payment account already exists'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            stripe_account = StripeService.create_connect_account(user)
            serializer = StripeAccountSerializer(stripe_account)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConnectOnboardingView(APIView):
    """
    Get onboarding link for Stripe Connect
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user

        try:
            stripe_account = StripeAccount.objects.get(user=user)
        except StripeAccount.DoesNotExist:
            return Response({
                'error': 'Payment account not found. Create one first.'
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            frontend_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:5173'
            return_url = f"{frontend_url}/payments/onboarding?success=true"
            refresh_url = f"{frontend_url}/payments/onboarding"

            onboarding_url = StripeService.create_account_link(
                stripe_account, return_url, refresh_url
            )

            return Response({
                'url': onboarding_url
            })
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConnectAccountStatusView(APIView):
    """
    Get Stripe Connect account status
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        try:
            stripe_account = StripeAccount.objects.get(user=user)
            serializer = StripeAccountSerializer(stripe_account)
            return Response(serializer.data)
        except StripeAccount.DoesNotExist:
            return Response({
                'has_account': False
            }, status=status.HTTP_200_OK)


class CreatePaymentIntentView(APIView):
    """
    Create payment intent for escrow deposit
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        application_id = request.data.get('application_id')

        if not application_id:
            return Response({
                'error': 'application_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            application = TaskApplication.objects.select_related('task', 'freelancer').get(id=application_id)
            task = application.task

            # Debug logging
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Creating payment intent - Task: {task.id}, Status: {task.status}, App Status: {application.status}")
            logger.info(f"Application from: {application.freelancer.username} (ID: {application.freelancer.id})")
            logger.info(f"Task assigned to: {task.assigned_to.username if task.assigned_to else 'None'} (ID: {task.assigned_to.id if task.assigned_to else 'None'})")

            # Verify user is task owner
            if task.client != user:
                return Response({
                    'error': 'Only task owner can initiate payment'
                }, status=status.HTTP_403_FORBIDDEN)

            # Verify task is completed (payment only after completion)
            if task.status != 'COMPLETED':
                return Response({
                    'error': f'Task must be completed before payment (current status: {task.status})'
                }, status=status.HTTP_400_BAD_REQUEST)

            # If task has assigned_to, verify this application is for that freelancer
            # If task doesn't have assigned_to, assign it to this application's freelancer
            if task.assigned_to:
                # Verify this application is for the assigned freelancer
                if application.freelancer != task.assigned_to:
                    return Response({
                        'error': f'Payment can only be made to the assigned freelancer ({task.assigned_to.username}). This application is from {application.freelancer.username}.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Auto-assign the task to this freelancer
                logger.info(f"Auto-assigning task to freelancer {application.freelancer.username}")
                task.assigned_to = application.freelancer
                task.save(update_fields=['assigned_to'])

            # Auto-accept the application if not already accepted (for completed tasks)
            if application.status != 'ACCEPTED':
                logger.info(f"Auto-accepting application {application.id}")
                application.status = 'ACCEPTED'
                application.save(update_fields=['status'])

            # Check if escrow already exists
            if hasattr(task, 'escrow'):
                escrow = task.escrow

                # If escrow is already funded or released, don't allow new payment
                if escrow.status in ['funded', 'released', 'refunded']:
                    return Response({
                        'error': f'Payment already {escrow.status} for this task',
                        'escrow_id': escrow.escrow_id,
                        'status': escrow.status
                    }, status=status.HTTP_400_BAD_REQUEST)

                # If still pending payment, return existing payment intent
                if escrow.status == 'pending_payment' and escrow.stripe_payment_intent_id:
                    try:
                        payment_intent = stripe.PaymentIntent.retrieve(escrow.stripe_payment_intent_id)

                        # If payment intent is still valid, return it
                        if payment_intent.status in ['requires_payment_method', 'requires_confirmation', 'requires_action']:
                            return Response({
                                'client_secret': payment_intent.client_secret,
                                'escrow_id': escrow.escrow_id,
                                'amount': str(escrow.total_amount),
                                'platform_fee': str(escrow.platform_fee_amount),
                                'freelancer_amount': str(escrow.freelancer_amount),
                                'existing': True  # Flag to indicate this is existing payment intent
                            })
                    except stripe.error.StripeError:
                        # Payment intent invalid, continue to create new one
                        pass

                # Delete old pending escrow and create new one
                escrow.delete()

            # Verify task requires payment
            if not task.requires_payment:
                return Response({
                    'error': 'This task does not require payment'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create payment intent
            result = StripeService.create_escrow_payment_intent(
                task, application, application.offered_price
            )

            return Response({
                'client_secret': result['client_secret'],
                'escrow_id': result['escrow'].escrow_id,
                'amount': str(result['escrow'].total_amount),
                'platform_fee': str(result['escrow'].platform_fee_amount),
                'freelancer_amount': str(result['escrow'].freelancer_amount),
            })

        except TaskApplication.DoesNotExist:
            return Response({
                'error': 'Application not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EscrowDetailView(APIView):
    """
    Get escrow details
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, escrow_id):
        user = request.user

        try:
            escrow = Escrow.objects.get(escrow_id=escrow_id)

            # Verify user is involved in escrow
            if user not in [escrow.client, escrow.freelancer]:
                return Response({
                    'error': 'You do not have permission to view this escrow'
                }, status=status.HTTP_403_FORBIDDEN)

            serializer = EscrowSerializer(escrow)
            return Response(serializer.data)

        except Escrow.DoesNotExist:
            return Response({
                'error': 'Escrow not found'
            }, status=status.HTTP_404_NOT_FOUND)


class ReleaseEscrowView(APIView):
    """
    Release escrow funds to freelancer
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, escrow_id):
        user = request.user

        try:
            escrow = Escrow.objects.get(escrow_id=escrow_id)

            # Verify user is task owner
            if escrow.client != user:
                return Response({
                    'error': 'Only task owner can release payment'
                }, status=status.HTTP_403_FORBIDDEN)

            # Verify task is completed
            if escrow.task.status != 'COMPLETED':
                return Response({
                    'error': 'Task must be completed before releasing payment'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Release escrow
            result = StripeService.release_escrow(escrow)

            return Response({
                'message': 'Payment released successfully',
                'escrow': EscrowSerializer(result['escrow']).data
            })

        except Escrow.DoesNotExist:
            return Response({
                'error': 'Escrow not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RefundEscrowView(APIView):
    """
    Refund escrow to client
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, escrow_id):
        user = request.user
        reason = request.data.get('reason', 'client_request')

        try:
            escrow = Escrow.objects.get(escrow_id=escrow_id)

            # Verify user is task owner
            if escrow.client != user:
                return Response({
                    'error': 'Only task owner can request refund'
                }, status=status.HTTP_403_FORBIDDEN)

            # Refund escrow
            result = StripeService.refund_escrow(escrow, reason)

            return Response({
                'message': 'Refund processed successfully',
                'escrow': EscrowSerializer(result['escrow']).data
            })

        except Escrow.DoesNotExist:
            return Response({
                'error': 'Escrow not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WalletView(generics.RetrieveAPIView):
    """
    Get user's wallet
    """
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        wallet, created = Wallet.objects.get_or_create(user=self.request.user)
        return wallet


class TransactionListView(generics.ListAPIView):
    """
    List user's transactions
    """
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Transaction.objects.filter(
            models.Q(sender=user) | models.Q(recipient=user)
        ).order_by('-created_at')


class WithdrawalListView(generics.ListAPIView):
    """
    List user's withdrawals
    """
    serializer_class = WithdrawalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Withdrawal.objects.filter(user=self.request.user).order_by('-created_at')


class CreateWithdrawalView(APIView):
    """
    Create withdrawal request
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        amount = request.data.get('amount')

        if not amount:
            return Response({
                'error': 'Amount is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = float(amount)
            if amount < 50:
                return Response({
                    'error': 'Minimum withdrawal amount is 50 EGP'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check wallet balance
            wallet = Wallet.objects.get(user=user)
            if wallet.available_balance < amount:
                return Response({
                    'error': f'Insufficient balance. Available: {wallet.available_balance} EGP'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Process withdrawal
            result = StripeService.create_payout(user, amount)

            return Response({
                'message': 'Withdrawal processed successfully',
                'withdrawal': WithdrawalSerializer(result['withdrawal']).data
            }, status=status.HTTP_201_CREATED)

        except Wallet.DoesNotExist:
            return Response({
                'error': 'Wallet not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({
                'error': 'Invalid amount'
            }, status=status.HTTP_400_BAD_REQUEST)


class PaymentMethodListView(generics.ListAPIView):
    """
    List saved payment methods
    """
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user, is_active=True)


class AddPaymentMethodView(APIView):
    """
    Add payment method
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        payment_method_id = request.data.get('payment_method_id')

        if not payment_method_id:
            return Response({
                'error': 'payment_method_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment_method = StripeService.add_payment_method(user, payment_method_id)
            serializer = PaymentMethodSerializer(payment_method)
            return Response({
                'message': 'Payment method added successfully',
                'payment_method': serializer.data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeletePaymentMethodView(APIView):
    """
    Delete payment method
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            payment_method = PaymentMethod.objects.get(pk=pk, user=request.user)
            payment_method.is_active = False
            payment_method.save()
            return Response({'message': 'Payment method removed'})
        except PaymentMethod.DoesNotExist:
            return Response({
                'error': 'Payment method not found'
            }, status=status.HTTP_404_NOT_FOUND)


class SetDefaultPaymentMethodView(APIView):
    """
    Set default payment method
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            # Remove default from all user's payment methods
            PaymentMethod.objects.filter(user=request.user).update(is_default=False)

            # Set this one as default
            payment_method = PaymentMethod.objects.get(pk=pk, user=request.user)
            payment_method.is_default = True
            payment_method.save()

            return Response({'message': 'Default payment method updated'})
        except PaymentMethod.DoesNotExist:
            return Response({
                'error': 'Payment method not found'
            }, status=status.HTTP_404_NOT_FOUND)
