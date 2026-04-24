import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGenerateLessonPlan,
  GenerateLessonPlanBodyGradeLevel,
  GenerateLessonPlanBodyWidaBand,
  type LessonPlan,
} from "@workspace/api-client-react";
import { Loader2, Trash2, BookMarked, X } from "lucide-react";
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

const formSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  gradeLevel: z.nativeEnum(GenerateLessonPlanBodyGradeLevel),
  widaBand: z.nativeEnum(GenerateLessonPlanBodyWidaBand),
  notes: z.string().min(5, "Planning notes are required"),
});

interface DisplayedLesson {
  lesson: LessonPlan;
  gradeLevel: string;
  widaBand: string;
}

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      gradeLevel: GenerateLessonPlanBodyGradeLevel.Grade_3,
      widaBand: GenerateLessonPlanBodyWidaBand["WIDA_1-2"],
      notes: "",
    },
  });

  const { mutate: generateLessonPlan, data: result, isPending, isError } = useGenerateLessonPlan();
  const { lessons, save, remove } = useSavedLessons();
  const [displayed, setDisplayed] = useState<DisplayedLesson | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setSavedId(null);
    generateLessonPlan({ data: values });
  }

  useEffect(() => {
    if (!result) return;
    const { gradeLevel, widaBand, topic } = form.getValues();
    const id = save(result, { gradeLevel, widaBand, topic });
    setSavedId(id);
    setDisplayed({ lesson: result, gradeLevel, widaBand });
  }, [result]);

  function viewSavedLesson(entry: SavedLesson) {
    setSavedId(entry.id);
    setDisplayed({ lesson: entry.lesson, gradeLevel: entry.gradeLevel, widaBand: entry.widaBand });
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Lesson Planner</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Turn rough notes into a ready-to-teach lesson plan for multilingual learners.
            </p>
          </div>
          {lessons.length > 0 && (
            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground border border-border rounded-md px-2.5 py-1.5 bg-card mt-0.5">
              <BookMarked className="w-3.5 h-3.5" />
              {lessons.length} saved
            </span>
          )}
        </div>

        <Card className="border border-border shadow-none">
          <CardContent className="pt-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Topic / Subject</FormLabel>
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
                        <FormLabel className="text-sm font-medium">Grade Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-grade-level" className="text-sm">
                              <SelectValue placeholder="Select a grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(GenerateLessonPlanBodyGradeLevel).map((grade) => (
                              <SelectItem key={grade} value={grade} className="text-sm">{grade}</SelectItem>
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
                        <FormLabel className="text-sm font-medium">WIDA Band</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-wida-band" className="text-sm">
                              <SelectValue placeholder="Select WIDA band" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(GenerateLessonPlanBodyWidaBand).map(([, value]) => (
                              <SelectItem key={value} value={value} className="text-sm">{value}</SelectItem>
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Planning Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your rough notes or voice transcript here..."
                          className="min-h-[180px] resize-y text-sm leading-relaxed"
                          data-testid="input-notes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-1">
                  {isError && (
                    <p className="text-sm text-destructive font-medium">
                      Failed to generate lesson plan. Please try again.
                    </p>
                  )}
                  <div className="ml-auto">
                    <Button
                      type="submit"
                      disabled={isPending}
                      data-testid="button-generate"
                      className="text-sm font-semibold"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Generate Lesson Plan"
                      )}
                    </Button>
                  </div>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>

        {isPending && !displayed && (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-center animate-in fade-in duration-500">
            <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">Crafting your lesson plan...</p>
          </div>
        )}

        {displayed && (
          <section data-testid="section-results" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="pb-4 border-b border-border flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{displayed.lesson.title}</h2>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs font-medium">{displayed.gradeLevel}</Badge>
                  <Badge variant="outline" className="text-xs font-medium">{displayed.widaBand}</Badge>
                  {savedId && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Saved to library
                    </span>
                  )}
                </div>
              </div>
            </div>

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

            <Card className="border border-border shadow-none">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Vocabulary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex flex-wrap gap-1.5">
                  {displayed.lesson.keyVocabulary.map((vocab, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/8 text-primary text-sm font-medium border border-primary/15"
                    >
                      {vocab}
                    </span>
                  ))}
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
                  {displayed.lesson.sentenceFrames.map((frame, i) => (
                    <li key={i} className="flex gap-3 items-start text-sm">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-xs font-semibold mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{frame}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Lesson Flow</h3>
              {[
                { step: "1", label: "Warm-Up", content: displayed.lesson.warmUp },
                { step: "2", label: "Main Activity", content: displayed.lesson.mainActivity },
                { step: "3", label: "Speaking Activity", content: displayed.lesson.speakingActivity },
                { step: "4", label: "Exit Ticket", content: displayed.lesson.exitTicket },
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
                  <CardContent className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {content}
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
              <CardContent className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {displayed.lesson.teacherNotes}
              </CardContent>
            </Card>

          </section>
        )}

        {lessons.length > 0 && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-muted-foreground" />
                Lesson Library
                <span className="text-xs font-medium text-muted-foreground">({lessons.length})</span>
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
                      <p className="text-sm font-medium text-foreground truncate">{entry.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">{entry.topic}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{entry.gradeLevel}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{entry.widaBand}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{formatDate(entry.savedAt)}</span>
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
