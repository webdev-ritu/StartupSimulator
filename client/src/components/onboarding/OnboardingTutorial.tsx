import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRole } from "@/App";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Confetti } from "./Confetti";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define the tutorial step interface
interface TutorialStep {
  id: string;
  title: string;
  description: string;
  role: UserRole | "both";
  action: string;
  actionTarget: string;
  actionDescription: string;
  reward?: {
    type: "badge" | "points" | "achievement";
    name: string;
    description: string;
    value?: number;
  };
}

// Define the tutorial steps for each user role
const founderSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to StartupSim",
    description: "Learn how to use the platform to build and grow your startup.",
    role: "founder",
    action: "Click Next",
    actionTarget: "next-button",
    actionDescription: "Click the Next button to continue",
  },
  {
    id: "profile",
    title: "Create Your Startup Profile",
    description: "Fill out your startup details to get started.",
    role: "founder",
    action: "Navigate to Profile",
    actionTarget: "/profile",
    actionDescription: "Go to your profile page to set up your startup details",
    reward: {
      type: "badge",
      name: "Profile Pioneer",
      description: "Completed your startup profile",
    },
  },
  {
    id: "pitch-deck",
    title: "Upload Your Pitch Deck",
    description: "Create and upload a pitch deck to share with investors.",
    role: "founder",
    action: "Upload PDF",
    actionTarget: "pitch-deck-upload",
    actionDescription: "Upload a PDF of your pitch deck",
    reward: {
      type: "badge",
      name: "Pitch Perfect",
      description: "Created your first pitch deck",
    },
  },
  {
    id: "funding-round",
    title: "Create a Funding Round",
    description: "Set up your first funding round to attract investors.",
    role: "founder",
    action: "Create Funding Round",
    actionTarget: "create-funding-round",
    actionDescription: "Set up your funding goals and equity offering",
    reward: {
      type: "achievement",
      name: "Fundraising Ready",
      description: "Created your first funding round",
    },
  },
  {
    id: "pitch-room",
    title: "Enter the Pitch Room",
    description: "Practice your pitch and get feedback from investors.",
    role: "founder",
    action: "Go to Pitch Room",
    actionTarget: "/pitch-room",
    actionDescription: "Visit the pitch room to prepare for investor meetings",
    reward: {
      type: "points",
      name: "Pitch Points",
      description: "Earned your first pitch points",
      value: 100,
    },
  },
  {
    id: "completion",
    title: "Congratulations!",
    description: "You've completed the founder onboarding tutorial. You're now ready to start your startup journey!",
    role: "founder",
    action: "Go to Dashboard",
    actionTarget: "/",
    actionDescription: "Return to your dashboard to continue your startup journey",
    reward: {
      type: "achievement",
      name: "Founder Fundamentals",
      description: "Completed the founder onboarding tutorial",
    },
  },
];

const investorSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to StartupSim",
    description: "Learn how to use the platform to discover and invest in promising startups.",
    role: "investor",
    action: "Click Next",
    actionTarget: "next-button",
    actionDescription: "Click the Next button to continue",
  },
  {
    id: "profile",
    title: "Set Up Your Investor Profile",
    description: "Configure your investment preferences and areas of interest.",
    role: "investor",
    action: "Navigate to Profile",
    actionTarget: "/profile",
    actionDescription: "Go to your profile page to set up your investor details",
    reward: {
      type: "badge",
      name: "Investor Ready",
      description: "Completed your investor profile",
    },
  },
  {
    id: "browse-startups",
    title: "Browse Startups",
    description: "Discover startups that match your investment criteria.",
    role: "investor",
    action: "Go to Startups",
    actionTarget: "/startups",
    actionDescription: "Browse the startups page to find investment opportunities",
    reward: {
      type: "points",
      name: "Discovery Points",
      description: "Started exploring startup opportunities",
      value: 50,
    },
  },
  {
    id: "bookmark",
    title: "Bookmark Interesting Startups",
    description: "Save startups that you're interested in for later review.",
    role: "investor",
    action: "Bookmark a Startup",
    actionTarget: "bookmark-button",
    actionDescription: "Click the bookmark icon on a startup card",
    reward: {
      type: "badge",
      name: "Startup Scout",
      description: "Bookmarked your first startup",
    },
  },
  {
    id: "pitch-room",
    title: "Join a Pitch Session",
    description: "Attend virtual pitch sessions to evaluate startups.",
    role: "investor",
    action: "Go to Pitch Room",
    actionTarget: "/pitch-room",
    actionDescription: "Visit the pitch room to join startup presentations",
    reward: {
      type: "points",
      name: "Evaluation Points",
      description: "Attended your first pitch session",
      value: 100,
    },
  },
  {
    id: "completion",
    title: "Congratulations!",
    description: "You've completed the investor onboarding tutorial. You're now ready to start your investment journey!",
    role: "investor",
    action: "Go to Dashboard",
    actionTarget: "/",
    actionDescription: "Return to your dashboard to continue your investment journey",
    reward: {
      type: "achievement",
      name: "Investor Initiation",
      description: "Completed the investor onboarding tutorial",
    },
  },
];

