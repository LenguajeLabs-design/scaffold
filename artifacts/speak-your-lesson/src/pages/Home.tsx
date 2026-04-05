import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGenerateLessonPlan, GenerateLessonPlanBodyGradeLevel, GenerateLessonPlanBodyWidaBand } from "@workspace/api-client-react";
import { Loader2, BookOpen } from "lucide-react";
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

const formSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  gradeLevel: z.nativeEnum(GenerateLessonPlanBodyGradeLevel),
  widaBand: z.nativeEnum(GenerateLessonPlanBodyWidaBand),
  notes: z.string().min(5, "Planning notes are required"),
});

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

  const { mutate: generateLessonPlan, data: result, isPending, isError, error } = useGenerateLessonPlan();

  function onSubmit(values: z.infer<typeof formSchema>) {
    generateLessonPlan({ data: values });
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-white">
      <header className="bg-primary text-primary-foreground py-10 px-6 shadow-sm border-b-4 border-accent">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Speak Your Lesson Into Existence</h1>
            <p className="text-primary-foreground/80 mt-1 text-lg font-medium">Your dedicated co-teacher for multilingual classrooms.</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 py-12 grid gap-12">
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">Lesson Parameters</h2>
            <p className="text-muted-foreground mt-1">Provide your rough notes or voice transcript below to generate a tailored lesson plan.</p>
          </div>

          <Card className="shadow-md border-muted/60">
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-primary">Topic / Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Fractions, Photosynthesis" data-testid="input-topic" className="bg-white" {...field} />
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
                          <FormLabel className="font-semibold text-primary">Grade Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-grade-level" className="bg-white">
                                <SelectValue placeholder="Select a grade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(GenerateLessonPlanBodyGradeLevel).map((grade) => (
                                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
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
                          <FormLabel className="font-semibold text-primary">WIDA Band</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-wida-band" className="bg-white">
                                <SelectValue placeholder="Select WIDA band" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(GenerateLessonPlanBodyWidaBand).map(([key, value]) => (
                                <SelectItem key={value} value={value}>{value}</SelectItem>
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
                        <FormLabel className="font-semibold text-primary">Your Planning Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Paste your rough notes or voice transcript here..." 
                            className="min-h-[200px] resize-y bg-white text-base leading-relaxed" 
                            data-testid="input-notes"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-end pt-2">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full md:w-auto font-bold tracking-wide text-base bg-accent hover:bg-accent/90 text-white shadow-md hover:shadow-lg transition-all"
                      disabled={isPending}
                      data-testid="button-generate"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating Lesson Plan...
                        </>
                      ) : (
                        "Generate Lesson Plan"
                      )}
                    </Button>
                  </div>
                  
                  {isError && (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20 font-medium">
                      Failed to generate lesson plan. Please try again.
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </section>

        {isPending && !result && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-accent animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-primary">Crafting your lesson...</h3>
            <p className="text-muted-foreground">Structuring objectives, vocabulary, and activities for your learners.</p>
          </div>
        )}

        {result && (
          <section data-testid="section-results" className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="border-b-2 border-accent/20 pb-4 mb-8">
              <h2 className="text-3xl font-bold text-primary tracking-tight">{result.title}</h2>
              <div className="flex gap-3 mt-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20">{form.getValues().gradeLevel}</Badge>
                <Badge variant="secondary" className="bg-accent/10 text-accent font-semibold text-sm hover:bg-accent/20">{form.getValues().widaBand}</Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-primary shadow-sm">
                <CardHeader className="pb-3 bg-primary/5">
                  <CardTitle className="text-lg text-primary">Content Objective</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-base leading-relaxed">
                  {result.contentObjective}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent shadow-sm">
                <CardHeader className="pb-3 bg-accent/5">
                  <CardTitle className="text-lg text-accent">Language Objective</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-base leading-relaxed">
                  {result.languageObjective}
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg text-primary">Key Vocabulary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {result.keyVocabulary.map((vocab, i) => (
                    <Badge key={i} variant="outline" className="px-3 py-1.5 text-sm bg-white border-primary/20 text-primary font-medium shadow-sm">
                      {vocab}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm bg-primary text-white">
              <CardHeader className="pb-3 border-b border-white/20">
                <CardTitle className="text-lg">Sentence Frames</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {result.sentenceFrames.map((frame, i) => (
                    <li key={i} className="flex gap-3 items-start text-lg font-medium">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold mt-0.5">{i + 1}</span>
                      <span>{frame}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-primary border-b pb-2">Lesson Flow</h3>
              
              <Card className="shadow-sm overflow-hidden">
                <div className="border-l-4 border-primary">
                  <CardHeader className="pb-2 bg-muted/30">
                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Step 1</span>
                      Warm-Up
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 text-base leading-relaxed">
                    <div className="whitespace-pre-wrap">{result.warmUp}</div>
                  </CardContent>
                </div>
              </Card>

              <Card className="shadow-sm overflow-hidden">
                <div className="border-l-4 border-primary">
                  <CardHeader className="pb-2 bg-muted/30">
                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Step 2</span>
                      Main Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 text-base leading-relaxed">
                    <div className="whitespace-pre-wrap">{result.mainActivity}</div>
                  </CardContent>
                </div>
              </Card>

              <Card className="shadow-sm overflow-hidden">
                <div className="border-l-4 border-primary">
                  <CardHeader className="pb-2 bg-muted/30">
                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Step 3</span>
                      Speaking Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 text-base leading-relaxed">
                    <div className="whitespace-pre-wrap">{result.speakingActivity}</div>
                  </CardContent>
                </div>
              </Card>

              <Card className="shadow-sm overflow-hidden">
                <div className="border-l-4 border-primary">
                  <CardHeader className="pb-2 bg-muted/30">
                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Step 4</span>
                      Exit Ticket
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 text-base leading-relaxed">
                    <div className="whitespace-pre-wrap">{result.exitTicket}</div>
                  </CardContent>
                </div>
              </Card>
            </div>

            <Card className="shadow-sm border-t-4 border-t-accent bg-accent/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-accent">Teacher Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 text-base leading-relaxed text-muted-foreground font-medium italic">
                <div className="whitespace-pre-wrap">{result.teacherNotes}</div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
