from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal


class StripeAccount(models.Model):
    """
    Stripe Connect account for freelancers to receive payments
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='stripe_account'
    )

    # Stripe IDs
    stripe_account_id = models.CharField(max_length=255, unique=True)
    stripe_customer_id = models.CharField(max_length=255, null=True, blank=True)

    # Account details
    account_type = models.CharField(
        max_length=20,
        choices=[
            ('express', 'Express'),
            ('standard', 'Standard'),
            ('custom', 'Custom'),
        ],
        default='express'
    )

    # Status
    is_active = models.BooleanField(default=False)
    charges_enabled = models.BooleanField(default=False)
    payouts_enabled = models.BooleanField(default=False)
    details_submitted = models.BooleanField(default=False)

    # Onboarding
    onboarding_url = models.URLField(null=True, blank=True)
    onboarding_completed = models.BooleanField(default=False)

    # Metadata
    country = models.CharField(max_length=2, default='EG')  # Egypt
    currency = models.CharField(max_length=3, default='EGP')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'stripe_accounts'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['stripe_account_id']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.stripe_account_id}"


class Wallet(models.Model):
    """
    User wallet for tracking available and pending balances
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallet'
    )

    # Balances (in EGP)
    available_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )

    pending_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )

    escrowed_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )

    # Total earnings/spending
    lifetime_earnings = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )

    lifetime_spent = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )

    # Currency
    currency = models.CharField(max_length=3, default='EGP')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.available_balance} {self.currency}"


class Transaction(models.Model):
    """
    All payment transactions (escrow deposits, releases, refunds)
    """
    TRANSACTION_TYPES = [
        ('escrow_deposit', 'Escrow Deposit'),
        ('escrow_release', 'Escrow Release'),
        ('platform_fee', 'Platform Fee'),
        ('refund', 'Refund'),
        ('withdrawal', 'Withdrawal'),
        ('bonus', 'Bonus'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    # ID
    transaction_id = models.CharField(max_length=100, unique=True, db_index=True)

    # Parties
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='transactions_sent'
    )

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='transactions_received'
    )

    # Related objects
    task = models.ForeignKey(
        'tasks.Task',
        on_delete=models.SET_NULL,
        null=True,
        related_name='transactions'
    )

    escrow = models.ForeignKey(
        'Escrow',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )

    # Transaction details
    transaction_type = models.CharField(max_length=30, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Amounts
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )

    platform_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )

    net_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Amount after fees"
    )

    currency = models.CharField(max_length=3, default='EGP')

    # Stripe references
    stripe_payment_intent_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_charge_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_transfer_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_refund_id = models.CharField(max_length=255, null=True, blank=True)

    # Metadata
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    # Status tracking
    processed_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    failure_reason = models.TextField(null=True, blank=True)

    # Idempotency
    idempotency_key = models.CharField(max_length=255, unique=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['sender', '-created_at']),
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['task']),
            models.Index(fields=['stripe_payment_intent_id']),
        ]

    def __str__(self):
        return f"{self.transaction_id} - {self.transaction_type} - {self.amount} {self.currency}"


