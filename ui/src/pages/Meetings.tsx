import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Agent, MeetingDetail, MeetingMessage, MeetingSummary } from "@kesarcloud/shared";
import {
  Loader2,
  MessageSquarePlus,
  MessagesSquare,
  Plus,
  Send,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "@/lib/router";
import { meetingsApi } from "../api/meetings";
import { agentsApi } from "../api/agents";
import { useCompany } from "../context/CompanyContext";
import { queryKeys } from "../lib/queryKeys";
import { cn, formatDateTime, relativeTime } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownBody } from "@/components/MarkdownBody";
import { AgentIcon } from "@/components/AgentIconPicker";

function hasPendingMeetingResponse(meeting: MeetingDetail | undefined) {
  return meeting?.messages.some((message) => message.status === "queued" || message.status === "running") ?? false;
}

function isBlockedAgentStatus(status: Agent["status"]) {
  return status === "paused" || status === "pending_approval" || status === "terminated";
}

function invokableAgents(agents: Agent[]) {
  return agents.filter((agent) => !isBlockedAgentStatus(agent.status));
}

function authorLabel(message: MeetingMessage) {
  if (message.authorType === "board") return "Board";
  if (message.authorType === "system") return "System";
  return message.authorAgent?.name ?? "Agent";
}

function MeetingListItem({
  meeting,
  active,
}: {
  meeting: MeetingSummary;
  active: boolean;
}) {
  return (
    <Link
      to={`/meetings/${meeting.id}`}
      className={cn(
        "block border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-accent/40",
        active && "bg-accent text-foreground",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{meeting.title}</div>
          <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{meeting.topic}</div>
        </div>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {meeting.participantCount}
        </Badge>
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">
        {meeting.latestMessageAt ? relativeTime(meeting.latestMessageAt) : relativeTime(meeting.createdAt)}
      </div>
    </Link>
  );
}

function AgentPill({ agent }: { agent: Agent }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs",
        isBlockedAgentStatus(agent.status) && "opacity-60",
      )}
    >
      <AgentIcon icon={agent.icon} className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="max-w-32 truncate">{agent.name}</span>
      {agent.status !== "active" ? <span className="text-muted-foreground">({agent.status})</span> : null}
    </span>
  );
}

function targetName(message: MeetingMessage) {
  const value = message.metadata?.targetAgentId;
  return typeof value === "string" ? value : null;
}

