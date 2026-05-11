import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DirectChatDetail, DirectChatMessage } from "@kesarcloud/shared";
import { AlertCircle, Loader2, MessageCircle, Send } from "lucide-react";
import { directChatApi } from "../api/directChat";
import { useCompany } from "../context/CompanyContext";
import { queryKeys } from "../lib/queryKeys";
import { cn, formatDateTime, relativeTime } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MarkdownBody } from "@/components/MarkdownBody";
import { AgentIcon } from "@/components/AgentIconPicker";

function hasPendingResponse(chat: DirectChatDetail | undefined) {
  return chat?.messages.some((message) => message.status === "queued" || message.status === "running") ?? false;
}

function authorLabel(message: DirectChatMessage, chat: DirectChatDetail) {
  if (message.authorType === "board") return "Board";
  if (message.authorType === "system") return "System";
  return message.authorAgent?.name ?? chat.ceoAgent?.name ?? "CEO";
}

function MessageBubble({ message, chat }: { message: DirectChatMessage; chat: DirectChatDetail }) {
  const isBoard = message.authorType === "board";
  const pending = message.status === "queued" || message.status === "running";
  const failed = message.status === "failed";

  return (
    <div className={cn("flex gap-3 px-5 py-4", isBoard && "bg-muted/30")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground",
          isBoard && "bg-primary text-primary-foreground",
          failed && "border-destructive/40 text-destructive",
        )}
      >
        {message.authorType === "agent" ? (
          <AgentIcon icon={message.authorAgent?.icon ?? chat.ceoAgent?.icon} className="h-4 w-4" />
        ) : failed ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{authorLabel(message, chat)}</span>
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
            <p className="text-muted-foreground">Waiting for CEO response...</p>
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

function EmptyDirectChat() {
  return (
    <div className="flex flex-1 items-center justify-center p-6 text-center">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        </div>
        <h1 className="mt-4 text-base font-semibold">Direct Chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start the first Board and CEO exchange.</p>
      </div>
    </div>
  );
}

export function DirectChat() {
  const { selectedCompanyId } = useCompany();
  const queryClient = useQueryClient();
  const [composer, setComposer] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const chatQuery = useQuery({
    queryKey: selectedCompanyId ? queryKeys.directChat.detail(selectedCompanyId) : ["direct-chat", "none"],
    queryFn: () => directChatApi.get(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    refetchInterval: (query) => hasPendingResponse(query.state.data as DirectChatDetail | undefined) ? 2500 : false,
  });

  const chat = chatQuery.data;
  const latestMessageKey = useMemo(
    () => chat?.messages.map((message) => `${message.id}:${message.status}:${message.updatedAt}`).join("|") ?? "",
    [chat?.messages],
  );

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [latestMessageKey]);

  const messageMutation = useMutation({
    mutationFn: (input: { body: string }) => directChatApi.addMessage(selectedCompanyId!, input),
    onSuccess: async (nextChat) => {
      setComposer("");
      queryClient.setQueryData(queryKeys.directChat.detail(selectedCompanyId!), nextChat);
      await queryClient.invalidateQueries({ queryKey: queryKeys.directChat.detail(selectedCompanyId!) });
    },
  });

  function sendMessage() {
    const body = composer.trim();
    if (!body || messageMutation.isPending) return;
    messageMutation.mutate({ body });
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    sendMessage();
  }

  if (!selectedCompanyId) {
    return <div className="p-6 text-sm text-muted-foreground">Select a company to open Direct Chat.</div>;
  }

  if (chatQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading Direct Chat...
      </div>
    );
  }

  if (chatQuery.error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md rounded-md border border-border bg-background p-5 text-center">
          <AlertCircle className="mx-auto h-6 w-6 text-destructive" />
          <h1 className="mt-3 text-base font-semibold">Direct Chat unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {chatQuery.error instanceof Error ? chatQuery.error.message : "Unable to load Direct Chat."}
          </p>
        </div>
      </div>
    );
  }

  if (!chat) return null;

  const ceo = chat.ceoAgent;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
            <AgentIcon icon={ceo?.icon} className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold">Direct Chat</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate">{ceo?.name ?? "CEO"}</span>
              {ceo?.title || ceo?.role ? <span>{ceo.title ?? ceo.role}</span> : null}
              {chat.latestMessageAt ? <span>{relativeTime(chat.latestMessageAt)}</span> : null}
            </div>
          </div>
        </div>
        <Badge variant={ceo?.status === "paused" ? "destructive" : "outline"}>
          {ceo?.status ?? "unknown"}
        </Badge>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {chat.messages.length === 0 ? (
          <EmptyDirectChat />
        ) : (
          chat.messages.map((message) => (
            <MessageBubble key={message.id} message={message} chat={chat} />
          ))
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-background p-4">
        {messageMutation.error ? (
          <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {messageMutation.error instanceof Error ? messageMutation.error.message : "Message failed."}
          </div>
        ) : null}
        <div className="flex gap-2">
          <Textarea
            value={composer}
            onChange={(event) => setComposer(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Message the CEO"
            className="min-h-16 resize-none"
          />
          <Button
            className="self-end"
            onClick={sendMessage}
            disabled={messageMutation.isPending || !composer.trim()}
          >
            {messageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
