import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How TruthTrail AI investigates a claim" },
      {
        name: "description",
        content:
          "Claim decomposition, adversarial retrieval, source credibility scoring, context auditing and adjudication — the full TruthTrail AI methodology.",
      },
      { property: "og:title", content: "How TruthTrail AI investigates a claim" },
      {
        property: "og:description",
        content:
          "Five stages from raw claim or social post to an auditable, source-graded verdict with stated uncertainty.",
      },
    ],
  }),
  component: HowItWorks,
});

const STAGES = [
  {
    n: "01",
    title: "Ingest & normalise",
    body: "Plain text, an article URL or a social post link. For links the page is fetched, boilerplate stripped, and the factual assertion reconstructed from the text, quoted media and reply context.",
  },
  {
    n: "02",
    title: "Decompose",
    body: "The claim is split into independently checkable sub-assertions — a numeric part, an attribution part and a causal part are verified separately, because a claim can be true in one and false in another.",
  },
  {
    n: "03",
    title: "Adversarial retrieval",
    body: "Prosecutor and Defender run in parallel with opposing objectives. Neither sees the other's corpus, which prevents the confirmation drift you get from a single summarising model.",
  },
  {
    n: "04",
    title: "Source grading",
    body: "The Archivist scores each source on publisher provenance, publication type, recency and independence — flagging circular citation where five outlets all trace back to one unverified origin.",
  },
  {
    n: "05",
    title: "Adjudicate & expose",
    body: "The Adjudicator weighs evidence by credibility rather than volume, records where the agents disagreed, and publishes the residual uncertainty alongside the verdict.",
  },
];

const SCORES = [
  ["Primary / official record", "88–95"],
  ["Peer-reviewed research", "85–95"],
  ["Established news wire", "80–90"],
  ["Regional / single-source news", "40–60"],
  ["Personal blog or op-ed", "25–45"],
  ["Anonymous social post", "10–25"],
];

function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">How it works</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Every investigation follows the same five stages, and every stage is visible in the output.
        If a step cannot be completed, that failure is reported instead of being smoothed over.
      </p>

      <ol className="mt-12 space-y-px overflow-hidden rounded-xl border border-border bg-border">
        {STAGES.map((s) => (
          <li key={s.n} className="flex gap-5 bg-card p-6">
            <span className="font-mono text-sm text-primary">{s.n}</span>
            <div>
              <h2 className="text-base font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-16 text-2xl font-semibold">Source credibility bands</h2>
      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <tbody>
            {SCORES.map(([label, range], i) => (
              <tr key={label} className={i % 2 ? "bg-card/40" : "bg-card/70"}>
                <td className="px-5 py-3">{label}</td>
                <td className="px-5 py-3 text-right font-mono text-muted-foreground">{range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 rounded-xl border border-border bg-card/60 p-6">
        <h2 className="text-lg font-semibold">A note on this demo</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This build runs a deterministic simulation of the agent pipeline so the full interaction
          model — timelines, disagreement, source grading, evidence drill-down — can be evaluated
          before live retrieval and models are wired in. Citations shown are illustrative.
        </p>
      </div>

      <Link
        to="/"
        hash="check"
        className="mt-10 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Investigate a claim <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
