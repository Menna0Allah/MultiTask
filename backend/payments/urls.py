from django.urls import path
from . import views
from .webhooks import stripe_webhook

urlpatterns = [
    # Stripe Connect
    path('connect/create/', views.CreateConnectAccountView.as_view(), name='create-connect-account'),
    path('connect/onboarding/', views.ConnectOnboardingView.as_view(), name='connect-onboarding'),
    path('connect/status/', views.ConnectAccountStatusView.as_view(), name='connect-status'),

    # Payment Intents
    path('intents/create/', views.CreatePaymentIntentView.as_view(), name='create-payment-intent'),

    # Escrow
    path('escrow/<str:escrow_id>/', views.EscrowDetailView.as_view(), name='escrow-detail'),
    path('escrow/<str:escrow_id>/release/', views.ReleaseEscrowView.as_view(), name='release-escrow'),
    path('escrow/<str:escrow_id>/refund/', views.RefundEscrowView.as_view(), name='refund-escrow'),

    # Wallet
    path('wallet/', views.WalletView.as_view(), name='wallet'),
    path('wallet/transactions/', views.TransactionListView.as_view(), name='transactions'),

    # Withdrawals
    path('withdrawals/', views.WithdrawalListView.as_view(), name='withdrawals'),
    path('withdrawals/create/', views.CreateWithdrawalView.as_view(), name='create-withdrawal'),

    # Payment Methods
    path('payment-methods/', views.PaymentMethodListView.as_view(), name='payment-methods'),
    path('payment-methods/create/', views.AddPaymentMethodView.as_view(), name='add-payment-method'),
    path('payment-methods/<int:pk>/delete/', views.DeletePaymentMethodView.as_view(), name='delete-payment-method'),
    path('payment-methods/<int:pk>/set-default/', views.SetDefaultPaymentMethodView.as_view(), name='set-default-payment-method'),

    # Webhooks
    path('webhooks/stripe/', stripe_webhook, name='stripe-webhook'),
]
