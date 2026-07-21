import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
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

const queryClient = new QueryClient();
const ACCESS_GATE_ENABLED =
  import.meta.env.VITE_ACCESS_GATE_ENABLED === "true";

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
    { label: "Lesson Planner", href: "/" },
    { label: "Classroom Copilot", href: "/classroom-copilot" },
  ];

  return (
    <nav className="border-b border-border/80 bg-card/95 backdrop-blur-xl print:hidden">
      <div className="max-w-4xl mx-auto px-4 min-h-16 flex items-center gap-2 sm:gap-5">
        <Link href="/" className="flex min-h-11 items-center gap-2 shrink-0 text-primary hover:opacity-80 transition-opacity">
          <ScaffoldMark className="w-5 h-5 text-primary" />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">Scaffold</span>
        </Link>

        <div className="w-px h-4 bg-border" aria-hidden="true" />

        <div className="flex items-center gap-1 flex-1">
          {tabs.map((tab) => {
            const isActive = tab.href === "/" ? location === "/" : location.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href}>
                <span
                  className={`inline-flex min-h-11 items-center rounded-xl px-2 text-xs font-medium transition-colors cursor-pointer sm:px-3 sm:text-sm ${
                    isActive
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {tab.label}
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
            title={isDemo ? "Exit sample mode" : "Change access code"}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isDemo ? "Sample mode" : "Change code"}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card print:hidden">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">

          <div className="flex items-center gap-2 shrink-0">
            <ScaffoldMark className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold tracking-tight text-primary">Scaffold</span>
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-foreground">Created by Federico Orozco</p>
            <p className="text-xs text-muted-foreground">EAL Educator | AI &amp; Multilingual Learning Innovation</p>
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
              Built using the WIDA framework to support multilingual learners, families, and educators.
            </p>
          </div>

          <p className="text-xs text-muted-foreground shrink-0 sm:text-right">
            Version 1.0
            <br />
            Updated May 2026
          </p>

        </div>
      </div>
    </footer>
  );
}

function Router() {
  const { accessCode, isDemo, isUnlocked, unlock, enterDemo, logout } = useAccessCode();
  const [, navigate] = useLocation();
  const { open: onboardingOpen, setOnboardingOpen } =
    useFirstVisitOnboarding();

  if (ACCESS_GATE_ENABLED && !isUnlocked) {
    return <AccessGate onUnlock={unlock} onDemo={enterDemo} />;
  }

  const activeAccessCode = accessCode ?? DEMO_CODE;
  const isSampleMode = !ACCESS_GATE_ENABLED || isDemo;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar
        isDemo={isSampleMode}
        onLogout={logout}
        showAccessControl={ACCESS_GATE_ENABLED}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={() => <Home accessCode={activeAccessCode} isDemo={isSampleMode} />} />
          <Route path="/classroom-copilot" component={() => <ClassroomCopilot accessCode={activeAccessCode} isDemo={isSampleMode} />} />
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
