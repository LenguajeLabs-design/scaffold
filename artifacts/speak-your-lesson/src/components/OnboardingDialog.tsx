import {
  BookCheck,
  CheckCircle2,
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
    label: "You bring",
    description:
      "Add the grade, WIDA band, goal, task, and any rough notes you already have.",
  },
  {
    icon: WandSparkles,
    title: "See the language demands",
    label: "Scaffold helps",
    description:
      "Scaffold drafts objectives, vocabulary, sentence frames, and activities connected to the work.",
  },
  {
    icon: BookCheck,
    title: "Review with your judgment",
    label: "You decide",
    description:
      "Edit anything that does not fit, then save or print a plan you believe in.",
  },
];

function ScaffoldMark() {
  return (
    <span className="scaffold-mark w-5" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

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
      <DialogContent className="bottom-3 left-3 right-3 top-auto w-auto max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-[1.75rem] border-white/85 bg-card p-0 shadow-[0_32px_100px_rgba(15,45,74,0.28)] sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[calc(100%-2rem)] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2">
        <div
          className="h-1.5 bg-gradient-to-r from-[var(--brand-teal)] via-[var(--brand-blue)] to-[var(--brand-sun)]"
          aria-hidden="true"
        />
        <div className="relative overflow-hidden border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(232,247,250,0.54))] px-6 pb-7 pt-7 sm:px-9 sm:pb-8 sm:pt-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-white text-primary shadow-[0_14px_34px_rgba(15,45,74,0.12)] ring-1 ring-[var(--brand-blue)]/15">
                <ScaffoldMark />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-strong)]">
                  Guided lesson planning
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Built for multilingual classrooms
                </p>
              </div>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-semibold text-primary ring-1 ring-primary/10 sm:inline-flex">
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              First visit
            </span>
          </div>
          <DialogHeader className="relative pr-7 text-left">
            <DialogTitle className="max-w-lg text-[1.85rem] font-semibold leading-tight text-[var(--brand-indigo)] sm:text-[2.15rem]">
              Welcome to Scaffold
            </DialogTitle>
            <DialogDescription className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              Scaffold guides you from rough lesson notes to thoughtful language
              supports for multilingual learners.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[58vh] space-y-6 overflow-y-auto px-6 py-6 sm:max-h-none sm:px-9 sm:py-8">
          <div className="rounded-2xl border border-[var(--brand-blue)]/20 bg-[var(--brand-blue)]/[0.045] p-4">
            <p className="text-sm leading-relaxed text-foreground">
              You bring the teaching goal. Scaffold helps make the language work
              visible so students can keep working toward the same meaningful
              learning.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 ring-1 ring-border/60">
                <CheckCircle2
                  className="h-3.5 w-3.5 text-[var(--brand-teal-strong)]"
                  aria-hidden="true"
                />
                Teacher reviewed
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 ring-1 ring-border/60">
                <ShieldCheck
                  className="h-3.5 w-3.5 text-[var(--brand-blue-strong)]"
                  aria-hidden="true"
                />
                Student privacy first
              </span>
            </div>
          </div>

          <ol className="relative space-y-3 before:absolute before:bottom-9 before:left-5 before:top-9 before:w-px before:bg-border sm:before:left-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="relative flex gap-4 rounded-2xl border border-border/70 bg-white/80 p-4 shadow-[0_12px_34px_rgba(15,45,74,0.055)]"
                >
                  <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-strong)]">
                      {step.label}
                    </p>
                    <p className="mt-1 font-semibold text-foreground">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
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
              {isSampleMode ? "You’re using sample plans for now. " : ""}
              Please leave out student names and other identifying information.
              <span className="mt-1 block text-xs text-muted-foreground/80">
                Your notes should describe the lesson, not the student.
              </span>
            </p>
          </div>
        </div>

        <div className="border-t border-border/70 bg-card px-6 py-5 sm:px-9">
          <Button
            type="button"
            className="h-12 w-full text-sm font-semibold shadow-[0_14px_30px_rgba(15,45,74,0.18)]"
            onClick={onStart}
            data-testid="button-start-first-lesson"
          >
            Plan a lesson with Scaffold
          </Button>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
            Start with rough notes. You can edit every suggestion before using
            it.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
