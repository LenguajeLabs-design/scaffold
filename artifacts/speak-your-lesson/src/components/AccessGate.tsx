/**
 * Full-screen access code gate.
 * Shown when the user hasn't entered a code yet for this session.
 * Validates against the API; on success, calls onUnlock(code).
 * "Try the demo" skips to local sample data without hitting the API.
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
      // Validate by pinging the API with a tiny probe — we piggyback on the
      // lesson-plan endpoint's 401 response to confirm the code is known.
      // We send a deliberately invalid body so it always returns early after
      // the auth check, costing no AI credits.
      const res = await fetch(resolveApiUrl("/api/lesson-plan/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: trimmed }),
      });

      if (res.status === 401) {
        setError("That code isn't recognized. Please check and try again.");
        return;
      }

      // Any other response (400 = bad body but valid code, 429, 200) means
      // the code passed the auth check.
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
            <span className="text-xl font-semibold tracking-tight">Scaffold</span>
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
            <label htmlFor="access-code" className="text-sm font-medium text-foreground">
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
                Checking...
              </>
            ) : (
              "Unlock"
            )}
          </Button>
        </form>

        {/* Demo option + contact */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Need a code?{" "}
            <a
              href="mailto:forozc1@gmail.com"
              className="text-primary hover:underline font-medium"
            >
              Email forozc1@gmail.com
            </a>
          </p>
          <button
            type="button"
            onClick={onDemo}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            data-testid="button-demo"
          >
            Or explore sample lesson plans (no code needed)
          </button>
        </div>

      </div>
    </div>
  );
}
