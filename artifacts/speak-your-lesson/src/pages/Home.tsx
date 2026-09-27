import React, { useEffect, useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGenerateLessonPlan,
  GenerateLessonPlanBodyGradeLevel,
  GenerateLessonPlanBodyUnitProfile,
  GenerateLessonPlanBodyLanguageSupportLevel,
  type LessonPlan,
} from "@workspace/api-client-react";
import {
  AlertTriangle,
  ArrowDown,
  Loader2,
  Trash2,
  BookMarked,
  CheckCircle2,
  ChevronDown,
  Download,
  FlaskConical,
  Sparkles,
  BookOpenText,
  Target,
  BookOpenCheck,
  Languages,
  Tags,
  MessageSquareQuote,
  Route,
  StickyNote,
  Layers3,
  TrendingUp,
  ClipboardCheck,
  LibraryBig,
  Copy,
  Check,
  Plus,
  ListTree,
  ChevronRight,
  Pencil,
  MoreHorizontal,
  Files,
  Share2,
  UserRoundPlus,
  Mail,
  type LucideIcon,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSavedLessons, type SavedLesson } from "@/hooks/use-saved-lessons";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import {
  useAccountSession,
  type AccountLesson,
} from "@/components/account-session";
import {
  DEMO_CLASSROOM_PROBLEM,
  DEMO_LEARNING_GOAL,
  DEMO_LESSON_PLAN,
  DEMO_STUDENT_TASK,
} from "@/data/demo-lesson";
import { RichText } from "@/components/RichText";
import { GenerationProgress } from "@/components/GenerationProgress";
import { trackFunnelEvent } from "@/lib/analytics";
import {
  decodeSharedPlan,
  encodeSharedPlan,
} from "@/lib/shared-plan";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MAX_NOTES_CHARS = 2000;
const supportLevelLabels: Record<string, string> = {
  "1": "Intensive language support",
  "2": "High language support",
  "3": "Moderate language support",
  "4": "Targeted language support",
  "5": "Light language support",
  "6": "Independent access",
};

const formSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  gradeLevel: z.nativeEnum(GenerateLessonPlanBodyGradeLevel),
  languageSupportLevel: z.nativeEnum(GenerateLessonPlanBodyLanguageSupportLevel),
  unitProfile: z.nativeEnum(GenerateLessonPlanBodyUnitProfile).optional(),
  notes: z
    .string()
    .min(5, "Planning notes are required")
    .max(
      MAX_NOTES_CHARS,
      `Planning notes must be ${MAX_NOTES_CHARS} characters or fewer`,
    ),
});

function topicFromBrief(brief: string): string {
  const normalized = brief.trim().replace(/\s+/g, " ");
  if (!normalized) return "Lesson support";

  const firstThought = normalized.split(/[.!?]/)[0]?.trim() ?? normalized;
  return firstThought.slice(0, 90) || "Lesson support";
}

function compactLessonText(value: string, maxLength = 180): string {
  const compact = value
    .split(/\n+/)
    .map((line) => line.trim().replace(/^(?:[•*\-]|\d+\.)\s+/, ""))
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength).trimEnd()}…`;
}

interface DisplayedLesson {
  lesson: LessonPlan;
  gradeLevel: string;
  languageSupportLevel: string;
  topic: string;
  unitProfile?: string;
}

interface HomeProps {
  accessCode: string;
  isDemo: boolean;
}

// ---------------------------------------------------------------------------
// Print-only view
// ---------------------------------------------------------------------------
function PrintableLesson({ displayed }: { displayed: DisplayedLesson }) {
  const { lesson, gradeLevel, languageSupportLevel, topic, unitProfile } = displayed;
  const printDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const s: Record<string, React.CSSProperties> = {
    root: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: "11pt",
      color: "#111",
      lineHeight: "1.55",
      maxWidth: "100%",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "10px",
      paddingBottom: "10px",
      borderBottom: "1.5px solid #e2e8f0",
    },
    brand: { display: "flex", alignItems: "center", gap: "7px" },
    brandName: {
      fontWeight: 600,
      fontSize: "12pt",
      color: "#142550",
      letterSpacing: "-0.01em",
    },
    date: { fontSize: "9pt", color: "#64748b" },
    title: {
      fontSize: "17pt",
      fontWeight: 700,
      color: "#111",
      margin: "14px 0 6px",
      lineHeight: "1.25",
    },
    meta: {
      display: "flex",
      gap: "10px",
      fontSize: "9pt",
      color: "#475569",
      marginBottom: "14px",
      flexWrap: "wrap" as const,
    },
    metaPill: {
      background: "#f1f5f9",
      border: "1px solid #e2e8f0",
      borderRadius: "4px",
      padding: "2px 8px",
      fontWeight: 500,
    },
    divider: {
      border: "none",
      borderTop: "1px solid #e2e8f0",
      margin: "0 0 14px",
    },
    sectionLabel: {
      fontSize: "7.5pt",
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.08em",
      color: "#64748b",
      marginBottom: "4px",
    },
    sectionBody: {
      fontSize: "10.5pt",
      color: "#1e293b",
      margin: 0,
      whiteSpace: "pre-wrap" as const,
    },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
    box: {
      border: "1px solid #e2e8f0",
      borderRadius: "6px",
      padding: "10px 12px",
    },
    vocabRow: { display: "flex", flexWrap: "wrap" as const, gap: "6px" },
    vocabPill: {
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: "4px",
      padding: "2px 8px",
      fontSize: "10pt",
      fontWeight: 500,
      color: "#1e40af",
    },
    frameItem: {
      display: "flex",
      gap: "8px",
      alignItems: "flex-start",
      marginBottom: "5px",
    },
    frameNum: {
      minWidth: "18px",
      height: "18px",
      borderRadius: "50%",
      background: "#142550",
      color: "#fff",
      fontSize: "8pt",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginTop: "1px",
    },
    stepBadge: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "18px",
      height: "18px",
      borderRadius: "3px",
      background: "#142550",
      color: "#fff",
      fontSize: "8pt",
      fontWeight: 700,
      marginRight: "6px",
      flexShrink: 0,
    },
    stepTitle: {
      fontWeight: 600,
      fontSize: "10.5pt",
      color: "#111",
      display: "flex",
      alignItems: "center",
      marginBottom: "4px",
    },
  };

  return (
    <div className="hidden print:block" style={s.root}>
      <div style={s.header}>
        <div style={s.brand}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 21 L3 16 L9 16 L9 11 L15 11 L15 6 L21 6"
              stroke="#142550"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 21 L21 21"
              stroke="#142550"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span style={s.brandName}>Scaffold</span>
        </div>
        <span style={s.date}>Generated {printDate}</span>
      </div>
      <h1 style={s.title}>{lesson.title}</h1>
      <div style={s.meta}>
        <span style={s.metaPill}>{gradeLevel}</span>
        <span style={s.metaPill}>Support Level {languageSupportLevel}</span>
        {topic && <span style={s.metaPill}>{topic}</span>}
        {unitProfile && <span style={s.metaPill}>{unitProfile}</span>}
      </div>
      <hr style={s.divider} />
      {lesson.integratedUnitGoal && (
        <div style={{ ...s.box, marginBottom: "12px", background: "#f8fafc" }}>
          <div style={s.sectionLabel}>Integrated Unit Goal</div>
          <p style={s.sectionBody}>{lesson.integratedUnitGoal}</p>
        </div>
      )}
      <div style={{ ...s.grid2, marginBottom: "12px" }}>
        <div style={s.box}>
          <div style={s.sectionLabel}>Content Objective</div>
          <p style={s.sectionBody}>{lesson.contentObjective}</p>
        </div>
        <div style={s.box}>
          <div style={s.sectionLabel}>Language Objective</div>
          <p style={s.sectionBody}>{lesson.languageObjective}</p>
        </div>
      </div>
      {(lesson.languageFunctionObjective ||
        lesson.languageFeatureObjective) && (
        <div style={{ ...s.grid2, marginBottom: "12px" }}>
          <div style={s.box}>
            <div style={s.sectionLabel}>Language Function</div>
            <p style={s.sectionBody}>{lesson.languageFunctionObjective}</p>
          </div>
          <div style={s.box}>
            <div style={s.sectionLabel}>Language Feature</div>
            <p style={s.sectionBody}>{lesson.languageFeatureObjective}</p>
          </div>
        </div>
      )}
      <div style={{ ...s.box, marginBottom: "12px" }}>
        <div style={s.sectionLabel}>Key Vocabulary</div>
        <div style={s.vocabRow}>
          {lesson.keyVocabulary.map((v: string, i: number) => (
            <span key={i} style={s.vocabPill}>
              {v}
            </span>
          ))}
        </div>
      </div>
      <div style={{ ...s.box, marginBottom: "12px", background: "#f8fafc" }}>
        <div style={s.sectionLabel}>Sentence Frames</div>
        {lesson.sentenceFrames.map((frame: string, i: number) => (
          <div key={i} style={s.frameItem}>
            <div style={s.frameNum}>{i + 1}</div>
            <span style={s.sectionBody}>{frame}</span>
          </div>
        ))}
      </div>
      <div style={{ ...s.sectionLabel, marginBottom: "8px" }}>Lesson Flow</div>
      {[
        { step: "1", label: "Warm-Up", content: lesson.warmUp },
        { step: "2", label: "Main Activity", content: lesson.mainActivity },
        {
          step: "3",
          label: "Speaking Activity",
          content: lesson.speakingActivity,
        },
        { step: "4", label: "Exit Ticket", content: lesson.exitTicket },
      ].map(({ step, label, content }) => (
        <div key={step} style={{ ...s.box, marginBottom: "8px" }}>
          <div style={s.stepTitle}>
            <span style={s.stepBadge}>{step}</span>
            {label}
          </div>
          <p style={s.sectionBody}>{content}</p>
        </div>
      ))}
      <div style={{ ...s.box, marginTop: "4px", background: "#f8fafc" }}>
        <div style={s.sectionLabel}>Teacher Notes</div>
        <p style={s.sectionBody}>{lesson.teacherNotes}</p>
      </div>
      {lesson.scaffoldPlan && (
        <div style={{ ...s.box, marginTop: "8px" }}>
          <div style={s.sectionLabel}>Scaffold Plan</div>
          <p style={s.sectionBody}>{lesson.scaffoldPlan}</p>
        </div>
      )}
      {lesson.scaffoldFadingPlan && (
        <div style={{ ...s.box, marginTop: "8px" }}>
          <div style={s.sectionLabel}>Scaffold Fading</div>
          <p style={s.sectionBody}>{lesson.scaffoldFadingPlan}</p>
        </div>
      )}
      {lesson.formativeAssessment && (
        <div style={{ ...s.box, marginTop: "8px" }}>
          <div style={s.sectionLabel}>Formative Assessment</div>
          <p style={s.sectionBody}>{lesson.formativeAssessment}</p>
        </div>
      )}
      {lesson.sourcesUsed?.length > 0 && (
        <div style={{ ...s.box, marginTop: "8px" }}>
          <div style={s.sectionLabel}>Planning Basis</div>
          <p style={s.sectionBody}>
            {`Scaffold instructional guidance at Language Support Level ${languageSupportLevel}${
              unitProfile ? ` and ${unitProfile}` : ""
            }.`}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
function GuidanceDetails({
  icon: Icon,
  title,
  description,
  content,
  tone,
  copied,
  onCopy,
  isEditing,
  onChange,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  content?: string;
  tone: string;
  copied: boolean;
  onCopy: () => void;
  isEditing: boolean;
  onChange: (value: string) => void;
}) {
  if (!content && !isEditing) return null;

  return (
    <details className="scaffold-guidance group border-t border-border/70 first:border-t-0">
      <summary className="flex min-h-20 cursor-pointer list-none items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden sm:px-5">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tone}`}
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            {title}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {description}
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="px-5 pb-5 pl-[4.25rem] text-sm leading-relaxed text-muted-foreground">
        <div className="mb-2 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 min-h-9 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={onCopy}
            aria-label={`Copy ${title}`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[var(--brand-teal-strong)]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        {isEditing ? (
          <Textarea
            value={content}
            onChange={(event) => onChange(event.target.value)}
            aria-label={`Edit ${title}`}
            className="min-h-32 resize-y bg-background text-sm leading-relaxed text-foreground"
          />
        ) : (
          <RichText text={content ?? ""} />
        )}
      </div>
    </details>
  );
}