class Escrow(models.Model):
    """
    Escrow holds funds until task completion
    """
    STATUS_CHOICES = [
        ('pending_payment', 'Pending Payment'),
        ('funded', 'Funded'),
        ('released', 'Released'),
        ('refunded', 'Refunded'),
        ('disputed', 'Disputed'),
        ('cancelled', 'Cancelled'),
    ]

    # ID
    escrow_id = models.CharField(max_length=100, unique=True, db_index=True)

    # Related objects
    task = models.OneToOneField(
        'tasks.Task',
        on_delete=models.CASCADE,
        related_name='escrow'
    )

    task_application = models.ForeignKey(
        'tasks.TaskApplication',
        on_delete=models.SET_NULL,
        null=True,
        related_name='escrows'
    )

    # Parties
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='escrows_as_client'
    )

    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='escrows_as_freelancer'
    )

    # Amounts
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )

    platform_fee_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('15.00'),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Platform fee percentage (10-20%)"
    )

    platform_fee_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    freelancer_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Amount to be paid to freelancer"
    )

    currency = models.CharField(max_length=3, default='EGP')

    # Status
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending_payment')

    # Stripe references
    stripe_payment_intent_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_charge_id = models.CharField(max_length=255, null=True, blank=True)

    # Timeline
    funded_at = models.DateTimeField(null=True, blank=True)
    released_at = models.DateTimeField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)

    # Release conditions
    auto_release_days = models.IntegerField(
        default=7,
        help_text="Days after completion before auto-release"
    )

    release_scheduled_at = models.DateTimeField(null=True, blank=True)

    # Dispute
    disputed_at = models.DateTimeField(null=True, blank=True)
    dispute_reason = models.TextField(null=True, blank=True)
    dispute_resolved_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    notes = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'escrows'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['escrow_id']),
            models.Index(fields=['task']),
            models.Index(fields=['status']),
            models.Index(fields=['client', '-created_at']),
            models.Index(fields=['freelancer', '-created_at']),
        ]

    def __str__(self):
        return f"Escrow {self.escrow_id} - {self.task.title}"

    def calculate_fees(self):
        """Calculate platform fee and freelancer amount"""
        self.platform_fee_amount = (self.total_amount * self.platform_fee_percentage / 100).quantize(Decimal('0.01'))
        self.freelancer_amount = self.total_amount - self.platform_fee_amount
        self.save(update_fields=['platform_fee_amount', 'freelancer_amount'])


class Refund(models.Model):
    """
    Refund records
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    REFUND_REASONS = [
        ('task_cancelled', 'Task Cancelled'),
        ('freelancer_unavailable', 'Freelancer Unavailable'),
        ('client_request', 'Client Request'),
        ('dispute_resolved', 'Dispute Resolved'),
        ('quality_issue', 'Quality Issue'),
        ('other', 'Other'),
    ]

    # ID
    refund_id = models.CharField(max_length=100, unique=True, db_index=True)

    # Related objects
    escrow = models.ForeignKey(
        Escrow,
        on_delete=models.CASCADE,
        related_name='refunds'
    )

    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        related_name='refunds'
    )

    # Refund details
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )

    currency = models.CharField(max_length=3, default='EGP')

    refund_type = models.CharField(
        max_length=20,
        choices=[
            ('full', 'Full Refund'),
            ('partial', 'Partial Refund'),
        ],
        default='full'
    )

    reason = models.CharField(max_length=50, choices=REFUND_REASONS)
    description = models.TextField(blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Stripe reference
    stripe_refund_id = models.CharField(max_length=255, null=True, blank=True)

    # Initiator
    initiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='refunds_initiated'
    )

    # Timeline
    processed_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    failure_reason = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'refunds'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['refund_id']),
            models.Index(fields=['escrow']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Refund {self.refund_id} - {self.amount} {self.currency}"


class PaymentMethod(models.Model):
    """
    Saved payment methods for users
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payment_methods'
    )

    # Stripe reference
    stripe_payment_method_id = models.CharField(max_length=255, unique=True)

    # Card details (last4, brand, etc.)
    card_brand = models.CharField(max_length=20, null=True, blank=True)
    card_last4 = models.CharField(max_length=4, null=True, blank=True)
    card_exp_month = models.IntegerField(null=True, blank=True)
    card_exp_year = models.IntegerField(null=True, blank=True)

    # Status
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payment_methods'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['stripe_payment_method_id']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.card_brand} ****{self.card_last4}"


class Withdrawal(models.Model):
    """
    Freelancer withdrawal requests
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    # ID
    withdrawal_id = models.CharField(max_length=100, unique=True, db_index=True)

    # User
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='withdrawals'
    )

    # Amount
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('50.00'))]  # Minimum withdrawal
    )

    currency = models.CharField(max_length=3, default='EGP')

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Stripe reference (payout)
    stripe_payout_id = models.CharField(max_length=255, null=True, blank=True)

    # Timeline
    processed_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    failure_reason = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'withdrawals'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['withdrawal_id']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Withdrawal {self.withdrawal_id} - {self.amount} {self.currency}"
