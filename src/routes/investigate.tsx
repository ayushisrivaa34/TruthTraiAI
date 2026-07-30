import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  CircleSlash,
  Gauge,
  Link2,
  Loader2,
  ScrollText,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { investigate, type Agent, type Evidence, type Stance } from "@/lib/simulation";

export const Route = createFileRoute("/investigate")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q.slice(0, 600) : "",
  }),
  head: () => ({
    meta: [
      { title: "Investigation trail — TruthTrail AI" },
      {
        name: "description",
        content:
          "Live agent investigation: supporting and opposing evidence, source credibility grades, missing context and the explainable verdict for your claim.",
      },
      { property: "og:title", content: "Investigation trail — TruthTrail AI" },
      {
        property: "og:description",
        content:
          "Watch four independent agents investigate a claim and see every piece of evidence behind the verdict.",
      },
    ],
  }),
  component: InvestigatePage,
});

const stanceStyles: Record<Stance, { label: string; chip: string; bar: string; Icon: typeof CheckCircle2 }> = {
  supports: {
    label: "Supports",
    chip: "border-support/40 bg-support/10 text-support",
    bar: "bg-support",
    Icon: CheckCircle2,
  },
  refutes: {
    label: "Refutes",
    chip: "border-refute/40 bg-refute/10 text-refute",
    bar: "bg-refute",
    Icon: XCircle,
  },
  context: {
    label: "Context",
    chip: "border-context/40 bg-context/10 text-context",
    bar: "bg-context",
    Icon: AlertTriangle,
  },
};

const agentAccent: Record<Agent["color"], string> = {
  cyan: "text-signal border-signal/40 bg-signal/10",
  amber: "text-primary border-primary/40 bg-primary/10",
  violet: "text-context border-context/40 bg-context/10",
  rose: "text-refute border-refute/40 bg-refute/10",
};

function verdictTone(verdict: string) {
  if (verdict.includes("True")) return "border-support/40 bg-support/10 text-support";
  if (verdict.includes("False")) return "border-refute/40 bg-refute/10 text-refute";
  return "border-primary/40 bg-primary/10 text-primary";
}

