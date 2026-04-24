import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ClassroomCopilot from "@/pages/ClassroomCopilot";

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

function NavBar() {
  const [location] = useLocation();

  const tabs = [
    { label: "Lesson Planner", href: "/" },
    { label: "Classroom Copilot", href: "/classroom-copilot" },
  ];

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0 text-primary hover:opacity-80 transition-opacity">
          <ScaffoldMark className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold tracking-tight">Scaffold</span>
        </Link>

        <div className="w-px h-4 bg-border" aria-hidden="true" />

        <div className="flex items-center gap-1">
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
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <NavBar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/classroom-copilot" component={ClassroomCopilot} />
        <Route component={NotFound} />
      </Switch>
    </>
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
