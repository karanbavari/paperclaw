import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AB_SUPPORTED_ADAPTER_TYPES, type AbAudienceSegment, type AbFeedback, type AbRunSummary } from "@kesarcloud/shared";
import { ArrowRight, FlaskConical, Loader2, Plus } from "lucide-react";
import { Link, useNavigate, useParams } from "@/lib/router";
import { useCompany } from "@/context/CompanyContext";
import { ProductPage, ProductPageHeader, ProductSection } from "@/components/ProductPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { abTestsApi } from "@/api/abTests";
import { agentsApi } from "@/api/agents";

const field = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground";
const columns = [{ band: "negative", title: "Negative · 1–2" }, { band: "mixed", title: "Mixed · 3" }, { band: "positive", title: "Positive · 4–5" }] as const;

function FeedbackBoard({ companyId, studyId, run }: { companyId: string; studyId: string; run: AbRunSummary }) {
  const [variant, setVariant] = useState<"A" | "B">("A");
  const [pages, setPages] = useState<Record<string, AbFeedback[]>>({});
  const [cursors, setCursors] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const requestToken = useRef(0);
  useEffect(() => { requestToken.current += 1; setPages({}); setCursors({}); }, [run.run.id, variant]);
  async function load(band: typeof columns[number]["band"], more = false) {
    const token = requestToken.current;
    setLoading(band); setError("");
    try {
      const result = await abTestsApi.feedback(companyId, studyId, run.run.id,
        { variant, band, cursor: more ? cursors[band] ?? undefined : undefined });
      if (token !== requestToken.current) return;
      setPages((previous) => ({ ...previous, [band]: [...new Map([...(previous[band] ?? []), ...result.items].map((item) => [item.id, item])).values()].sort((a, b) => a.ordinal - b.ordinal) }));
      setCursors((previous) => ({ ...previous, [band]: result.nextCursor }));
    } catch (cause) { if (token === requestToken.current) setError(String(cause)); }
    finally { if (token === requestToken.current) setLoading(null); }
  }
  useEffect(() => { for (const column of columns) void load(column.band); }, [run.run.id, variant]);
  useEffect(() => { if (!["queued", "running"].includes(run.run.status)) return; const timer = setInterval(() => { for (const column of columns) void load(column.band); }, 5000); return () => clearInterval(timer); }, [run.run.id, run.run.status, variant]);
  return <ProductSection title="Synthetic feedback" description="Each persona saw only its assigned variant. Feedback is simulated, not collected from real customers.">
    <div className="flex gap-2 border-b border-border p-4">
      {(["A", "B"] as const).map((value) => <Button key={value} size="sm" variant={variant === value ? "default" : "outline"} onClick={() => setVariant(value)}>Variant {value}</Button>)}
    </div>
    {error && <p className="px-4 pt-3 text-sm text-destructive">{error}</p>}
    <div className="grid gap-3 p-4 lg:grid-cols-3">
      {columns.map((column) => <div key={column.band} className="min-w-0 rounded-lg border border-border bg-muted/30">
        <div className="flex justify-between border-b border-border px-3 py-2 text-sm font-medium"><span>{column.title}</span><span>{run.counts[variant][column.band]}</span></div>
        <div className="max-h-screen space-y-2 overflow-y-auto p-2">
          {(pages[column.band] ?? []).map((feedback) => <article key={feedback.id} className="rounded-md border border-border bg-card p-3 text-sm">
            <div className="font-medium">{String(feedback.profile.name ?? feedback.profile.role ?? feedback.segment)} · {feedback.rating}/5</div>
            <p className="mt-1 text-xs text-muted-foreground">{String(feedback.profile.role ?? feedback.segment)} · {String(feedback.profile.city ?? "Location assumed")}</p>
            <p className="mt-1 text-xs text-muted-foreground">Workflow: {feedback.workflowFit.replaceAll("_", " ")} · Budget: {feedback.budgetFit.replaceAll("_", " ")}</p>
            <p className="mt-2 leading-5">{feedback.rationale}</p>
            {feedback.objection && <p className="mt-2 text-xs text-muted-foreground">Concern: {feedback.objection}</p>}
          </article>)}
          {loading === column.band && <Loader2 className="mx-auto size-4 animate-spin" />}
          {cursors[column.band] !== null && (pages[column.band]?.length ?? 0) > 0 && <Button variant="ghost" size="sm" className="w-full" onClick={() => void load(column.band, true)}>Load more</Button>}
          {!loading && !pages[column.band]?.length && <p className="p-3 text-xs text-muted-foreground">No feedback in this band yet.</p>}
        </div>
      </div>)}
    </div>
  </ProductSection>;
}

