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
import { Loader2, Zap, Copy, Check } from "lucide-react";
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

const formSchema = z.object({
  need: z.string().min(5, "Please describe what your students need help with"),
  gradeLevel: z.nativeEnum(GenerateClassroomSupportBodyGradeLevel),
  widaLevel: z.nativeEnum(GenerateClassroomSupportBodyWidaLevel),
});

function SupportCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#C82C39" }}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">{children}</CardContent>
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
    <div className="min-h-screen" style={{ backgroundColor: "#F4F6FA" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#142550" }} className="px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(200,44,57,0.25)" }}
          >
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Classroom Copilot</h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
              Fast EAL support for live teaching
            </p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto mt-1">
          <div className="h-0.5 rounded-full mt-4" style={{ backgroundColor: "#C82C39" }} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Form */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold" style={{ color: "#142550" }}>
                          Grade Level
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-grade-level">
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={GenerateClassroomSupportBodyGradeLevel.Grade_2}>Grade 2</SelectItem>
                            <SelectItem value={GenerateClassroomSupportBodyGradeLevel.Grade_3}>Grade 3</SelectItem>
                            <SelectItem value={GenerateClassroomSupportBodyGradeLevel.Grade_4}>Grade 4</SelectItem>
                            <SelectItem value={GenerateClassroomSupportBodyGradeLevel.Grade_5}>Grade 5</SelectItem>
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
                        <FormLabel className="font-semibold" style={{ color: "#142550" }}>
                          WIDA Level
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-wida-level">
                              <SelectValue placeholder="Select WIDA level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={GenerateClassroomSupportBodyWidaLevel["WIDA_1-2"]}>WIDA 1–2</SelectItem>
                            <SelectItem value={GenerateClassroomSupportBodyWidaLevel["WIDA_2-3"]}>WIDA 2–3</SelectItem>
                            <SelectItem value={GenerateClassroomSupportBodyWidaLevel["WIDA_3-4"]}>WIDA 3–4</SelectItem>
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
                      <FormLabel className="font-semibold" style={{ color: "#142550" }}>
                        What do your students need help with right now?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          data-testid="input-need"
                          placeholder="What do your students need help with right now?"
                          className="min-h-[120px] resize-none text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    data-testid="button-generate"
                    type="submit"
                    disabled={isPending}
                    className="px-8 py-2.5 text-base font-semibold text-white rounded-lg"
                    style={{ backgroundColor: "#C82C39" }}
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
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Loading */}
        {isPending && (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#142550" }} />
            <p className="text-sm font-medium" style={{ color: "#142550" }}>
              Preparing your classroom support...
            </p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <Card className="border border-red-200 bg-red-50">
            <CardContent className="pt-5 pb-4">
              <p className="text-sm font-medium text-red-700">
                {(error as Error)?.message || "Something went wrong. Please try again."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && !isPending && (
          <div data-testid="section-results" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: "#142550" }}>
                Classroom Support
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
                data-testid="button-copy-all"
                className="gap-1.5 text-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy All
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <SupportCard title="Simple Explanation">
                <p className="text-base leading-relaxed text-gray-800">{result.simpleExplanation}</p>
              </SupportCard>

              <SupportCard title="Key Vocabulary">
                <div className="flex flex-wrap gap-2">
                  {result.keyVocabulary.map((word, i) => (
                    <Badge
                      key={i}
                      className="text-sm px-3 py-1 font-medium rounded-full"
                      style={{ backgroundColor: "#142550", color: "#fff" }}
                    >
                      {word}
                    </Badge>
                  ))}
                </div>
              </SupportCard>

              <SupportCard title="Sentence Frames">
                <ul className="space-y-2">
                  {result.sentenceFrames.map((frame, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: "#C82C39" }}
                      />
                      <span className="text-base text-gray-800">{frame}</span>
                    </li>
                  ))}
                </ul>
              </SupportCard>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SupportCard title="Quick Activity">
                  <p className="text-base leading-relaxed text-gray-800">{result.quickActivity}</p>
                </SupportCard>

                <SupportCard title="Extension Question">
                  <p className="text-base leading-relaxed text-gray-800">{result.extensionQuestion}</p>
                </SupportCard>
              </div>

              <SupportCard title="Teacher Move">
                <p className="text-base leading-relaxed text-gray-800 font-medium">{result.teacherMove}</p>
              </SupportCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
