import authClient from "@repo/auth/auth-client";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@repo/ui/command";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

type QuickCommandPaletteProps = {
  callbackURL?: string;
  className?: string;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  return target.isContentEditable;
}

export function QuickCommandPalette({ callbackURL = "/app", className }: QuickCommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const cmdOrCtrlK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;

      if (cmdOrCtrlK) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }

      if (slash && !isEditableTarget(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          "inline-flex h-10 min-w-[10.5rem] items-center gap-2 rounded-xl border border-paper/70 bg-paper px-3 text-left text-sm text-brand shadow-sm",
          "sm:min-w-[13rem] sm:px-4",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Open quick search"
      >
        <SearchIcon className="size-4" />
        <span className="flex-1 truncate font-medium">Quick search...</span>
        <kbd className="hidden rounded border border-brand/30 px-1.5 py-0.5 text-[11px] sm:inline">⌘K</kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Quick search"
        description="Search navigation and actions"
        className="max-w-[calc(100%-1.25rem)] sm:max-w-lg"
      >
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No matching actions.</CommandEmpty>

            <CommandGroup heading="Navigation">
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  void navigate({ to: "/" });
                }}
              >
                Home
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  void navigate({ to: "/login" });
                }}
              >
                Login page
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  void navigate({ to: "/signup" });
                }}
              >
                Sign up page
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  void navigate({ to: "/health" });
                }}
              >
                Health page
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Auth actions">
              <CommandItem
                onSelect={async () => {
                  setOpen(false);
                  await authClient.signIn.social(
                    { provider: "google", callbackURL },
                    {
                      onError: ({ error }) =>
                        toast.error(error.message || "Failed to sign in with Google."),
                    },
                  );
                }}
              >
                Sign in with Google
                <CommandShortcut>↵</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={async () => {
                  setOpen(false);
                  await authClient.signIn.social(
                    { provider: "github", callbackURL },
                    {
                      onError: ({ error }) =>
                        toast.error(error.message || "Failed to sign in with GitHub."),
                    },
                  );
                }}
              >
                Sign in with GitHub
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
