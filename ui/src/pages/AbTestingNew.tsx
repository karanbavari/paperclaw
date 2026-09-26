import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, FlaskConical, Loader2 } from "lucide-react";
import { Link, useNavigate } from "@/lib/router";
import { useCompany } from "@/context/CompanyContext";
import { ProductPage, ProductPageHeader, ProductSection } from "@/components/ProductPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { abTestsApi } from "@/api/abTests";
import { projectsApi } from "@/api/projects";

const selectClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground";

export function AbTestingNew() {
  const { selectedCompanyId } = useCompany();
  const companyId = selectedCompanyId ?? "";
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const projects = useQuery({ queryKey: ["ab-projects", companyId], queryFn: () => projectsApi.list(companyId), enabled: !!companyId });
  const workspaces = useQuery({ queryKey: ["ab-workspaces", companyId, projectId], queryFn: () => projectsApi.listWorkspaces(projectId, companyId), enabled: !!companyId && !!projectId });
  const create = useMutation({ mutationFn: async () => {
    const projectName = projects.data?.find((project) => project.id === projectId)?.name ?? "Product";
    return abTestsApi.create(companyId, { projectId, workspaceId, title: title.trim() || `${projectName} positioning study`, description });
  }, onSuccess: (study) => navigate(`/ab-testing/${study.id}/context`), onError: (cause) => setError(String(cause)) });
  const eligible = workspaces.data?.filter((item) => item.cwd && ["local_path", "non_git_path", "git_repo"].includes(item.sourceType)) ?? [];
  return <ProductPage>
    <ProductPageHeader title="New A/B study" description="Start with the project. We'll audit a bounded selection of product files before generating an audience." icon={FlaskConical}
      actions={<Button asChild variant="outline"><Link to="/ab-testing"><ArrowLeft className="mr-2 size-4" />All studies</Link></Button>} />
    <div className="max-w-3xl space-y-5">
      <p className="text-sm text-muted-foreground">Step 1 of 5 · Choose your product</p>
      <ProductSection title="Project directory" description="The audit is read-only. No project files will be modified.">
        <div className="space-y-5 p-5">
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <label className="block space-y-2 text-sm font-medium">Project<select className={selectClass} value={projectId} onChange={(event) => { setProjectId(event.target.value); setWorkspaceId(""); }}><option value="">Select project</option>{projects.data?.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
          {projects.isError && <p className="text-sm text-destructive">Could not load projects: {String(projects.error)}</p>}
          <label className="block space-y-2 text-sm font-medium">Registered local directory<select className={selectClass} value={workspaceId} onChange={(event) => setWorkspaceId(event.target.value)} disabled={!projectId}><option value="">Select directory</option>{eligible.map((item) => <option key={item.id} value={item.id}>{item.cwd}</option>)}</select></label>
          {workspaces.isError && <p className="text-sm text-destructive">Could not load directories: {String(workspaces.error)}</p>}
          {projectId && workspaces.data && eligible.length === 0 && <p className="text-sm text-muted-foreground">Register a local directory in Project settings first.</p>}
          <label className="block space-y-2 text-sm font-medium">Study name <span className="font-normal text-muted-foreground">(optional)</span><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="New positioning study" /></label>
          <label className="block space-y-2 text-sm font-medium">Extra product context <span className="font-normal text-muted-foreground">(optional, useful when the directory has no product documentation)</span><Textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What does this product do?" /></label>
          <Button disabled={!workspaceId || create.isPending} onClick={() => create.mutate()}>{create.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}Audit project <ArrowRight className="ml-2 size-4" /></Button>
        </div>
      </ProductSection>
    </div>
  </ProductPage>;
}
