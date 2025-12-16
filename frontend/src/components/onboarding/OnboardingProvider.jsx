import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import OnboardingModal from './OnboardingModal';
import onboardingService from '../../services/onboardingService';

/**
 * OnboardingProvider - Checks if user needs onboarding and shows modal
 * Wrap your app with this component to enable automatic onboarding
 */
const OnboardingProvider = ({ children }) => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, [isAuthenticated, user]);

  const checkOnboardingStatus = async () => {
    // Only check if user is authenticated
    if (!isAuthenticated || !user) {
      return;
    }

    // Don't check if already checking
    if (checking) {
      return;
    }

    try {
      setChecking(true);
      const status = await onboardingService.checkOnboardingStatus();

      // Show onboarding modal if not completed
      if (!status.completed) {
        // Small delay for better UX (let user see the dashboard first)
        setTimeout(() => {
          setShowOnboarding(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);

    // Refresh user data to get updated preferences
    if (updateUser) {
      try {
        await updateUser();
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    // User can access the onboarding later from their profile
  };

  return (
    <>
      {children}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
};

export default OnboardingProvider;