interface OnboardingTutorialProps {
  userRole: UserRole;
  onComplete: () => void;
}

export default function OnboardingTutorial({ userRole, onComplete }: OnboardingTutorialProps) {
  const [, setLocation] = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [earnedReward, setEarnedReward] = useState<TutorialStep["reward"] | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [progressVisible, setProgressVisible] = useState(true);

  // Select the appropriate steps based on user role
  const steps = userRole === "founder" ? founderSteps : investorSteps;
  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex) / (steps.length - 1)) * 100;
  
  // Handle next step action
  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      // Check if current step has a reward
      const reward = currentStep.reward;
      if (reward) {
        setEarnedReward(reward);
        setShowRewardDialog(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        moveToNextStep();
      }
    } else {
      // Tutorial completed
      onComplete();
    }
  };
  
  // Move to next step after reward dialog is closed
  const moveToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Tutorial completed
      onComplete();
    }
  };
  
  // Handle action button click
  const handleActionClick = () => {
    if (currentStep.actionTarget.startsWith("/")) {
      // It's a navigation action
      navigate(currentStep.actionTarget);
    } else if (currentStep.actionTarget === "next-button") {
      // It's a next button action
      handleNextStep();
    } else {
      // It's some other action, for demo purposes we'll just proceed
      handleNextStep();
    }
  };
  
  // Close the reward dialog and proceed
  const handleRewardDialogClose = () => {
    setShowRewardDialog(false);
    setEarnedReward(null);
    moveToNextStep();
  };
  
  return (
    <>
      {showConfetti && <Confetti />}
      
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold">{currentStep.title}</CardTitle>
              {progressVisible && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8"
                  onClick={() => onComplete()}
                >
                  Skip Tutorial
                </Button>
              )}
            </div>
            <CardDescription>{currentStep.description}</CardDescription>
            {progressVisible && (
              <div className="mt-2">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Next Action:</h4>
              <p className="text-sm text-muted-foreground mb-4">{currentStep.actionDescription}</p>
              
              <Button 
                className="w-full" 
                onClick={handleActionClick}
              >
                {currentStep.action}
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2">
                {userRole === "founder" ? "Founder Journey" : "Investor Journey"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
            
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
              >
                Back
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* Reward Dialog */}
      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {earnedReward?.type === "badge" && "🏆 New Badge Earned!"}
              {earnedReward?.type === "points" && "🎯 Points Earned!"}
              {earnedReward?.type === "achievement" && "🌟 Achievement Unlocked!"}
            </DialogTitle>
            <DialogDescription className="text-center">
              You've earned a reward for your progress!
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              {earnedReward?.type === "badge" && <span className="text-4xl">🏆</span>}
              {earnedReward?.type === "points" && <span className="text-4xl">🎯</span>}
              {earnedReward?.type === "achievement" && <span className="text-4xl">🌟</span>}
            </div>
            
            <h3 className="font-bold text-lg mb-2">{earnedReward?.name}</h3>
            <p className="text-center text-muted-foreground mb-2">{earnedReward?.description}</p>
            
            {earnedReward?.type === "points" && earnedReward.value && (
              <span className="text-2xl font-bold text-primary">+{earnedReward.value} pts</span>
            )}
          </div>
          
          <DialogFooter>
            <Button className="w-full" onClick={handleRewardDialogClose}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}