import { createFileRoute } from "@tanstack/react-router";

import { LandingAuthCard } from "~/components/landing/landing-auth-card";
import { LandingHero } from "~/components/landing/landing-hero";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="min-h-svh overflow-x-hidden bg-canvas">
      <LandingHero callbackURL="/app" />
      <LandingAuthCard callbackURL="/app" />
    </main>
  );
}