function formatLessonForCopy(displayed: DisplayedLesson): string {
  const lesson = displayed.lesson;

  return [
    lesson.title,
    `${displayed.gradeLevel} · Support Level ${displayed.languageSupportLevel}`,
    lesson.integratedUnitGoal
      ? `INTEGRATED UNIT GOAL\n${lesson.integratedUnitGoal}`
      : null,
    `CONTENT OBJECTIVE\n${lesson.contentObjective}`,
    `LANGUAGE OBJECTIVE\n${lesson.languageObjective}`,
    lesson.languageFunctionObjective
      ? `LANGUAGE FUNCTION\n${lesson.languageFunctionObjective}`
      : null,
    lesson.languageFeatureObjective
      ? `LANGUAGE FEATURE\n${lesson.languageFeatureObjective}`
      : null,
    `KEY VOCABULARY\n${lesson.keyVocabulary.join(", ")}`,
    `SENTENCE FRAMES\n${lesson.sentenceFrames.map((frame, index) => `${index + 1}. ${frame}`).join("\n")}`,
    `WARM-UP\n${lesson.warmUp}`,
    `MAIN ACTIVITY\n${lesson.mainActivity}`,
    `SPEAKING ACTIVITY\n${lesson.speakingActivity}`,
    `EXIT TICKET\n${lesson.exitTicket}`,
    `TEACHER NOTES\n${lesson.teacherNotes}`,
    lesson.scaffoldPlan ? `SCAFFOLD PLAN\n${lesson.scaffoldPlan}` : null,
    lesson.scaffoldFadingPlan
      ? `FADE TOWARD INDEPENDENCE\n${lesson.scaffoldFadingPlan}`
      : null,
    lesson.formativeAssessment
      ? `FORMATIVE ASSESSMENT\n${lesson.formativeAssessment}`
      : null,
  ]
    .filter((section): section is string => Boolean(section))
    .join("\n\n");
}

