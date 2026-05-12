import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, Loader2, Play, Wrench, XCircle } from "lucide-react";
import type {
  PluginStatus,
  PluginToolConsoleDescriptor,
  PluginToolConsoleTestResult,
} from "@kesarcloud/shared";
import { pluginsApi } from "@/api/plugins";
import { ApiError } from "@/api/client";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  JsonSchemaForm,
  getDefaultValues,
  validateJsonSchemaForm,
  type JsonSchemaNode,
} from "@/components/JsonSchemaForm";

interface PluginToolTestConsoleProps {
  pluginId: string;
  companyId: string | null;
  pluginStatus: PluginStatus;
}

export function PluginToolTestConsole({ pluginId, companyId, pluginStatus }: PluginToolTestConsoleProps) {
  const queryClient = useQueryClient();
  const [selectedToolName, setSelectedToolName] = useState<string | null>(null);
  const [parameters, setParameters] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agentId, setAgentId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [result, setResult] = useState<PluginToolConsoleTestResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const toolsQuery = useQuery({
    queryKey: queryKeys.plugins.tools(pluginId),
    queryFn: () => pluginsApi.listTools(pluginId),
    enabled: !!pluginId,
    refetchInterval: 30000,
  });

  const failuresQuery = useQuery({
    queryKey: [...queryKeys.plugins.logs(pluginId), "errors"],
    queryFn: () => pluginsApi.logs(pluginId, { level: "error", limit: 8 }),
    enabled: !!pluginId && pluginStatus === "ready",
    refetchInterval: 30000,
  });

  const tools = toolsQuery.data?.tools ?? [];
  const selectedTool = useMemo(
    () => tools.find((tool) => tool.name === selectedToolName) ?? tools[0] ?? null,
    [selectedToolName, tools],
  );

  useEffect(() => {
    if (!selectedTool && selectedToolName !== null) {
      setSelectedToolName(null);
    }
    if (!selectedToolName && tools[0]) {
      setSelectedToolName(tools[0].name);
    }
  }, [selectedTool, selectedToolName, tools]);

  useEffect(() => {
    if (!selectedTool) {
      setParameters({});
      setErrors({});
      setResult(null);
      return;
    }
    setParameters(getDefaultValues(selectedTool.parametersSchema as JsonSchemaNode));
    setErrors({});
    setResult(null);
    setApiError(null);
  }, [selectedTool?.name]);

  const mutation = useMutation({
    mutationFn: (tool: PluginToolConsoleDescriptor) =>
      pluginsApi.testTool(pluginId, tool.name, {
        companyId: companyId!,
        parameters,
        agentId: agentId.trim() || null,
        projectId: projectId.trim() || null,
      }),
    onSuccess: (response) => {
      setResult(response);
      setApiError(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.plugins.logs(pluginId) });
    },
    onError: (error) => {
      const body = error instanceof ApiError ? error.body : null;
      const maybeResult = body as Partial<PluginToolConsoleTestResult> | null;
      if (maybeResult?.invocationId && maybeResult.result) {
        setResult(maybeResult as PluginToolConsoleTestResult);
      }
      setApiError(error instanceof Error ? error.message : "Tool test failed");
    },
  });

  const workerStatus = toolsQuery.data?.workerStatus ?? "unavailable";
  const canRun = Boolean(
    companyId
    && selectedTool
    && pluginStatus === "ready"
    && workerStatus === "running"
    && !mutation.isPending,
  );

  function runSelectedTool() {
    if (!selectedTool || !companyId) return;
    const validationErrors = validateJsonSchemaForm(
      selectedTool.parametersSchema as JsonSchemaNode,
      parameters,
    );
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setApiError(null);
    mutation.mutate(selectedTool);
  }

  if (toolsQuery.isLoading) {
    return <div className="text-sm text-muted-foreground">Loading plugin tools...</div>;
  }

  if (toolsQuery.error) {
    return (
      <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {toolsQuery.error instanceof Error ? toolsQuery.error.message : "Unable to load plugin tools"}
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4" />
            Plugin Tools
          </CardTitle>
          <CardDescription>No registered tools are available for this plugin.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Tools</h2>
          <Badge variant={workerStatus === "running" ? "default" : "secondary"}>{workerStatus}</Badge>
        </div>
        <div className="space-y-2">
          {tools.map((tool) => {
            const selected = selectedTool?.name === tool.name;
            return (
              <button
                key={tool.name}
                type="button"
                onClick={() => setSelectedToolName(tool.name)}
                className={`w-full rounded-md border px-3 py-2 text-left transition ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border/70 bg-background hover:bg-muted/40"
                }`}
              >
                <span className="block truncate text-sm font-medium">{tool.displayName}</span>
                <span className="block truncate font-mono text-[11px] text-muted-foreground">{tool.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {selectedTool ? (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-base">{selectedTool.displayName}</CardTitle>
                  <CardDescription>{selectedTool.description}</CardDescription>
                </div>
                <Badge variant="outline" className="font-mono">{selectedTool.name}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {pluginStatus !== "ready" || workerStatus !== "running" ? (
                <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Tool tests are available when the plugin is ready and its worker is running.</span>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Run only test-safe inputs; plugin tools may perform the action their handler implements.</span>
                </div>
              )}

              {!companyId ? (
                <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                  Select a company before running a tool test.
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="plugin-tool-agent-id">Agent ID</label>
                  <Input
                    id="plugin-tool-agent-id"
                    value={agentId}
                    onChange={(event) => setAgentId(event.target.value)}
                    placeholder="Optional"
                    disabled={mutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="plugin-tool-project-id">Project ID</label>
                  <Input
                    id="plugin-tool-project-id"
                    value={projectId}
                    onChange={(event) => setProjectId(event.target.value)}
                    placeholder="Optional"
                    disabled={mutation.isPending}
                  />
                </div>
              </div>

              <Separator />

              <JsonSchemaForm
                schema={selectedTool.parametersSchema as JsonSchemaNode}
                values={parameters}
                onChange={setParameters}
                errors={errors}
                disabled={mutation.isPending}
              />

              <div className="flex items-center gap-3">
                <Button onClick={runSelectedTool} disabled={!canRun}>
                  {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Run tool
                </Button>
                {apiError ? <span className="text-sm text-destructive">{apiError}</span> : null}
              </div>

              {result ? <ToolResultPanel result={result} /> : null}
            </CardContent>
          </Card>
        ) : null}

        {failuresQuery.data && failuresQuery.data.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Failures</CardTitle>
              <CardDescription>Latest error-level plugin logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {failuresQuery.data.map((entry) => (
                  <div key={entry.id} className="rounded-md bg-muted/40 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-destructive" title={entry.message}>{entry.message}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function ToolResultPanel({ result }: { result: PluginToolConsoleTestResult }) {
  const failed = Boolean(result.error ?? result.result.error);
  return (
    <div className={`rounded-md border px-3 py-3 text-sm ${
      failed ? "border-destructive/30 bg-destructive/10" : "border-green-500/30 bg-green-500/10"
    }`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-medium">
          {failed ? <XCircle className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
          <span>{failed ? "Tool test failed" : "Tool test completed"}</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{result.durationMs}ms</span>
      </div>
      {result.result.content ? (
        <p className="whitespace-pre-wrap leading-6">{result.result.content}</p>
      ) : null}
      {result.result.error ? (
        <p className="whitespace-pre-wrap text-destructive">{result.result.error}</p>
      ) : null}
      {result.result.data !== undefined ? (
        <pre className="mt-3 max-h-80 overflow-auto rounded bg-background/80 p-3 text-xs">
          {JSON.stringify(result.result.data, null, 2)}
        </pre>
      ) : null}
      <div className="mt-2 font-mono text-[11px] text-muted-foreground">
        invocation {result.invocationId}
      </div>
    </div>
  );
}
