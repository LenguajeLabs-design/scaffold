import { BookCheck, ClipboardPenLine, HelpCircle, ShieldCheck, WandSparkles } from "lucide-react";
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
    title: "Describe the lesson",
    description:
      "Choose the grade and WIDA band, then add your topic and rough planning notes.",
  },
  {
    icon: WandSparkles,
    title: "Build the scaffold",
    description:
      "Scaffold organizes objectives, vocabulary, sentence frames, and classroom activities.",
  },
  {
    icon: BookCheck,
    title: "Review and reuse",
    description:
      "Adapt the plan for your learners, then save, print, or return to it later.",
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
        <div className="border-b border-border/70 bg-primary/[0.035] px-6 pb-5 pt-7 sm:px-8 sm:pb-6 sm:pt-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-teal)] via-[var(--brand-blue)] to-[var(--brand-purple)] text-[var(--brand-night)] shadow-sm">
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <DialogHeader className="pr-7 text-left">
            <DialogTitle className="text-2xl leading-tight">
              Welcome to Scaffold
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed sm:text-base">
              Turn rough teaching notes into practical language supports for
              multilingual learners.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[58vh] space-y-5 overflow-y-auto px-6 py-6 sm:max-h-none sm:px-8">
          <ol className="space-y-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.07] text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="pt-0.5">
                    <p className="font-semibold text-foreground">
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

          <div className="flex gap-3 rounded-2xl border border-border/70 bg-muted/35 p-4">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isSampleMode
                ? "You’re using sample plans for now. "
                : ""}
              Please don’t include student names or other identifying
              information in your notes.
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
            Plan my first lesson
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
