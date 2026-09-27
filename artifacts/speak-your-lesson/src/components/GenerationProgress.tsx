import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  Check,
  MessageSquareQuote,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

type GenerationProgressMode = "lesson" | "support";

interface GenerationProgressProps {
  mode?: GenerationProgressMode;
}

interface ProgressStage {
  label: string;
  detail: string;
  icon: LucideIcon;
}

const progressContent: Record<
  GenerationProgressMode,
  { title: string; description: string; stages: ProgressStage[] }
> = {
  lesson: {
    title: "Turning your lesson moment into a useful next step",
    description:
      "Scaffold is keeping the learning goal and student task in view while it prepares something you can review and adapt.",
    stages: [
      {
        label: "Find the teaching point",
        detail: "Keeping your learning goal in view.",
        icon: Target,
      },
      {
        label: "Match support to the task",
        detail: "Connecting the language move to what students need to do.",
        icon: BookOpenCheck,
      },
      {
        label: "Make it ready to try",
        detail: "Preparing a teacher move and student-facing language support.",
        icon: MessageSquareQuote,
      },
    ],
  },
  support: {
    title: "Turning the classroom moment into a quick support",
    description:
      "Scaffold is keeping the student task in view while it prepares a small support you can review and use right away.",
    stages: [
      {
        label: "Read the moment",
        detail: "Looking for the teaching point and language barrier.",
        icon: MessageSquareQuote,
      },
      {
        label: "Match support to the task",
        detail: "Connecting the language move to what students need to do.",
        icon: BookOpenCheck,
      },
      {
        label: "Prepare a move to try",
        detail: "Making the support practical, visible, and easy to adapt.",
        icon: Sparkles,
      },
    ],
  },
};

export function GenerationProgress({ mode = "lesson" }: GenerationProgressProps) {
  const content = progressContent[mode];
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStage((current) =>
        Math.min(current + 1, content.stages.length - 1),
      );
    }, 2200);

    return () => window.clearInterval(timer);
  }, [content.stages.length]);

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[var(--brand-blue)]/25 bg-card text-center shadow-[0_16px_40px_rgba(30,27,75,0.06)] animate-in fade-in duration-300"
      aria-labelledby="generation-progress-heading"
      aria-busy="true"
      aria-live="polite"
      data-testid="generation-progress"
    >
      <div className="relative h-1 w-full overflow-hidden bg-gradient-to-r from-[var(--brand-teal)]/30 via-[var(--brand-blue)]/30 to-[var(--brand-purple)]/30">
        <span className="scaffold-progress-sheen absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-white/90 to-transparent" />
      </div>
      <div className="px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-xl">
          <div className="flex items-center gap-3 text-left sm:justify-center">
            <div className="scaffold-progress-float relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-teal)]/20 via-[var(--brand-blue)]/20 to-[var(--brand-purple)]/20 text-[var(--brand-purple-strong)]">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="generation-progress-heading"
                className="font-semibold text-foreground"
              >
                {content.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {content.description}
              </p>
            </div>
          </div>

          <div className="relative mt-8" aria-hidden="true">
            <div className="absolute left-[16.666%] right-[16.666%] top-6 h-px bg-border" />
            <div
              className="absolute left-[16.666%] top-6 h-px bg-[var(--brand-teal-strong)] transition-[width] duration-700"
              style={{
                width: `${(activeStage / (content.stages.length - 1)) * 66.668}%`,
              }}
            />
            <div className="relative grid grid-cols-3 gap-2">
              {content.stages.map((stage, index) => {
                const StageIcon = stage.icon;
                const isComplete = index < activeStage;
                const isActive = index === activeStage;

                return (
                  <div key={stage.label} className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-500 ${
                        isActive
                          ? "scaffold-progress-float border-[var(--brand-blue-strong)] bg-[var(--brand-blue-strong)] text-white shadow-[0_8px_20px_rgba(77,96,202,0.24)]"
                          : isComplete
                            ? "border-[var(--brand-teal-strong)]/30 bg-[var(--brand-teal)]/20 text-[var(--brand-teal-strong)]"
                            : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {isComplete ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StageIcon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`max-w-[9rem] text-[11px] font-medium leading-snug sm:text-xs ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-7 rounded-xl border border-border/70 bg-background/60 px-3.5 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{content.stages[activeStage].detail}</span>
            <span className="ml-1">Your notes stay here while this runs.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
