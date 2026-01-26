from django.contrib import admin
from .models import (
    StripeAccount, Wallet, Transaction, Escrow,
    Refund, PaymentMethod, Withdrawal
)


@admin.register(StripeAccount)
class StripeAccountAdmin(admin.ModelAdmin):
    list_display = ['user', 'stripe_account_id', 'account_type', 'is_active', 'payouts_enabled', 'onboarding_completed']
    list_filter = ['account_type', 'is_active', 'payouts_enabled', 'onboarding_completed']
    search_fields = ['user__username', 'user__email', 'stripe_account_id']
    readonly_fields = ['stripe_account_id', 'stripe_customer_id', 'created_at', 'updated_at']


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'available_balance', 'escrowed_balance', 'lifetime_earnings', 'currency']
    list_filter = ['currency']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'transaction_type', 'sender', 'recipient', 'amount', 'status', 'created_at']
    list_filter = ['transaction_type', 'status', 'created_at']
    search_fields = ['transaction_id', 'sender__username', 'recipient__username', 'description']
    readonly_fields = ['transaction_id', 'idempotency_key', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(Escrow)
class EscrowAdmin(admin.ModelAdmin):
    list_display = ['escrow_id', 'task', 'client', 'freelancer', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at', 'funded_at', 'released_at']
    search_fields = ['escrow_id', 'task__title', 'client__username', 'freelancer__username']
    readonly_fields = ['escrow_id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ['refund_id', 'escrow', 'amount', 'refund_type', 'status', 'created_at']
    list_filter = ['refund_type', 'status', 'reason', 'created_at']
    search_fields = ['refund_id', 'escrow__escrow_id']
    readonly_fields = ['refund_id', 'created_at', 'updated_at']


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['user', 'card_brand', 'card_last4', 'is_default', 'is_active', 'created_at']
    list_filter = ['card_brand', 'is_default', 'is_active']
    search_fields = ['user__username', 'stripe_payment_method_id', 'card_last4']


@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = ['withdrawal_id', 'user', 'amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['withdrawal_id', 'user__username']
    readonly_fields = ['withdrawal_id', 'created_at', 'updated_at']
