import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ClassroomCopilot from "@/pages/ClassroomCopilot";
import { AccessGate } from "@/components/AccessGate";
import { useAccessCode } from "@/hooks/use-access-code";
import { KeyRound } from "lucide-react";

const queryClient = new QueryClient();

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

function NavBar({ isDemo, onLogout }: { isDemo: boolean; onLogout: () => void }) {
  const [location] = useLocation();

  const tabs = [
    { label: "Lesson Planner", href: "/" },
    { label: "Classroom Copilot", href: "/classroom-copilot" },
  ];

  return (
    <nav className="border-b border-border bg-card print:hidden">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0 text-primary hover:opacity-80 transition-opacity">
          <ScaffoldMark className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold tracking-tight">Scaffold</span>
        </Link>

        <div className="w-px h-4 bg-border" aria-hidden="true" />

        <div className="flex items-center gap-1 flex-1">
          {tabs.map((tab) => {
            const isActive = tab.href === "/" ? location === "/" : location.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href}>
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
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
          onClick={onLogout}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/60"
          title={isDemo ? "Exit demo" : "Change access code"}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isDemo ? "Demo mode" : "Change code"}</span>
        </button>
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
                href="mailto:LenguajeLabs@proton.me"
                className="text-primary hover:underline"
              >
                LenguajeLabs@proton.me
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

  if (!isUnlocked) {
    return <AccessGate onUnlock={unlock} onDemo={enterDemo} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar isDemo={isDemo} onLogout={logout} />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={() => <Home accessCode={accessCode!} isDemo={isDemo} />} />
          <Route path="/classroom-copilot" component={() => <ClassroomCopilot accessCode={accessCode!} isDemo={isDemo} />} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
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
