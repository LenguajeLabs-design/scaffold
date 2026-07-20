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
import { Loader2, Copy, Check, BookMarked, Trash2, FlaskConical } from "lucide-react";
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

const formSchema = z.object({
  need: z
    .string()
    .min(5, "Please describe what your students need help with")
    .max(MAX_NEED_CHARS, `Description must be ${MAX_NEED_CHARS} characters or fewer`),
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

function SupportCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">{children}</CardContent>
    </Card>
  );
}

export default function ClassroomCopilot({ accessCode, isDemo }: ClassroomCopilotProps) {
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
        if (s <= 1) { clearInterval(cooldownRef.current!); return 0; }
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

  const { mutate: generateSupport, data: result, isPending, isError, error } = useGenerateClassroomSupport();
  const { sessions, save, remove } = useSavedCopilotSessions();

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isDemo) {
      const support = DEMO_COPILOT_SESSIONS[demoIndex % DEMO_COPILOT_SESSIONS.length];
      setDemoIndex((i) => i + 1);
      setSavedId(null);
      const id = save(support, { gradeLevel: values.gradeLevel, widaLevel: values.widaLevel, need: values.need });
      setSavedId(id);
      setDisplayed({ support, gradeLevel: values.gradeLevel, widaLevel: values.widaLevel, need: values.need });
      return;
    }
    setSavedId(null);
    generateSupport({ data: { ...values, accessCode } });
  }

  useEffect(() => {
    if (!result) return;
    const vals = form.getValues() as { gradeLevel: string; widaLevel: string; need: string };
    const id = save(result, { gradeLevel: vals.gradeLevel, widaLevel: vals.widaLevel, need: vals.need });
    setSavedId(id);
    setDisplayed({ support: result, gradeLevel: vals.gradeLevel, widaLevel: vals.widaLevel, need: vals.need });
  }, [result]);

  // Parse cooldown from API error
  useEffect(() => {
    if (!error) return;
    const msg: string = (error as { data?: { error?: string } })?.data?.error ?? (error as Error)?.message ?? "";
    const match = msg.match(/wait (\d+) second/);
    if (match) startCooldown(parseInt(match[1], 10));
  }, [error]);

  function viewSession(entry: SavedCopilotSession) {
    setSavedId(entry.id);
    setDisplayed({ support: entry.support, gradeLevel: entry.gradeLevel, widaLevel: entry.widaLevel, need: entry.need });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
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
    ? ((error as { data?: { error?: string } })?.data?.error ?? (error as Error)?.message ?? "Something went wrong. Please try again.")
    : null;

  return (
    <div className="bg-background text-foreground">
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Classroom Copilot</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Get practical language supports for the teaching moment in front
              of you.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            {isDemo && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                <FlaskConical className="w-3.5 h-3.5" />
                Sample mode
              </span>
            )}
            {sessions.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground border border-border rounded-md px-2.5 py-1.5 bg-card">
                <BookMarked className="w-3.5 h-3.5" />
                {sessions.length} saved
              </span>
            )}
          </div>
        </div>

        {isDemo && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 leading-relaxed">
            <strong>Sample mode:</strong> Try the workflow with pre-written
            classroom supports. Your entries stay in this browser.
          </div>
        )}

        <Card className="border border-border shadow-none">
          <CardContent className="pt-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Grade Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-grade-level" className="text-sm">
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={GenerateClassroomSupportBodyGradeLevel.Grade_2} className="text-sm">Grade 2</SelectItem>
                            <SelectItem value={GenerateClassroomSupportBodyGradeLevel.Grade_3} className="text-sm">Grade 3</SelectItem>
                            <SelectItem value={GenerateClassroomSupportBodyGradeLevel.Grade_4} className="text-sm">Grade 4</SelectItem>
                            <SelectItem value={GenerateClassroomSupportBodyGradeLevel.Grade_5} className="text-sm">Grade 5</SelectItem>
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
                        <FormLabel className="text-sm font-medium">WIDA Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-wida-level" className="text-sm">
                              <SelectValue placeholder="Select WIDA level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={GenerateClassroomSupportBodyWidaLevel["WIDA_1-2"]} className="text-sm">WIDA 1–2</SelectItem>
                            <SelectItem value={GenerateClassroomSupportBodyWidaLevel["WIDA_2-3"]} className="text-sm">WIDA 2–3</SelectItem>
                            <SelectItem value={GenerateClassroomSupportBodyWidaLevel["WIDA_3-4"]} className="text-sm">WIDA 3–4</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <span className={`text-xs tabular-nums shrink-0 ${needLength > MAX_NEED_CHARS * 0.9 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          {needLength}/{MAX_NEED_CHARS}
                        </span>
                      </div>
                      <FormControl>
                        <Textarea
                          data-testid="input-need"
                          placeholder="Describe what your students need help with..."
                          className="min-h-[120px] resize-none text-sm leading-relaxed"
                          maxLength={MAX_NEED_CHARS}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Please do not include student names or private student information.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex-1 mr-4">
                    {errorMsg && (
                      <p className="text-sm text-destructive font-medium" role="alert">
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
                    data-testid="button-generate"
                    type="submit"
                    disabled={!canSubmit}
                    className="text-sm font-semibold shrink-0"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : cooldownSecs > 0 ? (
                      `Wait ${cooldownSecs}s`
                    ) : isDemo ? (
                      "Show Sample Support"
                    ) : (
                      "Generate Support"
                    )}
                  </Button>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>

        {isGenerating && !displayed && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">Preparing your classroom support...</p>
          </div>
        )}

        {displayed && !isGenerating && (
          <div data-testid="section-results" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Classroom Support
                  {isDemo && (
                    <Badge variant="outline" className="text-xs font-medium text-amber-700 border-amber-200 bg-amber-50">Sample</Badge>
                  )}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {displayed.gradeLevel} · {displayed.widaLevel} · {displayed.need.slice(0, 60)}{displayed.need.length > 60 ? "…" : ""}
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
                    <><Check className="w-3.5 h-3.5" />Copied</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" />Copy All</>
                  )}
                </Button>
              </div>
            </div>

            <SupportCard title="Simple Explanation">
              <RichText text={displayed.support.simpleExplanation} />
            </SupportCard>

            <SupportCard title="Key Vocabulary">
              <div className="flex flex-wrap gap-1.5">
                {displayed.support.keyVocabulary.map((word: string, i: number) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/8 text-primary text-sm font-medium border border-primary/15">{word}</span>
                ))}
              </div>
            </SupportCard>

            <SupportCard title="Sentence Frames">
              <ul className="space-y-2">
                {displayed.support.sentenceFrames.map((frame: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{frame}</span>
                  </li>
                ))}
              </ul>
            </SupportCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SupportCard title="Quick Activity">
                <RichText text={displayed.support.quickActivity} />
              </SupportCard>
              <SupportCard title="Extension Question">
                <p className="text-sm leading-relaxed">{displayed.support.extensionQuestion}</p>
              </SupportCard>
            </div>

            <SupportCard title="Teacher Move">
              <p className="text-sm leading-relaxed font-medium">{displayed.support.teacherMove}</p>
            </SupportCard>


          </div>
        )}

        {sessions.length > 0 && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-muted-foreground" />
                Session History
                <span className="text-xs font-medium text-muted-foreground">({sessions.length})</span>
              </h2>
            </div>
            <div className="grid gap-2">
              {sessions.map((entry) => {
                const isActive = savedId === entry.id;
                return (
                  <div
                    key={entry.id}
                    className={`group flex items-start gap-3 px-4 py-3 rounded-lg border transition-colors cursor-pointer ${
                      isActive ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:bg-muted/40"
                    }`}
                    onClick={() => viewSession(entry)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{entry.preview}{entry.need.length > 80 ? "…" : ""}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">{entry.gradeLevel}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{entry.widaLevel}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{formatDate(entry.savedAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isActive) { setDisplayed(null); setSavedId(null); }
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
