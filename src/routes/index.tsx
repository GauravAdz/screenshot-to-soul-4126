import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Upload, Eye, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingSketch } from "@/components/lab/LandingSketch";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clearlab — Understand your lab reports" },
      { name: "description", content: "Understand your lab reports in simple language. Private by design: everything stays on your device." },
      { property: "og:title", content: "Clearlab — Understand your lab reports" },
      { property: "og:description", content: "Plain-language lab report explainer that runs entirely on your device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const NOTES = [
  { icon: ShieldCheck, t: "Stays on your device", tilt: "-rotate-1" },
  { icon: Eye, t: "You check the numbers", tilt: "rotate-[0.8deg]" },
  { icon: Ruler, t: "Ranges from your lab", tilt: "-rotate-[0.6deg]" },
];

function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden className={className} fill="none">
      <path d="M3 8 C30 2 60 11 95 6 C130 1 165 10 197 5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

function Index() {
  return (
    <main className="paper-grid">
      <section className="mx-auto max-w-3xl px-4 pt-16 text-center md:pt-24">
        <span className="sketch-chip fade-up inline-flex -rotate-1 items-center gap-2 px-3 py-1 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-status-in" /> Private by design
        </span>

        <h1 className="fade-up mt-7 text-4xl font-semibold leading-[1.1] md:text-6xl">
          Your lab reports,{" "}
          <span className="relative inline-block text-primary">
            in plain words
            <Squiggle className="absolute -bottom-2.5 left-0 h-3 w-full text-primary" />
          </span>
        </h1>

        <p className="fade-up mx-auto mt-7 max-w-sm text-base text-muted-foreground md:text-lg">
          Drop in a PDF or a photo. Nothing leaves your device.
        </p>

        <div className="fade-up mt-9 flex justify-center">
          <Button
            asChild
            size="lg"
            className="rounded-[1.05rem_0.8rem_1.15rem_0.85rem] border-[1.5px] border-foreground/25 bg-card px-8 text-foreground shadow-sketch transition-transform hover:-translate-y-0.5 hover:bg-secondary"
          >
            <Link to="/upload">
              <Upload className="h-4 w-4" /> Upload report
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 pt-10 md:pt-14">
        <LandingSketch className="fade-up mx-auto w-full max-w-xl" />
      </section>

      <section className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-3 px-4 pb-10 pt-4">
        {NOTES.map((n) => (
          <span key={n.t} className={`sketch-chip inline-flex items-center gap-2 px-3 py-1.5 text-sm ${n.tilt}`}>
            <n.icon className="h-4 w-4 text-primary" /> {n.t}
          </span>
        ))}
      </section>
    </main>
  );
}
