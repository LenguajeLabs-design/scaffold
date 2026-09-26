import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  BookMarked,
  CheckCircle2,
  Loader2,
  LogOut,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resolveApiUrl } from "@/lib/api-base-url";
import { getCredential } from "@/lib/auth-session";

interface AdminAccountSummary {
  email: string;
  createdAt: string;
  updatedAt: string;
  marketingOptIn: boolean;
  savedLessonCount: number;
}

interface AdminAccountsResponse {
  summary: {
    totalAccounts: number;
    marketingOptInAccounts: number;
    savedLessons: number;
  };
  accounts: AdminAccountSummary[];
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminPage({ onLogout }: { onLogout: () => void }) {
  const [data, setData] = useState<AdminAccountsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    const token = getCredential();
    if (!token) {
      setError("Your admin sign-in has expired. Please sign in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(resolveApiUrl("/api/admin/accounts"), {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(15_000),
      });
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | AdminAccountsResponse
        | null;
      if (!response.ok) {
        throw new Error(
          body && "error" in body && body.error
            ? body.error
            : "The admin account list could not be loaded.",
        );
      }
      if (
        !body ||
        !("summary" in body) ||
        !Array.isArray(body.accounts)
      ) {
        throw new Error("The admin account list returned an unexpected response.");
      }
      setData(body as AdminAccountsResponse);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The admin account list could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue-strong)]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Scaffold administration
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Account overview
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              See who has created a verified account and whether they have saved
              lesson work. Lesson content is intentionally not shown here.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-10 gap-2"
              onClick={() => void loadAccounts()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh
            </Button>
            <Button type="button" variant="ghost" className="min-h-10 gap-2" onClick={onLogout}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </header>

        {error && (
          <div
            className="flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/[0.06] px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Account summary">
          <Card className="border-[var(--brand-blue)]/20 bg-card/90 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="h-4 w-4 text-[var(--brand-blue-strong)]" aria-hidden="true" />
                Verified accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-foreground">
              {data?.summary.totalAccounts ?? "—"}
            </CardContent>
          </Card>
          <Card className="border-[var(--brand-teal)]/25 bg-card/90 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MailCheck className="h-4 w-4 text-[var(--brand-teal-strong)]" aria-hidden="true" />
                Updates opted in
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-foreground">
              {data?.summary.marketingOptInAccounts ?? "—"}
            </CardContent>
          </Card>
          <Card className="border-[var(--brand-purple)]/25 bg-card/90 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <BookMarked className="h-4 w-4 text-[var(--brand-purple-strong)]" aria-hidden="true" />
                Saved lessons
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-foreground">
              {data?.summary.savedLessons ?? "—"}
            </CardContent>
          </Card>
        </section>

        <Card className="overflow-hidden border-border/80 bg-card/90 shadow-none">
          <CardHeader className="border-b border-border/70 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">People who signed up</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Verified Google accounts, ordered by signup date.
                </p>
              </div>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Loading accounts" />}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data?.accounts.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                No verified accounts yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium">Signed up</th>
                      <th className="px-5 py-3 font-medium">Last activity</th>
                      <th className="px-5 py-3 font-medium">Saved lessons</th>
                      <th className="px-5 py-3 font-medium">Updates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {data?.accounts.map((account) => (
                      <tr key={`${account.email}-${account.createdAt}`} className="align-top">
                        <td className="px-5 py-4 font-medium text-foreground">{account.email}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                          {formatDate(account.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                          {formatDate(account.updatedAt)}
                        </td>
                        <td className="px-5 py-4 text-foreground">{account.savedLessonCount}</td>
                        <td className="px-5 py-4">
                          {account.marketingOptIn ? (
                            <Badge className="gap-1 border-[var(--brand-teal)]/30 bg-[var(--brand-teal)]/10 text-[var(--brand-teal-strong)] hover:bg-[var(--brand-teal)]/10">
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Opted in
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Account emails are shown only to allowlisted administrators. Use this
          view for product operations and respect each person’s update preference.
        </p>
      </div>
    </main>
  );
}
