/**
 * Full-screen access code gate.
 * Shown when the user hasn't entered a code yet for this session.
 * Validates against the API; on success, calls onUnlock(code).
 * "Try the demo" skips to local sample data without hitting the API.
 */

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  Loader2,
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

  const [credential, setGoogleCredential] = useState<string | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const googleButton = useRef<HTMLDivElement>(null);
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-6">
        <div className="flex items-center gap-2.5 text-primary">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_8px_20px_rgba(15,45,74,0.10)] ring-1 ring-[var(--brand-blue)]/15">
            <ScaffoldMark />
          </span>
          <span className="text-xl font-semibold tracking-tight text-[var(--brand-indigo)]">
            Scaffold
          </span>
        </div>

        <div className="hidden items-center gap-7 text-sm font-medium text-[var(--brand-indigo)]/80 md:flex">
          <span>Lesson Planner</span>
          <span>Classroom Copilot</span>
          {!adminOnly && (
            <button
              type="button"
              onClick={onDemo}
              className="transition-colors hover:text-[var(--brand-indigo)]"
            >
              Explore sample
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 px-5 pb-10 pt-3 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-16">
        <section className="space-y-8">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-teal-strong)]">
              Practical support for multilingual learners
            </p>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--brand-indigo)] sm:text-5xl lg:text-6xl">
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

          {!adminOnly && (
            <div className="grid gap-3 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
              <p className="flex items-start gap-2">
                <ClipboardCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-teal-strong)]"
                  aria-hidden="true"
                />
                <span>Teacher judgment stays central.</span>
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-blue-strong)]"
                  aria-hidden="true"
                />
                <span>Student privacy comes first.</span>
              </p>
            </div>
          )}

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
                    Admin mode bypasses the public daily limit; emergency safety
                    ceilings still apply.
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
        </section>

        <section className="relative hidden min-h-[34rem] overflow-hidden rounded-[1.75rem] bg-[var(--brand-indigo)] shadow-[0_28px_90px_rgba(15,45,74,0.22)] lg:block">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(124,140,255,0.34) 1px, transparent 1px), linear-gradient(45deg, rgba(126,217,87,0.22) 1px, transparent 1px)",
              backgroundSize: "112px 112px, 72px 72px",
            }}
            aria-hidden="true"
          />
          <div className="absolute -right-16 top-16 h-44 w-44 rounded-[2rem] border border-[#7ED957]/45 bg-[#7ED957]/20 rotate-45" />
          <div className="absolute -bottom-20 right-20 h-56 w-56 rounded-full border border-[#FFD166]/60 bg-[#FFD166]/20" />
          <div className="absolute left-10 top-10 h-40 w-40 rounded-full border border-[#7C8CFF]/40 bg-[#7C8CFF]/15" />

          <div className="relative flex h-full min-h-[34rem] items-center justify-center p-8">
            <div className="w-full max-w-md rounded-[1.35rem] bg-white/96 p-6 shadow-[0_24px_60px_rgba(7,16,35,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Scaffold prepares
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    A guided draft built from your lesson notes.
                  </p>
                </div>
                <span className="rounded-full bg-[var(--brand-teal)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--brand-teal-strong)]">
                  Guided
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  "Learning goal",
                  "Language objective",
                  "Sentence frames",
                  "Teacher moves",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 p-3"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {item}
                    </span>
                    <CheckCircle2
                      className="h-5 w-5 text-[var(--brand-teal-strong)]"
                      aria-hidden="true"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
