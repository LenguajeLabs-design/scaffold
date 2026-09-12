/**
 * Full-screen access code gate.
 * Shown when the user hasn't entered a code yet for this session.
 * Validates against the API; on success, calls onUnlock(code).
 * "Try the demo" skips to local sample data without hitting the API.
 */

import { useState, useEffect, useRef } from "react";
import { FlaskConical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveApiUrl } from "@/lib/api-base-url";

import { setCredential } from "@/lib/auth-session";

declare global {
  interface Window {
    google?: { accounts: { id: {
      initialize(options: { client_id: string; callback: (response: { credential: string }) => void; auto_select: boolean }): void;
      renderButton(element: HTMLElement, options: { theme: string; size: string }): void;
    } } };
  }
}

function ScaffoldMark() {
  return <span className="scaffold-mark" aria-hidden="true"><span /><span /><span /></span>;
}

interface AccessGateProps {
  onUnlock: (code: string, admin?: boolean) => void;
  onDemo: () => void;
  adminOnly?: boolean;
}

export function AccessGate({ onUnlock, onDemo, adminOnly = false }: AccessGateProps) {
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
        const response = await fetch(resolveApiUrl("/api/access/config"), { signal: AbortSignal.timeout(30_000) });
        if (!response.ok) throw new Error();
        const config = await response.json();
        if (!config.googleClientId) throw new Error();
        if (cancelled) return;
        setDailyLimit(config.dailyLimit);
        const render = () => {
          if (cancelled || !googleButton.current) return;
          window.google?.accounts.id.initialize({ client_id: config.googleClientId, auto_select: false,
            callback: ({ credential }) => { setGoogleCredential(credential); setError(null); } });
          window.google?.accounts.id.renderButton(googleButton.current, { theme: "outline", size: "large" });
        };
        if (window.google) render();
        else {
          script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.onload = render;
          script.onerror = () => { if (!cancelled) setError("Google sign-in could not load. Please check your connection or try a sample lesson."); };
          document.head.appendChild(script);
        }
      } catch { if (!cancelled) setError("Sign-in is temporarily unavailable. You can still try a sample lesson."); }
    }
    void initialize();
    return () => { cancelled = true; script?.remove(); };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    setChecking(true);
    setError(null);

    try {
      const res = await fetch(resolveApiUrl("/api/access/validate"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(credential ? { Authorization: `Bearer ${credential}` } : {}) },
        body: JSON.stringify({ accessCode: trimmed }),
        signal: AbortSignal.timeout(90_000),
      });

      if (res.status === 401) {
        const details = await res.json();
        setError(details.error ?? "Please sign in again and check your beta code.");
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-[var(--brand-teal)]/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-12 h-72 w-72 rounded-full bg-[var(--brand-purple)]/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md space-y-8 rounded-[2rem] border border-white/80 bg-card/85 p-6 shadow-[0_28px_80px_rgba(30,27,75,0.12)] backdrop-blur-xl sm:p-9">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2.5 text-primary">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-indigo)] shadow-[0_10px_24px_rgba(15,45,74,0.18)]">
              <ScaffoldMark />
            </span>
            <span className="text-2xl font-semibold tracking-tight text-[var(--brand-indigo)]">
              Scaffold
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-teal-strong)]">
              Made for multilingual classrooms
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
              Plan stronger EAL lessons
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {adminOnly ? "Sign in with your allowlisted Google account to test Scaffold." : "Enter the beta code to start planning, or explore a prepared sample."}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {!adminOnly && dailyLimit !== null && <p className="text-xs text-muted-foreground">Beta teachers get {dailyLimit} lesson generations per day across both tools. No sign-in is required.</p>}
            {adminOnly && <p className="text-xs text-muted-foreground">Admin mode bypasses the public daily limit; emergency safety ceilings still apply.</p>}
            <label
              htmlFor="access-code"
              className="text-sm font-medium text-foreground"
            >
              Beta Access Code
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
              className="text-sm tracking-wider uppercase placeholder:uppercase placeholder:tracking-normal"
              data-testid="input-access-code"
              disabled={checking}
            />
            {error && (
              <p className="text-sm text-destructive font-medium" role="alert">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full text-sm font-semibold"
            disabled={checking || (adminOnly && !credential) || (!adminOnly && !code.trim())}
            data-testid="button-unlock"
          >
            {checking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting to planning service...
              </>
            ) : (
              adminOnly ? "Enter Admin Mode" : "Unlock and start planning"
            )}
          </Button>
        </form>

        {adminOnly ? (
          <div className="space-y-2 border-t border-border/60 pt-4 text-center">
            <p className="text-xs text-muted-foreground">Google admin sign-in</p>
            <div ref={googleButton} aria-label="Sign in with Google for admin testing" />
            {credential && <p className="text-xs text-muted-foreground">Admin sign-in ready.</p>}
          </div>
        ) : (
          <a href="/scaffold/admin" className="block text-center text-xs text-muted-foreground hover:text-primary hover:underline">Admin testing link</a>
        )}

        {/* Sample option + contact */}
        <div className="space-y-3 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={onDemo}
            className="w-full border-[var(--brand-teal)]/30 bg-[var(--brand-teal)]/[0.07] text-[var(--brand-teal-strong)] hover:border-[var(--brand-teal)]/45 hover:bg-[var(--brand-teal)]/[0.12]"
            data-testid="button-demo"
          >
            <FlaskConical className="h-4 w-4" aria-hidden="true" />
            Try a sample lesson
          </Button>
          <p className="text-xs text-muted-foreground">
            Need a code?{" "}
            <a
              href="mailto:forozc1@gmail.com"
              className="text-primary hover:underline font-medium"
            >
              Email forozc1@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