function InvestigatePage() {
  const { q } = Route.useSearch();
  const result = useMemo(() => (q ? investigate(q) : null), [q]);
  const [phase, setPhase] = useState(0); // 0..7 (timeline steps), 8 = done
  const [openEvidence, setOpenEvidence] = useState<string | null>(null);
  const [filter, setFilter] = useState<Stance | "all">("all");

  useEffect(() => {
    setPhase(0);
    if (!result) return;
    const total = result.timeline.length + 1;
    const timers = Array.from({ length: total }, (_, i) =>
      setTimeout(() => setPhase(i + 1), 420 * (i + 1)),
    );
    return () => timers.forEach(clearTimeout);
  }, [result]);

  if (!result) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="text-2xl font-semibold">No claim submitted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Head back and paste a claim, article URL or social post to start an investigation.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    );
  }

  const running = phase <= result.timeline.length;
  const visibleEvidence =
    filter === "all" ? result.evidence : result.evidence.filter((e) => e.stance === filter);
  const counts = {
    supports: result.evidence.filter((e) => e.stance === "supports").length,
    refutes: result.evidence.filter((e) => e.stance === "refutes").length,
    context: result.evidence.filter((e) => e.stance === "context").length,
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> New investigation
      </Link>

      {/* Claim header */}
      <div className="mt-5 rounded-xl border border-border bg-card/70 p-6">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {result.inputType === "text" ? (
            <ScrollText className="h-3.5 w-3.5" />
          ) : (
            <Link2 className="h-3.5 w-3.5 text-signal" />
          )}
          {result.inputType === "social" ? "social post" : result.inputType} · case #{result.id}
        </div>
        <h1 className="mt-3 text-pretty text-xl font-semibold leading-snug sm:text-2xl">
          {result.claim}
        </h1>
        {result.inputType !== "text" && (
          <p className="mt-3 border-l-2 border-signal/50 pl-3 text-sm text-muted-foreground">
            {result.normalizedClaim}
          </p>
        )}
      </div>

      {/* Live agent run */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="order-2 space-y-6 lg:order-1">
          {/* Verdict */}
          {!running ? (
            <section className="rise rounded-xl border border-border bg-card/70 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-md border px-3 py-1.5 font-display text-sm font-semibold ${verdictTone(result.verdict)}`}
                >
                  {result.verdict}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  <Gauge className="h-3.5 w-3.5" /> confidence {result.confidence}%
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  agent consensus {result.consensus}%
                </span>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                {result.summary}
              </p>

              <div className="mt-5">
                <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
                  {(["supports", "context", "refutes"] as Stance[]).map((s) => (
                    <div
                      key={s}
                      className={stanceStyles[s].bar}
                      style={{ width: `${(counts[s] / result.evidence.length) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span className="text-support">{counts.supports} supporting</span>
                  <span className="text-context">{counts.context} context</span>
                  <span className="text-refute">{counts.refutes} refuting</span>
                </div>
              </div>
            </section>
          ) : (
            <section className="scanline rounded-xl border border-primary/30 bg-card/70 p-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Agents investigating…
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Decomposing the claim, retrieving adversarial evidence and grading every source.
              </p>
            </section>
          )}

          {/* Agents */}
          <section>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Agent reports
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {result.agents.map((a, i) => (
                <AgentCard
                  key={a.id}
                  agent={a}
                  evidence={result.evidence}
                  revealed={phase > i + 1}
                />
              ))}
            </div>
          </section>

          {/* Evidence */}
          {!running && (
            <section className="rise">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Evidence trail
                </h2>
                <div className="flex gap-1">
                  {(["all", "supports", "refutes", "context"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`rounded-md border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                        filter === f
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <ul className="mt-3 space-y-2">
                {visibleEvidence.map((e) => (
                  <EvidenceRow
                    key={e.id}
                    evidence={e}
                    open={openEvidence === e.id}
                    onToggle={() => setOpenEvidence(openEvidence === e.id ? null : e.id)}
                  />
                ))}
              </ul>
            </section>
          )}

          {/* Context + uncertainty */}
          {!running && (
            <div className="rise grid gap-3 sm:grid-cols-2">
              <section className="rounded-xl border border-context/30 bg-card/70 p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-context">
                  <ShieldAlert className="h-4 w-4" /> Missing context
                </h2>
                <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                  {result.missingContext.map((m) => (
                    <li key={m} className="border-l-2 border-context/40 pl-3 leading-relaxed">
                      {m}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-xl border border-border bg-card/70 p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <CircleSlash className="h-4 w-4 text-muted-foreground" /> What we could not resolve
                </h2>
                <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                  {result.uncertainties.map((u) => (
                    <li key={u} className="border-l-2 border-border pl-3 leading-relaxed">
                      {u}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>

        {/* Timeline rail */}
        <aside className="order-1 lg:order-2">
          <div className="sticky top-24 rounded-xl border border-border bg-card/70 p-5">
            <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Reasoning timeline
            </h2>
            <ol className="mt-4 space-y-3">
              {result.timeline.map((t, i) => {
                const done = phase > i;
                return (
                  <li key={`${t.t}-${t.action}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`mt-1 h-2 w-2 rounded-full ${done ? "bg-primary" : "bg-border"}`}
                      />
                      {i < result.timeline.length - 1 && (
                        <span className={`w-px flex-1 ${done ? "bg-primary/30" : "bg-border"}`} />
                      )}
                    </div>
                    <div className={`pb-1 ${done ? "opacity-100" : "opacity-40"}`}>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        {t.t} · {t.agent}
                      </p>
                      <p className="text-sm leading-snug">{t.action}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AgentCard({
  agent,
  evidence,
  revealed,
}: {
  agent: Agent;
  evidence: Evidence[];
  revealed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const cited = evidence.filter((e) => agent.evidenceIds.includes(e.id));

  if (!revealed) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/30 p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {agent.name} working…
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-2 w-3/4 rounded bg-secondary" />
          <div className="h-2 w-1/2 rounded bg-secondary" />
        </div>
      </div>
    );
  }

  const st = stanceStyles[agent.leaning];

  return (
    <div className="rise rounded-xl border border-border bg-card/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className={`rounded-md border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider ${agentAccent[agent.color]}`}
          >
            {agent.name}
          </span>
          <p className="mt-2 text-xs text-muted-foreground">{agent.role}</p>
        </div>
        <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] ${st.chip}`}>
          {st.label}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed">{agent.summary}</p>

      <div className="mt-4">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>confidence</span>
          <span>{agent.confidence}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className={`h-full ${st.bar}`} style={{ width: `${agent.confidence}%` }} />
        </div>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="mt-4 flex w-full items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        reasoning steps
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {agent.steps.map((s, i) => (
            <div key={s.label} className="flex gap-3">
              <span className="font-mono text-[11px] text-primary">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-xs font-semibold">{s.label}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{s.detail}</p>
              </div>
            </div>
          ))}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              cited
            </p>
            <ul className="mt-1 space-y-1">
              {cited.map((c) => (
                <li key={c.id} className="text-xs text-muted-foreground">
                  · {c.source} <span className="font-mono">({c.credibility}/100)</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function EvidenceRow({
  evidence,
  open,
  onToggle,
}: {
  evidence: Evidence;
  open: boolean;
  onToggle: () => void;
}) {
  const st = stanceStyles[evidence.stance];
  return (
    <li className="overflow-hidden rounded-xl border border-border bg-card/70">
      <button onClick={onToggle} className="flex w-full items-start gap-3 p-4 text-left">
        <st.Icon className={`mt-0.5 h-4 w-4 shrink-0 ${st.chip.split(" ").pop()}`} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{evidence.title}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {evidence.domain} · {evidence.sourceType} · {evidence.published}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={`font-mono text-sm ${
              evidence.credibility >= 80
                ? "text-support"
                : evidence.credibility >= 55
                  ? "text-primary"
                  : "text-refute"
            }`}
          >
            {evidence.credibility}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            credibility
          </p>
        </div>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-border bg-surface/40 p-4">
          <span className={`rounded-md border px-2 py-0.5 text-[11px] ${st.chip}`}>{st.label}</span>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">"{evidence.excerpt}"</p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            published by {evidence.source} · simulated citation
          </p>
        </div>
      )}
    </li>
  );
}
