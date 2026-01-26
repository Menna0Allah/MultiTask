from rest_framework import serializers
from .models import (
    StripeAccount, Wallet, Transaction, Escrow,
    Refund, PaymentMethod, Withdrawal
)
from accounts.models import User


class StripeAccountSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    has_account = serializers.SerializerMethodField()

    class Meta:
        model = StripeAccount
        fields = [
            'id', 'user', 'username', 'stripe_account_id',
            'account_type', 'is_active', 'charges_enabled',
            'payouts_enabled', 'details_submitted',
            'onboarding_completed', 'country', 'currency',
            'has_account', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'stripe_account_id', 'charges_enabled', 'payouts_enabled',
            'details_submitted', 'onboarding_completed'
        ]

    def get_has_account(self, obj):
        """Always return True since this serializer is only used when account exists"""
        return True


class WalletSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Wallet
        fields = [
            'id', 'user', 'username', 'available_balance',
            'pending_balance', 'escrowed_balance',
            'lifetime_earnings', 'lifetime_spent',
            'currency', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'available_balance', 'pending_balance', 'escrowed_balance',
            'lifetime_earnings', 'lifetime_spent'
        ]


class TransactionSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    recipient_username = serializers.CharField(source='recipient.username', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_id', 'sender', 'sender_username',
            'recipient', 'recipient_username', 'task', 'task_title',
            'escrow', 'transaction_type', 'status', 'amount',
            'platform_fee', 'net_amount', 'currency',
            'stripe_payment_intent_id', 'stripe_charge_id',
            'stripe_transfer_id', 'stripe_refund_id',
            'description', 'processed_at', 'failed_at',
            'failure_reason', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'transaction_id', 'status', 'processed_at',
            'failed_at', 'failure_reason'
        ]


class EscrowSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source='client.username', read_only=True)
    freelancer_username = serializers.CharField(source='freelancer.username', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)

    class Meta:
        model = Escrow
        fields = [
            'id', 'escrow_id', 'task', 'task_title',
            'task_application', 'client', 'client_username',
            'freelancer', 'freelancer_username', 'total_amount',
            'platform_fee_percentage', 'platform_fee_amount',
            'freelancer_amount', 'currency', 'status',
            'stripe_payment_intent_id', 'stripe_charge_id',
            'funded_at', 'released_at', 'refunded_at',
            'auto_release_days', 'release_scheduled_at',
            'disputed_at', 'dispute_reason', 'dispute_resolved_at',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'escrow_id', 'platform_fee_amount', 'freelancer_amount',
            'status', 'funded_at', 'released_at', 'refunded_at'
        ]


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = [
            'id', 'refund_id', 'escrow', 'transaction',
            'amount', 'currency', 'refund_type', 'reason',
            'description', 'status', 'stripe_refund_id',
            'initiated_by', 'processed_at', 'failed_at',
            'failure_reason', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'refund_id', 'status', 'stripe_refund_id',
            'processed_at', 'failed_at', 'failure_reason'
        ]


class PaymentMethodSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'user', 'username', 'stripe_payment_method_id',
            'card_brand', 'card_last4', 'card_exp_month',
            'card_exp_year', 'is_default', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'stripe_payment_method_id', 'card_brand',
            'card_last4', 'card_exp_month', 'card_exp_year'
        ]


class WithdrawalSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Withdrawal
        fields = [
            'id', 'withdrawal_id', 'user', 'username',
            'amount', 'currency', 'status', 'stripe_payout_id',
            'processed_at', 'failed_at', 'failure_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'withdrawal_id', 'status', 'stripe_payout_id',
            'processed_at', 'failed_at', 'failure_reason'
        ]
