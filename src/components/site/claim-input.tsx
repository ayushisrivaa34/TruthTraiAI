import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Link2, Type } from "lucide-react";
import { useState } from "react";

import { detectInputType, SAMPLE_CLAIMS } from "@/lib/simulation";

export function ClaimInput() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const type = value.trim() ? detectInputType(value) : null;

  const submit = (claim: string) => {
    const q = claim.trim();
    if (q.length < 8) return;
    navigate({ to: "/investigate", search: { q } });
  };

  return (
    <div id="check" className="scroll-mt-24">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="rounded-xl border border-border bg-card/70 p-3 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur"
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(value);
          }}
          rows={3}
          maxLength={600}
          placeholder="Paste a claim, an article URL, or a link to a social media post…"
          className="w-full resize-none bg-transparent px-3 py-2.5 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-3 pt-3">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {type === null && <span>text · url · social post</span>}
            {type === "text" && (
              <span className="flex items-center gap-1.5 text-foreground">
                <Type className="h-3.5 w-3.5" /> plain claim detected
              </span>
            )}
            {type === "url" && (
              <span className="flex items-center gap-1.5 text-signal">
                <Link2 className="h-3.5 w-3.5" /> article url detected
              </span>
            )}
            {type === "social" && (
              <span className="flex items-center gap-1.5 text-primary">
                <Link2 className="h-3.5 w-3.5" /> social post detected
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={value.trim().length < 8}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Run investigation <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Try:
        </span>
        {SAMPLE_CLAIMS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => submit(c)}
            className="max-w-full truncate rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            {c.length > 46 ? `${c.slice(0, 46)}…` : c}
          </button>
        ))}
      </div>
    </div>
  );
}
