import {
  Switch,
  Route,
  Router as WouterRouter,
  Link,
  useLocation,
} from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ClassroomCopilot from "@/pages/ClassroomCopilot";
import { AccessGate } from "@/components/AccessGate";
import {
  OnboardingDialog,
  useFirstVisitOnboarding,
} from "@/components/OnboardingDialog";
import { DEMO_CODE, useAccessCode } from "@/hooks/use-access-code";
import { HelpCircle, KeyRound } from "lucide-react";

const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
const ACCESS_GATE_ENABLED =
  import.meta.env.VITE_ACCESS_GATE_ENABLED !== "false";

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
  onLogout,
  showAccessControl,
  onOpenOnboarding,
}: {
  isDemo: boolean;
  onLogout: () => void;
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
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
              >
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
            onClick={onLogout}
            className="shrink-0 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title={isDemo ? "Use an access code" : "Sign out"}
            aria-label={isDemo ? "Use an access code" : "Sign out"}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isDemo ? "Use access code" : "Sign out"}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-white/70 bg-card/70 backdrop-blur-xl print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white ring-1 ring-[var(--brand-blue)]/15">
              <ScaffoldMark className="w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-primary">
              Scaffold
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Created by Federico Orozco
            </p>
            <p className="text-xs text-muted-foreground">
              EAL Educator | AI &amp; Multilingual Learning Innovation
            </p>
            <p className="text-xs text-muted-foreground">
              Contact:{" "}
              <a
                href="mailto:forozc1@gmail.com"
                className="text-primary hover:underline"
              >
                forozc1@gmail.com
              </a>
            </p>
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              Built using the WIDA framework to support multilingual learners,
              families, and educators.
            </p>
          </div>

          <p className="text-xs text-muted-foreground shrink-0 sm:text-right">
            Version 2.0
            <br />
            Updated September 2026
          </p>
        </div>
      </div>
    </footer>
  );
}

function Router() {
  const { accessCode, isAdmin, isDemo, isUnlocked, unlock, enterDemo, logout } =
    useAccessCode();
  const [, navigate] = useLocation();
  const { open: onboardingOpen, setOnboardingOpen } = useFirstVisitOnboarding();
  const [location] = useLocation();
  const adminOnly = location === "/admin";

  if (ACCESS_GATE_ENABLED && !isUnlocked) {
    return <AccessGate onUnlock={unlock} onDemo={enterDemo} adminOnly={adminOnly} />;
  }

  const activeAccessCode = accessCode ?? DEMO_CODE;
  const isSampleMode = !ACCESS_GATE_ENABLED || isDemo;

  return (
    <div className="min-h-screen flex flex-col bg-background/40">
      <NavBar
        isDemo={isSampleMode}
        onLogout={logout}
        showAccessControl={ACCESS_GATE_ENABLED}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />
      {isAdmin && <div role="status" className="mx-auto mt-3 w-full max-w-4xl rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm print:hidden"><strong>Admin Mode</strong> · Unlimited testing access<span className="block text-xs text-muted-foreground">Emergency usage limits still apply.</span></div>}
      <div className="flex-1">
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
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
