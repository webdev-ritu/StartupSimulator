import { useState, useEffect } from "react";
import OnboardingTutorial from "./OnboardingTutorial";
import { UserRole } from "@/App";

interface OnboardingControllerProps {
  userRole: UserRole;
}

export default function OnboardingController({ userRole }: OnboardingControllerProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    // Check local storage to see if the user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(`${userRole}_onboarding_completed`);
    
    if (!hasCompletedOnboarding) {
      // Show onboarding after a short delay to let the app load
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [userRole]);
  
  const handleOnboardingComplete = () => {
    // Mark onboarding as completed in local storage
    localStorage.setItem(`${userRole}_onboarding_completed`, "true");
    setShowOnboarding(false);
  };
  
  // Force show onboarding (for testing/resetting)
  const resetOnboarding = () => {
    localStorage.removeItem(`${userRole}_onboarding_completed`);
    setShowOnboarding(true);
  };
  
  if (!showOnboarding) {
    return null;
  }
  
  return (
    <OnboardingTutorial 
      userRole={userRole} 
      onComplete={handleOnboardingComplete} 
    />
  );
}