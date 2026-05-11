// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DirectChat } from "./DirectChat";

const directChatApiMock = vi.hoisted(() => ({
  get: vi.fn(),
  addMessage: vi.fn(),
}));

vi.mock("../api/directChat", () => ({
  directChatApi: directChatApiMock,
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({ selectedCompanyId: "company-1" }),
}));

vi.mock("@/components/MarkdownBody", () => ({
  MarkdownBody: ({ children }: { children: string }) => <div>{children}</div>,
}));

vi.mock("@/components/AgentIconPicker", () => ({
  AgentIcon: () => <span data-testid="agent-icon" />,
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function directChatDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: "thread-1",
    companyId: "company-1",
    kind: "board_ceo",
    ceoAgentId: "agent-ceo",
    ceoAgent: {
      id: "agent-ceo",
      companyId: "company-1",
      name: "CEO",
      urlKey: "ceo",
      role: "ceo",
      title: "Chief Executive Officer",
      icon: null,
      status: "active",
      reportsTo: null,
      capabilities: null,
      adapterType: "codex_local",
      adapterConfig: {},
      runtimeConfig: {},
      defaultEnvironmentId: null,
      budgetMonthlyCents: 0,
      spentMonthlyCents: 0,
      pauseReason: null,
      pausedAt: null,
      permissions: { canCreateAgents: false },
      lastHeartbeatAt: null,
      metadata: null,
      createdAt: new Date("2026-05-11T10:00:00.000Z"),
      updatedAt: new Date("2026-05-11T10:00:00.000Z"),
    },
    latestMessageAt: null,
    messages: [],
    createdAt: new Date("2026-05-11T10:00:00.000Z"),
    updatedAt: new Date("2026-05-11T10:00:00.000Z"),
    ...overrides,
  };
}

async function flushReact() {
  await act(async () => {
    await Promise.resolve();
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  });
}

describe("DirectChat", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    directChatApiMock.get.mockResolvedValue(directChatDetail());
    directChatApiMock.addMessage.mockResolvedValue(directChatDetail());
  });

  afterEach(() => {
    container.remove();
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("renders the standalone direct chat surface", async () => {
    const root = createRoot(container);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <DirectChat />
        </QueryClientProvider>,
      );
    });
    await flushReact();

    expect(container.textContent).toContain("Direct Chat");
    expect(container.textContent).toContain("Start the first Board and CEO exchange.");

    await act(async () => {
      root.unmount();
    });
  });

  it("sends a message with Enter and keeps Shift+Enter as a newline", async () => {
    const root = createRoot(container);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <DirectChat />
        </QueryClientProvider>,
      );
    });
    await flushReact();

    const textarea = container.querySelector("textarea")!;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
      setter?.call(textarea, "Hello CEO");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", shiftKey: true, bubbles: true }));
    });
    expect(directChatApiMock.addMessage).not.toHaveBeenCalled();

    await act(async () => {
      textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    await flushReact();

    expect(directChatApiMock.addMessage).toHaveBeenCalledWith("company-1", { body: "Hello CEO" });

    await act(async () => {
      root.unmount();
    });
  });
});
