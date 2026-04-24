import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ClassroomCopilot from "@/pages/ClassroomCopilot";

const queryClient = new QueryClient();

function NavBar() {
  const [location] = useLocation();

  const tabs = [
    { label: "Lesson Planner", href: "/" },
    { label: "Classroom Copilot", href: "/classroom-copilot" },
  ];

  return (
    <nav style={{ backgroundColor: "#0e1c3d" }} className="px-4">
      <div className="max-w-3xl mx-auto flex gap-1">
        {tabs.map((tab) => {
          const isActive = tab.href === "/" ? location === "/" : location.startsWith(tab.href);
          return (
            <Link key={tab.href} href={tab.href}>
              <span
                className={`inline-block px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors border-b-2 ${
                  isActive
                    ? "border-b-2 text-white"
                    : "text-white/55 hover:text-white/80 border-transparent"
                }`}
                style={isActive ? { borderColor: "#C82C39" } : {}}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
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
