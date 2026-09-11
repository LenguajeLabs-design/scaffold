/**
 * Full-screen access code gate.
 * Shown when the user hasn't entered a code yet for this session.
 * Validates against the API; on success, calls onUnlock(code).
 * "Try the demo" skips to local sample data without hitting the API.
 */

import { useState } from "react";
import { FlaskConical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveApiUrl } from "@/lib/api-base-url";

function ScaffoldMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 21 L3 16 L9 16 L9 11 L15 11 L15 6 L21 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 21 L21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface AccessGateProps {
  onUnlock: (code: string) => void;
  onDemo: () => void;
}

export function AccessGate({ onUnlock, onDemo }: AccessGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter your access code.");
      return;
    }

    setChecking(true);
    setError(null);

    try {
      const res = await fetch(resolveApiUrl("/api/access/validate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: trimmed }),
        signal: AbortSignal.timeout(90_000),
      });

      if (res.status === 401) {
        setError("That code isn't recognized. Please check and try again.");
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
      onUnlock(trimmed);
    } catch {
      setError("Couldn't reach the server. Please check your connection.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-primary">
            <ScaffoldMark className="w-7 h-7" />
            <span className="text-xl font-semibold tracking-tight">
              Scaffold
            </span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground mt-1">
              EAL Lesson Planning Assistant
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your school access code to continue.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="access-code"
              className="text-sm font-medium text-foreground"
            >
              Access Code
            </label>
            <Input
              id="access-code"
              type="text"
              placeholder="e.g. SUZHOU"
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
            disabled={checking}
            data-testid="button-unlock"
          >
            {checking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting to planning service...
              </>
            ) : (
              "Unlock and start planning"
            )}
          </Button>
        </form>

        {/* Sample option + contact */}
        <div className="space-y-3 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={onDemo}
            className="w-full"
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
