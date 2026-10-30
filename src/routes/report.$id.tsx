import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultCard, STATUS_STYLE } from "@/components/lab/ResultCard";
import { classify, STATUS_LABEL } from "@/lib/lab/engine";
import { exportReport, getReport } from "@/lib/lab/storage";
import type { LabReport, Status } from "@/lib/lab/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/report/$id")({
  head: () => ({
    meta: [
      { title: "Your results — Clearlab" },
      { name: "description", content: "Your lab results explained in plain language, stored only on this device." },
      { property: "og:title", content: "Your results — Clearlab" },
      { property: "og:description", content: "Lab results explained in plain language." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportPage,
});

const ORDER: Status[] = ["above", "below", "unknown", "within"];

function ReportPage() {
  const { id } = Route.useParams();
  const [report, setReport] = useState<LabReport | null | undefined>(undefined);
  const [filter, setFilter] = useState<Status | "all">("all");

  useEffect(() => {
    getReport(id).then(setReport).catch(() => setReport(null));
  }, [id]);

  if (report === undefined)
    return <div className="grid min-h-[50vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (report === null)
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Report not found on this device</h1>
        <Button asChild className="mt-6 rounded-full"><Link to="/history">See my reports</Link></Button>
      </main>
    );

  const withStatus = report.results.map((r) => ({ r, s: classify(r).status }));
  const counts = ORDER.reduce((a, s) => ({ ...a, [s]: withStatus.filter((x) => x.s === s).length }), {} as Record<Status, number>);
  const shown = withStatus.filter((x) => filter === "all" || x.s === filter).sort((a, b) => ORDER.indexOf(a.s) - ORDER.indexOf(b.s));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{report.reportDate ? `Report date ${report.reportDate}` : "Report date not found"}</p>
          <h1 className="mt-1 text-3xl font-semibold md:text-4xl">{report.title}</h1>
        </div>
        <Button variant="outline" className="rounded-full" onClick={() => exportReport(report)}><Download className="h-4 w-4" /> Export</Button>
      </div>

      <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-muted" aria-hidden>
        {ORDER.map((s) => counts[s] > 0 && (
          <div key={s} className={cn(STATUS_STYLE[s], "h-full border-r-2 border-background")} style={{ width: `${(counts[s] / withStatus.length) * 100}%`, backgroundColor: "currentColor" }} />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter results">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All · {withStatus.length}</FilterChip>
        {ORDER.map((s) => (
          <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)} className={STATUS_STYLE[s]}>{STATUS_LABEL[s]} · {counts[s]}</FilterChip>
        ))}
      </div>

      {report.limitations.length > 0 && (
        <div className="mt-6 space-y-1 rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
          {report.limitations.map((l) => <p key={l} className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" />{l}</p>)}
        </div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map(({ r }, i) => <ResultCard key={r.id} r={r} index={i} />)}
      </section>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        "Within Range" only means the value is inside the range printed by your lab — it doesn't mean everything is fine, and outside doesn't mean something is wrong. Talk to your clinician about your results.
      </p>
    </main>
  );
}

function FilterChip({ active, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return (
    <button
      aria-pressed={active}
      {...p}
      className={cn("rounded-full border px-3 py-1 text-sm font-medium transition", active ? "border-foreground/40 ring-2 ring-ring/30" : "border-transparent", className ?? "bg-secondary text-secondary-foreground")}
    />
  );
}