function MessageBubble({ message, agentMap }: { message: MeetingMessage; agentMap: Map<string, Agent> }) {
  const isBoard = message.authorType === "board";
  const isAgent = message.authorType === "agent";
  const pending = message.status === "queued" || message.status === "running";
  const failed = message.status === "failed";
  const targetAgentId = isBoard ? targetName(message) : null;
  const targetAgent = targetAgentId ? agentMap.get(targetAgentId) : null;

  return (
    <div className={cn("flex gap-3 px-5 py-4", isBoard && "bg-muted/30")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground",
          isBoard && "bg-primary text-primary-foreground",
          failed && "border-destructive/40 text-destructive",
        )}
      >
        {isAgent ? (
          <AgentIcon icon={message.authorAgent?.icon} className="h-4 w-4" />
        ) : (
          <MessagesSquare className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{authorLabel(message)}</span>
          {targetAgent ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              to <AgentIcon icon={targetAgent.icon} className="h-3 w-3" /> {targetAgent.name}
            </span>
          ) : null}
          <span className="text-xs text-muted-foreground">{formatDateTime(message.createdAt)}</span>
          {pending ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {message.status === "queued" ? "Queued" : "Running"}
            </span>
          ) : null}
          {failed ? <span className="text-xs text-destructive">Failed</span> : null}
        </div>
        <div className="mt-2 text-sm leading-6">
          {message.body.trim() ? (
            <MarkdownBody>{message.body}</MarkdownBody>
          ) : pending ? (
            <p className="text-muted-foreground">Waiting for response...</p>
          ) : (
            <p className="text-muted-foreground">No response captured.</p>
          )}
        </div>
        {message.error ? (
          <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {message.error}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NewMeetingPanel({
  agents,
  creating,
  onCreate,
  onCancel,
}: {
  agents: Agent[];
  creating: boolean;
  onCreate: (input: { title: string; topic: string; agentIds: string[] }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [agentIds, setAgentIds] = useState<string[]>([]);

  function toggleAgent(agentId: string) {
    setAgentIds((current) =>
      current.includes(agentId)
        ? current.filter((id) => id !== agentId)
        : [...current, agentId],
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
          New Meeting
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onCancel}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Title</label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Product decision meeting" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Topic</label>
          <Textarea
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="What should the Board decide?"
            className="min-h-32 resize-none"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Agents</label>
            <span className="text-xs text-muted-foreground">{agentIds.length} selected</span>
          </div>
          <div className="rounded-md border border-border">
            {agents.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground">No available agents.</div>
            ) : (
              agents.map((agent) => (
                <label
                  key={agent.id}
                  className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0 hover:bg-accent/40"
                >
                  <Checkbox checked={agentIds.includes(agent.id)} onCheckedChange={() => toggleAgent(agent.id)} />
                  <AgentIcon icon={agent.icon} className="h-4 w-4 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-sm">{agent.name}</span>
                  <span className="text-xs text-muted-foreground">{agent.title ?? agent.role}</span>
                </label>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 justify-end gap-2 border-t border-border p-4">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onCreate({ title, topic, agentIds })}
          disabled={creating || !title.trim() || !topic.trim() || agentIds.length === 0}
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create
        </Button>
      </div>
    </div>
  );
}

export function Meetings() {
  const { selectedCompanyId } = useCompany();
  const { meetingId } = useParams<{ meetingId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [composer, setComposer] = useState("");
  const [targetAgentId, setTargetAgentId] = useState("");

  const meetingsQuery = useQuery({
    queryKey: selectedCompanyId ? queryKeys.meetings.list(selectedCompanyId) : ["meetings", "none"],
    queryFn: () => meetingsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });
  const agentsQuery = useQuery({
    queryKey: selectedCompanyId ? queryKeys.agents.list(selectedCompanyId) : ["agents", "none"],
    queryFn: () => agentsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });
  const agents = useMemo(() => invokableAgents(agentsQuery.data ?? []), [agentsQuery.data]);
  const agentMap = useMemo(() => new Map((agentsQuery.data ?? []).map((agent) => [agent.id, agent])), [agentsQuery.data]);
  const activeMeetingId = meetingId ?? meetingsQuery.data?.[0]?.id ?? null;
  const detailQuery = useQuery({
    queryKey: selectedCompanyId && activeMeetingId
      ? queryKeys.meetings.detail(selectedCompanyId, activeMeetingId)
      : ["meetings", "detail", "none"],
    queryFn: () => meetingsApi.get(selectedCompanyId!, activeMeetingId!),
    enabled: !!selectedCompanyId && !!activeMeetingId && !showNewMeeting,
    refetchInterval: (query) => hasPendingMeetingResponse(query.state.data as MeetingDetail | undefined) ? 2500 : false,
  });

  useEffect(() => {
    if (!meetingId && meetingsQuery.data?.[0]?.id && !showNewMeeting) {
      navigate(`/meetings/${meetingsQuery.data[0].id}`, { replace: true });
    }
  }, [meetingId, meetingsQuery.data, navigate, showNewMeeting]);

  const meeting = detailQuery.data;
  const targetAgents = useMemo(
    () => meeting?.participants
      .map((participant) => participant.agent)
      .filter((agent): agent is Agent => Boolean(agent && !isBlockedAgentStatus(agent.status))) ?? [],
    [meeting],
  );

  useEffect(() => {
    if (targetAgents.length === 0) {
      setTargetAgentId("");
      return;
    }
    if (!targetAgents.some((agent) => agent.id === targetAgentId)) {
      setTargetAgentId(targetAgents[0]!.id);
    }
  }, [targetAgentId, targetAgents]);

  const invalidateMeetings = async (id?: string | null) => {
    if (!selectedCompanyId) return;
    await queryClient.invalidateQueries({ queryKey: queryKeys.meetings.list(selectedCompanyId) });
    if (id) await queryClient.invalidateQueries({ queryKey: queryKeys.meetings.detail(selectedCompanyId, id) });
  };

  const createMutation = useMutation({
    mutationFn: (input: { title: string; topic: string; agentIds: string[] }) => meetingsApi.create(selectedCompanyId!, input),
    onSuccess: async (createdMeeting) => {
      setShowNewMeeting(false);
      await invalidateMeetings(createdMeeting.id);
      navigate(`/meetings/${createdMeeting.id}`);
    },
  });
  const messageMutation = useMutation({
    mutationFn: (input: { body: string; targetAgentId: string }) =>
      meetingsApi.addMessage(selectedCompanyId!, activeMeetingId!, input),
    onSuccess: async () => {
      setComposer("");
      await invalidateMeetings(activeMeetingId);
    },
  });

  if (!selectedCompanyId) {
    return <div className="p-6 text-sm text-muted-foreground">Select a company to open meetings.</div>;
  }

  return (
    <div className="flex h-full min-h-0 bg-background">
      <aside className="hidden w-80 shrink-0 border-r border-border md:flex md:flex-col">
        <div className="flex h-12 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessagesSquare className="h-4 w-4 text-muted-foreground" />
            Meetings
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setShowNewMeeting(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {meetingsQuery.isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading meetings...</div>
          ) : meetingsQuery.data?.length ? (
            meetingsQuery.data.map((item) => (
              <MeetingListItem key={item.id} meeting={item} active={item.id === activeMeetingId && !showNewMeeting} />
            ))
          ) : (
            <div className="p-4 text-sm text-muted-foreground">No meetings yet.</div>
          )}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        {showNewMeeting ? (
          <NewMeetingPanel
            agents={agents}
            creating={createMutation.isPending}
            onCreate={(input) => createMutation.mutate(input)}
            onCancel={() => setShowNewMeeting(false)}
          />
        ) : meeting ? (
          <>
            <div className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold">{meeting.title}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {meeting.participants.map((participant) =>
                    participant.agent ? <AgentPill key={participant.id} agent={participant.agent} /> : null,
                  )}
                </div>
              </div>
              <Badge variant="outline">{meeting.status}</Badge>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="border-b border-border bg-muted/20 px-5 py-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Topic</div>
                <div className="mt-2 text-sm leading-6">
                  <MarkdownBody>{meeting.topic}</MarkdownBody>
                </div>
              </div>
              {meeting.messages.map((message) => (
                <MessageBubble key={message.id} message={message} agentMap={agentMap} />
              ))}
            </div>

            <div className="shrink-0 border-t border-border bg-background p-4">
              <div className="mb-3 flex items-center gap-2">
                <Select value={targetAgentId} onValueChange={setTargetAgentId} disabled={targetAgents.length === 0}>
                  <SelectTrigger className="w-64 max-w-full">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <AgentIcon icon={agent.icon} className="h-3.5 w-3.5" />
                          <span className="truncate">{agent.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">
                  {targetAgents.length === 0 ? "No available meeting agents" : "Ask one agent directly"}
                </span>
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={composer}
                  onChange={(event) => setComposer(event.target.value)}
                  placeholder="Ask the selected agent"
                  className="min-h-16 resize-none"
                />
                <Button
                  className="self-end"
                  onClick={() => messageMutation.mutate({ body: composer, targetAgentId })}
                  disabled={messageMutation.isPending || !composer.trim() || !targetAgentId}
                >
                  {messageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Ask
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted">
              <MessagesSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold">No meeting selected</h1>
              <p className="mt-1 text-sm text-muted-foreground">Create a meeting to begin.</p>
            </div>
            <Button onClick={() => setShowNewMeeting(true)}>
              <Plus className="h-4 w-4" />
              New Meeting
            </Button>
          </div>
        )}
      </main>

      <div className="fixed bottom-20 right-4 md:hidden">
        <Button size="icon" onClick={() => setShowNewMeeting(true)}>
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
