import { Link } from "@tanstack/react-router";
import { Radar } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
            <Radar className="h-4 w-4 text-primary" />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            TruthTrail<span className="text-primary"> AI</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/how-it-works"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            How it works
          </Link>
          <Link
            to="/agents"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Agents
          </Link>
          <Link
            to="/"
            hash="check"
            className="ml-2 rounded-md bg-primary px-3.5 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Check a claim
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>TruthTrail AI — evidence you can audit, not answers you must trust.</p>
        <p className="font-mono">Demo mode · agent results are simulated</p>
      </div>
    </footer>
  );
}
