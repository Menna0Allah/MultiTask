import stripe
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils import timezone
import logging
from .services import StripeService
from .models import Escrow, StripeAccount, Transaction, Withdrawal

logger = logging.getLogger(__name__)


@csrf_exempt
@require_POST
def stripe_webhook(request):
    """
    Handle Stripe webhooks
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        logger.error("Invalid webhook payload")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid webhook signature")
        return HttpResponse(status=400)

    # Handle different event types
    event_type = event['type']

    handlers = {
        'payment_intent.succeeded': handle_payment_intent_succeeded,
        'payment_intent.payment_failed': handle_payment_intent_failed,
        'account.updated': handle_account_updated,
        'charge.refunded': handle_charge_refunded,
        'transfer.created': handle_transfer_created,
        'payout.paid': handle_payout_paid,
        'payout.failed': handle_payout_failed,
    }

    handler = handlers.get(event_type)

    if handler:
        try:
            handler(event)
            logger.info(f"Successfully handled webhook: {event_type}")
        except Exception as e:
            logger.error(f"Error handling webhook {event_type}: {str(e)}")
            return HttpResponse(status=500)
    else:
        logger.warning(f"Unhandled webhook event type: {event_type}")

    return HttpResponse(status=200)


def handle_payment_intent_succeeded(event):
    """
    Handle successful payment
    """
    payment_intent = event['data']['object']
    payment_intent_id = payment_intent['id']

    # Confirm escrow is funded
    StripeService.confirm_escrow_funded(payment_intent_id)

    logger.info(f"Payment intent succeeded: {payment_intent_id}")


def handle_payment_intent_failed(event):
    """
    Handle failed payment
    """
    payment_intent = event['data']['object']
    payment_intent_id = payment_intent['id']

    try:
        transaction = Transaction.objects.get(stripe_payment_intent_id=payment_intent_id)
        transaction.status = 'failed'
        transaction.failed_at = timezone.now()
        transaction.failure_reason = payment_intent.get('last_payment_error', {}).get('message', 'Unknown error')
        transaction.save()

        logger.error(f"Payment intent failed: {payment_intent_id}")
    except Transaction.DoesNotExist:
        logger.warning(f"Transaction not found for failed payment: {payment_intent_id}")


def handle_account_updated(event):
    """
    Handle Stripe Connect account updates
    """
    account = event['data']['object']
    account_id = account['id']

    try:
        stripe_account = StripeAccount.objects.get(stripe_account_id=account_id)
        stripe_account.charges_enabled = account.get('charges_enabled', False)
        stripe_account.payouts_enabled = account.get('payouts_enabled', False)
        stripe_account.details_submitted = account.get('details_submitted', False)
        stripe_account.save()

        # Check if onboarding completed
        if stripe_account.details_submitted and not stripe_account.onboarding_completed:
            stripe_account.onboarding_completed = True
            stripe_account.is_active = True
            stripe_account.save()

            # Notify user
            from notifications.models import Notification
            Notification.create_notification(
                recipient=stripe_account.user,
                notification_type='system',
                title='Payment Account Activated',
                message='Your payment account has been successfully activated. You can now receive payments.',
                link='/settings/payments'
            )

        logger.info(f"Account updated: {account_id}")
    except StripeAccount.DoesNotExist:
        logger.warning(f"StripeAccount not found: {account_id}")


def handle_charge_refunded(event):
    """
    Handle charge refund
    """
    charge = event['data']['object']
    charge_id = charge['id']

    logger.info(f"Charge refunded: {charge_id}")


def handle_transfer_created(event):
    """
    Handle transfer created
    """
    transfer = event['data']['object']
    transfer_id = transfer['id']

    logger.info(f"Transfer created: {transfer_id}")


def handle_payout_paid(event):
    """
    Handle successful payout
    """
    payout = event['data']['object']
    payout_id = payout['id']

    try:
        withdrawal = Withdrawal.objects.get(stripe_payout_id=payout_id)
        withdrawal.status = 'completed'
        withdrawal.processed_at = timezone.now()
        withdrawal.save()

        logger.info(f"Payout paid: {payout_id}")
    except Withdrawal.DoesNotExist:
        logger.warning(f"Withdrawal not found for payout: {payout_id}")


def handle_payout_failed(event):
    """
    Handle failed payout
    """
    payout = event['data']['object']
    payout_id = payout['id']

    try:
        withdrawal = Withdrawal.objects.get(stripe_payout_id=payout_id)
        withdrawal.status = 'failed'
        withdrawal.failed_at = timezone.now()
        withdrawal.failure_reason = payout.get('failure_message', 'Unknown error')
        withdrawal.save()

        logger.error(f"Payout failed: {payout_id}")
    except Withdrawal.DoesNotExist:
        logger.warning(f"Withdrawal not found for failed payout: {payout_id}")
