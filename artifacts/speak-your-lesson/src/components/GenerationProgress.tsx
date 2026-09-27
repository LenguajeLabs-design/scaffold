import { useEffect, useState } from "react";

type GenerationProgressMode = "lesson" | "support";

interface GenerationProgressProps {
  mode?: GenerationProgressMode;
}

interface ProgressStage {
  label: string;
  detail: string;
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
        detail: "Starting with the learning goal.",
      },
      {
        label: "Match support to the task",
        detail: "Connecting the language move to what students need to do.",
      },
      {
        label: "Make it ready to try",
        detail: "Preparing a teacher move and student-facing language support.",
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
      },
      {
        label: "Match support to the task",
        detail: "Connecting the language move to what students need to do.",
      },
      {
        label: "Prepare a move to try",
        detail: "Making the support practical, visible, and easy to adapt.",
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
          <div className="text-center">
            <div className="scaffold-assembly-frame mx-auto" aria-hidden="true">
              <div className="scaffold-assembly-mark">
                {["purple", "green", "yellow"].map((color, index) => (
                  <span
                    key={color}
                    className={`scaffold-assembly-bar scaffold-assembly-bar-${color} ${
                      index <= activeStage ? "is-visible" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
            <h2
              id="generation-progress-heading"
              className="mt-5 font-semibold text-foreground"
            >
              {content.title}
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
              {content.description}
            </p>
          </div>

          <div className="mt-7 flex items-start justify-center gap-5 sm:gap-10" aria-hidden="true">
            {content.stages.map((stage, index) => (
              <div
                key={stage.label}
                className={`max-w-[8rem] text-[11px] leading-snug transition-colors duration-500 sm:text-xs ${
                  index === activeStage
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <span
                  className={`mx-auto mb-2 block h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                    index <= activeStage
                      ? index === 0
                        ? "bg-[var(--brand-blue-strong)]"
                        : index === 1
                          ? "bg-[var(--brand-teal-strong)]"
                          : "bg-amber-500"
                      : "bg-border"
                  }`}
                />
                {stage.label}
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-xl border border-border/70 bg-background/60 px-3.5 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {content.stages[activeStage].detail}
            </span>
            <span className="ml-1">Your notes stay here while this runs.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
