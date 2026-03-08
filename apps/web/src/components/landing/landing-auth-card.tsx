import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { GitHubSignInButton, GoogleSignInButton } from "./social-signin-buttons";

export function LandingAuthCard({ callbackURL }: { callbackURL: string }) {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  return (
    <section className="-mt-4 min-h-[56vh] rounded-t-[1.25rem] bg-canvas px-4 pb-10 pt-8 text-canvas-foreground sm:-mt-6 sm:px-6 sm:pb-12 sm:pt-10 md:px-10">
      <div className="mx-auto max-w-[560px] space-y-6 sm:space-y-7">
        <div className="space-y-3" style={{ fontFamily: '"Geist", "Inter Variable", sans-serif' }}>
          <h2 className="text-[28px] font-medium leading-[1.05] sm:text-[34px] md:text-[40px]">
            Welcome to social network fully personalized for you.
          </h2>
          <p className="text-[20px] font-light leading-[1.12] text-neutral sm:text-[24px] md:text-[30px]">
            Login or create an account to feel the freedom. Scroll to learn more.
          </p>
        </div>

        <div className="space-y-3">
          <GoogleSignInButton callbackURL={callbackURL} />
          <GitHubSignInButton callbackURL={callbackURL} />
        </div>

        <div className="flex items-center gap-3 text-sm text-neutral">
          <div className="h-px flex-1 bg-neutral/50" />
          <span className="text-[11px] tracking-[0.2em]">OR</span>
          <div className="h-px flex-1 bg-neutral/50" />
        </div>

        <form
          className="flex flex-col items-stretch gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            void navigate({ to: "/signup" });
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address..."
            className="h-11 w-full flex-1 rounded-md border border-neutral/60 bg-canvas px-4 text-base text-canvas-foreground placeholder:text-neutral focus:border-white focus:outline-none"
          />
          <button
            type="submit"
            className="h-11 w-full rounded-md border border-neutral/60 bg-transparent px-4 text-[20px] font-bold text-canvas-foreground transition-colors hover:bg-white/10 sm:w-auto sm:min-w-11"
            aria-label="Continue with email"
          >
            &gt;
          </button>
        </form>
      </div>
    </section>
  );
}
