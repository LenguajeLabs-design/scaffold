import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { LessonPlan } from "@workspace/api-client-react";
import { clearCredential, getCredential, setCredential } from "@/lib/auth-session";
import { resolveApiUrl } from "@/lib/api-base-url";
import { getStoredAccessCode } from "@/hooks/use-access-code";

export interface AccountLesson {
  id: string;
  savedAt: string;
  title: string;
  gradeLevel: string;
  languageSupportLevel: string;
  topic: string;
  unitProfile?: string;
  lesson: LessonPlan;
}

interface AccountProfile {
  email: string;
  marketingOptIn: boolean;
}

interface AccountSessionValue {
  account: AccountProfile | null;
  lessons: AccountLesson[];
  isLoading: boolean;
  error: string | null;
  signIn: (credential: string) => Promise<AccountProfile>;
  saveLesson: (input: {
    lesson: AccountLesson;
    marketingOptIn?: boolean;
  }) => Promise<AccountLesson>;
  signOut: () => void;
}

const AccountSessionContext = createContext<AccountSessionValue | null>(null);

async function parseResponse(response: Response): Promise<Record<string, unknown>> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof body === "object" && body && "error" in body && typeof body.error === "string"
        ? body.error
        : "Your account could not be reached. Please try again.",
    );
  }
  return body as Record<string, unknown>;
}

function accountHeaders(token: string): Record<string, string> {
  const accessCode = getStoredAccessCode();
  return {
    Authorization: `Bearer ${token}`,
    ...(accessCode ? { "X-Scaffold-Access-Code": accessCode } : {}),
  };
}

export function AccountSessionProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<AccountProfile | null>(null);
  const [lessons, setLessons] = useState<AccountLesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccount = useCallback(async (token: string): Promise<AccountProfile> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(resolveApiUrl("/api/account/lessons"), {
        headers: accountHeaders(token),
        signal: AbortSignal.timeout(30_000),
      });
      const body = await parseResponse(response);
      const nextAccount = body.account as AccountProfile;
      const nextLessons = Array.isArray(body.lessons) ? (body.lessons as AccountLesson[]) : [];
      setAccount(nextAccount);
      setLessons(nextLessons);
      return nextAccount;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Your account could not be reached. Please try again.";
      setError(message);
      throw caught;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (token: string) => {
    setCredential(token);
    return loadAccount(token);
  }, [loadAccount]);

  const saveLesson = useCallback(async ({ lesson, marketingOptIn = false }: {
    lesson: AccountLesson;
    marketingOptIn?: boolean;
  }) => {
    const token = getCredential();
    if (!token) throw new Error("Sign in with Google before saving this lesson.");
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(resolveApiUrl("/api/account/lessons"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...accountHeaders(token),
        },
        body: JSON.stringify({ ...lesson, marketingOptIn }),
        signal: AbortSignal.timeout(30_000),
      });
      const body = await parseResponse(response);
      const saved = body.lesson as AccountLesson;
      setAccount(body.account as AccountProfile);
      setLessons((previous) => [saved, ...previous.filter((item) => item.id !== saved.id)]);
      return saved;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Your lesson could not be saved. Please try again.";
      setError(message);
      throw caught;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    clearCredential();
    setAccount(null);
    setLessons([]);
    setError(null);
  }, []);

  useEffect(() => {
    const handleSignedIn = () => {
      const token = getCredential();
      if (token) void loadAccount(token).catch(() => undefined);
    };
    const handleSignedOut = () => {
      setAccount(null);
      setLessons([]);
    };

    window.addEventListener("scaffold-authenticated", handleSignedIn);
    window.addEventListener("scaffold-signout", handleSignedOut);
    const token = getCredential();
    if (token) void loadAccount(token).catch(() => undefined);

    return () => {
      window.removeEventListener("scaffold-authenticated", handleSignedIn);
      window.removeEventListener("scaffold-signout", handleSignedOut);
    };
  }, [loadAccount]);

  const value = useMemo(
    () => ({ account, lessons, isLoading, error, signIn, saveLesson, signOut }),
    [account, lessons, isLoading, error, signIn, saveLesson, signOut],
  );

  return <AccountSessionContext.Provider value={value}>{children}</AccountSessionContext.Provider>;
}

export function useAccountSession(): AccountSessionValue {
  const value = useContext(AccountSessionContext);
  if (!value) throw new Error("useAccountSession must be used inside AccountSessionProvider");
  return value;
}
