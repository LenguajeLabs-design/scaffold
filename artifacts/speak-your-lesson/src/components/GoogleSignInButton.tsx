import { useEffect, useRef, useState } from "react";
import { resolveApiUrl } from "@/lib/api-base-url";

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
            options: {
              theme: string;
              size: string;
              text?: string;
              width?: string;
            },
          ): void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void | Promise<void>;
  label?: string;
}

export function GoogleSignInButton({
  onCredential,
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  const button = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const [error, setError] = useState<string | null>(null);

  callbackRef.current = onCredential;

  useEffect(() => {
    let cancelled = false;
    let script: HTMLScriptElement | undefined;

    async function initialize() {
      try {
        const response = await fetch(resolveApiUrl("/api/access/config"), {
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) throw new Error("config");
        const config = await response.json();
        if (!config.googleClientId) throw new Error("missing-client-id");

        const render = () => {
          if (cancelled || !button.current || !window.google) return;
          window.google.accounts.id.initialize({
            client_id: config.googleClientId,
            auto_select: false,
            callback: ({ credential }) => {
              void Promise.resolve(callbackRef.current(credential)).catch(() => {
                if (!cancelled) {
                  setError("We couldn’t connect that Google account. Please try again.");
                }
              });
            },
          });
          window.google.accounts.id.renderButton(button.current, {
            theme: "outline",
            size: "large",
            text: "continue_with",
            width: "300",
          });
        };

        if (window.google) {
          render();
          return;
        }

        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = render;
        script.onerror = () => {
          if (!cancelled) setError("Google sign-in could not load. Please try again.");
        };
        document.head.appendChild(script);
      } catch {
        if (!cancelled) {
          setError("Google sign-in is not available in this preview yet.");
        }
      }
    }

    void initialize();
    return () => {
      cancelled = true;
      script?.remove();
    };
  }, []);

  return (
    <div className="space-y-2">
      <div ref={button} aria-label={label} />
      {error && (
        <p className="text-xs leading-relaxed text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
