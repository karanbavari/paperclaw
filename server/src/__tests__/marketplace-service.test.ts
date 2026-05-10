import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  curateMarketplaceSkill,
  isMarketplaceSkillVisible,
  marketplaceSkillCurationPolicy,
  marketplaceSkillMatchesQuery,
} from "../services/marketplace-curation.js";
import { marketplaceService } from "../services/marketplace.js";

const previousLocalRoot = process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT;
const previousRemoteUrl = process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

describe("marketplaceService local fallback catalog", () => {
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    if (previousLocalRoot === undefined) {
      delete process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT;
    } else {
      process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = previousLocalRoot;
    }
    if (previousRemoteUrl === undefined) {
      delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;
    } else {
      process.env.PAPERCLAW_SKILL_MARKETPLACE_URL = previousRemoteUrl;
    }
    await Promise.all(Array.from(cleanupDirs, (dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("parses awesome skill category markdown into marketplace categories and skills", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "communication.md"),
      [
        "# Communication",
        "",
        "**2 skills**",
        "",
        "- [rocketchat](https://clawskills.sh/skills/zenjabba-rocketchat) - Rocket.Chat team messaging.",
        "- [github-skill](https://github.com/openclaw/skills/tree/main/skills/demo/github-skill) - GitHub backed skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "communication", name: "Communication", slug: "communication", skillCount: 1 },
    ]);
  });

  it("curates Communication skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "communication/zenjabba-rocketchat",
      slug: "zenjabba-rocketchat",
      name: "rocketchat",
      description: "Rocket.Chat team messaging - channels, messages, users, integrations via REST API.",
      categorySlug: "communication",
      categoryName: "Communication",
      sourceUrl: "https://clawskills.sh/skills/zenjabba-rocketchat",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# rocketchat",
      installNotes: null,
    });

    expect(skill.name).toBe("Rocket.Chat");
    expect(skill.slug).toBe("rocketchat");
    expect(skill.tags).toContain("team-chat");
    expect(skill.tags).toContain("requires-human-confirmation");
    expect(skill.markdown).toContain("auditable messaging");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Communication curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "communication/casperaiassist-postwall",
      slug: "casperaiassist-postwall",
      name: "postwall",
      description: "Secure email gateway for AI agents.",
      categorySlug: "communication",
      categoryName: "Communication",
      sourceUrl: "https://clawskills.sh/skills/casperaiassist-postwall",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# postwall",
      installNotes: null,
    });

    expect(marketplaceSkillMatchesQuery(skill, { q: "human-in-the-loop" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "agent-inbox" })).toBe(false);
    expect(marketplaceSkillMatchesQuery(skill, { q: "email", category: "communication" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "email", category: "calendar-and-scheduling" })).toBe(false);
  });

  it("filters Communication to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "communication.md"),
      [
        "# Communication",
        "",
        "- [expanso-email-triage](https://clawskills.sh/skills/aronchick-expanso-email-triage) - AI-powered email triage.",
        "- [meeting-coordinator](https://clawskills.sh/skills/voshawn-meeting-coordinator) - Executive scheduling assistant.",
        "- [postwall](https://clawskills.sh/skills/casperaiassist-postwall) - Secure email gateway.",
        "- [rocketchat](https://clawskills.sh/skills/zenjabba-rocketchat) - Rocket.Chat team messaging.",
        "- [udp-messenger](https://clawskills.sh/skills/turfptax-udp-messenger) - Local agent messaging.",
        "- [sixel-email](https://clawskills.sh/skills/sixel-et-sixel-email) - 1:1 email channel for agents.",
        "- [custom-smtp-sender](https://clawskills.sh/skills/scccmsd-custom-smtp-sender) - Send emails.",
        "- [outbound-call](https://clawskills.sh/skills/humanjesse-outbound-call) - Make outbound phone calls.",
        "- [microsoft365](https://clawskills.sh/skills/robert-janssen-microsoft365) - Microsoft 365 integration.",
        "- [publora-telegram](https://clawskills.sh/skills/sergebulaev-publora-telegram) - Post to Telegram.",
        "- [pidgesms](https://clawskills.sh/skills/typhonius-pidgesms) - Send and read SMS.",
        "- [crypto-signal](https://clawskills.sh/skills/qiantanxiaohai-crypto-signal) - Crypto intelligence.",
        "- [agent-social](https://clawskills.sh/skills/iisweetheartii-agent-social) - Social network for AI agents.",
        "- [gradientdesires](https://clawskills.sh/skills/drewangeloff-gradientdesires) - Dating platform.",
        "- [tradingview-screener](https://clawskills.sh/skills/hiehoo-tradingview-screener) - Screen markets.",
        "- [shopping-price-drop-coupon-scout](https://clawskills.sh/skills/codedao12-shopping-price-drop-coupon-scout) - Coupon scout.",
        "- [unknown-communication-skill](https://clawskills.sh/skills/example-unknown-communication-skill) - Unreviewed communication tool.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "communication", name: "Communication", slug: "communication", skillCount: 6 },
    ]);
  });

  it("marks Communication gated, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const baseSkill = {
      id: "communication/scccmsd-custom-smtp-sender",
      slug: "scccmsd-custom-smtp-sender",
      name: "custom-smtp-sender",
      description: "Send emails.",
      categorySlug: "communication",
      categoryName: "Communication",
      sourceUrl: "https://clawskills.sh/skills/scccmsd-custom-smtp-sender",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const outboundCallSkill = {
      ...baseSkill,
      id: "communication/humanjesse-outbound-call",
      slug: "humanjesse-outbound-call",
      name: "outbound-call",
      sourceUrl: "https://clawskills.sh/skills/humanjesse-outbound-call",
    };
    const duplicateSkill = {
      ...baseSkill,
      id: "communication/turfptax-localudpmessenger",
      slug: "turfptax-localudpmessenger",
      name: "localudpmessenger",
      sourceUrl: "https://clawskills.sh/skills/turfptax-localudpmessenger",
    };
    const rejectSkill = {
      ...baseSkill,
      id: "communication/qiantanxiaohai-crypto-signal",
      slug: "qiantanxiaohai-crypto-signal",
      name: "crypto-signal",
      sourceUrl: "https://clawskills.sh/skills/qiantanxiaohai-crypto-signal",
    };
    const socialNoveltySkill = {
      ...baseSkill,
      id: "communication/iisweetheartii-agent-social",
      slug: "iisweetheartii-agent-social",
      name: "agent-social",
      sourceUrl: "https://clawskills.sh/skills/iisweetheartii-agent-social",
    };
    const unreviewedSkill = {
      ...baseSkill,
      id: "communication/example-unknown-communication-skill",
      slug: "example-unknown-communication-skill",
      name: "unknown-communication-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-communication-skill",
    };

    for (const skill of [baseSkill, outboundCallSkill, duplicateSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    for (const skill of [rejectSkill, socialNoveltySkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
  });

  it("curates Gaming production skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "gaming/tippyentertainment-android-3d-developer",
      slug: "tippyentertainment-android-3d-developer",
      name: "android-3d-developer",
      description: "Help build and optimize 3D games and interactive experiences on Android.",
      categorySlug: "gaming",
      categoryName: "Gaming",
      sourceUrl: "https://clawskills.sh/skills/tippyentertainment-android-3d-developer",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# android-3d-developer",
      installNotes: null,
    });

    expect(skill.name).toBe("Android 3D Game Developer");
    expect(skill.slug).toBe("android-3d-game-developer");
    expect(skill.tags).toContain("game-development");
    expect(skill.tags).toContain("research-lab");
    expect(skill.markdown).toContain("isolated project workspaces");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Gaming curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "gaming/kjaylee-sprite-sheet",
      slug: "kjaylee-sprite-sheet",
      name: "sprite-sheet",
      description: "Game development asset optimization.",
      categorySlug: "gaming",
      categoryName: "Gaming",
      sourceUrl: "https://clawskills.sh/skills/kjaylee-sprite-sheet",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# sprite-sheet",
      installNotes: null,
    });

    expect(marketplaceSkillMatchesQuery(skill, { q: "game-development" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "sprite", category: "gaming" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "sprite", category: "communication" })).toBe(false);
  });

  it("filters Gaming to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "gaming.md"),
      [
        "# Gaming",
        "",
        "- [android-3d-developer](https://clawskills.sh/skills/tippyentertainment-android-3d-developer) - Help build Android 3D games.",
        "- [dakboard](https://clawskills.sh/skills/krisclarkdev-dakboard) - Manage DAKboard screens.",
        "- [sprite-sheet](https://clawskills.sh/skills/kjaylee-sprite-sheet) - Game asset optimization.",
        "- [agentgram](https://clawskills.sh/skills/iisweetheartii-agentgram) - Agent social network.",
        "- [agentgram-social](https://clawskills.sh/skills/iisweetheartii-agentgram-social) - AgentGram connector.",
        "- [agora-flow](https://clawskills.sh/skills/rivera-daniel-agora-flow) - Agent Q&A platform.",
        "- [agoraflow](https://clawskills.sh/skills/rivera-daniel-agoraflow) - Agent Q&A platform.",
        "- [arena](https://clawskills.sh/skills/sscottdev-arena) - App-building competitions.",
        "- [brawlnet](https://clawskills.sh/skills/sikey53-brawlnet) - Agent arena protocol.",
        "- [hivemind](https://clawskills.sh/skills/urcades-hivemind) - Shared memory.",
        "- [hytale](https://clawskills.sh/skills/newcastlegeek-hytale) - Local Hytale server.",
        "- [clawville](https://clawskills.sh/skills/jdrolls-clawville) - Persistent life simulation.",
        "- [kradleverse-act](https://clawskills.sh/skills/themrzz-kradleverse-act) - Send game action.",
        "- [openbotcity](https://clawskills.sh/skills/vincentsider-openbotcity) - Virtual city.",
        "- [yumfu](https://github.com/openclaw/skills/tree/main/skills/yumyumtum/yumfu/SKILL.md) - Text adventure RPG.",
        "- [unknown-gaming-skill](https://clawskills.sh/skills/example-unknown-gaming-skill) - Unreviewed game skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "gaming", name: "Gaming", slug: "gaming", skillCount: 3 },
    ]);
  });

  it("marks Gaming gated, duplicate, reject, and unreviewed skills as not visible by default", () => {
    const baseSkill = {
      id: "gaming/iisweetheartii-agentgram",
      slug: "iisweetheartii-agentgram",
      name: "agentgram",
      description: "Agent social network.",
      categorySlug: "gaming",
      categoryName: "Gaming",
      sourceUrl: "https://clawskills.sh/skills/iisweetheartii-agentgram",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const duplicateAgentgramSkill = {
      ...baseSkill,
      id: "gaming/iisweetheartii-agentgram-social",
      slug: "iisweetheartii-agentgram-social",
      name: "agentgram-social",
      sourceUrl: "https://clawskills.sh/skills/iisweetheartii-agentgram-social",
    };
    const duplicateAgoraSkill = {
      ...baseSkill,
      id: "gaming/rivera-daniel-agoraflow",
      slug: "rivera-daniel-agoraflow",
      name: "agoraflow",
      sourceUrl: "https://clawskills.sh/skills/rivera-daniel-agoraflow",
    };
    const arenaSkill = {
      ...baseSkill,
      id: "gaming/sscottdev-arena",
      slug: "sscottdev-arena",
      name: "arena",
      sourceUrl: "https://clawskills.sh/skills/sscottdev-arena",
    };
    const rejectSkill = {
      ...baseSkill,
      id: "gaming/jdrolls-clawville",
      slug: "jdrolls-clawville",
      name: "clawville",
      sourceUrl: "https://clawskills.sh/skills/jdrolls-clawville",
    };
    const githubRejectSkill = {
      ...baseSkill,
      id: "gaming/yumfu",
      slug: "yumfu",
      name: "yumfu",
      sourceUrl: "https://github.com/openclaw/skills/tree/main/skills/yumyumtum/yumfu/SKILL.md",
    };
    const unreviewedSkill = {
      ...baseSkill,
      id: "gaming/example-unknown-gaming-skill",
      slug: "example-unknown-gaming-skill",
      name: "unknown-gaming-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-gaming-skill",
    };

    for (const skill of [baseSkill, duplicateAgentgramSkill, duplicateAgoraSkill, arenaSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    for (const skill of [rejectSkill, githubRejectSkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
  });

  it("curates Git and GitHub skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "git-and-github/nerdvana-labs-pr-risk-analyzer",
      slug: "nerdvana-labs-pr-risk-analyzer",
      name: "pr-risk-analyzer",
      description: "Analyze GitHub pull requests for security risks.",
      categorySlug: "git-and-github",
      categoryName: "Git And Github",
      sourceUrl: "https://clawskills.sh/skills/nerdvana-labs-pr-risk-analyzer",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# pr-risk-analyzer",
      installNotes: null,
    });

    expect(skill.name).toBe("PR Risk Analyzer");
    expect(skill.slug).toBe("pr-risk-analyzer");
    expect(skill.tags).toContain("pull-requests");
    expect(skill.tags).toContain("agent-safety");
    expect(skill.markdown).toContain("approved PR review agents");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Git and GitHub curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "git-and-github/heldinhow-super-github",
      slug: "heldinhow-super-github",
      name: "super-github",
      description: "The ultimate GitHub automation framework.",
      categorySlug: "git-and-github",
      categoryName: "Git And Github",
      sourceUrl: "https://clawskills.sh/skills/heldinhow-super-github",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# super-github",
      installNotes: null,
    });

    expect(marketplaceSkillMatchesQuery(skill, { q: "pull-requests" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "release", category: "git-and-github" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "release", category: "gaming" })).toBe(false);
  });

  it("filters Git and GitHub to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "git-and-github.md"),
      [
        "# Git & GitHub",
        "",
        "- [gh](https://clawskills.sh/skills/trumppo-gh) - Use the GitHub CLI.",
        "- [git-essentials](https://clawskills.sh/skills/arnarsson-git-essentials) - Essential Git commands.",
        "- [git-sentinel](https://clawskills.sh/skills/corezip-git-sentinel) - Security auditor.",
        "- [pr-risk-analyzer](https://clawskills.sh/skills/nerdvana-labs-pr-risk-analyzer) - Analyze PR risks.",
        "- [release-tracker](https://clawskills.sh/skills/jo9900-release-tracker) - Track GitHub releases.",
        "- [super-github](https://clawskills.sh/skills/heldinhow-super-github) - GitHub automation framework.",
        "- [upstream-recon](https://clawskills.sh/skills/semmyt-upstream-recon) - Investigate open-source projects.",
        "- [auto-pr-merger](https://clawskills.sh/skills/autogame-17-auto-pr-merger) - Merge PRs.",
        "- [deploy-agent](https://clawskills.sh/skills/sherajdev-deploy-agent) - Deploy full-stack apps.",
        "- [git-pushing](https://clawskills.sh/skills/tianyi-billy-ma-git-pushing) - Commit and push.",
        "- [jenkins](https://clawskills.sh/skills/guoway-jenkins) - Jenkins CI/CD.",
        "- [remote-skill-engine](https://clawskills.sh/skills/oki3505f-remote-skill-engine) - Remote skills.",
        "- [connect-apps](https://clawskills.sh/skills/sohamganatra-connect-apps) - Connect external apps.",
        "- [git-helper](https://clawskills.sh/skills/xejrax-git-helper) - Common git operations.",
        "- [git-changelog-gen](https://clawskills.sh/skills/rogue-agent1-git-changelog-gen) - Generate changelogs.",
        "- [ghgghg](https://clawskills.sh/skills/chenpinji-ghgghg) - Repo stats.",
        "- [forkzoo](https://clawskills.sh/skills/levi-law-forkzoo) - GitHub pets.",
        "- [deai-image](https://clawskills.sh/skills/swaylq-deai-image) - Remove AI fingerprints.",
        "- [pixelbattle](https://clawskills.sh/skills/coolkonstantincool-pixelbattle) - Shared pixel environment.",
        "- [unknown-git-skill](https://clawskills.sh/skills/example-unknown-git-skill) - Unreviewed git skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "git-and-github", name: "Git And Github", slug: "git-and-github", skillCount: 7 },
    ]);
  });

  it("marks Git and GitHub gated, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const baseSkill = {
      id: "git-and-github/autogame-17-auto-pr-merger",
      slug: "autogame-17-auto-pr-merger",
      name: "auto-pr-merger",
      description: "Merge PRs.",
      categorySlug: "git-and-github",
      categoryName: "Git And Github",
      sourceUrl: "https://clawskills.sh/skills/autogame-17-auto-pr-merger",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const deploySkill = {
      ...baseSkill,
      id: "git-and-github/sherajdev-deploy-agent",
      slug: "sherajdev-deploy-agent",
      name: "deploy-agent",
      sourceUrl: "https://clawskills.sh/skills/sherajdev-deploy-agent",
    };
    const connectorSkill = {
      ...baseSkill,
      id: "git-and-github/sohamganatra-connect-apps",
      slug: "sohamganatra-connect-apps",
      name: "connect-apps",
      sourceUrl: "https://clawskills.sh/skills/sohamganatra-connect-apps",
    };
    const duplicateSkill = {
      ...baseSkill,
      id: "git-and-github/xejrax-git-helper",
      slug: "xejrax-git-helper",
      name: "git-helper",
      sourceUrl: "https://clawskills.sh/skills/xejrax-git-helper",
    };
    const rejectSkill = {
      ...baseSkill,
      id: "git-and-github/swaylq-deai-image",
      slug: "swaylq-deai-image",
      name: "deai-image",
      sourceUrl: "https://clawskills.sh/skills/swaylq-deai-image",
    };
    const noveltySkill = {
      ...baseSkill,
      id: "git-and-github/levi-law-forkzoo",
      slug: "levi-law-forkzoo",
      name: "forkzoo",
      sourceUrl: "https://clawskills.sh/skills/levi-law-forkzoo",
    };
    const unreviewedSkill = {
      ...baseSkill,
      id: "git-and-github/example-unknown-git-skill",
      slug: "example-unknown-git-skill",
      name: "unknown-git-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-git-skill",
    };

    for (const skill of [baseSkill, deploySkill, connectorSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    for (const skill of [duplicateSkill, rejectSkill, noveltySkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
  });

  it("curates Apple Health catalog entries for PaperClaw preview and install markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "apple-apps-and-services/nftechie-apple-health-skill",
      slug: "nftechie-apple-health-skill",
      name: "apple-health-skill",
      description: "Talk to your Apple Health data.",
      categorySlug: "apple-apps-and-services",
      categoryName: "Apple Apps And Services",
      sourceUrl: "https://clawskills.sh/skills/nftechie-apple-health-skill",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# apple-health-skill",
      installNotes: null,
    });

    expect(skill.name).toBe("Apple Health Intelligence");
    expect(skill.slug).toBe("apple-health-intelligence");
    expect(skill.tags).toContain("transition-api");
    expect(skill.installNotes).toContain("TRANSITION_API_KEY");
    expect(skill.markdown).toContain("Privacy and safety notes");
    expect(skill.markdown).toContain("Transition API");
  });

  it("matches Apple Health curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "apple-apps-and-services/nftechie-apple-health-skill",
      slug: "nftechie-apple-health-skill",
      name: "apple-health-skill",
      description: "Talk to your Apple Health data.",
      categorySlug: "apple-apps-and-services",
      categoryName: "Apple Apps And Services",
      sourceUrl: "https://clawskills.sh/skills/nftechie-apple-health-skill",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# apple-health-skill",
      installNotes: null,
    });

    expect(marketplaceSkillMatchesQuery(skill, { q: "heart-rate" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "transition-api" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "private wellness" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "transition-api", category: "communication" })).toBe(false);
  });

  it("filters Apple Apps and Services to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "apple-apps-and-services.md"),
      [
        "# Apple Apps & Services",
        "",
        "- [apple-health-skill](https://clawskills.sh/skills/nftechie-apple-health-skill) - Talk to your Apple Health data.",
        "- [apple-contacts](https://clawskills.sh/skills/tyler6204-apple-contacts) - Look up contacts from macOS Contacts.app.",
        "- [apple-find-my-local](https://clawskills.sh/skills/loganprit-apple-find-my-local) - Control Apple Find My app.",
        "- [testflight-monitor](https://clawskills.sh/skills/jon-xo-testflight-monitor) - Monitor available TestFlight beta slots.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "apple-apps-and-services", name: "Apple Apps And Services", slug: "apple-apps-and-services", skillCount: 2 },
    ]);
  });

  it("marks reviewed Apple Apps maybe and reject skills as not visible by default", () => {
    const maybeSkill = {
      id: "apple-apps-and-services/tyler6204-apple-contacts",
      slug: "tyler6204-apple-contacts",
      name: "apple-contacts",
      description: "Look up contacts from macOS Contacts.app.",
      categorySlug: "apple-apps-and-services",
      categoryName: "Apple Apps And Services",
      sourceUrl: "https://clawskills.sh/skills/tyler6204-apple-contacts",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "apple-apps-and-services/loganprit-apple-find-my-local",
      slug: "loganprit-apple-find-my-local",
      name: "apple-find-my-local",
      sourceUrl: "https://clawskills.sh/skills/loganprit-apple-find-my-local",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
  });

  it("curates AI and LLM agent operations skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "ai-and-llms/sru4ka-agentpulse",
      slug: "sru4ka-agentpulse",
      name: "agentpulse",
      description: "Track LLM API costs, tokens, latency, and errors for your AI agent.",
      categorySlug: "ai-and-llms",
      categoryName: "AI & LLMs",
      sourceUrl: "https://clawskills.sh/skills/sru4ka-agentpulse",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# agentpulse",
      installNotes: null,
    });

    expect(skill.name).toBe("Agent Observability");
    expect(skill.slug).toBe("agent-observability");
    expect(skill.tags).toContain("cost-control");
    expect(skill.tags).toContain("agent-ops");
    expect(skill.markdown).toContain("PaperClaw fit");
    expect(skill.markdown).toContain("CEO, CTO, platform, and agent-operations agents");
    expect(skill.installNotes).toContain("PaperClaw-curated entry");
  });

  it("matches AI and LLM curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "ai-and-llms/georges91560-anti-injection-skill",
      slug: "georges91560-anti-injection-skill",
      name: "anti-injection-skill",
      description: "Advanced prompt injection defense.",
      categorySlug: "ai-and-llms",
      categoryName: "AI & LLMs",
      sourceUrl: "https://clawskills.sh/skills/georges91560-anti-injection-skill",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# anti-injection-skill",
      installNotes: null,
    });

    expect(marketplaceSkillMatchesQuery(skill, { q: "memory-safety" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "transition-api" })).toBe(false);
    expect(marketplaceSkillMatchesQuery(skill, { q: "prompt injection", category: "ai-and-llms" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "prompt injection", category: "apple-apps-and-services" })).toBe(false);
  });

  it("filters AI and LLMs to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "ai-and-llms.md"),
      [
        "# AI & LLMs",
        "",
        "- [agentpulse](https://clawskills.sh/skills/sru4ka-agentpulse) - Track LLM API costs, tokens, latency, and errors for your AI agent.",
        "- [groq](https://clawskills.sh/skills/samirjtv-ctrl-groq) - To use this skill, say Groq: your prompt.",
        "- [pump-fun](https://clawskills.sh/skills/playdadev-pump-fun) - Buy, sell, and launch tokens on Pump.fun using the PumpPortal API.",
        "- [meeting-autopilot](https://clawskills.sh/skills/tkuehnl-meeting-autopilot) - Turn meeting transcripts into operational outputs.",
        "- [iyeque-audio-processing](https://clawskills.sh/skills/iyeque-iyeque-audio-processing) - Audio ingestion, analysis, transformation, and generation.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "ai-and-llms", name: "Ai And Llms", slug: "ai-and-llms", skillCount: 2 },
    ]);
  });

  it("marks reviewed AI and LLM maybe and reject skills as not visible by default", () => {
    const maybeSkill = {
      id: "ai-and-llms/samirjtv-ctrl-groq",
      slug: "samirjtv-ctrl-groq",
      name: "groq",
      description: "Use Groq models.",
      categorySlug: "ai-and-llms",
      categoryName: "AI & LLMs",
      sourceUrl: "https://clawskills.sh/skills/samirjtv-ctrl-groq",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "ai-and-llms/playdadev-pump-fun",
      slug: "playdadev-pump-fun",
      name: "pump-fun",
      sourceUrl: "https://clawskills.sh/skills/playdadev-pump-fun",
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "ai-and-llms/iyeque-iyeque-audio-processing",
      slug: "iyeque-iyeque-audio-processing",
      name: "iyeque-audio-processing",
      sourceUrl: "https://clawskills.sh/skills/iyeque-iyeque-audio-processing",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(duplicateSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(duplicateSkill)).toBe(false);
  });

  it("curates Browser and Automation skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "browser-and-automation/murphykobe-agent-browser-2",
      slug: "murphykobe-agent-browser-2",
      name: "agent-browser",
      description: "Automates browser interactions for web testing and form automation.",
      categorySlug: "browser-and-automation",
      categoryName: "Browser And Automation",
      sourceUrl: "https://clawskills.sh/skills/murphykobe-agent-browser-2",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# agent-browser",
      installNotes: null,
    });

    expect(skill.name).toBe("Browser Test Agent");
    expect(skill.slug).toBe("browser-test-agent");
    expect(skill.tags).toContain("browser-automation");
    expect(skill.tags).toContain("qa");
    expect(skill.markdown).toContain("controlled browser or testing access");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Browser and Automation curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "browser-and-automation/wanng-ide-api-tester",
      slug: "wanng-ide-api-tester",
      name: "api-tester",
      description: "Perform structured HTTP and HTTPS requests.",
      categorySlug: "browser-and-automation",
      categoryName: "Browser And Automation",
      sourceUrl: "https://clawskills.sh/skills/wanng-ide-api-tester",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# api-tester",
      installNotes: null,
    });

    expect(marketplaceSkillMatchesQuery(skill, { q: "research-lab" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "board approval" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "transition-api" })).toBe(false);
    expect(marketplaceSkillMatchesQuery(skill, { q: "api", category: "browser-and-automation" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "api", category: "ai-and-llms" })).toBe(false);
  });

  it("filters Browser and Automation to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "browser-and-automation.md"),
      [
        "# Browser & Automation",
        "",
        "- [agent-browser](https://clawskills.sh/skills/murphykobe-agent-browser-2) - Automates browser interactions for web testing.",
        "- [api-tester](https://clawskills.sh/skills/wanng-ide-api-tester) - Perform structured HTTP requests.",
        "- [url2pdf](https://clawskills.sh/skills/guoqiao-url2pdf) - Convert URL to PDF.",
        "- [multilogin](https://clawskills.sh/skills/glebkazachinskiy-multilogin) - Manage Multilogin browser profiles.",
        "- [amazon-shopper](https://clawskills.sh/skills/brennerspear-amazon-shopper) - Buy and return items on Amazon.",
        "- [unknown-browser-thing](https://clawskills.sh/skills/example-unknown-browser-thing) - Unreviewed browser automation.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "browser-and-automation", name: "Browser And Automation", slug: "browser-and-automation", skillCount: 3 },
    ]);
  });

  it("marks Browser and Automation maybe, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "browser-and-automation/glebkazachinskiy-multilogin",
      slug: "glebkazachinskiy-multilogin",
      name: "multilogin",
      description: "Manage Multilogin browser profiles.",
      categorySlug: "browser-and-automation",
      categoryName: "Browser And Automation",
      sourceUrl: "https://clawskills.sh/skills/glebkazachinskiy-multilogin",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "browser-and-automation/brennerspear-amazon-shopper",
      slug: "brennerspear-amazon-shopper",
      name: "amazon-shopper",
      sourceUrl: "https://clawskills.sh/skills/brennerspear-amazon-shopper",
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "browser-and-automation/ryanhong666-db-readonly",
      slug: "ryanhong666-db-readonly",
      name: "db-readonly",
      sourceUrl: "https://clawskills.sh/skills/ryanhong666-db-readonly",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "browser-and-automation/example-unknown-browser-thing",
      slug: "example-unknown-browser-thing",
      name: "unknown-browser-thing",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-browser-thing",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(duplicateSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(unreviewedSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(duplicateSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(unreviewedSkill)).toBe(false);
  });

  it("curates Calendar and Scheduling skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "calendar-and-scheduling/billylui-temporal-cortex-datetime",
      slug: "billylui-temporal-cortex-datetime",
      name: "temporal-cortex-datetime",
      description: "Zero-setup datetime resolution, timezone conversion, and DST-aware math.",
      categorySlug: "calendar-and-scheduling",
      categoryName: "Calendar And Scheduling",
      sourceUrl: "https://clawskills.sh/skills/billylui-temporal-cortex-datetime",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# temporal-cortex-datetime",
      installNotes: null,
    });

    expect(skill.name).toBe("Datetime & Timezone Tools");
    expect(skill.slug).toBe("datetime-timezone-tools");
    expect(skill.tags).toContain("timezone");
    expect(skill.tags).toContain("scheduling");
    expect(skill.markdown).toContain("approved scheduling agents");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Calendar and Scheduling curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "calendar-and-scheduling/hougangdev-meeting-prep",
      slug: "hougangdev-meeting-prep",
      name: "meeting-prep",
      description: "Meeting preparation and daily commit summaries.",
      categorySlug: "calendar-and-scheduling",
      categoryName: "Calendar And Scheduling",
      sourceUrl: "https://clawskills.sh/skills/hougangdev-meeting-prep",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# meeting-prep",
      installNotes: null,
    });

    expect(marketplaceSkillMatchesQuery(skill, { q: "board-inbox" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "meeting coordinator" })).toBe(false);
    expect(marketplaceSkillMatchesQuery(skill, { q: "meeting", category: "calendar-and-scheduling" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "meeting", category: "browser-and-automation" })).toBe(false);
  });

  it("filters Calendar and Scheduling to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "calendar-and-scheduling.md"),
      [
        "# Calendar & Scheduling",
        "",
        "- [advanced-calendar](https://clawskills.sh/skills/toughworm-advanced-calendar) - Advanced calendar skill with natural language.",
        "- [meeting-prep](https://clawskills.sh/skills/hougangdev-meeting-prep) - Meeting preparation and daily commit summaries.",
        "- [temporal-cortex-datetime](https://clawskills.sh/skills/billylui-temporal-cortex-datetime) - Zero-setup datetime resolution.",
        "- [google-calendar](https://clawskills.sh/skills/adrianmiller99-google-calendar) - Interact with Google Calendar.",
        "- [publora-twitter](https://clawskills.sh/skills/sergebulaev-publora-twitter) - Post or schedule content to X.",
        "- [unknown-calendar-thing](https://clawskills.sh/skills/example-unknown-calendar-thing) - Unreviewed calendar automation.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "calendar-and-scheduling", name: "Calendar And Scheduling", slug: "calendar-and-scheduling", skillCount: 3 },
    ]);
  });

  it("marks Calendar and Scheduling maybe, reject, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "calendar-and-scheduling/adrianmiller99-google-calendar",
      slug: "adrianmiller99-google-calendar",
      name: "google-calendar",
      description: "Interact with Google Calendar.",
      categorySlug: "calendar-and-scheduling",
      categoryName: "Calendar And Scheduling",
      sourceUrl: "https://clawskills.sh/skills/adrianmiller99-google-calendar",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "calendar-and-scheduling/sergebulaev-publora-twitter",
      slug: "sergebulaev-publora-twitter",
      name: "publora-twitter",
      sourceUrl: "https://clawskills.sh/skills/sergebulaev-publora-twitter",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "calendar-and-scheduling/example-unknown-calendar-thing",
      slug: "example-unknown-calendar-thing",
      name: "unknown-calendar-thing",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-calendar-thing",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(unreviewedSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(unreviewedSkill)).toBe(false);
  });

  it("curates CLI Utilities skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "cli-utilities/andrewandrewsen-messageguard",
      slug: "andrewandrewsen-messageguard",
      name: "messageguard",
      description: "Scan outbound messages for sensitive data.",
      categorySlug: "cli-utilities",
      categoryName: "CLI Utilities",
      sourceUrl: "https://clawskills.sh/skills/andrewandrewsen-messageguard",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# messageguard",
      installNotes: null,
    });

    expect(skill.name).toBe("MessageGuard");
    expect(skill.slug).toBe("messageguard");
    expect(skill.tags).toContain("security");
    expect(skill.tags).toContain("approvals");
    expect(skill.markdown).toContain("PaperClaw fit");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches CLI Utilities curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "cli-utilities/diegofcornejo-totp",
      slug: "diegofcornejo-totp",
      name: "totp",
      description: "Generate time-based one-time passwords.",
      categorySlug: "cli-utilities",
      categoryName: "CLI Utilities",
      sourceUrl: "https://clawskills.sh/skills/diegofcornejo-totp",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# totp",
      installNotes: null,
    });

    expect(marketplaceSkillMatchesQuery(skill, { q: "approval gate" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "requires-human-confirmation" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "transition-api" })).toBe(false);
    expect(marketplaceSkillMatchesQuery(skill, { q: "totp", category: "cli-utilities" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "totp", category: "calendar-and-scheduling" })).toBe(false);
  });

  it("filters CLI Utilities to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "cli-utilities.md"),
      [
        "# CLI Utilities",
        "",
        "- [agent-hardening](https://clawskills.sh/skills/x1xhlol-agent-hardening) - Security hardening for AI agents.",
        "- [dependency-audit](https://clawskills.sh/skills/fratua-dependency-audit) - Audit dependencies.",
        "- [domain-checker](https://clawhub.ai/blueyi/domain-checker) - Check domain availability.",
        "- [gmail-sender](https://clawskills.sh/skills/junkaixue-gmail-sender) - Send emails through Gmail.",
        "- [cast](https://clawskills.sh/skills/tezatezaz-cast) - EVM wallet and transaction CLI.",
        "- [unknown-cli-thing](https://clawskills.sh/skills/example-unknown-cli-thing) - Unreviewed CLI utility.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "cli-utilities", name: "Cli Utilities", slug: "cli-utilities", skillCount: 3 },
    ]);
  });

  it("marks CLI Utilities maybe, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "cli-utilities/junkaixue-gmail-sender",
      slug: "junkaixue-gmail-sender",
      name: "gmail-sender",
      description: "Send email through Gmail.",
      categorySlug: "cli-utilities",
      categoryName: "CLI Utilities",
      sourceUrl: "https://clawskills.sh/skills/junkaixue-gmail-sender",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "cli-utilities/tezatezaz-cast",
      slug: "tezatezaz-cast",
      name: "cast",
      sourceUrl: "https://clawskills.sh/skills/tezatezaz-cast",
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "cli-utilities/iyeque-local-system-info",
      slug: "iyeque-local-system-info",
      name: "local-system-info",
      sourceUrl: "https://clawskills.sh/skills/iyeque-local-system-info",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "cli-utilities/example-unknown-cli-thing",
      slug: "example-unknown-cli-thing",
      name: "unknown-cli-thing",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-cli-thing",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(duplicateSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(unreviewedSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(duplicateSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(unreviewedSkill)).toBe(false);
  });

  it("curates Coding Agents and IDEs skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "coding-agents-and-ides/microcarft-codex-orchestrator",
      slug: "microcarft-codex-orchestrator",
      name: "codex-orchestrator",
      description: "Monitor, control, and orchestrate background Codex sessions.",
      categorySlug: "coding-agents-and-ides",
      categoryName: "Coding Agents And Ides",
      sourceUrl: "https://clawskills.sh/skills/microcarft-codex-orchestrator",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# codex-orchestrator",
      installNotes: null,
    });

    expect(skill.name).toBe("Codex Orchestrator");
    expect(skill.slug).toBe("codex-orchestrator");
    expect(skill.tags).toContain("codex");
    expect(skill.tags).toContain("agent-ops");
    expect(skill.markdown).toContain("PaperClaw fit");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Coding Agents and IDEs curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "coding-agents-and-ides/kjaylee-verify-before-done",
      slug: "kjaylee-verify-before-done",
      name: "verify-before-done",
      description: "Require fresh verification evidence before claiming work is complete.",
      categorySlug: "coding-agents-and-ides",
      categoryName: "Coding Agents And Ides",
      sourceUrl: "https://clawskills.sh/skills/kjaylee-verify-before-done",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# verify-before-done",
      installNotes: null,
    });

    expect(marketplaceSkillMatchesQuery(skill, { q: "verification" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "agent-safety" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "transition-api" })).toBe(false);
    expect(marketplaceSkillMatchesQuery(skill, { q: "verification", category: "coding-agents-and-ides" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "verification", category: "cli-utilities" })).toBe(false);
  });

  it("filters Coding Agents and IDEs to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "coding-agents-and-ides.md"),
      [
        "# Coding Agents & IDEs",
        "",
        "- [agent-audit-trail](https://clawskills.sh/skills/roosch269-agent-audit-trail) - Tamper-evident audit logging for AI agents.",
        "- [codex-orchestrator](https://clawskills.sh/skills/microcarft-codex-orchestrator) - Monitor, control, and orchestrate background Codex sessions.",
        "- [pyright-lsp](https://clawskills.sh/skills/bowen31337-pyright-lsp) - Python language server diagnostics.",
        "- [policy-engine](https://clawskills.sh/skills/joetomasone-policy-engine) - Deterministic governance layer for tool execution.",
        "- [verify-before-done](https://clawskills.sh/skills/kjaylee-verify-before-done) - Require fresh verification evidence.",
        "- [token-counter](https://clawskills.sh/skills/mkhaytman87-token-counter) - Track OpenClaw token usage.",
        "- [native-run](https://clawskills.sh/skills/sadikjarvis-native-run) - Execute native commands.",
        "- [yt-downloader](https://clawskills.sh/skills/honeybee1130-yt-downloader) - Download YouTube videos.",
        "- [unknown-coding-agent](https://clawskills.sh/skills/example-unknown-coding-agent) - Unreviewed coding agent.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "coding-agents-and-ides", name: "Coding Agents And Ides", slug: "coding-agents-and-ides", skillCount: 6 },
    ]);
  });

  it("marks Coding Agents and IDEs maybe, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "coding-agents-and-ides/sadikjarvis-native-run",
      slug: "sadikjarvis-native-run",
      name: "native-run",
      description: "Execute native commands.",
      categorySlug: "coding-agents-and-ides",
      categoryName: "Coding Agents And Ides",
      sourceUrl: "https://clawskills.sh/skills/sadikjarvis-native-run",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const vscodeTunnelSkill = {
      ...maybeSkill,
      id: "coding-agents-and-ides/listky-vscode-tunnel",
      slug: "listky-vscode-tunnel",
      name: "vscode-tunnel",
      sourceUrl: "https://clawskills.sh/skills/listky-vscode-tunnel",
    };
    const installerSkill = {
      ...maybeSkill,
      id: "coding-agents-and-ides/sreejith77-skill-installer",
      slug: "sreejith77-skill-installer",
      name: "skill-installer",
      sourceUrl: "https://clawskills.sh/skills/sreejith77-skill-installer",
    };
    const twilioSkill = {
      ...maybeSkill,
      id: "coding-agents-and-ides/codedao12-twilio",
      slug: "codedao12-twilio",
      name: "twilio",
      sourceUrl: "https://clawskills.sh/skills/codedao12-twilio",
    };
    const youtubeUploaderSkill = {
      ...maybeSkill,
      id: "coding-agents-and-ides/nachx639-youtube-uploader",
      slug: "nachx639-youtube-uploader",
      name: "youtube-uploader",
      sourceUrl: "https://clawskills.sh/skills/nachx639-youtube-uploader",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "coding-agents-and-ides/honeybee1130-yt-downloader",
      slug: "honeybee1130-yt-downloader",
      name: "yt-downloader",
      sourceUrl: "https://clawskills.sh/skills/honeybee1130-yt-downloader",
    };
    const seedanceSkill = {
      ...maybeSkill,
      id: "coding-agents-and-ides/jackycser-seedance-video-generation",
      slug: "jackycser-seedance-video-generation",
      name: "seedance-video-generation",
      sourceUrl: "https://clawskills.sh/skills/jackycser-seedance-video-generation",
    };
    const stockSkill = {
      ...maybeSkill,
      id: "coding-agents-and-ides/raufimusaddiq-stock-data-skill",
      slug: "raufimusaddiq-stock-data-skill",
      name: "stock-data-skill",
      sourceUrl: "https://clawskills.sh/skills/raufimusaddiq-stock-data-skill",
    };
    const socialNoveltySkill = {
      ...maybeSkill,
      id: "coding-agents-and-ides/tonydream1-agenttok",
      slug: "tonydream1-agenttok",
      name: "agenttok",
      sourceUrl: "https://clawskills.sh/skills/tonydream1-agenttok",
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "coding-agents-and-ides/andreagriffiths11-agent-context-system",
      slug: "andreagriffiths11-agent-context-system",
      name: "agent-context-system",
      sourceUrl: "https://clawskills.sh/skills/andreagriffiths11-agent-context-system",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "coding-agents-and-ides/example-unknown-coding-agent",
      slug: "example-unknown-coding-agent",
      name: "unknown-coding-agent",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-coding-agent",
    };

    for (const skill of [maybeSkill, vscodeTunnelSkill, installerSkill, twilioSkill, youtubeUploaderSkill, duplicateSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    for (const skill of [rejectSkill, seedanceSkill, stockSkill, socialNoveltySkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
  });

  it("curates Data and Analytics skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "data-and-analytics/oyi77-data-analyst",
      slug: "oyi77-data-analyst",
      name: "data-analyst",
      description: "Data visualization, report generation, SQL queries, and spreadsheet.",
      categorySlug: "data-and-analytics",
      categoryName: "Data And Analytics",
      sourceUrl: "https://clawskills.sh/skills/oyi77-data-analyst",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# data-analyst",
      installNotes: null,
    });

    expect(skill.name).toBe("Data Analyst");
    expect(skill.slug).toBe("data-analyst");
    expect(skill.tags).toContain("spreadsheets");
    expect(skill.tags).toContain("sensitive-personal-data");
    expect(skill.markdown).toContain("PaperClaw fit");
    expect(skill.markdown).toContain("Data analyst, COO, CEO, Research Lab, operations, and approved reporting agents");
    expect(skill.installNotes).toContain("PaperClaw-curated entry");
  });

  it("matches Data and Analytics curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "data-and-analytics/skywork-excel",
      slug: "skywork-excel",
      name: "skywork-excel",
      description: "AI-powered spreadsheet operations for creating, analyzing and generating reports.",
      categorySlug: "data-and-analytics",
      categoryName: "Data And Analytics",
      sourceUrl: "https://github.com/openclaw/skills/blob/main/skills/gxcun17/skywork-excel/SKILL.md",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# skywork-excel",
      installNotes: null,
    });

    expect(skill.name).toBe("Skywork Excel Analysis");
    expect(skill.slug).toBe("skywork-excel-analysis");
    expect(marketplaceSkillMatchesQuery(skill, { q: "spreadsheets" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "approved reporting agents" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "transition-api" })).toBe(false);
    expect(marketplaceSkillMatchesQuery(skill, { q: "spreadsheets", category: "data-and-analytics" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "spreadsheets", category: "coding-agents-and-ides" })).toBe(false);
  });

  it("filters Data and Analytics to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "data-and-analytics.md"),
      [
        "# Data & Analytics",
        "",
        "- [data-analyst](https://clawskills.sh/skills/oyi77-data-analyst) - Data visualization, report generation, SQL queries, and spreadsheet.",
        "- [duckdb-en](https://clawskills.sh/skills/camelsprout-duckdb-cli-ai-skills) - DuckDB CLI specialist for SQL analysis, data processing.",
        "- [skywork-excel](https://github.com/openclaw/skills/blob/main/skills/gxcun17/skywork-excel/SKILL.md) - AI-powered spreadsheet operations.",
        "- [canva](https://clawskills.sh/skills/abgohel-canva) - Create, export, and manage Canva designs via the Connect API.",
        "- [hyperliquid](https://clawskills.sh/skills/k0nkupa-hyperliquid) - Read-only Hyperliquid market data assistant.",
        "- [unknown-data-thing](https://clawskills.sh/skills/example-unknown-data-thing) - Unreviewed data automation.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "data-and-analytics", name: "Data And Analytics", slug: "data-and-analytics", skillCount: 3 },
    ]);
  });

  it("marks Data and Analytics maybe, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "data-and-analytics/abgohel-canva",
      slug: "abgohel-canva",
      name: "canva",
      description: "Create, export, and manage Canva designs via the Connect API.",
      categorySlug: "data-and-analytics",
      categoryName: "Data And Analytics",
      sourceUrl: "https://clawskills.sh/skills/abgohel-canva",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "data-and-analytics/k0nkupa-hyperliquid",
      slug: "k0nkupa-hyperliquid",
      name: "hyperliquid",
      sourceUrl: "https://clawskills.sh/skills/k0nkupa-hyperliquid",
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "data-and-analytics/themrzz-kradleverse-cleanup",
      slug: "themrzz-kradleverse-cleanup",
      name: "kradleverse-cleanup",
      sourceUrl: "https://clawskills.sh/skills/themrzz-kradleverse-cleanup",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "data-and-analytics/example-unknown-data-thing",
      slug: "example-unknown-data-thing",
      name: "unknown-data-thing",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-data-thing",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(duplicateSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(unreviewedSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(duplicateSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(unreviewedSkill)).toBe(false);
  });

  it("curates DevOps and Cloud skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "devops-and-cloud/tkuehnl-agentic-devops",
      slug: "tkuehnl-agentic-devops",
      name: "agentic-devops",
      description: "Production-grade agent DevOps toolkit - Docker, process management, log analysis, and health monitoring.",
      categorySlug: "devops-and-cloud",
      categoryName: "DevOps And Cloud",
      sourceUrl: "https://clawskills.sh/skills/tkuehnl-agentic-devops",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# agentic-devops",
      installNotes: null,
    });

    expect(skill.name).toBe("Agentic DevOps Toolkit");
    expect(skill.slug).toBe("agentic-devops-toolkit");
    expect(skill.tags).toContain("devops");
    expect(skill.tags).toContain("docker");
    expect(skill.tags).toContain("monitoring");
    expect(skill.tags).toContain("host-mutation");
    expect(skill.tags).toContain("requires-human-confirmation");
    expect(skill.markdown).toContain("PaperClaw fit");
    expect(skill.markdown).toContain("approved infrastructure agents");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches DevOps and Cloud curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "devops-and-cloud/rexlunae-cf-manager",
      slug: "rexlunae-cf-manager",
      name: "cf-manager",
      description: "Manage Cloudflare via API.",
      categorySlug: "devops-and-cloud",
      categoryName: "DevOps And Cloud",
      sourceUrl: "https://clawskills.sh/skills/rexlunae-cf-manager",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# cf-manager",
      installNotes: null,
    });

    expect(skill.name).toBe("Cloudflare Manager");
    expect(skill.slug).toBe("cloudflare-manager");
    expect(marketplaceSkillMatchesQuery(skill, { q: "cloudflare" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "dns" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "approved infrastructure agents" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "transition-api" })).toBe(false);
    expect(marketplaceSkillMatchesQuery(skill, { q: "cloudflare", category: "devops-and-cloud" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "cloudflare", category: "data-and-analytics" })).toBe(false);
  });

  it("filters DevOps and Cloud to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "devops-and-cloud.md"),
      [
        "# DevOps & Cloud",
        "",
        "- [agentic-devops](https://clawskills.sh/skills/tkuehnl-agentic-devops) - Production-grade agent DevOps toolkit.",
        "- [aws-ecs-monitor](https://clawskills.sh/skills/briancolinger-aws-ecs-monitor) - AWS ECS production health monitoring with CloudWatch.",
        "- [cf-manager](https://clawskills.sh/skills/rexlunae-cf-manager) - Manage Cloudflare via API.",
        "- [aws-infra](https://clawskills.sh/skills/bmdhodl-aws-infra) - Chat-based AWS infrastructure assistance.",
        "- [Azure CLI](https://clawskills.sh/skills/ddevaal-azure-cli) - Comprehensive Azure management.",
        "- [dacker](https://clawskills.sh/skills/runeweaverstudios-dacker) - Installs and uses Docker reliably.",
        "- [agentsmint](https://clawskills.sh/skills/kit-the-fox-agentsmint) - Create and manage NFT collections.",
        "- [ceaser-send](https://clawskills.sh/skills/zyra-v21-ceaser-send) - Fully automated private ETH transfer.",
        "- [capmonster](https://clawskills.sh/skills/easonc13-capmonster) - Solve CAPTCHAs.",
        "- [flaresolverr](https://clawskills.sh/skills/dolverin-flaresolverr) - Bypass Cloudflare protection.",
        "- [hs](https://clawskills.sh/skills/frmoretto-hs) - ACTIVATE THIS SKILL FOR ANY SHELL COMMAND OR FILE READ.",
        "- [unknown-devops-thing](https://clawskills.sh/skills/example-unknown-devops-thing) - Unreviewed DevOps automation.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "devops-and-cloud", name: "Devops And Cloud", slug: "devops-and-cloud", skillCount: 5 },
    ]);
  });

  it("marks DevOps and Cloud maybe, reject, duplicate, hard-reject, and unreviewed skills as not visible by default", () => {
    const baseSkill = {
      id: "devops-and-cloud/runeweaverstudios-dacker",
      slug: "runeweaverstudios-dacker",
      name: "dacker",
      description: "Installs and uses Docker reliably.",
      categorySlug: "devops-and-cloud",
      categoryName: "DevOps And Cloud",
      sourceUrl: "https://clawskills.sh/skills/runeweaverstudios-dacker",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const azureSkill = {
      ...baseSkill,
      id: "devops-and-cloud/ddevaal-azure-cli",
      slug: "Azure CLI",
      name: "Azure CLI",
      sourceUrl: "https://clawskills.sh/skills/ddevaal-azure-cli",
    };
    const rejectSkill = {
      ...baseSkill,
      id: "devops-and-cloud/kit-the-fox-agentsmint",
      slug: "kit-the-fox-agentsmint",
      name: "agentsmint",
      sourceUrl: "https://clawskills.sh/skills/kit-the-fox-agentsmint",
    };
    const hardRejectSkill = {
      ...baseSkill,
      id: "devops-and-cloud/frmoretto-hs",
      slug: "frmoretto-hs",
      name: "hs",
      sourceUrl: "https://clawskills.sh/skills/frmoretto-hs",
    };
    const unreviewedSkill = {
      ...baseSkill,
      id: "devops-and-cloud/example-unknown-devops-thing",
      slug: "example-unknown-devops-thing",
      name: "unknown-devops-thing",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-devops-thing",
    };

    expect(marketplaceSkillCurationPolicy(baseSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(azureSkill)).toBe("keep");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(hardRejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(unreviewedSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(baseSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(hardRejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(unreviewedSkill)).toBe(false);
  });

  it("curates Health and Fitness skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "health-and-fitness/filipe-m-almeida-health-sync",
      slug: "filipe-m-almeida-health-sync",
      name: "health-sync",
      description: "Analyze synced health data across Oura, Withings, Hevy, Strava, WHOOP, and Eight Sleep.",
      categorySlug: "health-and-fitness",
      categoryName: "Health And Fitness",
      sourceUrl: "https://clawskills.sh/skills/filipe-m-almeida-health-sync",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# health-sync",
      installNotes: null,
    });

    expect(skill.name).toBe("Wearable Health Data Sync");
    expect(skill.slug).toBe("wearable-health-data-sync");
    expect(skill.tags).toContain("health-data");
    expect(skill.tags).toContain("wearables");
    expect(skill.tags).toContain("sensitive-personal-data");
    expect(skill.tags).toContain("requires-human-confirmation");
    expect(skill.markdown).toContain("PaperClaw fit");
    expect(skill.markdown).toContain("approved health-data analysis agents");
    expect(skill.markdown).toContain("board approval");
    expect(skill.installNotes).toContain("PaperClaw-curated entry");
  });

  it("matches Health and Fitness curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "health-and-fitness/kesslerio-oura-analytics",
      slug: "kesslerio-oura-analytics",
      name: "oura-analytics",
      description: "Oura Ring data integration and analytics.",
      categorySlug: "health-and-fitness",
      categoryName: "Health And Fitness",
      sourceUrl: "https://clawskills.sh/skills/kesslerio-oura-analytics",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# oura-analytics",
      installNotes: null,
    });

    expect(skill.name).toBe("Oura Recovery Analytics");
    expect(skill.slug).toBe("oura-recovery-analytics");
    expect(marketplaceSkillMatchesQuery(skill, { q: "oura" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "recovery" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "approved health-data" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "transition-api" })).toBe(false);
    expect(marketplaceSkillMatchesQuery(skill, { q: "oura", category: "health-and-fitness" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "oura", category: "devops-and-cloud" })).toBe(false);
  });

  it("filters Health and Fitness to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "health-and-fitness.md"),
      [
        "# Health & Fitness",
        "",
        "- [health-sync](https://clawskills.sh/skills/filipe-m-almeida-health-sync) - Analyze synced health data across wearables.",
        "- [fitbit](https://clawskills.sh/skills/mjrussell-fitbit) - Query Fitbit health data including sleep and heart rate.",
        "- [oura-analytics](https://clawskills.sh/skills/kesslerio-oura-analytics) - Oura Ring data integration and analytics.",
        "- [capa-officer](https://clawskills.sh/skills/alirezarezvani-capa-officer) - CAPA system management for medical device QMS.",
        "- [maccabi-pharm-search](https://clawskills.sh/skills/alexpolonsky-maccabi-pharm-search) - Check medication stock at Maccabi pharmacies.",
        "- [calorie-counter](https://clawskills.sh/skills/cnqso-calorie-counter) - Track daily calorie and protein intake.",
        "- [vynn-backtester](https://clawskills.sh/skills/beee003-vynn-backtester) - Run trading strategy backtests.",
        "- [health-guardian](https://clawskills.sh/skills/cgtreadw-health-guardian) - Proactive health monitoring for AI agents.",
        "- [usdc-hackathon](https://clawskills.sh/skills/swairshah-usdc-hackathon) - USDC Hackathon skill.",
        "- [unknown-health-thing](https://clawskills.sh/skills/example-unknown-health-thing) - Unreviewed health automation.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "health-and-fitness", name: "Health And Fitness", slug: "health-and-fitness", skillCount: 5 },
    ]);
  });

  it("marks Health and Fitness maybe, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "health-and-fitness/cnqso-calorie-counter",
      slug: "cnqso-calorie-counter",
      name: "calorie-counter",
      description: "Track daily calorie and protein intake.",
      categorySlug: "health-and-fitness",
      categoryName: "Health And Fitness",
      sourceUrl: "https://clawskills.sh/skills/cnqso-calorie-counter",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const keepSkill = {
      ...maybeSkill,
      id: "health-and-fitness/mjrussell-fitbit",
      slug: "Fitbit",
      name: "Fitbit",
      sourceUrl: "https://clawskills.sh/skills/mjrussell-fitbit",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "health-and-fitness/beee003-vynn-backtester",
      slug: "beee003-vynn-backtester",
      name: "vynn-backtester",
      sourceUrl: "https://clawskills.sh/skills/beee003-vynn-backtester",
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "health-and-fitness/cgtreadw-health-guardian",
      slug: "cgtreadw-health-guardian",
      name: "health-guardian",
      sourceUrl: "https://clawskills.sh/skills/cgtreadw-health-guardian",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "health-and-fitness/example-unknown-health-thing",
      slug: "example-unknown-health-thing",
      name: "unknown-health-thing",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-health-thing",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(duplicateSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(unreviewedSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(duplicateSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(unreviewedSkill)).toBe(false);
  });

  it("curates iOS and macOS Development skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "ios-and-macos-development/steipete-swift-concurrency-expert",
      slug: "steipete-swift-concurrency-expert",
      name: "swift-concurrency-expert",
      description: "Swift Concurrency review and remediation.",
      categorySlug: "ios-and-macos-development",
      categoryName: "Ios And Macos Development",
      sourceUrl: "https://clawskills.sh/skills/steipete-swift-concurrency-expert",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# swift-concurrency-expert",
      installNotes: null,
    });

    expect(skill.name).toBe("Swift Concurrency Review");
    expect(skill.slug).toBe("swift-concurrency-review");
    expect(skill.tags).toContain("swift");
    expect(skill.tags).toContain("ios");
    expect(skill.tags).toContain("macos");
    expect(skill.tags).toContain("code-review");
    expect(skill.markdown).toContain("PaperClaw fit");
    expect(skill.markdown).toContain("approved Apple-platform development agents");
    expect(skill.installNotes).toContain("PaperClaw-curated entry");
  });

  it("matches iOS and macOS Development curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "ios-and-macos-development/tristanmanchester-ios-simulator",
      slug: "tristanmanchester-ios-simulator",
      name: "ios-simulator",
      description: "Automate iOS Simulator workflows (simctl + idb)",
      categorySlug: "ios-and-macos-development",
      categoryName: "Ios And Macos Development",
      sourceUrl: "https://clawskills.sh/skills/tristanmanchester-ios-simulator",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# ios-simulator",
      installNotes: null,
    });

    expect(skill.name).toBe("iOS Simulator Automation");
    expect(skill.slug).toBe("ios-simulator-automation");
    expect(marketplaceSkillMatchesQuery(skill, { q: "simulator" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "xcode" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "approved Apple-platform" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "transition-api" })).toBe(false);
    expect(marketplaceSkillMatchesQuery(skill, { q: "simulator", category: "ios-and-macos-development" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "simulator", category: "health-and-fitness" })).toBe(false);
  });

  it("filters iOS and macOS Development to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "ios-and-macos-development.md"),
      [
        "# iOS & macOS Development",
        "",
        "- [apple-docs](https://clawskills.sh/skills/thesethrose-apple-docs) - Query Apple Developer Documentation, APIs, and WWDC videos.",
        "- [instruments-profiling](https://clawskills.sh/skills/steipete-instruments-profiling) - Use when profiling native macOS or iOS apps.",
        "- [ios-simulator](https://clawskills.sh/skills/tristanmanchester-ios-simulator) - Automate iOS Simulator workflows.",
        "- [swift-concurrency-expert](https://clawskills.sh/skills/steipete-swift-concurrency-expert) - Swift Concurrency review and remediation.",
        "- [lulu-monitor](https://clawskills.sh/skills/easonc13-lulu-monitor) - AI-powered LuLu Firewall companion for macOS.",
        "- [opsecmd](https://clawskills.sh/skills/wulf715-opsecmd) - Operational security reminders.",
        "- [mac-power-tools](https://clawskills.sh/skills/aadipapp-mac-power-tools) - Combined cleanup and Android transfer tools.",
        "- [riskofficer](https://clawskills.sh/skills/mib424242-riskofficer) - Manage investment portfolios.",
        "- [wopr-clock](https://clawskills.sh/skills/seanweiyi-wopr-clock) - Retro countdown clock.",
        "- [unknown-ios-thing](https://clawskills.sh/skills/example-unknown-ios-thing) - Unreviewed Apple development tool.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "ios-and-macos-development", name: "Ios And Macos Development", slug: "ios-and-macos-development", skillCount: 5 },
    ]);
  });

  it("marks iOS and macOS Development maybe, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "ios-and-macos-development/wulf715-opsecmd",
      slug: "wulf715-opsecmd",
      name: "opsecmd",
      description: "Operational security reminders.",
      categorySlug: "ios-and-macos-development",
      categoryName: "Ios And Macos Development",
      sourceUrl: "https://clawskills.sh/skills/wulf715-opsecmd",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const keepSkill = {
      ...maybeSkill,
      id: "ios-and-macos-development/steipete-instruments-profiling",
      slug: "Instruments Profiling",
      name: "Instruments Profiling",
      sourceUrl: "https://clawskills.sh/skills/steipete-instruments-profiling",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "ios-and-macos-development/mib424242-riskofficer",
      slug: "mib424242-riskofficer",
      name: "riskofficer",
      sourceUrl: "https://clawskills.sh/skills/mib424242-riskofficer",
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "ios-and-macos-development/aadipapp-mac-power-tools",
      slug: "aadipapp-mac-power-tools",
      name: "mac-power-tools",
      sourceUrl: "https://clawskills.sh/skills/aadipapp-mac-power-tools",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "ios-and-macos-development/example-unknown-ios-thing",
      slug: "example-unknown-ios-thing",
      name: "unknown-ios-thing",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-ios-thing",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(duplicateSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(unreviewedSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(duplicateSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(unreviewedSkill)).toBe(false);
  });

  it("curates Marketing and Sales skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "marketing-and-sales/jhumanj-apollo",
      slug: "jhumanj-apollo",
      name: "apollo",
      description: "Interact with Apollo.io REST API for people and organization enrichment.",
      categorySlug: "marketing-and-sales",
      categoryName: "Marketing And Sales",
      sourceUrl: "https://clawskills.sh/skills/jhumanj-apollo",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# apollo",
      installNotes: null,
    });

    expect(skill.name).toBe("Apollo Prospect Enrichment");
    expect(skill.slug).toBe("apollo-prospect-enrichment");
    expect(skill.tags).toContain("sales");
    expect(skill.tags).toContain("lead-generation");
    expect(skill.tags).toContain("sensitive-personal-data");
    expect(skill.tags).toContain("requires-human-confirmation");
    expect(skill.markdown).toContain("PaperClaw fit");
    expect(skill.markdown).toContain("approved outbound/revenue agents");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Marketing and Sales curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "marketing-and-sales/grahac-botsee",
      slug: "grahac-botsee",
      name: "botsee",
      description: "Monitor your brand's AI visibility via BotSee API.",
      categorySlug: "marketing-and-sales",
      categoryName: "Marketing And Sales",
      sourceUrl: "https://clawskills.sh/skills/grahac-botsee",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# botsee",
      installNotes: null,
    });

    expect(skill.name).toBe("BotSee AI Visibility Monitor");
    expect(skill.slug).toBe("botsee-ai-visibility-monitor");
    expect(marketplaceSkillMatchesQuery(skill, { q: "ai-seo" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "brand-monitoring" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "revenue agents" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "transition-api" })).toBe(false);
    expect(marketplaceSkillMatchesQuery(skill, { q: "ai-seo", category: "marketing-and-sales" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "ai-seo", category: "ios-and-macos-development" })).toBe(false);
  });

  it("filters Marketing and Sales to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "marketing-and-sales.md"),
      [
        "# Marketing & Sales",
        "",
        "- [apollo](https://clawskills.sh/skills/jhumanj-apollo) - Apollo.io people and organization enrichment.",
        "- [botsee](https://clawskills.sh/skills/grahac-botsee) - Monitor brand AI visibility.",
        "- [content-creator](https://clawskills.sh/skills/alirezarezvani-content-creator) - Create SEO-optimized marketing content.",
        "- [meta-ads-report](https://clawskills.sh/skills/kein-s-meta-ads-report) - Monitor Meta advertising performance.",
        "- [postiz](https://github.com/openclaw/skills/tree/main/skills/nevo-david/postiz/SKILL.md) - Schedule social media posts.",
        "- [workcrm](https://clawskills.sh/skills/extraterrest-workcrm) - Local-first CRM with confirmation gate.",
        "- [cold-email](https://clawskills.sh/skills/bluecraft-ai-cold-email) - Generate personalized cold email sequences.",
        "- [writing-group-leader](https://clawskills.sh/skills/urrrich-writing-group-leader) - Writing Team Lead duplicate.",
        "- [changenow](https://clawskills.sh/skills/yakelb0815-changenow) - Perform instant crypto swaps.",
        "- [listing-swarm](https://clawhub.ai/skills/listing-swarm) - Submit AI products to directories automatically.",
        "- [unknown-marketing-thing](https://clawskills.sh/skills/example-unknown-marketing-thing) - Unreviewed marketing automation.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "marketing-and-sales", name: "Marketing And Sales", slug: "marketing-and-sales", skillCount: 6 },
    ]);
  });

  it("marks Marketing and Sales maybe, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "marketing-and-sales/bluecraft-ai-cold-email",
      slug: "bluecraft-ai-cold-email",
      name: "cold-email",
      description: "Generate hyper-personalized cold email sequences.",
      categorySlug: "marketing-and-sales",
      categoryName: "Marketing And Sales",
      sourceUrl: "https://clawskills.sh/skills/bluecraft-ai-cold-email",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const keepSkill = {
      ...maybeSkill,
      id: "marketing-and-sales/jhumanj-apollo",
      slug: "Apollo",
      name: "Apollo",
      sourceUrl: "https://clawskills.sh/skills/jhumanj-apollo",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "marketing-and-sales/yakelb0815-changenow",
      slug: "yakelb0815-changenow",
      name: "changenow",
      sourceUrl: "https://clawskills.sh/skills/yakelb0815-changenow",
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "marketing-and-sales/urrrich-writing-group-leader",
      slug: "urrrich-writing-group-leader",
      name: "writing-group-leader",
      sourceUrl: "https://clawskills.sh/skills/urrrich-writing-group-leader",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "marketing-and-sales/example-unknown-marketing-thing",
      slug: "example-unknown-marketing-thing",
      name: "unknown-marketing-thing",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-marketing-thing",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(duplicateSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(unreviewedSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(duplicateSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(unreviewedSkill)).toBe(false);
  });

  it("curates Notes and PKM skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "notes-and-pkm/tyler6204-better-notion",
      slug: "tyler6204-better-notion",
      name: "better-notion",
      description: "Better Notion integration for pages and databases.",
      categorySlug: "notes-and-pkm",
      categoryName: "Notes And PKM",
      sourceUrl: "https://clawskills.sh/skills/tyler6204-better-notion",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# better-notion",
      installNotes: null,
    });

    expect(skill.name).toBe("Notion Workspace Manager");
    expect(skill.slug).toBe("notion-workspace-manager");
    expect(skill.tags).toContain("knowledge-base");
    expect(skill.tags).toContain("requires-human-confirmation");
    expect(skill.markdown).toContain("long-running company-memory agents");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Notes and PKM curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "notes-and-pkm/jarvis-drakon-shieldcortex-skill",
      slug: "jarvis-drakon-shieldcortex-skill",
      name: "shieldcortex-skill",
      description: "Memory poisoning defense.",
      categorySlug: "notes-and-pkm",
      categoryName: "Notes And PKM",
      sourceUrl: "https://clawskills.sh/skills/jarvis-drakon-shieldcortex-skill",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# shieldcortex-skill",
      installNotes: null,
    });

    expect(skill.name).toBe("ShieldCortex Memory Safety");
    expect(skill.slug).toBe("shieldcortex-memory-safety");
    expect(marketplaceSkillMatchesQuery(skill, { q: "memory-poisoning" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "company-memory" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "prompt-injection", category: "notes-and-pkm" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "prompt-injection", category: "marketing-and-sales" })).toBe(false);
  });

  it("filters Notes and PKM to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "notes-and-pkm.md"),
      [
        "# Notes & PKM",
        "",
        "- [better-notion](https://clawskills.sh/skills/tyler6204-better-notion) - Better Notion workspace access.",
        "- [apple-notes](https://clawskills.sh/skills/steipete-apple-notes) - Manage Apple Notes.",
        "- [bookstack](https://clawskills.sh/skills/xenofex7-bookstack) - BookStack wiki manager.",
        "- [agent-wal](https://clawskills.sh/skills/bowen31337-agent-wal) - Agent write-ahead log.",
        "- [meeting-to-action](https://clawskills.sh/skills/codedao12-meeting-to-action) - Convert meetings into actions.",
        "- [shieldcortex-skill](https://clawskills.sh/skills/jarvis-drakon-shieldcortex-skill) - Memory poisoning defense.",
        "- [voice-notes-pro](https://clawskills.sh/skills/toniaczlog-voice-notes-pro) - Voice notes processor.",
        "- [craft](https://clawskills.sh/skills/noah-ribaudo-craft) - Craft notes integration.",
        "- [quickbooks-online](https://clawskills.sh/skills/paulbudveit-quickbooks-online) - QuickBooks accounting.",
        "- [json-modifier](https://clawskills.sh/skills/wanng-ide-json-modifier) - Modify JSON files.",
        "- [unknown-notes-skill](https://clawskills.sh/skills/example-unknown-notes-skill) - Unreviewed notes skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "notes-and-pkm", name: "Notes And Pkm", slug: "notes-and-pkm", skillCount: 7 },
    ]);
  });

  it("marks Notes and PKM maybe, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "notes-and-pkm/noah-ribaudo-craft",
      slug: "noah-ribaudo-craft",
      name: "craft",
      description: "Craft notes integration.",
      categorySlug: "notes-and-pkm",
      categoryName: "Notes And PKM",
      sourceUrl: "https://clawskills.sh/skills/noah-ribaudo-craft",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const keepSkill = {
      ...maybeSkill,
      id: "notes-and-pkm/atomtanstudio-craft-do",
      slug: "atomtanstudio-craft-do",
      name: "craft-do",
      sourceUrl: "https://clawskills.sh/skills/atomtanstudio-craft-do",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "notes-and-pkm/paulbudveit-quickbooks-online",
      slug: "paulbudveit-quickbooks-online",
      name: "quickbooks-online",
      sourceUrl: "https://clawskills.sh/skills/paulbudveit-quickbooks-online",
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "notes-and-pkm/riley-coyote-continuity-framework",
      slug: "riley-coyote-continuity-framework",
      name: "continuity-framework",
      sourceUrl: "https://clawskills.sh/skills/riley-coyote-continuity-framework",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "notes-and-pkm/example-unknown-notes-skill",
      slug: "example-unknown-notes-skill",
      name: "unknown-notes-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-notes-skill",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(duplicateSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(unreviewedSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(duplicateSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(unreviewedSkill)).toBe(false);
  });

  it("curates Productivity and Tasks skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "productivity-and-tasks/pvoo-clickup-mcp",
      slug: "pvoo-clickup-mcp",
      name: "clickup-mcp",
      description: "Manage ClickUp tasks, docs, time tracking, comments, chat, and search.",
      categorySlug: "productivity-and-tasks",
      categoryName: "Productivity And Tasks",
      sourceUrl: "https://clawskills.sh/skills/pvoo-clickup-mcp",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# clickup-mcp",
      installNotes: null,
    });

    expect(skill.name).toBe("ClickUp Workspace Manager");
    expect(skill.slug).toBe("clickup-workspace-manager");
    expect(skill.tags).toContain("project-management");
    expect(skill.tags).toContain("requires-human-confirmation");
    expect(skill.markdown).toContain("approved workflow automation agents");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Productivity and Tasks curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "productivity-and-tasks/zlc000190-writing-plans",
      slug: "zlc000190-writing-plans",
      name: "writing-plans",
      description: "Write implementation plans before touching code.",
      categorySlug: "productivity-and-tasks",
      categoryName: "Productivity And Tasks",
      sourceUrl: "https://clawskills.sh/skills/zlc000190-writing-plans",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# writing-plans",
      installNotes: null,
    });

    expect(skill.name).toBe("Implementation Plan Writer");
    expect(skill.slug).toBe("implementation-plan-writer");
    expect(marketplaceSkillMatchesQuery(skill, { q: "acceptance-criteria" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "board-visible" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "planning", category: "productivity-and-tasks" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "planning", category: "notes-and-pkm" })).toBe(false);
  });

  it("filters Productivity and Tasks to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "productivity-and-tasks.md"),
      [
        "# Productivity & Tasks",
        "",
        "- [asana](https://clawskills.sh/skills/k0nkupa-asana) - Integrate Asana with Clawdbot.",
        "- [clickup-mcp](https://clawskills.sh/skills/pvoo-clickup-mcp) - Manage ClickUp tasks and docs.",
        "- [brainz-tasks](https://clawskills.sh/skills/xejrax-brainz-tasks) - Manage Todoist tasks.",
        "- [humanod](https://clawskills.sh/skills/armandobrazil-humanod) - Hire humans for real-world tasks.",
        "- [invoice-tracker-pro](https://clawskills.sh/skills/kambrosgroup-invoice-tracker-pro) - Track invoices.",
        "- [session-watchdog](https://clawskills.sh/skills/xbillwatsonx-session-watchdog) - Save checkpoints before compaction.",
        "- [writing-plans](https://clawskills.sh/skills/zlc000190-writing-plans) - Write implementation plans.",
        "- [4todo](https://clawskills.sh/skills/blackstorm-4todo) - Manage 4todo.",
        "- [clickup-skill](https://clawskills.sh/skills/d3layd-clickup-skill) - ClickUp duplicate.",
        "- [actual-budget](https://clawskills.sh/skills/thisisjeron-actual-budget) - Personal finance.",
        "- [postfast](https://clawskills.sh/skills/peturgeorgievv-postfast) - Social media scheduling.",
        "- [unknown-productivity-skill](https://clawskills.sh/skills/example-unknown-productivity-skill) - Unreviewed productivity skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "productivity-and-tasks", name: "Productivity And Tasks", slug: "productivity-and-tasks", skillCount: 7 },
    ]);
  });

  it("marks Productivity and Tasks maybe, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "productivity-and-tasks/blackstorm-4todo",
      slug: "blackstorm-4todo",
      name: "4todo",
      description: "Manage 4todo from chat.",
      categorySlug: "productivity-and-tasks",
      categoryName: "Productivity And Tasks",
      sourceUrl: "https://clawskills.sh/skills/blackstorm-4todo",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const keepSkill = {
      ...maybeSkill,
      id: "productivity-and-tasks/k0nkupa-asana",
      slug: "k0nkupa-asana",
      name: "asana",
      sourceUrl: "https://clawskills.sh/skills/k0nkupa-asana",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "productivity-and-tasks/thisisjeron-actual-budget",
      slug: "thisisjeron-actual-budget",
      name: "actual-budget",
      sourceUrl: "https://clawskills.sh/skills/thisisjeron-actual-budget",
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "productivity-and-tasks/d3layd-clickup-skill",
      slug: "d3layd-clickup-skill",
      name: "clickup-skill",
      sourceUrl: "https://clawskills.sh/skills/d3layd-clickup-skill",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "productivity-and-tasks/example-unknown-productivity-skill",
      slug: "example-unknown-productivity-skill",
      name: "unknown-productivity-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-productivity-skill",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(duplicateSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(unreviewedSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(duplicateSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(unreviewedSkill)).toBe(false);
  });

  it("curates Security and Passwords skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "security-and-passwords/steipete-1password",
      slug: "steipete-1password",
      name: "1password",
      description: "Set up and use 1Password CLI.",
      categorySlug: "security-and-passwords",
      categoryName: "Security And Passwords",
      sourceUrl: "https://clawskills.sh/skills/steipete-1password",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# 1password",
      installNotes: null,
    });

    expect(skill.name).toBe("1Password CLI Vault");
    expect(skill.slug).toBe("onepassword-cli-vault");
    expect(skill.tags).toContain("password-manager");
    expect(skill.tags).toContain("sensitive-personal-data");
    expect(skill.markdown).toContain("trusted credential-handling agents");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Security and Passwords curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "security-and-passwords/jamesouttake-domain-trust-check",
      slug: "jamesouttake-domain-trust-check",
      name: "domain-trust-check",
      description: "Check URLs for phishing, malware, brand abuse, and scams.",
      categorySlug: "security-and-passwords",
      categoryName: "Security And Passwords",
      sourceUrl: "https://clawskills.sh/skills/jamesouttake-domain-trust-check",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# domain-trust-check",
      installNotes: null,
    });

    expect(skill.name).toBe("Domain Trust Check");
    expect(skill.slug).toBe("domain-trust-check");
    expect(marketplaceSkillMatchesQuery(skill, { q: "phishing" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "domain-trust" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "malware", category: "security-and-passwords" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "malware", category: "productivity-and-tasks" })).toBe(false);
  });

  it("filters Security and Passwords to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "security-and-passwords.md"),
      [
        "# Security & Passwords",
        "",
        "- [1password](https://clawskills.sh/skills/steipete-1password) - Set up and use 1Password CLI.",
        "- [api-security](https://clawskills.sh/skills/brandonwise-api-security) - Implement secure API design patterns.",
        "- [domain-trust-check](https://clawskills.sh/skills/jamesouttake-domain-trust-check) - Check URLs for phishing.",
        "- [ggshield-scanner](https://clawskills.sh/skills/amascia-gg-ggshield-scanner) - Detect hardcoded secrets.",
        "- [age-verification](https://clawskills.sh/skills/raghulpasupathi-age-verification) - Age verification.",
        "- [vnsh](https://clawskills.sh/skills/raullenchai-vnsh) - Encrypted expiring links.",
        "- [bitwarden-vault](https://clawskills.sh/skills/startupbros-bitwarden-vault) - Bitwarden CLI setup.",
        "- [clawaudit](https://clawskills.sh/skills/tezatezaz-clawaudit) - Coming soon security audit.",
        "- [audit-badge-demo](https://clawskills.sh/skills/tezatezaz-audit-badge-demo) - Demo workflow.",
        "- [clawdstrike-test](https://clawskills.sh/skills/misirov-clawdstrike-test) - Test variant.",
        "- [outtake-bounty-network](https://clawskills.sh/skills/jamesouttake-outtake-bounty-network) - Earn USDC for domains.",
        "- [unknown-security-skill](https://clawskills.sh/skills/example-unknown-security-skill) - Unreviewed security skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "security-and-passwords", name: "Security And Passwords", slug: "security-and-passwords", skillCount: 6 },
    ]);
  });

  it("marks Security and Passwords maybe, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "security-and-passwords/startupbros-bitwarden-vault",
      slug: "startupbros-bitwarden-vault",
      name: "bitwarden-vault",
      description: "Bitwarden CLI setup.",
      categorySlug: "security-and-passwords",
      categoryName: "Security And Passwords",
      sourceUrl: "https://clawskills.sh/skills/startupbros-bitwarden-vault",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const keepSkill = {
      ...maybeSkill,
      id: "security-and-passwords/asleep123-bitwarden",
      slug: "asleep123-bitwarden",
      name: "bitwarden",
      sourceUrl: "https://clawskills.sh/skills/asleep123-bitwarden",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "security-and-passwords/tezatezaz-audit-badge-demo",
      slug: "tezatezaz-audit-badge-demo",
      name: "audit-badge-demo",
      sourceUrl: "https://clawskills.sh/skills/tezatezaz-audit-badge-demo",
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "security-and-passwords/misirov-clawdstrike-test",
      slug: "misirov-clawdstrike-test",
      name: "clawdstrike-test",
      sourceUrl: "https://clawskills.sh/skills/misirov-clawdstrike-test",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "security-and-passwords/example-unknown-security-skill",
      slug: "example-unknown-security-skill",
      name: "unknown-security-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-security-skill",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(duplicateSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(unreviewedSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(duplicateSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(unreviewedSkill)).toBe(false);
  });

  it("curates Shopping and E-commerce skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "shopping-and-e-commerce/alhwyn-clawpify",
      slug: "alhwyn-clawpify",
      name: "clawpify",
      description: "Query and manage Shopify stores via GraphQL Admin API.",
      categorySlug: "shopping-and-e-commerce",
      categoryName: "Shopping And E-commerce",
      sourceUrl: "https://clawskills.sh/skills/alhwyn-clawpify",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# clawpify",
      installNotes: null,
    });

    expect(skill.name).toBe("Shopify Admin Operator");
    expect(skill.slug).toBe("shopify-admin-operator");
    expect(skill.tags).toContain("shopify");
    expect(skill.tags).toContain("store-ops");
    expect(skill.tags).toContain("requires-human-confirmation");
    expect(skill.markdown).toContain("revenue-operations agents");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Shopping and E-commerce curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "shopping-and-e-commerce/eftalyurtseven-eachlabs-product-visuals",
      slug: "eftalyurtseven-eachlabs-product-visuals",
      name: "eachlabs-product-visuals",
      description: "Generate e-commerce product photography and videos.",
      categorySlug: "shopping-and-e-commerce",
      categoryName: "Shopping And E-commerce",
      sourceUrl: "https://clawskills.sh/skills/eftalyurtseven-eachlabs-product-visuals",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# eachlabs-product-visuals",
      installNotes: null,
    });

    expect(skill.name).toBe("Product Visual Studio");
    expect(skill.slug).toBe("product-visual-studio");
    expect(marketplaceSkillMatchesQuery(skill, { q: "product-visuals" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "storefronts", category: "shopping-and-e-commerce" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "storefronts", category: "marketing-and-sales" })).toBe(false);
  });

  it("filters Shopping and E-commerce to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "shopping-and-e-commerce.md"),
      [
        "# Shopping & E-commerce",
        "",
        "- [amazon-competitor-analyzer](https://clawskills.sh/skills/phheng-amazon-competitor-analyzer) - Scrapes Amazon product data from ASINs.",
        "- [atoship](https://clawskills.sh/skills/atoship-dev-atoship) - Ship packages and buy labels.",
        "- [bricklink](https://clawskills.sh/skills/odrobnik-bricklink) - BrickLink Store API helper.",
        "- [clawpify](https://clawskills.sh/skills/alhwyn-clawpify) - Query and manage Shopify stores.",
        "- [clawver-digital-products](https://clawskills.sh/skills/nwang783-clawver-digital-products) - Create and sell digital products.",
        "- [clawver-reviews](https://clawskills.sh/skills/nwang783-clawver-reviews) - Handle customer reviews.",
        "- [dupe](https://clawskills.sh/skills/crisanmm-dupe) - Find similar products.",
        "- [eachlabs-product-visuals](https://clawskills.sh/skills/eftalyurtseven-eachlabs-product-visuals) - Generate product visuals.",
        "- [jtbd-analyzer](https://clawskills.sh/skills/artyomx33-jtbd-analyzer) - Analyze customer jobs to be done.",
        "- [marktplaats](https://clawskills.sh/skills/pvoo-marktplaats) - Search Dutch classifieds.",
        "- [popup-referrals](https://clawskills.sh/skills/eliaskress-popup-referrals) - Track referral earnings.",
        "- [whop-cli](https://clawskills.sh/skills/g9pedro-whop-cli) - Manage Whop products and payments.",
        "- [amazon-orders](https://clawskills.sh/skills/pfernandez98-amazon-orders) - Download Amazon order history.",
        "- [buy-anything](https://clawskills.sh/skills/tsyvic-buy-anything) - Purchase products from Amazon.",
        "- [stock-price-checker](https://clawskills.sh/skills/rupprath-stock-price-checker) - Check stock prices.",
        "- [unknown-shopping-skill](https://clawskills.sh/skills/example-unknown-shopping-skill) - Unreviewed shopping skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "shopping-and-e-commerce", name: "Shopping And E Commerce", slug: "shopping-and-e-commerce", skillCount: 12 },
    ]);
  });

  it("marks Shopping and E-commerce maybe, reject, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "shopping-and-e-commerce/tsyvic-buy-anything",
      slug: "tsyvic-buy-anything",
      name: "buy-anything",
      description: "Purchase products from Amazon through conversational checkout.",
      categorySlug: "shopping-and-e-commerce",
      categoryName: "Shopping And E-commerce",
      sourceUrl: "https://clawskills.sh/skills/tsyvic-buy-anything",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const keepSkill = {
      ...maybeSkill,
      id: "shopping-and-e-commerce/g9pedro-whop-cli",
      slug: "g9pedro-whop-cli",
      name: "whop-cli",
      sourceUrl: "https://clawskills.sh/skills/g9pedro-whop-cli",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "shopping-and-e-commerce/rupprath-stock-price-checker",
      slug: "rupprath-stock-price-checker",
      name: "stock-price-checker",
      sourceUrl: "https://clawskills.sh/skills/rupprath-stock-price-checker",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "shopping-and-e-commerce/example-unknown-shopping-skill",
      slug: "example-unknown-shopping-skill",
      name: "unknown-shopping-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-shopping-skill",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(unreviewedSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(unreviewedSkill)).toBe(false);
  });

  it("curates Smart Home and IoT skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "smart-home-and-iot/chris6970barbarian-hue-glitch-homeassistant",
      slug: "chris6970barbarian-hue-glitch-homeassistant",
      name: "glitch-homeassistant",
      description: "Control smart home devices via Home Assistant API.",
      categorySlug: "smart-home-and-iot",
      categoryName: "Smart Home And IoT",
      sourceUrl: "https://clawskills.sh/skills/chris6970barbarian-hue-glitch-homeassistant",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# glitch-homeassistant",
      installNotes: null,
    });

    expect(skill.name).toBe("Home Assistant Device Control");
    expect(skill.slug).toBe("home-assistant-device-control");
    expect(skill.tags).toContain("home-assistant");
    expect(skill.tags).toContain("physical-device-control");
    expect(skill.tags).toContain("requires-human-confirmation");
    expect(skill.markdown).toContain("physical-device operations agents");
    expect(skill.markdown).toContain("Physical Device Control.");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Smart Home and IoT curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "smart-home-and-iot/porygonthebot-frigate",
      slug: "porygonthebot-frigate",
      name: "frigate",
      description: "Access Frigate NVR cameras with session-based authentication.",
      categorySlug: "smart-home-and-iot",
      categoryName: "Smart Home And IoT",
      sourceUrl: "https://clawskills.sh/skills/porygonthebot-frigate",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# frigate",
      installNotes: null,
    });

    expect(skill.name).toBe("Frigate NVR Camera Monitor");
    expect(skill.slug).toBe("frigate-nvr-camera-monitor");
    expect(marketplaceSkillMatchesQuery(skill, { q: "camera-privacy" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "nvr", category: "smart-home-and-iot" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "nvr", category: "security-and-passwords" })).toBe(false);
  });

  it("filters Smart Home and IoT to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "smart-home-and-iot.md"),
      [
        "# Smart Home & IoT",
        "",
        "- [homeassistant](https://clawskills.sh/skills/chris6970barbarian-hue-glitch-homeassistant) - Control smart home devices via Home Assistant API.",
        "- [homebridge](https://clawskills.sh/skills/jiasenl-clawdbot-skill-homebridge) - Control smart home devices via Homebridge.",
        "- [homey](https://clawskills.sh/skills/maxsumrall-homey) - Control Athom Homey smart home devices.",
        "- [homey-cli](https://clawskills.sh/skills/krausefx-homey-cli) - Control Homey home automation hub.",
        "- [dirigera-control](https://clawskills.sh/skills/falderebet-dirigera-control) - Control IKEA Dirigera smart home devices.",
        "- [beestat](https://clawskills.sh/skills/mjrussell-beestat) - Query ecobee thermostat data.",
        "- [dht11-temp](https://clawskills.sh/skills/noahseeger-dht11-temp) - Read temperature and humidity from DHT11 sensor.",
        "- [farmos-weather](https://clawskills.sh/skills/brianppetty-farmos-weather) - Query weather data and forecasts for farm fields.",
        "- [frigate](https://clawskills.sh/skills/porygonthebot-frigate) - Access Frigate NVR cameras.",
        "- [ipcam](https://clawskills.sh/skills/ltpop-ipcam) - ONVIF PTZ control and RTSP capture.",
        "- [nest-sdm](https://clawskills.sh/skills/tag-assistant-nest-sdm) - Control Nest thermostat, doorbell, and cameras.",
        "- [tempest-weather](https://clawskills.sh/skills/wranglerdriver-tempest-weather) - Get WeatherFlow Tempest station conditions.",
        "- [bambu-cli](https://clawskills.sh/skills/tobiasbischoff-bambu-cli) - Operate BambuLab printers.",
        "- [bambu-local](https://clawskills.sh/skills/tanguyvans-bambu-local) - Control Bambu Lab printers locally via MQTT.",
        "- [dyson-cli](https://clawskills.sh/skills/tmustier-dyson-cli) - Control Dyson air purifiers, fans, and heaters.",
        "- [enzoldhazam](https://clawskills.sh/skills/daniel-laszlo-enzoldhazam) - NGBS iCON thermostat control.",
        "- [google-home](https://clawskills.sh/skills/mitchellbernstein-google-home) - Control Google Nest devices.",
        "- [lg-thinq](https://clawskills.sh/skills/kaiofreitas-lg-thinq) - Control LG smart appliances.",
        "- [anova-oven](https://clawskills.sh/skills/dodeja-anova-skill) - Control Anova Precision Ovens.",
        "- [wiz-light-control](https://clawskills.sh/skills/canbirlik-wiz-light-control) - Control Wiz smart bulbs.",
        "- [eightctl](https://clawskills.sh/skills/steipete-eightctl) - Control Eight Sleep pods.",
        "- [anthropology](https://clawskills.sh/skills/networktheoryappliedresearchinstitute-anthropology) - Teaching skill.",
        "- [unknown-smart-home-skill](https://clawskills.sh/skills/example-unknown-smart-home-skill) - Unreviewed smart home skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "smart-home-and-iot", name: "Smart Home And Iot", slug: "smart-home-and-iot", skillCount: 18 },
    ]);
  });

  it("marks Smart Home and IoT maybe, reject, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "smart-home-and-iot/dodeja-anova-skill",
      slug: "dodeja-anova-skill",
      name: "anova-oven",
      description: "Control Anova Precision Ovens and Precision Cookers.",
      categorySlug: "smart-home-and-iot",
      categoryName: "Smart Home And IoT",
      sourceUrl: "https://clawskills.sh/skills/dodeja-anova-skill",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const keepSkill = {
      ...maybeSkill,
      id: "smart-home-and-iot/tanguyvans-bambu-local",
      slug: "tanguyvans-bambu-local",
      name: "bambu-local",
      sourceUrl: "https://clawskills.sh/skills/tanguyvans-bambu-local",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "smart-home-and-iot/steipete-eightctl",
      slug: "steipete-eightctl",
      name: "eightctl",
      sourceUrl: "https://clawskills.sh/skills/steipete-eightctl",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "smart-home-and-iot/example-unknown-smart-home-skill",
      slug: "example-unknown-smart-home-skill",
      name: "unknown-smart-home-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-smart-home-skill",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(marketplaceSkillCurationPolicy(rejectSkill)).toBe("reject");
    expect(marketplaceSkillCurationPolicy(unreviewedSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
    expect(isMarketplaceSkillVisible(rejectSkill)).toBe(false);
    expect(isMarketplaceSkillVisible(unreviewedSkill)).toBe(false);
  });

  it("curates Web and Frontend Development skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "web-and-frontend-development/kjaylee-react-perf",
      slug: "kjaylee-react-perf",
      name: "react-perf",
      description: "React and Next.js performance optimization patterns.",
      categorySlug: "web-and-frontend-development",
      categoryName: "Web And Frontend Development",
      sourceUrl: "https://clawskills.sh/skills/kjaylee-react-perf",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# react-perf",
      installNotes: null,
    });

    expect(skill.name).toBe("React Performance Tuning");
    expect(skill.slug).toBe("react-performance-tuning");
    expect(skill.tags).toContain("web-frontend");
    expect(skill.tags).toContain("core-web-vitals");
    expect(skill.markdown).toContain("approved web release agents");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Web and Frontend Development curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "web-and-frontend-development/cybercentry-cybercentry-web-application-verification",
      slug: "cybercentry-cybercentry-web-application-verification",
      name: "cybercentry-web-application-verification",
      description: "OWASP website and dApp frontend security scans.",
      categorySlug: "web-and-frontend-development",
      categoryName: "Web And Frontend Development",
      sourceUrl: "https://clawskills.sh/skills/cybercentry-cybercentry-web-application-verification",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# cybercentry-web-application-verification",
      installNotes: null,
    });

    expect(skill.name).toBe("OWASP Web App Verification");
    expect(skill.slug).toBe("owasp-web-app-verification");
    expect(marketplaceSkillMatchesQuery(skill, { q: "authorized-testing-only" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "owasp", category: "web-and-frontend-development" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "owasp", category: "security-and-passwords" })).toBe(false);
  });

  it("filters Web and Frontend Development to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "web-and-frontend-development.md"),
      [
        "# Web & Frontend Development",
        "",
        "- [react-perf](https://clawskills.sh/skills/kjaylee-react-perf) - React and Next.js performance optimization patterns.",
        "- [playwright-testing](https://clawskills.sh/skills/kjaylee-playwright-testing) - Test web applications with Playwright.",
        "- [web-hosting](https://clawskills.sh/skills/h4gen-web-hosting) - Deploy local web projects.",
        "- [native-google-analytics](https://clawskills.sh/skills/codeninja23-native-google-analytics) - Query GA4.",
        "- [cybercentry-web-application-verification](https://clawskills.sh/skills/cybercentry-cybercentry-web-application-verification) - OWASP website scanning.",
        "- [safe-web](https://clawskills.sh/skills/adamnaghs-safe-web) - Prompt-safe web fetch.",
        "- [sr-next-clerk-expert](https://clawskills.sh/skills/michaelmonetized-sr-next-clerk-expert) - Clerk auth setup.",
        "- [playwright-mcp-1-0-0](https://clawskills.sh/skills/itsjustfred-playwright-mcp-1-0-0) - Duplicate Playwright MCP.",
        "- [brave-api-search](https://clawskills.sh/skills/broedkrummen-brave-api-search) - Brave Search API.",
        "- [crawl4ai](https://clawskills.sh/skills/codylrn804-crawl4ai) - Web scraper.",
        "- [b0tresch-stealth-browser](https://clawskills.sh/skills/b0tresch-b0tresch-stealth-browser) - Anti-detection browser.",
        "- [bonero-miner](https://clawskills.sh/skills/happybigmtn-bonero-miner) - Crypto miner.",
        "- [unknown-web-skill](https://clawskills.sh/skills/example-unknown-web-skill) - Unreviewed web skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      {
        id: "web-and-frontend-development",
        name: "Web And Frontend Development",
        slug: "web-and-frontend-development",
        skillCount: 6,
      },
    ]);
  });

  it("marks Web and Frontend Development maybe, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "web-and-frontend-development/michaelmonetized-sr-next-clerk-expert",
      slug: "michaelmonetized-sr-next-clerk-expert",
      name: "sr-next-clerk-expert",
      description: "Senior-level Clerk authentication expertise for Next.js apps.",
      categorySlug: "web-and-frontend-development",
      categoryName: "Web And Frontend Development",
      sourceUrl: "https://clawskills.sh/skills/michaelmonetized-sr-next-clerk-expert",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "web-and-frontend-development/itsjustfred-playwright-mcp-1-0-0",
      slug: "itsjustfred-playwright-mcp-1-0-0",
      name: "playwright-mcp-1-0-0",
      sourceUrl: "https://clawskills.sh/skills/itsjustfred-playwright-mcp-1-0-0",
    };
    const keepSkill = {
      ...maybeSkill,
      id: "web-and-frontend-development/kjaylee-playwright-testing",
      slug: "kjaylee-playwright-testing",
      name: "playwright-testing",
      sourceUrl: "https://clawskills.sh/skills/kjaylee-playwright-testing",
    };
    const searchRejectSkill = {
      ...maybeSkill,
      id: "web-and-frontend-development/broedkrummen-brave-api-search",
      slug: "broedkrummen-brave-api-search",
      name: "brave-api-search",
      sourceUrl: "https://clawskills.sh/skills/broedkrummen-brave-api-search",
    };
    const cryptoRejectSkill = {
      ...maybeSkill,
      id: "web-and-frontend-development/happybigmtn-bonero-miner",
      slug: "happybigmtn-bonero-miner",
      name: "bonero-miner",
      sourceUrl: "https://clawskills.sh/skills/happybigmtn-bonero-miner",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "web-and-frontend-development/example-unknown-web-skill",
      slug: "example-unknown-web-skill",
      name: "unknown-web-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-web-skill",
    };

    for (const skill of [maybeSkill, duplicateSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
    for (const skill of [searchRejectSkill, cryptoRejectSkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
  });

  it("curates Image and Video Generation skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "image-and-video-generation/g9pedro-openai-image-cli",
      slug: "g9pedro-openai-image-cli",
      name: "openai-image-cli",
      description: "Generate, edit, and manage images via OpenAI's GPT Image and DALL-E models.",
      categorySlug: "image-and-video-generation",
      categoryName: "Image And Video Generation",
      sourceUrl: "https://clawskills.sh/skills/g9pedro-openai-image-cli",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# openai-image-cli",
      installNotes: null,
    });

    expect(skill.name).toBe("OpenAI Image CLI");
    expect(skill.slug).toBe("openai-image-cli");
    expect(skill.tags).toContain("image-generation");
    expect(skill.tags).toContain("requires-human-confirmation");
    expect(skill.markdown).toContain("approved media-production agents");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Image and Video Generation curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "image-and-video-generation/whalefell-tesseract-ocr",
      slug: "whalefell-tesseract-ocr",
      name: "tesseract-ocr",
      description: "Extract text from images using the Tesseract OCR engine directly via command line.",
      categorySlug: "image-and-video-generation",
      categoryName: "Image And Video Generation",
      sourceUrl: "https://clawskills.sh/skills/whalefell-tesseract-ocr",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# tesseract-ocr",
      installNotes: null,
    });

    expect(skill.name).toBe("Tesseract OCR");
    expect(skill.slug).toBe("tesseract-ocr");
    expect(marketplaceSkillMatchesQuery(skill, { q: "ocr" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "documents" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "media-production" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "ocr", category: "image-and-video-generation" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "ocr", category: "health-and-fitness" })).toBe(false);
  });

  it("filters Image and Video Generation to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "image-and-video-generation.md"),
      [
        "# Image & Video Generation",
        "",
        "- [openai-image-cli](https://clawskills.sh/skills/g9pedro-openai-image-cli) - Generate and edit images via OpenAI.",
        "- [fal-ai](https://clawskills.sh/skills/agmmnn-fal-ai) - Generate images, videos, and audio via fal.ai.",
        "- [comfyui](https://clawskills.sh/skills/xtopher86-comfyui-request) - Send workflow requests to ComfyUI.",
        "- [ffmpeg-video-editor](https://clawskills.sh/skills/mahmoudadelbghany-ffmpeg-video-editor) - Generate FFmpeg commands.",
        "- [canva-connect](https://clawskills.sh/skills/coolmanns-canva-connect) - Manage Canva designs and assets.",
        "- [tesseract-ocr](https://clawskills.sh/skills/whalefell-tesseract-ocr) - Extract text from images.",
        "- [video-editor-ai](https://clawhub.ai/imo14reifey/video-editor-ai) - Edit MP4 by chat.",
        "- [youtube-thumbnail-generation](https://clawskills.sh/skills/eftalyurtseven-youtube-thumbnail-generation) - Generate YouTube thumbnails.",
        "- [ai-avatar-generation](https://clawskills.sh/skills/eftalyurtseven-ai-avatar-generation) - Generate AI avatars.",
        "- [heygen-avatar-lite](https://clawskills.sh/skills/daaab-heygen-avatar-lite) - Create digital human videos.",
        "- [publora-instagram](https://clawskills.sh/skills/sergebulaev-publora-instagram) - Post to Instagram.",
        "- [telegram-media](https://clawskills.sh/skills/ryandeangraves-telegram-media) - Send Telegram media.",
        "- [shopify-bulk-upload](https://clawskills.sh/skills/zhaoteng-qd-shopify-bulk-upload) - Bulk upload products.",
        "- [zhipu-cogview-image](https://clawskills.sh/skills/honestqiao-zhipu-cogview-image) - Generate images with CogView.",
        "- [eachlabs-face-swap](https://clawskills.sh/skills/eftalyurtseven-eachlabs-face-swap) - Swap faces.",
        "- [aiusd](https://clawskills.sh/skills/chaunceyliu-aiusd) - AIUSD trading.",
        "- [gambling](https://clawskills.sh/skills/rollhub-dev-gambling) - Play casino games.",
        "- [hinge-liker](https://clawskills.sh/skills/mattttman-hinge-liker) - Automated Hinge liking.",
        "- [solo-humanize](https://clawskills.sh/skills/fortunto2-solo-humanize) - Strip AI writing patterns.",
        "- [unknown-image-skill](https://clawskills.sh/skills/example-unknown-image-skill) - Unreviewed image tool.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "image-and-video-generation", name: "Image And Video Generation", slug: "image-and-video-generation", skillCount: 8 },
    ]);
  });

  it("marks Image and Video Generation gated, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "image-and-video-generation/eftalyurtseven-ai-avatar-generation",
      slug: "eftalyurtseven-ai-avatar-generation",
      name: "ai-avatar-generation",
      description: "Generate AI avatars from photos or text descriptions.",
      categorySlug: "image-and-video-generation",
      categoryName: "Image And Video Generation",
      sourceUrl: "https://clawskills.sh/skills/eftalyurtseven-ai-avatar-generation",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const keepSkill = {
      ...maybeSkill,
      id: "image-and-video-generation/g9pedro-openai-image-cli",
      slug: "g9pedro-openai-image-cli",
      name: "openai-image-cli",
      sourceUrl: "https://clawskills.sh/skills/g9pedro-openai-image-cli",
    };
    const outboundSkill = {
      ...maybeSkill,
      id: "image-and-video-generation/ryandeangraves-telegram-media",
      slug: "ryandeangraves-telegram-media",
      name: "telegram-media",
      sourceUrl: "https://clawskills.sh/skills/ryandeangraves-telegram-media",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "image-and-video-generation/eftalyurtseven-eachlabs-face-swap",
      slug: "eftalyurtseven-eachlabs-face-swap",
      name: "eachlabs-face-swap",
      sourceUrl: "https://clawskills.sh/skills/eftalyurtseven-eachlabs-face-swap",
    };
    const financeRejectSkill = {
      ...maybeSkill,
      id: "image-and-video-generation/chaunceyliu-aiusd",
      slug: "chaunceyliu-aiusd",
      name: "aiusd",
      sourceUrl: "https://clawskills.sh/skills/chaunceyliu-aiusd",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "image-and-video-generation/example-unknown-image-skill",
      slug: "example-unknown-image-skill",
      name: "unknown-image-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-image-skill",
    };

    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    for (const skill of [maybeSkill, outboundSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    for (const skill of [rejectSkill, financeRejectSkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
  });

  it("curates Media and Streaming skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "media-and-streaming/aktheknight-audio-transcribe",
      slug: "aktheknight-audio-transcribe",
      name: "audio-transcribe",
      description: "Auto-transcribe voice messages using faster-whisper.",
      categorySlug: "media-and-streaming",
      categoryName: "Media And Streaming",
      sourceUrl: "https://clawskills.sh/skills/aktheknight-audio-transcribe",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# audio-transcribe",
      installNotes: null,
    });

    expect(skill.name).toBe("Local Audio Transcription");
    expect(skill.slug).toBe("local-audio-transcription");
    expect(skill.tags).toContain("speech-to-text");
    expect(skill.tags).toContain("sensitive-personal-data");
    expect(skill.markdown).toContain("Meeting, assistant, CEO");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Media and Streaming curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "media-and-streaming/kjaylee-youtube-pro",
      slug: "kjaylee-youtube-pro",
      name: "youtube-pro",
      description: "Advanced YouTube analysis, transcripts, and metadata extraction.",
      categorySlug: "media-and-streaming",
      categoryName: "Media And Streaming",
      sourceUrl: "https://clawskills.sh/skills/kjaylee-youtube-pro",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# youtube-pro",
      installNotes: null,
    });

    expect(skill.name).toBe("YouTube Research & Transcripts");
    expect(skill.slug).toBe("youtube-research-transcripts");
    expect(marketplaceSkillMatchesQuery(skill, { q: "youtube" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "transcription" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "knowledge-base" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "youtube", category: "media-and-streaming" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "youtube", category: "image-and-video-generation" })).toBe(false);
  });

  it("filters Media and Streaming to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "media-and-streaming.md"),
      [
        "# Media & Streaming",
        "",
        "- [audio-transcribe](https://clawskills.sh/skills/aktheknight-audio-transcribe) - Auto-transcribe voice messages.",
        "- [apify-competitor-intelligence](https://clawskills.sh/skills/protoss70-apify-competitor-intelligence) - Analyze competitor strategies.",
        "- [ffmpeg-master](https://clawskills.sh/skills/liudu2326526-ffmpeg-master) - Perform video/audio processing tasks.",
        "- [mediaproc](https://clawskills.sh/skills/psyb0t-mediaproc) - Process media files in a locked-down container.",
        "- [metricool](https://clawskills.sh/skills/willscott-v2-metricool) - Schedule and manage social media posts.",
        "- [youtube-pro](https://clawskills.sh/skills/kjaylee-youtube-pro) - YouTube analysis and transcripts.",
        "- [voice-to-text](https://clawskills.sh/skills/vae999-voice-to-text) - Convert voice messages to text.",
        "- [social-media-content-calendar](https://clawskills.sh/skills/seanwyngaard-social-media-content-calendar) - Generate social calendars.",
        "- [elevenlabs-cli](https://clawskills.sh/skills/hongkongkiwi-elevenlabs-cli) - ElevenLabs voice tools.",
        "- [flyworks-avatar-video](https://clawskills.sh/skills/linhui99-flyworks-avatar-video) - Generate avatar videos.",
        "- [donotify-voice-call-reminder](https://clawskills.sh/skills/micahele-donotify-voice-call-reminder) - Send voice call reminders.",
        "- [payrail402](https://clawskills.sh/skills/rsquaredsolutions2026-payrail402) - Cross-rail spend tracking.",
        "- [repliz](https://clawskills.sh/skills/staryone-repliz) - Social media management API.",
        "- [alexa-control](https://clawskills.sh/skills/ignito-pg-alexa-control) - Control Alexa devices.",
        "- [nas-movie-download](https://clawskills.sh/skills/roger0808-nas-movie-download) - Download movies.",
        "- [sports-odds](https://clawskills.sh/skills/ianalloway-sports-odds) - Get betting odds.",
        "- [btc15-prediction-market](https://clawskills.sh/skills/kamal-sutra-btc15-prediction-market) - Prediction market.",
        "- [wherecaniwatch](https://clawskills.sh/skills/samthewise2855-wherecaniwatch) - Find streaming availability.",
        "- [unknown-media-skill](https://clawskills.sh/skills/example-unknown-media-skill) - Unreviewed media skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "media-and-streaming", name: "Media And Streaming", slug: "media-and-streaming", skillCount: 8 },
    ]);
  });

  it("marks Media and Streaming gated, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "media-and-streaming/hongkongkiwi-elevenlabs-cli",
      slug: "hongkongkiwi-elevenlabs-cli",
      name: "elevenlabs-cli",
      description: "CLI for ElevenLabs AI audio platform.",
      categorySlug: "media-and-streaming",
      categoryName: "Media And Streaming",
      sourceUrl: "https://clawskills.sh/skills/hongkongkiwi-elevenlabs-cli",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const keepSkill = {
      ...maybeSkill,
      id: "media-and-streaming/aktheknight-audio-transcribe",
      slug: "aktheknight-audio-transcribe",
      name: "audio-transcribe",
      sourceUrl: "https://clawskills.sh/skills/aktheknight-audio-transcribe",
    };
    const outboundSkill = {
      ...maybeSkill,
      id: "media-and-streaming/staryone-repliz",
      slug: "staryone-repliz",
      name: "repliz",
      sourceUrl: "https://clawskills.sh/skills/staryone-repliz",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "media-and-streaming/roger0808-nas-movie-download",
      slug: "roger0808-nas-movie-download",
      name: "nas-movie-download",
      sourceUrl: "https://clawskills.sh/skills/roger0808-nas-movie-download",
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "media-and-streaming/stanlee000-norman-financial-overview",
      slug: "stanlee000-norman-financial-overview",
      name: "norman-financial-overview",
      sourceUrl: "https://clawskills.sh/skills/stanlee000-norman-financial-overview",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "media-and-streaming/example-unknown-media-skill",
      slug: "example-unknown-media-skill",
      name: "unknown-media-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-media-skill",
    };

    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    for (const skill of [maybeSkill, outboundSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    for (const skill of [rejectSkill, duplicateSkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
  });

  it("curates PDF and Documents skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "pdf-and-documents/xejrax-image-ocr",
      slug: "xejrax-image-ocr",
      name: "image-ocr",
      description: "Extract text from images using Tesseract OCR.",
      categorySlug: "pdf-and-documents",
      categoryName: "Pdf And Documents",
      sourceUrl: "https://clawskills.sh/skills/xejrax-image-ocr",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# image-ocr",
      installNotes: null,
    });

    expect(skill.name).toBe("Image OCR");
    expect(skill.slug).toBe("image-ocr");
    expect(skill.tags).toContain("ocr");
    expect(skill.tags).toContain("sensitive-personal-data");
    expect(skill.markdown).toContain("approved document-processing agents");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches PDF and Documents curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "pdf-and-documents/andyxinweiminicloud-permission-creep-scanner",
      slug: "andyxinweiminicloud-permission-creep-scanner",
      name: "permission-creep-scanner",
      description: "Detect permission creep in AI agent skills.",
      categorySlug: "pdf-and-documents",
      categoryName: "Pdf And Documents",
      sourceUrl: "https://clawskills.sh/skills/andyxinweiminicloud-permission-creep-scanner",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# permission-creep-scanner",
      installNotes: null,
    });

    expect(skill.name).toBe("Skill Permission Creep Scanner");
    expect(skill.slug).toBe("skill-permission-creep-scanner");
    expect(marketplaceSkillMatchesQuery(skill, { q: "security" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "marketplace" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "install-safety" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "security", category: "pdf-and-documents" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "security", category: "media-and-streaming" })).toBe(false);
  });

  it("filters PDF and Documents to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "pdf-and-documents.md"),
      [
        "# PDF & Documents",
        "",
        "- [docx](https://clawskills.sh/skills/seanphan-docx) - Comprehensive document creation and editing.",
        "- [image-ocr](https://clawskills.sh/skills/xejrax-image-ocr) - Extract text from images.",
        "- [markdown-converter](https://clawskills.sh/skills/steipete-markdown-converter) - Convert documents to Markdown.",
        "- [mermaid](https://clawskills.sh/skills/jarekbird-mermaid) - Generate diagrams from text.",
        "- [json-toolkit](https://clawskills.sh/skills/claudiodrusus-json-toolkit) - Swiss-army knife for JSON.",
        "- [permission-creep-scanner](https://clawskills.sh/skills/andyxinweiminicloud-permission-creep-scanner) - Detect skill permission creep.",
        "- [scan-skill](https://clawskills.sh/skills/itsnishi-scan-skill) - Deep security analysis of a skill.",
        "- [qr-generator](https://clawskills.sh/skills/autogame-17-qr-generator) - Generate QR codes.",
        "- [convert-to-pdf](https://clawskills.sh/skills/crossservicesolutions-convert-to-pdf) - Convert documents to PDF.",
        "- [google-docs-skill](https://clawskills.sh/skills/zagran-google-docs-skill) - Google Docs API access.",
        "- [contract-generator](https://clawskills.sh/skills/seanwyngaard-contract-generator) - Generate contracts.",
        "- [paddleocr-doc-parsing](https://clawskills.sh/skills/bobholamovic-paddleocr-doc-parsing) - Parse documents with PaddleOCR.",
        "- [bluente-translate](https://github.com/openclaw/skills/blob/main/skills/varsmallrookie/bluente-translate/SKILL.md) - Translate documents.",
        "- [rapay](https://clawskills.sh/skills/greendlt224-rapay) - Send fiat payments.",
        "- [open-stellar](https://clawskills.sh/skills/sixela33-open-stellar) - Stellar blockchain.",
        "- [appraisal-ai](https://clawskills.sh/skills/chadru-appraisal-ai) - Draft appraisal reports.",
        "- [plentyofbots](https://clawskills.sh/skills/rwfresh-plentyofbots) - Dating platform.",
        "- [skill-3](https://clawskills.sh/skills/claudiodrusus-skill-3) - JSON toolkit duplicate.",
        "- [unknown-pdf-skill](https://clawskills.sh/skills/example-unknown-pdf-skill) - Unreviewed PDF skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "pdf-and-documents", name: "Pdf And Documents", slug: "pdf-and-documents", skillCount: 8 },
    ]);
  });

  it("marks PDF and Documents gated, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "pdf-and-documents/crossservicesolutions-convert-to-pdf",
      slug: "crossservicesolutions-convert-to-pdf",
      name: "convert-to-pdf",
      description: "Convert one or multiple documents to PDF.",
      categorySlug: "pdf-and-documents",
      categoryName: "Pdf And Documents",
      sourceUrl: "https://clawskills.sh/skills/crossservicesolutions-convert-to-pdf",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const keepSkill = {
      ...maybeSkill,
      id: "pdf-and-documents/seanphan-docx",
      slug: "seanphan-docx",
      name: "docx",
      sourceUrl: "https://clawskills.sh/skills/seanphan-docx",
    };
    const workspaceSkill = {
      ...maybeSkill,
      id: "pdf-and-documents/zagran-google-docs-skill",
      slug: "zagran-google-docs-skill",
      name: "google-docs-skill",
      sourceUrl: "https://clawskills.sh/skills/zagran-google-docs-skill",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "pdf-and-documents/greendlt224-rapay",
      slug: "greendlt224-rapay",
      name: "rapay",
      sourceUrl: "https://clawskills.sh/skills/greendlt224-rapay",
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "pdf-and-documents/claudiodrusus-skill-3",
      slug: "claudiodrusus-skill-3",
      name: "skill-3",
      sourceUrl: "https://clawskills.sh/skills/claudiodrusus-skill-3",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "pdf-and-documents/example-unknown-pdf-skill",
      slug: "example-unknown-pdf-skill",
      name: "unknown-pdf-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-pdf-skill",
    };

    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    for (const skill of [maybeSkill, workspaceSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    for (const skill of [rejectSkill, duplicateSkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
  });

  it("curates Personal Development skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "personal-development/lilei0311-agent-evolver",
      slug: "lilei0311-agent-evolver",
      name: "agent-evolver",
      description: "Improve agents through iterative evolution loops.",
      categorySlug: "personal-development",
      categoryName: "Personal Development",
      sourceUrl: "https://clawskills.sh/skills/lilei0311-agent-evolver",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# agent-evolver",
      installNotes: null,
    });

    expect(skill.name).toBe("Agent Evolution Engine");
    expect(skill.slug).toBe("agent-evolution-engine");
    expect(skill.tags).toContain("agent-development");
    expect(skill.tags).toContain("requires-human-confirmation");
    expect(skill.markdown).toContain("long-running agent-operations teams");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Personal Development curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "personal-development/emasoudy-graphiti",
      slug: "emasoudy-graphiti",
      name: "graphiti",
      description: "Knowledge graph memory for agents.",
      categorySlug: "personal-development",
      categoryName: "Personal Development",
      sourceUrl: "https://clawskills.sh/skills/emasoudy-graphiti",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# graphiti",
      installNotes: null,
    });

    expect(skill.name).toBe("Knowledge Graph Memory");
    expect(skill.slug).toBe("knowledge-graph-memory");
    expect(marketplaceSkillMatchesQuery(skill, { q: "knowledge-graph" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "memory-safety" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "company-scoped", category: "personal-development" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "company-scoped", category: "pdf-and-documents" })).toBe(false);
  });

  it("filters Personal Development to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "personal-development.md"),
      [
        "# Personal Development",
        "",
        "- [adaptive-learning-agents](https://clawskills.sh/skills/vedantsingh60-adaptive-learning-agents) - Adaptive learning for agents.",
        "- [agent-evolver](https://clawskills.sh/skills/lilei0311-agent-evolver) - Agent improvement loops.",
        "- [agent-reflect](https://clawskills.sh/skills/stevengonsalvez-agent-reflect) - Reflect on completed work.",
        "- [daily-review-ritual](https://clawskills.sh/skills/itsflow-daily-review-ritual) - Daily work review ritual.",
        "- [graphiti](https://clawskills.sh/skills/emasoudy-graphiti) - Knowledge graph memory.",
        "- [docstrange](https://clawskills.sh/skills/shhdwi-docstrange) - Extract document data.",
        "- [expanso-cve-scan](https://clawskills.sh/skills/aronchick-expanso-cve-scan) - CVE scanner.",
        "- [learn-cog](https://clawskills.sh/skills/nitishgargiitd-learn-cog) - Learning cognition workflows.",
        "- [founder-coach](https://clawskills.sh/skills/goforu-founder-coach) - Founder coaching.",
        "- [mindfulness-meditation](https://clawskills.sh/skills/jhillin8-mindfulness-meditation) - Mindfulness exercises.",
        "- [pine-voice](https://clawskills.sh/skills/bojieli-pine-voice) - Give your agent a real phone.",
        "- [post-job](https://clawskills.sh/skills/zhangdong-post-job) - Post jobs to job boards.",
        "- [zenplus-health](https://clawskills.sh/skills/ollieparsley-zenplus-health) - Workplace wellness.",
        "- [ai-persona-os](https://clawskills.sh/skills/jeffjhunter-ai-persona-os) - Persona management.",
        "- [anxiety-relief](https://clawskills.sh/skills/jhillin8-anxiety-relief) - Anxiety relief.",
        "- [ezbookkeeping](https://clawskills.sh/skills/mayswind-ezbookkeeping) - Personal finance.",
        "- [joko-jobhunter](https://clawskills.sh/skills/oyi77-joko-jobhunter) - Job hunting.",
        "- [memepickup-wingman](https://clawskills.sh/skills/samcraw1-memepickup-wingman) - Dating wingman.",
        "- [shelter](https://clawskills.sh/skills/code-with-brian-shelter) - Personal financial data.",
        "- [unknown-personal-skill](https://clawskills.sh/skills/example-unknown-personal-skill) - Unreviewed personal skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "personal-development", name: "Personal Development", slug: "personal-development", skillCount: 8 },
    ]);
  });

  it("marks Personal Development gated, reject, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "personal-development/goforu-founder-coach",
      slug: "goforu-founder-coach",
      name: "founder-coach",
      description: "Founder coaching.",
      categorySlug: "personal-development",
      categoryName: "Personal Development",
      sourceUrl: "https://clawskills.sh/skills/goforu-founder-coach",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const wellnessSkill = {
      ...maybeSkill,
      id: "personal-development/jhillin8-mindfulness-meditation",
      slug: "jhillin8-mindfulness-meditation",
      name: "mindfulness-meditation",
      sourceUrl: "https://clawskills.sh/skills/jhillin8-mindfulness-meditation",
    };
    const voiceSkill = {
      ...maybeSkill,
      id: "personal-development/bojieli-pine-voice",
      slug: "bojieli-pine-voice",
      name: "pine-voice",
      sourceUrl: "https://clawskills.sh/skills/bojieli-pine-voice",
    };
    const keepSkill = {
      ...maybeSkill,
      id: "personal-development/stevengonsalvez-agent-reflect",
      slug: "stevengonsalvez-agent-reflect",
      name: "agent-reflect",
      sourceUrl: "https://clawskills.sh/skills/stevengonsalvez-agent-reflect",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "personal-development/jhillin8-anxiety-relief",
      slug: "jhillin8-anxiety-relief",
      name: "anxiety-relief",
      sourceUrl: "https://clawskills.sh/skills/jhillin8-anxiety-relief",
    };
    const financeSkill = {
      ...maybeSkill,
      id: "personal-development/mayswind-ezbookkeeping",
      slug: "mayswind-ezbookkeeping",
      name: "ezbookkeeping",
      sourceUrl: "https://clawskills.sh/skills/mayswind-ezbookkeeping",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "personal-development/example-unknown-personal-skill",
      slug: "example-unknown-personal-skill",
      name: "unknown-personal-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-personal-skill",
    };

    for (const skill of [maybeSkill, wellnessSkill, voiceSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    for (const skill of [rejectSkill, financeSkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
  });

  it("curates Search and Research skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "search-and-research/zjianru-web-search-pro",
      slug: "zjianru-web-search-pro",
      name: "web-search-pro",
      description: "Agent-first web search and retrieval stack.",
      categorySlug: "search-and-research",
      categoryName: "Search And Research",
      sourceUrl: "https://clawskills.sh/skills/zjianru-web-search-pro",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# web-search-pro",
      installNotes: null,
    });

    expect(skill.name).toBe("Web Search Pro");
    expect(skill.slug).toBe("web-search-pro");
    expect(skill.tags).toContain("web-search");
    expect(skill.tags).toContain("deep-research");
    expect(skill.markdown).toContain("board-reporting agents");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Search and Research curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "search-and-research/aaron-he-zhu-serp-analysis",
      slug: "aaron-he-zhu-serp-analysis",
      name: "serp-analysis",
      description: "Analyze search results.",
      categorySlug: "search-and-research",
      categoryName: "Search And Research",
      sourceUrl: "https://clawskills.sh/skills/aaron-he-zhu-serp-analysis",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# serp-analysis",
      installNotes: null,
    });

    expect(skill.name).toBe("SERP Analysis");
    expect(skill.slug).toBe("serp-analysis");
    expect(marketplaceSkillMatchesQuery(skill, { q: "competitive-intel" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "serp", category: "search-and-research" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "serp", category: "personal-development" })).toBe(false);
  });

  it("filters Search and Research to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "search-and-research.md"),
      [
        "# Search & Research",
        "",
        "- [web-search-pro](https://clawskills.sh/skills/zjianru-web-search-pro) - Agent-first web search stack.",
        "- [hybrid-deep-search](https://clawskills.sh/skills/scsun1978-hybrid-deep-search) - Hybrid deep search.",
        "- [paperzilla](https://clawskills.sh/skills/pors-paperzilla) - Browse high-signal academic papers.",
        "- [local-file-rag-basic](https://clawskills.sh/skills/wjreliable-local-file-rag-basic) - Local file RAG.",
        "- [competitor-analysis-report](https://clawskills.sh/skills/seanwyngaard-competitor-analysis-report) - Competitive analysis.",
        "- [serp-analysis](https://clawskills.sh/skills/aaron-he-zhu-serp-analysis) - Analyze search results.",
        "- [skywork-search](https://github.com/openclaw/skills/blob/main/skills/gxcun17/skywork-search/SKILL.md) - Real-time web search.",
        "- [social-intelligence](https://clawskills.sh/skills/atyachin-social-intelligence) - Social media research.",
        "- [ads-manager-agent](https://clawskills.sh/skills/amekala-ads-manager-agent) - Paid ads automation.",
        "- [twitterapi-io](https://clawskills.sh/skills/dorukardahan-twitterapi-io) - Post and search Twitter.",
        "- [duffel](https://clawskills.sh/skills/fabiolr-duffel) - Search and book flights.",
        "- [lead-researcher](https://clawskills.sh/skills/rjrileybuisness-ai-lead-researcher) - B2B enrichment.",
        "- [medical-clinicaltrials](https://clawskills.sh/skills/pascalwhoop-medical-clinicaltrials) - Clinical trials search.",
        "- [yandex-tracker](https://clawskills.sh/skills/kandler3-yandex-tracker) - Issue tracker operations.",
        "- [aluvia-web-proxy](https://clawskills.sh/skills/aluvia-connectivity-aluvia-web-proxy) - Bypass captchas.",
        "- [didit-face-search](https://clawskills.sh/skills/rosasalberto-didit-face-search) - Facial search.",
        "- [reef-polymarket-research](https://clawskills.sh/skills/rimelucci-reef-polymarket-research) - Polymarket trading.",
        "- [rps12345](https://clawskills.sh/skills/yoavrez-rps12345) - Rock paper scissors.",
        "- [unknown-search-skill](https://clawskills.sh/skills/example-unknown-search-skill) - Unreviewed search skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "search-and-research", name: "Search And Research", slug: "search-and-research", skillCount: 8 },
    ]);
  });

  it("marks Search and Research gated, reject, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "search-and-research/amekala-ads-manager-agent",
      slug: "amekala-ads-manager-agent",
      name: "ads-manager-agent",
      description: "Paid ads automation.",
      categorySlug: "search-and-research",
      categoryName: "Search And Research",
      sourceUrl: "https://clawskills.sh/skills/amekala-ads-manager-agent",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const socialMutationSkill = {
      ...maybeSkill,
      id: "search-and-research/dorukardahan-twitterapi-io",
      slug: "dorukardahan-twitterapi-io",
      name: "twitterapi-io",
      sourceUrl: "https://clawskills.sh/skills/dorukardahan-twitterapi-io",
    };
    const travelBookingSkill = {
      ...maybeSkill,
      id: "search-and-research/fabiolr-duffel",
      slug: "fabiolr-duffel",
      name: "duffel",
      sourceUrl: "https://clawskills.sh/skills/fabiolr-duffel",
    };
    const keepSkill = {
      ...maybeSkill,
      id: "search-and-research/scsun1978-hybrid-deep-search",
      slug: "scsun1978-hybrid-deep-search",
      name: "hybrid-deep-search",
      sourceUrl: "https://clawskills.sh/skills/scsun1978-hybrid-deep-search",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "search-and-research/aluvia-connectivity-aluvia-web-proxy",
      slug: "aluvia-connectivity-aluvia-web-proxy",
      name: "aluvia-web-proxy",
      sourceUrl: "https://clawskills.sh/skills/aluvia-connectivity-aluvia-web-proxy",
    };
    const biometricSkill = {
      ...maybeSkill,
      id: "search-and-research/rosasalberto-didit-face-search",
      slug: "rosasalberto-didit-face-search",
      name: "didit-face-search",
      sourceUrl: "https://clawskills.sh/skills/rosasalberto-didit-face-search",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "search-and-research/example-unknown-search-skill",
      slug: "example-unknown-search-skill",
      name: "unknown-search-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-search-skill",
    };

    for (const skill of [maybeSkill, socialMutationSkill, travelBookingSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    for (const skill of [rejectSkill, biometricSkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
  });

  it("curates Self-Hosted and Automation skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "self-hosted-and-automation/zfanmy-cron-backup",
      slug: "zfanmy-cron-backup",
      name: "cron-backup",
      description: "Set up scheduled automated backups with version tracking and cleanup.",
      categorySlug: "self-hosted-and-automation",
      categoryName: "Self Hosted And Automation",
      sourceUrl: "https://clawskills.sh/skills/zfanmy-cron-backup",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# cron-backup",
      installNotes: null,
    });

    expect(skill.name).toBe("Scheduled Backup Manager");
    expect(skill.slug).toBe("scheduled-backup-manager");
    expect(skill.tags).toContain("backup");
    expect(skill.tags).toContain("host-mutation");
    expect(skill.markdown).toContain("approved workflow automation agents");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Self-Hosted and Automation curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "self-hosted-and-automation/felipeoff-sonarqube-analyzer",
      slug: "felipeoff-sonarqube-analyzer",
      name: "sonarqube-analyzer",
      description: "Analyze self-hosted SonarQube projects.",
      categorySlug: "self-hosted-and-automation",
      categoryName: "Self Hosted And Automation",
      sourceUrl: "https://clawskills.sh/skills/felipeoff-sonarqube-analyzer",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# sonarqube-analyzer",
      installNotes: null,
    });

    expect(skill.name).toBe("SonarQube Issue Analyzer");
    expect(skill.slug).toBe("sonarqube-issue-analyzer");
    expect(marketplaceSkillMatchesQuery(skill, { q: "code-quality" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "self-hosted", category: "self-hosted-and-automation" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "self-hosted", category: "search-and-research" })).toBe(false);
  });

  it("filters Self-Hosted and Automation to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "self-hosted-and-automation.md"),
      [
        "# Self-Hosted & Automation",
        "",
        "- [bridle](https://clawskills.sh/skills/bjesuiter-bridle) - Unified configuration manager.",
        "- [claw-sync](https://clawskills.sh/skills/arakichanxd-claw-sync) - Secure sync for memory and workspace.",
        "- [cron-backup](https://clawskills.sh/skills/zfanmy-cron-backup) - Scheduled backups.",
        "- [freshrss-reader](https://clawskills.sh/skills/nickian-freshrss-reader) - Self-hosted RSS reader.",
        "- [gotify](https://clawskills.sh/skills/jmagar-gotify) - Push notifications.",
        "- [n8n-workflow-automation](https://clawskills.sh/skills/kowl64-n8n-workflow-automation) - Design n8n workflow JSON.",
        "- [paperless](https://clawskills.sh/skills/nickchristensen-paperless) - Paperless-NGX document management.",
        "- [sonarqube-analyzer](https://clawskills.sh/skills/felipeoff-sonarqube-analyzer) - SonarQube issue analysis.",
        "- [n8n](https://clawskills.sh/skills/thomasansems-n8n) - Manage n8n workflows.",
        "- [mongodb-atlas-admin](https://clawskills.sh/skills/mrlynn-mongodb-atlas-admin) - Manage MongoDB Atlas.",
        "- [unifi](https://clawskills.sh/skills/jmagar-unifi) - Query UniFi gateway.",
        "- [pinme](https://clawskills.sh/skills/ntlx-pinme) - Deploy static sites to IPFS.",
        "- [beacon](https://clawskills.sh/skills/scottcjn-beacon) - Social coordination and crypto payments.",
        "- [lifepath](https://clawskills.sh/skills/ezbreadsniper-lifepath) - AI life simulator.",
        "- [paperless-ngx](https://clawskills.sh/skills/oskarstark-paperless-ngx) - Duplicate Paperless skill.",
        "- [venice-characters](https://clawskills.sh/skills/sabrinaaquino-venice-characters) - Character personas.",
        "- [unknown-self-hosted-skill](https://clawskills.sh/skills/example-unknown-self-hosted-skill) - Unreviewed self-hosted skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "self-hosted-and-automation", name: "Self Hosted And Automation", slug: "self-hosted-and-automation", skillCount: 8 },
    ]);
  });

  it("marks Self-Hosted and Automation gated, reject, duplicate, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "self-hosted-and-automation/thomasansems-n8n",
      slug: "thomasansems-n8n",
      name: "n8n",
      description: "Manage n8n workflows and automations.",
      categorySlug: "self-hosted-and-automation",
      categoryName: "Self Hosted And Automation",
      sourceUrl: "https://clawskills.sh/skills/thomasansems-n8n",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const databaseAdminSkill = {
      ...maybeSkill,
      id: "self-hosted-and-automation/mrlynn-mongodb-atlas-admin",
      slug: "mrlynn-mongodb-atlas-admin",
      name: "mongodb-atlas-admin",
      sourceUrl: "https://clawskills.sh/skills/mrlynn-mongodb-atlas-admin",
    };
    const networkSkill = {
      ...maybeSkill,
      id: "self-hosted-and-automation/jmagar-unifi",
      slug: "jmagar-unifi",
      name: "unifi",
      sourceUrl: "https://clawskills.sh/skills/jmagar-unifi",
    };
    const keepSkill = {
      ...maybeSkill,
      id: "self-hosted-and-automation/jmagar-gotify",
      slug: "jmagar-gotify",
      name: "gotify",
      sourceUrl: "https://clawskills.sh/skills/jmagar-gotify",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "self-hosted-and-automation/scottcjn-beacon",
      slug: "scottcjn-beacon",
      name: "beacon",
      sourceUrl: "https://clawskills.sh/skills/scottcjn-beacon",
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "self-hosted-and-automation/oskarstark-paperless-ngx",
      slug: "oskarstark-paperless-ngx",
      name: "paperless-ngx",
      sourceUrl: "https://clawskills.sh/skills/oskarstark-paperless-ngx",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "self-hosted-and-automation/example-unknown-self-hosted-skill",
      slug: "example-unknown-self-hosted-skill",
      name: "unknown-self-hosted-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-self-hosted-skill",
    };

    for (const skill of [maybeSkill, databaseAdminSkill, networkSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    for (const skill of [rejectSkill, duplicateSkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
  });

  it("curates Speech and Transcription skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "speech-and-transcription/neal-collab-auto-whisper-safe",
      slug: "neal-collab-auto-whisper-safe",
      name: "auto-whisper-safe",
      description: "Transcribe audio with Whisper in RAM-safe chunks.",
      categorySlug: "speech-and-transcription",
      categoryName: "Speech And Transcription",
      sourceUrl: "https://clawskills.sh/skills/neal-collab-auto-whisper-safe",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# auto-whisper-safe",
      installNotes: null,
    });

    expect(skill.name).toBe("RAM-Safe Whisper Transcription");
    expect(skill.slug).toBe("ram-safe-whisper-transcription");
    expect(skill.tags).toContain("speech-to-text");
    expect(skill.tags).toContain("local-ai");
    expect(skill.markdown).toContain("knowledge-base agents");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Speech and Transcription curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "speech-and-transcription/edkief-kokoro-tts",
      slug: "edkief-kokoro-tts",
      name: "kokoro-tts",
      description: "Generate speech from text using Kokoro TTS.",
      categorySlug: "speech-and-transcription",
      categoryName: "Speech And Transcription",
      sourceUrl: "https://clawskills.sh/skills/edkief-kokoro-tts",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# kokoro-tts",
      installNotes: null,
    });

    expect(skill.name).toBe("Local Kokoro TTS");
    expect(skill.slug).toBe("local-kokoro-tts");
    expect(marketplaceSkillMatchesQuery(skill, { q: "text-to-speech" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "local-ai", category: "speech-and-transcription" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "local-ai", category: "self-hosted-and-automation" })).toBe(false);
  });

  it("filters Speech and Transcription to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "speech-and-transcription.md"),
      [
        "# Speech & Transcription",
        "",
        "- [auto-whisper-safe](https://clawskills.sh/skills/neal-collab-auto-whisper-safe) - RAM-safe Whisper transcription.",
        "- [faster-whisper](https://clawskills.sh/skills/theplasmak-faster-whisper) - Local faster-whisper transcription.",
        "- [elevenlabs-transcribe](https://clawskills.sh/skills/paulasjes-elevenlabs-transcribe) - ElevenLabs transcription.",
        "- [kokoro-tts](https://clawskills.sh/skills/edkief-kokoro-tts) - Local text-to-speech.",
        "- [assemblyai-transcribe](https://clawskills.sh/skills/tristanmanchester-assemblyai-transcribe) - AssemblyAI transcription.",
        "- [deepgram](https://clawskills.sh/skills/nerkn-deepgram) - Deepgram speech-to-text.",
        "- [audio-reply](https://clawskills.sh/skills/matrixy-audio-reply-skill) - Spoken replies.",
        "- [siliconflow-tts-gen](https://clawskills.sh/skills/lilei0311-siliconflow-tts-gen) - SiliconFlow TTS.",
        "- [announcer](https://clawskills.sh/skills/odrobnik-announcer) - Announce text.",
        "- [eachlabs-voice-audio](https://clawskills.sh/skills/eftalyurtseven-eachlabs-voice-audio) - Voice and audio tools.",
        "- [elevenlabs-agents](https://clawskills.sh/skills/pennyroyaltea-elevenlabs-agents) - Voice agents.",
        "- [feishu-minutes](https://clawskills.sh/skills/autogame-17-feishu-minutes) - Meeting minutes.",
        "- [clonev](https://clawskills.sh/skills/instant-picture-clonev) - Voice cloning.",
        "- [alexa-cli](https://clawskills.sh/skills/buddyh-alexa-cli) - Alexa CLI.",
        "- [lnbits](https://clawskills.sh/skills/talvasconcelos-lnbits) - Lightning wallet.",
        "- [eternal-haven-lore-pack](https://clawskills.sh/skills/deepseekoracle-eternal-haven-lore-pack) - Fiction lore pack.",
        "- [unknown-speech-skill](https://clawskills.sh/skills/example-unknown-speech-skill) - Unreviewed speech skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "speech-and-transcription", name: "Speech And Transcription", slug: "speech-and-transcription", skillCount: 8 },
    ]);
  });

  it("marks Speech and Transcription gated, reject, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "speech-and-transcription/odrobnik-announcer",
      slug: "odrobnik-announcer",
      name: "announcer",
      description: "Announce text aloud.",
      categorySlug: "speech-and-transcription",
      categoryName: "Speech And Transcription",
      sourceUrl: "https://clawskills.sh/skills/odrobnik-announcer",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const voiceConversionSkill = {
      ...maybeSkill,
      id: "speech-and-transcription/eftalyurtseven-eachlabs-voice-audio",
      slug: "eftalyurtseven-eachlabs-voice-audio",
      name: "eachlabs-voice-audio",
      sourceUrl: "https://clawskills.sh/skills/eftalyurtseven-eachlabs-voice-audio",
    };
    const meetingPlatformSkill = {
      ...maybeSkill,
      id: "speech-and-transcription/autogame-17-feishu-minutes",
      slug: "autogame-17-feishu-minutes",
      name: "feishu-minutes",
      sourceUrl: "https://clawskills.sh/skills/autogame-17-feishu-minutes",
    };
    const keepSkill = {
      ...maybeSkill,
      id: "speech-and-transcription/theplasmak-faster-whisper",
      slug: "theplasmak-faster-whisper",
      name: "faster-whisper",
      sourceUrl: "https://clawskills.sh/skills/theplasmak-faster-whisper",
    };
    const rejectSkill = {
      ...maybeSkill,
      id: "speech-and-transcription/instant-picture-clonev",
      slug: "instant-picture-clonev",
      name: "clonev",
      sourceUrl: "https://clawskills.sh/skills/instant-picture-clonev",
    };
    const walletSkill = {
      ...maybeSkill,
      id: "speech-and-transcription/talvasconcelos-lnbits",
      slug: "talvasconcelos-lnbits",
      name: "lnbits",
      sourceUrl: "https://clawskills.sh/skills/talvasconcelos-lnbits",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "speech-and-transcription/example-unknown-speech-skill",
      slug: "example-unknown-speech-skill",
      name: "unknown-speech-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-speech-skill",
    };

    for (const skill of [maybeSkill, voiceConversionSkill, meetingPlatformSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    for (const skill of [rejectSkill, walletSkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
  });

  it("curates Transportation skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "transportation/james-southendsolutions-camino-route",
      slug: "james-southendsolutions-camino-route",
      name: "camino-route",
      description: "Get detailed routing between two points with distance, duration, and optional directions.",
      categorySlug: "transportation",
      categoryName: "Transportation",
      sourceUrl: "https://clawskills.sh/skills/james-southendsolutions-camino-route",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# camino-route",
      installNotes: null,
    });

    expect(skill.name).toBe("Point-to-Point Route Planner");
    expect(skill.slug).toBe("point-to-point-route-planner");
    expect(skill.tags).toContain("transportation");
    expect(skill.tags).toContain("route-planning");
    expect(skill.markdown).toContain("travel coordination");
    expect(skill.markdown).toContain("board approval");
  });

  it("matches Transportation curated search terms from tags and markdown", () => {
    const skill = curateMarketplaceSkill({
      id: "transportation/brianleach-tfl",
      slug: "brianleach-tfl",
      name: "tfl",
      description: "London TfL transit arrivals and disruptions.",
      categorySlug: "transportation",
      categoryName: "Transportation",
      sourceUrl: "https://clawskills.sh/skills/brianleach-tfl",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# tfl",
      installNotes: null,
    });

    expect(skill.name).toBe("London Transit Status");
    expect(skill.slug).toBe("london-transit-status");
    expect(marketplaceSkillMatchesQuery(skill, { q: "service-alerts" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "london", category: "transportation" })).toBe(true);
    expect(marketplaceSkillMatchesQuery(skill, { q: "london", category: "speech-and-transcription" })).toBe(false);
  });

  it("filters Transportation to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "transportation.md"),
      [
        "# Transportation",
        "",
        "- [airfrance-afkl](https://clawskills.sh/skills/iclems-airfrance-afkl) - Track Air France flights.",
        "- [amadeus-flights](https://clawskills.sh/skills/kirorab-amadeus-flights) - Flight offers and prices.",
        "- [anachb](https://clawskills.sh/skills/manmal-a-nach-b) - Austrian public transport.",
        "- [camino-route](https://clawskills.sh/skills/james-southendsolutions-camino-route) - Route planning.",
        "- [camino-safety-checker](https://clawskills.sh/skills/james-southendsolutions-camino-safety-checker) - Nearby safety locations.",
        "- [capmetro-skill](https://clawskills.sh/skills/brianleach-capmetro-skill) - Austin transit status.",
        "- [cta](https://clawhub.ai/brianleach/cta) - Chicago CTA status.",
        "- [tfl](https://clawskills.sh/skills/brianleach-tfl) - London TfL status.",
        "- [translink-cli](https://clawskills.sh/skills/alanburchill-translink-cli) - Translink GTFS data.",
        "- [travel-agent](https://clawskills.sh/skills/aszelem-travel-agent) - Human-approved flight booking.",
        "- [google-maps-search-api](https://clawskills.sh/skills/phheng-google-maps-search-api) - Vague maps search.",
        "- [hudy](https://clawskills.sh/skills/kyu1204-hudy) - Business day calculations.",
        "- [idfm-journey-skill](https://clawskills.sh/skills/anthonymq-idfm-journey-skill) - Duplicate IDFM planner.",
        "- [kallyai](https://clawskills.sh/skills/sltelitsyn-kallyai) - Phone calls.",
        "- [fsd-secure-skill](https://clawskills.sh/skills/aadipapp-fsd-secure-skill) - Full self-driving agent.",
        "- [creditcard](https://clawskills.sh/skills/jononovo-creditcard) - Payment card wallet.",
        "- [proxybase-openclaw-skill](https://clawskills.sh/skills/proxybase-user-proxybase-openclaw-skill) - Proxy provisioning.",
        "- [unknown-transportation-skill](https://clawskills.sh/skills/example-unknown-transportation-skill) - Unreviewed transportation skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "transportation", name: "Transportation", slug: "transportation", skillCount: 10 },
    ]);
  });

  it("marks Transportation gated, reject, unsafe, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "transportation/phheng-google-maps-search-api",
      slug: "phheng-google-maps-search-api",
      name: "google-maps-search-api",
      description: "Vague maps search.",
      categorySlug: "transportation",
      categoryName: "Transportation",
      sourceUrl: "https://clawskills.sh/skills/phheng-google-maps-search-api",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const duplicateSkill = {
      ...maybeSkill,
      id: "transportation/anthonymq-idfm-journey-skill",
      slug: "anthonymq-idfm-journey-skill",
      name: "idfm-journey-skill",
      sourceUrl: "https://clawskills.sh/skills/anthonymq-idfm-journey-skill",
    };
    const callSkill = {
      ...maybeSkill,
      id: "transportation/sltelitsyn-kallyai",
      slug: "sltelitsyn-kallyai",
      name: "kallyai",
      sourceUrl: "https://clawskills.sh/skills/sltelitsyn-kallyai",
    };
    const keepSkill = {
      ...maybeSkill,
      id: "transportation/alanburchill-translink-cli",
      slug: "alanburchill-translink-cli",
      name: "translink-cli",
      sourceUrl: "https://clawskills.sh/skills/alanburchill-translink-cli",
    };
    const unsafeSkill = {
      ...maybeSkill,
      id: "transportation/aadipapp-fsd-secure-skill",
      slug: "aadipapp-fsd-secure-skill",
      name: "fsd-secure-skill",
      sourceUrl: "https://clawskills.sh/skills/aadipapp-fsd-secure-skill",
    };
    const paymentSkill = {
      ...maybeSkill,
      id: "transportation/jononovo-creditcard",
      slug: "jononovo-creditcard",
      name: "creditcard",
      sourceUrl: "https://clawskills.sh/skills/jononovo-creditcard",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "transportation/example-unknown-transportation-skill",
      slug: "example-unknown-transportation-skill",
      name: "unknown-transportation-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-transportation-skill",
    };

    for (const skill of [maybeSkill, duplicateSkill, callSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    for (const skill of [unsafeSkill, paymentSkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
  });

  it("curates Clawdbot Tools skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "clawdbot-tools/matrixy-agent-browser-clawdbot",
      slug: "matrixy-agent-browser-clawdbot",
      name: "agent-browser",
      description: "Headless browser automation CLI optimized for AI agents.",
      categorySlug: "clawdbot-tools",
      categoryName: "Clawdbot Tools",
      sourceUrl: "https://clawskills.sh/skills/matrixy-agent-browser-clawdbot",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# agent-browser",
      installNotes: null,
    });

    expect(skill.name).toBe("Agent Browser Automation");
    expect(skill.slug).toBe("agent-browser-automation");
    expect(skill.tags).toContain("clawdbot-tools");
    expect(skill.tags).toContain("browser-automation");
    expect(skill.markdown).toContain("company agent operations");
    expect(skill.markdown).toContain("board approval");
  });

  it("filters Clawdbot Tools to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "clawdbot-tools.md"),
      [
        "# Clawdbot Tools",
        "",
        "- [agent-browser](https://clawskills.sh/skills/matrixy-agent-browser-clawdbot) - Browser automation.",
        "- [agent-builder](https://clawskills.sh/skills/plgonzalezrx8-agent-builder) - Build agents.",
        "- [agents-manager](https://clawskills.sh/skills/agentandbot-design-agents-manager) - Manage agents.",
        "- [clauditor](https://clawskills.sh/skills/apollostreetcompany-clauditor) - Audit watchdog.",
        "- [mcp-client](https://clawskills.sh/skills/nantes-mcp-client) - MCP client.",
        "- [zapier-mcp](https://clawskills.sh/skills/maverick-software-zapier-mcp) - Zapier MCP.",
        "- [clawd-presence](https://clawskills.sh/skills/voidcooks-clawd-presence) - Presence display.",
        "- [telegram-footer-patch](https://clawskills.sh/skills/c-joey-telegram-footer-patch) - Telegram footer.",
        "- [captchas-openclaw](https://clawskills.sh/skills/captchasco-captchas-openclaw) - CAPTCHA solving.",
        "- [claw-face](https://clawskills.sh/skills/mkoslacz-claw-face) - Avatar widget.",
        "- [unknown-clawdbot-skill](https://clawskills.sh/skills/example-unknown-clawdbot-skill) - Unreviewed.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "clawdbot-tools", name: "Clawdbot Tools", slug: "clawdbot-tools", skillCount: 6 },
    ]);
  });

  it("marks Clawdbot Tools maybe, reject, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "clawdbot-tools/voidcooks-clawd-presence",
      slug: "voidcooks-clawd-presence",
      name: "clawd-presence",
      description: "Physical presence display for AI agents.",
      categorySlug: "clawdbot-tools",
      categoryName: "Clawdbot Tools",
      sourceUrl: "https://clawskills.sh/skills/voidcooks-clawd-presence",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const keepSkill = {
      ...maybeSkill,
      id: "clawdbot-tools/nantes-mcp-client",
      slug: "nantes-mcp-client",
      name: "mcp-client",
      sourceUrl: "https://clawskills.sh/skills/nantes-mcp-client",
    };
    const captchaSkill = {
      ...maybeSkill,
      id: "clawdbot-tools/captchasco-captchas-openclaw",
      slug: "captchasco-captchas-openclaw",
      name: "captchas-openclaw",
      sourceUrl: "https://clawskills.sh/skills/captchasco-captchas-openclaw",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "clawdbot-tools/example-unknown-clawdbot-skill",
      slug: "example-unknown-clawdbot-skill",
      name: "unknown-clawdbot-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-clawdbot-skill",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    for (const skill of [captchaSkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
  });

  it("curates Moltbook skills for PaperClaw previews", () => {
    const skill = curateMarketplaceSkill({
      id: "moltbook/orosha-ai-agent-relay-digest",
      slug: "orosha-ai-agent-relay-digest",
      name: "agent-relay-digest",
      description: "Create curated digests of agent conversations.",
      categorySlug: "moltbook",
      categoryName: "Moltbook",
      sourceUrl: "https://clawskills.sh/skills/orosha-ai-agent-relay-digest",
      installSource: null,
      trustLevel: "unknown",
      tags: [],
      installedSkillId: null,
      markdown: "# agent-relay-digest",
      installNotes: null,
    });

    expect(skill.name).toBe("Agent Conversation Digest");
    expect(skill.slug).toBe("agent-conversation-digest");
    expect(skill.tags).toContain("moltbook");
    expect(skill.tags).toContain("agent-coordination");
    expect(skill.markdown).toContain("company agent operations");
  });

  it("filters Moltbook to reviewed PaperClaw keep skills in the local catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "moltbook.md"),
      [
        "# Moltbook",
        "",
        "- [agent-relay-digest](https://clawskills.sh/skills/orosha-ai-agent-relay-digest) - Conversation digests.",
        "- [agentchat](https://clawskills.sh/skills/tjamescouch-agentchat) - Agent chat protocol.",
        "- [ez-cronjob](https://clawskills.sh/skills/promadgenius-ez-cronjob) - Cron troubleshooting.",
        "- [mailchannels](https://clawskills.sh/skills/ttulttul-mailchannels) - Email ops.",
        "- [moltbot-security](https://clawskills.sh/skills/nextfrontierbuilds-moltbot-security) - Security hardening.",
        "- [speedtest](https://clawskills.sh/skills/spsneo-speedtest) - Network diagnostics.",
        "- [agentgram-openclaw](https://clawskills.sh/skills/iisweetheartii-agentgram-openclaw) - Agent social.",
        "- [imagemagick](https://clawskills.sh/skills/kesslerio-imagemagick) - Image processing.",
        "- [elevenlabs-open-account](https://clawskills.sh/skills/the-timebeing-elevenlabs-open-account) - Account opening.",
        "- [nonopost](https://clawskills.sh/skills/ferreirapablo-nonopost) - Anonymous posting.",
        "- [unknown-moltbook-skill](https://clawskills.sh/skills/example-unknown-moltbook-skill) - Unreviewed.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "moltbook", name: "Moltbook", slug: "moltbook", skillCount: 6 },
    ]);
  });

  it("marks Moltbook maybe, reject, and unreviewed skills as not visible by default", () => {
    const maybeSkill = {
      id: "moltbook/iisweetheartii-agentgram-openclaw",
      slug: "iisweetheartii-agentgram-openclaw",
      name: "agentgram-openclaw",
      description: "Interact with AgentGram social network for AI.",
      categorySlug: "moltbook",
      categoryName: "Moltbook",
      sourceUrl: "https://clawskills.sh/skills/iisweetheartii-agentgram-openclaw",
      installSource: null,
      trustLevel: "unknown" as const,
      tags: [],
      installedSkillId: null,
    };
    const keepSkill = {
      ...maybeSkill,
      id: "moltbook/nextfrontierbuilds-moltbot-security",
      slug: "nextfrontierbuilds-moltbot-security",
      name: "moltbot-security",
      sourceUrl: "https://clawskills.sh/skills/nextfrontierbuilds-moltbot-security",
    };
    const accountOpeningSkill = {
      ...maybeSkill,
      id: "moltbook/the-timebeing-elevenlabs-open-account",
      slug: "the-timebeing-elevenlabs-open-account",
      name: "elevenlabs-open-account",
      sourceUrl: "https://clawskills.sh/skills/the-timebeing-elevenlabs-open-account",
    };
    const unreviewedSkill = {
      ...maybeSkill,
      id: "moltbook/example-unknown-moltbook-skill",
      slug: "example-unknown-moltbook-skill",
      name: "unknown-moltbook-skill",
      sourceUrl: "https://clawskills.sh/skills/example-unknown-moltbook-skill",
    };

    expect(marketplaceSkillCurationPolicy(maybeSkill)).toBe("reject");
    expect(isMarketplaceSkillVisible(maybeSkill)).toBe(false);
    for (const skill of [accountOpeningSkill, unreviewedSkill]) {
      expect(marketplaceSkillCurationPolicy(skill)).toBe("reject");
      expect(isMarketplaceSkillVisible(skill)).toBe(false);
    }
    expect(marketplaceSkillCurationPolicy(keepSkill)).toBe("keep");
    expect(isMarketplaceSkillVisible(keepSkill)).toBe(true);
  });

  it("keeps every local marketplace category entry after pruning the reference catalog", async () => {
    const catalogRoot = path.resolve(process.cwd(), "skills database", "categories");
    try {
      await fs.access(catalogRoot);
    } catch {
      return;
    }

    const files = (await fs.readdir(catalogRoot)).filter((file) => file.endsWith(".md"));
    expect(files.length).toBeGreaterThan(0);

    const nonKeep: string[] = [];
    for (const file of files) {
      const categorySlug = file.replace(/\.md$/, "");
      const categoryName = categorySlug.split("-").map((part) => part.slice(0, 1).toUpperCase() + part.slice(1)).join(" ");
      const markdown = await fs.readFile(path.join(catalogRoot, file), "utf8");
      const entries = Array.from(markdown.matchAll(/^- \[([^\]]+)\]\((https?:\/\/[^)]+)\) - (.*)$/gm));
      for (const [, name, sourceUrl, description] of entries) {
        const slug = sourceUrl.split("/").filter(Boolean).pop()?.toLowerCase() ?? name.toLowerCase();
        const policy = marketplaceSkillCurationPolicy({
          id: `${categorySlug}/${slug}`,
          slug,
          name,
          description,
          categorySlug,
          categoryName,
          sourceUrl,
          installSource: null,
          trustLevel: "unknown" as const,
          tags: [],
          installedSkillId: null,
        });
        if (policy !== "keep") nonKeep.push(`${categorySlug}/${slug}:${policy}`);
      }
    }

    expect(nonKeep).toEqual([]);
  });

  it("does not keep maybe or reject curation ledgers after pruning", async () => {
    const source = await fs.readFile(path.resolve(process.cwd(), "server/src/services/marketplace-curation.ts"), "utf8");

    expect(source).not.toContain("MAYBE_SLUGS");
    expect(source).not.toContain("REJECT_SLUGS");
    expect(source).not.toContain('return "maybe"');
    expect(source).not.toContain('"maybe"');
  });
});
