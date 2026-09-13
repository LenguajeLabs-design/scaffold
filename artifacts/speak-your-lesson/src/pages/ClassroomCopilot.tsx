import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGenerateClassroomSupport,
  GenerateClassroomSupportBodyGradeLevel,
  GenerateClassroomSupportBodyWidaLevel,
  type ClassroomSupport,
} from "@workspace/api-client-react";
import {
  Loader2,
  Copy,
  Check,
  BookMarked,
  Trash2,
  FlaskConical,
  MessageSquareText,
  FileText,
  Tags,
  MessageSquareQuote,
  Zap,
  CircleHelp,
  Lightbulb,
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
  useSavedCopilotSessions,
  type SavedCopilotSession,
} from "@/hooks/use-saved-copilot-sessions";
import { DEMO_COPILOT_SESSIONS } from "@/data/demo-copilot";
import { RichText } from "@/components/RichText";

const MAX_NEED_CHARS = 2000;

const supportGenerationSteps = [
  "Reading the classroom moment",
  "Identifying the likely language barrier",
  "Preparing a quick student-facing support",
  "Adding a teacher move you can try now",
];

const widaLevelDescriptions: Record<string, string> = {
  "WIDA 1-2": "Beginning to develop classroom English",
  "WIDA 1–2": "Beginning to develop classroom English",
  "WIDA 2-3": "Developing classroom English",
  "WIDA 2–3": "Developing classroom English",
  "WIDA 3-4": "More independent classroom English use",
  "WIDA 3–4": "More independent classroom English use",
};

const formSchema = z.object({
  need: z
    .string()
    .min(5, "Please describe what your students need help with")
    .max(
      MAX_NEED_CHARS,
      `Description must be ${MAX_NEED_CHARS} characters or fewer`,
    ),
  gradeLevel: z.nativeEnum(GenerateClassroomSupportBodyGradeLevel),
  widaLevel: z.nativeEnum(GenerateClassroomSupportBodyWidaLevel),
});

interface DisplayedSession {
  support: ClassroomSupport;
  gradeLevel: string;
  widaLevel: string;
  need: string;
}

interface ClassroomCopilotProps {
  accessCode: string;
  isDemo: boolean;
}

function SupportCard({
  icon: Icon,
  title,
  children,
  tone = "blue",
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  tone?: "teal" | "blue" | "purple" | "sun";
}) {
  const toneStyles = {
    teal: "bg-[var(--brand-teal)]",
    blue: "bg-[var(--brand-blue)]",
    purple: "bg-[var(--brand-purple)]",
    sun: "bg-[var(--brand-sun)]",
  };
  const iconStyles = {
    teal: "text-[var(--brand-teal-strong)]",
    blue: "text-[var(--brand-blue-strong)]",
    purple: "text-[var(--brand-purple-strong)]",
    sun: "text-amber-700",
  };

  return (
    <Card className="overflow-hidden border border-border/80 bg-card/95 shadow-[0_10px_30px_rgba(15,45,74,0.055)]">
      <div className={`h-1 ${toneStyles[tone]}`} aria-hidden="true" />
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Icon className={`h-4 w-4 ${iconStyles[tone]}`} aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">{children}</CardContent>
    </Card>
  );
}

