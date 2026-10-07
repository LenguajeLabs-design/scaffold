import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Check, Copy, BookOpenText } from "lucide-react";
import {
  copy,
  guidance,
  materials,
  languages,
  isLanguage,
  type Language,
} from "@/data/language-preview/copy";

const STORAGE_KEY = "scaffold-language-preview-v1";
type Preferences = Record<"app" | "guidance" | "materials", Language>;
const defaults: Preferences = { app: "es", guidance: "es", materials: "es" };
function readPreferences(): Preferences {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "null",
    );
    if (
      saved &&
      typeof saved === "object" &&
      "app" in saved &&
      "guidance" in saved &&
      "materials" in saved &&
      isLanguage(saved.app) &&
      isLanguage(saved.guidance) &&
      isLanguage(saved.materials)
    ) {
      return {
        app: saved.app,
        guidance: saved.app,
        materials: saved.materials,
      };
    }
  } catch {
    /* Preview remains usable without browser storage. */
  }
  return defaults;
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <div className="text-sm leading-7 text-foreground/90">{children}</div>
    </section>
  );
}
export default function LanguagePreview() {
  const [preferences, setPreferences] = useState<Preferences>(readPreferences);
  const [showEnglish, setShowEnglish] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [remembered, setRemembered] = useState(false);
  const ui = copy[preferences.app];
  const teacher = guidance[preferences.app];
  const teacherLabels = copy[preferences.app];
  function useLanguageThroughout(language: Language) {
    setPreferences({ app: language, guidance: language, materials: language });
    setShowEnglish(false);
  }
  const student = materials[preferences.materials];
  const studentLabels = copy[preferences.materials];
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      setRemembered(true);
    } catch {
      setRemembered(false);
    }
    setCopyStatus("idle");
  }, [preferences]);
  useEffect(() => {
    const previousLanguage = document.documentElement.lang;
    const previousTitle = document.title;
    document.documentElement.lang = preferences.app;
    document.title = `${ui.preview} · Scaffold`;
    return () => {
      document.documentElement.lang = previousLanguage;
      document.title = previousTitle;
    };
  }, [preferences.app, ui.preview]);
  async function copyMaterials() {
    try {
      await navigator.clipboard.writeText(
        `${studentLabels.task}\n${student.task}\n\n${studentLabels.frame}\n${student.frame}\n\n${studentLabels.partner}\n${student.partner}`,
      );
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }
  function comparison(content: ReactNode) {
    return showEnglish && preferences.guidance !== "en" ? (
      <div
        lang="en"
        className="mt-3 border-l-2 border-[var(--brand-blue)]/40 pl-4 text-sm leading-7 text-muted-foreground"
      >
        <p lang={preferences.app} className="mb-1 text-xs font-semibold">
          {ui.original}
        </p>
        {content}
      </div>
    ) : null;
  }
  return (
    <div
      lang={preferences.app}
      className="min-h-screen bg-background text-foreground"
    >
      <header className="border-b border-border/70 bg-card/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <a
            href={import.meta.env.BASE_URL}
            className="inline-flex min-h-11 items-center gap-3 rounded-lg text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={ui.back}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="scaffold-mark w-6" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="font-semibold">Scaffold</span>
          </a>
          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border/80 bg-background px-3 text-sm font-medium text-primary focus-within:ring-2 focus-within:ring-ring">
            <span className="sr-only">{ui.languageMenuLabel}</span>
            <select
              aria-label={ui.languageMenuLabel}
              value={preferences.app}
              onChange={(event) => {
                if (isLanguage(event.target.value)) {
                  useLanguageThroughout(event.target.value);
                }
              }}
              className="min-h-10 cursor-pointer bg-transparent pr-1 text-sm font-semibold focus-visible:outline-none"
            >
              {languages.map((language) => (
                <option
                  key={language.code}
                  value={language.code}
                  lang={language.code}
                >
                  {language.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6 sm:py-12">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue-strong)]">
            {ui.eyebrow}
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
            {ui.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {ui.intro}
          </p>
        </div>
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950">
          {ui.notice}
        </p>
        <section
          className="rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-6"
          lang={preferences.guidance}
          aria-labelledby="classroom-heading"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2
              id="classroom-heading"
              className="flex items-center gap-2 font-semibold"
            >
              <BookOpenText
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
              {teacherLabels.context}
            </h2>
            <span className="text-xs text-muted-foreground">
              {teacherLabels.grade}
            </span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Section title={teacherLabels.target}>
              <p lang={preferences.guidance}>{teacher.target}</p>
              {comparison(guidance.en.target)}
            </Section>
            <Section title={teacherLabels.evidence}>
              <p lang={preferences.guidance}>{teacher.evidence}</p>
              {comparison(guidance.en.evidence)}
            </Section>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            {teacherLabels.example}
          </p>
        </section>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <article
            lang={preferences.guidance}
            className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
          >
            <div className="h-1 bg-[var(--brand-blue)]" />
            <div className="space-y-6 p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-blue-strong)]">
                    {teacherLabels.teacher}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {teacherLabels.teacherSubtitle}
                  </h2>
                </div>
                <label
                  lang={preferences.app}
                  className="flex min-h-11 cursor-pointer items-center gap-2 text-xs leading-5"
                >
                  <input
                    type="checkbox"
                    checked={showEnglish}
                    onChange={(event) => setShowEnglish(event.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  {ui.compare}
                </label>
              </div>
              <Section title={teacherLabels.why}>
                <p lang={preferences.guidance}>{teacher.why}</p>
                {comparison(guidance.en.why)}
              </Section>
              <Section title={teacherLabels.try}>
                <ol
                  lang={preferences.guidance}
                  className="list-decimal space-y-3 pl-5"
                >
                  {teacher.steps.map((step) => (
                    <li key={step} className="pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
                {comparison(
                  <ol className="list-decimal space-y-2 pl-5">
                    {guidance.en.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>,
                )}
              </Section>
              <Section title={teacherLabels.ownership}>
                <p lang={preferences.guidance}>{teacher.ownership}</p>
                {comparison(guidance.en.ownership)}
              </Section>
              <div className="space-y-4 rounded-xl bg-[var(--brand-teal)]/10 p-4">
                <h3 className="font-semibold text-primary">
                  {teacherLabels.watch}
                </h3>
                <Section title={teacherLabels.fade}>
                  <p lang={preferences.guidance}>{teacher.fade}</p>
                  {comparison(guidance.en.fade)}
                </Section>
                <Section title={teacherLabels.adjust}>
                  <p lang={preferences.guidance}>{teacher.adjust}</p>
                  {comparison(guidance.en.adjust)}
                </Section>
              </div>
              <p className="text-xs leading-6 text-muted-foreground">
                {teacherLabels.note}
              </p>
            </div>
          </article>
          <article className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
            <div className="h-1 bg-[var(--brand-teal)]" />
            <div className="space-y-6 p-5 sm:p-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-teal-strong)]">
                  {ui.student}
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {ui.studentSubtitle}
                </h2>
                <p
                  lang={preferences.materials}
                  className="mt-2 text-xs text-muted-foreground"
                >
                  {
                    languages.find(
                      (language) => language.code === preferences.materials,
                    )?.name
                  }
                </p>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="student-materials-language"
                  className="block text-sm font-semibold"
                >
                  {ui.studentLanguageLabel}
                </label>
                <select
                  id="student-materials-language"
                  aria-describedby="student-materials-language-help"
                  value={preferences.materials}
                  onChange={(event) => {
                    const language = event.target.value;
                    if (!isLanguage(language)) return;
                    setPreferences((current) => ({
                      ...current,
                      materials: language,
                    }));
                  }}
                  className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {languages.map((language) => (
                    <option
                      key={language.code}
                      value={language.code}
                      lang={language.code}
                    >
                      {language.name}
                    </option>
                  ))}
                </select>
                <p
                  id="student-materials-language-help"
                  className="text-xs leading-5 text-muted-foreground"
                >
                  {ui.studentLanguageHelp}
                </p>
                {remembered && (
                  <p className="text-xs text-muted-foreground">
                    {ui.remembered}
                  </p>
                )}
              </div>
              <div lang={preferences.materials} className="space-y-6">
                <Section title={studentLabels.task}>
                  <p>{student.task}</p>
                </Section>
                <Section title={studentLabels.frame}>
                  <blockquote className="rounded-xl bg-[var(--brand-sun)]/15 p-4 text-base font-medium leading-8">
                    {student.frame}
                  </blockquote>
                </Section>
                <Section title={studentLabels.partner}>
                  <p>{student.partner}</p>
                </Section>
              </div>
              <button
                onClick={copyMaterials}
                type="button"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-input px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copyStatus === "copied" ? (
                  <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                {ui.copy}
              </button>
              <p role="status" className="text-xs text-muted-foreground">
                {copyStatus === "error"
                  ? ui.copyError
                  : copyStatus === "copied"
                    ? ui.copied
                    : ""}
              </p>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
