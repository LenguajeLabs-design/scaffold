import React, { useEffect, useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGenerateLessonPlan,
  GenerateLessonPlanBodyGradeLevel,
  GenerateLessonPlanBodyUnitProfile,
  GenerateLessonPlanBodyWidaBand,
  type LessonPlan,
} from "@workspace/api-client-react";
import {
  Loader2,
  Trash2,
  BookMarked,
  Download,
  FlaskConical,
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
import { useSavedLessons, type SavedLesson } from "@/hooks/use-saved-lessons";
import { DEMO_LESSON_PLANS } from "@/data/demo-lesson";
import { RichText } from "@/components/RichText";

const MAX_NOTES_CHARS = 2000;

const formSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  gradeLevel: z.nativeEnum(GenerateLessonPlanBodyGradeLevel),
  widaBand: z.nativeEnum(GenerateLessonPlanBodyWidaBand),
  unitProfile: z.nativeEnum(GenerateLessonPlanBodyUnitProfile).optional(),
  notes: z
    .string()
    .min(5, "Planning notes are required")
    .max(
      MAX_NOTES_CHARS,
      `Planning notes must be ${MAX_NOTES_CHARS} characters or fewer`,
    ),
});

interface DisplayedLesson {
  lesson: LessonPlan;
  gradeLevel: string;
  widaBand: string;
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
  const { lesson, gradeLevel, widaBand, topic, unitProfile } = displayed;
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
        <span style={s.metaPill}>{widaBand}</span>
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
          <div style={s.sectionLabel}>Sources Used</div>
          <p style={s.sectionBody}>{lesson.sourcesUsed.join("\n")}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function Home({ accessCode, isDemo }: HomeProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      gradeLevel: GenerateLessonPlanBodyGradeLevel.Grade_3,
      widaBand: GenerateLessonPlanBodyWidaBand["WIDA_1-2"],
      unitProfile: undefined,
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
  const { lessons, save, remove } = useSavedLessons();
  const [displayed, setDisplayed] = useState<DisplayedLesson | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [demoIndex, setDemoIndex] = useState(0);

  // Cooldown state
  const [cooldownSecs, setCooldownSecs] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isDemo) {
      const hasPilotUnit =
        values.unitProfile ===
        GenerateLessonPlanBodyUnitProfile["Grade_4_Discipline-Based_Writing"];
      const plan = hasPilotUnit
        ? DEMO_LESSON_PLANS[1]
        : DEMO_LESSON_PLANS[demoIndex % DEMO_LESSON_PLANS.length];
      if (!hasPilotUnit) setDemoIndex((i) => i + 1);
      setSavedId(null);
      const id = save(plan, {
        gradeLevel: values.gradeLevel,
        widaBand: values.widaBand,
        topic: values.topic || plan.title,
        unitProfile: values.unitProfile,
      });
      setSavedId(id);
      setDisplayed({
        lesson: plan,
        gradeLevel: values.gradeLevel,
        widaBand: values.widaBand,
        topic: values.topic || plan.title,
        unitProfile: values.unitProfile,
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
      widaBand: string;
      topic: string;
      notes: string;
      unitProfile?: string;
    };
    const id = save(result, {
      gradeLevel: vals.gradeLevel,
      widaBand: vals.widaBand,
      topic: vals.topic,
      unitProfile: vals.unitProfile,
    });
    setSavedId(id);
    setDisplayed({
      lesson: result,
      gradeLevel: vals.gradeLevel,
      widaBand: vals.widaBand,
      topic: vals.topic,
      unitProfile: vals.unitProfile,
    });
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
    setSavedId(entry.id);
    setDisplayed({
      lesson: entry.lesson,
      gradeLevel: entry.gradeLevel,
      widaBand: entry.widaBand,
      topic: entry.topic,
      unitProfile: entry.unitProfile,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const errorMsg: string | null = isError
    ? ((error as { data?: { error?: string } })?.data?.error ??
      (error as Error)?.message ??
      "Failed to generate lesson plan. Please try again.")
    : null;

  return (
    <div className="bg-background text-foreground">
      {displayed && <PrintableLesson displayed={displayed} />}

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 print:hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Lesson Planner
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Build a ready-to-teach lesson for multilingual learners from
              your topic and planning notes.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            {isDemo && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                <FlaskConical className="w-3.5 h-3.5" />
                Sample mode
              </span>
            )}
            {lessons.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground border border-border rounded-md px-2.5 py-1.5 bg-card">
                <BookMarked className="w-3.5 h-3.5" />
                {lessons.length} saved
              </span>
            )}
          </div>
        </div>

        {isDemo && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 leading-relaxed">
            <strong>Sample mode:</strong> Try the planner with pre-written
            lesson plans. Your selections and notes stay in this browser.
          </div>
        )}

        <Card className="border border-border shadow-none">
          <CardContent className="pt-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Topic / Subject
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Fractions, Photosynthesis"
                            data-testid="input-topic"
                            className="text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Grade Level
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              data-testid="select-grade-level"
                              className="text-sm"
                            >
                              <SelectValue placeholder="Select a grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(
                              Object.values(
                                GenerateLessonPlanBodyGradeLevel,
                              ) as string[]
                            ).map((grade) => (
                              <SelectItem
                                key={grade}
                                value={grade}
                                className="text-sm"
                              >
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
                    name="widaBand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          WIDA Band
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              data-testid="select-wida-band"
                              className="text-sm"
                            >
                              <SelectValue placeholder="Select WIDA band" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(
                              Object.entries(
                                GenerateLessonPlanBodyWidaBand,
                              ) as [string, string][]
                            ).map(([, value]) => (
                              <SelectItem
                                key={value}
                                value={value}
                                className="text-sm"
                              >
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="unitProfile"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border border-primary/15 bg-primary/[0.035] p-4">
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.9fr)] md:items-center">
                        <div>
                          <FormLabel className="text-sm font-semibold">
                            Curriculum Unit
                          </FormLabel>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Choose the pilot unit to ground the plan in EALDesk
                            curriculum, WIDA guidance, and the approved source
                            pack.
                          </p>
                        </div>
                        <Select
                          value={field.value ?? "general"}
                          onValueChange={(value) => {
                            if (value === "general") {
                              field.onChange(undefined);
                              return;
                            }
                            field.onChange(value);
                            form.setValue(
                              "gradeLevel",
                              GenerateLessonPlanBodyGradeLevel.Grade_4,
                            );
                          }}
                        >
                          <FormControl>
                            <SelectTrigger
                              data-testid="select-unit-profile"
                              className="bg-background text-sm"
                            >
                              <SelectValue placeholder="Select a curriculum unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general" className="text-sm">
                              General lesson planning
                            </SelectItem>
                            <SelectItem
                              value={
                                GenerateLessonPlanBodyUnitProfile[
                                  "Grade_4_Discipline-Based_Writing"
                                ]
                              }
                              className="text-sm"
                            >
                              Grade 4 Discipline-Based Writing
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline justify-between gap-2">
                        <FormLabel className="text-sm font-medium">
                          Planning Notes
                        </FormLabel>
                        <span
                          className={`text-xs tabular-nums ${notesLength > MAX_NOTES_CHARS * 0.9 ? "text-destructive font-medium" : "text-muted-foreground"}`}
                        >
                          {notesLength}/{MAX_NOTES_CHARS}
                        </span>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your rough notes or voice transcript here..."
                          className="min-h-[180px] resize-y text-sm leading-relaxed"
                          data-testid="input-notes"
                          maxLength={MAX_NOTES_CHARS}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Please do not include student names or private student
                        information.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex-1 mr-4">
                    {errorMsg && (
                      <p
                        className="text-sm text-destructive font-medium"
                        role="alert"
                      >
                        {errorMsg}
                      </p>
                    )}
                    {cooldownSecs > 0 && !errorMsg && (
                      <p className="text-sm text-muted-foreground">
                        Next generation available in {cooldownSecs}s...
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    data-testid="button-generate"
                    className="text-sm font-semibold shrink-0"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : cooldownSecs > 0 ? (
                      `Wait ${cooldownSecs}s`
                    ) : isDemo ? (
                      "Show Sample Plan"
                    ) : (
                      "Generate Lesson Plan"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isGenerating && !displayed && (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-center animate-in fade-in duration-500">
            <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">
              Crafting your lesson plan...
            </p>
          </div>
        )}

        {displayed && (
          <section
            data-testid="section-results"
            className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="pb-4 border-b border-border flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {displayed.lesson.title}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2 items-center">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {displayed.gradeLevel}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-medium">
                    {displayed.widaBand}
                  </Badge>
                  {displayed.unitProfile && (
                    <Badge
                      variant="outline"
                      className="text-xs font-medium border-primary/20 bg-primary/5 text-primary"
                    >
                      {displayed.unitProfile}
                    </Badge>
                  )}
                  {isDemo && (
                    <Badge
                      variant="outline"
                      className="text-xs font-medium text-amber-700 border-amber-200 bg-amber-50"
                    >
                      Sample
                    </Badge>
                  )}
                  {savedId && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Saved to library
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 text-xs font-medium h-8 px-3"
                onClick={() => window.print()}
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </Button>
            </div>

            {displayed.lesson.integratedUnitGoal && (
              <Card className="border border-primary/20 bg-primary/[0.035] shadow-none">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Integrated Unit Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 text-sm leading-relaxed">
                  {displayed.lesson.integratedUnitGoal}
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border border-border shadow-none">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Content Objective
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 text-sm leading-relaxed">
                  {displayed.lesson.contentObjective}
                </CardContent>
              </Card>
              <Card className="border border-border shadow-none">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Language Objective
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 text-sm leading-relaxed">
                  {displayed.lesson.languageObjective}
                </CardContent>
              </Card>
            </div>

            {(displayed.lesson.languageFunctionObjective ||
              displayed.lesson.languageFeatureObjective) && (
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border border-border shadow-none">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Language Function
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 text-sm leading-relaxed">
                    {displayed.lesson.languageFunctionObjective}
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-none">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Language Feature
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 text-sm leading-relaxed">
                    {displayed.lesson.languageFeatureObjective}
                  </CardContent>
                </Card>
              </div>
            )}

            <Card className="border border-border shadow-none">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Vocabulary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
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
              </CardContent>
            </Card>

            <Card className="border border-border shadow-none bg-primary text-primary-foreground">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/60">
                  Sentence Frames
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
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
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Lesson Flow
              </h3>
              {[
                {
                  step: "1",
                  label: "Warm-Up",
                  content: displayed.lesson.warmUp,
                },
                {
                  step: "2",
                  label: "Main Activity",
                  content: displayed.lesson.mainActivity,
                },
                {
                  step: "3",
                  label: "Speaking Activity",
                  content: displayed.lesson.speakingActivity,
                },
                {
                  step: "4",
                  label: "Exit Ticket",
                  content: displayed.lesson.exitTicket,
                },
              ].map(({ step, label, content }) => (
                <Card key={step} className="border border-border shadow-none">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                        {step}
                      </span>
                      {label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 text-muted-foreground">
                    <RichText text={content} />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border border-border shadow-none bg-muted/40">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Teacher Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 text-muted-foreground">
                <RichText text={displayed.lesson.teacherNotes} />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              {displayed.lesson.scaffoldPlan && (
                <Card className="border border-border shadow-none">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Scaffold Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 text-muted-foreground">
                    <RichText text={displayed.lesson.scaffoldPlan} />
                  </CardContent>
                </Card>
              )}
              {displayed.lesson.scaffoldFadingPlan && (
                <Card className="border border-border shadow-none">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Fade Toward Independence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 text-muted-foreground">
                    <RichText text={displayed.lesson.scaffoldFadingPlan} />
                  </CardContent>
                </Card>
              )}
              {displayed.lesson.formativeAssessment && (
                <Card className="border border-border shadow-none">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Formative Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 text-muted-foreground">
                    <RichText text={displayed.lesson.formativeAssessment} />
                  </CardContent>
                </Card>
              )}
            </div>

            {displayed.lesson.sourcesUsed?.length > 0 && (
              <Card className="border border-border shadow-none bg-muted/25">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sources Used
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                    {displayed.lesson.sourcesUsed.map((source, index) => (
                      <li key={index}>• {source}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {lessons.length > 0 && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-muted-foreground" />
                Lesson Library
                <span className="text-xs font-medium text-muted-foreground">
                  ({lessons.length})
                </span>
              </h2>
            </div>
            <div className="grid gap-2">
              {lessons.map((entry) => {
                const isActive = savedId === entry.id;
                return (
                  <div
                    key={entry.id}
                    className={`group flex items-start gap-3 px-4 py-3 rounded-lg border transition-colors cursor-pointer ${
                      isActive
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                    onClick={() => viewSavedLesson(entry)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {entry.topic || entry.lesson.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {entry.gradeLevel}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {entry.widaBand}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.savedAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isActive) {
                          setDisplayed(null);
                          setSavedId(null);
                        }
                        remove(entry.id);
                      }}
                      className="shrink-0 p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                      aria-label="Delete lesson"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
