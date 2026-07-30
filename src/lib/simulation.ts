// Deterministic simulated multi-agent fact-checking engine.
// No network calls — results are derived from the claim text itself so the
// same claim always produces the same investigation trail.

export type Stance = "supports" | "refutes" | "context";
export type Verdict =
  | "Likely True"
  | "Mostly True"
  | "Mixed / Needs Context"
  | "Mostly False"
  | "Likely False"
  | "Unverifiable";

export interface Evidence {
  id: string;
  source: string;
  domain: string;
  title: string;
  excerpt: string;
  stance: Stance;
  credibility: number; // 0-100
  published: string;
  sourceType: "Primary" | "Peer-reviewed" | "News" | "Government" | "Blog" | "Social";
}

export interface AgentStep {
  label: string;
  detail: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  color: "cyan" | "amber" | "violet" | "rose";
  confidence: number;
  leaning: Stance;
  summary: string;
  steps: AgentStep[];
  evidenceIds: string[];
}

export interface Investigation {
  id: string;
  claim: string;
  inputType: "text" | "url" | "social";
  normalizedClaim: string;
  verdict: Verdict;
  confidence: number;
  consensus: number; // % agent agreement
  summary: string;
  missingContext: string[];
  uncertainties: string[];
  agents: Agent[];
  evidence: Evidence[];
  timeline: { t: string; agent: string; action: string }[];
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function detectInputType(input: string): "text" | "url" | "social" {
  const t = input.trim();
  if (/^https?:\/\/(www\.)?(x\.com|twitter\.com|facebook\.com|instagram\.com|tiktok\.com|threads\.net|reddit\.com|youtube\.com)/i.test(t))
    return "social";
  if (/^https?:\/\//i.test(t)) return "url";
  return "text";
}

function domainOf(input: string): string | null {
  try {
    return new URL(input.trim()).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

const SOURCE_POOL: Omit<Evidence, "id" | "stance" | "excerpt">[] = [
  { source: "Nature", domain: "nature.com", title: "Longitudinal study on the underlying mechanism", credibility: 94, published: "2024-03-11", sourceType: "Peer-reviewed" },
  { source: "Reuters", domain: "reuters.com", title: "Fact file: what the official records show", credibility: 89, published: "2025-01-22", sourceType: "News" },
  { source: "Associated Press", domain: "apnews.com", title: "Officials release figures contradicting viral post", credibility: 88, published: "2025-06-04", sourceType: "News" },
  { source: "WHO", domain: "who.int", title: "Technical briefing and situation report", credibility: 91, published: "2024-11-30", sourceType: "Government" },
  { source: "Our World in Data", domain: "ourworldindata.org", title: "Dataset: measured trend across 42 countries", credibility: 86, published: "2025-04-18", sourceType: "Primary" },
  { source: "The Lancet", domain: "thelancet.com", title: "Meta-analysis of 37 controlled trials", credibility: 93, published: "2023-09-02", sourceType: "Peer-reviewed" },
  { source: "Congressional Record", domain: "congress.gov", title: "Verbatim transcript of the cited statement", credibility: 90, published: "2025-02-14", sourceType: "Primary" },
  { source: "Medium op-ed", domain: "medium.com", title: "Why everyone is getting this wrong", credibility: 34, published: "2025-07-01", sourceType: "Blog" },
  { source: "Viral thread on X", domain: "x.com", title: "Thread claiming insider knowledge", credibility: 18, published: "2025-07-12", sourceType: "Social" },
  { source: "FactCheck.org", domain: "factcheck.org", title: "We traced the claim to its original context", credibility: 87, published: "2025-05-09", sourceType: "News" },
  { source: "Statistical agency release", domain: "census.gov", title: "Quarterly figures, revised", credibility: 92, published: "2025-03-28", sourceType: "Government" },
  { source: "Regional news outlet", domain: "localdispatch.com", title: "Report based on a single anonymous source", credibility: 46, published: "2025-06-21", sourceType: "News" },
];

const SUPPORT_EXCERPTS = [
  "The measured figures fall within the range described by the claim, though the sample is limited to one region.",
  "Officials confirmed the core numeric assertion during a recorded briefing.",
  "The dataset shows a consistent trend in the direction the claim describes over the last six years.",
  "A controlled study reports an effect size compatible with the claim's central assertion.",
];
const REFUTE_EXCERPTS = [
  "The original figure was revised downward by 38% after methodology corrections; the claim cites the pre-revision number.",
  "The quoted statement was truncated — the full transcript reverses its meaning.",
  "No record exists in the primary registry for the event described.",
  "Independent replication failed to reproduce the reported effect.",
];
const CONTEXT_EXCERPTS = [
  "The claim is technically accurate but omits that the baseline changed definition in 2021.",
  "Both figures are real; they measure different populations and are not comparable.",
  "The underlying event occurred, but four years earlier than stated.",
  "Experts disagree on interpretation; the uncertainty interval is wide.",
];

const AGENT_TEMPLATES: Omit<Agent, "confidence" | "leaning" | "summary" | "evidenceIds">[] = [
  {
    id: "prosecutor",
    name: "Prosecutor",
    role: "Actively searches for evidence that the claim is false",
    color: "rose",
    steps: [
      { label: "Decompose", detail: "Split the claim into 3 independently checkable sub-assertions." },
      { label: "Adversarial search", detail: "Query for refutations, retractions and corrections first." },
      { label: "Trace origin", detail: "Follow the claim upstream to its earliest published appearance." },
    ],
  },
  {
    id: "defender",
    name: "Defender",
    role: "Builds the strongest good-faith case for the claim",
    color: "cyan",
    steps: [
      { label: "Charitable reading", detail: "Interpret ambiguous wording in the most defensible way." },
      { label: "Supporting corpus", detail: "Collect primary data consistent with the assertion." },
      { label: "Steelman", detail: "State the version of the claim most likely to survive scrutiny." },
    ],
  },
  {
    id: "archivist",
    name: "Archivist",
    role: "Grades source provenance, recency and independence",
    color: "amber",
    steps: [
      { label: "Provenance", detail: "Resolve each source to its publisher and funding disclosure." },
      { label: "Independence", detail: "Detect circular citation between outlets reusing one origin." },
      { label: "Recency", detail: "Flag evidence superseded by newer releases." },
    ],
  },
  {
    id: "contextualist",
    name: "Contextualist",
    role: "Detects omissions, framing and missing baselines",
    color: "violet",
    steps: [
      { label: "Baseline check", detail: "Compare against the relevant denominator and time window." },
      { label: "Omission scan", detail: "Identify facts a reasonable reader would need but were left out." },
      { label: "Framing audit", detail: "Separate factual core from rhetorical packaging." },
    ],
  },
];

const MISSING_CONTEXT = [
  "The comparison baseline year is not stated, and results reverse if 2019 is used instead of 2021.",
  "The figure is absolute, not per-capita — population growth explains part of the change.",
  "The source study was funded by an organisation with a direct interest in the outcome.",
  "Only one of three official datasets is cited; the other two show smaller effects.",
  "The claim generalises a regional finding to a national scale.",
];

const UNCERTAINTIES = [
  "Two of the strongest sources are behind paywalls and only abstracts were readable.",
  "Agents disagreed on whether the quoted statement was rhetorical or literal.",
  "The most recent official data is 9 months old; the situation may have changed.",
  "No primary document could be located for the originating claim.",
];

export function investigate(rawInput: string): Investigation {
  const claim = rawInput.trim();
  const seed = hash(claim.toLowerCase());
  const rand = rng(seed);
  const inputType = detectInputType(claim);
  const d = domainOf(claim);

  const normalizedClaim =
    inputType === "text"
      ? claim
      : `Extracted from ${d}: the post asserts a factual statement that the agents reconstructed from its text, quoted media and reply context.`;

  // Score in [-1, 1]: negative = false, positive = true
  const base = rand() * 2 - 1;
  const score = Math.max(-0.95, Math.min(0.95, base));

  const evidenceCount = 6 + Math.floor(rand() * 3);
  const pool = [...SOURCE_POOL].sort(() => rand() - 0.5).slice(0, evidenceCount);

  const evidence: Evidence[] = pool.map((s, i) => {
    const r = rand();
    let stance: Stance;
    if (r < 0.5 + score * 0.4) stance = "supports";
    else if (r > 0.82) stance = "context";
    else stance = "refutes";
    const excerpts =
      stance === "supports" ? SUPPORT_EXCERPTS : stance === "refutes" ? REFUTE_EXCERPTS : CONTEXT_EXCERPTS;
    return {
      ...s,
      id: `ev-${i + 1}`,
      stance,
      excerpt: excerpts[Math.floor(rand() * excerpts.length)],
    };
  });

  const supports = evidence.filter((e) => e.stance === "supports");
  const refutes = evidence.filter((e) => e.stance === "refutes");

  const weighted =
    (supports.reduce((a, e) => a + e.credibility, 0) - refutes.reduce((a, e) => a + e.credibility, 0)) /
    Math.max(1, evidence.reduce((a, e) => a + e.credibility, 0));

  let verdict: Verdict;
  if (weighted > 0.45) verdict = "Likely True";
  else if (weighted > 0.15) verdict = "Mostly True";
  else if (weighted > -0.15) verdict = "Mixed / Needs Context";
  else if (weighted > -0.45) verdict = "Mostly False";
  else verdict = "Likely False";
  if (evidence.every((e) => e.credibility < 55)) verdict = "Unverifiable";

  const agents: Agent[] = AGENT_TEMPLATES.map((t, idx) => {
    const bias = t.id === "prosecutor" ? -0.25 : t.id === "defender" ? 0.25 : 0;
    const local = weighted + bias + (rand() - 0.5) * 0.25;
    const leaning: Stance = t.id === "contextualist" ? "context" : local > 0.08 ? "supports" : local < -0.08 ? "refutes" : "context";
    const picked = evidence
      .filter((e) => (leaning === "context" ? true : e.stance === leaning))
      .slice(0, 3)
      .map((e) => e.id);
    return {
      ...t,
      confidence: Math.round(52 + Math.abs(local) * 45 + rand() * 8),
      leaning,
      summary:
        t.id === "prosecutor"
          ? refutes.length
            ? `Found ${refutes.length} credible refutations. The strongest is a documented revision of the original figure.`
            : "Aggressive adversarial search surfaced no credible refutation, which raises confidence in the claim."
          : t.id === "defender"
            ? supports.length
              ? `Assembled ${supports.length} supporting sources; the steelmanned version of the claim holds under narrower wording.`
              : "Could not construct a defensible version of the claim from available primary sources."
            : t.id === "archivist"
              ? `Median source credibility ${Math.round(evidence.reduce((a, e) => a + e.credibility, 0) / evidence.length)}/100. Detected ${1 + Math.floor(rand() * 2)} instance(s) of circular citation.`
              : "The factual core is narrower than the framing implies; several qualifiers were dropped in circulation.",
      evidenceIds: picked.length ? picked : [evidence[idx % evidence.length].id],
    };
  });

  const leanings = agents.map((a) => a.leaning);
  const dominant = leanings.sort(
    (a, b) => leanings.filter((x) => x === b).length - leanings.filter((x) => x === a).length,
  )[0];
  const consensus = Math.round((leanings.filter((l) => l === dominant).length / agents.length) * 100);

  const shuffledMissing = [...MISSING_CONTEXT].sort(() => rand() - 0.5).slice(0, 2 + Math.floor(rand() * 2));
  const shuffledUnc = [...UNCERTAINTIES].sort(() => rand() - 0.5).slice(0, 2);

  const timeline = [
    { t: "00:00", agent: "Router", action: inputType === "text" ? "Received raw claim text" : `Fetched and parsed content from ${d}` },
    { t: "00:02", agent: "Router", action: "Decomposed input into checkable assertions" },
    { t: "00:05", agent: "Defender", action: `Retrieved ${supports.length} supporting sources` },
    { t: "00:05", agent: "Prosecutor", action: `Retrieved ${refutes.length} contradicting sources` },
    { t: "00:11", agent: "Archivist", action: "Scored provenance and independence of all sources" },
    { t: "00:16", agent: "Contextualist", action: `Flagged ${shuffledMissing.length} missing-context issues` },
    { t: "00:21", agent: "Adjudicator", action: `Reconciled agent disagreement — ${consensus}% consensus` },
  ];

  return {
    id: seed.toString(36).slice(0, 8),
    claim,
    inputType,
    normalizedClaim,
    verdict,
    confidence: Math.round(55 + Math.abs(weighted) * 40),
    consensus,
    summary:
      verdict === "Mixed / Needs Context"
        ? "Agents split. The claim contains a factually accurate core wrapped in framing that changes what a reader takes away. Treat the headline version as misleading and the narrow version as defensible."
        : verdict === "Likely False" || verdict === "Mostly False"
          ? "The weight of high-credibility evidence contradicts the claim. The most-cited supporting sources trace back to a single low-credibility origin that was later corrected."
          : verdict === "Unverifiable"
            ? "No source of sufficient credibility could be located on either side. This claim cannot currently be resolved."
            : "High-credibility independent sources converge on the claim. Remaining doubt comes from scope rather than substance.",
    missingContext: shuffledMissing,
    uncertainties: shuffledUnc,
    agents,
    evidence,
    timeline,
  };
}

export const SAMPLE_CLAIMS = [
  "Electric vehicles produce more lifetime emissions than petrol cars.",
  "https://x.com/someaccount/status/1783920184920184",
  "Global renewable capacity doubled in the last four years.",
  "Drinking 8 glasses of water a day is medically required.",
];