export default function ClassroomCopilot({
  accessCode,
  isDemo,
}: ClassroomCopilotProps) {
  const [copied, setCopied] = useState(false);
  const [displayed, setDisplayed] = useState<DisplayedSession | null>(null);
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      need: "",
      gradeLevel: GenerateClassroomSupportBodyGradeLevel.Grade_3,
      widaLevel: GenerateClassroomSupportBodyWidaLevel["WIDA_1-2"],
    },
  });

  const needValue = form.watch("need");
  const needLength = needValue.length;

  const {
    mutate: generateSupport,
    data: result,
    isPending,
    isError,
    error,
  } = useGenerateClassroomSupport();
  const { sessions, save, remove } = useSavedCopilotSessions();

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isDemo) {
      const sampleIndex = demoIndex % DEMO_COPILOT_SESSIONS.length;
      const support = DEMO_COPILOT_SESSIONS[sampleIndex];
      const sampleNeed =
        sampleIndex === 0
          ? "Explaining fractions with equal parts"
          : "Explaining the stages of the water cycle";
      setDemoIndex((i) => i + 1);
      setSavedId(null);
      const id = save(support, {
        gradeLevel: values.gradeLevel,
        widaLevel: values.widaLevel,
        need: sampleNeed,
      });
      setSavedId(id);
      setDisplayed({
        support,
        gradeLevel: values.gradeLevel,
        widaLevel: values.widaLevel,
        need: sampleNeed,
      });
      return;
    }
    setSavedId(null);
    generateSupport({ data: { ...values, accessCode } });
  }

  useEffect(() => {
    if (!result) return;
    const vals = form.getValues() as {
      gradeLevel: string;
      widaLevel: string;
      need: string;
    };
    const id = save(result, {
      gradeLevel: vals.gradeLevel,
      widaLevel: vals.widaLevel,
      need: vals.need,
    });
    setSavedId(id);
    setDisplayed({
      support: result,
      gradeLevel: vals.gradeLevel,
      widaLevel: vals.widaLevel,
      need: vals.need,
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

  function viewSession(entry: SavedCopilotSession) {
    setSavedId(entry.id);
    setDisplayed({
      support: entry.support,
      gradeLevel: entry.gradeLevel,
      widaLevel: entry.widaLevel,
      need: entry.need,
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

  function formatAllForCopy(support: ClassroomSupport): string {
    return [
      `SIMPLE EXPLANATION\n${support.simpleExplanation}`,
      `KEY VOCABULARY\n${support.keyVocabulary.join(", ")}`,
      `SENTENCE FRAMES\n${support.sentenceFrames.map((f: string) => `• ${f}`).join("\n")}`,
      `QUICK ACTIVITY\n${support.quickActivity}`,
      `EXTENSION QUESTION\n${support.extensionQuestion}`,
      `TEACHER MOVE\n${support.teacherMove}`,
    ].join("\n\n");
  }

  async function handleCopyAll() {
    if (!displayed) return;
    await navigator.clipboard.writeText(formatAllForCopy(displayed.support));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isGenerating = isPending && !isDemo;
  const canSubmit = !isGenerating && cooldownSecs === 0;

  const errorMsg: string | null = isError
    ? ((error as { data?: { error?: string } })?.data?.error ??
      (error as Error)?.message ??
      "Something went wrong. Please try again.")
    : null;

  return (
    <div className="bg-background text-foreground">
      <main className="max-w-5xl mx-auto px-4 py-9 sm:py-14 space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--brand-blue-strong)] shadow-[0_10px_24px_rgba(15,45,74,0.08)] ring-1 ring-[var(--brand-blue)]/15">
            <MessageSquareText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue-strong)]">
              In-the-moment support
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
              Classroom Copilot
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Get a quick, reviewable language support for the teaching moment
              in front of you.
            </p>
          </div>
        </div>

        {isDemo && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3.5 text-sm leading-relaxed text-amber-900">
            <FlaskConical
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <p>
              <strong>Sample preview.</strong> Explore a prepared classroom
              support before using your beta access. Your entry stays in this
              browser and won’t change the example response.
            </p>
          </div>
        )}

        <Card className="overflow-hidden border-white/90 bg-card/95 shadow-[0_24px_64px_rgba(15,45,74,0.08)] backdrop-blur-sm">
          <div
            className="h-1 bg-gradient-to-r from-[var(--brand-teal)] via-[var(--brand-blue)] to-[var(--brand-sun)]"
            aria-hidden="true"
          />
          <CardContent className="pt-6 sm:p-7">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              data-testid="select-grade-level"
                              className="text-sm"
                            >
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem
                              value={
                                GenerateClassroomSupportBodyGradeLevel.Grade_2
                              }
                              className="text-sm"
                            >
                              Grade 2
                            </SelectItem>
                            <SelectItem
                              value={
                                GenerateClassroomSupportBodyGradeLevel.Grade_3
                              }
                              className="text-sm"
                            >
                              Grade 3
                            </SelectItem>
                            <SelectItem
                              value={
                                GenerateClassroomSupportBodyGradeLevel.Grade_4
                              }
                              className="text-sm"
                            >
                              Grade 4
                            </SelectItem>
                            <SelectItem
                              value={
                                GenerateClassroomSupportBodyGradeLevel.Grade_5
                              }
                              className="text-sm"
                            >
                              Grade 5
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="widaLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Language Proficiency Reference
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              data-testid="select-wida-level"
                              className="text-sm"
                            >
                              <SelectValue placeholder="Select a proficiency range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem
                              value={
                                GenerateClassroomSupportBodyWidaLevel[
                                  "WIDA_1-2"
                                ]
                              }
                              className="text-sm"
                            >
                              <span className="flex flex-col">
                                <span>WIDA 1–2</span>
                                <span className="text-xs text-muted-foreground">
                                  {widaLevelDescriptions["WIDA 1–2"]}
                                </span>
                              </span>
                            </SelectItem>
                            <SelectItem
                              value={
                                GenerateClassroomSupportBodyWidaLevel[
                                  "WIDA_2-3"
                                ]
                              }
                              className="text-sm"
                            >
                              <span className="flex flex-col">
                                <span>WIDA 2–3</span>
                                <span className="text-xs text-muted-foreground">
                                  {widaLevelDescriptions["WIDA 2–3"]}
                                </span>
                              </span>
                            </SelectItem>
                            <SelectItem
                              value={
                                GenerateClassroomSupportBodyWidaLevel[
                                  "WIDA_3-4"
                                ]
                              }
                              className="text-sm"
                            >
                              <span className="flex flex-col">
                                <span>WIDA 3–4</span>
                                <span className="text-xs text-muted-foreground">
                                  {widaLevelDescriptions["WIDA 3–4"]}
                                </span>
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Uses the six-level WIDA proficiency scale as an instructional reference. Scaffold is not a WIDA product. Not sure? Choose the range that best matches how
                          independently students understand and use English in
                          class. You can adapt the support before using it.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="need"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline justify-between gap-2">
                        <FormLabel className="text-sm font-medium">
                          What do your students need help with right now?
                        </FormLabel>
                        <span
                          className={`text-xs tabular-nums shrink-0 ${needLength > MAX_NEED_CHARS * 0.9 ? "text-destructive font-medium" : "text-muted-foreground"}`}
                        >
                          {needLength}/{MAX_NEED_CHARS}
                        </span>
                      </div>
                      <FormControl>
                        <Textarea
                          data-testid="input-need"
                          placeholder="For example: Students can solve the problem, but they are struggling to explain how they know the fractions are equivalent."
                          className="min-h-[120px] resize-none text-sm leading-relaxed"
                          maxLength={MAX_NEED_CHARS}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Describe the teaching moment, not the student. Leave out
                        names and identifying information.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div
                  className={`flex flex-col gap-3 pt-1 sm:flex-row sm:items-start sm:justify-between ${
                    needLength > 0
                      ? "sticky bottom-3 z-20 -mx-2 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-lg backdrop-blur-xl sm:static sm:mx-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none"
                      : ""
                  }`}
                >
                  <div className="flex-1">
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
                  <div className="shrink-0 space-y-1.5 sm:min-w-52">
                    <Button
                      data-testid="button-generate"
                      type="submit"
                      disabled={!canSubmit}
                      className="w-full text-sm font-semibold shadow-[0_10px_24px_rgba(30,27,75,0.18)]"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Building quick support...
                        </>
                      ) : cooldownSecs > 0 ? (
                        `Wait ${cooldownSecs}s`
                      ) : (
                        "Build quick support"
                      )}
                    </Button>
                    {isDemo && cooldownSecs === 0 && !isGenerating && (
                      <p className="text-center text-xs text-muted-foreground">
                        Shows a prepared example without using AI.
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isGenerating && !displayed && (
          <section
            className="overflow-hidden rounded-2xl border border-[var(--brand-blue)]/25 bg-card text-center shadow-[0_16px_40px_rgba(30,27,75,0.06)] animate-in fade-in duration-300"
            aria-labelledby="generating-support-heading"
            aria-live="polite"
          >
            <div className="h-1 w-full animate-pulse bg-gradient-to-r from-[var(--brand-teal)] via-[var(--brand-blue)] to-[var(--brand-purple)]" />
            <div className="px-6 py-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              </div>
              <h2
                id="generating-support-heading"
                className="mt-4 font-semibold text-foreground"
              >
                Building a quick support
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                Scaffold is turning the classroom moment into a small support
                you can review and use right away.
              </p>
              <ol className="mx-auto mt-6 max-w-sm space-y-2 text-left">
                {supportGenerationSteps.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {displayed && !isGenerating && (
          <div
            data-testid="section-results"
            className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Quick support draft
                  {isDemo && (
                    <Badge
                      variant="outline"
                      className="text-xs font-medium text-amber-700 border-amber-200 bg-amber-50"
                    >
                      Sample
                    </Badge>
                  )}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Review and adapt before using · {displayed.gradeLevel} ·{" "}
                  {displayed.widaLevel} · {displayed.need.slice(0, 60)}
                  {displayed.need.length > 60 ? "…" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {savedId && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Saved
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAll}
                  data-testid="button-copy-all"
                  className="gap-1.5 text-xs font-medium h-8 px-3"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy support
                    </>
                  )}
                </Button>
              </div>
            </div>

            <SupportCard
              icon={FileText}
              title="Student-friendly explanation"
              tone="teal"
            >
              <RichText text={displayed.support.simpleExplanation} />
              <p className="mt-4 rounded-xl border border-[var(--brand-sun)]/30 bg-[var(--brand-sun)]/10 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                Teacher review required: Scaffold generates instructional suggestions, not official proficiency determinations or individualized educational recommendations. Adapt this support to your students, curriculum, school policies, and professional judgment.
              </p>
            </SupportCard>

            <SupportCard
              icon={Tags}
              title="Words students may need"
              tone="blue"
            >
              <div className="flex flex-wrap gap-1.5">
                {displayed.support.keyVocabulary.map(
                  (word: string, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/8 text-primary text-sm font-medium border border-primary/15"
                    >
                      {word}
                    </span>
                  ),
                )}
              </div>
            </SupportCard>

            <SupportCard
              icon={MessageSquareQuote}
              title="Language students can use"
              tone="purple"
            >
              <ul className="space-y-2">
                {displayed.support.sentenceFrames.map(
                  (frame: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{frame}</span>
                    </li>
                  ),
                )}
              </ul>
            </SupportCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SupportCard
                icon={Zap}
                title="A quick way to practice"
                tone="sun"
              >
                <RichText text={displayed.support.quickActivity} />
              </SupportCard>
              <SupportCard
                icon={CircleHelp}
                title="A question to extend thinking"
                tone="blue"
              >
                <p className="text-sm leading-relaxed">
                  {displayed.support.extensionQuestion}
                </p>
              </SupportCard>
            </div>

            <SupportCard
              icon={Lightbulb}
              title="Teacher move to try"
              tone="teal"
            >
              <p className="text-sm leading-relaxed font-medium">
                {displayed.support.teacherMove}
              </p>
            </SupportCard>
          </div>
        )}

        {sessions.length > 0 && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-muted-foreground" />
                Session History
                <span className="text-xs font-medium text-muted-foreground">
                  ({sessions.length})
                </span>
              </h2>
            </div>
            <div className="grid gap-2">
              {sessions.map((entry) => {
                const isActive = savedId === entry.id;
                return (
                  <div
                    key={entry.id}
                    className={`group flex items-start gap-3 px-4 py-3 rounded-lg border transition-colors cursor-pointer ${
                      isActive
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                    onClick={() => viewSession(entry)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {entry.preview}
                        {entry.need.length > 80 ? "…" : ""}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {entry.gradeLevel}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {entry.widaLevel}
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
                      aria-label="Delete session"
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