function CopyAction({
  copied,
  label,
  onClick,
}: {
  copied: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-9 min-h-9 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
      onClick={onClick}
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-[var(--brand-teal-strong)]" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function ActivationSummary({
  displayed,
  isDemo,
  onUseWithLesson,
}: {
  displayed: DisplayedLesson;
  isDemo: boolean;
  onUseWithLesson: () => void;
}) {
  const { lesson } = displayed;

  return (
    <Card
      className="overflow-hidden border-[var(--brand-blue)]/25 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(232,247,250,0.4))] shadow-[0_18px_48px_rgba(15,45,74,0.07)]"
      data-testid="activation-summary"
    >
      <CardHeader className="border-b border-border/70 px-5 pb-4 pt-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-teal-strong)]">
            {isDemo ? "Sample classroom moment" : "Start here"}
          </p>
          {isDemo && (
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-xs font-medium text-amber-700"
            >
              Sample · no curriculum citation
            </Badge>
          )}
        </div>
        <CardTitle className="mt-2 max-w-3xl text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          The smallest useful support for this classroom moment
        </CardTitle>
        {isDemo && (
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--brand-sun)]/30 bg-[var(--brand-sun)]/10 p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-blue-strong)]">
                Classroom problem
              </p>
              <p className="mt-1.5 leading-relaxed text-foreground">
                {DEMO_CLASSROOM_PROBLEM}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--brand-teal)]/25 bg-[var(--brand-teal)]/10 p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-teal-strong)]">
                Learning goal
              </p>
              <p className="mt-1.5 leading-relaxed text-foreground">
                {DEMO_LEARNING_GOAL}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--brand-blue)]/25 bg-[var(--brand-blue)]/10 p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-blue-strong)]">
                Student task
              </p>
              <p className="mt-1.5 leading-relaxed text-foreground">
                {DEMO_STUDENT_TASK}
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
        <div className="rounded-2xl border border-[var(--brand-blue)]/25 bg-white/75 p-4 sm:col-span-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-blue-strong)]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            The one useful move
          </p>
          <div className="mt-2 text-sm leading-relaxed text-foreground">
            <RichText text={lesson.scaffoldPlan || lesson.warmUp} />
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--brand-teal)]/25 bg-[var(--brand-teal)]/10 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-teal-strong)]">
            <Target className="h-4 w-4" aria-hidden="true" />
            Why this support fits
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            It keeps the learning goal visible while targeting the language
            move students need for the task: {lesson.languageObjective}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--brand-purple)]/25 bg-[var(--brand-purple)]/10 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-purple-strong)]">
            <Route className="h-4 w-4" aria-hidden="true" />
            Try this first
          </p>
          <div className="mt-2 text-sm leading-relaxed text-foreground">
            <RichText text={lesson.warmUp} />
          </div>
        </div>
        {isDemo && (
          <div className="rounded-2xl border border-[var(--brand-purple)]/25 bg-[var(--brand-purple)]/10 p-4 sm:col-span-2">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-purple-strong)]">
              <MessageSquareQuote className="h-4 w-4" aria-hidden="true" />
              Student-facing language support
            </p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-foreground">
              {lesson.sentenceFrames.map((frame) => (
                <li key={frame} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-purple-strong)]" />
                  <span>{frame}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="rounded-2xl border border-[var(--brand-sun)]/35 bg-[var(--brand-sun)]/12 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-blue-strong)]">
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            What to watch for
          </p>
          <div className="mt-2 text-sm leading-relaxed text-foreground">
            <RichText text={lesson.formativeAssessment} />
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--brand-blue)]/25 bg-[var(--brand-blue)]/10 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-blue-strong)]">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            When to fade or change support
          </p>
          <div className="mt-2 text-sm leading-relaxed text-foreground">
            <RichText text={lesson.scaffoldFadingPlan} />
          </div>
        </div>
        {isDemo && (
          <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-white/70 p-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Adapt the wording, frame, or amount of support to fit your own
              lesson. Scaffold does not replace a language specialist or your
              professional judgment.
            </p>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 shrink-0 gap-2 border-[var(--brand-blue)]/30 bg-white font-semibold text-[var(--brand-blue-strong)]"
              onClick={onUseWithLesson}
              data-testid="button-sample-use-with-lesson"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Use with my lesson
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home({ accessCode, isDemo }: HomeProps) {
  const { lessons, save, update, duplicate, remove, mergeRemote } = useSavedLessons();
  const {
    account,
    lessons: accountLessons,
    signIn,
    saveLesson: saveAccountLesson,
    error: accountError,
  } = useAccountSession();
  const rememberedPlan = lessons[0];
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      gradeLevel:
        (rememberedPlan?.gradeLevel as GenerateLessonPlanBodyGradeLevel) ??
        GenerateLessonPlanBodyGradeLevel.Grade_3,
      languageSupportLevel:
        (rememberedPlan?.languageSupportLevel as GenerateLessonPlanBodyLanguageSupportLevel) ??
        GenerateLessonPlanBodyLanguageSupportLevel.NUMBER_1,
      unitProfile:
        (rememberedPlan?.unitProfile as GenerateLessonPlanBodyUnitProfile) ??
        undefined,
      notes: "",
    },
  });

  const notesValue = form.watch("notes");
  const notesLength = notesValue.length;

  const {
    mutate: generateLessonPlan,
    data: result,
    isPending,
    isError,
    error,
  } = useGenerateLessonPlan();
  const [displayed, setDisplayed] = useState<DisplayedLesson | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [renamingLesson, setRenamingLesson] = useState<SavedLesson | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingLesson, setDeletingLesson] = useState<SavedLesson | null>(null);
  const [isSharedPlan, setIsSharedPlan] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showPlanningContext, setShowPlanningContext] = useState(false);
  const [captureMarketing, setCaptureMarketing] = useState(false);
  const [captureNotice, setCaptureNotice] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usefulMoveTrackedRef = useRef(false);
  const adaptationTrackedRef = useRef(false);

  // Cooldown state
  const [cooldownSecs, setCooldownSecs] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (accountLessons.length > 0) mergeRemote(accountLessons as SavedLesson[]);
  }, [accountLessons, mergeRemote]);

  useEffect(() => {
    const encoded = new URL(window.location.href).searchParams.get("share");
    if (!encoded) return;

    let cancelled = false;
    decodeSharedPlan(encoded).then((shared) => {
      if (cancelled) return;
      if (!shared) {
        setShareError(true);
        return;
      }
      setDisplayed(shared);
      setSavedId(null);
      setIsEditing(false);
      setIsSharedPlan(true);
      window.setTimeout(() => {
        document
          .querySelector('[data-testid="section-results"]')
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isDemo || new URL(window.location.href).searchParams.has("share")) {
      return;
    }

    form.reset({
      topic: DEMO_LESSON_PLAN.title,
      gradeLevel: GenerateLessonPlanBodyGradeLevel.Grade_4,
      languageSupportLevel: GenerateLessonPlanBodyLanguageSupportLevel.NUMBER_4,
      unitProfile: undefined,
      notes: DEMO_CLASSROOM_PROBLEM,
    });
    setDisplayed({
      lesson: DEMO_LESSON_PLAN,
      gradeLevel: GenerateLessonPlanBodyGradeLevel.Grade_4,
      languageSupportLevel:
        GenerateLessonPlanBodyLanguageSupportLevel.NUMBER_4,
      topic: DEMO_LESSON_PLAN.title,
      unitProfile: undefined,
    });
    setSavedId(null);
    setIsEditing(false);
    setIsSharedPlan(false);
  }, [isDemo]);

  useEffect(() => {
    try {
      const returnVisitKey = "scaffold-return-visit-v1";
      if (localStorage.getItem(returnVisitKey) === "true") {
        trackFunnelEvent("return_visit", "planner");
      } else {
        localStorage.setItem(returnVisitKey, "true");
      }
    } catch {
      // Analytics must not block planning when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (!displayed || usefulMoveTrackedRef.current) return;
    usefulMoveTrackedRef.current = true;
    trackFunnelEvent("first_useful_move_visible", "planner");
  }, [displayed]);

  function startCooldown(secs: number) {
    setCooldownSecs(secs);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldownSecs((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function clearSharedPlanFromUrl(clearHash = false) {
    const url = new URL(window.location.href);
    url.searchParams.delete("share");
    if (clearHash) url.hash = "";
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }

  function scrollToResults() {
    document
      .querySelector('[data-testid="section-results"]')
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function applyQuickStart(brief: string) {
    form.setValue("notes", brief, { shouldDirty: true, shouldValidate: true });
    form.setValue("topic", topicFromBrief(brief), {
      shouldDirty: true,
      shouldValidate: true,
    });
    window.setTimeout(() => {
      document
        .querySelector<HTMLTextAreaElement>('[data-testid="input-notes"]')
        ?.focus();
    }, 0);
  }

  function buildAccountLesson(): AccountLesson | null {
    if (!displayed || !savedId) return null;
    return {
      id: savedId,
      savedAt: new Date().toISOString(),
      title: displayed.lesson.title,
      gradeLevel: displayed.gradeLevel,
      languageSupportLevel: displayed.languageSupportLevel,
      topic: displayed.topic,
      unitProfile: displayed.unitProfile,
      lesson: displayed.lesson,
    };
  }

  async function handleAccountCredential(credential: string) {
    const accountLesson = buildAccountLesson();
    if (!accountLesson) return;
    setCaptureError(null);
    setCaptureNotice(null);
    try {
      await signIn(credential);
      await saveAccountLesson({
        lesson: accountLesson,
        marketingOptIn: captureMarketing,
      });
      setCaptureNotice("Saved to your account. You can find this lesson on another device after signing in.");
    } catch (caught) {
      setCaptureError(
        caught instanceof Error
          ? caught.message
          : "We couldn’t save this lesson. Please try again.",
      );
    }
  }

  function continueWithoutSaving() {
    setCaptureNotice(
      "You can keep working with this lesson here. In the live version, it would remain available only in this browser.",
    );
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    trackFunnelEvent("planner_started", "planner");
    setIsEditing(false);
    setIsSharedPlan(false);
    setShareError(false);
    clearSharedPlanFromUrl(true);
    if (isDemo) {
      setSavedId(null);
      setDisplayed({
        lesson: DEMO_LESSON_PLAN,
        gradeLevel: GenerateLessonPlanBodyGradeLevel.Grade_4,
        languageSupportLevel:
          GenerateLessonPlanBodyLanguageSupportLevel.NUMBER_4,
        topic: DEMO_LESSON_PLAN.title,
        unitProfile: undefined,
      });
      return;
    }
    setSavedId(null);
    generateLessonPlan({ data: { ...values, accessCode } });
  }

  useEffect(() => {
    if (!result) return;
    const vals = form.getValues() as {
      gradeLevel: string;
      languageSupportLevel: string;
      topic: string;
      notes: string;
      unitProfile?: string;
    };
    const id = save(result, {
      gradeLevel: vals.gradeLevel,
      languageSupportLevel: vals.languageSupportLevel,
      topic: vals.topic,
      unitProfile: vals.unitProfile,
    });
    setSavedId(id);
    trackFunnelEvent("plan_saved", "planner");
    setDisplayed({
      lesson: result,
      gradeLevel: vals.gradeLevel,
      languageSupportLevel: vals.languageSupportLevel,
      topic: vals.topic,
      unitProfile: vals.unitProfile,
    });
    if (account) {
      void saveAccountLesson({
        lesson: {
          id,
          savedAt: new Date().toISOString(),
          title: result.title,
          gradeLevel: vals.gradeLevel,
          languageSupportLevel: vals.languageSupportLevel,
          topic: vals.topic,
          unitProfile: vals.unitProfile,
          lesson: result,
        },
        marketingOptIn: captureMarketing,
      })
        .then(() => {
          setCaptureNotice("Saved to your account. You can find this lesson on another device after signing in.");
        })
        .catch(() => undefined);
    }
    window.setTimeout(() => {
      document
        .querySelector('[data-testid="section-results"]')
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [result]);

  // Parse cooldown from API error
  useEffect(() => {
    if (!error) return;
    const msg: string =
      (error as { data?: { error?: string } })?.data?.error ??
      (error as Error)?.message ??
      "";
    const match = msg.match(/wait (\d+) second/);
    if (match) startCooldown(parseInt(match[1], 10));
  }, [error]);

  function viewSavedLesson(entry: SavedLesson) {
    setIsEditing(false);
    setIsSharedPlan(false);
    setShareError(false);
    clearSharedPlanFromUrl(true);
    setSavedId(entry.id);
    setDisplayed({
      lesson: entry.lesson,
      gradeLevel: entry.gradeLevel,
      languageSupportLevel: entry.languageSupportLevel,
      topic: entry.topic,
      unitProfile: entry.unitProfile,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copySection(section: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      trackFunnelEvent("support_copied", "planner");
      setCopiedSection(section);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedSection(null), 1800);
    } catch {
      setCopiedSection(null);
    }
  }

  async function shareCurrentPlan() {
    if (!displayed) return;
    const encoded = await encodeSharedPlan(displayed);
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("share", encoded);
    url.hash = "";
    setShareUrl(url.toString());
  }

  function saveSharedCopy() {
    if (!displayed) return;
    const id = save(displayed.lesson, {
      gradeLevel: displayed.gradeLevel,
      languageSupportLevel: displayed.languageSupportLevel,
      topic: displayed.topic,
      unitProfile: displayed.unitProfile,
    });
    setSavedId(id);
    trackFunnelEvent("plan_saved", "planner");
    setIsSharedPlan(false);
    clearSharedPlanFromUrl(true);
  }

  function updateLesson(changes: Partial<LessonPlan>) {
    if (!displayed) return;
    const lesson = { ...displayed.lesson, ...changes };
    setDisplayed({ ...displayed, lesson });
    if (savedId) {
      update(savedId, { lesson, title: lesson.title });
    }
  }

  function toggleEditing() {
    if (!isEditing && !adaptationTrackedRef.current) {
      adaptationTrackedRef.current = true;
      trackFunnelEvent("support_adapted", "planner");
    }
    if (isEditing && displayed) {
      updateLesson({
        title: displayed.lesson.title.trim() || "Untitled lesson",
        keyVocabulary: displayed.lesson.keyVocabulary
          .map((item) => item.trim())
          .filter(Boolean),
        sentenceFrames: displayed.lesson.sentenceFrames
          .map((item) => item.trim())
          .filter(Boolean),
      });
    }
    setIsEditing((current) => !current);
  }

  function useSampleWithLesson() {
    trackFunnelEvent("sample_use_with_lesson_clicked", "planner");
    if (!isEditing) toggleEditing();
    window.setTimeout(() => {
      document
        .querySelector('[data-testid="section-results"]')
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function duplicateSavedLesson(entry: SavedLesson) {
    const copy = duplicate(entry);
    viewSavedLesson(copy);
  }

  function beginRename(entry: SavedLesson) {
    setRenamingLesson(entry);
    setRenameValue(entry.lesson.title);
  }

  function confirmRename() {
    if (!renamingLesson) return;
    const title = renameValue.trim();
    if (!title) return;
    const lesson = { ...renamingLesson.lesson, title };
    update(renamingLesson.id, { title, lesson });
    if (savedId === renamingLesson.id && displayed) {
      setDisplayed({ ...displayed, lesson });
    }
    setRenamingLesson(null);
    setRenameValue("");
  }

  function startNewPlan() {
    const current = form.getValues();
    form.reset({
      gradeLevel: current.gradeLevel,
      languageSupportLevel: current.languageSupportLevel,
      unitProfile: current.unitProfile,
      topic: "",
      notes: "",
    });
    setDisplayed(null);
    setSavedId(null);
    setIsEditing(false);
    adaptationTrackedRef.current = false;
    setIsSharedPlan(false);
    setShareError(false);
    clearSharedPlanFromUrl(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => {
      document
        .querySelector<HTMLTextAreaElement>('[data-testid="input-notes"]')
        ?.focus();
    }, 350);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const isGenerating = isPending && !isDemo;
  const canSubmit = !isGenerating && cooldownSecs === 0;

  const apiError = error as {
    data?: { error?: string; code?: string };
  };
  const isScopeRedirect = apiError?.data?.code === "off_topic";
  const rawErrorMsg: string | null = isError
    ? (apiError?.data?.error ??
      (error as Error)?.message ??
      "Failed to generate lesson plan. Please try again.")
    : null;

  const errorMsg = rawErrorMsg
    ? isScopeRedirect
      ? rawErrorMsg
      : /network|fetch|reach|connection/i.test(rawErrorMsg)
      ? "We couldn’t reach the lesson service. Check your connection and try again."
      : "We couldn’t create the lesson plan. Your notes are still here—please try again."
    : null;

  return (
    <div className="bg-background text-foreground">
      {displayed && <PrintableLesson displayed={displayed} />}

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:space-y-12 sm:py-14 print:hidden">
        <section className="max-w-3xl" aria-labelledby="home-heading">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--brand-blue-strong)] shadow-[0_8px_20px_rgba(15,45,74,0.08)] ring-1 ring-[var(--brand-blue)]/15">
              <BookOpenText className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue-strong)]">
                Your planning workspace
              </p>
              <p className="text-sm text-muted-foreground">
                Practical support for multilingual learners
              </p>
            </div>
          </div>
          <h1
            id="home-heading"
            className="max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl"
          >
            What do you need help with today?
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Start with the classroom moment—not a configuration form. Tell
            Scaffold what you’re trying to teach or solve, and it will shape a
            reviewable lesson plan around it.
          </p>
        </section>

        {shareError && (
          <div
            className="flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3.5 text-sm leading-relaxed text-destructive"
            role="alert"
          >
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <p>
              This shared-plan link is incomplete or no longer valid. Ask the
              sender to create a new link.
            </p>
          </div>
        )}

        {isDemo && !isSharedPlan && (
          <div className="flex flex-col gap-4 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3.5 text-sm leading-relaxed text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <FlaskConical
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <p>
                <strong>Sample preview.</strong> A prepared Grade 4 reading
                moment is ready. See the useful move first, then copy, adapt,
                or start your own lesson.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="min-h-10 shrink-0 gap-2 border-amber-300 bg-white/70 font-semibold text-amber-900 hover:bg-white"
              onClick={scrollToResults}
              data-testid="button-sample-see-move"
            >
              See the useful move
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(18rem,0.88fr)]">
          <Card className="order-2 overflow-hidden border-white/90 bg-card/95 shadow-[0_24px_64px_rgba(15,45,74,0.08)] backdrop-blur-sm lg:order-1">
            <div
              className="h-1 bg-gradient-to-r from-[var(--brand-teal)] via-[var(--brand-blue)] to-[var(--brand-sun)]"
              aria-hidden="true"
            />
            <CardContent className="p-5 sm:p-7">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <input type="hidden" {...form.register("topic")} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue-strong)]">
                      Start with the classroom moment
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                      What are you trying to teach or solve?
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      Rough notes are enough. Scaffold will organize the next
                      useful support.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-baseline justify-between gap-2">
                          <FormLabel className="sr-only">
                            Describe what you need help with
                          </FormLabel>
                          <span className="text-xs text-muted-foreground">
                            You can change the plan after it’s created.
                          </span>
                          <span
                            className={`text-xs tabular-nums ${notesLength > MAX_NOTES_CHARS * 0.9 ? "font-medium text-destructive" : "text-muted-foreground"}`}
                          >
                            {notesLength}/{MAX_NOTES_CHARS}
                          </span>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="For example: My Grade 4 students understand the science idea but cannot explain their thinking in writing."
                            className="min-h-[165px] resize-y border-border/80 bg-background/80 text-base leading-relaxed shadow-none focus-visible:ring-[var(--brand-blue)]"
                            data-testid="input-notes"
                            maxLength={MAX_NOTES_CHARS}
                            {...field}
                            onChange={(event) => {
                              field.onChange(event);
                              form.setValue(
                                "topic",
                                topicFromBrief(event.target.value),
                                { shouldDirty: true, shouldValidate: true },
                              );
                            }}
                          />
                        </FormControl>
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            Don’t include student names or private student
                            information.
                          </p>
                          <FormMessage className="text-right" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Quick starts
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        [BookOpenText, "Adapt a lesson", "I need to adapt tomorrow’s lesson for multilingual learners."],
                        [MessageSquareQuote, "Support writing", "My students have ideas but cannot get started with the writing."],
                        [Tags, "Build vocabulary", "Help me teach the key vocabulary before this lesson."],
                        [StickyNote, "Create sentence frames", "Create sentence frames for students to explain their thinking."],
                      ].map(([Icon, label, brief]) => (
                        <button
                          key={label as string}
                          type="button"
                          className="flex min-h-12 items-center gap-2.5 rounded-xl border border-border/80 bg-background/60 px-3 text-left text-sm font-medium text-foreground transition-colors hover:border-[var(--brand-blue)]/40 hover:bg-[var(--brand-blue)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => applyQuickStart(brief as string)}
                        >
                          {React.createElement(Icon as LucideIcon, {
                            className: "h-4 w-4 shrink-0 text-[var(--brand-blue-strong)]",
                            "aria-hidden": true,
                          })}
                          <span>{label as string}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-muted/25">
                    <button
                      type="button"
                      className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      aria-expanded={showPlanningContext}
                      onClick={() => setShowPlanningContext((current) => !current)}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-foreground">
                          Planning context
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {form.watch("gradeLevel")} · Student support reference: Level {form.watch("languageSupportLevel")}
                          {rememberedPlan ? " · remembered from your last plan" : ""}
                        </span>
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${showPlanningContext ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>

                    {showPlanningContext && (
                      <div className="grid gap-4 border-t border-border/70 p-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="gradeLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Grade level
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-grade-level" className="text-sm">
                                    <SelectValue placeholder="Select a grade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {(Object.values(GenerateLessonPlanBodyGradeLevel) as string[]).map((grade) => (
                                    <SelectItem key={grade} value={grade} className="text-sm">
                                      {grade}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="languageSupportLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Student support reference
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-language-support-level" className="text-sm">
                                    <SelectValue placeholder="Select support" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {(Object.entries(GenerateLessonPlanBodyLanguageSupportLevel) as [string, string][]).map(([, value]) => (
                                    <SelectItem key={value} value={value} className="text-sm">
                                      Level {value} · {supportLevelLabels[value]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                An instructional reference, not an assessment or placement.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="unitProfile"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel className="text-sm font-medium">
                                Curriculum focus <span className="font-normal text-muted-foreground">(optional)</span>
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Use the general planner" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={GenerateLessonPlanBodyUnitProfile["Grade_4_Discipline-Based_Writing"]} className="text-sm">
                                    Grade 4 · Discipline-based writing
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-1">
                    {errorMsg && (
                      <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/[0.06] px-3.5 py-3 text-sm text-destructive" role="alert">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                    {cooldownSecs > 0 && !errorMsg && (
                      <div className="rounded-xl border border-[var(--brand-blue)]/30 bg-[var(--brand-blue)]/10 px-3.5 py-3 text-sm text-[var(--brand-blue-strong)]" role="status">
                        You can create another plan in {cooldownSecs} seconds. Your current notes will stay in place.
                      </div>
                    )}
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      data-testid="button-generate"
                      className="min-h-12 w-full text-sm font-semibold shadow-[0_10px_24px_rgba(30,27,75,0.18)]"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Building your support...
                        </>
                      ) : cooldownSecs > 0 ? (
                        `Wait ${cooldownSecs}s`
                      ) : (
                        "Get support"
                      )}
                    </Button>
                    <p className="text-center text-xs leading-relaxed text-muted-foreground">
                      {isDemo
                        ? "Sample mode shows a prepared example without using AI."
                        : "You’ll get a reviewable starting point, not a final prescription."}
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <aside className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-24" aria-label="Your Scaffold workspace">
            {lessons.length > 0 ? (
              <Card className="border-white/90 bg-card/90 shadow-[0_18px_50px_rgba(15,45,74,0.06)]">
                <CardHeader className="px-5 pb-2 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <BookMarked className="h-4 w-4 text-[var(--brand-teal-strong)]" aria-hidden="true" />
                        Continue your work
                      </CardTitle>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Your recent plans are saved in this browser.
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                      {lessons.length} {lessons.length === 1 ? "plan" : "plans"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 px-4 pb-4">
                  {lessons.slice(0, 3).map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      className="group flex min-h-16 w-full items-center gap-3 rounded-xl border border-border/70 bg-background/60 px-3.5 py-3 text-left transition-colors hover:border-[var(--brand-blue)]/35 hover:bg-[var(--brand-blue)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => viewSavedLesson(entry)}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue-strong)]">
                        <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {entry.lesson.title}
                        </span>
                        <span className="mt-1 block truncate text-xs text-muted-foreground">
                          {entry.gradeLevel} · {entry.languageSupportLevel ? `Level ${entry.languageSupportLevel}` : "Support reference not recorded"} · {formatDate(entry.savedAt)}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </button>
                  ))}
                  <p className="px-1 pt-2 text-xs leading-relaxed text-muted-foreground">
                    Open a plan to edit, duplicate, share, or print it.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-white/90 bg-card/75 shadow-[0_18px_50px_rgba(15,45,74,0.04)]">
                <CardHeader className="px-5 pb-2 pt-5">
                  <CardTitle className="text-base font-semibold">A useful place to start</CardTitle>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Describe the lesson or classroom moment in your own words. You can refine the details later.
                  </p>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    {["Your instructional goal", "The language barrier you’re noticing", "What students should be able to do next"].map((item) => (
                      <div key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-teal-strong)]" aria-hidden="true" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <p className="px-1 text-xs leading-relaxed text-muted-foreground">
              Teacher review stays central. Scaffold suggests options you can adapt to your students, curriculum, and professional judgment.
            </p>
          </aside>
        </div>

        {!displayed && !isGenerating && (
          <section
            className="flex items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground"
            aria-labelledby="lesson-preview-heading"
          >
            <h2
              id="lesson-preview-heading"
              className="font-medium text-foreground"
            >
              Start with one classroom moment.
            </h2>
            <p>Your first useful support will appear below.</p>
          </section>
        )}

        {isGenerating && !displayed && (
          <GenerationProgress mode="lesson" />
        )}

        {displayed && (
          <section
            data-testid="section-results"
            className="scroll-mt-28 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div
              className="flex items-start gap-3 rounded-2xl border border-[var(--brand-teal)]/35 bg-[var(--brand-teal)]/10 px-4 py-3.5 text-[var(--brand-teal-strong)]"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold">
                  {isSharedPlan
                    ? "A lesson plan was shared with you"
                    : "Your lesson plan is ready"}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed">
                  {isSharedPlan
                    ? "Review the plan, then save your own copy before making changes."
                    : "Review the supports below, adapt them for your learners, and print when you’re ready."}
                </p>
              </div>
            </div>
            {isDemo && !isSharedPlan && (
              <ActivationSummary
                displayed={displayed}
                isDemo
                onUseWithLesson={useSampleWithLesson}
              />
            )}
            {!isSharedPlan && (
              <div className="flex items-end justify-between gap-4 border-b border-border/70 pb-2 pt-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue-strong)]">
                    {isDemo ? "Full lesson plan" : "Lesson plan"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {isDemo
                      ? "Review the complete sequence after the first useful move."
                      : "Review the complete sequence and adapt the supports for your lesson."}
                  </p>
                </div>
                <BookOpenText className="hidden h-5 w-5 text-muted-foreground sm:block" aria-hidden="true" />
              </div>
            )}
            {!isSharedPlan && (
              <Card
                className="border-[var(--brand-blue)]/20 bg-card shadow-none"
                data-testid="plan-at-a-glance"
              >
                <CardHeader className="px-5 pb-3 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--brand-blue-strong)]">
                    Your plan at a glance
                  </p>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <CardTitle className="text-xl font-semibold text-foreground">
                      {displayed.lesson.title}
                    </CardTitle>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {displayed.gradeLevel}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-medium">
                        Support Level {displayed.languageSupportLevel}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    A quick read before you decide whether to save it.
                  </p>
                </CardHeader>
                <CardContent className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--brand-teal)]/25 bg-[var(--brand-teal)]/10 p-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-teal-strong)]">
                      <Target className="h-4 w-4" aria-hidden="true" />
                      Content objective
                    </p>
                    <p className="text-sm leading-relaxed text-foreground">
                      {compactLessonText(displayed.lesson.contentObjective)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--brand-purple)]/25 bg-[var(--brand-purple)]/10 p-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-purple-strong)]">
                      <Languages className="h-4 w-4" aria-hidden="true" />
                      Language objective
                    </p>
                    <p className="text-sm leading-relaxed text-foreground">
                      {compactLessonText(displayed.lesson.languageObjective)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--brand-blue)]/25 bg-[var(--brand-blue)]/10 p-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-blue-strong)]">
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      First classroom move
                    </p>
                    <p className="text-sm leading-relaxed text-foreground">
                      {compactLessonText(displayed.lesson.warmUp)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--brand-sun)]/30 bg-[var(--brand-sun)]/10 p-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-blue-strong)]">
                      <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                      Quick check
                    </p>
                    <p className="text-sm leading-relaxed text-foreground">
                      {compactLessonText(displayed.lesson.formativeAssessment)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {!isSharedPlan && (
              <Card className="border-[var(--brand-purple)]/25 bg-[var(--brand-purple)]/[0.045] shadow-none">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-purple)]/15 text-[var(--brand-purple-strong)]">
                      <UserRoundPlus className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--brand-purple-strong)]">
                        Save for later
                      </p>
                      <h2 className="mt-1 text-base font-semibold text-foreground">
                        Save this plan for later
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Sign in with Google to access it from another device.
                      </p>
                    </div>
                  </div>

                  {captureNotice ? (
                    <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[var(--brand-teal)]/30 bg-[var(--brand-teal)]/10 px-3.5 py-3 text-sm leading-relaxed text-[var(--brand-teal-strong)]" role="status">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{captureNotice}</span>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      <GoogleSignInButton onCredential={handleAccountCredential} />
                      <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={captureMarketing}
                          onChange={(event) => setCaptureMarketing(event.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-[var(--brand-blue-strong)]"
                        />
                        <span>Send me occasional Scaffold updates and short feedback requests.</span>
                      </label>
                      <button
                        type="button"
                        onClick={continueWithoutSaving}
                        className="min-h-10 text-left text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Continue without saving
                      </button>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Your Google email is used to identify your account. It is
                        not added to lesson prompts or student records.
                      </p>
                      {(captureError || accountError) && (
                        <p className="text-xs leading-relaxed text-destructive" role="alert">
                          {captureError || accountError}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                {isEditing ? (
                  <Input
                    value={displayed.lesson.title}
                    onChange={(event) =>
                      updateLesson({ title: event.target.value })
                    }
                    aria-label="Edit lesson title"
                    className="h-11 max-w-xl bg-card text-lg font-semibold"
                  />
                ) : (
                  <h2 className="text-lg font-semibold text-foreground">
                    {displayed.lesson.title}
                  </h2>
                )}
                <div className="flex flex-wrap gap-2 mt-2 items-center">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {displayed.gradeLevel}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-medium">
                    Student support: Level {displayed.languageSupportLevel}
                  </Badge>
                  {displayed.unitProfile && (
                    <Badge
                      variant="outline"
                      className="text-xs font-medium border-primary/20 bg-primary/5 text-primary"
                    >
                      {displayed.unitProfile}
                    </Badge>
                  )}
                  {isSharedPlan && (
                    <Badge
                      variant="outline"
                      className="border-[var(--brand-blue)]/30 bg-[var(--brand-blue)]/10 text-xs font-medium text-[var(--brand-blue-strong)]"
                    >
                      Shared
                    </Badge>
                  )}
                  {isDemo && !isSharedPlan && (
                    <Badge
                      variant="outline"
                      className="text-xs font-medium text-amber-700 border-amber-200 bg-amber-50"
                    >
                      Sample
                    </Badge>
                  )}
                  {savedId && (
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--brand-teal-strong)] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-teal-strong)]" />
                      {isEditing ? "Saved automatically" : "Saved to library"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                {isSharedPlan && !savedId && (
                  <Button
                    type="button"
                    size="sm"
                    className="min-h-10 flex-1 gap-1.5 font-medium sm:flex-none"
                    onClick={saveSharedCopy}
                  >
                    <UserRoundPlus className="h-3.5 w-3.5" />
                    Save my copy
                  </Button>
                )}
                {(!isSharedPlan || savedId) && (
                  <Button
                    type="button"
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    className="min-h-10 flex-1 gap-1.5 font-medium sm:flex-none"
                    onClick={toggleEditing}
                  >
                    {isEditing ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Pencil className="h-3.5 w-3.5" />
                    )}
                    {isEditing ? "Done" : "Edit"}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-10 flex-1 gap-1.5 font-medium sm:flex-none"
                  onClick={() =>
                    copySection("full-plan", formatLessonForCopy(displayed))
                  }
                >
                  {copiedSection === "full-plan" ? (
                    <Check className="h-3.5 w-3.5 text-[var(--brand-teal-strong)]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedSection === "full-plan" ? "Copied" : "Copy plan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-10 flex-1 gap-1.5 font-medium sm:flex-none"
                  onClick={shareCurrentPlan}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-10 flex-1 gap-1.5 font-medium sm:flex-none"
                  onClick={() => window.print()}
                >
                  <Download className="h-3.5 w-3.5" />
                  Print
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-10 flex-1 gap-1.5 font-medium text-muted-foreground sm:flex-none"
                  onClick={startNewPlan}
                >
                  <Plus className="h-3.5 w-3.5" />
                  New plan
                </Button>
              </div>
            </div>

            {isEditing && (
              <div
                className="flex items-start gap-3 rounded-2xl border border-[var(--brand-purple)]/25 bg-[var(--brand-purple)]/10 px-4 py-3 text-sm text-foreground"
                role="status"
              >
                <Pencil
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-purple-strong)]"
                  aria-hidden="true"
                />
                <p>
                  Edit the plan below. Changes save automatically in this
                  browser.
                </p>
              </div>
            )}

            <nav
              aria-label="Lesson plan sections"
              className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
            >
              <span className="flex shrink-0 items-center px-2 text-xs font-medium text-muted-foreground">
                <ListTree className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Jump to
              </span>
              {[
                ["#plan-overview", "Overview"],
                ["#plan-supports", "Language supports"],
                ["#lesson-flow", "Lesson flow"],
                ["#plan-assessment", "Next steps"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="shrink-0 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {label}
                </a>
              ))}
            </nav>

            {(isEditing || displayed.lesson.integratedUnitGoal) && (
              <Card className="border border-primary/20 bg-primary/[0.035] shadow-none">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Target className="h-4 w-4" aria-hidden="true" />
                    Integrated Unit Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 text-sm leading-relaxed">
                  {isEditing ? (
                    <Textarea
                      value={displayed.lesson.integratedUnitGoal}
                      onChange={(event) =>
                        updateLesson({ integratedUnitGoal: event.target.value })
                      }
                      aria-label="Edit integrated unit goal"
                      className="min-h-24 resize-y bg-background"
                    />
                  ) : (
                    displayed.lesson.integratedUnitGoal
                  )}
                </CardContent>
              </Card>
            )}

            <Card
              id="plan-overview"
              className="lesson-card scroll-mt-24"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-3 px-5 pb-4 pt-5">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <BookOpenCheck
                      className="h-4 w-4 text-[var(--brand-teal-strong)]"
                      aria-hidden="true"
                    />
                    At a glance
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The learning and language goals for this lesson.
                  </p>
                </div>
                <CopyAction
                  copied={copiedSection === "overview"}
                  label="lesson overview"
                  onClick={() =>
                    copySection(
                      "overview",
                      `Content objective\n${displayed.lesson.contentObjective}\n\nLanguage objective\n${displayed.lesson.languageObjective}`,
                    )
                  }
                />
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--brand-teal)]/25 bg-[var(--brand-teal)]/10 p-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-teal-strong)]">
                      <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
                      Content objective
                    </p>
                    {isEditing ? (
                      <Textarea
                        value={displayed.lesson.contentObjective}
                        onChange={(event) =>
                          updateLesson({ contentObjective: event.target.value })
                        }
                        aria-label="Edit content objective"
                        className="min-h-28 resize-y border-[var(--brand-teal)]/30 bg-background/80 text-sm leading-relaxed"
                      />
                    ) : (
                      <p className="text-sm leading-relaxed text-foreground">
                        {displayed.lesson.contentObjective}
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-[var(--brand-purple)]/25 bg-[var(--brand-purple)]/10 p-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-purple-strong)]">
                      <Languages className="h-4 w-4" aria-hidden="true" />
                      Language objective
                    </p>
                    {isEditing ? (
                      <Textarea
                        value={displayed.lesson.languageObjective}
                        onChange={(event) =>
                          updateLesson({ languageObjective: event.target.value })
                        }
                        aria-label="Edit language objective"
                        className="min-h-28 resize-y border-[var(--brand-purple)]/30 bg-background/80 text-sm leading-relaxed"
                      />
                    ) : (
                      <p className="text-sm leading-relaxed text-foreground">
                        {displayed.lesson.languageObjective}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-3 py-1.5">
                    4 lesson stages
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1.5">
                    {displayed.lesson.keyVocabulary.length} vocabulary words
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1.5">
                    {displayed.lesson.sentenceFrames.length} sentence frames
                  </span>
                </div>
              </CardContent>
            </Card>

            {(isEditing ||
              displayed.lesson.languageFunctionObjective ||
              displayed.lesson.languageFeatureObjective) && (
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="lesson-card lesson-card--blue">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Languages
                        className="h-4 w-4 text-[var(--brand-blue-strong)]"
                        aria-hidden="true"
                      />
                      Language Function
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 text-sm leading-relaxed">
                    {isEditing ? (
                      <Textarea
                        value={displayed.lesson.languageFunctionObjective}
                        onChange={(event) =>
                          updateLesson({
                            languageFunctionObjective: event.target.value,
                          })
                        }
                        aria-label="Edit language function"
                        className="min-h-24 resize-y bg-background"
                      />
                    ) : (
                      displayed.lesson.languageFunctionObjective
                    )}
                  </CardContent>
                </Card>
                <Card className="lesson-card lesson-card--purple">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <MessageSquareQuote
                        className="h-4 w-4 text-[var(--brand-purple-strong)]"
                        aria-hidden="true"
                      />
                      Language Feature
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 text-sm leading-relaxed">
                    {isEditing ? (
                      <Textarea
                        value={displayed.lesson.languageFeatureObjective}
                        onChange={(event) =>
                          updateLesson({
                            languageFeatureObjective: event.target.value,
                          })
                        }
                        aria-label="Edit language feature"
                        className="min-h-24 resize-y bg-background"
                      />
                    ) : (
                      displayed.lesson.languageFeatureObjective
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            <Card
              id="plan-supports"
              className="lesson-card lesson-card--blue scroll-mt-24"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-2 pt-4">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Tags
                    className="h-4 w-4 text-[var(--brand-blue-strong)]"
                    aria-hidden="true"
                  />
                  Key Vocabulary
                </CardTitle>
                <CopyAction
                  copied={copiedSection === "vocabulary"}
                  label="key vocabulary"
                  onClick={() =>
                    copySection(
                      "vocabulary",
                      displayed.lesson.keyVocabulary.join(", "),
                    )
                  }
                />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {isEditing ? (
                  <div>
                    <p className="mb-2 text-xs text-muted-foreground">
                      Enter one word or phrase per line.
                    </p>
                    <Textarea
                      value={displayed.lesson.keyVocabulary.join("\n")}
                      onChange={(event) =>
                        updateLesson({
                          keyVocabulary: event.target.value.split("\n"),
                        })
                      }
                      aria-label="Edit key vocabulary"
                      className="min-h-32 resize-y bg-background"
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {displayed.lesson.keyVocabulary.map(
                      (vocab: string, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/8 text-primary text-sm font-medium border border-primary/15"
                        >
                          {vocab}
                        </span>
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[1.35rem] border border-primary/20 bg-[linear-gradient(145deg,hsl(var(--primary)),#282262)] text-primary-foreground shadow-[0_18px_42px_-26px_rgba(30,27,75,0.65)]">
              <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-2 pt-4 [&_button]:text-primary-foreground/75 [&_button:hover]:bg-white/10 [&_button:hover]:text-primary-foreground">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground/60">
                  <MessageSquareQuote className="h-4 w-4" aria-hidden="true" />
                  Sentence Frames
                </CardTitle>
                <CopyAction
                  copied={copiedSection === "sentence-frames"}
                  label="sentence frames"
                  onClick={() =>
                    copySection(
                      "sentence-frames",
                      displayed.lesson.sentenceFrames
                        .map((frame, index) => `${index + 1}. ${frame}`)
                        .join("\n"),
                    )
                  }
                />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {isEditing ? (
                  <div>
                    <p className="mb-2 text-xs text-primary-foreground/65">
                      Enter one sentence frame per line.
                    </p>
                    <Textarea
                      value={displayed.lesson.sentenceFrames.join("\n")}
                      onChange={(event) =>
                        updateLesson({
                          sentenceFrames: event.target.value.split("\n"),
                        })
                      }
                      aria-label="Edit sentence frames"
                      className="min-h-32 resize-y border-white/25 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/50"
                    />
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {displayed.lesson.sentenceFrames.map(
                      (frame: string, i: number) => (
                        <li key={i} className="flex gap-3 items-start text-sm">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-xs font-semibold mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{frame}</span>
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </CardContent>
            </Card>

            <div id="lesson-flow" className="scroll-mt-24 space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Route
                  className="h-4 w-4 text-[var(--brand-teal-strong)]"
                  aria-hidden="true"
                />
                Lesson Flow
              </h3>
              {[
                {
                  step: "1",
                  label: "Warm-Up",
                  field: "warmUp" as const,
                  content: displayed.lesson.warmUp,
                },
                {
                  step: "2",
                  label: "Main Activity",
                  field: "mainActivity" as const,
                  content: displayed.lesson.mainActivity,
                },
                {
                  step: "3",
                  label: "Speaking Activity",
                  field: "speakingActivity" as const,
                  content: displayed.lesson.speakingActivity,
                },
                {
                  step: "4",
                  label: "Exit Ticket",
                  field: "exitTicket" as const,
                  content: displayed.lesson.exitTicket,
                },
              ].map(({ step, label, field, content }) => (
                <Card key={step} className={`lesson-card ${Number(step) % 2 === 0 ? "lesson-card--blue" : ""}`}>
                  <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-2 pt-4">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                        {step}
                      </span>
                      {label}
                    </CardTitle>
                    <CopyAction
                      copied={copiedSection === `lesson-step-${step}`}
                      label={label}
                      onClick={() =>
                        copySection(`lesson-step-${step}`, `${label}\n${content}`)
                      }
                    />
                  </CardHeader>
                  <CardContent className="px-4 pb-4 text-muted-foreground">
                    {isEditing ? (
                      <Textarea
                        value={content}
                        onChange={(event) =>
                          updateLesson({ [field]: event.target.value })
                        }
                        aria-label={`Edit ${label}`}
                        className="min-h-40 resize-y bg-background text-foreground"
                      />
                    ) : (
                      <RichText text={content} />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card
              id="plan-assessment"
              className="lesson-card lesson-card--purple scroll-mt-24 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(167,139,250,0.055))]"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-2 pt-4">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="lesson-icon bg-[var(--brand-purple)]/12 text-[var(--brand-purple-strong)]">
                    <StickyNote className="h-4 w-4" aria-hidden="true" />
                  </span>
                  Teacher Notes
                </CardTitle>
                <CopyAction
                  copied={copiedSection === "teacher-notes"}
                  label="teacher notes"
                  onClick={() =>
                    copySection("teacher-notes", displayed.lesson.teacherNotes)
                  }
                />
              </CardHeader>
              <CardContent className="px-4 pb-4 text-muted-foreground">
                {isEditing ? (
                  <Textarea
                    value={displayed.lesson.teacherNotes}
                    onChange={(event) =>
                      updateLesson({ teacherNotes: event.target.value })
                    }
                    aria-label="Edit teacher notes"
                    className="min-h-40 resize-y bg-background text-foreground"
                  />
                ) : (
                  <RichText text={displayed.lesson.teacherNotes} />
                )}
              </CardContent>
            </Card>

            {(isEditing ||
              displayed.lesson.scaffoldPlan ||
              displayed.lesson.scaffoldFadingPlan ||
              displayed.lesson.formativeAssessment) && (
              <Card className="lesson-card lesson-card--sun">
                <CardHeader className="px-5 pb-4 pt-5">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Layers3
                      className="h-4 w-4 text-[var(--brand-teal-strong)]"
                      aria-hidden="true"
                    />
                    Support, fade, and check
                  </CardTitle>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Open one section when you need it. Each gives you a clear
                    next move.
                  </p>
                </CardHeader>
                <CardContent className="border-t border-border/70 p-0">
                  <GuidanceDetails
                    icon={Layers3}
                    title="Support to use now"
                    description="Practical scaffolds for this lesson"
                    content={displayed.lesson.scaffoldPlan}
                    tone="bg-[var(--brand-teal)]/20 text-[var(--brand-teal-strong)]"
                    copied={copiedSection === "scaffold-plan"}
                    onCopy={() =>
                      copySection(
                        "scaffold-plan",
                        displayed.lesson.scaffoldPlan ?? "",
                      )
                    }
                    isEditing={isEditing}
                    onChange={(value) =>
                      updateLesson({ scaffoldPlan: value })
                    }
                  />
                  <GuidanceDetails
                    icon={TrendingUp}
                    title="Fade toward independence"
                    description="When and how to reduce support"
                    content={displayed.lesson.scaffoldFadingPlan}
                    tone="bg-[var(--brand-purple)]/20 text-[var(--brand-purple-strong)]"
                    copied={copiedSection === "scaffold-fading"}
                    onCopy={() =>
                      copySection(
                        "scaffold-fading",
                        displayed.lesson.scaffoldFadingPlan ?? "",
                      )
                    }
                    isEditing={isEditing}
                    onChange={(value) =>
                      updateLesson({ scaffoldFadingPlan: value })
                    }
                  />
                  <GuidanceDetails
                    icon={ClipboardCheck}
                    title="Check for understanding"
                    description="Evidence to collect while students work"
                    content={displayed.lesson.formativeAssessment}
                    tone="bg-[var(--brand-blue)]/20 text-[var(--brand-blue-strong)]"
                    copied={copiedSection === "formative-assessment"}
                    onCopy={() =>
                      copySection(
                        "formative-assessment",
                        displayed.lesson.formativeAssessment ?? "",
                      )
                    }
                    isEditing={isEditing}
                    onChange={(value) =>
                      updateLesson({ formativeAssessment: value })
                    }
                  />
                </CardContent>
              </Card>
            )}

            {displayed.lesson.sourcesUsed?.length > 0 && (
              <div className="flex items-center gap-2 px-1 text-xs leading-relaxed text-muted-foreground">
                <LibraryBig className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {`Planning basis: Scaffold instructional guidance at Support Level ${displayed.languageSupportLevel}${
                    displayed.unitProfile
                      ? ` and ${displayed.unitProfile}`
                      : ""
                  }.`}
                </span>
              </div>
            )}
            <p className="rounded-xl border border-[var(--brand-sun)]/30 bg-[var(--brand-sun)]/10 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              Teacher review required: Scaffold generates instructional suggestions, not official proficiency determinations or individualized educational recommendations. Adapt this plan to your students, curriculum, school policies, and professional judgment.
            </p>
            {!isSharedPlan && (
              <Card className="border-[var(--brand-teal)]/25 bg-[var(--brand-teal)]/[0.045] shadow-none">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-teal)]/15 text-[var(--brand-teal-strong)]">
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--brand-teal-strong)]">
                        Help shape the next release
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        If you try this with a real class, send one line about
                        what helped or got in the way. Please leave out student
                        names and private student information.
                      </p>
                      <a
                        href="mailto:forozc1@gmail.com?subject=Scaffold%20beta%20feedback&body=What%20I%20tried%3A%20%0A%0AWhat%20helped%3A%20%0A%0AWhat%20got%20in%20the%20way%3A%20"
                        className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-[var(--brand-teal-strong)] px-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Send quick feedback
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {lessons.length > 0 && displayed && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BookMarked className="h-4 w-4 text-muted-foreground" />
                  Saved plans
                  <span className="text-xs font-medium text-muted-foreground">
                    ({lessons.length})
                  </span>
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Stored in this browser
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              {lessons.map((entry) => {
                const isActive = savedId === entry.id;
                return (
                  <div
                    key={entry.id}
                    className={`group flex items-center gap-1 rounded-xl border pr-2 transition-colors ${
                      isActive
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      onClick={() => viewSavedLesson(entry)}
                      aria-label={`Open ${entry.lesson.title}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {entry.lesson.title}
                          </p>
                          {isActive && (
                            <Badge
                              variant="outline"
                              className="shrink-0 border-[var(--brand-teal)]/40 bg-[var(--brand-teal)]/10 text-[10px] text-[var(--brand-teal-strong)]"
                            >
                              Current
                            </Badge>
                          )}
                        </div>
                        {entry.topic && entry.topic !== entry.lesson.title && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            Topic: {entry.topic}
                          </p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{entry.gradeLevel}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {entry.languageSupportLevel
                              ? `Support Level ${entry.languageSupportLevel}`
                              : "Support reference not recorded"}
                          </span>
                          <span aria-hidden="true">·</span>
                          <time dateTime={entry.savedAt}>
                            {formatDate(entry.savedAt)}
                          </time>
                        </div>
                      </div>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`More options for ${entry.lesson.title}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5">
                        <DropdownMenuItem
                          className="min-h-10 rounded-lg"
                          onSelect={() => beginRename(entry)}
                        >
                          <Pencil className="h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="min-h-10 rounded-lg"
                          onSelect={() => duplicateSavedLesson(entry)}
                        >
                          <Files className="h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="min-h-10 rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onSelect={() => setDeletingLesson(entry)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <Dialog
          open={Boolean(shareUrl)}
          onOpenChange={(open) => {
            if (!open) setShareUrl(null);
          }}
        >
          <DialogContent className="w-[calc(100%-2rem)] rounded-2xl border-border/80 bg-card sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2
                  className="h-5 w-5 text-[var(--brand-teal-strong)]"
                  aria-hidden="true"
                />
                Share this plan
              </DialogTitle>
              <DialogDescription className="leading-relaxed">
                This link contains a snapshot of the lesson. Your coworker will
                open it through Scaffold and save an independent copy.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Input
                value={shareUrl ?? ""}
                readOnly
                aria-label="Share link"
                className="h-12 bg-muted/40 text-xs"
                onFocus={(event) => event.currentTarget.select()}
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Anyone with this link can view the snapshot. Don’t include
                student names or private details.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:space-x-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShareUrl(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="gap-2"
                onClick={() => copySection("share-link", shareUrl ?? "")}
              >
                {copiedSection === "share-link" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedSection === "share-link" ? "Link copied" : "Copy link"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(renamingLesson)}
          onOpenChange={(open) => {
            if (!open) {
              setRenamingLesson(null);
              setRenameValue("");
            }
          }}
        >
          <DialogContent className="w-[calc(100%-2rem)] rounded-2xl border-border/80 bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rename plan</DialogTitle>
              <DialogDescription>
                Choose a name that will be easy to find later.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") confirmRename();
              }}
              aria-label="Plan name"
              className="h-12"
              autoFocus
            />
            <DialogFooter className="gap-2 sm:space-x-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRenamingLesson(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmRename}
                disabled={!renameValue.trim()}
              >
                Save name
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={Boolean(deletingLesson)}
          onOpenChange={(open) => {
            if (!open) setDeletingLesson(null);
          }}
        >
          <AlertDialogContent className="w-[calc(100%-2rem)] rounded-2xl border-border/80 bg-card sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this lesson?</AlertDialogTitle>
              <AlertDialogDescription>
                “{deletingLesson?.lesson.title}” will be removed from this
                browser. This can’t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep lesson</AlertDialogCancel>
              <AlertDialogAction
                className="border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (!deletingLesson) return;
                  if (savedId === deletingLesson.id) {
                    setDisplayed(null);
                    setSavedId(null);
                    setIsEditing(false);
                  }
                  remove(deletingLesson.id);
                  setDeletingLesson(null);
                }}
              >
                Delete lesson
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
