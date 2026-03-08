import authClient from "@repo/auth/auth-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type Provider = "google" | "github";

function useSocialSignIn(provider: Provider, callbackURL: string) {
  return useMutation({
    mutationFn: async () =>
      await authClient.signIn.social(
        {
          provider,
          callbackURL,
        },
        {
          onError: ({ error }) => {
            const label = provider === "google" ? "Google" : "GitHub";
            toast.error(error.message || `Failed to sign in with ${label}.`);
          },
        },
      ),
  });
}

const providerButtonClass =
  "inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 text-[14px] font-medium text-surface-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70 sm:gap-3 sm:px-4";

export function GoogleSignInButton({ callbackURL }: { callbackURL: string }) {
  const mutation = useSocialSignIn("google", callbackURL);

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending || mutation.isSuccess}
      className={providerButtonClass}
      aria-label="Sign in with Google"
    >
      <GoogleMark />
      <span>Continue with Google</span>
    </button>
  );
}

export function GitHubSignInButton({ callbackURL }: { callbackURL: string }) {
  const mutation = useSocialSignIn("github", callbackURL);

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending || mutation.isSuccess}
      className={providerButtonClass}
      aria-label="Sign in with GitHub"
    >
      <GitHubMark />
      <span>Continue with GitHub</span>
    </button>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M9 7.364v3.545h4.916c-.218 1.145-.872 2.116-1.854 2.77l2.994 2.324C16.8 14.39 18 11.945 18 9c0-.655-.06-1.285-.17-1.909H9z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.805 5.96-2.19l-2.994-2.323c-.83.557-1.89.886-2.966.886-2.28 0-4.21-1.54-4.9-3.61H1.006v2.37A9 9 0 0 0 9 18z"
      />
      <path
        fill="#4A90E2"
        d="M4.1 10.764A5.4 5.4 0 0 1 3.82 9c0-.612.105-1.207.28-1.764V4.866H1.006A9 9 0 0 0 0 9c0 1.45.347 2.82 1.006 4.134L4.1 10.764z"
      />
      <path
        fill="#FBBC05"
        d="M9 3.58c1.32 0 2.505.455 3.438 1.35l2.58-2.58C13.466.905 11.426 0 9 0a9 9 0 0 0-7.994 4.866L4.1 7.236C4.79 5.12 6.72 3.58 9 3.58z"
      />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12.02c0 5.1 3.3 9.43 7.88 10.96.58.1.8-.25.8-.56 0-.28-.01-1.03-.02-2.02-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.35.96.1-.75.4-1.27.74-1.56-2.56-.3-5.26-1.29-5.26-5.73 0-1.27.46-2.31 1.2-3.13-.12-.3-.52-1.52.12-3.16 0 0 .98-.32 3.2 1.2A11.06 11.06 0 0 1 12 6.1c1 0 2.02.14 2.96.42 2.22-1.52 3.2-1.2 3.2-1.2.64 1.64.24 2.86.12 3.16.75.82 1.2 1.86 1.2 3.13 0 4.45-2.7 5.43-5.28 5.72.41.36.78 1.08.78 2.18 0 1.58-.01 2.85-.01 3.24 0 .31.2.67.8.56A11.53 11.53 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
