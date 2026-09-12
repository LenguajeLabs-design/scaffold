/**
 * Full-screen access code gate.
 * Shown when the user hasn't entered a code yet for this session.
 * Validates against the API; on success, calls onUnlock(code).
 * "Try the demo" skips to local sample data without hitting the API.
 */

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  Languages,
  Loader2,
  MessageSquareQuote,
  Route,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveApiUrl } from "@/lib/api-base-url";

import { setCredential } from "@/lib/auth-session";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select: boolean;
          }): void;
          renderButton(
            element: HTMLElement,
            options: { theme: string; size: string },
          ): void;
        };
      };
    };
  }
}

function ScaffoldMark() {
  return (
    <span className="scaffold-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

interface AccessGateProps {
  onUnlock: (code: string, admin?: boolean) => void;
  onDemo: () => void;
  adminOnly?: boolean;
}

export function AccessGate({
  onUnlock,
  onDemo,
  adminOnly = false,
}: AccessGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [showAccessForm, setShowAccessForm] = useState(adminOnly);

  const [credential, setGoogleCredential] = useState<string | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const googleButton = useRef<HTMLDivElement>(null);
  const accessCodeInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let cancelled = false;
    let script: HTMLScriptElement | undefined;
    async function initialize() {
      try {
        const response = await fetch(resolveApiUrl("/api/access/config"), {
          signal: AbortSignal.timeout(30_000),
        });
        if (!response.ok) throw new Error();
        const config = await response.json();
        if (!config.googleClientId) throw new Error();
        if (cancelled) return;
        setDailyLimit(config.dailyLimit);
        const render = () => {
          if (cancelled || !googleButton.current) return;
          window.google?.accounts.id.initialize({
            client_id: config.googleClientId,
            auto_select: false,
            callback: ({ credential }) => {
              setGoogleCredential(credential);
              setError(null);
            },
          });
          window.google?.accounts.id.renderButton(googleButton.current, {
            theme: "outline",
            size: "large",
          });
        };
        if (window.google) render();
        else {
          script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.onload = render;
          script.onerror = () => {
            if (!cancelled)
              setError(
                "Google sign-in could not load. Please check your connection or try a sample lesson.",
              );
          };
          document.head.appendChild(script);
        }
      } catch {
        if (!cancelled)
          setError(
            "Sign-in is temporarily unavailable. You can still try a sample lesson.",
          );
      }
    }
    void initialize();
    return () => {
      cancelled = true;
      script?.remove();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    setChecking(true);
    setError(null);

    try {
      const res = await fetch(resolveApiUrl("/api/access/validate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(credential ? { Authorization: `Bearer ${credential}` } : {}),
        },
        body: JSON.stringify({ accessCode: trimmed }),
        signal: AbortSignal.timeout(90_000),
      });

      if (res.status === 401) {
        const details = await res.json();
        setError(
          details.error ?? "Please sign in again and check your beta code.",
        );
        return;
      }

      if (res.status === 429) {
        setError(
          "Too many sign-in attempts. Please wait a few minutes and try again.",
        );
        return;
      }
      if (!res.ok) {
        setError(
          "The planning service is unavailable. Please try again shortly.",
        );
        return;
      }
      const result: unknown = await res.json();
      if (
        !result ||
        typeof result !== "object" ||
        !("valid" in result) ||
        result.valid !== true
      ) {
        setError(
          "The planning service returned an unexpected response. Please try again.",
        );
        return;
      }
      if (credential) setCredential(credential);
      onUnlock(trimmed || "admin", "admin" in result && result.admin === true);
    } catch {
      setError("Couldn't reach the server. Please check your connection.");
    } finally {
      setChecking(false);
    }
  }

  function revealAccessForm() {
    setShowAccessForm(true);
    window.setTimeout(() => accessCodeInput.current?.focus(), 80);
  }

  const previewRows = [
    {
      icon: BookOpenCheck,
      title: "Learning goal",
      description: "Keep the lesson's thinking at the center",
      badge: "bg-[#7C8CFF]/18 text-[#5062E8]",
    },
    {
      icon: Languages,
      title: "Language objective",
      description: "Name the language students need to show understanding",
      badge: "bg-[#7ED957]/20 text-[#2F8F3D]",
    },
    {
      icon: MessageSquareQuote,
      title: "Sentence frames",
      description: "Give students words they can actually use",
      badge: "bg-[#FFD166]/28 text-[#A46E00]",
    },
    {
      icon: Route,
      title: "Teacher moves",
      description: "Know what to try, watch for, and fade",
      badge: "bg-[#7C8CFF]/18 text-[#5062E8]",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-[76rem] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-2.5 text-primary">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_8px_20px_rgba(15,45,74,0.10)] ring-1 ring-[var(--brand-blue)]/15">
            <ScaffoldMark />
          </span>
          <span className="text-xl font-semibold tracking-tight text-[var(--brand-indigo)]">
            Scaffold
          </span>
        </div>

        <div className="hidden items-center gap-6 text-sm font-medium text-[var(--brand-indigo)]/80 md:flex">
          <span>Lesson Planner</span>
          <span>Classroom Copilot</span>
          <button
            type="button"
            onClick={revealAccessForm}
            className="transition-colors hover:text-[var(--brand-indigo)]"
          >
            Sign in
          </button>
          {!adminOnly && (
            <button
              type="button"
              onClick={onDemo}
              className="transition-colors hover:text-[var(--brand-indigo)]"
            >
              Sample plan
            </button>
          )}
          <Button
            type="button"
            onClick={revealAccessForm}
            className="h-11 px-5 text-sm font-semibold shadow-[0_12px_28px_rgba(15,45,74,0.16)]"
          >
            Start planning
          </Button>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-[88rem] items-center gap-8 px-5 pb-10 pt-3 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:px-10 lg:pb-16">
        <section className="space-y-8 lg:py-10">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-teal-strong)]">
              Practical support for multilingual learners
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--brand-indigo)] sm:text-5xl lg:text-6xl">
                Same lesson.
                <br />
                More learners.
                <br />
                <span className="relative inline-block text-[#7C8CFF]">
                  Brighter possibilities.
                  <span
                    className="absolute -bottom-2 left-1 h-2 w-[92%] rounded-full bg-[#FFD166]/80"
                    aria-hidden="true"
                  />
                </span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {adminOnly
                  ? "Sign in with your allowlisted Google account to test Scaffold."
                  : "Turn rough lesson notes into practical language supports teachers can review, adapt, and trust."}
              </p>
            </div>
          </div>

          {!showAccessForm && !adminOnly && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={revealAccessForm}
                className="h-14 gap-2 px-7 text-base font-semibold shadow-[0_14px_30px_rgba(15,45,74,0.18)] sm:w-auto"
              >
                Start planning
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onDemo}
                className="h-14 border-border/80 bg-white px-7 text-base font-semibold text-[var(--brand-indigo)] shadow-sm hover:bg-white"
                data-testid="button-demo"
              >
                Explore sample plan
              </Button>
            </div>
          )}

          {!adminOnly && (
            <div className="grid max-w-xl gap-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <p className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7ED957]/18 text-[var(--brand-teal-strong)]">
                  <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>Teacher judgment stays central</span>
              </p>
              <span
                className="hidden h-10 w-px bg-border sm:block"
                aria-hidden="true"
              />
              <p className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7C8CFF]/14 text-[#5062E8]">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>Student privacy first</span>
              </p>
            </div>
          )}

          {showAccessForm && (
            <div className="max-w-xl rounded-[1.35rem] border border-white/85 bg-white/90 p-4 shadow-[0_22px_70px_rgba(15,45,74,0.12)] backdrop-blur-xl sm:p-5">
              <form
                onSubmit={handleSubmit}
                className="grid gap-3 sm:grid-cols-[1fr_auto]"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="access-code"
                    className="text-sm font-medium text-foreground"
                  >
                    {adminOnly ? "Admin access" : "Beta access code"}
                  </label>
                  <Input
                    ref={accessCodeInput}
                    id="access-code"
                    type="text"
                    placeholder={adminOnly ? "No code needed" : "e.g. SUZHOU"}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (error) setError(null);
                    }}
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    className="h-12 text-sm tracking-wider uppercase placeholder:uppercase placeholder:tracking-normal"
                    data-testid="input-access-code"
                    disabled={checking}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="submit"
                    className="h-12 w-full px-6 text-sm font-semibold shadow-[0_12px_28px_rgba(15,45,74,0.18)] sm:w-auto"
                    disabled={
                      checking ||
                      (adminOnly && !credential) ||
                      (!adminOnly && !code.trim())
                    }
                    data-testid="button-unlock"
                  >
                    {checking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : adminOnly ? (
                      "Enter Admin Mode"
                    ) : (
                      "Start planning"
                    )}
                  </Button>
                </div>
              </form>

              {error && (
                <p
                  className="mt-3 text-sm font-medium text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <div className="mt-4 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs leading-relaxed text-muted-foreground">
                  {!adminOnly && dailyLimit !== null && (
                    <p>
                      {dailyLimit} guided generations per day across both tools.
                      No sign-in required.
                    </p>
                  )}
                  {adminOnly && (
                    <p>
                      Admin mode bypasses the public daily limit; emergency
                      safety ceilings still apply.
                    </p>
                  )}
                  {!adminOnly && (
                    <p>
                      Need a code?{" "}
                      <a
                        href="mailto:forozc1@gmail.com"
                        className="font-medium text-primary hover:underline"
                      >
                        Email forozc1@gmail.com
                      </a>
                    </p>
                  )}
                </div>
                {!adminOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onDemo}
                    className="min-h-11 shrink-0 border-[var(--brand-teal)]/30 bg-[var(--brand-teal)]/[0.07] text-[var(--brand-teal-strong)] hover:border-[var(--brand-teal)]/45 hover:bg-[var(--brand-teal)]/[0.12] md:hidden"
                    data-testid="button-demo"
                  >
                    <FlaskConical className="h-4 w-4" aria-hidden="true" />
                    Explore a sample plan
                  </Button>
                )}
              </div>

              {adminOnly ? (
                <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
                  <p className="text-xs text-muted-foreground">
                    Google admin sign-in
                  </p>
                  <div
                    ref={googleButton}
                    aria-label="Sign in with Google for admin testing"
                  />
                  {credential && (
                    <p className="text-xs text-muted-foreground">
                      Admin sign-in ready.
                    </p>
                  )}
                </div>
              ) : (
                <a
                  href="/scaffold/admin"
                  className="mt-4 block text-xs text-muted-foreground hover:text-primary hover:underline"
                >
                  Admin testing link
                </a>
              )}
            </div>
          )}
        </section>

        <section className="scaffold-geometric-accent relative hidden min-h-[40rem] rounded-[2rem] shadow-[0_28px_90px_rgba(15,45,74,0.22)] lg:block">
          <div className="scaffold-geometric-grid" aria-hidden="true" />
          <div className="scaffold-geometric-spark" aria-hidden="true" />

          <div className="relative flex h-full min-h-[40rem] items-center justify-center p-10">
            <div className="w-full max-w-lg rounded-[1.5rem] bg-white/95 p-7 shadow-[0_24px_60px_rgba(7,16,35,0.22)] backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-foreground">
                    Scaffold prepares
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    A guided draft built from your lesson notes.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-teal)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--brand-teal-strong)]">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Reviewable
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {previewRows.map(
                  ({ icon: Icon, title, description, badge }) => (
                    <div
                      key={title}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-white p-3.5 shadow-[0_8px_24px_rgba(15,45,74,0.045)]"
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${badge}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">
                          {title}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {description}
                        </span>
                      </span>
                      <span
                        className="flex h-6 w-11 shrink-0 items-center rounded-full bg-[var(--brand-teal)] px-1 shadow-inner"
                        aria-hidden="true"
                      >
                        <span className="ml-auto flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-[var(--brand-teal-strong)] shadow-sm">
                          <CheckCircle2 className="h-3 w-3" />
                        </span>
                      </span>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-5 rounded-xl border border-[#FFD166]/35 bg-[#FFD166]/12 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A46E00]">
                  Planning basis
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Grade, WIDA range, lesson notes, and teacher review.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
