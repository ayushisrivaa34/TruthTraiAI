import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Boxes,
  Eye,
  GitCompareArrows,
  Layers,
  ScanSearch,
  ShieldQuestion,
} from "lucide-react";

import { ClaimInput } from "@/components/site/claim-input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TruthTrail AI — Explainable multi-agent fact-checking" },
      {
        name: "description",
        content:
          "Paste a claim, article URL or social post. Independent AI agents gather supporting and opposing evidence, grade sources, and show an auditable verdict trail.",
      },
      { property: "og:title", content: "TruthTrail AI — Explainable multi-agent fact-checking" },
      {
        property: "og:description",
        content:
          "Independent AI agents debate a claim, grade every source, and expose their disagreements instead of asking you to trust one answer.",
      },
    ],
  }),
  component: Home,
});

const PILLARS = [
  {
    icon: GitCompareArrows,
    title: "Adversarial by design",
    body: "A Prosecutor agent hunts for refutations while a Defender builds the strongest case for the claim. Their disagreement is the product, not a bug.",
  },
  {
    icon: Layers,
    title: "Source-graded evidence",
    body: "Every citation carries a credibility score, publication type, date and independence check — including detection of circular citation loops.",
  },
  {
    icon: Eye,
    title: "Missing context surfaced",
    body: "Technically-true claims are the hardest. The Contextualist agent reports the baselines, denominators and qualifiers that were dropped.",
  },
  {
    icon: ShieldQuestion,
    title: "Uncertainty stated out loud",
    body: "Paywalled sources, stale data and unresolved agent conflicts are listed next to the verdict rather than hidden behind confidence theatre.",
  },
];

function Home() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <ScanSearch className="h-3.5 w-3.5 text-primary" />
            Multi-agent investigation engine
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] sm:text-6xl">
            Don't trust the verdict.
            <br />
            <span className="text-primary">Follow the trail.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            TruthTrail AI investigates online claims with independent agents that argue against each
            other. You see the evidence, the source grades, the missing context and exactly where the
            agents disagreed.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rise">
          <ClaimInput />
        </div>

        <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
          {[
            ["4", "independent agents"],
            ["12", "source-quality signals"],
            ["100%", "citations shown"],
            ["0", "hidden reasoning"],
          ].map(([n, l]) => (
            <div key={l} className="bg-card px-4 py-5 text-center">
              <dt className="font-display text-2xl font-semibold text-primary">{n}</dt>
              <dd className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {l}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-y border-border/70 bg-card/30">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="max-w-xl text-2xl font-semibold sm:text-3xl">
            Explainability is the feature
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            {PILLARS.map((p) => (
              <div key={p.title} className="bg-card p-6">
                <p.icon className="h-5 w-5 text-signal" />
                <h3 className="mt-4 text-base font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-primary/25 bg-card/60 p-8 sm:flex-row sm:items-center">
          <div>
            <Boxes className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-2xl font-semibold">Read the full methodology</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              How claims are decomposed, how sources are scored, and how the Adjudicator reconciles
              four conflicting agent reports into one auditable verdict.
            </p>
          </div>
          <Link
            to="/how-it-works"
            className="shrink-0 rounded-md border border-border bg-secondary px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary/50"
          >
            How it works
          </Link>
        </div>
      </section>
    </div>
  );
}
