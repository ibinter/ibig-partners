"use client";

import dynamic from "next/dynamic";

const OnboardingTour = dynamic(() => import("./onboarding-tour"), { ssr: false });

export default function OnboardingTourWrapper({ isNewUser }: { isNewUser: boolean }) {
  return <OnboardingTour isNewUser={isNewUser} />;
}
