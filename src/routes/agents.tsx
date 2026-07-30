import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "The agents — TruthTrail AI" },
      {
        name: "description",
        content:
          "Prosecutor, Defender, Archivist, Contextualist and Adjudicator: the five independent roles behind every TruthTrail AI verdict.",
      },
      { property: "og:title", content: "The agents — TruthTrail AI" },
      {
        property: "og:description",
        content:
          "Five specialised agents with opposing objectives investigate every claim, and their disagreements are published.",
      },
    ],
  }),
  component: AgentsPage,
});

const AGENTS = [
  {
    name: "Prosecutor",
    tone: "text-refute border-refute/40 bg-refute/10",
    objective: "Falsify the claim",
    body: "Searches refutations, retractions and corrections before anything else, then traces the claim upstream to its earliest published appearance to see whether it was ever sourced at all.",
    fails: "Can over-penalise true claims in fast-moving stories where corrections are still pending.",
  },
  {
    name: "Defender",
    tone: "text-signal border-signal/40 bg-signal/10",
    objective: "Steelman the claim",
    body: "Reads ambiguous wording charitably and assembles the strongest good-faith case, then states the narrowest version of the claim that survives scrutiny.",
    fails: "Will report low confidence rather than manufacture support when primary sources are absent.",
  },
  {
    name: "Archivist",
    tone: "text-primary border-primary/40 bg-primary/10",
    objective: "Grade the sources",
    body: "Resolves publishers, funding disclosures and republication chains. Detects circular citation where many outlets appear independent but share a single origin.",
    fails: "Paywalled primary research can only be graded from its abstract.",
  },
  {
    name: "Contextualist",
    tone: "text-context border-context/40 bg-context/10",
    objective: "Find the omission",
    body: "Checks baselines, denominators and time windows, then reports the qualifiers dropped as the claim circulated. Handles the hardest category: technically true, materially misleading.",
    fails: "Judgements about framing are interpretive and are labelled as such.",
  },
  {
    name: "Adjudicator",
    tone: "text-foreground border-border bg-secondary",
    objective: "Reconcile and publish",
    body: "Weighs evidence by credibility rather than volume, measures agent consensus, and publishes residual uncertainty next to the verdict instead of collapsing it into a single score.",
    fails: "Returns 'Unverifiable' rather than guessing when no credible source exists on either side.",
  },
];

function AgentsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">The agents</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Five roles with deliberately conflicting objectives. A single model asked to be balanced
        drifts toward the loudest available narrative; adversarial agents make that drift visible.
      </p>

      <div className="mt-12 space-y-3">
        {AGENTS.map((a) => (
          <article key={a.name} className="rounded-xl border border-border bg-card/70 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-md border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${a.tone}`}>
                {a.name}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                objective · {a.objective}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
            <p className="mt-3 border-l-2 border-border pl-3 text-xs leading-relaxed text-muted-foreground">
              Known limitation: {a.fails}
            </p>
          </article>
        ))}
      </div>

      <Link
        to="/"
        hash="check"
        className="mt-10 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Watch them work <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
