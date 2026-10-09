import {
  ArrowRight,
  Check,
  ClipboardPaste,
  Eye,
  FileText,
  Languages,
  PencilLine,
  Route,
  ScanText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DEMO_CLASSROOM_PROBLEM,
  DEMO_LESSON_PLAN,
} from "@/data/demo-lesson";

function ScaffoldMark({ className = "" }: { className?: string }) {
  return (
    <span className={`scaffold-mark ${className}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

interface LandingPreviewProps {
  onExploreSample: () => void;
  onStartPlanning: () => void;
  onStartFromMaterials: () => void;
}

const workflow = [
  {
    number: "01",
    eyebrow: "You notice",
    title: "Start with the classroom moment",
    description:
      "Describe what students are doing, what the lesson asks of them, and the barrier you can actually observe. Rough notes are enough.",
    accent: "var(--brand-blue)",
    icon: PencilLine,
  },
  {
    number: "02",
    eyebrow: "Scaffold suggests",
    title: "Try one useful move",
    description:
      "Get a concise teacher move, student-facing language support, and a reason it fits—ready to review and adapt, never presented as a prescription.",
    accent: "var(--brand-teal)",
    icon: Languages,
  },
  {
    number: "03",
    eyebrow: "You decide",
    title: "Watch the evidence and adjust",
    description:
      "See what would justify fading, changing, or increasing support so the lesson stays rigorous and students keep the meaning-making.",
    accent: "var(--brand-sun)",
    icon: Eye,
  },
];

const outputSections = [
  {
    label: "Why this support",
    body: "Students can retell the event, but the explanation breaks between a character action and what that action reveals.",
  },
  {
    label: "Try this",
    body: "Have students point to one action and rehearse: “This action reveals ___ because the text says ___.”",
  },
  {
    label: "Students still own",
    body: "The action they choose, the interpretation they make, and the evidence they use.",
  },
  {
    label: "What to watch for",
    body: "Fade the full frame when students independently connect an action, interpretation, and relevant detail during partner talk.",
  },
];

export default function LandingPreview({
  onExploreSample,
  onStartPlanning,
  onStartFromMaterials,
}: LandingPreviewProps) {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[var(--brand-indigo)]">
      <header className="sticky top-0 z-50 border-b border-[var(--brand-indigo)]/8 bg-[#fbfaf7]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.75rem] w-full max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a
            href="#top"
            className="flex min-h-11 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Scaffold, return to top"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,45,74,0.10)] ring-1 ring-[var(--brand-blue)]/15">
              <ScaffoldMark className="w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Scaffold</span>
          </a>

          <nav
            className="hidden items-center gap-7 text-sm font-medium text-[var(--brand-indigo)]/70 md:flex"
            aria-label="Landing page navigation"
          >
            <a className="transition-colors hover:text-[var(--brand-indigo)]" href="#how-it-works">
              How it works
            </a>
            <a className="transition-colors hover:text-[var(--brand-indigo)]" href="#bring-materials">
              Bring materials
            </a>
            <a className="transition-colors hover:text-[var(--brand-indigo)]" href="#example">
              Sample support
            </a>
            <a className="transition-colors hover:text-[var(--brand-indigo)]" href="#methodology">
              Methodology
            </a>
          </nav>

          <Button
            type="button"
            onClick={onExploreSample}
            className="min-h-11 rounded-xl px-4 text-sm font-semibold shadow-[0_10px_26px_rgba(15,45,74,0.14)] sm:px-5"
          >
            <span className="hidden sm:inline">Explore a sample</span>
            <span className="sm:hidden">Sample</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden border-b border-[var(--brand-indigo)]/8">
          <div className="landing-dot-field absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto grid min-h-[calc(100vh-4.75rem)] w-full max-w-[90rem] items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,0.88fr)_minmax(34rem,1.12fr)] lg:px-12 lg:py-16">
            <div className="max-w-2xl">
              <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-teal-strong)]">
                <span className="h-px w-8 bg-[var(--brand-teal-strong)]/55" aria-hidden="true" />
                Planning support for multilingual classrooms
              </p>
              <h1 className="text-[clamp(3.2rem,6.5vw,6.9rem)] font-semibold leading-[0.91] tracking-[-0.07em] text-[var(--brand-indigo)]">
                Start with the moment.
                <span className="mt-2 block text-[var(--brand-blue-strong)]">
                  Build only what helps.
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Turn rough lesson notes and observable classroom evidence into
                language support you can review, adapt, and gradually remove.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  onClick={onExploreSample}
                  className="h-14 gap-2 rounded-xl px-7 text-base font-semibold shadow-[0_16px_34px_rgba(15,45,74,0.18)]"
                >
                  Explore a sample plan
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <a
                  href="#how-it-works"
                  className="inline-flex h-14 items-center justify-center rounded-xl border border-[var(--brand-indigo)]/15 bg-white px-7 text-base font-semibold text-[var(--brand-indigo)] shadow-sm transition-colors hover:bg-muted/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  See how it works
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--brand-indigo)]/68">
                {[
                  "Teacher review stays central",
                  "No student names",
                  "Every suggestion is editable",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-teal)]/20 text-[var(--brand-teal-strong)]">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[46rem] lg:mx-0 lg:ml-auto">
              <div className="absolute -left-8 top-16 hidden h-28 w-28 rounded-full border border-[var(--brand-blue)]/25 lg:block" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[2rem] border border-[var(--brand-indigo)]/12 bg-[var(--brand-night)] p-3 shadow-[0_35px_90px_rgba(15,45,74,0.24)] sm:p-5">
                <div className="rounded-[1.45rem] bg-[#f7f6f1] p-4 sm:p-6 lg:p-7">
                  <div className="flex items-center justify-between gap-4 border-b border-[var(--brand-indigo)]/10 pb-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue-strong)]">
                        A classroom moment, made usable
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">Grade 4 reading · General scaffold example</p>
                    </div>
                    <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm ring-1 ring-border/70 sm:inline-flex">
                      Reviewable draft
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,0.82fr)_3rem_minmax(0,1.18fr)] sm:items-stretch">
                    <div className="rounded-2xl border border-[var(--brand-blue)]/18 bg-white p-4 shadow-[0_12px_30px_rgba(15,45,74,0.06)]">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--brand-blue-strong)]">
                        <PencilLine className="h-4 w-4" aria-hidden="true" />
                        Teacher note
                      </div>
                      <p className="mt-4 text-sm leading-6 text-[var(--brand-indigo)]/82">
                        “{DEMO_CLASSROOM_PROBLEM}”
                      </p>
                    </div>

                    <div className="support-trace hidden flex-col items-center justify-center gap-2 sm:flex" aria-hidden="true">
                      <span className="support-trace-dot" />
                      <ArrowRight className="h-5 w-5 text-[var(--brand-teal)]" />
                    </div>

                    <div className="rounded-2xl border border-[var(--brand-teal)]/30 bg-white p-4 shadow-[0_16px_36px_rgba(15,45,74,0.08)] sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--brand-teal-strong)]">
                          <Route className="h-4 w-4" aria-hidden="true" />
                          Try this first
                        </div>
                        <span className="rounded-full bg-[var(--brand-teal)]/15 px-2.5 py-1 text-[10px] font-semibold text-[var(--brand-teal-strong)]">
                          Smallest useful move
                        </span>
                      </div>
                      <p className="mt-4 text-sm font-medium leading-6 text-[var(--brand-indigo)]">
                        {DEMO_LESSON_PLAN.scaffoldPlan}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[var(--brand-sun)]/18 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#8a6308]">
                        Students still own
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--brand-indigo)]/80">
                        The action, interpretation, and evidence they choose.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[var(--brand-blue)]/10 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--brand-blue-strong)]">
                        Fade when
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--brand-indigo)]/80">
                        Students connect all three independently during partner talk.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto max-w-[90rem]">
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-blue-strong)]">
                  The Scaffold workflow
                </p>
                <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
                  Less configuring. More noticing.
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground lg:justify-self-end lg:text-lg">
                The product begins with evidence from the room, protects the lesson’s intellectual goal, and makes the next instructional decision visible.
              </p>
            </div>

            <ol className="mt-14 divide-y divide-[var(--brand-indigo)]/10 border-y border-[var(--brand-indigo)]/10">
              {workflow.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.number} className="grid gap-5 py-8 sm:grid-cols-[5rem_minmax(0,0.85fr)_minmax(0,1.15fr)] sm:items-center sm:py-10">
                    <span className="text-sm font-semibold tracking-[0.15em] text-[var(--brand-indigo)]/38">
                      N° {step.number}
                    </span>
                    <div className="flex items-center gap-4">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[var(--brand-indigo)] shadow-sm"
                        style={{ backgroundColor: `color-mix(in srgb, ${step.accent} 20%, white)` }}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {step.eyebrow}
                        </p>
                        <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                      {step.description}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section
          id="bring-materials"
          className="scroll-mt-24 border-y border-[var(--brand-indigo)]/8 bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-12"
        >
          <div className="mx-auto max-w-[90rem]">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-purple-strong)]">
                    Bring what you already have
                  </p>
                  <span className="rounded-full bg-[var(--brand-teal)]/18 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-teal-strong)]">
                    Paste text available
                  </span>
                </div>
                <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
                  Start from the lesson—not from scratch.
                </h2>
              </div>
              <div className="max-w-2xl lg:justify-self-end">
                <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                  Upload an existing lesson PDF or paste planning notes. Scaffold would identify the lesson goal, student task, and likely language demands for you to review before it suggests support.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    onClick={onStartFromMaterials}
                    className="h-12 gap-2 rounded-xl px-5 font-semibold"
                  >
                    Try the paste-text workflow
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <span className="text-xs font-medium text-[var(--brand-purple-strong)]">
                    PDF extraction remains a concept.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-12 overflow-hidden rounded-[2rem] border border-[var(--brand-indigo)]/12 bg-[#f7f6f1] p-4 shadow-[0_26px_70px_rgba(15,45,74,0.09)] sm:p-6 lg:p-8">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_3rem_minmax(0,1fr)_3rem_minmax(0,1.1fr)] lg:items-stretch">
                <div className="rounded-[1.4rem] border border-[var(--brand-blue)]/18 bg-white p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-blue-strong)]">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Add lesson materials
                  </div>
                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-[var(--brand-blue)]/35 bg-[var(--brand-blue)]/[0.04] p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-blue)]/12 text-[var(--brand-blue-strong)]">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">Reading lesson.pdf</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">PDF or DOCX · concept only</span>
                    </span>
                  </div>
                  <div className="my-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    <span className="h-px flex-1 bg-border" aria-hidden="true" />
                    or
                    <span className="h-px flex-1 bg-border" aria-hidden="true" />
                  </div>
                  <div className="rounded-2xl border border-[var(--brand-indigo)]/10 bg-background/80 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand-indigo)]">
                      <ClipboardPaste className="h-4 w-4 text-[var(--brand-purple-strong)]" aria-hidden="true" />
                      Paste planning notes
                    </div>
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">
                      “Students will explain what a character’s action reveals and support the idea with evidence…”
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center" aria-hidden="true">
                  <ArrowRight className="h-5 w-5 rotate-90 text-[var(--brand-teal-strong)] lg:rotate-0" />
                </div>

                <div className="rounded-[1.4rem] bg-[var(--brand-night)] p-5 text-white sm:p-6">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-teal)]">
                    <ScanText className="h-4 w-4" aria-hidden="true" />
                    Scaffold identifies
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      ["Lesson goal", "Explain what character actions reveal"],
                      ["Student task", "Make an interpretation and cite evidence"],
                      ["Language demand", "Connect action, interpretation, and evidence"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/48">{label}</p>
                        <p className="mt-1.5 text-sm leading-5 text-white/86">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center" aria-hidden="true">
                  <ArrowRight className="h-5 w-5 rotate-90 text-[var(--brand-teal-strong)] lg:rotate-0" />
                </div>

                <div className="rounded-[1.4rem] border border-[var(--brand-teal)]/28 bg-white p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-teal-strong)]">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Teacher confirms
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">
                    What are students doing now?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    The document supplies lesson context. The teacher still adds observable classroom evidence before Scaffold recommends a support.
                  </p>
                  <div className="mt-5 rounded-2xl bg-[var(--brand-teal)]/10 p-4">
                    <p className="text-xs font-semibold text-[var(--brand-teal-strong)]">Example evidence</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--brand-indigo)]/78">
                      Students can retell the event, but their explanations stop before interpreting what the action reveals.
                    </p>
                  </div>
                  <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-blue-strong)]" aria-hidden="true" />
                    <p>Files would be temporary planning context—not additions to the curriculum library. No student records or identifiable work.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="example" className="scroll-mt-24 bg-[var(--brand-night)] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto grid max-w-[90rem] gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-teal)]">
                Product proof, not a feature list
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
                A useful move should explain itself.
              </h2>
              <p className="mt-6 text-base leading-7 text-white/68 sm:text-lg">
                Teachers see the observed barrier, the suggested action, what remains student-owned, and the evidence that should change the support.
              </p>
              <Button
                type="button"
                onClick={onExploreSample}
                className="mt-8 h-13 gap-2 rounded-xl bg-white px-6 text-[var(--brand-indigo)] hover:bg-white/90"
              >
                Open the complete sample
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="grid overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/6 sm:grid-cols-2">
              {outputSections.map((section, index) => (
                <div
                  key={section.label}
                  className={`p-6 sm:p-8 ${index % 2 === 0 ? "sm:border-r sm:border-white/12" : ""} ${index < 2 ? "border-b border-white/12" : index === 2 ? "border-b border-white/12 sm:border-b-0" : ""}`}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--brand-sun)]">
                    0{index + 1} · {section.label}
                  </span>
                  <p className="mt-4 text-base leading-7 text-white/82">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="methodology" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto max-w-[90rem]">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-teal-strong)]">
                  Designed for professional judgment
                </p>
                <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
                  The teacher makes the decision. Scaffold makes the reasoning visible.
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-[var(--brand-indigo)]/10 bg-white p-6 shadow-[0_18px_48px_rgba(15,45,74,0.06)]">
                  <ShieldCheck className="h-6 w-6 text-[var(--brand-blue-strong)]" aria-hidden="true" />
                  <h3 className="mt-5 text-lg font-semibold">Privacy before detail</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Describe classroom evidence without student names or private student information.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--brand-indigo)]/10 bg-white p-6 shadow-[0_18px_48px_rgba(15,45,74,0.06)]">
                  <Route className="h-6 w-6 text-[#9a710e]" aria-hidden="true" />
                  <h3 className="mt-5 text-lg font-semibold">Support should lead somewhere</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Every recommendation should preserve rigor, identify what students still own, and state the evidence that would cause the support to fade, change, or increase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12">
          <div className="mx-auto max-w-[90rem] overflow-hidden rounded-[2rem] bg-[var(--brand-blue)]/12 px-6 py-12 sm:px-10 sm:py-16 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-16">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-blue-strong)]">
                Start with something real
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Bring one lesson you’re teaching next.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                See a prepared example first, or begin with your own classroom moment.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0 lg:flex-col xl:flex-row">
              <Button
                type="button"
                onClick={onExploreSample}
                className="h-14 gap-2 rounded-xl px-7 text-base font-semibold"
              >
                Explore the sample
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onStartPlanning}
                className="h-14 rounded-xl border-[var(--brand-indigo)]/15 bg-white px-7 text-base font-semibold"
              >
                Start with your lesson
              </Button>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-[var(--brand-indigo)]/8 bg-white/50 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 font-semibold text-[var(--brand-indigo)]">
            <ScaffoldMark className="w-5" />
            Scaffold
          </div>
          <p>Created by Federico Orozco · EAL educator and multilingual learning designer</p>
          <button
            type="button"
            onClick={onStartPlanning}
            className="min-h-11 text-left font-semibold text-[var(--brand-blue-strong)] hover:underline sm:text-right"
          >
            Open the planner
          </button>
        </div>
      </footer>
    </div>
  );
}
