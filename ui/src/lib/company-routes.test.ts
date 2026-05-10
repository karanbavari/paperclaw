import { describe, expect, it } from "vitest";
import {
  applyCompanyPrefix,
  extractCompanyPrefixFromPath,
  isBoardPathWithoutPrefix,
  toCompanyRelativePath,
} from "./company-routes";

describe("company routes", () => {
  it("treats execution workspace paths as board routes that need a company prefix", () => {
    expect(isBoardPathWithoutPrefix("/execution-workspaces/workspace-123")).toBe(true);
    expect(isBoardPathWithoutPrefix("/execution-workspaces/workspace-123/routines")).toBe(true);
    expect(extractCompanyPrefixFromPath("/execution-workspaces/workspace-123")).toBeNull();
    expect(applyCompanyPrefix("/execution-workspaces/workspace-123", "PAP")).toBe(
      "/PAP/execution-workspaces/workspace-123",
    );
    expect(applyCompanyPrefix("/execution-workspaces/workspace-123/routines", "PAP")).toBe(
      "/PAP/execution-workspaces/workspace-123/routines",
    );
  });

  it("normalizes prefixed execution workspace paths back to company-relative paths", () => {
    expect(toCompanyRelativePath("/PAP/execution-workspaces/workspace-123")).toBe(
      "/execution-workspaces/workspace-123",
    );
    expect(toCompanyRelativePath("/PAP/execution-workspaces/workspace-123/routines")).toBe(
      "/execution-workspaces/workspace-123/routines",
    );
  });

  it("treats /search as a board route that needs a company prefix", () => {
    expect(isBoardPathWithoutPrefix("/search")).toBe(true);
    expect(extractCompanyPrefixFromPath("/search")).toBeNull();
    expect(applyCompanyPrefix("/search", "PAP")).toBe("/PAP/search");
    expect(applyCompanyPrefix("/search?q=hello%20world", "PAP")).toBe("/PAP/search?q=hello%20world");
    expect(toCompanyRelativePath("/PAP/search?q=foo")).toBe("/search?q=foo");
  });

  it("treats /memory as a board route that needs a company prefix", () => {
    expect(isBoardPathWithoutPrefix("/memory")).toBe(true);
    expect(extractCompanyPrefixFromPath("/memory")).toBeNull();
    expect(applyCompanyPrefix("/memory", "KES")).toBe("/KES/memory");
    expect(toCompanyRelativePath("/KES/memory")).toBe("/memory");
  });

  it("treats /marketplace as a board route that needs a company prefix", () => {
    expect(isBoardPathWithoutPrefix("/marketplace")).toBe(true);
    expect(extractCompanyPrefixFromPath("/marketplace")).toBeNull();
    expect(applyCompanyPrefix("/marketplace", "KES")).toBe("/KES/marketplace");
    expect(toCompanyRelativePath("/KES/marketplace")).toBe("/marketplace");
  });

  it("treats /meetings as a board route that needs a company prefix", () => {
    expect(isBoardPathWithoutPrefix("/meetings")).toBe(true);
    expect(isBoardPathWithoutPrefix("/meetings/meeting-123")).toBe(true);
    expect(extractCompanyPrefixFromPath("/meetings")).toBeNull();
    expect(applyCompanyPrefix("/meetings", "KES")).toBe("/KES/meetings");
    expect(applyCompanyPrefix("/meetings/meeting-123", "KES")).toBe("/KES/meetings/meeting-123");
    expect(toCompanyRelativePath("/KES/meetings/meeting-123")).toBe("/meetings/meeting-123");
  });

  it("treats /direct-chat as a board route that needs a company prefix", () => {
    expect(isBoardPathWithoutPrefix("/direct-chat")).toBe(true);
    expect(extractCompanyPrefixFromPath("/direct-chat")).toBeNull();
    expect(applyCompanyPrefix("/direct-chat", "KES")).toBe("/KES/direct-chat");
    expect(toCompanyRelativePath("/KES/direct-chat")).toBe("/direct-chat");
  });

  it("treats /research-labs as a board route that needs a company prefix", () => {
    expect(isBoardPathWithoutPrefix("/research-labs")).toBe(true);
    expect(isBoardPathWithoutPrefix("/research-labs/lab-123")).toBe(true);
    expect(extractCompanyPrefixFromPath("/research-labs")).toBeNull();
    expect(applyCompanyPrefix("/research-labs", "KES")).toBe("/KES/research-labs");
    expect(applyCompanyPrefix("/research-labs/lab-123", "KES")).toBe("/KES/research-labs/lab-123");
    expect(toCompanyRelativePath("/KES/research-labs/lab-123")).toBe("/research-labs/lab-123");
  });
});
