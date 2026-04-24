import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGenerateClassroomSupport,
  GenerateClassroomSupportBodyGradeLevel,
  GenerateClassroomSupportBodyWidaLevel,
  type ClassroomSupport,
} from "@workspace/api-client-react";
import { Loader2, Copy, Check } from "lucide-react";
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

const formSchema = z.object({
  need: z.string().min(5, "Please describe what your students need help with"),
  gradeLevel: z.nativeEnum(GenerateClassroomSupportBodyGradeLevel),
  widaLevel: z.nativeEnum(GenerateClassroomSupportBodyWidaLevel),
});

function SupportCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">{children}</CardContent>
    </Card>
  );
}

export default function ClassroomCopilot() {
  const [copied, setCopied] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      need: "",
      gradeLevel: GenerateClassroomSupportBodyGradeLevel.Grade_3,
      widaLevel: GenerateClassroomSupportBodyWidaLevel["WIDA_1-2"],
    },
  });

  const { mutate: generateSupport, data: result, isPending, isError, error } = useGenerateClassroomSupport();

  function onSubmit(values: z.infer<typeof formSchema>) {
    generateSupport({ data: values });
  }

  function formatAllForCopy(support: ClassroomSupport): string {
    return [
      `SIMPLE EXPLANATION\n${support.simpleExplanation}`,
      `KEY VOCABULARY\n${support.keyVocabulary.join(", ")}`,
      `SENTENCE FRAMES\n${support.sentenceFrames.map((f) => `• ${f}`).join("\n")}`,
      `QUICK ACTIVITY\n${support.quickActivity}`,
      `EXTENSION QUESTION\n${support.extensionQuestion}`,
      `TEACHER MOVE\n${support.teacherMove}`,
    ].join("\n\n");
  }

  async function handleCopyAll() {
    if (!result) return;
    await navigator.clipboard.writeText(formatAllForCopy(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        <div>
          <h1 className="text-lg font-semibold text-foreground">Classroom Copilot</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Fast EAL support for live teaching moments.
          </p>
        </div>

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
                      <FormLabel className="text-sm font-medium">
                        What do your students need help with right now?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          data-testid="input-need"
                          placeholder="Describe what your students need help with..."
                          className="min-h-[120px] resize-none text-sm leading-relaxed"
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
                      {(error as Error)?.message || "Something went wrong. Please try again."}
                    </p>
                  )}
                  <div className="ml-auto">
                    <Button
                      data-testid="button-generate"
                      type="submit"
                      disabled={isPending}
                      className="text-sm font-semibold"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Generate Support"
                      )}
                    </Button>
                  </div>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>

        {isPending && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">
              Preparing your classroom support...
            </p>
          </div>
        )}

        {result && !isPending && (
          <div data-testid="section-results" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Classroom Support</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
                data-testid="button-copy-all"
                className="gap-1.5 text-xs font-medium h-7 px-2.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy All
                  </>
                )}
              </Button>
            </div>

            <SupportCard title="Simple Explanation">
              <p className="text-sm leading-relaxed">{result.simpleExplanation}</p>
            </SupportCard>

            <SupportCard title="Key Vocabulary">
              <div className="flex flex-wrap gap-1.5">
                {result.keyVocabulary.map((word, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/8 text-primary text-sm font-medium border border-primary/15"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </SupportCard>

            <SupportCard title="Sentence Frames">
              <ul className="space-y-2">
                {result.sentenceFrames.map((frame, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{frame}</span>
                  </li>
                ))}
              </ul>
            </SupportCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SupportCard title="Quick Activity">
                <p className="text-sm leading-relaxed">{result.quickActivity}</p>
              </SupportCard>

              <SupportCard title="Extension Question">
                <p className="text-sm leading-relaxed">{result.extensionQuestion}</p>
              </SupportCard>
            </div>

            <SupportCard title="Teacher Move">
              <p className="text-sm leading-relaxed font-medium">{result.teacherMove}</p>
            </SupportCard>

          </div>
        )}
      </main>
    </div>
  );
}
