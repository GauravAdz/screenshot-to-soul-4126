import { Link } from "@tanstack/react-router";
import { ShieldCheck, Activity } from "lucide-react";

export function SiteHeader() {
  const link = "rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground";
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
            <Activity className="h-4 w-4" />
          </span>
          Clearlab
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
          <Link to="/upload" className={link} activeProps={{ className: "bg-secondary text-foreground" }}>Upload</Link>
          <Link to="/history" className={link} activeProps={{ className: "bg-secondary text-foreground" }}>My reports</Link>
          <span className="ml-2 hidden items-center gap-1 rounded-full bg-status-in-soft px-3 py-1 text-xs font-medium text-status-in sm:flex">
            <ShieldCheck className="h-3.5 w-3.5" /> On-device only
          </span>
        </nav>
      </div>
    </header>
  );
}
