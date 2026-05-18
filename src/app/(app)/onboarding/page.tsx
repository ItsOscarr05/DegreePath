import { redirect } from "next/navigation";

import { OnboardingForm } from "./onboarding-form";
import { SUPPORTED_CATALOGS } from "@/lib/degrees";
import { getProfile } from "@/lib/profile";

export default async function OnboardingPage() {
  const profile = await getProfile();
  if (profile) {
    redirect("/dashboard");
  }
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Let&apos;s set your bearings
        </h1>
        <p className="text-muted-foreground">
          Tell us where you&apos;re studying. We&apos;ll generate a roadmap from there.
        </p>
      </header>
      <OnboardingForm catalogs={SUPPORTED_CATALOGS} />
    </div>
  );
}
