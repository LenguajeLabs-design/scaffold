import {
  BookCheck,
  ClipboardPenLine,
  HelpCircle,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ONBOARDING_STORAGE_KEY = "scaffold-onboarding-seen-v1";

const steps = [
  {
    icon: ClipboardPenLine,
    title: "Start with the lesson",
    description:
      "Add the grade, WIDA band, goal, task, and any rough notes you already have.",
  },
  {
    icon: WandSparkles,
    title: "See the language demands",
    description:
      "Scaffold drafts objectives, vocabulary, sentence frames, and activities connected to the work.",
  },
  {
    icon: BookCheck,
    title: "Review with your judgment",
    description:
      "Edit anything that does not fit, then save or print a plan you believe in.",
  },
];

interface OnboardingDialogProps {
  isSampleMode: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: () => void;
}

export function useFirstVisitOnboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(ONBOARDING_STORAGE_KEY) !== "true") {
        setOpen(true);
      }
    } catch {
      // If storage is unavailable, keep onboarding manually accessible.
    }
  }, []);

  function setOnboardingOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
      } catch {
        // Closing the dialog should still work when storage is unavailable.
      }
    }
  }

  return { open, setOnboardingOpen };
}

export function OnboardingDialog({
  isSampleMode,
  open,
  onOpenChange,
  onStart,
}: OnboardingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bottom-3 left-3 right-3 top-auto w-auto max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-3xl border-border/80 bg-card p-0 shadow-[0_28px_90px_rgba(20,38,82,0.22)] sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[calc(100%-2rem)] sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2">
        <div className="relative overflow-hidden border-b border-border/70 bg-primary/[0.035] px-6 pb-6 pt-7 sm:px-8 sm:pb-7 sm:pt-8">
          <div className="relative mb-5 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary ring-1 ring-primary/10">
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="rounded-full bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/60 ring-1 ring-primary/10">
              A guided introduction
            </span>
          </div>
          <DialogHeader className="relative pr-7 text-left">
            <DialogTitle className="text-[1.7rem] leading-tight tracking-[-0.02em]">
              Welcome to Scaffold
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-md text-sm leading-relaxed sm:text-base">
              Scaffold guides you from rough lesson notes to thoughtful language
              supports for multilingual learners.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[58vh] space-y-6 overflow-y-auto px-6 py-6 sm:max-h-none sm:px-8 sm:py-7">
          <p className="text-sm leading-relaxed text-muted-foreground">
            You bring the teaching goal. Scaffold helps make the language work
            visible so students can keep working toward the same meaningful
            learning.
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 flex-1 rounded-full bg-primary" />
            <span className="h-1.5 flex-1 rounded-full bg-primary/20" />
            <span className="h-1.5 flex-1 rounded-full bg-primary/20" />
            <span className="ml-1">Three guided steps</span>
          </div>
          <ol className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-2xl p-2 -mx-2 transition-colors first:bg-primary/[0.035]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.07] text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="pt-0.5">
                    <p className="font-semibold tracking-[-0.01em] text-foreground">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="flex gap-3 rounded-2xl border border-[var(--brand-blue)]/20 bg-[var(--brand-blue)]/[0.045] p-4">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isSampleMode ? "You’re using sample plans for now. " : ""}
              Please leave out student names and other identifying information.
              <span className="mt-1 block text-xs text-muted-foreground/80">
                Your notes should describe the lesson, not the student.
              </span>
            </p>
          </div>
        </div>

        <div className="border-t border-border/70 bg-card px-6 py-5 sm:px-8">
          <Button
            type="button"
            className="w-full"
            onClick={onStart}
            data-testid="button-start-first-lesson"
          >
            Plan a lesson with Scaffold
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
