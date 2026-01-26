import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function StripeOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    checkAccountStatus();
  }, []);

  const checkAccountStatus = async () => {
    try {
      setLoading(true);
      const status = await paymentService.getConnectStatus();
      setAccountStatus(status);

      // Handle return from Stripe onboarding
      const success = searchParams.get('success');
      if (success === 'true') {
        toast.success('Account setup successful!');
      } else if (success === 'false') {
        toast.error('Account setup was cancelled');
      }
    } catch (error) {
      console.error('Error checking account status:', error);
      // User might not have an account yet
      if (error.response?.status !== 404) {
        toast.error('Failed to check account status');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      setIsCreating(true);
      await paymentService.createConnectAccount();

      // Get onboarding link
      const { url } = await paymentService.getOnboardingLink();

      // Redirect to Stripe onboarding
      window.location.href = url;
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error(error.response?.data?.error || 'Failed to create Stripe account');
      setIsCreating(false);
    }
  };

  const handleContinueOnboarding = async () => {
    try {
      setIsCreating(true);
      const { url } = await paymentService.getOnboardingLink();
      window.location.href = url;
    } catch (error) {
      console.error('Error getting onboarding link:', error);
      toast.error('Failed to continue onboarding');
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <Loading />
      </div>
    );
  }

  const isOnboardingComplete = accountStatus?.onboarding_completed;
  const canReceivePayments = accountStatus?.charges_enabled && accountStatus?.payouts_enabled;

  return (
    <div className="container-custom py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Setup</h1>
        <p className="text-gray-600">Connect your Stripe account to receive payments</p>
      </div>

      {/* Account Status */}
      {accountStatus ? (
        <div className="space-y-6">
          {/* Status Card */}
          <Card className={`border-2 ${canReceivePayments ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}`}>
            <div className="flex items-center gap-4">
              {canReceivePayments ? (
                <CheckCircleIcon className="w-12 h-12 text-green-600" />
              ) : (
                <ClockIcon className="w-12 h-12 text-yellow-600" />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {canReceivePayments ? 'Account Active' : 'Setup Incomplete'}
                </h2>
                <p className="text-gray-700">
                  {canReceivePayments
                    ? 'Your account is ready to receive payments'
                    : 'Complete your account setup to start receiving payments'}
                </p>
              </div>
            </div>
          </Card>

          {/* Status Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
            <div className="space-y-3">
              <StatusItem
                label="Onboarding"
                completed={isOnboardingComplete}
                description="Complete Stripe account setup"
              />
              <StatusItem
                label="Charges Enabled"
                completed={accountStatus.charges_enabled}
                description="Ability to receive payments"
              />
              <StatusItem
                label="Payouts Enabled"
                completed={accountStatus.payouts_enabled}
                description="Ability to withdraw funds to your bank"
              />
            </div>
          </Card>

          {/* Action Button */}
          {!canReceivePayments && (
            <Card className="bg-blue-50 border border-blue-200">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Continue Setup
                </h3>
                <p className="text-gray-600 mb-4">
                  Complete your Stripe account setup to start receiving payments for your work
                </p>
                <Button
                  onClick={handleContinueOnboarding}
                  disabled={isCreating}
                  className="w-full md:w-auto"
                >
                  {isCreating ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Continue Setup'
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Success Actions */}
          {canReceivePayments && (
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/wallet')}
                className="flex-1"
              >
                <BanknotesIcon className="w-4 h-4 mr-2" />
                View Wallet
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="flex-1"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      ) : (
        // No account yet
        <div className="space-y-6">
          {/* Benefits */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Why Connect Stripe?</h2>
            <div className="space-y-4">
              <BenefitItem
                icon={BanknotesIcon}
                title="Secure Payments"
                description="Receive payments securely through Stripe's industry-leading platform"
              />
              <BenefitItem
                icon={ShieldCheckIcon}
                title="Protected Transactions"
                description="All transactions are protected with escrow until task completion"
              />
              <BenefitItem
                icon={CheckCircleIcon}
                title="Fast Payouts"
                description="Withdraw your earnings directly to your bank account"
              />
            </div>
          </Card>

          {/* Get Started */}
          <Card className="bg-blue-50 border border-blue-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get Started
              </h3>
              <p className="text-gray-600 mb-4">
                Create your Stripe Express account to start receiving payments. The setup process
                takes just a few minutes.
              </p>
              <Button
                onClick={handleCreateAccount}
                disabled={isCreating}
                className="w-full md:w-auto"
              >
                {isCreating ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Stripe Account'
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-3">
                You'll be redirected to Stripe to complete the setup
              </p>
            </div>
          </Card>

          {/* Info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Need</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Valid government-issued ID</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Bank account details for payouts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                <span>Personal or business information</span>
              </li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatusItem({ label, completed, description }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      {completed ? (
        <CheckCircleIcon className="w-6 h-6 text-green-500" />
      ) : (
        <XCircleIcon className="w-6 h-6 text-gray-400" />
      )}
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function BenefitItem({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
