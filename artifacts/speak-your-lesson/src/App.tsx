import {
  Switch,
  Route,
  Router as WouterRouter,
  Link,
  useLocation,
} from "wouter";
import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ClassroomCopilot from "@/pages/ClassroomCopilot";
import AdminPage from "@/pages/AdminPage";
import Legal from "@/pages/Legal";
import LandingPreview from "@/pages/LandingPreview";
import { AccessGate } from "@/components/AccessGate";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import {
  AccountSessionProvider,
  useAccountSession,
} from "@/components/account-session";
import {
  OnboardingDialog,
  useFirstVisitOnboarding,
} from "@/components/OnboardingDialog";
import { DEMO_CODE, useAccessCode } from "@/hooks/use-access-code";
import { resolveApiUrl } from "@/lib/api-base-url";
import { trackFunnelEvent } from "@/lib/analytics";
import { HelpCircle, KeyRound } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: false } },
});
const ACCESS_GATE_ENABLED =
  import.meta.env.VITE_ACCESS_GATE_ENABLED !== "false";

const LanguagePreview = import.meta.env.DEV
  ? lazy(() => import("@/pages/LanguagePreview"))
  : null;

function ScaffoldMark({ className }: { className?: string }) {
  return (
    <span className={`scaffold-mark ${className ?? ""}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function NavBar({
  isDemo,
  isAccountSignedIn,
  onLogout,
  onOpenAccount,
  showAccessControl,
  onOpenOnboarding,
}: {
  isDemo: boolean;
  isAccountSignedIn: boolean;
  onLogout: () => void;
  onOpenAccount: () => void;
  showAccessControl: boolean;
  onOpenOnboarding: () => void;
}) {
  const [location] = useLocation();

  const tabs = [
    { label: "Lesson Planner", shortLabel: "Planner", href: "/" },
    {
      label: "Classroom Copilot",
      shortLabel: "Copilot",
      href: "/classroom-copilot",
    },
    ...(import.meta.env.DEV
      ? [
          {
            label: "Language preview",
            shortLabel: "Languages",
            href: "/language-preview",
          },
        ]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-white/80 bg-background/85 shadow-[0_1px_0_rgba(15,45,74,0.05)] backdrop-blur-xl print:hidden">
      <div className="max-w-6xl mx-auto px-4 min-h-[4.5rem] flex items-center gap-2 sm:gap-5">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 shrink-0 text-primary hover:opacity-80 transition-opacity"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_8px_20px_rgba(15,45,74,0.10)] ring-1 ring-[var(--brand-blue)]/15">
            <ScaffoldMark className="w-5" />
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">
            Scaffold
          </span>
        </Link>

        <div className="flex items-center gap-1 flex-1">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? location === "/"
                : location.startsWith(tab.href);
            const content = (
              <span
                className={`inline-flex min-h-11 items-center rounded-xl px-2 text-xs font-medium transition-colors cursor-pointer sm:px-3 sm:text-sm ${
                  isActive
                    ? "bg-card text-primary shadow-sm ring-1 ring-border/70"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            );
            if (tab.href === "/language-preview") {
              return (
                <a
                  key={tab.href}
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                >
                  {content}
                </a>
              );
            }
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
              >
                {content}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenOnboarding}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
          aria-label="First time here? Open the walkthrough"
          data-testid="button-onboarding"
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          <span className="hidden lg:inline">First time here?</span>
        </button>

        {showAccessControl && (
          <button
            onClick={isDemo || isAccountSignedIn ? onLogout : onOpenAccount}
            className="shrink-0 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title={
              isDemo
                ? "Use an access code"
                : isAccountSignedIn
                  ? "Sign out"
                  : "Sign in"
            }
            aria-label={
              isDemo
                ? "Use an access code"
                : isAccountSignedIn
                  ? "Sign out"
                  : "Sign in"
            }
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isDemo
                ? "Use access code"
                : isAccountSignedIn
                  ? "Sign out"
                  : "Sign in"}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}

function AccountAccessDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { signIn, error } = useAccountSession();
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handleCredential(credential: string) {
    setIsSigningIn(true);
    try {
      await signIn(credential);
      onOpenChange(false);
    } finally {
      setIsSigningIn(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in to Scaffold"
    >
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue-strong)]">
              Your Scaffold account
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              See your saved lessons anywhere
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sign in with Google to open lessons you saved on another device.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="min-h-10 rounded-lg px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Close
          </button>
        </div>
        <div className="mt-6 space-y-3">
          <GoogleSignInButton onCredential={handleCredential} />
          {isSigningIn && (
            <p className="text-xs text-muted-foreground">
              Loading your saved lessons…
            </p>
          )}
          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const lenguajeLabsSites = [
    {
      name: "My Multilingual Family",
      domain: "mymultilingualfamily.com",
      href: "https://www.mymultilingualfamily.com",
    },
    {
      name: "ReadLinguaFlow",
      domain: "readlinguaflow.com",
      href: "https://www.readlinguaflow.com",
    },
    {
      name: "Federico Orozco",
      domain: "federicoorozco.co",
      href: "https://www.federicoorozco.co",
    },
    {
      name: "Lingua Strategies",
      domain: "lenguajelabs-design.github.io",
      href: "https://lenguajelabs-design.github.io/Lingua-Strategies",
    },
  ];

  return (
    <footer className="ll-footer mt-16 print:hidden">
      <div className="ll-footer__main">
        <div className="ll-footer__intro">
          <Link className="ll-footer__brand" href="/">
            <span className="ll-footer__logo">
              <ScaffoldMark className="w-5" />
            </span>
            <span>Scaffold</span>
          </Link>
          <p>
            Thoughtful planning support for educators of multilingual learners.
          </p>
          <Link className="ll-footer__about" href="/about">
            About Scaffold and its methodology
          </Link>
        </div>

        <div className="ll-footer__sites">
          <p className="ll-footer__label" id="lenguajeLabsSites">
            More from Lenguaje Labs
          </p>
          <nav className="ll-footer__links" aria-labelledby="lenguajeLabsSites">
            {lenguajeLabsSites.map((site) => (
              <a
                href={site.href}
                key={site.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>
                  <strong>{site.name}</strong>
                  <small>{site.domain}</small>
                </span>
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="ll-footer__bottom">
        <span>© 2026 Federico Orozco / Lenguaje Labs</span>
        <nav aria-label="Legal and product information">
          <Link href="/about#about">About</Link>
          <Link href="/about#disclaimer">Disclaimer</Link>
          <Link href="/about#terms">Terms</Link>
          <Link href="/about#privacy">Privacy</Link>
        </nav>
        <span>Version 2.1 · Made for educators, with care.</span>
      </div>
    </footer>
  );
}

function Router() {
  const { accessCode, isAdmin, isDemo, isUnlocked, unlock, enterDemo, logout } =
    useAccessCode();
  const [, navigate] = useLocation();
  const { open: onboardingOpen, setOnboardingOpen } = useFirstVisitOnboarding();
  const { account } = useAccountSession();
  const [location] = useLocation();
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const adminOnly = location === "/admin" || location.endsWith("/admin");
  const isLandingPreview =
    location === "/landing-preview" || location.endsWith("/landing-preview");
  const [requireAccessCode, setRequireAccessCode] = useState(false);

  useEffect(() => {
    if (!ACCESS_GATE_ENABLED || adminOnly || isLandingPreview) return;
    let cancelled = false;
    void fetch(resolveApiUrl("/api/access/config"), {
      signal: AbortSignal.timeout(10_000),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((config) => {
        if (!cancelled)
          setRequireAccessCode(Boolean(config?.requireAccessCode));
      })
      .catch(() => {
        // If the config endpoint is unavailable, keep the public path open.
        // The API remains authoritative for private-beta enforcement.
        if (!cancelled) setRequireAccessCode(false);
      });
    return () => {
      cancelled = true;
    };
  }, [adminOnly, isLandingPreview]);

  if (isLandingPreview) {
    return (
      <LandingPreview
        onExploreSample={() => {
          trackFunnelEvent("sample_opened", "landing");
          enterDemo();
          setOnboardingOpen(false);
          navigate("/");
        }}
        onStartPlanning={() => navigate("/")}
        onStartFromMaterials={() => navigate("/?start=materials")}
      />
    );
  }

  if (adminOnly && isAdmin) {
    return (
      <AdminPage
        onLogout={() => {
          logout();
          navigate("/");
        }}
      />
    );
  }

  if (adminOnly || (ACCESS_GATE_ENABLED && requireAccessCode && !isUnlocked)) {
    return (
      <AccessGate
        onUnlock={(code, admin) => {
          unlock(code, admin);
          if (admin) navigate(adminOnly ? "/admin" : "/");
        }}
        onDemo={() => {
          trackFunnelEvent("sample_opened", "landing");
          enterDemo();
          setOnboardingOpen(false);
        }}
        adminOnly={adminOnly}
      />
    );
  }

  const activeAccessCode = accessCode ?? (isDemo ? DEMO_CODE : "public");
  const isSampleMode = !ACCESS_GATE_ENABLED || isDemo;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background/40">
      <div className="scaffold-workspace-accent" aria-hidden="true" />
      <NavBar
        isDemo={isSampleMode}
        isAccountSignedIn={Boolean(account)}
        onLogout={logout}
        onOpenAccount={() => setAccountDialogOpen(true)}
        showAccessControl={ACCESS_GATE_ENABLED}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />
      {isAdmin && (
        <div
          role="status"
          className="mx-auto mt-3 w-full max-w-4xl rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm print:hidden"
        >
          <strong>Admin Mode</strong> · Unlimited testing access
          <span className="block text-xs text-muted-foreground">
            Emergency usage limits still apply.
          </span>
        </div>
      )}
      <div className="relative z-10 flex-1">
        <Switch>
          <Route
            path="/"
            component={() => (
              <Home accessCode={activeAccessCode} isDemo={isSampleMode} />
            )}
          />
          <Route
            path="/classroom-copilot"
            component={() => (
              <ClassroomCopilot
                accessCode={activeAccessCode}
                isDemo={isSampleMode}
              />
            )}
          />
          {LanguagePreview && (
            <Route
              path="/language-preview"
              component={() => (
                <Suspense fallback={<p className="p-8">Loading preview…</p>}>
                  <LanguagePreview />
                </Suspense>
              )}
            />
          )}
          <Route path="/about" component={Legal} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
      <OnboardingDialog
        isSampleMode={isSampleMode}
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        onStart={() => {
          setOnboardingOpen(false);
          navigate("/");
          window.setTimeout(() => {
            document
              .querySelector<HTMLInputElement>('[data-testid="input-topic"]')
              ?.focus();
          }, 100);
        }}
      />
      <AccountAccessDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
      />
    </div>
  );
}

function App() {
  if (
    LanguagePreview &&
    window.location.pathname === `${import.meta.env.BASE_URL}language-preview`
  ) {
    return (
      <Suspense fallback={<p className="p-8">Loading preview…</p>}>
        <LanguagePreview />
      </Suspense>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AccountSessionProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AccountSessionProvider>
    </QueryClientProvider>
  );
}

export default App;