export function AbTesting() {
  const { selectedCompanyId } = useCompany();
  const { studyId, view } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceSummary, setEvidenceSummary] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [price, setPrice] = useState("");
  const [pricePeriod, setPricePeriod] = useState<"" | "month" | "year" | "one_time">("");
  const [targetCount, setTargetCount] = useState(30);
  const [personaCursor, setPersonaCursor] = useState<number | undefined>();
  const [personaPages, setPersonaPages] = useState<Array<{ id: string; ordinal: number; segment: string; profile: Record<string, unknown>; assignedVariant: string }>>([]);
  const [variantA, setVariantA] = useState("");
  const [variantB, setVariantB] = useState("");
  const [audience, setAudience] = useState<AbAudienceSegment[]>([]);
  const [agentId, setAgentId] = useState("");
  const [ackSynthetic, setAckSynthetic] = useState(false);
  const [ackCost, setAckCost] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState("");
  const companyId = selectedCompanyId ?? "";
  const studies = useQuery({ queryKey: ["ab-tests", companyId], queryFn: () => abTestsApi.list(companyId), enabled: !!companyId });
  const detail = useQuery({ queryKey: ["ab-test", companyId, studyId], queryFn: () => abTestsApi.get(companyId, studyId!), enabled: !!companyId && !!studyId, refetchInterval: 5000 });
  const agents = useQuery({ queryKey: ["ab-agents", companyId], queryFn: () => agentsApi.list(companyId), enabled: !!companyId && view === "run" });
  const personas = useQuery({ queryKey: ["ab-personas", companyId, studyId, personaCursor], queryFn: () => abTestsApi.personas(companyId, studyId!, personaCursor), enabled: !!companyId && !!studyId && view === "personas", refetchInterval: view === "personas" ? 5000 : false });
  const mutation = useMutation({ mutationFn: async (action: () => Promise<unknown>) => action(), onSuccess: () => { setError(""); void client.invalidateQueries({ queryKey: ["ab-test", companyId, studyId] }); void client.invalidateQueries({ queryKey: ["ab-tests", companyId] }); }, onError: (cause) => setError(String(cause)) });
  useEffect(() => { if (!detail.data) return; const study = detail.data.study; setDescription(study.description); setEvidenceSummary(study.evidenceSummary ?? ""); setCountry(study.marketContext?.country ?? ""); setCurrency(study.marketContext?.currency ?? ""); setPrice(study.marketContext?.productPrice?.toString() ?? ""); setPricePeriod(study.marketContext?.pricePeriod ?? ""); setVariantA(study.variantA); setVariantB(study.variantB); setAudience(study.audience); setAgentId(study.agentId ?? ""); }, [detail.data?.study.updatedAt, studyId]);
  useEffect(() => { setPersonaCursor(undefined); setPersonaPages([]); }, [studyId]);
  useEffect(() => { if (!personas.data) return; setPersonaPages((previous) => personaCursor === undefined ? personas.data.items : [...new Map([...previous, ...personas.data.items].map((item) => [item.id, item])).values()]); }, [personas.data, personaCursor]);
  const activeRun = detail.data?.runs.find((item) => ["pending_approval", "queued", "running"].includes(item.run.status));
  const current = detail.data?.runs.find((item) => item.run.id === selectedRunId) ?? activeRun ?? detail.data?.runs[0];
  const pending = activeRun?.run.status === "pending_approval";
  const isBusy = mutation.isPending;
  const marketContext = { ...(country.trim() ? { country: country.trim() } : {}), ...(currency.trim() ? { currency: currency.trim().toUpperCase() } : {}), ...(price.trim() ? { productPrice: Number(price) } : {}), ...(pricePeriod ? { pricePeriod } : {}) };
  const go = (next: string) => navigate(`/ab-testing/${studyId}/${next}`);
  if (!selectedCompanyId) return <ProductPage><ProductPageHeader title="A/B Testing" description="Select a company to create or review studies." icon={FlaskConical} /></ProductPage>;
  return <ProductPage>
    <ProductPageHeader title="A/B Testing" description="Explore alternative offers with synthetic lookalike audiences. Results are planning signals only, never real-user evidence." icon={FlaskConical}
      actions={<Button asChild variant="outline" size="sm"><Link to="/ab-testing/new"><Plus className="mr-2 size-4" />New study</Link></Button>} />
    {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
    {!studyId ? <ProductSection title="Your studies" description="Create a new study or return to an existing research workspace."><div className="divide-y divide-border">{studies.data?.map((study) => <Link key={study.id} to={`/ab-testing/${study.id}`} className="block p-5 transition-colors hover:bg-muted/40"><div className="text-sm font-semibold">{study.title}</div><div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{study.auditReport?.summary || study.description || "Project audit ready"}</div></Link>)}{studies.isLoading && <Loader2 className="m-5 size-5 animate-spin" />}{studies.isError && <p className="p-5 text-sm text-destructive">Could not load studies: {String(studies.error)}</p>}{studies.data?.length === 0 && <div className="space-y-3 p-5"><p className="text-sm text-muted-foreground">No studies yet. Start by selecting a project directory.</p><Button asChild><Link to="/ab-testing/new">Create first study</Link></Button></div>}</div></ProductSection> : detail.isError ? <p className="text-sm text-destructive">Could not load study: {String(detail.error)}</p> : !detail.data ? <Loader2 className="size-5 animate-spin" /> : <>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">{detail.data.study.title}</h2><p className="text-sm text-muted-foreground">Synthetic research · {detail.data.study.auditReport?.files.length ?? 0} project files reviewed</p></div><Button asChild variant="outline" size="sm"><Link to="/ab-testing">All studies</Link></Button></div>
      <nav aria-label="Study workflow" className="flex flex-wrap gap-2 border-b border-border pb-3">{(["context", "audience", "variants", "run", "results", "personas", "feedback"] as const).map((key) => <Button key={key} asChild size="sm" variant={(view ?? "results") === key ? "default" : "ghost"}><Link to={`/ab-testing/${studyId}/${key}`}>{key === "run" ? "Run setup" : key.charAt(0).toUpperCase() + key.slice(1)}</Link></Button>)}</nav>
      {view === "context" && <div className="max-w-4xl space-y-5">
        <ProductSection title="Project audit" description="Review what the registered directory revealed before generating an audience.">
          <div className="space-y-4 p-5">
            <p className="text-sm leading-6">{detail.data.study.auditReport?.summary || "No source excerpt available for this older study."}</p>
            <div className="flex flex-wrap gap-2">{detail.data.study.auditReport?.files.map((file) => <span key={file} className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">{file}</span>)}</div>
            {detail.data.study.auditReport?.warnings.map((warning) => <p key={warning} className="text-xs text-muted-foreground">{warning}</p>)}
            {detail.data.study.auditReport?.priceEvidence && <p className="text-xs text-muted-foreground">Price found in {detail.data.study.auditReport.priceEvidence.sourcePath}: {detail.data.study.auditReport.priceEvidence.currency} {detail.data.study.auditReport.priceEvidence.productPrice} per {detail.data.study.auditReport.priceEvidence.pricePeriod}. Review it below before simulation.</p>}
            <p className="text-xs text-muted-foreground">Source excerpts remain in their original language. Generated audience and feedback are in English.</p>
          </div>
        </ProductSection>
        <ProductSection title="Optional context" description="Add only what project files missed. Without a known price, currency and period, budget fit remains unknown.">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm">Product context<Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Optional extra details" /></label>
            <label className="space-y-2 text-sm">Anonymized evidence<Textarea value={evidenceSummary} onChange={(event) => setEvidenceSummary(event.target.value)} rows={4} placeholder="Known needs or objections; no personal data" /></label>
            <label className="space-y-2 text-sm">Target country<Input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Optional" /></label>
            <label className="space-y-2 text-sm">Currency code<Input value={currency} onChange={(event) => setCurrency(event.target.value)} maxLength={3} placeholder="USD" /></label>
            <label className="space-y-2 text-sm">Product price<Input type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Unknown" /></label>
            <label className="space-y-2 text-sm">Billing period<select className={field} value={pricePeriod} onChange={(event) => setPricePeriod(event.target.value as typeof pricePeriod)}><option value="">Unknown</option><option value="one_time">One-time</option><option value="month">Monthly</option><option value="year">Yearly</option></select></label>
          </div>
        </ProductSection>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={isBusy} onClick={() => mutation.mutate(() => abTestsApi.update(companyId, studyId, { description, evidenceSummary: evidenceSummary || null, marketContext }))}>Save context</Button>
          <Button disabled={isBusy} onClick={async () => { try { await abTestsApi.update(companyId, studyId, { description, evidenceSummary: evidenceSummary || null, marketContext }); await abTestsApi.preview(companyId, studyId); await client.invalidateQueries({ queryKey: ["ab-test", companyId, studyId] }); go("audience"); } catch (cause) { setError(String(cause)); } }}>Generate audience <ArrowRight className="ml-2 size-4" /></Button>
        </div>
      </div>}
      {view === "audience" && <ProductSection title="Audience hypothesis" description="Review the segment assumptions before any paid simulation.">
        <div className="space-y-5 p-4">
          {detail.data.study.draftStatus === "generating" && <p className="rounded-md border border-border bg-muted/40 p-3 text-sm">Agent is generating an audience preview. You can still edit the starter draft; saving it will keep your edits.</p>}
          {detail.data.study.draftStatus === "starter" && <p className="rounded-md border border-border bg-muted/40 p-3 text-sm">Starter audience shown. No agent-generated preview is available yet; review and edit these assumptions.</p>}
          {detail.data.study.draftStatus === "failed" && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">Agent preview failed; the editable starter draft remains available. {detail.data.study.draftError}</p>}
          <div><h3 className="mb-2 text-sm font-medium">Audience segments</h3><div className="grid gap-2 md:grid-cols-2">{audience.map((segment, index) => <div key={index} className="space-y-2 rounded-md border border-border p-3"><Input aria-label={`Segment ${index + 1} name`} value={segment.name} onChange={(event) => setAudience(audience.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} disabled={!!detail.data?.personaCount} /><Input type="number" aria-label={`Segment ${index + 1} share`} value={segment.share} onChange={(event) => setAudience(audience.map((item, itemIndex) => itemIndex === index ? { ...item, share: Number(event.target.value) } : item))} disabled={!!detail.data?.personaCount} /><Input aria-label={`Segment ${index + 1} need`} value={segment.need} onChange={(event) => setAudience(audience.map((item, itemIndex) => itemIndex === index ? { ...item, need: event.target.value } : item))} disabled={!!detail.data?.personaCount} /></div>)}</div><p className="mt-2 text-xs text-muted-foreground">Shares total {audience.reduce((sum, item) => sum + item.share, 0)}%. Audience locks after the first approved run.</p></div>
          <div className="flex gap-2"><Button variant="outline" onClick={() => go("context")}>Back</Button><Button disabled={isBusy || audience.reduce((sum, item) => sum + item.share, 0) !== 100} onClick={async () => { try { if (!detail.data!.personaCount) await abTestsApi.update(companyId, studyId, { audience }); await client.invalidateQueries({ queryKey: ["ab-test", companyId, studyId] }); go("variants"); } catch (cause) { setError(String(cause)); } }}>Continue to variants <ArrowRight className="ml-2 size-4" /></Button></div>
        </div>
      </ProductSection>}
      {view === "variants" && <div className="max-w-4xl space-y-5"><ProductSection title="Compare two offers" description="Change one positioning angle so the feedback is interpretable."><div className="grid gap-4 p-5 md:grid-cols-2"><label className="space-y-2 text-sm">Variant A<Textarea rows={8} value={variantA} onChange={(event) => setVariantA(event.target.value)} /></label><label className="space-y-2 text-sm">Variant B<Textarea rows={8} value={variantB} onChange={(event) => setVariantB(event.target.value)} /></label></div></ProductSection><div className="flex gap-2"><Button variant="outline" onClick={() => go("audience")}>Back</Button><Button disabled={isBusy || variantA.trim().length < 20 || variantB.trim().length < 20} onClick={async () => { try { await abTestsApi.update(companyId, studyId, { variantA, variantB }); await client.invalidateQueries({ queryKey: ["ab-test", companyId, studyId] }); go("run"); } catch (cause) { setError(String(cause)); } }}>Continue to run setup <ArrowRight className="ml-2 size-4" /></Button></div></div>}
      {view === "run" && <ProductSection title="Choose audience size" description="Start with 30 personas, or select 10–1,000 in steps of 10. Count is chosen separately for every run.">
        <div className="space-y-3 p-4 text-sm">
          {!activeRun && <><div className="flex items-end justify-between"><label htmlFor="persona-count" className="font-medium">Synthetic personas</label><strong className="text-2xl">{targetCount}</strong></div><input id="persona-count" type="range" min="10" max="1000" step="10" value={targetCount} onChange={(event) => setTargetCount(Number(event.target.value))} className="w-full accent-primary" /><div className="flex justify-between text-xs text-muted-foreground"><span>10 · quick</span><span>1,000 · extensive</span></div><label className="block max-w-xs space-y-1">Exact count<Input type="number" min="10" max="1000" step="10" value={targetCount} onChange={(event) => setTargetCount(Number(event.target.value))} /></label><p className="text-xs text-muted-foreground">{Math.ceil(targetCount / 20)} planned batches; up to {Math.ceil(targetCount / 20) * 3} attempts with retries. Agent budget limits still apply.</p></>}
          {!!detail.data.runs.length && <label className="block max-w-md space-y-1">Run history<select className={field} value={current?.run.id ?? ""} onChange={(event) => setSelectedRunId(event.target.value)}>{detail.data.runs.map((item) => <option key={item.run.id} value={item.run.id}>{new Date(item.run.createdAt).toLocaleString()} · {item.run.status.replace(/_/g, " ")}</option>)}</select></label>}
          {current && <p>Status: <span className="font-medium">{current.run.status.replace(/_/g, " ")}</span> · {current.run.completedCount}/{current.run.targetCount} responses</p>}
          {current?.run.error && <p className="text-destructive">{current.run.error}</p>}
          {!activeRun && <Button disabled={isBusy || detail.data.study.draftStatus === "generating" || targetCount < 10 || targetCount > 1000 || targetCount % 10 !== 0} onClick={() => mutation.mutate(() => abTestsApi.requestRun(companyId, studyId, targetCount))}>Request simulation</Button>}
          {pending && <div className="space-y-3 rounded-md border border-border bg-muted p-4">
            <label className="block">Agent<select className={field} value={agentId} onChange={(event) => setAgentId(event.target.value)}><option value="">Select CLI agent</option>{agents.data?.filter((agent) => AB_SUPPORTED_ADAPTER_TYPES.some((type) => type === agent.adapterType) && !["paused", "terminated", "pending_approval"].includes(agent.status)).map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>
            {agents.isError && <p className="text-sm text-destructive">Could not load agents: {String(agents.error)}</p>}
            {agents.data && !agents.data.some((agent) => AB_SUPPORTED_ADAPTER_TYPES.some((type) => type === agent.adapterType) && !["paused", "terminated", "pending_approval"].includes(agent.status)) && <p className="text-xs">No compatible CLI agent is active in this company.</p>}
            <label className="flex items-start gap-2"><input type="checkbox" checked={ackSynthetic} onChange={(event) => setAckSynthetic(event.target.checked)} />I understand this is synthetic research, not a real-user test or conversion forecast.</label>
            <label className="flex items-start gap-2"><input type="checkbox" checked={ackCost} onChange={(event) => setAckCost(event.target.checked)} />I approve {Math.ceil(activeRun!.run.targetCount / 20)} planned batches (up to {Math.ceil(activeRun!.run.targetCount / 20) * 3} attempts), subject to budget limits.</label>
            <Button disabled={!agentId || !ackSynthetic || !ackCost || isBusy} onClick={() => mutation.mutate(() => abTestsApi.approve(companyId, studyId, activeRun!.run.id, agentId))}>Approve simulation</Button>
          </div>}
          {activeRun && <Button variant="outline" disabled={isBusy} onClick={() => mutation.mutate(() => abTestsApi.cancel(companyId, studyId, activeRun.run.id))}>Cancel run</Button>}
        </div>
      </ProductSection>}
      {(!view || view === "results") && !current && <ProductSection title="Continue this study" description="Review optional context, generate an audience, then compare two offers."><div className="p-4"><Button asChild><Link to={`/ab-testing/${studyId}/context`}>Review project context <ArrowRight className="ml-2 size-4" /></Link></Button></div></ProductSection>}
      {(!view || view === "results") && <div className="space-y-5"><div className="grid gap-4 md:grid-cols-3"><ProductSection title="Project context"><div className="p-4 text-sm text-muted-foreground">{detail.data.study.auditReport?.summary || detail.data.study.description || "Context not available"}</div></ProductSection><ProductSection title="Audience"><div className="p-4 text-sm">{current?.run.completedCount ?? 0} completed personas</div></ProductSection><ProductSection title="Latest run"><div className="p-4 text-sm">{current ? `${current.run.status} · ${current.run.completedCount}/${current.run.targetCount}` : "No simulation yet"}</div></ProductSection></div>{current && <><ProductSection title="Run progress" description="Feedback appears after each completed batch."><div className="space-y-3 p-4"><progress className="sr-only" max={current.run.targetCount} value={current.run.completedCount} aria-label="Simulation progress" /><div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, current.run.completedCount / current.run.targetCount * 100)}%` }} /></div><p className="text-sm text-muted-foreground">{current.run.completedCount} of {current.run.targetCount} synthetic responses · {current.run.status}</p></div></ProductSection>{current.run.completedCount > 0 && <ProductSection title="Illustrative response per 1,000 exposures" description="Scaled from synthetic ratings, not a conversion forecast or confidence interval."><div className="grid gap-3 p-4 md:grid-cols-2">{(["A", "B"] as const).map((variant) => <div key={variant} className="rounded-md border border-border p-3 text-sm"><div className="font-medium">Variant {variant}</div><div className="mt-2 text-muted-foreground">Low {current.scenarios[variant].low} · Base {current.scenarios[variant].base} · High {current.scenarios[variant].high}</div><div className="mt-1 text-xs text-muted-foreground">Based on {Object.values(current.counts[variant]).reduce((sum, count) => sum + count, 0)} simulated responses; small samples are especially uncertain.</div></div>)}</div></ProductSection>}</>}<div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to={`/ab-testing/${studyId}/run`}>{current ? "Run setup" : "Start a run"}</Link></Button><Button asChild variant="outline"><Link to={`/ab-testing/${studyId}/personas`}>Browse personas</Link></Button><Button asChild variant="outline"><Link to={`/ab-testing/${studyId}/feedback`}>Feedback board</Link></Button></div></div>}
      {view === "personas" && <ProductSection title="Synthetic personas" description="Fictional profiles. Unsupported demographic details are assumptions, not observed people."><div className="space-y-3 p-4">{personas.isError && <p role="alert" className="text-sm text-destructive">Could not load personas: {String(personas.error)}</p>}{personaPages.map((persona) => <article key={persona.id} className="space-y-2 rounded-lg border border-border p-4 text-sm"><div className="font-semibold">{String(persona.profile.name ?? persona.profile.role ?? persona.segment)} · Variant {persona.assignedVariant}</div><p>{String(persona.profile.role ?? persona.segment)} · {String(persona.profile.industry ?? "Industry not recorded")}</p><p className="text-muted-foreground">{[persona.profile.city, persona.profile.state, persona.profile.country].filter(Boolean).join(", ") || "Location not recorded"}</p><p>Income: {persona.profile.annualIncome == null ? "unknown" : `${persona.profile.currency} ${persona.profile.annualIncome}/year`} · Salary: {persona.profile.annualSalary == null ? "unknown" : `${persona.profile.currency} ${persona.profile.annualSalary}/year`} · Spending limit: {persona.profile.spendingLimit == null ? "unknown" : `${persona.profile.currency} ${persona.profile.spendingLimit}`}</p><p>Routine: {Array.isArray(persona.profile.dailyRoutine) ? persona.profile.dailyRoutine.join(" · ") : "Not recorded"}</p><p className="text-xs text-muted-foreground">Assumptions: {Array.isArray(persona.profile.assumptions) ? persona.profile.assumptions.join(" · ") : "Legacy profile"}</p></article>)}{personas.isLoading && <Loader2 className="size-4 animate-spin" />}{personas.data?.nextCursor != null && <Button variant="outline" onClick={() => setPersonaCursor(personas.data!.nextCursor!)}>Load more</Button>}{!personaPages.length && !personas.isLoading && <p className="text-sm text-muted-foreground">Personas appear as simulation batches complete.</p>}</div></ProductSection>}
      {view === "feedback" && (current ? <FeedbackBoard companyId={companyId} studyId={studyId} run={current} /> : <p className="text-sm text-muted-foreground">Start a simulation to see feedback.</p>)}
    </>}
  </ProductPage>;
}
