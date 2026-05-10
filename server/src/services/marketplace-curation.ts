import type { MarketplaceSkillDetail, MarketplaceSkillListItem } from "@kesarcloud/shared";

type CuratableMarketplaceSkill = MarketplaceSkillListItem & Partial<Pick<MarketplaceSkillDetail, "markdown" | "installNotes">>;

type SkillCuration = {
  policy: "keep" | "reject";
  slug?: string;
  name?: string;
  description?: string;
  tags?: string[];
  markdown?: string;
  installNotes?: string;
};

const APPLE_APPS_CATEGORY_SLUG = "apple-apps-and-services";
const AI_LLMS_CATEGORY_SLUG = "ai-and-llms";
const BROWSER_AUTOMATION_CATEGORY_SLUG = "browser-and-automation";
const CALENDAR_SCHEDULING_CATEGORY_SLUG = "calendar-and-scheduling";
const CLAWDBOT_TOOLS_CATEGORY_SLUG = "clawdbot-tools";
const CLI_UTILITIES_CATEGORY_SLUG = "cli-utilities";
const CODING_AGENTS_IDES_CATEGORY_SLUG = "coding-agents-and-ides";
const COMMUNICATION_CATEGORY_SLUG = "communication";
const DATA_ANALYTICS_CATEGORY_SLUG = "data-and-analytics";
const DEVOPS_AND_CLOUD_CATEGORY_SLUG = "devops-and-cloud";
const GAMING_CATEGORY_SLUG = "gaming";
const GIT_GITHUB_CATEGORY_SLUG = "git-and-github";
const HEALTH_AND_FITNESS_CATEGORY_SLUG = "health-and-fitness";
const IMAGE_VIDEO_CATEGORY_SLUG = "image-and-video-generation";
const IOS_MACOS_DEVELOPMENT_CATEGORY_SLUG = "ios-and-macos-development";
const MARKETING_SALES_CATEGORY_SLUG = "marketing-and-sales";
const MEDIA_STREAMING_CATEGORY_SLUG = "media-and-streaming";
const MOLTBOOK_CATEGORY_SLUG = "moltbook";
const NOTES_PKM_CATEGORY_SLUG = "notes-and-pkm";
const PDF_DOCUMENTS_CATEGORY_SLUG = "pdf-and-documents";
const PERSONAL_DEVELOPMENT_CATEGORY_SLUG = "personal-development";
const PRODUCTIVITY_TASKS_CATEGORY_SLUG = "productivity-and-tasks";
const SECURITY_PASSWORDS_CATEGORY_SLUG = "security-and-passwords";
const SEARCH_RESEARCH_CATEGORY_SLUG = "search-and-research";
const SHOPPING_ECOMMERCE_CATEGORY_SLUG = "shopping-and-e-commerce";
const SMART_HOME_IOT_CATEGORY_SLUG = "smart-home-and-iot";
const SELF_HOSTED_AUTOMATION_CATEGORY_SLUG = "self-hosted-and-automation";
const SPEECH_TRANSCRIPTION_CATEGORY_SLUG = "speech-and-transcription";
const WEB_FRONTEND_DEVELOPMENT_CATEGORY_SLUG = "web-and-frontend-development";
const TRANSPORTATION_CATEGORY_SLUG = "transportation";
const CATALOG_FALLBACK_NOTE =
  "PaperClaw will install this as catalog markdown until the remote marketplace provides a packaged install source.";

const APPLE_HEALTH_SOURCE = "https://clawskills.sh/skills/nftechie-apple-health-skill";

const APPLE_HEALTH_MARKDOWN = `# Apple Health Intelligence

Analyze Apple Health data through the Transition API so PaperClaw agents can answer practical questions about workouts, activity rings, heart-rate patterns, recovery signals, and fitness trends.

## What this skill helps with

- Summarize recent workouts, distance, duration, calories, and training consistency.
- Review heart-rate trends, zones, and recovery-style signals when the connected data supports them.
- Track Apple activity rings and daily movement adherence.
- Compare weekly or monthly fitness trends for personal performance or wellness reporting.
- Produce board-ready wellness summaries when a company explicitly allows health-data analysis.

## Best-fit PaperClaw agents

- CEO or personal chief-of-staff agents that prepare recurring wellness summaries.
- Data analyst agents that compare activity, heart-rate, and workout trends.
- Wellness or coaching agents that turn Apple Health history into practical recommendations.
- Research Lab agents that evaluate personal analytics, quantified-self workflows, or health-adjacent product ideas.

## Example questions

- "How did my running volume change over the last 30 days?"
- "Which workouts had the highest average heart rate this month?"
- "Summarize my activity ring completion trend for the last two weeks."
- "Find signs that my training load changed significantly week over week."
- "Create a concise wellness report for the CEO inbox."

## Required setup

- A Transition API account connected to the Apple Health data source.
- A PaperClaw company secret named \`TRANSITION_API_KEY\` for authenticated endpoints.
- Explicit user permission before any agent accesses private health or wellness data.

## Privacy and safety notes

Apple Health data is sensitive personal data. Only install this skill for companies and agents that are explicitly allowed to handle private wellness information. Keep the API key in PaperClaw secrets, restrict assignment to trusted agents, and avoid copying raw health data into broad company memory unless the operator intentionally approves it.

## Current marketplace status

This entry is curated from the public OpenClaw catalog listing at ${APPLE_HEALTH_SOURCE}. The local fallback does not include package files yet, so ${CATALOG_FALLBACK_NOTE}`;

const APPLE_APPS_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "nftechie-apple-health-skill": {
    policy: "keep",
    slug: "apple-health-intelligence",
    name: "Apple Health Intelligence",
    description:
      "Analyze Apple Health workouts, activity rings, heart-rate patterns, recovery signals, and fitness trends for company wellness or personal performance workflows.",
    tags: [
      "apple-health",
      "fitness",
      "wellness",
      "workouts",
      "heart-rate",
      "activity-rings",
      "transition-api",
      "sensitive-personal-data",
      "requires-human-confirmation",
    ],
    markdown: APPLE_HEALTH_MARKDOWN,
    installNotes: [
      "This curated PaperClaw catalog entry does not include package files yet.",
      "It is designed around the Transition API Apple Health integration.",
      "Authenticated endpoints require a company secret named TRANSITION_API_KEY.",
      "Health data is sensitive; assign this skill only to agents explicitly trusted to handle private wellness data.",
      CATALOG_FALLBACK_NOTE,
    ].join("\n"),
  },
  "trebuhs-apple-search-ads-skill": {
    policy: "keep",
    slug: "apple-search-ads-manager",
    name: "Apple Search Ads Manager",
    description:
      "Manage Apple Search Ads campaigns, keywords, reports, and acquisition analysis for iOS app growth teams.",
    tags: ["marketing", "ios", "ads", "campaigns", "financial-action", "external-account", "requires-human-confirmation"],
  },
  "sbhhbs-ics-import-on-iphone": {
    policy: "keep",
    slug: "calendar-ics-export",
    name: "Calendar ICS Export",
    description:
      "Generate calendar-ready .ics files for board meetings, launches, reminders, and handoffs without direct calendar permissions.",
    tags: ["calendar", "scheduling", "handoff", "artifact", "local-only-macos"],
  },
  "kalijason-mac-tts": {
    policy: "keep",
    slug: "macos-voice-alerts",
    name: "macOS Voice Alerts",
    description:
      "Speak short local alerts for run status, approvals, incidents, and operator notifications using macOS text-to-speech.",
    tags: ["tts", "notifications", "macos", "local-only-macos", "requires-human-confirmation"],
  },
  "mohdalhashemi98-hue-mh-apple-reminders": {
    policy: "keep",
    slug: "apple-reminders-manager",
    name: "Apple Reminders Manager",
    description:
      "Create, list, edit, complete, and delete Apple Reminders for operator follow-ups and personal productivity workflows.",
    tags: ["reminders", "tasks", "productivity", "external-account", "requires-human-confirmation"],
  },
  "guoqiao-mlx-stt": {
    policy: "keep",
    slug: "local-mlx-speech-to-text",
    name: "Local MLX Speech-to-Text",
    description:
      "Transcribe meetings, calls, demos, and voice notes locally on Apple Silicon for private company workflows.",
    tags: ["speech-to-text", "transcription", "local-ai", "apple-silicon", "sensitive-personal-data"],
  },
  "guoqiao-mlx-tts": {
    policy: "keep",
    slug: "local-mlx-text-to-speech",
    name: "Local MLX Text-to-Speech",
    description:
      "Generate local spoken summaries and notifications on Apple Silicon with open-source text-to-speech models.",
    tags: ["text-to-speech", "local-ai", "apple-silicon", "notifications", "requires-human-confirmation"],
  },
  "latisen-skill-email-management": {
    policy: "keep",
    slug: "apple-mail-operations",
    name: "Apple Mail Operations",
    description:
      "Triage, search, organize, and summarize Apple Mail workflows for executive assistants, sales, support, and operations agents.",
    tags: ["email", "apple-mail", "inbox", "operations", "sensitive-personal-data", "requires-human-confirmation"],
  },
  "jon-xo-testflight-monitor": {
    policy: "keep",
    slug: "testflight-slot-monitor",
    name: "TestFlight Slot Monitor",
    description:
      "Monitor TestFlight beta availability and app slots for product, QA, and growth teams.",
    tags: ["testflight", "ios", "qa", "product", "monitoring"],
  },
  "erik-agens-shortcuts-skill": {
    policy: "keep",
    slug: "apple-shortcuts-builder",
    name: "Apple Shortcuts Builder",
    description:
      "Generate macOS and iOS Shortcut plist artifacts for reviewed Apple automation workflows.",
    tags: ["shortcuts", "automation", "artifact", "local-only-macos", "requires-human-confirmation"],
  },
};



function keepSkill(slug: string, name: string, description: string, tags: string[]): SkillCuration {
  return {
    policy: "keep",
    slug,
    name,
    description,
    tags,
  };
}

const AI_LLMS_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "abe238-adversarial-prompting": keepSkill(
    "adversarial-prompt-review",
    "Adversarial Prompt Review",
    "Stress-test prompts, instructions, and agent outputs so PaperClaw teams can find weak reasoning, injection paths, and unsafe assumptions before launch.",
    ["security", "prompt-review", "agent-safety", "research-lab", "requires-human-confirmation"],
  ),
  "davedean-agent-contact-card": keepSkill(
    "agent-contact-cards",
    "Agent Contact Cards",
    "Create company-scoped contact cards for agents so teams can discover roles, capabilities, owners, and approved communication channels.",
    ["agent-identity", "directory", "interoperability", "company-scoped"],
  ),
  "tylervovan-agent-docs": keepSkill(
    "agent-readable-docs",
    "Agent-Readable Docs",
    "Generate documentation designed for AI agents to consume, cite, and use during tasks, onboarding, and handoffs.",
    ["documentation", "knowledge-base", "agent-onboarding", "research-lab"],
  ),
  "dennis-da-menace-agent-memory": keepSkill(
    "company-scoped-agent-memory",
    "Company-Scoped Agent Memory",
    "Add persistent memory patterns for agent continuity while keeping knowledge scoped to the active PaperClaw company.",
    ["memory", "knowledge-base", "company-scoped", "sensitive-personal-data"],
  ),
  "rustyorb-agent-orchestration-multi-agent-optimize": keepSkill(
    "multi-agent-optimizer",
    "Multi-Agent Optimizer",
    "Optimize multi-agent workload distribution, profiling, and cost-aware execution for larger PaperClaw teams.",
    ["multi-agent", "orchestration", "cost-control", "observability"],
  ),
  "aatmaan1-agent-orchestrator": keepSkill(
    "task-orchestrator",
    "Task Orchestrator",
    "Coordinate complex work across agents while routing decisions back through PaperClaw issues, projects, and board-visible activity.",
    ["multi-agent", "orchestration", "tasks", "board-visible"],
  ),
  "matrixy-agent-registry": keepSkill(
    "agent-registry",
    "Agent Registry",
    "Discover agents and capabilities inside a PaperClaw company without forcing a separate parallel control plane.",
    ["agent-directory", "capabilities", "company-scoped"],
  ),
  "jimmystacks-agent-sentinel": keepSkill(
    "agent-sentinel",
    "Agent Sentinel",
    "Add circuit-breaker style safety checks for autonomous agents, budgets, approvals, and risky execution loops.",
    ["agent-safety", "circuit-breaker", "approvals", "budget-control"],
  ),
  "sru4ka-agentpulse": keepSkill(
    "agent-observability",
    "Agent Observability",
    "Track LLM API cost, tokens, latency, and errors so CEOs and operators can see how the AI company is spending and performing.",
    ["observability", "cost-control", "tokens", "latency", "agent-ops"],
  ),
  "alirezarezvani-agile-product-owner": keepSkill(
    "agile-product-owner",
    "Agile Product Owner",
    "Help product and CEO agents turn goals into backlogs, priorities, acceptance criteria, and delivery-ready issues.",
    ["product", "backlog", "planning", "issues"],
  ),
  "pauldelavallaz-ai-brand-analyzer": keepSkill(
    "brand-analyzer",
    "Brand Analyzer",
    "Analyze a company brand and produce practical positioning, messaging, tone, and creative direction for marketing agents.",
    ["marketing", "brand", "strategy", "research-lab"],
  ),
  "dadaliu0121-ai-conversation-summary": keepSkill(
    "conversation-summarizer",
    "Conversation Summarizer",
    "Summarize chats, meetings, run logs, and long discussions into decisions, action items, risks, and board-ready notes.",
    ["summaries", "meetings", "board-inbox", "knowledge-base"],
  ),
  "bowen-dotcom-aisa-llm-router-skill": keepSkill(
    "llm-gateway-router",
    "LLM Gateway Router",
    "Route model calls through a unified gateway so PaperClaw can optimize cost, latency, and provider choice per agent task.",
    ["model-routing", "llm-gateway", "cost-control", "external-account"],
  ),
  "georges91560-anti-injection-skill": keepSkill(
    "prompt-injection-defense",
    "Prompt Injection Defense",
    "Protect agent memory, tool calls, and system instructions from prompt injection attempts before they affect company work.",
    ["security", "prompt-injection", "tool-safety", "memory-safety"],
  ),
  "trypto1019-arc-security-mcp": keepSkill(
    "skill-security-scanner",
    "Skill Security Scanner",
    "Use AI-assisted security intelligence to review marketplace skills, MCP servers, and automation packages before approval.",
    ["security", "marketplace", "mcp", "requires-human-confirmation"],
  ),
  "staratheris-arya-model-router": keepSkill(
    "cost-aware-model-router",
    "Cost-Aware Model Router",
    "Choose cheap, default, or pro models per task while keeping spend decisions compatible with PaperClaw agent budgets.",
    ["model-routing", "cost-control", "sub-agents", "external-account"],
  ),
  "beee003-astrai-inference-router": keepSkill(
    "astrai-inference-router",
    "Astrai Inference Router",
    "Route inference through Astrai for cost and privacy-aware model selection when a company has approved that provider.",
    ["model-routing", "privacy", "cost-control", "external-account"],
  ),
  "iyeque-audio-processing": keepSkill(
    "audio-processing",
    "Audio Processing",
    "Ingest, transcribe, analyze, and transform audio for meeting rooms, voice notes, interviews, support calls, and Research Lab reviews.",
    ["audio", "speech-to-text", "text-to-speech", "meetings", "sensitive-personal-data"],
  ),
  "broedkrummen-broedkrumme-kalibr": keepSkill(
    "agent-telemetry-improvement",
    "Agent Telemetry & Improvement",
    "Collect agent telemetry and improvement signals so operators can tune long-running autonomous work.",
    ["telemetry", "agent-improvement", "observability", "sensitive-personal-data"],
  ),
  "stevenartzt-build-session": keepSkill(
    "build-session-manager",
    "Build Session Manager",
    "Structure autonomous build sessions for Research Lab projects, coding tasks, demos, and iterative implementation work.",
    ["research-lab", "coding", "autonomy", "sessions"],
  ),
  "manecharo-chaos-pivot": keepSkill(
    "chaos-pivot-guard",
    "Chaos Pivot Guard",
    "Help agents stop sunk-cost execution and pivot when a plan, build, or research path is no longer working.",
    ["agent-safety", "planning", "quality-control"],
  ),
  "trinitybotserver-compression": keepSkill(
    "prompt-compression",
    "Prompt Compression",
    "Compress long task context before agent runs so PaperClaw teams can preserve important details while reducing token cost.",
    ["context", "tokens", "cost-control", "agent-ops"],
  ),
  "davienzomq-context-gatekeeper": keepSkill(
    "context-gatekeeper",
    "Context Gatekeeper",
    "Keep conversations token-friendly by summarizing recent exchanges, pending actions, and important decisions for agents.",
    ["context", "summaries", "memory", "agent-ops"],
  ),
  "echology-io-decompose-mcp": keepSkill(
    "semantic-decomposer",
    "Semantic Decomposer",
    "Break text into entities, risks, attention points, and authority signals for research, due diligence, and board reports.",
    ["mcp", "research", "risk-analysis", "knowledge-base"],
  ),
  "g4dr-ecommerce-price-monitor": keepSkill(
    "ecommerce-price-monitor",
    "E-commerce Price Monitor",
    "Monitor product prices across commerce platforms and alert operations or marketing agents when pricing changes matter.",
    ["ecommerce", "monitoring", "alerts", "external-account"],
  ),
  "nantes-evoagentx": keepSkill(
    "evoagentx-integration",
    "EvoAgentX Integration",
    "Explore self-evolving agent framework patterns inside isolated PaperClaw Research Lab workflows.",
    ["multi-agent", "research-lab", "framework", "requires-human-confirmation"],
  ),
  "aronchick-expanso-log-sanitize": keepSkill(
    "log-sanitizer",
    "Log Sanitizer",
    "Remove passwords, tokens, and sensitive patterns from logs before agents store, share, or summarize them.",
    ["security", "logs", "secrets", "privacy"],
  ),
  "aronchick-expanso-secrets-scan": keepSkill(
    "secrets-scanner",
    "Secrets Scanner",
    "Detect hardcoded API keys, passwords, and tokens in code, notes, transcripts, and generated artifacts.",
    ["security", "secrets", "code-review", "research-lab"],
  ),
  "officialdelta-gmail-secretary": keepSkill(
    "gmail-secretary",
    "Gmail Secretary",
    "Triage Gmail, classify messages, draft replies, and hand off external communication for approval.",
    ["email", "operations", "external-account", "requires-human-confirmation", "sensitive-personal-data"],
  ),
  "jd-delatorre-lieutenant": keepSkill(
    "agent-trust-verification",
    "Agent Trust Verification",
    "Verify agent trust and security posture before assigning sensitive work or high-impact tools.",
    ["security", "agent-identity", "trust", "approvals"],
  ),
  "ashtiwariasu-llmcouncil-router": keepSkill(
    "llm-council-router",
    "LLM Council Router",
    "Route prompts to stronger model choices using benchmark-informed council rankings for high-value tasks.",
    ["model-routing", "benchmarks", "quality-control", "external-account"],
  ),
  "alexsjones-llmfit": keepSkill(
    "local-model-fit-advisor",
    "Local Model Fit Advisor",
    "Inspect local hardware and recommend local LLM models and quantization settings for private deployments.",
    ["local-ai", "hardware", "model-selection", "self-hosting"],
  ),
  "willykinfoussia-mantis-manager": keepSkill(
    "mantis-issue-manager",
    "Mantis Issue Manager",
    "Manage Mantis issues, projects, users, and filters for companies that use Mantis as their bug tracker.",
    ["issues", "project-management", "external-account"],
  ),
  "brunobuddy-manifest-build": keepSkill(
    "llm-routing-cost-tracking",
    "LLM Routing & Cost Tracking",
    "Add LLM routing and cost tracking patterns for companies that need provider-level budget visibility.",
    ["model-routing", "cost-control", "observability"],
  ),
  "tkuehnl-meeting-autopilot": keepSkill(
    "meeting-autopilot",
    "Meeting Autopilot",
    "Turn meeting transcripts into decisions, tasks, follow-up drafts, and board-ready operational outputs.",
    ["meetings", "summaries", "tasks", "board-inbox", "sensitive-personal-data"],
  ),
  "claudiodrusus-meeting-summarizer": keepSkill(
    "meeting-summarizer",
    "Meeting Summarizer",
    "Transform raw meeting transcripts into structured summaries with decisions, action items, and unresolved questions.",
    ["meetings", "summaries", "knowledge-base", "sensitive-personal-data"],
  ),
  "meimakes-metacognition": keepSkill(
    "agent-metacognition",
    "Agent Metacognition",
    "Add structured self-reflection so agents can explain assumptions, risks, and next actions without drifting from board priorities.",
    ["agent-safety", "planning", "quality-control"],
  ),
  "mohdalhashemi98-hue-mh-openai-whisper": keepSkill(
    "local-whisper-transcription",
    "Local Whisper Transcription",
    "Transcribe meetings, demos, voice notes, and calls locally with Whisper CLI when privacy matters.",
    ["speech-to-text", "local-ai", "meetings", "sensitive-personal-data"],
  ),
  "mohdalhashemi98-hue-mh-openai-whisper-api": keepSkill(
    "openai-whisper-transcription",
    "OpenAI Whisper Transcription",
    "Transcribe audio with OpenAI's transcription API for meeting notes, customer calls, and Research Lab artifacts.",
    ["speech-to-text", "meetings", "external-account", "sensitive-personal-data"],
  ),
  "grivn-mnemon": keepSkill(
    "persistent-agent-memory",
    "Persistent Agent Memory",
    "Provide a memory CLI pattern for agents that need durable, auditable recall across tasks.",
    ["memory", "knowledge-base", "company-scoped", "sensitive-personal-data"],
  ),
  "jscianna-moa": keepSkill(
    "mixture-of-agents",
    "Mixture of Agents",
    "Ask multiple frontier models to debate and synthesize answers for important strategy, research, and technical decisions.",
    ["multi-agent", "model-routing", "research-lab", "cost-control", "requires-human-confirmation"],
  ),
  "vdc-k-multi-agent-collab": keepSkill(
    "multi-agent-collaboration",
    "Multi-Agent Collaboration",
    "Turn collaboration methodology into practical PaperClaw workflows for coordinated agent teams.",
    ["multi-agent", "collaboration", "workflow", "planning"],
  ),
  "choihyunsus-n2-stitch-mcp": keepSkill(
    "resilient-mcp-proxy",
    "Resilient MCP Proxy",
    "Improve MCP reliability with retry, token refresh, and connection recovery patterns for agent toolchains.",
    ["mcp", "reliability", "tooling", "external-account"],
  ),
  "codeninja23-native-sentry": keepSkill(
    "sentry-operations",
    "Sentry Operations",
    "Read Sentry issues, events, and production errors so engineering agents can triage incidents and propose fixes.",
    ["observability", "sentry", "incidents", "external-account"],
  ),
  "panzacoder-pincer": keepSkill(
    "secure-skill-installer",
    "Secure Skill Installer",
    "Wrap skill installation with security checks so marketplace installs can be reviewed before agents receive new capabilities.",
    ["security", "marketplace", "install-safety", "requires-human-confirmation"],
  ),
  "leegitw-safety-checks": keepSkill(
    "runtime-safety-checks",
    "Runtime Safety Checks",
    "Validate model pinning, fallbacks, and runtime safety before trusting autonomous agent output.",
    ["agent-safety", "runtime", "quality-control", "approvals"],
  ),
  "cprice70-shipstation-orders": keepSkill(
    "shipstation-order-monitor",
    "ShipStation Order Monitor",
    "Monitor ShipStation orders, detect issues, and alert operations agents without granting broad write access by default.",
    ["ecommerce", "orders", "monitoring", "external-account"],
  ),
  "joe3112-smart-context": keepSkill(
    "smart-context-manager",
    "Smart Context Manager",
    "Improve response sizing, context pruning, delegation, and tool efficiency for long-running PaperClaw agents.",
    ["context", "tokens", "delegation", "agent-ops"],
  ),
  "bivex-snipeit-skill": keepSkill(
    "snipe-it-asset-manager",
    "Snipe-IT Asset Manager",
    "Manage IT assets through Snipe-IT for companies that need agent-assisted inventory and asset operations.",
    ["it-ops", "assets", "external-account"],
  ),
  "serudda-switch-modes": keepSkill(
    "dynamic-model-switcher",
    "Dynamic Model Switcher",
    "Switch models dynamically for cost, quality, and latency tradeoffs inside approved PaperClaw adapter policies.",
    ["model-routing", "cost-control", "agent-ops"],
  ),
  "r00tid-token-alert": keepSkill(
    "session-token-alerts",
    "Session Token Alerts",
    "Alert operators when agent sessions approach token thresholds so runs can summarize, checkpoint, or pause safely.",
    ["tokens", "alerts", "context", "agent-ops"],
  ),
  "g0head-tokenguard": keepSkill(
    "api-cost-guardian",
    "API Cost Guardian",
    "Guard AI API spend with usage alerts and budget-oriented controls for autonomous agent companies.",
    ["cost-control", "budget", "tokens", "agent-ops"],
  ),
  "jacob-bd-universal-skills-manager": keepSkill(
    "universal-skills-manager",
    "Universal Skills Manager",
    "Coordinate skill discovery, install planning, and assignment workflows for PaperClaw marketplace operations.",
    ["marketplace", "skills", "approvals", "agent-ops"],
  ),
  "gykdly-voice-recognition": keepSkill(
    "local-voice-recognition",
    "Local Voice Recognition",
    "Use local Whisper-based speech recognition for voice commands, meetings, interviews, and private operator workflows.",
    ["speech-to-text", "local-ai", "meetings", "sensitive-personal-data"],
  ),
  "robert-janssen-wolfram-alpha": keepSkill(
    "wolfram-alpha-analysis",
    "Wolfram Alpha Analysis",
    "Run mathematical, scientific, and structured calculations for research, analytics, and technical decision support.",
    ["analysis", "math", "research-lab", "external-account"],
  ),
  "blueberrywoodsym-x-ai": keepSkill(
    "xai-model-provider",
    "xAI Model Provider",
    "Let approved agents call Grok/xAI models as one provider option inside PaperClaw model routing policies.",
    ["model-provider", "model-routing", "external-account"],
  ),
  "franklu0819-lang-zhipu-asr": keepSkill(
    "zhipu-speech-recognition",
    "Zhipu Speech Recognition",
    "Use Zhipu GLM-ASR for speech recognition in multilingual meeting, call, and voice-note workflows.",
    ["speech-to-text", "meetings", "external-account", "sensitive-personal-data"],
  ),
};



const BROWSER_AUTOMATION_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "cgtreadw-accessibility-toolkit": keepSkill(
    "accessibility-qa-toolkit",
    "Accessibility QA Toolkit",
    "Review web and app experiences for accessibility friction so QA, product, and Research Lab agents can produce actionable fixes.",
    ["browser-automation", "qa", "accessibility", "research-lab"],
  ),
  "huifer-admet-prediction": keepSkill(
    "admet-research-analyst",
    "ADMET Research Analyst",
    "Support drug-discovery research by analyzing ADMET predictions for scientific due-diligence reports.",
    ["research-lab", "analysis", "domain-research", "requires-human-confirmation"],
  ),
  "thesethrose-agent-browser": keepSkill(
    "agent-browser-cli",
    "Agent Browser CLI",
    "Run headless browser automation for research, QA, screenshots, and verified web workflows.",
    ["browser-automation", "qa", "research-lab", "external-account"],
  ),
  "murphykobe-agent-browser-2": keepSkill(
    "browser-test-agent",
    "Browser Test Agent",
    "Automate browser interactions for testing forms, web apps, and customer-facing workflows under reviewed credentials.",
    ["browser-automation", "qa", "forms", "requires-human-confirmation"],
  ),
  "okwasniewski-agent-device": keepSkill(
    "mobile-device-tester",
    "Mobile Device Tester",
    "Automate iOS simulators, Android emulators, and mobile device checks for app QA and Research Lab demos.",
    ["mobile", "device-automation", "qa", "research-lab"],
  ),
  "gostlightai-agent-step-sequencer": keepSkill(
    "workflow-step-sequencer",
    "Workflow Step Sequencer",
    "Break complex agent work into ordered browser, API, and operational steps that can be audited in PaperClaw runs.",
    ["workflow", "planning", "agent-ops", "qa"],
  ),
  "gizmo-dev-agentapi": keepSkill(
    "agent-api-directory",
    "Agent API Directory",
    "Browse APIs designed for AI agents so Research Lab and CTO agents can discover integration candidates.",
    ["research-lab", "api-discovery", "saaS-ops"],
  ),
  "starbuck100-agentaudit": keepSkill(
    "dependency-security-audit",
    "Dependency Security Audit",
    "Check packages against vulnerability databases before agents install or recommend marketplace skills.",
    ["security", "marketplace", "qa", "requires-human-confirmation"],
  ),
  "brianppetty-agresource": keepSkill(
    "agresource-market-briefing",
    "AgResource Market Briefing",
    "Scrape, summarize, and analyze AgResource grain marketing newsletters for business research reports.",
    ["research-lab", "reporting", "web-research", "external-account"],
  ),
  "sohamganatra-airtable-automation": keepSkill(
    "airtable-automation",
    "Airtable Automation",
    "Automate Airtable records, bases, and operational tables for sales, ops, research, and project workflows.",
    ["saaS-ops", "database", "external-account", "requires-human-confirmation"],
  ),
  "seandong-ak-rss-24h-brief": keepSkill(
    "rss-24h-briefing",
    "RSS 24h Briefing",
    "Create daily research briefs from RSS and Atom feeds for CEO, analyst, and content agents.",
    ["research-lab", "news", "reporting"],
  ),
  "phheng-amazon-product-search-api-skill": keepSkill(
    "amazon-product-research",
    "Amazon Product Research",
    "Extract Amazon search result data for product research, competitor analysis, and ecommerce planning.",
    ["ecommerce", "research-lab", "web-research", "external-account"],
  ),
  "phheng-amazon-reviews-api-skill": keepSkill(
    "amazon-review-research",
    "Amazon Review Research",
    "Analyze Amazon reviews for customer pain points, product feedback, and market research summaries.",
    ["ecommerce", "research-lab", "customer-research", "external-account"],
  ),
  "staticai-android-adb": keepSkill(
    "android-adb-tester",
    "Android ADB Tester",
    "Control Android devices with ADB for app testing, screenshots, UI inspection, and reproducible QA flows.",
    ["mobile", "device-automation", "qa", "host-mutation"],
  ),
  "techlaai-anycrawl": keepSkill(
    "web-crawl-research",
    "Web Crawl Research",
    "Use AnyCrawl to scrape, crawl, and search public web sources for Research Lab and market intelligence work.",
    ["browser-automation", "web-research", "research-lab", "external-account"],
  ),
  "edmonddantesj-aoi-hackathon-scout-lite": keepSkill(
    "hackathon-scout",
    "Hackathon Scout",
    "Find and filter public hackathon sources without submitting forms or mutating external systems.",
    ["research-lab", "web-research", "public-data"],
  ),
  "wanng-ide-api-tester": keepSkill(
    "api-test-runner",
    "API Test Runner",
    "Perform structured HTTP requests for QA, integration validation, and Research Lab service testing.",
    ["qa", "api", "research-lab", "external-account"],
  ),
  "aligurelli-appstore-rating-pulse": keepSkill(
    "app-store-rating-monitor",
    "App Store Rating Monitor",
    "Monitor App Store ratings across countries for product, growth, and customer sentiment reporting.",
    ["monitoring", "product", "ecommerce", "reporting"],
  ),
  "tariqsumatri82-arxiv-1-0-1": keepSkill(
    "arxiv-research-assistant",
    "arXiv Research Assistant",
    "Search, fetch, and analyze academic papers for technical research, due diligence, and knowledge-base updates.",
    ["research-lab", "academic-research", "knowledge-base"],
  ),
  "ilyakam-asr": keepSkill(
    "audio-transcription",
    "Audio Transcription",
    "Transcribe audio for meetings, interviews, support calls, and Research Lab review artifacts.",
    ["meetings", "speech-to-text", "sensitive-personal-data"],
  ),
  "jordancoin-atl-mobile": keepSkill(
    "atl-mobile-tester",
    "ATL Mobile Tester",
    "Run mobile browser and native app automation through ATL for iOS simulator QA workflows.",
    ["mobile", "device-automation", "qa", "research-lab"],
  ),
  "jk-0001-automation-workflows": keepSkill(
    "automation-workflow-builder",
    "Automation Workflow Builder",
    "Design practical automation workflows that save operator time and route risky actions through PaperClaw approval.",
    ["workflow", "saaS-ops", "agent-ops"],
  ),
  "sohamganatra-basecamp-automation": keepSkill(
    "basecamp-automation",
    "Basecamp Automation",
    "Automate Basecamp projects, to-dos, and team coordination for companies that use Basecamp.",
    ["saaS-ops", "project-management", "external-account", "requires-human-confirmation"],
  ),
  "robbiethompson18-bits": keepSkill(
    "browser-agent-controller",
    "Browser Agent Controller",
    "Control browser automation agents through the Bits MCP server for repeatable web operations.",
    ["browser-automation", "mcp", "qa", "research-lab"],
  ),
  "sohamganatra-box-automation": keepSkill(
    "box-file-automation",
    "Box File Automation",
    "Automate Box file operations for approved document workflows, research artifacts, and handoffs.",
    ["saaS-ops", "documents", "external-account", "requires-human-confirmation"],
  ),
  "ktpriyatham-browser-ladder": keepSkill(
    "browser-ladder",
    "Browser Ladder",
    "Escalate browser approaches from lightweight fetching to richer automation when research or QA requires it.",
    ["browser-automation", "qa", "web-research"],
  ),
  "shawnpana-browser-use": keepSkill(
    "browser-use-cloud",
    "Browser Use Cloud",
    "Run cloud browsers for web testing, research, screenshots, and reviewed operator workflows.",
    ["browser-automation", "cloud-browser", "qa", "external-account"],
  ),
  "gumadeiras-browsh": keepSkill(
    "terminal-web-browser",
    "Terminal Web Browser",
    "Use a text-based browser for low-overhead web inspection, quick checks, and terminal-first research.",
    ["browser-automation", "terminal", "web-research"],
  ),
  "sohamganatra-cal-com-automation": keepSkill(
    "cal-com-automation",
    "Cal.com Automation",
    "Automate Cal.com scheduling workflows for meetings, demos, interviews, and support handoffs.",
    ["scheduling", "saaS-ops", "external-account", "requires-human-confirmation"],
  ),
  "gostlightai-cdp-browser": keepSkill(
    "cdp-browser-control",
    "CDP Browser Control",
    "Control a local Chrome DevTools Protocol browser for QA, screenshots, debugging, and web automation.",
    ["browser-automation", "qa", "local-browser", "host-mutation"],
  ),
  "cyberash-dev-claude-cost-cli": keepSkill(
    "claude-cost-reports",
    "Claude Cost Reports",
    "Read Claude usage and cost reports so operators can manage agent budgets and provider spend.",
    ["cost-control", "reporting", "external-account"],
  ),
  "cyberash-dev-claude-usage-cli": keepSkill(
    "claude-usage-reports",
    "Claude Usage Reports",
    "Query Claude usage limits and reports for budget-aware agent operations.",
    ["cost-control", "reporting", "external-account"],
  ),
  "ariktulcha-client-flow": keepSkill(
    "client-flow-automation",
    "Client Flow Automation",
    "Manage client onboarding and project lifecycle steps while preserving approval for external mutations.",
    ["client-ops", "workflow", "saaS-ops", "requires-human-confirmation"],
  ),
  "simonfunk-coda-io": keepSkill(
    "coda-io-automation",
    "Coda.io Automation",
    "Interact with Coda docs, tables, rows, pages, and automations for company operations.",
    ["saaS-ops", "documents", "database", "external-account"],
  ),
  "autogame-17-code-stats": keepSkill(
    "code-statistics",
    "Code Statistics",
    "Generate repository complexity and file statistics for engineering reports and Research Lab reviews.",
    ["qa", "code-analysis", "reporting", "research-lab"],
  ),
  "frhn9-code-tester": keepSkill(
    "code-tester",
    "Code Tester",
    "Build, run, and test code projects in controlled Research Lab and engineering workflows.",
    ["qa", "coding", "research-lab", "host-mutation"],
  ),
  "idoshamun-daily-dev-agentic": keepSkill(
    "daily-dev-agentic-learning",
    "daily.dev Agentic Learning",
    "Ingest developer feeds for continuous technical learning and engineering research updates.",
    ["research-lab", "developer-news", "knowledge-base"],
  ),
  "ym2760184260-daily-news": keepSkill(
    "daily-news-digest",
    "Daily News Digest",
    "Fetch and summarize daily news into source-aware research briefs for company agents.",
    ["research-lab", "news", "reporting"],
  ),
  "reed1898-db-readonly": keepSkill(
    "read-only-database-query",
    "Read-only Database Query",
    "Run safe read-only MySQL or PostgreSQL queries for reporting, troubleshooting, and data inspection.",
    ["database", "reporting", "saaS-ops", "sensitive-personal-data"],
  ),
  "aaron-he-zhu-entity-optimizer": keepSkill(
    "entity-presence-optimizer",
    "Entity Presence Optimizer",
    "Research entity presence, knowledge graph coverage, and brand discoverability for marketing and AI SEO teams.",
    ["marketing", "research-lab", "ai-seo", "reporting"],
  ),
  "ravana-indus-erpnext-frappe": keepSkill(
    "erpnext-frappe-automation",
    "ERPNext/Frappe Automation",
    "Run high-level ERPNext business workflows across approved MCP tools for operations and finance teams.",
    ["saaS-ops", "erp", "external-account", "requires-human-confirmation"],
  ),
  "marsnavi-error-driven-evolution": keepSkill(
    "error-driven-agent-improvement",
    "Error-Driven Agent Improvement",
    "Convert recurring errors into rules and checks that improve agent behavior and engineering quality.",
    ["qa", "agent-ops", "knowledge-base"],
  ),
  "claireaicodes-exa-tool": keepSkill(
    "exa-research-crawler",
    "Exa Research Crawler",
    "Use Exa MCP search and crawling for advanced market, competitor, and technical research.",
    ["research-lab", "web-research", "external-account"],
  ),
  "odysseus0-feed-digest": keepSkill(
    "feed-digest",
    "Feed Digest",
    "Generate agentic digests from feed sources for research, monitoring, and board summaries.",
    ["research-lab", "news", "reporting"],
  ),
  "gaowanqi08141999-feishu-bitable-creator": keepSkill(
    "feishu-bitable-automation",
    "Feishu Bitable Automation",
    "Create and populate Feishu Bitable tables for structured operations, research, and project tracking.",
    ["saaS-ops", "database", "external-account", "requires-human-confirmation"],
  ),
  "wesley138cn-feishu-sheets": keepSkill(
    "feishu-sheets-automation",
    "Feishu Sheets Automation",
    "Read and update Feishu spreadsheets for reporting, planning, and operations workflows.",
    ["saaS-ops", "spreadsheets", "external-account", "requires-human-confirmation"],
  ),
  "aaron-he-zhu-geo-content-optimizer": keepSkill(
    "geo-content-optimizer",
    "GEO Content Optimizer",
    "Optimize content for AI search visibility, answer engines, and citation-ready brand presence.",
    ["marketing", "ai-seo", "research-lab"],
  ),
  "beanapologist-goldenseed": keepSkill(
    "deterministic-test-entropy",
    "Deterministic Test Entropy",
    "Generate reproducible entropy streams for deterministic tests and procedural QA scenarios.",
    ["qa", "testing", "research-lab"],
  ),
  "solsuk-grago": keepSkill(
    "local-llm-research-delegate",
    "Local LLM Research Delegate",
    "Delegate research and data-fetch tasks to a local LLM for private Research Lab workflows.",
    ["research-lab", "local-ai", "agent-ops"],
  ),
  "dreamtraveler13-guicountrol": keepSkill(
    "linux-gui-automation",
    "Linux GUI Automation",
    "Automate Linux desktop GUI interactions for test environments and controlled Research Lab demos.",
    ["desktop-automation", "qa", "host-mutation", "requires-human-confirmation"],
  ),
  "huberteff-hfnews": keepSkill(
    "hf-news-monitor",
    "HF News Monitor",
    "Fetch and filter multi-source news for research monitoring and board-ready briefings.",
    ["research-lab", "news", "reporting"],
  ),
  "lilyjazz-hive-mind": keepSkill(
    "shared-agent-memory",
    "Shared Agent Memory",
    "Sync memories across agents with a shared database while keeping PaperClaw company boundaries explicit.",
    ["memory", "multi-agent", "company-scoped", "sensitive-personal-data"],
  ),
  "tianxingleo-huggingface-trends": keepSkill(
    "hugging-face-trends-monitor",
    "Hugging Face Trends Monitor",
    "Monitor trending Hugging Face models for Research Lab model selection and technical scouting.",
    ["research-lab", "model-selection", "monitoring"],
  ),
  "wells1137-image-enhancer": keepSkill(
    "screenshot-image-enhancer",
    "Screenshot Image Enhancer",
    "Improve screenshots and report images for QA evidence, demos, and board-ready visual artifacts.",
    ["qa", "images", "reporting", "external-account"],
  ),
  "omprasad122007-rgb-input-classification-v1": keepSkill(
    "task-input-classifier",
    "Task Input Classifier",
    "Classify clarified input into task categories so PaperClaw can route work to the right agent or workflow.",
    ["workflow", "routing", "agent-ops"],
  ),
  "apexfork-ipfs-client": keepSkill(
    "ipfs-read-only-explorer",
    "IPFS Read-Only Explorer",
    "Fetch and inspect IPFS/IPNS content for read-only research and metadata analysis.",
    ["research-lab", "web-research", "public-data"],
  ),
  "xammarie-jarvis-api-contract-guard-01": keepSkill(
    "api-contract-guard",
    "API Contract Guard",
    "Design and verify API contracts so engineering agents can catch compatibility risks before release.",
    ["qa", "api", "coding", "research-lab"],
  ),
  "xammarie-jarvis-bug-triage-01": keepSkill(
    "bug-triage-assistant",
    "Bug Triage Assistant",
    "Triage production bugs with repro isolation, risk-first prioritization, and fix planning.",
    ["qa", "incidents", "coding", "research-lab"],
  ),
  "xammarie-jarvis-ci-flake-hunter-01": keepSkill(
    "ci-flake-hunter",
    "CI Flake Hunter",
    "Track and reduce flaky tests with deterministic isolation and evidence-driven fixes.",
    ["qa", "ci", "coding", "research-lab"],
  ),
  "xammarie-jarvis-db-query-doctor-01": keepSkill(
    "database-query-doctor",
    "Database Query Doctor",
    "Diagnose slow SQL and propose safer query rewrites for performance-sensitive systems.",
    ["database", "qa", "coding", "sensitive-personal-data"],
  ),
  "xammarie-jarvis-migration-risk-radar-01": keepSkill(
    "migration-risk-radar",
    "Migration Risk Radar",
    "Assess database and system migration risks and design staged rollout plans.",
    ["qa", "database", "release", "research-lab"],
  ),
  "xammarie-jarvis-test-gap-finder-01": keepSkill(
    "test-gap-finder",
    "Test Gap Finder",
    "Find missing tests by failure mode, risk, and business impact for engineering agents.",
    ["qa", "testing", "coding", "research-lab"],
  ),
  "shopmeskills-logistics-tracking": keepSkill(
    "logistics-tracking",
    "Logistics Tracking",
    "Track international packages by tracking number for ecommerce, operations, and support agents.",
    ["ecommerce", "orders", "monitoring", "external-account"],
  ),
  "qrost-map-grabber": keepSkill(
    "map-data-grabber",
    "Map Data Grabber",
    "Fetch OpenStreetMap vector data and export it for real-estate, logistics, and spatial research.",
    ["research-lab", "gis", "public-data", "reporting"],
  ),
  "femto-mcp-chrome": keepSkill(
    "chrome-browser-automation",
    "Chrome Browser Automation",
    "Control Chrome through MCP for web testing, screenshots, debugging, and browser-based workflows.",
    ["browser-automation", "mcp", "qa", "host-mutation"],
  ),
  "olivermonneke-meeting-notes-pro": keepSkill(
    "meeting-notes-pro",
    "Meeting Notes Pro",
    "Create structured meeting notes, decisions, and action items for company memory and board review.",
    ["meetings", "summaries", "knowledge-base", "sensitive-personal-data"],
  ),
  "zencrust-ai-minimal-memory": keepSkill(
    "minimal-agent-memory",
    "Minimal Agent Memory",
    "Maintain clean memory files with good, bad, and neutral categorization for scoped agent learning.",
    ["memory", "company-scoped", "knowledge-base"],
  ),
  "mobilerun": keepSkill(
    "mobile-device-runner",
    "Mobile Device Runner",
    "Control Android devices for tapping, swiping, typing, screenshots, and app QA runs.",
    ["mobile", "device-automation", "qa", "host-mutation"],
  ),
  "codeninja23-native-airtable": keepSkill(
    "airtable-reader",
    "Airtable Reader",
    "Read Airtable bases, tables, and records for reporting and company data workflows.",
    ["saaS-ops", "database", "external-account", "sensitive-personal-data"],
  ),
  "magicseek-nblm": keepSkill(
    "notebooklm-research",
    "NotebookLM Research",
    "Query source-grounded Google NotebookLM notebooks for research, analysis, and knowledge-base work.",
    ["research-lab", "knowledge-base", "external-account"],
  ),
  "matt998759-ned-analytics": keepSkill(
    "shopify-analytics-via-ned",
    "Shopify Analytics via Ned",
    "Query Shopify sales, profitability, customer, and marketing analytics through Ned's API.",
    ["ecommerce", "analytics", "external-account", "sensitive-personal-data"],
  ),
  "zouchaoqun-nova-act": keepSkill(
    "amazon-nova-act-browser-automation",
    "Amazon Nova Act Browser Automation",
    "Use Amazon Nova Act for AI-powered browser automation in testing, research, and reviewed web tasks.",
    ["browser-automation", "qa", "research-lab", "requires-human-confirmation"],
  ),
  "ndtchan-nso-macro-monitor": keepSkill(
    "vietnam-macro-monitor",
    "Vietnam Macro Monitor",
    "Monitor official Vietnam socio-economic releases and summarize macro trends for research reports.",
    ["research-lab", "public-data", "reporting"],
  ),
  "asoviche-ogment-agentic-cli": keepSkill(
    "ogment-business-integrations",
    "Ogment Business Integrations",
    "Access approved SaaS, API, and data integrations through Ogment for business automation workflows.",
    ["saaS-ops", "api", "external-account", "requires-human-confirmation"],
  ),
  "rosseyre-openrouter-usage": keepSkill(
    "openrouter-usage-monitor",
    "OpenRouter Usage Monitor",
    "Fetch OpenRouter usage totals and spend history for agent budget visibility.",
    ["cost-control", "model-provider", "reporting", "external-account"],
  ),
  "dcprevere-org-memory": keepSkill(
    "org-mode-company-memory",
    "Org Mode Company Memory",
    "Use org-mode files for structured company knowledge and task memory without replacing PaperClaw issues.",
    ["memory", "knowledge-base", "company-scoped"],
  ),
  "moenassi-osv-scanner": keepSkill(
    "osv-vulnerability-scanner",
    "OSV Vulnerability Scanner",
    "Scan dependencies for known vulnerabilities before release, installation, or Research Lab delivery.",
    ["security", "qa", "coding", "research-lab"],
  ),
  "shassingh09-paperpod": keepSkill(
    "paperpod-agent-runtime",
    "Paperpod Agent Runtime",
    "Run isolated code execution, live previews, and browser automation for Research Lab style build work.",
    ["research-lab", "browser-automation", "coding", "host-mutation"],
  ),
  "cheminem-pharma-pharmacology-agent": keepSkill(
    "pharmacology-research-agent",
    "Pharmacology Research Agent",
    "Analyze pharmacology and ADME/PK profiles for scientific research workflows.",
    ["research-lab", "analysis", "domain-research", "requires-human-confirmation"],
  ),
  "luckypipewrench-pipelock": keepSkill(
    "pipelock-request-firewall",
    "Pipelock Request Firewall",
    "Route agent HTTP requests through a scanning proxy that catches credential leaks, SSRF, and prompt injection risks.",
    ["security", "api", "agent-safety", "requires-human-confirmation"],
  ),
  "javainthinking-powerdrill-data-analysis-skill": keepSkill(
    "powerdrill-data-analysis",
    "Powerdrill Data Analysis",
    "Analyze, explore, visualize, and query datasets with Powerdrill for board and Research Lab reporting.",
    ["analytics", "reporting", "research-lab", "external-account"],
  ),
  "yoder-bawt-qdrant-advanced": keepSkill(
    "advanced-qdrant-operations",
    "Advanced Qdrant Operations",
    "Operate Qdrant vector databases for agent memory, semantic search, and knowledge retrieval workflows.",
    ["memory", "vector-database", "knowledge-base", "sensitive-personal-data"],
  ),
  "dorukardahan-research-reprompter": keepSkill(
    "research-prompt-builder",
    "Research Prompt Builder",
    "Turn rough questions into executable research prompts for Research Lab and analyst agents.",
    ["research-lab", "planning", "knowledge-base"],
  ),
  "odysseus0-rss-digest": keepSkill(
    "rss-research-digest",
    "RSS Research Digest",
    "Create RSS research digests for monitoring competitors, markets, technologies, and company topics.",
    ["research-lab", "news", "reporting"],
  ),
  "highlander89-sap-integration": keepSkill(
    "sap-integration",
    "SAP Integration",
    "Integrate SAP, ABAP, HANA, and S/4HANA data extraction and automation into approved enterprise workflows.",
    ["saaS-ops", "erp", "external-account", "requires-human-confirmation"],
  ),
  "dave-b-b-sentry-issues": keepSkill(
    "sentry-issue-analyst",
    "Sentry Issue Analyst",
    "Fetch and analyze Sentry issues so engineering agents can triage incidents and propose fixes.",
    ["qa", "incidents", "observability", "external-account"],
  ),
  "incognos-shortcut-skill": keepSkill(
    "shortcut-project-manager",
    "Shortcut Project Manager",
    "Access Shortcut.com project management workflows for issues, stories, and delivery planning.",
    ["project-management", "saaS-ops", "external-account", "requires-human-confirmation"],
  ),
  "raghuraam25-skilldevelop": keepSkill(
    "agent-learning-log",
    "Agent Learning Log",
    "Capture learnings, errors, and corrections so agents can improve inside company-scoped workflows.",
    ["agent-ops", "knowledge-base", "company-scoped"],
  ),
  "dvdegenz-snail-mail": keepSkill(
    "operator-slow-inbox",
    "Operator Slow Inbox",
    "Provide a slow-channel inbox for important operator notes, handoffs, and non-urgent agent updates.",
    ["workflow", "inbox", "agent-ops"],
  ),
  "onatm-snapbyte-digest-api": keepSkill(
    "snapbyte-developer-digest",
    "Snapbyte Developer Digest",
    "Fetch personalized developer news digests for Research Lab and engineering awareness.",
    ["research-lab", "developer-news", "external-account"],
  ),
  "romancircus-sota-tracker-mcp": keepSkill(
    "sota-model-tracker",
    "SOTA Model Tracker",
    "Track state-of-the-art AI models for Research Lab model selection and platform planning.",
    ["research-lab", "model-selection", "mcp"],
  ),
  "1999azzar-stability-ai": keepSkill(
    "stability-ai-image-generator",
    "Stability AI Image Generator",
    "Generate marketing, product, and report assets with Stability AI under approved content policies.",
    ["marketing", "images", "external-account", "requires-human-confirmation"],
  ),
  "zopyx-tageblatt-headlines": keepSkill(
    "news-headline-archiver",
    "News Headline Archiver",
    "Archive daily headlines for monitoring, research, and source-aware briefings.",
    ["research-lab", "news", "web-research"],
  ),
  "heldinhow-super-browser": keepSkill(
    "browser-automation-suite",
    "Browser Automation Suite",
    "Use a combined browser automation framework for testing, screenshots, crawling, and reviewed web workflows.",
    ["browser-automation", "qa", "research-lab", "requires-human-confirmation"],
  ),
  "hjw21century-trending-skills": keepSkill(
    "skills-trend-tracker",
    "Skills Trend Tracker",
    "Track trending skills and marketplace momentum for PaperClaw marketplace research.",
    ["marketplace", "research-lab", "monitoring"],
  ),
  "anotb-truenas-skill": keepSkill(
    "truenas-admin",
    "TrueNAS Admin",
    "Manage TrueNAS SCALE through approved infrastructure workflows and explicit destructive-action gates.",
    ["infrastructure", "saaS-ops", "external-account", "requires-human-confirmation"],
  ),
  "underbench2-gif-ub2-markdown-report-generator": keepSkill(
    "markdown-report-generator",
    "Markdown Report Generator",
    "Compile information from multiple sources into polished Markdown reports for CEO and board review.",
    ["reporting", "research-lab", "knowledge-base"],
  ),
  "guoqiao-url2pdf": keepSkill(
    "url-to-pdf-capture",
    "URL to PDF Capture",
    "Capture URLs as PDFs for research evidence, QA artifacts, and board-readable reports.",
    ["browser-automation", "reporting", "research-lab"],
  ),
  "guoqiao-url2png": keepSkill(
    "url-to-png-capture",
    "URL to PNG Capture",
    "Capture URLs as PNG screenshots for QA evidence, visual reviews, and Research Lab demos.",
    ["browser-automation", "qa", "reporting", "research-lab"],
  ),
  "cosformula-wakapi-sync-skill": keepSkill(
    "wakapi-activity-sync",
    "Wakapi Activity Sync",
    "Sync daily Wakapi or WakaTime-compatible summaries into local reports for engineering productivity review.",
    ["reporting", "developer-productivity", "external-account"],
  ),
  "fbrandel-wallabag": keepSkill(
    "wallabag-knowledge-collector",
    "Wallabag Knowledge Collector",
    "Collect and manage Wallabag bookmarks for research queues, knowledge-base inputs, and reading workflows.",
    ["research-lab", "knowledge-base", "external-account"],
  ),
  "fmdmm-wiseocr": keepSkill(
    "pdf-ocr-to-markdown",
    "PDF OCR to Markdown",
    "Convert PDFs into Markdown for searchable reports, research ingestion, and company knowledge-base workflows.",
    ["documents", "ocr", "knowledge-base", "sensitive-personal-data"],
  ),
  "anishtr4-x-trends": keepSkill(
    "x-trends-monitor",
    "X Trends Monitor",
    "Fetch public X/Twitter trend topics for market, content, and competitor research.",
    ["marketing", "web-research", "public-data"],
  ),
  "bkamuz-yandex-tracker-cli": keepSkill(
    "yandex-tracker-cli",
    "Yandex Tracker CLI",
    "Operate Yandex Tracker issues and workflows for teams that use it as their external tracker.",
    ["project-management", "saaS-ops", "external-account", "requires-human-confirmation"],
  ),
};



const CALENDAR_SCHEDULING_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "toughworm-advanced-calendar": keepSkill(
    "advanced-calendar-scheduler",
    "Advanced Calendar Scheduler",
    "Use natural-language calendar scheduling to help PaperClaw agents plan meetings, commitments, and operational calendars.",
    ["calendar", "scheduling", "meetings", "agent-ops"],
  ),
  "gumadeiras-calcurse": keepSkill(
    "calcurse-scheduler",
    "Calcurse Scheduler",
    "Use a local text-based calendar for lightweight scheduling, operator planning, and low-risk company routines.",
    ["calendar", "scheduling", "local-only", "agent-ops"],
  ),
  "solitaire2015-event-watcher": keepSkill(
    "event-watcher",
    "Event Watcher",
    "Monitor relevant events so operations, meeting, and support agents can react to schedule-sensitive changes.",
    ["calendar", "events", "monitoring", "agent-ops"],
  ),
  "brianppetty-farmos-equipment": keepSkill(
    "equipment-maintenance-scheduler",
    "Equipment Maintenance Scheduler",
    "Query equipment status, maintenance schedules, and service history for field, facilities, or farm operations.",
    ["maintenance", "scheduling", "operations", "external-account"],
  ),
  "hougangdev-meeting-prep": keepSkill(
    "meeting-prep",
    "Meeting Prep",
    "Prepare meeting context, agenda notes, and daily commit summaries for CEO, board, and team check-ins.",
    ["meetings", "calendar", "summaries", "board-inbox"],
  ),
  "billylui-temporal-cortex": keepSkill(
    "temporal-cortex-scheduling",
    "Temporal Cortex Scheduling",
    "Schedule and book across Google, Outlook, and CalDAV while keeping availability checks and bookings traceable.",
    ["calendar", "scheduling", "external-account", "requires-human-confirmation"],
  ),
  "billylui-temporal-cortex-datetime": keepSkill(
    "datetime-timezone-tools",
    "Datetime & Timezone Tools",
    "Resolve dates, convert timezones, and handle DST-aware scheduling math for distributed companies.",
    ["datetime", "timezone", "scheduling", "calendar"],
  ),
  "billylui-temporal-cortex-scheduling": keepSkill(
    "multi-calendar-availability",
    "Multi-Calendar Availability",
    "Merge multi-calendar availability and perform atomic booking workflows for cross-team scheduling.",
    ["calendar", "availability", "scheduling", "external-account", "requires-human-confirmation"],
  ),
};



const COMMUNICATION_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "ryancampbell-agent-team-kit": keepSkill(
    "agent-team-kit",
    "Agent Team Kit",
    "Coordinate self-sustaining PaperClaw agent teams while keeping work company-scoped and visible to the board.",
    ["communication", "multi-agent", "agent-ops", "company-scoped"],
  ),
  "trypto1019-arc-budget-tracker": keepSkill(
    "budget-alert-tracker",
    "Budget Alert Tracker",
    "Track agent spending, set budgets, and raise alerts before autonomous teams surprise operators with runaway costs.",
    ["communication", "alerts", "budget", "cost-control", "agent-ops"],
  ),
  "crimsondevil333333-collaboration-helper": keepSkill(
    "collaboration-helper",
    "Collaboration Helper",
    "Track action items, coordination notes, and team follow-ups across PaperClaw agents and work objects.",
    ["communication", "collaboration", "tasks", "agent-ops"],
  ),
  "aatmaan1-communication-skill": keepSkill(
    "communication-coach",
    "Communication Coach",
    "Improve listening, response drafting, and message quality before agents send updates to users, teammates, or clients.",
    ["communication", "drafting", "support", "approvals"],
  ),
  "user520512-cs-scripts": keepSkill(
    "support-reply-drafts",
    "Support Reply Drafts",
    "Generate context-aware customer-support reply drafts that can be reviewed before any external message is sent.",
    ["communication", "support", "email", "requires-human-confirmation"],
  ),
  "aronchick-expanso-email-triage": keepSkill(
    "expanso-email-triage",
    "Expanso Email Triage",
    "Triage email, classify messages, summarize priority inbox work, and prepare response drafts with calendar context.",
    ["communication", "email", "inbox", "calendar", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "neuralshift1-gmail-last5": keepSkill(
    "gmail-last5",
    "Gmail Last5",
    "Read and summarize the latest unique Gmail messages for lightweight executive inbox reviews.",
    ["communication", "email", "inbox", "sensitive-personal-data"],
  ),
  "tradmangh-job-execution-monitor": keepSkill(
    "job-execution-monitor",
    "Job Execution Monitor",
    "Monitor scheduled jobs and alert operators when automation fails, misses a schedule, or needs attention.",
    ["communication", "alerts", "monitoring", "agent-ops"],
  ),
  "tradmangh-key-expiry-tracker": keepSkill(
    "key-expiry-tracker",
    "Key Expiry Tracker",
    "Track credential expiry metadata and alert teams before API keys, client secrets, or certificates expire.",
    ["communication", "alerts", "security", "monitoring"],
  ),
  "voshawn-meeting-coordinator": keepSkill(
    "meeting-coordinator",
    "Meeting Coordinator",
    "Coordinate executive meetings across email, calendars, venues, confirmations, and follow-up communication.",
    ["communication", "meetings", "calendar", "scheduling", "external-account", "requires-human-confirmation"],
  ),
  "mkelk-meetlark": keepSkill(
    "meetlark",
    "MeetLark",
    "Run scheduling polls for humans and agents so teams can agree on meeting times without direct calendar control.",
    ["communication", "meetings", "scheduling", "polls", "requires-human-confirmation"],
  ),
  "jeffpignataro-miranda-elevenlabs-speech": keepSkill(
    "miranda-elevenlabs-speech",
    "Miranda ElevenLabs Speech",
    "Use ElevenLabs speech-to-text and text-to-speech for meetings, voice notes, accessibility, and spoken summaries.",
    ["communication", "speech-to-text", "text-to-speech", "meetings", "sensitive-personal-data"],
  ),
  "daaab-nadmail": keepSkill(
    "nadmail",
    "NadMail",
    "Provide email-style inbox channels for AI agents that need traceable asynchronous communication.",
    ["communication", "email", "agent-inbox", "external-account"],
  ),
  "ezisezis-nuggetz-swarm": keepSkill(
    "nuggetz-swarm",
    "Nuggetz Swarm",
    "Create team-scoped knowledge feeds that help PaperClaw agents share discoveries, updates, and working context.",
    ["communication", "knowledge-base", "team-feed", "company-scoped"],
  ),
  "casperaiassist-postwall": keepSkill(
    "postwall",
    "Postwall",
    "Use a human-in-the-loop email gateway for AI agents that read, draft, and send messages only through approvals.",
    ["communication", "email", "approvals", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "jpaulgrayson-quackgram": keepSkill(
    "quackgram",
    "QuackGram",
    "Send and receive cross-platform agent-to-agent messages with explicit routing and identity controls.",
    ["communication", "messaging", "agent-inbox", "external-account"],
  ),
  "zenjabba-rocketchat": keepSkill(
    "rocketchat",
    "Rocket.Chat",
    "Connect approved agents to Rocket.Chat channels, messages, users, and team communication workflows.",
    ["communication", "messaging", "team-chat", "external-account", "requires-human-confirmation"],
  ),
  "iammhk-sarvam": keepSkill(
    "sarvam-voice-language",
    "Sarvam Voice & Language",
    "Use Sarvam AI for Indian-language speech-to-text, text-to-speech, translation, and multilingual communication support.",
    ["communication", "speech-to-text", "text-to-speech", "translation", "sensitive-personal-data"],
  ),
  "leic8959-sudo-self-review": keepSkill(
    "self-review",
    "Self Review",
    "Review agent output quality before messages, reports, or customer replies are shown or sent.",
    ["communication", "quality", "approvals", "agent-safety"],
  ),
  "bzsega-sergei-mikhailov-stt": keepSkill(
    "voice-message-transcription",
    "Voice Message Transcription",
    "Transcribe voice messages and audio notes for meetings, support handoffs, and searchable company memory.",
    ["communication", "speech-to-text", "meetings", "sensitive-personal-data"],
  ),
  "sixel-et-sixel-email": keepSkill(
    "sixel-email",
    "Sixel Email",
    "Give an agent a constrained 1:1 email channel where it can communicate with only one approved address.",
    ["communication", "email", "agent-inbox", "approvals", "requires-human-confirmation"],
  ),
  "turfptax-udp-messenger": keepSkill(
    "udp-messenger",
    "UDP Messenger",
    "Let agents discover and message trusted peers on a local network for lab, demo, and isolated workspace communication.",
    ["communication", "messaging", "local-network", "company-scoped"],
  ),
};



const GIT_GITHUB_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "monteslu-agentgate": keepSkill(
    "human-approved-data-gateway",
    "Human-Approved Data Gateway",
    "Gate personal and company data access through human-approved write workflows for safer agent integrations.",
    ["git", "github", "approvals", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "lopushok9-airadar": keepSkill(
    "ai-tool-radar",
    "AI Tool Radar",
    "Track AI-native tools, GitHub projects, funding signals, and product momentum for Research Lab and strategy work.",
    ["git", "github", "research-lab", "market-research", "public-data"],
  ),
  "trypto1019-arc-security-audit": keepSkill(
    "agent-stack-security-audit",
    "Agent Stack Security Audit",
    "Audit installed skills, adapters, permissions, and agent stack risks before assignment or marketplace approval.",
    ["git", "github", "security", "marketplace", "agent-safety", "requires-human-confirmation"],
  ),
  "trypto1019-arc-trust-verifier": keepSkill(
    "skill-trust-verifier",
    "Skill Trust Verifier",
    "Verify marketplace skill provenance and build evidence-backed trust signals for approved installs.",
    ["git", "github", "security", "marketplace", "provenance", "agent-safety"],
  ),
  "xukp20-arxiv-search-collector": keepSkill(
    "arxiv-research-collector",
    "arXiv Research Collector",
    "Collect reproducible arXiv paper sets for Research Lab, technical due diligence, and R&D reports.",
    ["git", "github", "research-lab", "papers", "public-data"],
  ),
  "fatfingererr-azhua-skill-vetter": keepSkill(
    "skill-vetting-review",
    "Skill Vetting Review",
    "Review untrusted skills before installation with a security-first marketplace checklist.",
    ["git", "github", "security", "marketplace", "approvals", "agent-safety"],
  ),
  "pals-software-azure-devops": keepSkill(
    "azure-devops-connector",
    "Azure DevOps Connector",
    "Operate Azure DevOps projects, repos, branches, PRs, work items, and build status through scoped credentials.",
    ["git", "repos", "azure-devops", "project-management", "external-account", "requires-human-confirmation"],
  ),
  "sohamganatra-bitbucket-automation": keepSkill(
    "bitbucket-connector",
    "Bitbucket Connector",
    "Automate Bitbucket repositories, pull requests, and engineering collaboration workflows.",
    ["git", "repos", "bitbucket", "project-management", "external-account", "requires-human-confirmation"],
  ),
  "ariktulcha-biz-reporter": keepSkill(
    "business-metrics-reporter",
    "Business Metrics Reporter",
    "Prepare board-visible business reports from analytics, search, revenue, and growth sources.",
    ["git", "github", "reporting", "analytics", "board-inbox", "external-account"],
  ),
  "andyxinweiminicloud-capability-graph-mapper": keepSkill(
    "capability-graph-mapper",
    "Capability Graph Mapper",
    "Map the composite permission surface across installed skills and agent dependency chains.",
    ["git", "github", "security", "marketplace", "permissions", "agent-safety"],
  ),
  "andyxinweiminicloud-capability-scope-expansion-watcher": keepSkill(
    "capability-scope-watcher",
    "Capability Scope Watcher",
    "Detect incremental capability expansion across skill versions before unsafe updates are accepted.",
    ["git", "github", "security", "marketplace", "permissions", "agent-safety"],
  ),
  "bobrenze-bot-commit-analyzer": keepSkill(
    "commit-pattern-analyzer",
    "Commit Pattern Analyzer",
    "Analyze repository commit patterns to monitor autonomous engineering quality and delivery behavior.",
    ["git", "github", "commit-analysis", "engineering", "reporting"],
  ),
  "aaron-he-zhu-competitor-analysis": keepSkill(
    "competitor-analysis",
    "Competitor Analysis",
    "Research competitors, SEO positioning, rankings, and market signals for strategy agents.",
    ["git", "github", "research-lab", "market-research", "marketing"],
  ),
  "mkpareek0315-content-repurpose-pro": keepSkill(
    "content-repurposer",
    "Content Repurposer",
    "Turn existing content into reviewed social, blog, newsletter, and campaign assets.",
    ["git", "github", "marketing", "content", "requires-human-confirmation"],
  ),
  "bastos-conventional-commits": keepSkill(
    "conventional-commit-writer",
    "Conventional Commit Writer",
    "Draft Conventional Commit messages from staged or reviewed changes.",
    ["git", "commits", "engineering", "documentation"],
  ),
  "luigi08001-crm-data-cleaner": keepSkill(
    "crm-data-cleaner",
    "CRM Data Cleaner",
    "Deduplicate, normalize, and enrich CRM contacts and companies for sales and operations teams.",
    ["git", "github", "crm", "data-processing", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "don-gbot-cross-model-review": keepSkill(
    "adversarial-plan-review",
    "Adversarial Plan Review",
    "Review risky plans with a second model before board approval, PR merge, deployment, or external action.",
    ["git", "github", "review", "agent-safety", "approvals"],
  ),
  "alexgusevski-dataforseo-cli": keepSkill(
    "seo-keyword-research",
    "SEO Keyword Research",
    "Run keyword and SEO research for growth agents using DataForSEO-backed workflows.",
    ["git", "github", "marketing", "seo", "external-account"],
  ),
  "arun-8687-deepwiki": keepSkill(
    "github-repo-docs-lookup",
    "GitHub Repo Docs Lookup",
    "Query GitHub repository documentation and wiki-style context for engineering research.",
    ["git", "github", "repo-research", "documentation", "research-lab"],
  ),
  "andyxinweiminicloud-delta-disclosure-auditor": keepSkill(
    "skill-update-disclosure-audit",
    "Skill Update Disclosure Audit",
    "Verify that skill updates publish auditable records of security-relevant changes.",
    ["git", "github", "security", "marketplace", "provenance", "agent-safety"],
  ),
  "cameron-jovan-email-capture-generator": keepSkill(
    "lead-magnet-builder",
    "Lead Magnet Builder",
    "Create reviewed lead magnets, squeeze pages, and email capture funnel drafts.",
    ["git", "github", "marketing", "lead-generation", "requires-human-confirmation"],
  ),
  "whiteknight07-exa-web-search-free": keepSkill(
    "exa-web-search",
    "Exa Web Search",
    "Search the web for sourced research, competitive intelligence, and market context.",
    ["git", "github", "web-research", "research-lab", "public-data"],
  ),
  "tarigha-financial-calculator": keepSkill(
    "financial-calculator",
    "Financial Calculator",
    "Calculate runway, pricing, ROI, future value, and planning metrics for business decisions.",
    ["git", "github", "finance", "planning", "requires-human-confirmation"],
  ),
  "paulpete-find-code-tasks": keepSkill(
    "code-task-inventory",
    "Code Task Inventory",
    "Find TODOs, task markers, and repository work items for engineering planning.",
    ["git", "github", "code-analysis", "planning", "engineering"],
  ),
  "lukeslp-geepers-data": keepSkill(
    "multi-source-data-fetcher",
    "Multi-Source Data Fetcher",
    "Fetch structured public data from authoritative APIs for research and reporting tasks.",
    ["git", "github", "data-processing", "research-lab", "public-data"],
  ),
  "trumppo-gh": keepSkill(
    "github-cli-automation",
    "GitHub CLI Automation",
    "Use GitHub CLI for repos, issues, pull requests, actions, releases, and reviewed collaboration workflows.",
    ["git", "github", "repos", "issues", "pull-requests", "external-account", "requires-human-confirmation"],
  ),
  "branexp-gh-action-gen": keepSkill(
    "github-actions-generator",
    "GitHub Actions Generator",
    "Generate GitHub Actions workflow drafts for CI, release, and automation pipelines.",
    ["git", "github", "ci", "automation", "requires-human-confirmation"],
  ),
  "guoqiao-gh-extract": keepSkill(
    "github-content-extractor",
    "GitHub Content Extractor",
    "Extract repository, issue, pull request, and file content from GitHub URLs for agent context.",
    ["git", "github", "repo-research", "code-analysis"],
  ),
  "fratua-git-changelog": keepSkill(
    "changelog-generator",
    "Changelog Generator",
    "Generate release changelogs from git history and conventional commit patterns.",
    ["git", "github", "release", "documentation"],
  ),
  "arnarsson-git-essentials": keepSkill(
    "git-essentials",
    "Git Essentials",
    "Run common Git workflows with status and diff-first guardrails for engineering agents.",
    ["git", "repos", "engineering", "host-mutation", "requires-human-confirmation"],
  ),
  "corezip-git-sentinel": keepSkill(
    "git-security-sentinel",
    "Git Security Sentinel",
    "Review repositories and diffs as a senior engineering and security auditor.",
    ["git", "github", "security", "code-review", "agent-safety"],
  ),
  "zweack-git-summary": keepSkill(
    "repository-summary",
    "Repository Summary",
    "Summarize repository status, branches, recent commits, and current working tree context.",
    ["git", "repos", "summary", "engineering"],
  ),
  "portavion-glab-cli": keepSkill(
    "gitlab-cli-automation",
    "GitLab CLI Automation",
    "Operate GitLab issues, merge requests, repositories, and CI workflows through glab.",
    ["git", "gitlab", "repos", "merge-requests", "external-account", "requires-human-confirmation"],
  ),
  "riprsa-grepwrapper": keepSkill(
    "public-code-search",
    "Public Code Search",
    "Search exact code matches across public GitHub repositories using grep.app-backed workflows.",
    ["git", "github", "code-search", "repo-research", "public-data"],
  ),
  "felixondesk-guardskills": keepSkill(
    "skill-install-guard",
    "Skill Install Guard",
    "Gate skill installation by checking provenance, declared capabilities, and marketplace safety signals.",
    ["git", "github", "security", "marketplace", "approvals", "agent-safety"],
  ),
  "martok9803-martok9803-ci-whisperer": keepSkill(
    "ci-failure-analyst",
    "CI Failure Analyst",
    "Analyze GitHub Actions or CI failures and propose reviewed fixes.",
    ["git", "github", "ci", "pull-requests", "engineering"],
  ),
  "martinforsulu-neo-github-readme-generator": keepSkill(
    "github-readme-generator",
    "GitHub README Generator",
    "Generate README drafts from GitHub repository structure, APIs, and usage patterns.",
    ["git", "github", "documentation", "repos", "research-lab"],
  ),
  "nerdvana-labs-pr-risk-analyzer": keepSkill(
    "pr-risk-analyzer",
    "PR Risk Analyzer",
    "Analyze GitHub pull requests for security, quality, and merge risk before approval.",
    ["git", "github", "pull-requests", "security", "code-review", "agent-safety"],
  ),
  "autogame-17-read-optimizer": keepSkill(
    "repository-read-optimizer",
    "Repository Read Optimizer",
    "Optimize file reading strategies with head, tail, grep, and diff approaches to reduce token usage.",
    ["git", "github", "code-analysis", "cost-control", "engineering"],
  ),
  "jo9900-release-tracker": keepSkill(
    "release-tracker",
    "Release Tracker",
    "Track GitHub repository releases and generate prioritized dependency or product update summaries.",
    ["git", "github", "release", "monitoring", "public-data"],
  ),
  "patrob-repo-pr-triage": keepSkill(
    "repo-pr-triage",
    "Repo PR Triage",
    "Triage GitHub pull requests and issues with visual and structured risk signals.",
    ["git", "github", "pull-requests", "issues", "code-review"],
  ),
  "ninjagpt-skill-security-reviewer": keepSkill(
    "skill-security-reviewer",
    "Skill Security Reviewer",
    "Review marketplace skills for security threats, unsafe permissions, and suspicious behavior.",
    ["git", "github", "security", "marketplace", "agent-safety"],
  ),
  "andyxinweiminicloud-skill-update-delta-monitor": keepSkill(
    "skill-update-delta-monitor",
    "Skill Update Delta Monitor",
    "Monitor installed skills for security-relevant updates and capability changes.",
    ["git", "github", "security", "marketplace", "provenance"],
  ),
  "heldinhow-super-github": keepSkill(
    "super-github",
    "Super GitHub",
    "Use a combined GitHub automation framework for issues, pull requests, releases, and repository workflows.",
    ["git", "github", "issues", "pull-requests", "release", "external-account", "requires-human-confirmation"],
  ),
  "anikgnr-task-development-workflow": keepSkill(
    "task-development-workflow",
    "Task Development Workflow",
    "Run TDD-first development workflows with structured planning, tasks, and PR-based review.",
    ["git", "github", "planning", "pull-requests", "engineering", "qa"],
  ),
  "anikgnr-task-review-workflow": keepSkill(
    "task-review-workflow",
    "Task Review Workflow",
    "Run standard PR review and merge-readiness workflows for task-driven development.",
    ["git", "github", "pull-requests", "code-review", "engineering"],
  ),
  "andyxinweiminicloud-trust-decay-monitor": keepSkill(
    "trust-decay-monitor",
    "Trust Decay Monitor",
    "Track how marketplace skill verification results decay over time and require re-review.",
    ["git", "github", "security", "marketplace", "provenance"],
  ),
  "andyxinweiminicloud-update-signature-verifier": keepSkill(
    "update-signature-verifier",
    "Update Signature Verifier",
    "Verify cryptographic signatures for marketplace skill updates before acceptance.",
    ["git", "github", "security", "marketplace", "provenance"],
  ),
  "semmyt-upstream-recon": keepSkill(
    "upstream-recon",
    "Upstream Recon",
    "Investigate open-source projects before PRs, issues, imports, or dependency decisions.",
    ["git", "github", "repo-research", "open-source", "research-lab"],
  ),
  "robinoppenstam-vigil": keepSkill(
    "vigil-agent-guardrails",
    "Vigil Agent Guardrails",
    "Apply safety guardrails around tool calls and risky agent actions.",
    ["git", "github", "security", "agent-safety", "approvals"],
  ),
  "yting27-global-holidays": keepSkill(
    "global-holiday-calendar",
    "Global Holiday Calendar",
    "Check public holidays for scheduling, support coverage, launches, and campaign planning.",
    ["git", "github", "calendar", "planning", "public-data"],
  ),
  "vmining-kiro-creator-monitor-daily-brief": keepSkill(
    "creator-signal-brief",
    "Creator Signal Brief",
    "Monitor creator topics across X, RSS, GitHub, and Reddit to produce ranked daily research briefs.",
    ["git", "github", "market-research", "marketing", "reporting"],
  ),
  "cameron-jovan-landing-page-converter": keepSkill(
    "landing-page-builder",
    "Landing Page Builder",
    "Draft conversion-focused landing pages and product sales pages for reviewed growth workflows.",
    ["git", "github", "marketing", "copywriting", "requires-human-confirmation"],
  ),
  "xammarie-landing-page-roast": keepSkill(
    "landing-page-audit",
    "Landing Page Audit",
    "Audit landing pages for clarity, trust, offer strength, and conversion friction.",
    ["git", "github", "marketing", "copywriting", "review"],
  ),
  "tianxingleo-md2pdf-converter": keepSkill(
    "markdown-to-pdf-exporter",
    "Markdown to PDF Exporter",
    "Convert Markdown reports, specs, and proposals into polished PDF artifacts.",
    ["git", "github", "documents", "reporting", "host-mutation"],
  ),
  "jk-0001-mvp-planning": keepSkill(
    "mvp-planner",
    "MVP Planner",
    "Plan and scope minimum viable products into reviewable strategy and execution outputs.",
    ["git", "github", "planning", "strategy", "board-inbox"],
  ),
  "tsukisama9292-office-document-editor": keepSkill(
    "office-document-editor",
    "Office Document Editor",
    "Edit DOCX and PPTX artifacts with tracked changes, formatting preservation, and reviewed document workflows.",
    ["git", "github", "documents", "reporting", "sensitive-personal-data"],
  ),
  "jk-0001-positioning-strategy": keepSkill(
    "positioning-strategist",
    "Positioning Strategist",
    "Develop competitive positioning strategy for products, companies, and launches.",
    ["git", "github", "strategy", "marketing", "board-inbox"],
  ),
  "bamontejano-skill-doctorbot-ci-validator": keepSkill(
    "skill-ci-validator",
    "Skill CI Validator",
    "Validate skill packaging and CI readiness before marketplace publishing or install approval.",
    ["git", "github", "ci", "marketplace", "qa"],
  ),
  "g9pedro-skillbench": keepSkill(
    "skillbench",
    "SkillBench",
    "Track skill versions, benchmark performance, and compare improvement signals for marketplace operations.",
    ["git", "github", "marketplace", "benchmarking", "reporting"],
  ),
  "ryudi84-sovereign-changelog-maker": keepSkill(
    "sovereign-changelog-maker",
    "Sovereign Changelog Maker",
    "Generate structured changelogs from git history for release and board review.",
    ["git", "github", "release", "documentation"],
  ),
  "ryudi84-sovereign-commit-craft": keepSkill(
    "sovereign-commit-craft",
    "Sovereign Commit Craft",
    "Draft high-quality Git commit messages from reviewed changes.",
    ["git", "commits", "engineering", "documentation"],
  ),
  "ryudi84-sovereign-git-commit-analyzer": keepSkill(
    "sovereign-git-commit-analyzer",
    "Sovereign Git Commit Analyzer",
    "Analyze git commit history into detailed engineering and delivery reports.",
    ["git", "github", "commit-analysis", "reporting", "engineering"],
  ),
  "globalcaos-ultimate-fork-and-skill-scanner": keepSkill(
    "ultimate-fork-and-skill-scanner",
    "Ultimate Fork and Skill Scanner",
    "Scan GitHub forks and skill ecosystems for useful changes, innovations, and supply-chain signals.",
    ["git", "github", "repo-research", "marketplace", "public-data"],
  ),
};



const GAMING_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "tippyentertainment-android-3d-developer": keepSkill(
    "android-3d-game-developer",
    "Android 3D Game Developer",
    "Build and optimize Android 3D games or interactive experiences inside Research Lab and game-studio workspaces.",
    ["gaming", "game-development", "android", "3d", "research-lab", "host-mutation"],
  ),
  "krisclarkdev-dakboard": keepSkill(
    "dakboard-display-manager",
    "DAKboard Display Manager",
    "Manage DAKboard screens, devices, and status displays for office operations, monitoring, and company dashboards.",
    ["gaming", "dashboard", "operations", "external-account", "requires-human-confirmation"],
  ),
  "kjaylee-sprite-sheet": keepSkill(
    "sprite-sheet-optimizer",
    "Sprite Sheet Optimizer",
    "Optimize sprite sheets and game assets for game studios, interactive product teams, and Research Lab prototypes.",
    ["gaming", "game-development", "assets", "research-lab", "host-mutation"],
  ),
};



const DEVOPS_AND_CLOUD_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "tkuehnl-agentic-devops": keepSkill(
    "agentic-devops-toolkit",
    "Agentic DevOps Toolkit",
    "Run Docker, process, log, and health checks for approved service operations.",
    ["devops", "docker", "logs", "monitoring", "host-mutation", "requires-human-confirmation"],
  ),
  "botond-rackhost-ansible-skill": keepSkill(
    "ansible-infrastructure-automation",
    "Ansible Infrastructure Automation",
    "Automate server configuration and repeatable infrastructure changes with Ansible playbooks.",
    ["devops", "ansible", "infrastructure", "host-mutation", "requires-human-confirmation"],
  ),
  "briancolinger-aws-ecs-monitor": keepSkill(
    "aws-ecs-health-monitor",
    "AWS ECS Health Monitor",
    "Monitor ECS services, tasks, deployments, and CloudWatch signals for production health and incident triage.",
    ["devops", "aws", "ecs", "cloudwatch", "monitoring", "observability", "external-account"],
  ),
  "bmdhodl-aws-infra": keepSkill(
    "aws-infrastructure-assistant",
    "AWS Infrastructure Assistant",
    "Inspect and operate AWS infrastructure through approved CLI or console workflows.",
    ["devops", "aws", "cloud", "infrastructure", "external-account", "host-mutation", "requires-human-confirmation"],
  ),
  "spclaudehome-aws-security-scanner": keepSkill(
    "aws-security-scanner",
    "AWS Security Scanner",
    "Review AWS account security posture and produce findings for CTO and security approval workflows.",
    ["devops", "aws", "security", "scanner", "external-account", "requires-human-confirmation"],
  ),
  "hypertextassassinrajith-awscli": keepSkill(
    "aws-cli-operations",
    "AWS CLI Operations",
    "Manage EC2 and Lightsail resources through AWS CLI under board-approved access.",
    ["devops", "aws", "ec2", "lightsail", "cloud", "external-account", "host-mutation", "requires-human-confirmation"],
  ),
  "thegovind-azd-deployment": keepSkill(
    "azure-container-apps-deploy",
    "Azure Container Apps Deploy",
    "Deploy containerized applications to Azure Container Apps using azd.",
    ["devops", "azure", "containers", "deployment", "external-account", "host-mutation", "requires-human-confirmation"],
  ),
  "ddevaal-azure-cli": keepSkill(
    "azure-cli-operations",
    "Azure CLI Operations",
    "Operate Azure resources through Azure CLI with scoped credentials.",
    ["devops", "azure", "cloud", "infrastructure", "external-account", "host-mutation", "requires-human-confirmation"],
  ),
  "bmdhodl-azure-infra": keepSkill(
    "azure-infrastructure-assistant",
    "Azure Infrastructure Assistant",
    "Inspect and manage Azure infrastructure through approved CLI or portal workflows.",
    ["devops", "azure", "cloud", "infrastructure", "external-account", "host-mutation", "requires-human-confirmation"],
  ),
  "rexlunae-cf-manager": keepSkill(
    "cloudflare-manager",
    "Cloudflare Manager",
    "Manage Cloudflare DNS, SSL/TLS, caching, firewall rules, page rules, and Workers through approved workflows.",
    ["devops", "cloudflare", "dns", "firewall", "external-account", "host-mutation", "requires-human-confirmation"],
  ),
  "vince-winkintel-checkly-cli-skills": keepSkill(
    "checkly-monitoring-as-code",
    "Checkly Monitoring as Code",
    "Create, inspect, and maintain Checkly synthetic checks for uptime, API, browser, and reliability workflows.",
    ["devops", "monitoring", "synthetic-checks", "qa", "external-account", "requires-human-confirmation"],
  ),
  "runeweaverstudios-docker-skill": keepSkill(
    "docker-operations",
    "Docker Operations",
    "Install, inspect, build, and run Docker workloads using official Docker guidance.",
    ["devops", "docker", "containers", "host-mutation", "requires-human-confirmation"],
  ),
  "awsome-o-grafana-lens": keepSkill(
    "grafana-observability-lens",
    "Grafana Observability Lens",
    "Query Grafana dashboards, metrics, alerts, traces, and panels for incident diagnosis and board-ready status summaries.",
    ["devops", "grafana", "observability", "dashboards", "incidents", "external-account"],
  ),
  "jpj069-hcloud": keepSkill(
    "hetzner-cloud-operations",
    "Hetzner Cloud Operations",
    "Manage Hetzner Cloud servers and infrastructure using the hcloud CLI.",
    ["devops", "hetzner", "cloud", "infrastructure", "external-account", "host-mutation", "requires-human-confirmation"],
  ),
  "florianbeer-laravel-forge": keepSkill(
    "laravel-forge-operations",
    "Laravel Forge Operations",
    "Manage Forge servers, sites, deployments, databases, and integrations through the Forge API.",
    ["devops", "laravel-forge", "deployment", "servers", "external-account", "host-mutation", "requires-human-confirmation"],
  ),
  "tkuehnl-log-dive": keepSkill(
    "log-dive",
    "Log Dive",
    "Search and summarize logs across Loki, Elasticsearch, and CloudWatch for debugging, incident review, and reliability reports.",
    ["devops", "logs", "observability", "incidents", "cloudwatch", "external-account", "sensitive-personal-data"],
  ),
  "imaxtomas-mcp-ssh-manager": keepSkill(
    "mcp-ssh-manager",
    "MCP SSH Manager",
    "Run reviewed SSH sessions and file transfers for approved infrastructure tasks.",
    ["devops", "mcp", "ssh", "infrastructure", "external-account", "host-mutation", "requires-human-confirmation"],
  ),
  "martinforsulu-neo-docker-to-k8s-manifests": keepSkill(
    "docker-to-kubernetes-manifests",
    "Docker to Kubernetes Manifests",
    "Generate Kubernetes manifests from Dockerfile and Compose inputs for review.",
    ["devops", "kubernetes", "docker", "containers", "deployment", "artifact", "requires-human-confirmation"],
  ),
  "martinforsulu-neo-tf-module-generator": keepSkill(
    "terraform-module-generator",
    "Terraform Module Generator",
    "Draft Terraform modules from existing infrastructure resources for review.",
    ["devops", "terraform", "infrastructure-as-code", "cloud", "artifact", "requires-human-confirmation"],
  ),
  "dbanys-railway-deploy": keepSkill(
    "railway-deployment",
    "Railway Deployment",
    "Deploy approved applications to Railway from project code.",
    ["devops", "railway", "deployment", "external-account", "host-mutation", "requires-human-confirmation"],
  ),
  "andrewharp-runpod": keepSkill(
    "runpod-gpu-operations",
    "RunPod GPU Operations",
    "Create, start, stop, and connect to RunPod GPU cloud instances.",
    ["devops", "runpod", "gpu", "cloud", "ssh", "external-account", "financial-action", "host-mutation", "requires-human-confirmation"],
  ),
  "tkuehnl-tf-plan-review": keepSkill(
    "terraform-plan-review",
    "Terraform Plan Review",
    "Analyze Terraform plans for infrastructure risk before apply.",
    ["devops", "terraform", "infrastructure", "security", "qa", "requires-human-confirmation"],
  ),
  "gblockchainnetwork-vps-health-auditor": keepSkill(
    "vps-health-auditor",
    "VPS Health Auditor",
    "Run server diagnostics across CPU, memory, disk, network, services, and uptime for reliability reviews.",
    ["devops", "diagnostics", "server-health", "self-hosting", "host-mutation", "requires-human-confirmation"],
  ),
  "nantes-agent-metrics-osiris": keepSkill(
    "agent-metrics-osiris",
    "Agent Metrics",
    "Track agent calls, errors, latency, and operational metrics for PaperClaw platform teams.",
    ["devops", "agent-ops", "observability", "metrics", "latency", "reporting"],
  ),
  "trypto1019-arc-skill-health-monitor": keepSkill(
    "arc-skill-health-monitor",
    "ARC Skill Health Monitor",
    "Monitor deployed skills for drift, errors, and behavior changes.",
    ["devops", "marketplace", "skills", "observability", "agent-safety"],
  ),
  "yanick112-mcp-server-discovery": keepSkill(
    "mcp-server-discovery",
    "MCP Server Discovery",
    "Discover and evaluate MCP servers before installing them into company toolchains.",
    ["devops", "mcp", "marketplace", "tooling", "research-lab"],
  ),
  "buddhasource-filesystem-mcp": keepSkill(
    "filesystem-mcp",
    "Filesystem MCP",
    "Provide controlled filesystem operations through configurable MCP access rules.",
    ["devops", "mcp", "filesystem", "host-mutation", "security", "requires-human-confirmation"],
  ),
  "minduploadedcrab-platform-healthcheck": keepSkill(
    "agent-platform-healthcheck",
    "Agent Platform Healthcheck",
    "Check agent platform APIs and service readiness for operators.",
    ["devops", "platform", "healthcheck", "observability", "agent-ops"],
  ),
  "mariusfit-service-watchdog": keepSkill(
    "service-watchdog",
    "Service Watchdog",
    "Monitor self-hosted services and endpoints, detect downtime, and prepare recovery notes for operations agents.",
    ["devops", "monitoring", "reliability", "self-hosting", "external-account"],
  ),
  "sanjay-gthb-server-health-agent": keepSkill(
    "server-health-monitor",
    "Server Health Monitor",
    "Monitor VPS CPU, memory, disk, Docker, and process health for self-hosted infrastructure diagnostics.",
    ["devops", "server-health", "monitoring", "self-hosting", "host-mutation", "requires-human-confirmation"],
  ),
  "brennerspear-system-watchdog": keepSkill(
    "system-watchdog",
    "System Watchdog",
    "Detect suspicious or wasteful local processes and resource pressure on self-hosted agent machines.",
    ["devops", "monitoring", "security", "self-hosting", "host-mutation", "requires-human-confirmation"],
  ),
  "vittor1o-rollbar": keepSkill(
    "rollbar-error-triage",
    "Rollbar Error Triage",
    "Monitor Rollbar errors, releases, and occurrence trends so engineering agents can triage production issues.",
    ["devops", "rollbar", "errors", "incidents", "observability", "external-account"],
  ),
  "1999azzar-newman": keepSkill(
    "newman-api-test-runner",
    "Newman API Test Runner",
    "Run Postman collections for API regression checks and release validation.",
    ["devops", "api", "qa", "testing"],
  ),
  "suhteevah-depguard": keepSkill(
    "dependency-security-audit",
    "Dependency Security Audit",
    "Audit dependencies for vulnerabilities, license risk, and release-blocking supply-chain issues.",
    ["devops", "security", "dependencies", "qa", "research-lab"],
  ),
  "sanguineseal-aegis-audit": keepSkill(
    "agent-skill-behavior-audit",
    "Agent Skill Behavior Audit",
    "Audit AI-agent skills and MCP tools for behavioral risk before marketplace approval or sensitive assignment.",
    ["devops", "security", "marketplace", "mcp", "agent-safety", "requires-human-confirmation"],
  ),
  "mastergear4824-aiclude-security-scan": keepSkill(
    "aiclude-security-scan",
    "AICLUDE Security Scan",
    "Scan MCP servers and AI-agent skills for security vulnerabilities before install or publication.",
    ["devops", "security", "marketplace", "mcp", "install-safety", "requires-human-confirmation"],
  ),
  "mastergear4824-aiclude-vulns-scan": keepSkill(
    "aiclude-vulnerability-lookup",
    "AICLUDE Vulnerability Lookup",
    "Search known vulnerability scan results for MCP servers and skills during marketplace review.",
    ["devops", "security", "marketplace", "mcp", "public-data"],
  ),
  "brandonwise-secrets-management": keepSkill(
    "secrets-management-playbook",
    "Secrets Management Playbook",
    "Guide CI/CD and infrastructure secrets management using Vault, AWS Secrets Manager, and platform-native stores.",
    ["devops", "security", "secrets", "ci-cd", "external-account", "requires-human-confirmation"],
  ),
  "twhidden-twhidden-bitwarden": keepSkill(
    "bitwarden-vaultwarden-manager",
    "Bitwarden/Vaultwarden Manager",
    "Use Bitwarden or Vaultwarden for approved credential lookup and secret-management workflows.",
    ["devops", "security", "secrets", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "moodykong-ssh-op": keepSkill(
    "onepassword-ssh-agent",
    "1Password SSH Agent",
    "Load SSH keys from 1Password into an in-memory agent for approved infrastructure access.",
    ["devops", "security", "ssh", "external-account", "host-mutation", "requires-human-confirmation"],
  ),
  "transcendenceia-opnsense-admin": keepSkill(
    "opnsense-admin",
    "OPNsense Admin",
    "Manage OPNsense firewall, DNS, IDS/IPS, and network settings with explicit production-change gates.",
    ["devops", "networking", "firewall", "security", "external-account", "host-mutation", "requires-human-confirmation"],
  ),
  "ryudi84-sovereign-api-hardener": keepSkill(
    "api-hardener",
    "API Hardener",
    "Review and harden API endpoints against common attacks before production handoff.",
    ["devops", "security", "api", "qa", "research-lab"],
  ),
  "ryudi84-sovereign-aws-cost-optimizer": keepSkill(
    "aws-cost-optimizer",
    "AWS Cost Optimizer",
    "Analyze AWS infrastructure for cost savings before operators approve budget-impacting changes.",
    ["devops", "aws", "cost-control", "cloud", "external-account", "requires-human-confirmation"],
  ),
  "ryudi84-sovereign-project-guardian": keepSkill(
    "project-health-guardian",
    "Project Health Guardian",
    "Review project health, best practices, and release readiness for engineering and Research Lab work.",
    ["devops", "project-health", "qa", "research-lab"],
  ),
};



const HEALTH_AND_FITNESS_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "filipe-m-almeida-health-sync": keepSkill(
    "wearable-health-data-sync",
    "Wearable Health Data Sync",
    "Analyze synced Oura, Withings, Hevy, Strava, WHOOP, and Eight Sleep data for approved wellness reporting and quantified-self workflows.",
    ["health-data", "wearables", "oura", "withings", "strava", "whoop", "sleep", "workouts", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "mjrussell-fitbit": keepSkill(
    "fitbit-health-analytics",
    "Fitbit Health Analytics",
    "Query Fitbit sleep, heart-rate, activity, and SpO2 data for trend summaries and personal performance reports.",
    ["fitbit", "fitness", "sleep", "heart-rate", "activity", "spo2", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "kesslerio-fitbit-analytics": keepSkill(
    "fitbit-analytics",
    "Fitbit Analytics",
    "Analyze Fitbit health and fitness metrics for recurring wellness summaries and approved personal analytics workflows.",
    ["fitbit", "fitness", "sleep", "heart-rate", "activity", "analytics", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "voydz-garmin-cli": keepSkill(
    "garmin-fitness-cli",
    "Garmin Fitness CLI",
    "Access Garmin Connect activity and fitness data through a non-interactive CLI for training summaries and trend checks.",
    ["garmin", "fitness", "workouts", "training", "heart-rate", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "eversonl-garmin-health-analysis": keepSkill(
    "garmin-health-analysis",
    "Garmin Health Analysis",
    "Summarize Garmin activity, health, and training data in natural language for approved fitness analytics agents.",
    ["garmin", "fitness", "workouts", "training", "heart-rate", "analytics", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "kesslerio-oura-analytics": keepSkill(
    "oura-recovery-analytics",
    "Oura Recovery Analytics",
    "Review Oura sleep, readiness, and recovery metrics for personal trend reporting without making medical claims.",
    ["oura", "sleep", "recovery", "readiness", "wearables", "analytics", "external-account", "sensitive-personal-data", "not-medical-advice"],
  ),
  "mjrussell-hevy": keepSkill(
    "hevy-workout-analytics",
    "Hevy Workout Analytics",
    "Query Hevy workouts, routines, and exercise logs for strength-training progress summaries.",
    ["hevy", "fitness", "workouts", "strength-training", "external-account", "sensitive-personal-data"],
  ),
  "pseuss-intervals-icu-api": keepSkill(
    "intervals-icu-training-analytics",
    "Intervals.icu Training Analytics",
    "Access and summarize Intervals.icu training data for cycling, endurance, and performance review workflows.",
    ["intervals-icu", "fitness", "training", "cycling", "endurance", "external-account", "sensitive-personal-data"],
  ),
  "yusaku-0426-health-summary": keepSkill(
    "health-summary-reports",
    "Health Summary Reports",
    "Generate daily, weekly, and monthly wellness reports with nutrition totals, target comparisons, and trends.",
    ["wellness", "nutrition", "health-data", "reporting", "trends", "sensitive-personal-data", "not-medical-advice"],
  ),
  "moclippa-gevety": keepSkill(
    "biomarker-trend-reporter",
    "Biomarker Trend Reporter",
    "Summarize Gevety biomarkers, healthspan scores, and biological-age trends for reviewed personal analytics workflows.",
    ["biomarkers", "healthspan", "analytics", "external-account", "sensitive-personal-data", "requires-human-confirmation", "not-medical-advice"],
  ),
  "alirezarezvani-capa-officer": keepSkill(
    "medical-device-capa-officer",
    "Medical Device CAPA Officer",
    "Assist medical-device QMS teams with CAPA workflow organization, audit trails, and reviewed compliance documentation.",
    ["qms", "medical-device", "capa", "compliance", "regulated-workflow", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "jayhickey-huckleberry": keepSkill(
    "baby-care-log-reporter",
    "Baby Care Log Reporter",
    "Summarize Huckleberry baby sleep, feeding, diaper, and growth logs for explicitly approved family-assistant workflows.",
    ["baby-care", "sleep", "feeding", "growth", "child-data", "external-account", "sensitive-personal-data", "requires-human-confirmation", "not-medical-advice"],
  ),
  "alexpolonsky-maccabi-pharm-search": keepSkill(
    "maccabi-pharmacy-stock-checker",
    "Maccabi Pharmacy Stock Checker",
    "Check Maccabi pharmacy medication availability in Israel for read-only availability planning with human review.",
    ["pharmacy", "medication-availability", "israel", "external-account", "sensitive-personal-data", "requires-human-confirmation", "not-medical-advice"],
  ),
};



const IMAGE_VIDEO_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "flyingnobita-acorn-prover": keepSkill(
    "formal-proof-verifier",
    "Formal Proof Verifier",
    "Verify mathematical, cryptographic, and specification proofs before engineering agents rely on them in Research Lab work.",
    ["image-video", "formal-methods", "security", "research-lab", "qa"],
  ),
  "adebayoabdushaheed-a11y-afame": keepSkill(
    "openai-illustration-generator",
    "OpenAI Illustration Generator",
    "Generate campaign, report, and product illustrations through OpenAI Images with PaperClaw cost and approval controls.",
    ["image-video", "image-generation", "creative-assets", "marketing", "external-account", "requires-human-confirmation"],
  ),
  "rhanbourinajd-ai-video-gen": keepSkill(
    "text-to-video-generator",
    "Text-to-Video Generator",
    "Create short videos from text briefs for launch assets, product demos, ads, and social campaigns.",
    ["image-video", "video-generation", "creative-assets", "marketing", "external-account", "requires-human-confirmation"],
  ),
  "seanphan-algorithmic-art": keepSkill(
    "algorithmic-art-studio",
    "Algorithmic Art Studio",
    "Create deterministic p5.js visuals and seeded generative artwork for brand, docs, and experimental creative systems.",
    ["image-video", "generative-art", "design", "research-lab", "local-artifact"],
  ),
  "ustc-yxw-ascii-art-generator": keepSkill(
    "ascii-art-generator",
    "ASCII Art Generator",
    "Create text-based visuals, diagrams, and lightweight terminal-friendly graphics for docs and technical explanations.",
    ["image-video", "ascii-art", "documentation", "diagrams", "local-artifact"],
  ),
  "cad-agent": keepSkill(
    "cad-rendering-agent",
    "CAD Rendering Agent",
    "Render CAD artifacts for product, hardware, and engineering agents working in isolated Research Lab project folders.",
    ["image-video", "cad", "engineering", "rendering", "research-lab", "host-mutation", "requires-human-confirmation"],
  ),
  "coolmanns-canva-connect": keepSkill(
    "canva-design-manager",
    "Canva Design Manager",
    "Manage Canva designs, assets, folders, and exports for approved brand, marketing, and social production workflows.",
    ["image-video", "design", "brand", "marketing", "external-account", "requires-human-confirmation"],
  ),
  "therohitdas-captions": keepSkill(
    "youtube-caption-extractor",
    "YouTube Caption Extractor",
    "Extract YouTube captions and subtitles for research, repurposing, competitive analysis, and sourced content summaries.",
    ["image-video", "captions", "transcription", "research-lab", "knowledge-base", "public-data"],
  ),
  "dannyshmueli-chart-image": keepSkill(
    "chart-image-generator",
    "Chart Image Generator",
    "Generate publication-quality chart images from data for board reports, dashboards, and client deliverables.",
    ["image-video", "charts", "visualization", "analytics", "reporting"],
  ),
  "autogame-17-checksum": keepSkill(
    "checksum-verifier",
    "Checksum Verifier",
    "Generate and verify file checksums so agents can prove artifact integrity before sharing or installing outputs.",
    ["image-video", "files", "security", "qa", "local-artifact"],
  ),
  "qrost-color-palette": keepSkill(
    "image-color-palette",
    "Image Color Palette Extractor",
    "Extract HEX/RGB palettes and optional swatches from images for brand audits and design-system work.",
    ["image-video", "images", "brand", "design", "local-artifact"],
  ),
  "xtopher86-comfyui-request": keepSkill(
    "comfyui-workflow-runner",
    "ComfyUI Workflow Runner",
    "Run approved local ComfyUI workflows and return generated image artifacts for self-hosted creative production.",
    ["image-video", "image-generation", "comfyui", "local-ai", "host-mutation", "requires-human-confirmation"],
  ),
  "ianalloway-data-viz": keepSkill(
    "data-visualization-cli",
    "Data Visualization CLI",
    "Create charts and visual analysis artifacts from command-line data workflows for analyst and Research Lab agents.",
    ["image-video", "visualization", "analytics", "reporting", "research-lab"],
  ),
  "qrost-dxf-to-image": keepSkill(
    "dxf-preview-export",
    "DXF Preview Export",
    "Convert DXF files to preview images so hardware, CAD, and product agents can share engineering artifacts.",
    ["image-video", "cad", "conversion", "engineering", "local-artifact"],
  ),
  "eftalyurtseven-eachlabs-image-generation": keepSkill(
    "eachlabs-image-generator",
    "EachLabs Image Generator",
    "Generate images with approved EachLabs models for ads, thumbnails, product visuals, and campaign drafts.",
    ["image-video", "image-generation", "creative-assets", "external-account", "requires-human-confirmation"],
  ),
  "swiftlysingh-excalidraw-flowchart": keepSkill(
    "excalidraw-flowcharts",
    "Excalidraw Flowcharts",
    "Turn architecture, process, and meeting descriptions into Excalidraw diagrams for planning and handoff artifacts.",
    ["image-video", "diagrams", "planning", "documentation", "research-lab"],
  ),
  "agmmnn-fal-ai": keepSkill(
    "fal-media-models",
    "fal.ai Media Models",
    "Use fal.ai image, video, and audio models as an approved provider for creative production and media experiments.",
    ["image-video", "image-generation", "video-generation", "audio", "external-account", "requires-human-confirmation"],
  ),
  "mahmoudadelbghany-ffmpeg-video-editor": keepSkill(
    "ffmpeg-video-editor",
    "FFmpeg Video Editor",
    "Generate reviewable FFmpeg editing commands for trimming, subtitles, BGM, compression, and social video exports.",
    ["image-video", "video-editing", "ffmpeg", "local-artifact", "host-mutation", "requires-human-confirmation"],
  ),
  "maddiedreese-figma": keepSkill(
    "figma-design-export",
    "Figma Design Export",
    "Analyze Figma designs and export assets for product, marketing, and design review workflows.",
    ["image-video", "figma", "design", "product", "external-account", "requires-human-confirmation"],
  ),
  "stopmoclay-gamma": keepSkill(
    "gamma-presentations",
    "Gamma Presentations",
    "Generate presentations, documents, and social posts from structured briefs for board and campaign deliverables.",
    ["image-video", "presentations", "documents", "marketing", "external-account", "requires-human-confirmation"],
  ),
  "wells1137-image-gen": keepSkill(
    "multi-model-image-generator",
    "Multi-Model Image Generator",
    "Generate images through multiple approved models while preserving task traceability and output review.",
    ["image-video", "image-generation", "creative-assets", "external-account", "requires-human-confirmation"],
  ),
  "pr1vateer-image-magik-resize": keepSkill(
    "imagemagick-resize",
    "ImageMagick Resize",
    "Resize and prepare image assets locally for docs, websites, marketplace previews, and social channels.",
    ["image-video", "images", "conversion", "local-artifact"],
  ),
  "ima-knowledge-ai": keepSkill(
    "creative-production-briefs",
    "Creative Production Briefs",
    "Create structured production briefs for image, video, and audio work before agents generate final assets.",
    ["image-video", "creative-brief", "planning", "marketing", "research-lab"],
  ),
  "psyduckler-instagram-photo-text-overlay": keepSkill(
    "instagram-text-overlay",
    "Instagram Text Overlay",
    "Add reviewed text overlays to photos for Instagram-style marketing assets and campaign drafts.",
    ["image-video", "social-media", "images", "marketing", "requires-human-confirmation"],
  ),
  "andyxinweiminicloud-install-then-update-trap-detector": keepSkill(
    "skill-supply-chain-trap-detector",
    "Skill Supply Chain Trap Detector",
    "Detect install-then-update attack patterns before PaperClaw installs third-party skills into a company.",
    ["image-video", "security", "marketplace", "install-safety", "agent-safety"],
  ),
  "kai-tw-kai-tw-figma": keepSkill(
    "figma-api-design-export",
    "Figma API Design Export",
    "Read Figma files, export layers and components, and retrieve comments for approved design automation.",
    ["image-video", "figma", "design", "product", "external-account", "requires-human-confirmation"],
  ),
  "alvinecarn-media-writing": keepSkill(
    "media-writing-assistant",
    "Media Writing Assistant",
    "Draft media copy, creative direction, and production notes for campaigns, visuals, and video concepts.",
    ["image-video", "media-writing", "marketing", "creative-brief", "requires-human-confirmation"],
  ),
  "parasharnagle-mindmap-generator": keepSkill(
    "mindmap-generator",
    "Mindmap Generator",
    "Generate visual mindmaps from conversations, goals, decisions, and project planning notes.",
    ["image-video", "diagrams", "planning", "knowledge-base", "research-lab"],
  ),
  "tompltw-nk-images-search": keepSkill(
    "ai-stock-photo-search",
    "AI Stock Photo Search",
    "Search free high-quality AI stock photos for presentations, website drafts, and campaign inspiration.",
    ["image-video", "image-search", "stock-photos", "marketing", "public-data"],
  ),
  "roamerxv-ocr-python": keepSkill(
    "local-ocr",
    "Local OCR",
    "Extract text from PDFs and images locally for document intake, research, and searchable company memory.",
    ["image-video", "ocr", "documents", "knowledge-base", "sensitive-personal-data"],
  ),
  "g9pedro-openai-image-cli": keepSkill(
    "openai-image-cli",
    "OpenAI Image CLI",
    "Generate, edit, and manage images through OpenAI models for approved creative and marketing agents.",
    ["image-video", "image-generation", "openai", "creative-assets", "external-account", "requires-human-confirmation"],
  ),
  "aklo360-opengfx": keepSkill(
    "brand-graphics-studio",
    "Brand Graphics Studio",
    "Create logo systems, mascots, social assets, and on-brand campaign graphics for PaperClaw company teams.",
    ["image-video", "brand", "design", "marketing", "external-account", "requires-human-confirmation"],
  ),
  "topdu-openocr-skill": keepSkill(
    "openocr-text-extraction",
    "OpenOCR Text Extraction",
    "Extract text from images, documents, and scanned PDFs using OpenOCR for document-processing agents.",
    ["image-video", "ocr", "documents", "external-account", "sensitive-personal-data"],
  ),
  "hiotec-paddleocr-doc-parsing-v2": keepSkill(
    "paddleocr-document-parsing",
    "PaddleOCR Document Parsing",
    "Parse scanned documents and images into structured text for research, operations, and knowledge-base workflows.",
    ["image-video", "ocr", "documents", "external-account", "sensitive-personal-data"],
  ),
  "pfrederiksen-photo-captions": keepSkill(
    "photo-caption-writer",
    "Photo Caption Writer",
    "Generate platform-tuned captions for photography, campaigns, and social media drafts.",
    ["image-video", "captions", "social-media", "marketing", "requires-human-confirmation"],
  ),
  "mattvalenta-pls-office-docs": keepSkill(
    "office-document-generator",
    "Office Document Generator",
    "Generate and manipulate professional PDF, DOCX, XLSX, and PPTX artifacts for reports and presentations.",
    ["image-video", "documents", "presentations", "reporting", "sensitive-personal-data"],
  ),
  "claudiodrusus-qr-gen": keepSkill(
    "qr-code-generator",
    "QR Code Generator",
    "Generate QR codes for reviewed links, vCards, WiFi credentials, events, packaging, and campaign collateral.",
    ["image-video", "qr-codes", "marketing", "local-artifact", "requires-human-confirmation"],
  ),
  "skywork-design": keepSkill(
    "skywork-design-studio",
    "Skywork Design Studio",
    "Generate and edit posters, logos, and marketing images through Skywork Image for approved design briefs.",
    ["image-video", "image-generation", "design", "marketing", "external-account", "requires-human-confirmation"],
  ),
  "beameasy-snapog": keepSkill(
    "snapog-social-cards",
    "SnapOG Social Cards",
    "Generate social images and OG cards from professional templates for launches, docs, and campaign links.",
    ["image-video", "social-cards", "marketing", "templates", "external-account", "requires-human-confirmation"],
  ),
  "awlevin-sprite-animator": keepSkill(
    "sprite-animator",
    "Sprite Animator",
    "Generate animated pixel-art sprites from images for game prototypes, demos, and creative Research Lab work.",
    ["image-video", "animation", "sprites", "game-development", "research-lab", "requires-human-confirmation"],
  ),
  "thetail001-subtitle-translate-skill": keepSkill(
    "subtitle-translation",
    "Subtitle Translation",
    "Translate SRT subtitle files with OpenAI-compatible LLM APIs for multilingual video localization.",
    ["image-video", "subtitles", "translation", "video-editing", "external-account", "sensitive-personal-data"],
  ),
  "qrost-svg-to-image": keepSkill(
    "svg-to-image-converter",
    "SVG to Image Converter",
    "Convert SVG assets into PNG or JPG previews for docs, websites, brand assets, and approvals.",
    ["image-video", "conversion", "svg", "images", "local-artifact"],
  ),
  "whalefell-tesseract-ocr": keepSkill(
    "tesseract-ocr",
    "Tesseract OCR",
    "Extract text from images locally with Tesseract for private document intake and Research Lab workflows.",
    ["image-video", "ocr", "documents", "local-ai", "sensitive-personal-data"],
  ),
  "underbench2-gif-ub2-csv-data-analyzer": keepSkill(
    "csv-visual-analysis",
    "CSV Visual Analysis",
    "Load, explore, analyze, and visualize CSV datasets for board reports and analytics summaries.",
    ["image-video", "csv", "visualization", "analytics", "reporting"],
  ),
  "brokenwatch24-unsplash": keepSkill(
    "unsplash-image-search",
    "Unsplash Image Search",
    "Search, browse, and download Unsplash images for approved design drafts with license attribution review.",
    ["image-video", "image-search", "stock-photos", "marketing", "external-account", "requires-human-confirmation"],
  ),
  "video-editor-ai": keepSkill(
    "ai-video-editor",
    "AI Video Editor",
    "Edit MP4 files by chat, add subtitles, BGM, and effects, then export clips for Reels, Shorts, and demos.",
    ["image-video", "video-editing", "social-media", "creative-assets", "external-account", "requires-human-confirmation"],
  ),
  "rusparrish-vtl-image-analysis": keepSkill(
    "visual-thinking-lens-analysis",
    "Visual Thinking Lens Analysis",
    "Review AI-generated images for composition, hierarchy, and visual structure before campaign or design approval.",
    ["image-video", "image-analysis", "qa", "design", "creative-review"],
  ),
  "paulgnz-xpr-creative": keepSkill(
    "creative-deliverable-tools",
    "Creative Deliverable Tools",
    "Create and organize creative deliverables for campaigns, product launches, and agent-produced media workflows.",
    ["image-video", "creative-assets", "marketing", "design", "research-lab"],
  ),
  "eftalyurtseven-youtube-thumbnail-generation": keepSkill(
    "youtube-thumbnail-generator",
    "YouTube Thumbnail Generator",
    "Generate reviewed YouTube thumbnails and campaign variants for content, media, and growth teams.",
    ["image-video", "thumbnails", "marketing", "image-generation", "external-account", "requires-human-confirmation"],
  ),
  "otacu-zerox": keepSkill(
    "zerox-document-to-markdown",
    "Zerox Document to Markdown",
    "Convert PDFs, DOCX, PPTX, and image documents into Markdown for searchable PaperClaw knowledge intake.",
    ["image-video", "documents", "ocr", "knowledge-base", "sensitive-personal-data"],
  ),
  "yys2024-creaa-ai": keepSkill(
    "creaa-media-generator",
    "Creaa Media Generator",
    "Generate and edit images and videos through Creaa for approved campaign, demo, and creative production work.",
    ["image-video", "image-generation", "video-generation", "creative-assets", "external-account", "requires-human-confirmation"],
  ),
};



const MEDIA_STREAMING_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "protoss70-apify-competitor-intelligence": keepSkill(
    "competitor-intelligence",
    "Competitor Intelligence",
    "Analyze competitor strategy, content, pricing, ads, and positioning for CMO, sales, and Research Lab reports.",
    ["media-streaming", "competitor-research", "marketing", "research-lab", "public-data", "external-account"],
  ),
  "aktheknight-audio-transcribe": keepSkill(
    "local-audio-transcription",
    "Local Audio Transcription",
    "Transcribe meetings, interviews, calls, voice notes, and media clips locally with faster-whisper.",
    ["media-streaming", "speech-to-text", "transcription", "meetings", "local-ai", "sensitive-personal-data"],
  ),
  "michael-laffin-content-recycler": keepSkill(
    "content-recycler",
    "Content Recycler",
    "Repurpose approved long-form content into channel-specific posts, summaries, clips, and campaign drafts.",
    ["media-streaming", "content-repurposing", "marketing", "social-media", "requires-human-confirmation"],
  ),
  "liudu2326526-ffmpeg-master": keepSkill(
    "ffmpeg-media-processing",
    "FFmpeg Media Processing",
    "Process audio and video artifacts for agent deliverables, including trims, conversions, subtitles, and compression.",
    ["media-streaming", "video-editing", "audio", "ffmpeg", "host-mutation", "requires-human-confirmation"],
  ),
  "huixionghexiyi-free-groq-voice": keepSkill(
    "groq-voice-transcription",
    "Groq Voice Transcription",
    "Transcribe voice notes, clips, calls, and support audio through Groq Whisper for fast media intake.",
    ["media-streaming", "speech-to-text", "transcription", "external-account", "sensitive-personal-data"],
  ),
  "hugosbl-freelance-toolkit-fr": keepSkill(
    "freelance-ops-fr",
    "Freelance Ops FR",
    "Manage French freelancer invoices, time tracking, clients, and dashboard-style business operations.",
    ["media-streaming", "business-ops", "freelance", "france", "reporting", "requires-human-confirmation"],
  ),
  "lifeissea-instagram-api": keepSkill(
    "instagram-publisher",
    "Instagram Publisher",
    "Publish Feed, Story, Reels, Carousel, and Threads content through the official Meta Graph API after approval.",
    ["media-streaming", "social-media", "instagram", "publishing", "external-account", "requires-human-confirmation"],
  ),
  "psyb0t-mediaproc": keepSkill(
    "sandboxed-media-processor",
    "Sandboxed Media Processor",
    "Process video, audio, and image files through a locked-down SSH container for safer media production workflows.",
    ["media-streaming", "media-processing", "video-editing", "audio", "ssh", "host-mutation", "requires-human-confirmation"],
  ),
  "willscott-v2-metricool": keepSkill(
    "metricool-social-scheduler",
    "Metricool Social Scheduler",
    "Schedule and manage approved social media posts through Metricool for CMO and growth agents.",
    ["media-streaming", "social-media", "scheduling", "marketing", "external-account", "requires-human-confirmation"],
  ),
  "lao9s-mixpost": keepSkill(
    "mixpost-social-manager",
    "Mixpost Social Manager",
    "Use self-hosted Mixpost to plan, schedule, and manage social media workflows with company-scoped credentials.",
    ["media-streaming", "social-media", "scheduling", "self-hosting", "external-account", "requires-human-confirmation"],
  ),
  "guoqiao-mlx-audio-server": keepSkill(
    "local-mlx-audio-api",
    "Local MLX Audio API",
    "Run a local OpenAI-compatible audio API for private speech workflows on supported Apple Silicon hosts.",
    ["media-streaming", "speech-to-text", "text-to-speech", "local-ai", "apple-silicon", "sensitive-personal-data"],
  ),
  "jonathansantilli-mobb-vulnerabilities-fixer": keepSkill(
    "mobb-vulnerability-fixer",
    "Mobb Vulnerability Fixer",
    "Scan, fix, and remediate repository vulnerabilities with reviewable security changes for engineering agents.",
    ["media-streaming", "security", "code-review", "developer-tools", "host-mutation", "requires-human-confirmation"],
  ),
  "mariusfit-oc-daily-business-report": keepSkill(
    "daily-business-briefings",
    "Daily Business Briefings",
    "Generate daily business briefings from approved data sources for CEO, COO, and board review.",
    ["media-streaming", "business-reporting", "reporting", "board-inbox", "external-account", "sensitive-personal-data"],
  ),
  "codedao12-podcast-chaptering-highlights": keepSkill(
    "podcast-chapters-highlights",
    "Podcast Chapters & Highlights",
    "Create podcast chapters, highlights, show notes, and repurposing briefs from audio or transcripts.",
    ["media-streaming", "podcasts", "transcription", "summaries", "content-repurposing", "sensitive-personal-data"],
  ),
  "seanwyngaard-social-media-content-calendar": keepSkill(
    "social-content-calendar",
    "Social Content Calendar",
    "Generate structured social media content calendars with platform-specific posts, hashtags, and scheduling plans.",
    ["media-streaming", "social-media", "content-planning", "marketing", "requires-human-confirmation"],
  ),
  "teamtelnyx-telnyx-stt": keepSkill(
    "telnyx-speech-to-text",
    "Telnyx Speech-to-Text",
    "Transcribe calls, voice notes, and media files through Telnyx for support, sales, and meeting workflows.",
    ["media-streaming", "speech-to-text", "transcription", "external-account", "sensitive-personal-data"],
  ),
  "teamtelnyx-telnyx-tts": keepSkill(
    "telnyx-text-to-speech",
    "Telnyx Text-to-Speech",
    "Generate reviewed speech audio for demos, accessibility, support, and voice-agent workflows.",
    ["media-streaming", "text-to-speech", "voice", "external-account", "requires-human-confirmation"],
  ),
  "vae999-voice-to-text": keepSkill(
    "offline-voice-transcription",
    "Offline Voice Transcription",
    "Convert voice messages and audio files to text locally with Vosk for private company workflows.",
    ["media-streaming", "speech-to-text", "transcription", "local-ai", "sensitive-personal-data"],
  ),
  "claudiodrusus-weekly-content-planner": keepSkill(
    "weekly-content-planner",
    "Weekly Content Planner",
    "Generate a full week of reviewed social and campaign content plans for CMO and content agents.",
    ["media-streaming", "social-media", "content-planning", "marketing", "requires-human-confirmation"],
  ),
  "kjaylee-youtube-pro": keepSkill(
    "youtube-research-transcripts",
    "YouTube Research & Transcripts",
    "Extract YouTube metadata, transcripts, and analysis for research, content repurposing, and knowledge-base intake.",
    ["media-streaming", "youtube", "transcription", "research-lab", "knowledge-base", "public-data"],
  ),
};



const PDF_DOCUMENTS_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "rongself-agent-skills-tools": keepSkill(
    "skill-security-toolkit",
    "Skill Security Toolkit",
    "Audit and validate Agent Skills packages before PaperClaw installs them into a company workspace.",
    ["pdf-documents", "security", "marketplace", "install-safety", "agent-safety"],
  ),
  "gykdly-attendance-sheet": keepSkill(
    "attendance-sheet-generator",
    "Attendance Sheet Generator",
    "Generate professional attendance sheets and XLSX-style operations artifacts from reviewed employee work data.",
    ["pdf-documents", "spreadsheets", "hr", "operations", "sensitive-personal-data"],
  ),
  "ntlx-beautiful-mermaid": keepSkill(
    "diagram-renderer",
    "Diagram Renderer",
    "Render Mermaid diagrams as SVG or ASCII artifacts for architecture, process, and board-ready documentation.",
    ["pdf-documents", "diagrams", "mermaid", "documentation", "reporting"],
  ),
  "killerapp-chain-of-density": keepSkill(
    "dense-summary-writer",
    "Dense Summary Writer",
    "Create progressively denser summaries of long documents while preserving source-aware context for review.",
    ["pdf-documents", "summaries", "documents", "knowledge-base", "research-lab"],
  ),
  "suhteevah-docsync": keepSkill(
    "documentation-drift-checker",
    "Documentation Drift Checker",
    "Detect documentation drift from code and generate update notes for docs maintenance and release workflows.",
    ["pdf-documents", "documentation", "code-analysis", "qa", "research-lab", "host-mutation", "requires-human-confirmation"],
  ),
  "seanphan-docx": keepSkill(
    "docx-editor",
    "DOCX Editor",
    "Create, edit, analyze, and review DOCX documents with tracked-change-friendly workflows.",
    ["pdf-documents", "docx", "documents", "editing", "reporting", "sensitive-personal-data"],
  ),
  "kowl64-excel-weekly-dashboard": keepSkill(
    "weekly-excel-dashboard",
    "Weekly Excel Dashboard",
    "Build refreshable weekly Excel dashboards for operations, finance review, and recurring board reports.",
    ["pdf-documents", "spreadsheets", "dashboards", "reporting", "sensitive-personal-data"],
  ),
  "aronchick-expanso-csv-to-json": keepSkill(
    "csv-to-json-converter",
    "CSV to JSON Converter",
    "Convert CSV exports into JSON records for document pipelines, reports, and agent-readable data handoffs.",
    ["pdf-documents", "data-conversion", "csv", "json", "local-artifact"],
  ),
  "aronchick-expanso-json-pretty": keepSkill(
    "json-formatter",
    "JSON Formatter",
    "Pretty-print JSON payloads for readable documentation, API review, and config handoffs.",
    ["pdf-documents", "data-conversion", "json", "formatting", "local-artifact"],
  ),
  "aronchick-expanso-json-to-csv": keepSkill(
    "json-to-csv-converter",
    "JSON to CSV Converter",
    "Convert JSON arrays into CSV artifacts for spreadsheets, reports, and operations exports.",
    ["pdf-documents", "data-conversion", "json", "csv", "spreadsheets"],
  ),
  "aronchick-expanso-json-to-yaml": keepSkill(
    "json-to-yaml-converter",
    "JSON to YAML Converter",
    "Convert JSON into YAML for configuration docs, agent package review, and structured documentation.",
    ["pdf-documents", "data-conversion", "json", "yaml", "documentation"],
  ),
  "aronchick-expanso-xml-to-json": keepSkill(
    "xml-to-json-converter",
    "XML to JSON Converter",
    "Convert XML into JSON for legacy document, API, and data-ingestion workflows.",
    ["pdf-documents", "data-conversion", "xml", "json", "knowledge-base"],
  ),
  "aronchick-expanso-yaml-to-json": keepSkill(
    "yaml-to-json-converter",
    "YAML to JSON Converter",
    "Convert YAML into JSON for structured docs, configs, and agent-readable review artifacts.",
    ["pdf-documents", "data-conversion", "yaml", "json", "documentation"],
  ),
  "xejrax-image-ocr": keepSkill(
    "image-ocr",
    "Image OCR",
    "Extract text from scanned images and document screenshots for searchable company memory and report intake.",
    ["pdf-documents", "ocr", "documents", "knowledge-base", "sensitive-personal-data"],
  ),
  "seanphan-internal-comms": keepSkill(
    "internal-comms-writer",
    "Internal Comms Writer",
    "Draft internal memos, announcements, board notes, and company updates for human review.",
    ["pdf-documents", "internal-comms", "drafting", "reporting", "requires-human-confirmation"],
  ),
  "claudiodrusus-json-toolkit": keepSkill(
    "json-toolkit",
    "JSON Toolkit",
    "Inspect, format, transform, and validate JSON files for document pipelines, APIs, and config reviews.",
    ["pdf-documents", "json", "data-conversion", "qa", "local-artifact"],
  ),
  "steipete-markdown-converter": keepSkill(
    "markdown-converter",
    "Markdown Converter",
    "Convert documents and files into Markdown for PaperClaw reports, knowledge-base intake, and Research Lab handoffs.",
    ["pdf-documents", "markdown", "documents", "knowledge-base", "sensitive-personal-data"],
  ),
  "michael-laffin-markdown-formatter": keepSkill(
    "markdown-formatter",
    "Markdown Formatter",
    "Format and tidy Markdown documents before reports, docs, and board summaries are shared.",
    ["pdf-documents", "markdown", "formatting", "documentation", "qa"],
  ),
  "jarekbird-mermaid": keepSkill(
    "mermaid-diagram-generator",
    "Mermaid Diagram Generator",
    "Generate Mermaid diagrams from text for architecture, workflows, decisions, and documentation.",
    ["pdf-documents", "mermaid", "diagrams", "documentation", "research-lab"],
  ),
  "dev-null321-openscan": keepSkill(
    "binary-script-scanner",
    "Binary & Script Scanner",
    "Scan binaries and scripts for malicious patterns before agents trust, install, or execute them.",
    ["pdf-documents", "security", "malware-scan", "qa", "agent-safety"],
  ),
  "andyxinweiminicloud-permission-creep-scanner": keepSkill(
    "skill-permission-creep-scanner",
    "Skill Permission Creep Scanner",
    "Detect when skill code accesses more resources than its documentation claims before marketplace approval.",
    ["pdf-documents", "security", "marketplace", "permissions", "install-safety"],
  ),
  "autogame-17-qr-generator": keepSkill(
    "qr-code-generator",
    "QR Code Generator",
    "Generate QR codes for reviewed URLs, handoffs, reports, forms, and document artifacts.",
    ["pdf-documents", "qr-codes", "documents", "marketing", "local-artifact", "requires-human-confirmation"],
  ),
  "itsnishi-scan-skill": keepSkill(
    "skill-security-scanner",
    "Skill Security Scanner",
    "Run deep security analysis on an individual skill before installation or assignment to agents.",
    ["pdf-documents", "security", "marketplace", "install-safety", "agent-safety"],
  ),
  "zendenho7-skill-install-guardian": keepSkill(
    "skill-install-guardian",
    "Skill Install Guardian",
    "Perform due diligence before installing external skills from ClawHub or other marketplace sources.",
    ["pdf-documents", "security", "marketplace", "install-safety", "approvals"],
  ),
  "yx2601816404-sys-skill-shield": keepSkill(
    "skill-shield-security-audit",
    "Skill Shield Security Audit",
    "Audit ClawHub skills for security, permissions, and install risk before PaperClaw makes them available.",
    ["pdf-documents", "security", "marketplace", "qa", "agent-safety"],
  ),
  "itsnishi-vet-repo": keepSkill(
    "agent-config-repo-vetting",
    "Agent Config Repo Vetting",
    "Scan repository agent configuration files for suspicious patterns before importing or running them.",
    ["pdf-documents", "security", "repos", "agent-config", "install-safety"],
  ),
};



const PERSONAL_DEVELOPMENT_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "vedantsingh60-adaptive-learning-agents": keepSkill(
    "agent-learning-loop",
    "Agent Learning Loop",
    "Continuously improve PaperClaw agents through structured feedback, learning objectives, and company-scoped performance reviews.",
    ["personal-development", "agent-development", "learning", "agent-training", "company-scoped", "memory-safety"],
  ),
  "killerapp-adversarial-coach": keepSkill(
    "adversarial-review-coach",
    "Adversarial Review Coach",
    "Challenge plans, proposals, and agent outputs before they reach the CEO or board so weak assumptions surface early.",
    ["personal-development", "agent-evaluation", "strategy", "agent-safety", "research-lab"],
  ),
  "lilei0311-agent-evolver": keepSkill(
    "agent-evolution-engine",
    "Agent Evolution Engine",
    "Run controlled improvement loops for agent instructions, operating habits, and role performance without silently mutating production behavior.",
    ["personal-development", "agent-development", "agent-evaluation", "agent-safety", "requires-human-confirmation"],
  ),
  "stevengonsalvez-agent-reflect": keepSkill(
    "agent-reflection-review",
    "Agent Reflection Review",
    "Turn completed tasks into reflection notes, mistakes learned, and reusable company memory for long-running agent teams.",
    ["personal-development", "agent-development", "reflection", "memory", "knowledge-base", "company-scoped"],
  ),
  "daijo-bu-daily-questions": keepSkill(
    "agent-learning-questionnaire",
    "Agent Learning Questionnaire",
    "Ask recurring review questions that help agents capture decisions, blockers, lessons, and next actions after daily work.",
    ["personal-development", "learning", "reflection", "agent-training", "company-scoped"],
  ),
  "itsflow-daily-review-ritual": keepSkill(
    "daily-work-review",
    "Daily Work Review",
    "Create a lightweight daily review ritual for agent teams, project leads, and CEO reports.",
    ["personal-development", "reflection", "operations", "reporting", "company-scoped"],
  ),
  "zedit42-xeonen-arena": keepSkill(
    "agent-adversarial-arena",
    "Agent Adversarial Arena",
    "Pressure-test agents against adversarial scenarios, critique rounds, and quality benchmarks inside controlled review workflows.",
    ["personal-development", "agent-evaluation", "agent-safety", "qa", "research-lab"],
  ),
  "addisonhellum-deepthink": keepSkill(
    "company-knowledge-base",
    "Company Knowledge Base",
    "Organize durable context, research notes, decisions, and summaries into a company knowledge layer agents can reuse.",
    ["personal-development", "knowledge-base", "memory", "research-lab", "company-scoped", "memory-safety"],
  ),
  "emasoudy-graphiti": keepSkill(
    "knowledge-graph-memory",
    "Knowledge Graph Memory",
    "Model company entities, relationships, decisions, and events as a knowledge graph for richer agent memory retrieval.",
    ["personal-development", "knowledge-graph", "memory", "knowledge-base", "company-scoped", "memory-safety"],
  ),
  "nitishgargiitd-learn-cog": keepSkill(
    "agent-training-cognition",
    "Agent Training Cognition",
    "Build structured learning exercises and cognitive workflows for specialist agent training and evaluation.",
    ["personal-development", "learning", "agent-training", "agent-development", "research-lab"],
  ),
  "brianrwagner-brw-case-study-builder": keepSkill(
    "case-study-builder",
    "Case Study Builder",
    "Convert completed projects, Research Lab runs, and customer work into polished case studies for sales and board review.",
    ["personal-development", "case-studies", "marketing", "reporting", "research-lab"],
  ),
  "shhdwi-docstrange": keepSkill(
    "document-extraction",
    "Document Extraction",
    "Extract structured facts from documents for onboarding, research intake, reports, and company memory updates.",
    ["personal-development", "documents", "knowledge-base", "data-extraction", "sensitive-personal-data"],
  ),
  "aronchick-expanso-cve-scan": keepSkill(
    "cve-scanner",
    "CVE Scanner",
    "Scan dependencies or software references for known CVEs before agents recommend, deploy, or package a project.",
    ["personal-development", "security", "cve", "research-lab", "agent-safety"],
  ),
};



const SEARCH_RESEARCH_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "nastrology-1": keepSkill(
    "ensue-knowledge-base",
    "Ensue Knowledge Base",
    "Capture and retrieve research notes, decisions, and local knowledge for PaperClaw company memory workflows.",
    ["search-and-research", "knowledge-base", "rag", "memory", "company-scoped", "memory-safety"],
  ),
  "kesslerio-academic-deep-research": keepSkill(
    "academic-deep-research",
    "Academic Deep Research",
    "Run rigorous cited academic research for papers, literature reviews, technical reports, and Research Lab investigations.",
    ["search-and-research", "academic-research", "deep-research", "citations", "research-lab"],
  ),
  "dayunyan-academic-writer": keepSkill(
    "academic-latex-writer",
    "Academic LaTeX Writer",
    "Draft and refine scholarly LaTeX reports and research papers for human review.",
    ["search-and-research", "academic-research", "writing", "latex", "draft-only"],
  ),
  "teamolab-academic-writing": keepSkill(
    "academic-writing-expert",
    "Academic Writing Expert",
    "Support scholarly papers, literature reviews, research methodology notes, and publication-ready academic writing drafts.",
    ["search-and-research", "academic-research", "writing", "research-lab", "draft-only"],
  ),
  "zihan-zhu-academic-writing-refiner": keepSkill(
    "academic-writing-refiner",
    "Academic Writing Refiner",
    "Refine computer-science research writing for clarity, reviewer expectations, and top-tier venue standards.",
    ["search-and-research", "academic-research", "editing", "computer-science", "draft-only"],
  ),
  "nimhar-aclawdemy": keepSkill(
    "academic-research-platform",
    "Academic Research Platform",
    "Use an academic research platform workflow for agent-led literature discovery and synthesis.",
    ["search-and-research", "academic-research", "agent-research", "research-lab"],
  ),
  "vishalgojha-action-suggester": keepSkill(
    "lead-action-suggester",
    "Lead Action Suggester",
    "Generate non-binding next-step suggestions from lead summaries without sending outreach automatically.",
    ["search-and-research", "lead-research", "sales", "draft-only", "requires-human-confirmation"],
  ),
  "dobrinalexandru-agent-brain": keepSkill(
    "agent-brain-memory",
    "Agent Brain Memory",
    "Provide local-first persistent memory with SQLite-backed retrieve and extract loops for long-running agents.",
    ["search-and-research", "memory", "rag", "sqlite", "company-scoped", "memory-safety"],
  ),
  "24601-agent-deep-research": keepSkill(
    "gemini-deep-research-agent",
    "Gemini Deep Research Agent",
    "Conduct autonomous multi-step research with Gemini-backed planning and synthesis.",
    ["search-and-research", "deep-research", "web-search", "research-lab"],
  ),
  "amanbhandula-agentarxiv": keepSkill(
    "agentarxiv-publishing-research",
    "AgentArxiv Publishing Research",
    "Support outcome-driven scientific publishing and academic paper workflows for AI agent teams.",
    ["search-and-research", "academic-research", "publishing", "papers"],
  ),
  "matanle51-agentic-paper-digest": keepSkill(
    "arxiv-paper-digest",
    "ArXiv Paper Digest",
    "Fetch and summarize recent arXiv and Hugging Face papers for recurring research briefings.",
    ["search-and-research", "academic-research", "arxiv", "summaries", "monitoring"],
  ),
  "doanbactam-agnxi-search-skill": keepSkill(
    "agnxi-search",
    "Agnxi Search",
    "Search Agnxi.com as a dedicated source in agent research workflows.",
    ["search-and-research", "web-search", "research"],
  ),
  "blackshady1130-jpg-ai-review": keepSkill(
    "url-file-review-summarizer",
    "URL/File Review Summarizer",
    "Read URLs or files, classify content, and produce structured summaries for review.",
    ["search-and-research", "summarization", "classification", "documents", "sensitive-personal-data"],
  ),
  "aisapay-aisa-multi-source-search": keepSkill(
    "aisa-multi-source-search",
    "AISA Multi-Source Search",
    "Search multiple sources through an agent-friendly research interface.",
    ["search-and-research", "web-search", "multi-source", "research"],
  ),
  "aisapay-aisa-youtube-search": keepSkill(
    "youtube-serp-scout",
    "YouTube SERP Scout",
    "Research YouTube search results and video topics for content, market, and audience analysis.",
    ["search-and-research", "youtube", "content-research", "market-research"],
  ),
  "alekhm-aister-vector-memory": keepSkill(
    "aister-vector-memory",
    "Aister Vector Memory",
    "Search agent memory by meaning instead of exact keywords.",
    ["search-and-research", "memory", "vector-search", "semantic-search", "company-scoped"],
  ),
  "rhino88-amazon-data": keepSkill(
    "amazon-product-data-research",
    "Amazon Product Data Research",
    "Retrieve Amazon product pricing, reviews, search results, deals, and stock signals for product research.",
    ["search-and-research", "product-research", "commerce-data", "market-research", "external-account"],
  ),
  "anshumanbh-anshumanbh-qmd": keepSkill(
    "markdown-knowledge-search",
    "Markdown Knowledge Search",
    "Search markdown knowledge bases efficiently for internal docs and Research Lab handoffs.",
    ["search-and-research", "knowledge-base", "markdown", "local-artifact", "company-scoped"],
  ),
  "rhyssullivan-answeroverflow": keepSkill(
    "community-discussion-search",
    "Community Discussion Search",
    "Search indexed Discord community discussions for support intelligence and technical research.",
    ["search-and-research", "community-research", "support-intel", "public-data"],
  ),
  "edmonddantesj-aoi-triple-memory-lite": keepSkill(
    "triple-memory-lite",
    "Triple Memory Lite",
    "Combine file search and decision notes templates for lightweight company memory.",
    ["search-and-research", "memory", "decision-log", "knowledge-base", "company-scoped"],
  ),
  "notsurewhoisthis-argos-product-research": keepSkill(
    "argos-product-research",
    "Argos Product Research",
    "Search, compare, and research products for commerce, procurement, and market analysis.",
    ["search-and-research", "product-research", "commerce-data", "market-research"],
  ),
  "xukp20-arxiv-batch-reporter": keepSkill(
    "arxiv-batch-reporter",
    "ArXiv Batch Reporter",
    "Build structured collection reports from batches of academic papers.",
    ["search-and-research", "academic-research", "arxiv", "reporting"],
  ),
  "killgfat-arxiv-cli-tools": keepSkill(
    "arxiv-cli-tools",
    "ArXiv CLI Tools",
    "Search and inspect arXiv papers from command-line research workflows.",
    ["search-and-research", "academic-research", "arxiv", "developer-tools"],
  ),
  "xukp20-arxiv-paper-processor": keepSkill(
    "arxiv-paper-processor",
    "ArXiv Paper Processor",
    "Process batches of arXiv paper artifacts for research summaries and paper collections.",
    ["search-and-research", "academic-research", "arxiv", "paper-processing"],
  ),
  "zxrys-arxiv-paper-reviews": keepSkill(
    "arxiv-paper-reviews",
    "ArXiv Paper Reviews",
    "Fetch, read, and review arXiv papers for agent-assisted literature analysis.",
    ["search-and-research", "academic-research", "arxiv", "review"],
  ),
  "xukp20-arxiv-summarizer-orchestrator": keepSkill(
    "arxiv-summarizer-orchestrator",
    "ArXiv Summarizer Orchestrator",
    "Coordinate periodic arXiv collection and reporting workflows.",
    ["search-and-research", "academic-research", "arxiv", "monitoring", "automation"],
  ),
  "rubenfb23-arxiv-watcher": keepSkill(
    "arxiv-watcher",
    "ArXiv Watcher",
    "Search, monitor, and summarize arXiv papers for recurring Research Lab briefings.",
    ["search-and-research", "academic-research", "arxiv", "monitoring"],
  ),
  "tobisamaa-autonomous-research": keepSkill(
    "autonomous-researcher",
    "Autonomous Researcher",
    "Conduct comprehensive independent research with planning, source collection, and synthesis.",
    ["search-and-research", "deep-research", "research-lab", "citations"],
  ),
  "pors-b2b-first-ten": keepSkill(
    "b2b-first-ten-customers-research",
    "B2B First Ten Customers Research",
    "Research first-customer strategies and go-to-market paths for B2B companies.",
    ["search-and-research", "b2b", "growth", "sales", "market-research"],
  ),
  "jlpjavawayup-baidu-scholar-search": keepSkill(
    "baidu-scholar-search",
    "Baidu Scholar Search",
    "Search Baidu Academic for scholarly papers and research material.",
    ["search-and-research", "academic-research", "baidu", "public-data"],
  ),
  "ide-rea-baidu-search": keepSkill(
    "baidu-web-search",
    "Baidu Web Search",
    "Search the web using Baidu AI Search Engine for China-oriented research.",
    ["search-and-research", "web-search", "baidu", "public-data"],
  ),
  "stdeson-bing-search": keepSkill(
    "bing-search",
    "Bing Search",
    "Run general web search through Bing for company research and competitive intelligence.",
    ["search-and-research", "web-search", "public-data"],
  ),
  "nikhilp1234567-biodiversity-corridor-calculator": keepSkill(
    "biodiversity-corridor-analyst",
    "Biodiversity Corridor Analyst",
    "Analyze environmental corridor data for research and policy-style reports.",
    ["search-and-research", "environment", "analysis", "public-data"],
  ),
  "sieershafilone-blacksnow": keepSkill(
    "ambient-risk-signal-monitor",
    "Ambient Risk Signal Monitor",
    "Monitor ambient legal, news, and risk signals before they become visible incidents.",
    ["search-and-research", "risk", "competitive-intel", "monitoring", "public-data"],
  ),
  "maxfritzhand-bolta-skills-index": keepSkill(
    "bolta-skills-registry",
    "Bolta Skills Registry",
    "Discover and compare agent skills from the Bolta skills registry.",
    ["search-and-research", "marketplace", "discovery", "agent-tools"],
  ),
  "chiefsegundo-boof": keepSkill(
    "document-rag-converter",
    "Document RAG Converter",
    "Convert PDFs and documents to Markdown, index them locally, and analyze them through RAG.",
    ["search-and-research", "rag", "documents", "markdown", "local-artifact", "sensitive-personal-data"],
  ),
  "danpalmieri-books-for-agents": keepSkill(
    "books-for-agents",
    "Books for Agents",
    "Use structured book summaries as a knowledge source for company research and agent learning.",
    ["search-and-research", "knowledge-base", "books", "public-data"],
  ),
  "brianrwagner-brw-ai-discoverability-audit": keepSkill(
    "ai-discoverability-audit",
    "AI Discoverability Audit",
    "Audit how a brand appears in AI-powered search engines and assistant answers.",
    ["search-and-research", "ai-seo", "brand-research", "market-research", "reporting"],
  ),
  "alexrudloff-caesar-research": keepSkill(
    "caesar-deep-research",
    "Caesar Deep Research",
    "Run deep research queries, follow-up chats, brainstorming sessions, and collection-based research.",
    ["search-and-research", "deep-research", "collections", "research-lab", "external-account"],
  ),
  "teamolab-call-academic-search-agent": keepSkill(
    "academic-search-agent",
    "Academic Search Agent",
    "Call a dedicated academic search workflow for literature discovery and scholarly context.",
    ["search-and-research", "academic-research", "search", "research-lab"],
  ),
  "mhugo22-cheese-brain": keepSkill(
    "cheesebrain-knowledge-base",
    "CheeseBrain Knowledge Base",
    "Use DuckDB-powered knowledge retrieval across projects, contacts, tools, and company entities.",
    ["search-and-research", "knowledge-base", "rag", "duckdb", "company-scoped"],
  ),
  "clarityprotocol-clarity-analyze": keepSkill(
    "clarity-research-analysis",
    "Clarity Research Analysis",
    "Submit structured research questions for AI-powered analysis through Clarity Protocol.",
    ["search-and-research", "research", "analysis", "external-account"],
  ),
  "frmoretto-clarity-gate": keepSkill(
    "clarity-rag-gate",
    "Clarity RAG Gate",
    "Run pre-ingestion quality checks before content enters a RAG or company knowledge system.",
    ["search-and-research", "rag", "verification", "knowledge-base", "memory-safety"],
  ),
  "clarityprotocol-clarity-research": keepSkill(
    "clarity-protein-research",
    "Clarity Protein Research",
    "Search protein-folding research data for scientific Research Lab analysis.",
    ["search-and-research", "academic-research", "science", "public-data"],
  ),
  "ryx2-code-cache": keepSkill(
    "semantic-code-cache",
    "Semantic Code Cache",
    "Cache and retrieve codebase knowledge semantically for engineering research and code understanding.",
    ["search-and-research", "developer-tools", "knowledge-base", "semantic-search", "research-lab"],
  ),
  "seanwyngaard-competitor-analysis-report": keepSkill(
    "competitor-analysis-reports",
    "Competitor Analysis Reports",
    "Generate structured competitive analysis reports with features, pricing, SWOT, and strategic recommendations.",
    ["search-and-research", "competitive-intel", "strategy", "market-research", "reporting"],
  ),
  "hazy2go-content-research": keepSkill(
    "content-topic-research",
    "Content Topic Research",
    "Research trending topics and platform-specific content opportunities for marketing teams.",
    ["search-and-research", "content-research", "marketing", "market-research"],
  ),
  "waynevaughan-cortex-ai": keepSkill(
    "cortex-agent-memory",
    "Cortex Agent Memory",
    "Provide persistent memory for AI agents through Sigma Labs infrastructure.",
    ["search-and-research", "memory", "knowledge-base", "company-scoped"],
  ),
  "ttboy-deeps": keepSkill(
    "deep-research-agent",
    "Deep Research Agent",
    "Plan, decompose, and execute complex multi-step research tasks.",
    ["search-and-research", "deep-research", "research-lab", "citations"],
  ),
  "xiaowenzhou-dify-kb-search": keepSkill(
    "dify-knowledge-search",
    "Dify Knowledge Search",
    "Search Dify knowledge base datasets to retrieve accurate context for RAG-enhanced answers.",
    ["search-and-research", "rag", "knowledge-base", "external-account", "company-scoped"],
  ),
  "s-annam-dizest-summarize": keepSkill(
    "dizest-summarizer",
    "Dizest Summarizer",
    "Summarize long-form articles, podcasts, research papers, PDFs, notes, and other source material.",
    ["search-and-research", "summarization", "documents", "research", "sensitive-personal-data"],
  ),
  "osobh-edgehdf5-memory": keepSkill(
    "edgehdf5-memory",
    "EdgeHDF5 Memory",
    "Use HDF5-backed persistent cognitive memory for agent recall and company context.",
    ["search-and-research", "memory", "knowledge-base", "company-scoped"],
  ),
  "gprecious-engineering-as-marketing": keepSkill(
    "engineering-marketing-research",
    "Engineering Marketing Research",
    "Research free-tool ideas that can drive organic search traffic and customer conversion.",
    ["search-and-research", "marketing", "seo", "growth", "market-research"],
  ),
  "dannydvm-engram-memory": keepSkill(
    "engram-semantic-memory",
    "Engram Semantic Memory",
    "Run local persistent semantic memory for AI agents.",
    ["search-and-research", "memory", "semantic-search", "local-artifact", "company-scoped"],
  ),
  "jameseball-enhanced-memory": keepSkill(
    "enhanced-memory-search",
    "Enhanced Memory Search",
    "Search memory with hybrid vector and keyword scoring, temporal routing, and adaptive weighting.",
    ["search-and-research", "memory", "hybrid-search", "semantic-search", "company-scoped"],
  ),
  "aronchick-expanso-keyword-extract": keepSkill(
    "keyword-extractor",
    "Keyword Extractor",
    "Extract keywords and key phrases from text for SEO, tagging, indexing, and research intake.",
    ["search-and-research", "seo", "indexing", "data-extraction", "local-artifact"],
  ),
  "myx0m0p-feed-to-md": keepSkill(
    "feed-to-markdown",
    "Feed to Markdown",
    "Convert RSS or Atom feeds into Markdown for news monitoring and research ingestion.",
    ["search-and-research", "rss", "content-research", "markdown", "monitoring"],
  ),
  "xiazhefengzhi-find-products": keepSkill(
    "producthunt-product-research",
    "ProductHunt Product Research",
    "Discover trending products from Product Hunt with structured analysis data.",
    ["search-and-research", "product-research", "market-research", "public-data"],
  ),
  "at6132-fitcheck-skill-search": keepSkill(
    "skill-marketplace-search",
    "Skill Marketplace Search",
    "Find and retrieve skills with keyword, semantic, or task-matching search.",
    ["search-and-research", "marketplace", "discovery", "agent-tools"],
  ),
  "kiszly-fred-navigator": keepSkill(
    "fred-economic-data-navigator",
    "FRED Economic Data Navigator",
    "Navigate FRED categories and time series for macroeconomic research and board reports.",
    ["search-and-research", "economics", "public-data", "market-research"],
  ),
  "lukeslp-geepers-corpus": keepSkill(
    "coca-corpus-search",
    "COCA Corpus Search",
    "Query linguistic corpora for word frequency, collocations, and language research.",
    ["search-and-research", "academic-research", "language", "public-data"],
  ),
  "lukeslp-geepers-etymology": keepSkill(
    "etymology-research",
    "Etymology Research",
    "Look up word etymology, historical sound changes, and language family information.",
    ["search-and-research", "academic-research", "language", "public-data"],
  ),
  "feydefi-geo-audit-optimizer": keepSkill(
    "ai-search-visibility-audit",
    "AI Search Visibility Audit",
    "Audit AI search and generative engine visibility for brands, products, and content.",
    ["search-and-research", "ai-seo", "marketing", "brand-research", "reporting"],
  ),
  "satnamra-google-trends": keepSkill(
    "google-trends-research",
    "Google Trends Research",
    "Monitor trending searches, compare keywords, and track interest over time.",
    ["search-and-research", "market-research", "seo", "public-data", "monitoring"],
  ),
  "metatronsdoob369-hk101-living-rag": keepSkill(
    "local-living-rag",
    "Local Living RAG",
    "Run simple RAG over local text and Markdown files.",
    ["search-and-research", "rag", "local-artifact", "knowledge-base", "company-scoped"],
  ),
  "scsun1978-hybrid-deep-search": keepSkill(
    "hybrid-deep-search",
    "Hybrid Deep Search",
    "Route research between Brave API and deeper model analysis for cost-aware search workflows.",
    ["search-and-research", "web-search", "deep-research", "cost-control", "research-lab"],
  ),
  "gladego-index1-doctor": keepSkill(
    "index-health-doctor",
    "Index Health Doctor",
    "Diagnose local search and indexing environments, including Python, Ollama, models, and index health.",
    ["search-and-research", "developer-tools", "ops", "search-index", "local-artifact"],
  ),
  "hogpile-intelligent-delegation": keepSkill(
    "intelligent-delegation-framework",
    "Intelligent Delegation Framework",
    "Use structured delegation patterns for reliable AI-to-AI task routing and handoffs.",
    ["search-and-research", "agent-ops", "delegation", "research-lab"],
  ),
  "ajtgjmdjp-japan-news-mcp": keepSkill(
    "japan-business-news-search",
    "Japan Business News Search",
    "Search Japanese financial and business news from major public sources.",
    ["search-and-research", "news", "market-research", "public-data"],
  ),
  "dedene-kmi": keepSkill(
    "belgian-weather-research",
    "Belgian Weather Research",
    "Query Belgian weather information for location-aware research and operations planning.",
    ["search-and-research", "weather", "public-data", "research"],
  ),
  "blockchainhb-launchfast-ppc-research": keepSkill(
    "amazon-ppc-keyword-research",
    "Amazon PPC Keyword Research",
    "Research Amazon PPC keywords for advertising and marketplace strategy.",
    ["search-and-research", "market-research", "ads", "amazon", "seo"],
  ),
  "blockchainhb-launchfast-product-research": keepSkill(
    "amazon-product-opportunity-research",
    "Amazon Product Opportunity Research",
    "Scan Amazon product opportunities across keywords for commerce research.",
    ["search-and-research", "product-research", "amazon", "competitive-intel", "market-research"],
  ),
  "vishalgojha-lead-extractor": keepSkill(
    "lead-record-extractor",
    "Lead Record Extractor",
    "Extract structured real-estate lead records from parsed messages without sending outreach.",
    ["search-and-research", "lead-research", "data-extraction", "sensitive-personal-data", "draft-only"],
  ),
  "n4cra-legiscan-bill-search": keepSkill(
    "legislative-bill-monitor",
    "Legislative Bill Monitor",
    "Monitor public state legislative activity through LegiScan for policy research.",
    ["search-and-research", "policy-research", "public-data", "monitoring"],
  ),
  "nonlinear-librarian": keepSkill(
    "semantic-book-search",
    "Semantic Book Search",
    "Search books semantically for research and knowledge-base workflows.",
    ["search-and-research", "knowledge-base", "semantic-search", "books"],
  ),
  "wjreliable-local-file-rag-basic": keepSkill(
    "local-file-rag",
    "Local File RAG",
    "Run high-performance local file RAG over company documents.",
    ["search-and-research", "rag", "local-artifact", "knowledge-base", "company-scoped", "sensitive-personal-data"],
  ),
  "mishkinf-lore": keepSkill(
    "lore-research-repository-search",
    "Lore Research Repository Search",
    "Search and ingest cited knowledge from Lore research repositories.",
    ["search-and-research", "research", "citations", "knowledge-base"],
  ),
  "webdevtodayjason-memo-persistent-memory": keepSkill(
    "agent-persistent-memory",
    "Agent Persistent Memory",
    "Automatically capture and semantically search persistent context for long-running agents.",
    ["search-and-research", "memory", "semantic-search", "company-scoped", "memory-safety"],
  ),
  "vishalgojha-message-parser": keepSkill(
    "whatsapp-export-parser",
    "WhatsApp Export Parser",
    "Parse WhatsApp exports into normalized message records for approved research and ingestion workflows.",
    ["search-and-research", "data-extraction", "messaging", "sensitive-personal-data"],
  ),
  "c5huracan-meyhem-researcher": keepSkill(
    "multi-query-deep-research",
    "Multi-Query Deep Research",
    "Run multi-query deep research with outcome tracking and reusable research quality signals.",
    ["search-and-research", "deep-research", "web-search", "research-lab"],
  ),
  "c5huracan-meyhem-search": keepSkill(
    "agent-native-web-search",
    "Agent-Native Web Search",
    "Search ranked by what helps agents complete tasks, without requiring signup.",
    ["search-and-research", "web-search", "agent-tools", "public-data"],
  ),
  "mohdalhashemi98-hue-mh-session-logs": keepSkill(
    "session-log-search",
    "Session Log Search",
    "Search and analyze local agent session logs for audit, continuity, and context recovery.",
    ["search-and-research", "logs", "knowledge-base", "context-recovery", "local-artifact"],
  ),
  "coderomaster-moss": keepSkill(
    "moss-semantic-search-reference",
    "Moss Semantic Search Reference",
    "Expose documentation and capability references for Moss semantic search.",
    ["search-and-research", "semantic-search", "knowledge-base", "developer-tools"],
  ),
  "derick001-multi-chat-context-manager": keepSkill(
    "conversation-context-manager",
    "Conversation Context Manager",
    "Store and retrieve conversation contexts per channel or user for audited context recovery.",
    ["search-and-research", "memory", "knowledge-base", "context-recovery", "company-scoped"],
  ),
  "endgegnerbert-tech-muninn": keepSkill(
    "universal-agent-context-protocol",
    "Universal Agent Context Protocol",
    "Use a context protocol for agent knowledge, state, and retrieval infrastructure.",
    ["search-and-research", "memory", "context", "agent-tools", "company-scoped"],
  ),
  "phillipneho-muninn-memory": keepSkill(
    "muninn-agent-memory",
    "Muninn Agent Memory",
    "Store and retrieve memory for AI agents in company-scoped workflows.",
    ["search-and-research", "memory", "agent-tools", "company-scoped", "memory-safety"],
  ),
  "fabe-mycroft": keepSkill(
    "local-ebook-knowledge-search",
    "Local Ebook Knowledge Search",
    "Ingest owned EPUB and ebook content into a local vector index for Q&A.",
    ["search-and-research", "rag", "books", "local-artifact", "sensitive-personal-data"],
  ),
  "codeninja23-native-typeform": keepSkill(
    "typeform-response-reader",
    "Typeform Response Reader",
    "Read Typeform forms and responses for survey research and customer discovery analysis.",
    ["search-and-research", "survey-research", "data-ingestion", "external-account", "sensitive-personal-data"],
  ),
  "dryoo-naver-shopping": keepSkill(
    "naver-product-search",
    "Naver Product Search",
    "Search Naver Shopping for product, price, and market research.",
    ["search-and-research", "product-research", "shopping-search", "market-research"],
  ),
  "naeemmaliki036-neutron-agent-memory": keepSkill(
    "neutron-agent-memory",
    "Neutron Agent Memory",
    "Store and retrieve agent memory through Neutron-backed memory services.",
    ["search-and-research", "memory", "knowledge-base", "company-scoped"],
  ),
  "raghulpasupathi-nlp-toolkit": keepSkill(
    "nlp-analysis-toolkit",
    "NLP Analysis Toolkit",
    "Run text analysis with perplexity, burstiness, entropy, and other NLP signals.",
    ["search-and-research", "nlp", "analysis", "research"],
  ),
  "johstracke-note-processor": keepSkill(
    "research-note-processor",
    "Research Note Processor",
    "Summarize and analyze research notes produced by research assistants.",
    ["search-and-research", "research", "summarization", "knowledge-base"],
  ),
  "wd041216-bit-openclaw-free-web-search": keepSkill(
    "private-web-search",
    "Private Web Search",
    "Run self-hosted SearXNG and multi-source validation for private, low-cost web research.",
    ["search-and-research", "web-search", "privacy", "self-hosted", "public-data"],
  ),
  "ehudsn-orchata": keepSkill(
    "document-rag-platform",
    "Document RAG Platform",
    "Use tree-indexed document knowledge management for search and synthesis.",
    ["search-and-research", "rag", "knowledge-base", "documents", "company-scoped"],
  ),
  "rachmann-alexander-owid-oc": keepSkill(
    "our-world-in-data-research",
    "Our World in Data Research",
    "Search, retrieve, and summarize Our World in Data content for public-data research.",
    ["search-and-research", "public-data", "research", "reporting"],
  ),
  "pors-paperzilla": keepSkill(
    "academic-paper-search",
    "Academic Paper Search",
    "Search, filter, and browse high-signal academic papers with Paperzilla.",
    ["search-and-research", "academic-research", "papers", "citations"],
  ),
  "ericsantos-perplexity-deep-search": keepSkill(
    "perplexity-deep-search",
    "Perplexity Deep Search",
    "Run deep web research through the Perplexity API for board-ready source synthesis.",
    ["search-and-research", "deep-research", "web-search", "external-account", "citations"],
  ),
  "vedantsingh60-persisent-mind": keepSkill(
    "persistent-agent-mind",
    "Persistent Agent Mind",
    "Provide persistent, searchable, context-aware memory for AI agents.",
    ["search-and-research", "memory", "knowledge-base", "company-scoped", "memory-safety"],
  ),
  "lucaspdude-persistent-private-agent-memory": keepSkill(
    "private-agent-memory-service",
    "Private Agent Memory Service",
    "Run a local persistent agent memory service with cryptographic identity controls.",
    ["search-and-research", "memory", "privacy", "local-artifact", "company-scoped"],
  ),
  "asabovetech-pocket-ai": keepSkill(
    "meeting-intelligence-search",
    "Meeting Intelligence Search",
    "Search transcriptions, voice recordings, and meeting intelligence across approved conversations.",
    ["search-and-research", "meetings", "semantic-search", "sensitive-personal-data", "company-scoped"],
  ),
  "snook550-podsips-search": keepSkill(
    "podcast-transcript-search",
    "Podcast Transcript Search",
    "Search podcast transcripts and retrieve episode data for media and market research.",
    ["search-and-research", "media-research", "transcripts", "content-research"],
  ),
  "edibez-priceforagent": keepSkill(
    "market-price-lookup",
    "Market Price Lookup",
    "Retrieve read-only real-time prices for crypto, stocks, and commodities for research context.",
    ["search-and-research", "market-data", "finance", "not-financial-advice", "public-data"],
  ),
  "charlesmulic-prior": keepSkill(
    "agent-knowledge-exchange",
    "Agent Knowledge Exchange",
    "Exchange knowledge between agents through controlled research and retrieval workflows.",
    ["search-and-research", "knowledge-base", "agent-tools", "company-scoped"],
  ),
  "killgfat-pubmed-edirect": keepSkill(
    "pubmed-literature-search",
    "PubMed Literature Search",
    "Search and retrieve PubMed literature through NCBI EDirect for biomedical research.",
    ["search-and-research", "academic-research", "biomedical", "public-data", "not-medical-advice"],
  ),
  "hannatao-qianfan-knowledgebase-search": keepSkill(
    "qianfan-knowledgebase-search",
    "Qianfan Knowledgebase Search",
    "Search Qianfan knowledge bases for enterprise RAG workflows.",
    ["search-and-research", "knowledge-base", "enterprise-search", "external-account", "company-scoped"],
  ),
  "angusthefuzz-ragflow": keepSkill(
    "ragflow-rag-client",
    "Ragflow RAG Client",
    "Use Ragflow APIs for retrieval-augmented generation over company knowledge bases.",
    ["search-and-research", "rag", "knowledge-base", "external-account", "company-scoped"],
  ),
  "hatim-be-ragie-rag": keepSkill(
    "ragie-rag-search",
    "Ragie RAG Search",
    "Execute retrieval-augmented generation through Ragie.ai for approved knowledge bases.",
    ["search-and-research", "rag", "knowledge-base", "external-account", "company-scoped"],
  ),
  "mregmi-ragora": keepSkill(
    "ragora-knowledge-search",
    "Ragora Knowledge Search",
    "Discover, search, and synthesize answers from knowledge bases through Ragora.",
    ["search-and-research", "rag", "knowledge-base", "semantic-search", "company-scoped"],
  ),
  "lifeissea-raon-os": keepSkill(
    "korean-startup-research-companion",
    "Korean Startup Research Companion",
    "Support startup research and founder strategy for Korean company workflows.",
    ["search-and-research", "startup", "research", "strategy"],
  ),
  "jakelin-rea-search": keepSkill(
    "realestate-au-property-search",
    "RealEstate.com.au Property Search",
    "Search property listings in Australia for real-estate market research.",
    ["search-and-research", "market-research", "real-estate", "public-data"],
  ),
  "ilkhamfy-research-paper-kb": keepSkill(
    "research-paper-knowledge-base",
    "Research Paper Knowledge Base",
    "Maintain a persistent cross-session knowledge base for research papers.",
    ["search-and-research", "academic-research", "knowledge-base", "papers", "company-scoped"],
  ),
  "huaruoji-research-report": keepSkill(
    "technical-research-reports",
    "Technical Research Reports",
    "Research technical projects or papers and generate comprehensive reports with export-ready structure.",
    ["search-and-research", "research", "reporting", "research-lab", "papers"],
  ),
  "myx0m0p-rss-skill": keepSkill(
    "rss-feed-retriever",
    "RSS Feed Retriever",
    "Convert RSS or Atom feeds into Markdown for monitoring and knowledge intake.",
    ["search-and-research", "rss", "news", "monitoring", "markdown"],
  ),
  "callum-kemp-ryanair-fare-finder": keepSkill(
    "ryanair-fare-research",
    "Ryanair Fare Research",
    "Build and interpret Ryanair fare-finder URLs for travel price research without booking.",
    ["search-and-research", "travel-research", "public-data"],
  ),
  "1999azzar-search-cluster": keepSkill(
    "multi-source-search-cluster",
    "Multi-Source Search Cluster",
    "Aggregate Google, Wikipedia, Reddit, NewsAPI, and RSS search results for research workflows.",
    ["search-and-research", "web-search", "multi-source", "news", "research-lab"],
  ),
  "kambrosgroup-seo-content-engine": keepSkill(
    "seo-content-research-engine",
    "SEO Content Research Engine",
    "Run an end-to-end SEO content research workflow for marketing teams.",
    ["search-and-research", "seo", "content-research", "marketing"],
  ),
  "seanwyngaard-seo-content-factory": keepSkill(
    "serp-aware-seo-content-factory",
    "SERP-Aware SEO Content Factory",
    "Generate SEO content drafts backed by keyword, competitor, and SERP research.",
    ["search-and-research", "seo", "content-research", "competitive-intel", "draft-only"],
  ),
  "aaron-he-zhu-seo-content-writer": keepSkill(
    "seo-content-writer",
    "SEO Content Writer",
    "Draft SEO content and articles from reviewed keyword and SERP research.",
    ["search-and-research", "seo", "writing", "content-research", "draft-only"],
  ),
  "h4gen-seo-ranker": keepSkill(
    "seo-ranker",
    "SEO Ranker",
    "Orchestrate SEO auditing and on-page optimization research.",
    ["search-and-research", "seo", "audit", "market-research"],
  ),
  "aaron-he-zhu-serp-analysis": keepSkill(
    "serp-analysis",
    "SERP Analysis",
    "Analyze search results, ranking pages, SERP features, and competitive content gaps.",
    ["search-and-research", "seo", "competitive-intel", "serp", "market-research"],
  ),
  "amor71-session-history": keepSkill(
    "session-history-search",
    "Session History Search",
    "Search and browse past conversation history for continuity, audit, and context recovery.",
    ["search-and-research", "memory", "audit", "context-recovery", "company-scoped"],
  ),
  "nantes-simplemem": keepSkill(
    "simple-agent-memory",
    "Simple Agent Memory",
    "Use semantic compression and intent-aware retrieval for lifelong LLM agent memory.",
    ["search-and-research", "memory", "retrieval", "semantic-search", "company-scoped"],
  ),
  "christopher-schulze-skill-miner": keepSkill(
    "skill-miner",
    "Skill Miner",
    "Research ClawHub skills and create clean skill summaries for marketplace review.",
    ["search-and-research", "marketplace", "skill-research", "agent-tools"],
  ),
  "alexyuui-skill-seo": keepSkill(
    "skill-seo-optimizer",
    "Skill SEO Optimizer",
    "Optimize marketplace skills for discoverability and AI search visibility.",
    ["search-and-research", "marketplace", "seo", "ai-seo"],
  ),
  "yx2601816404-sys-skill-store": keepSkill(
    "skill-store-advisor",
    "Skill Store Advisor",
    "Advise on skill discovery and installation choices from ClawHub-style marketplaces.",
    ["search-and-research", "marketplace", "discovery", "agent-tools"],
  ),
  "skywork-search": keepSkill(
    "skywork-web-search",
    "Skywork Web Search",
    "Retrieve up-to-date web content through Skywork search for real-time research.",
    ["search-and-research", "web-search", "real-time", "public-data"],
  ),
  "atyachin-social-intelligence": keepSkill(
    "social-intelligence-research",
    "Social Intelligence Research",
    "Research social media conversations across Twitter, Instagram, and Reddit in read-only mode.",
    ["search-and-research", "social-listening", "market-research", "sensitive-personal-data"],
  ),
  "fortunto2-solo-audit": keepSkill(
    "knowledge-base-health-audit",
    "Knowledge Base Health Audit",
    "Check knowledge bases for broken links, missing frontmatter, tag issues, and coverage gaps.",
    ["search-and-research", "knowledge-base", "audit", "qa"],
  ),
  "fortunto2-solo-seo-audit": keepSkill(
    "seo-health-audit",
    "SEO Health Audit",
    "Analyze URLs for metadata, Open Graph, JSON-LD, sitemaps, robots.txt, SERP positions, and SEO health.",
    ["search-and-research", "seo", "audit", "public-data"],
  ),
  "zanderd18s-stackunderflow": keepSkill(
    "verified-community-knowledge-retrieval",
    "Verified Community Knowledge Retrieval",
    "Retrieve answers from a verified community knowledge base for technical support and research.",
    ["search-and-research", "knowledge-base", "community-research", "qa"],
  ),
  "ktdmax-supaskills": keepSkill(
    "supaskills-search",
    "SupaSkills Search",
    "Search and load quality-scored expert skills from SupaSkills.ai for marketplace research.",
    ["search-and-research", "marketplace", "discovery", "agent-tools"],
  ),
  "heldinhow-super-research": keepSkill(
    "super-research-framework",
    "Super Research Framework",
    "Combine multiple research techniques into one high-signal research workflow.",
    ["search-and-research", "deep-research", "research-lab", "citations"],
  ),
  "maverick-software-surrealdb-knowledge-graph-memory": keepSkill(
    "surrealdb-knowledge-graph-memory",
    "SurrealDB Knowledge Graph Memory",
    "Use semantic, episodic, working, and graph memory for richer company knowledge retrieval.",
    ["search-and-research", "knowledge-graph", "memory", "semantic-search", "company-scoped"],
  ),
  "tokisakix-swiftscholar-skill": keepSkill(
    "swiftscholar-academic-search",
    "SwiftScholar Academic Search",
    "Search and analyze academic papers through the SwiftScholar API.",
    ["search-and-research", "academic-research", "papers", "external-account"],
  ),
  "abeperl-torah-scholar": keepSkill(
    "sefaria-text-research",
    "Sefaria Text Research",
    "Search and explore Torah, Tanach, Talmud, Midrash, and commentaries through Sefaria.",
    ["search-and-research", "reference", "research", "public-data"],
  ),
  "atyachin-twitter-api-alternative": keepSkill(
    "twitter-search-export",
    "Twitter Search Export",
    "Search tweets with natural-language and boolean filters, then export research results in read-only mode.",
    ["search-and-research", "social-listening", "research", "public-data", "sensitive-personal-data"],
  ),
  "nikolaybohdanov-twitterscore": keepSkill(
    "twitter-influence-research",
    "Twitter Influence Research",
    "Research, analyze, and track Twitter influence signals for brand and market intelligence.",
    ["search-and-research", "social-listening", "social-intelligence", "market-research"],
  ),
  "naeemmaliki036-vanar-neutron-memory": keepSkill(
    "vanar-agent-memory",
    "Vanar Agent Memory",
    "Store and retrieve agent memory using Vanar Neutron APIs.",
    ["search-and-research", "memory", "retrieval", "company-scoped"],
  ),
  "lyz1990-variflight": keepSkill(
    "variflight-travel-data-query",
    "Variflight Travel Data Query",
    "Query flight, train, and travel data through Variflight for logistics research.",
    ["search-and-research", "travel-research", "public-data"],
  ),
  "aholake-vietstock": keepSkill(
    "vietnam-market-price-monitor",
    "Vietnam Market Price Monitor",
    "Monitor Vietnamese stock prices and indexes as read-only market data.",
    ["search-and-research", "market-data", "finance", "monitoring", "not-financial-advice"],
  ),
  "glitch003-vincent-twitter": keepSkill(
    "twitter-read-only-research",
    "Twitter Read-Only Research",
    "Search tweets and retrieve profiles or recent tweets for social listening.",
    ["search-and-research", "social-listening", "research", "public-data"],
  ),
  "zjianru-web-search-pro": keepSkill(
    "web-search-pro",
    "Web Search Pro",
    "Run search, retrieval, extract, crawl, map, and research flows with explainable routing.",
    ["search-and-research", "web-search", "deep-research", "research-lab", "public-data"],
  ),
  "urrrich-wiki-retriever": keepSkill(
    "wiki-retriever",
    "Wiki Retriever",
    "Retrieve wiki knowledge for source-aware research tasks.",
    ["search-and-research", "knowledge-base", "wiki", "reference"],
  ),
  "rachmann-alexander-wikipedia-oc": keepSkill(
    "wikipedia-retriever",
    "Wikipedia Retriever",
    "Search, retrieve, and summarize English Wikipedia content for reference research.",
    ["search-and-research", "reference", "wikipedia", "public-data"],
  ),
  "femto-worldbook": keepSkill(
    "worldbook-knowledge-cli",
    "Worldbook Knowledge CLI",
    "Query and manage world knowledge for AI agents.",
    ["search-and-research", "knowledge-base", "reference", "agent-tools"],
  ),
  "jack4world-x-actionbook-recap": keepSkill(
    "x-account-recap",
    "X Account Recap",
    "Collect and summarize recent X posts for approved accounts in read-only research mode.",
    ["search-and-research", "social-listening", "summarization", "monitoring"],
  ),
  "vmathur-x-monitor": keepSkill(
    "x-account-monitor",
    "X Account Monitor",
    "Monitor X accounts and surface noteworthy posts on a configurable schedule.",
    ["search-and-research", "social-listening", "monitoring", "public-data"],
  ),
  "minilozio-x-research-but-cheaper": keepSkill(
    "x-research-twitterapi",
    "X Research via TwitterAPI.io",
    "Run research-focused X/Twitter search using TwitterAPI.io in read-only mode.",
    ["search-and-research", "social-listening", "research", "external-account"],
  ),
  "xuyuan0805-xy-pubmed-pdf-downloader": keepSkill(
    "pubmed-pdf-downloader",
    "PubMed PDF Downloader",
    "Download papers from PubMed Central and Europe PMC for approved literature review workflows.",
    ["search-and-research", "academic-research", "papers", "biomedical", "not-medical-advice"],
  ),
  "hxy9243-zettel-link": keepSkill(
    "zettelkasten-note-search",
    "Zettelkasten Note Search",
    "Maintain note embeddings for Zettelkasten search, retrieval, and discovery.",
    ["search-and-research", "knowledge-base", "notes", "semantic-search", "company-scoped"],
  ),
  "emre-koc-zvec-local-rag-service": keepSkill(
    "local-zvec-rag-service",
    "Local Zvec RAG Service",
    "Run an always-on local semantic search service with zvec and Ollama embeddings.",
    ["search-and-research", "rag", "local-artifact", "semantic-search", "company-scoped"],
  ),
  "canxiangcc-aminer-open-academic": keepSkill(
    "aminer-academic-search",
    "AMiner Academic Search",
    "Query AMiner academic resources and acquire academic data for research workflows.",
    ["search-and-research", "academic-research", "public-data", "papers"],
  ),
  "kriptoburak-xquik-x-twitter-scraper": keepSkill(
    "x-research-scraper",
    "X Research Scraper",
    "Search and extract X/Twitter data for approved social listening and research workflows.",
    ["search-and-research", "social-listening", "research", "external-account", "sensitive-personal-data"],
  ),
};



const SELF_HOSTED_AUTOMATION_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "bjesuiter-bridle": keepSkill(
    "assistant-config-manager",
    "Assistant Config Manager",
    "Manage AI coding assistant configuration in a controlled, reviewable way for self-hosted PaperClaw workspaces.",
    ["self-hosted", "automation", "config", "workspace-sync", "developer-ops", "company-scoped"],
  ),
  "arakichanxd-claw-sync": keepSkill(
    "openclaw-workspace-sync",
    "OpenClaw Workspace Sync",
    "Synchronize OpenClaw memory and workspace state for approved self-hosted agent operations.",
    ["self-hosted", "automation", "workspace-sync", "backup", "openclaw", "company-scoped", "memory-safety"],
  ),
  "zfanmy-cron-backup": keepSkill(
    "scheduled-backup-manager",
    "Scheduled Backup Manager",
    "Set up scheduled backups with version tracking, cleanup, and retention notes for operator review.",
    ["self-hosted", "automation", "backup", "retention", "ops", "host-mutation", "requires-human-confirmation"],
  ),
  "nickian-freshrss-reader": keepSkill(
    "freshrss-reader",
    "FreshRSS Reader",
    "Query headlines and articles from a self-hosted FreshRSS instance for research intake and monitoring.",
    ["self-hosted", "rss", "research", "monitoring", "knowledge-intake", "external-account"],
  ),
  "jmagar-gotify": keepSkill(
    "gotify-notifications",
    "Gotify Notifications",
    "Send self-hosted push notifications when long-running PaperClaw tasks, builds, or research jobs complete.",
    ["self-hosted", "notifications", "ops", "alerts", "external-account", "requires-human-confirmation"],
  ),
  "kowl64-n8n-workflow-automation": keepSkill(
    "n8n-workflow-designer",
    "n8n Workflow Designer",
    "Design n8n workflow JSON for human review without activating production automations directly.",
    ["self-hosted", "automation", "n8n", "workflow-design", "draft-only", "requires-human-confirmation"],
  ),
  "nickchristensen-paperless": keepSkill(
    "paperless-ngx-document-ops",
    "Paperless-NGX Document Ops",
    "Search, upload, download, and manage metadata in a self-hosted Paperless-NGX document system through approved access.",
    ["self-hosted", "documents", "records", "knowledge-base", "external-account", "sensitive-personal-data"],
  ),
  "felipeoff-sonarqube-analyzer": keepSkill(
    "sonarqube-issue-analyzer",
    "SonarQube Issue Analyzer",
    "Analyze self-hosted SonarQube issues and prepare code-quality recommendations for engineering review.",
    ["self-hosted", "code-quality", "analysis", "qa", "developer-ops", "external-account"],
  ),
};



const SPEECH_TRANSCRIPTION_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "dagmawibabi-addis-assistant-stt": keepSkill(
    "addis-assistant-stt",
    "Addis Assistant STT",
    "Transcribe speech into text for meetings, voice notes, accessibility, and multilingual support workflows.",
    ["speech-and-transcription", "speech-to-text", "transcription", "meetings", "accessibility", "sensitive-personal-data"],
  ),
  "tristanmanchester-assemblyai-transcribe": keepSkill(
    "assemblyai-transcription",
    "AssemblyAI Transcription",
    "Transcribe audio and video with AssemblyAI for meeting notes, customer calls, and Research Lab artifacts.",
    ["speech-and-transcription", "speech-to-text", "transcription", "meetings", "external-account", "sensitive-personal-data"],
  ),
  "udiedrichsen-audio-gen": keepSkill(
    "audio-content-generator",
    "Audio Content Generator",
    "Generate audiobooks, podcasts, educational audio, and narrated internal media from reviewed scripts.",
    ["speech-and-transcription", "text-to-speech", "audio-generation", "content-audio", "requires-human-confirmation"],
  ),
  "matrixy-audio-reply-skill": keepSkill(
    "audio-reply-tts",
    "Audio Reply TTS",
    "Generate short spoken replies and voice-note style responses for accessibility and support workflows.",
    ["speech-and-transcription", "text-to-speech", "voice-notes", "accessibility", "requires-human-confirmation"],
  ),
  "neal-collab-auto-whisper-safe": keepSkill(
    "ram-safe-whisper-transcription",
    "RAM-Safe Whisper Transcription",
    "Run local Whisper transcription with auto-chunking on smaller machines for private audio workflows.",
    ["speech-and-transcription", "speech-to-text", "transcription", "local-ai", "privacy", "meetings", "sensitive-personal-data"],
  ),
  "hudeven-chichi-speech": keepSkill(
    "chichi-speech-tts",
    "Chichi Speech TTS",
    "Use a RESTful Qwen-based text-to-speech service for demos, support audio, and multilingual accessibility.",
    ["speech-and-transcription", "text-to-speech", "voice-generation", "multilingual", "external-account", "requires-human-confirmation"],
  ),
  "yuval-deepdub-deepdub-tts": keepSkill(
    "deepdub-tts",
    "Deepdub TTS",
    "Generate reviewed speech audio with Deepdub for multilingual demos, dubbed summaries, and media artifacts.",
    ["speech-and-transcription", "text-to-speech", "voice-generation", "multilingual", "external-account", "requires-human-confirmation"],
  ),
  "nerkn-deepgram": keepSkill(
    "deepgram-stt-cli",
    "Deepgram STT CLI",
    "Transcribe meeting, support, and voice-note audio with Deepgram speech-to-text.",
    ["speech-and-transcription", "speech-to-text", "transcription", "meetings", "external-account", "sensitive-personal-data"],
  ),
  "xdrshjr-doubao-api-open-tts": keepSkill(
    "doubao-tts",
    "Doubao TTS",
    "Generate multilingual speech audio through Doubao for demos, accessibility, and narrated reports.",
    ["speech-and-transcription", "text-to-speech", "voice-generation", "multilingual", "external-account", "requires-human-confirmation"],
  ),
  "paulasjes-elevenlabs-transcribe": keepSkill(
    "elevenlabs-transcription",
    "ElevenLabs Transcription",
    "Transcribe audio to text with ElevenLabs for approved meetings, support calls, and voice notes.",
    ["speech-and-transcription", "speech-to-text", "transcription", "meetings", "external-account", "sensitive-personal-data"],
  ),
  "shaharsha-elevenlabs-tts": keepSkill(
    "elevenlabs-tts",
    "ElevenLabs TTS",
    "Generate neutral spoken audio for demos, accessibility, narrated outputs, and reviewed support workflows.",
    ["speech-and-transcription", "text-to-speech", "voice-generation", "external-account", "requires-human-confirmation"],
  ),
  "theplasmak-faster-whisper": keepSkill(
    "local-faster-whisper-transcription",
    "Local Faster-Whisper Transcription",
    "Run private local speech-to-text with faster-whisper for meetings, interviews, and voice notes.",
    ["speech-and-transcription", "speech-to-text", "transcription", "local-ai", "privacy", "meetings", "sensitive-personal-data"],
  ),
  "kevin37li-gettr-transcribe-summarize": keepSkill(
    "gettr-audio-transcriber",
    "GETTR Audio Transcriber",
    "Download, transcribe, and summarize audio from GETTR posts for social-audio research and Research Lab demos.",
    ["speech-and-transcription", "speech-to-text", "transcription", "summarization", "social-audio", "public-data"],
  ),
  "edkief-kokoro-tts": keepSkill(
    "local-kokoro-tts",
    "Local Kokoro TTS",
    "Generate private local spoken audio from text using Kokoro TTS.",
    ["speech-and-transcription", "text-to-speech", "voice-generation", "local-ai", "privacy", "requires-human-confirmation"],
  ),
  "adriano-vr-ressemble": keepSkill(
    "resemble-speech-api",
    "Resemble Speech API",
    "Use Resemble AI for approved text-to-speech and speech-to-text workflows.",
    ["speech-and-transcription", "speech-to-text", "text-to-speech", "voice-generation", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "lilei0311-siliconflow-tts-gen": keepSkill(
    "siliconflow-tts",
    "SiliconFlow TTS",
    "Generate speech audio with SiliconFlow CosyVoice2 for multilingual demos and accessibility workflows.",
    ["speech-and-transcription", "text-to-speech", "voice-generation", "multilingual", "external-account", "requires-human-confirmation"],
  ),
};



const TRANSPORTATION_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "iclems-airfrance-afkl": keepSkill(
    "air-france-flight-status",
    "Air France Flight Status",
    "Track Air France and KLM flights for executive travel operations, delay monitoring, and itinerary updates.",
    ["transportation", "flights", "airline", "flight-status", "travel-ops", "external-account"],
  ),
  "mohammedfarish-al-khanjry-bus": keepSkill(
    "oman-bus-route-lookup",
    "Oman Bus Route Lookup",
    "Research Oman private bus routes, durations, and border-aware travel options.",
    ["transportation", "bus", "route-planning", "regional-transit", "travel-research"],
  ),
  "kirorab-amadeus-flights": keepSkill(
    "flight-offer-research",
    "Flight Offer Research",
    "Query flight schedules, prices, and availability for human-approved travel booking preparation.",
    ["transportation", "flights", "pricing", "availability", "booking-research", "external-account", "requires-human-confirmation"],
  ),
  "manmal-a-nach-b": keepSkill(
    "austria-transit-planner",
    "Austria Transit Planner",
    "Plan Austrian public transport journeys with VOR AnachB data.",
    ["transportation", "public-transit", "austria", "route-planning", "journey-planning"],
  ),
  "dimitryvin-aviation-weather": keepSkill(
    "aviation-weather-monitor",
    "Aviation Weather Monitor",
    "Fetch METAR, TAF, and PIREP data for flight-risk and travel-operations research.",
    ["transportation", "aviation", "weather", "flight-ops", "flight-status"],
  ),
  "copey02-aviationstack-flight-tracker": keepSkill(
    "aviationstack-flight-tracker",
    "Aviationstack Flight Tracker",
    "Track real-time flight status for travel coordination and disruption monitoring.",
    ["transportation", "flights", "tracking", "flight-status", "travel-ops", "external-account"],
  ),
  "tobiasbischoff-bahn": keepSkill(
    "deutsche-bahn-planner",
    "Deutsche Bahn Planner",
    "Search German rail connections for itinerary, commute, and logistics planning.",
    ["transportation", "rail", "germany", "route-planning", "public-transit"],
  ),
  "jaysonsantos-bvg-route": keepSkill(
    "berlin-transit-route-planner",
    "Berlin Transit Route Planner",
    "Plan Berlin BVG public transport routes for agent-managed travel research.",
    ["transportation", "transit", "berlin", "route-planning", "public-transport"],
  ),
  "james-southendsolutions-camino-ev-charger": keepSkill(
    "camino-ev-charger-finder",
    "Camino EV Charger Finder",
    "Find EV charging stations near destinations or along planned routes.",
    ["transportation", "ev-charging", "route-planning", "fleet", "travel-ops", "external-account"],
  ),
  "james-southendsolutions-camino-journey": keepSkill(
    "multi-stop-journey-optimizer",
    "Multi-Stop Journey Optimizer",
    "Plan feasible multi-waypoint trips with route, logistics, and time-budget constraints.",
    ["transportation", "route-optimization", "multi-stop", "logistics", "travel-planning", "external-account"],
  ),
  "james-southendsolutions-camino-route": keepSkill(
    "point-to-point-route-planner",
    "Point-to-Point Route Planner",
    "Get distance, duration, and directions between two locations for travel and logistics planning.",
    ["transportation", "routing", "route-planning", "directions", "logistics", "travel-planning", "external-account"],
  ),
  "james-southendsolutions-camino-safety-checker": keepSkill(
    "travel-safety-nearby-finder",
    "Travel Safety Nearby Finder",
    "Find nearby 24-hour businesses, transit stations, hospitals, and public safety anchors around a location.",
    ["transportation", "travel-safety", "location-research", "risk", "field-ops", "external-account"],
  ),
  "james-southendsolutions-camino-travel-planner": keepSkill(
    "day-trip-itinerary-planner",
    "Day Trip Itinerary Planner",
    "Build day trips, walking tours, and timed multi-stop itineraries for human review.",
    ["transportation", "travel-planning", "itinerary", "walking-tour", "route-planning", "external-account"],
  ),
  "brianleach-capmetro-skill": keepSkill(
    "austin-capmetro-status",
    "Austin CapMetro Status",
    "Check Austin CapMetro arrivals, alerts, vehicles, routes, and trip plans.",
    ["transportation", "transit", "austin", "realtime", "service-alerts", "public-transport"],
  ),
  "borahm-charger": keepSkill(
    "ev-charger-availability-checker",
    "EV Charger Availability Checker",
    "Search nearby or favorite EV charger availability through Google Places.",
    ["transportation", "ev-charging", "availability", "fleet", "route-planning", "external-account"],
  ),
  "copey02-copey-flight-tracker": keepSkill(
    "flight-status-tracker",
    "Flight Status Tracker",
    "Track real-time flight status, delays, and disruption signals for travel operations.",
    ["transportation", "flights", "flight-status", "delays", "travel-ops"],
  ),
  "cta": keepSkill(
    "chicago-cta-status",
    "Chicago CTA Status",
    "Check Chicago CTA train and bus arrivals, predictions, and service alerts.",
    ["transportation", "transit", "chicago", "realtime", "service-alerts", "public-transport"],
  ),
  "mmichelli-db-travel": keepSkill(
    "deutsche-bahn-journey-planner",
    "Deutsche Bahn Journey Planner",
    "Plan rail journeys across Germany and Europe with Deutsche Bahn data.",
    ["transportation", "rail", "germany", "europe", "journey-planning", "public-transit"],
  ),
  "mmichelli-entur-travel": keepSkill(
    "norway-transit-planner",
    "Norway Transit Planner",
    "Plan Norwegian public transit trips through Entur.",
    ["transportation", "transit", "norway", "journey-planning", "public-transport"],
  ),
  "awlevin-flight-search": keepSkill(
    "flight-search-researcher",
    "Flight Search Researcher",
    "Search flight options by price, time, and airline for human-reviewed travel decisions.",
    ["transportation", "flights", "fare-search", "travel-research", "booking-prep", "requires-human-confirmation"],
  ),
  "xenofex7-flight-tracker": keepSkill(
    "flight-schedule-tracker",
    "Flight Schedule Tracker",
    "Track flight schedules and status for managed travel coordination.",
    ["transportation", "flights", "flight-status", "scheduling", "travel-ops"],
  ),
  "hugosbl-french-services": keepSkill(
    "france-rail-services",
    "France Rail Services",
    "Access French train and SNCF service data for travel planning and status checks.",
    ["transportation", "travel", "rail", "france", "transit-status", "public-transport"],
  ),
  "weltspion-geomanic": keepSkill(
    "gps-travel-data-manager",
    "GPS Travel Data Manager",
    "Query and manage privacy-conscious GPS trip history for travel, field, or fleet research.",
    ["transportation", "gps", "fleet-research", "travel-data", "location", "sensitive-personal-data"],
  ),
  "gumadeiras-gotrain": keepSkill(
    "nyc-regional-train-departures",
    "NYC Regional Train Departures",
    "Check NYC Subway, LIRR, and Metro-North departures.",
    ["transportation", "rail", "nyc", "transit-status", "commute", "public-transport"],
  ),
  "tomfong-hk-bus-eta": keepSkill(
    "hong-kong-bus-eta",
    "Hong Kong Bus ETA",
    "Get real-time Hong Kong bus arrival predictions for KMB, LWB, and Citybus.",
    ["transportation", "bus", "hong-kong", "transit-status", "eta", "public-transport"],
  ),
  "anthonymq-idfm-journey-navitia": keepSkill(
    "paris-region-journey-planner",
    "Paris Region Journey Planner",
    "Query IDFM and Navitia journey data for Ile-de-France transit planning.",
    ["transportation", "transit", "paris", "route-planning", "navitia", "public-transport"],
  ),
  "brianleach-metra": keepSkill(
    "chicago-metra-status",
    "Chicago Metra Status",
    "Check Chicago Metra commuter rail arrivals, vehicle tracking, alerts, and schedules.",
    ["transportation", "rail", "chicago", "transit-status", "commute", "service-alerts"],
  ),
  "brianleach-mta": keepSkill(
    "nyc-mta-transit-status",
    "NYC MTA Transit Status",
    "Check NYC subway, bus, route, and service alert information.",
    ["transportation", "transit", "nyc", "bus", "rail", "service-alerts"],
  ),
  "lars147-mvg-cli": keepSkill(
    "munich-mvg-transit-tracker",
    "Munich MVG Transit Tracker",
    "Query Munich public transport and S-Bahn live tracking.",
    ["transportation", "transit", "munich", "rail", "route-planning", "live-status"],
  ),
  "gekacross-personal-travel": keepSkill(
    "travel-planning-assistant",
    "Travel Planning Assistant",
    "Plan itineraries, compare travel options, and organize human-approved trip details.",
    ["transportation", "travel", "itinerary", "travel-planning", "human-approval", "requires-human-confirmation"],
  ),
  "brianleach-tfl": keepSkill(
    "london-transit-status",
    "London Transit Status",
    "Check TfL arrivals, disruptions, line status, and journey plans for London travel operations.",
    ["transportation", "transit", "london", "transit-status", "route-planning", "service-alerts"],
  ),
  "rafaforesightai-track-flight": keepSkill(
    "live-flight-status-tracker",
    "Live Flight Status Tracker",
    "Track live flight status, gate changes, delays, and position for travel coordination.",
    ["transportation", "flights", "flight-status", "gates", "delays", "travel-ops"],
  ),
  "alanburchill-translink-cli": keepSkill(
    "translink-transit-data",
    "Translink Transit Data",
    "Query and explain SEQ Translink GTFS static and realtime transit data.",
    ["transportation", "transit", "gtfs", "realtime", "australia", "public-transport"],
  ),
  "aszelem-travel-agent": keepSkill(
    "human-approved-flight-booking",
    "Human-Approved Flight Booking",
    "Find, book, and change flights through email with explicit human oversight.",
    ["transportation", "flights", "booking", "email", "human-approval", "requires-human-confirmation", "external-account"],
  ),
};



const CLAWDBOT_TOOLS_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "matrixy-agent-browser-clawdbot": keepSkill(
    "agent-browser-automation",
    "Agent Browser Automation",
    "Run controlled headless browser automation for QA, research, and approved operations tasks.",
    ["clawdbot-tools", "browser-automation", "qa", "ops", "agent-tools", "requires-human-confirmation"],
  ),
  "plgonzalezrx8-agent-builder": keepSkill(
    "agent-builder",
    "Agent Builder",
    "Build and refine PaperClaw-style agents, roles, instructions, and onboarding artifacts.",
    ["clawdbot-tools", "agent-operations", "agent-onboarding", "research-lab", "developer-tools"],
  ),
  "agentandbot-design-agents-manager": keepSkill(
    "agent-directory-manager",
    "Agent Directory Manager",
    "Discover, profile, and track agents for company coordination and governance.",
    ["clawdbot-tools", "agent-directory", "coordination", "operations", "agent-ops"],
  ),
  "kevin19830331-bluebubbles": keepSkill(
    "bluebubbles-channel-plugin",
    "BlueBubbles Channel Plugin",
    "Build or maintain a BlueBubbles external messaging channel plugin for approved communication workflows.",
    ["clawdbot-tools", "messaging", "external-channel", "ops", "external-account", "requires-human-confirmation"],
  ),
  "enderfga-claude-code-skill": keepSkill(
    "claude-code-mcp-integration",
    "Claude Code MCP Integration",
    "Configure MCP integration for Claude Code and coding-agent workflows.",
    ["clawdbot-tools", "mcp", "coding-agents", "developer-tools", "agent-adapters"],
  ),
  "azaidi94-claude-code-usage": keepSkill(
    "claude-code-usage-monitor",
    "Claude Code Usage Monitor",
    "Check Claude Code OAuth usage limits for cost, capacity, and agent-ops planning.",
    ["clawdbot-tools", "usage-limits", "cost-control", "agent-ops", "monitoring"],
  ),
  "tunaissacoding-claude-connect": keepSkill(
    "claude-connector",
    "Claude Connector",
    "Connect Claude-based agents to PaperClaw-style workflows and adapter operations.",
    ["clawdbot-tools", "agent-adapters", "integration", "agent-ops", "external-account"],
  ),
  "apollostreetcompany-clauditor": keepSkill(
    "agent-audit-watchdog",
    "Agent Audit Watchdog",
    "Monitor agent activity with tamper-resistant audit checks for safer operations.",
    ["clawdbot-tools", "audit", "security", "agent-monitoring", "agent-safety"],
  ),
  "thesethrose-clawdbot-security-check": keepSkill(
    "agent-security-check",
    "Agent Security Check",
    "Run read-only security checks for Clawdbot and PaperClaw-style agent environments.",
    ["clawdbot-tools", "security", "read-only", "best-practices", "agent-safety"],
  ),
  "pasogott-clawdbot-skill-update": keepSkill(
    "skill-backup-and-update",
    "Skill Backup And Update",
    "Back up, update, and restore skill installations for reviewed agent workspaces.",
    ["clawdbot-tools", "backup", "maintenance", "skill-management", "requires-human-confirmation"],
  ),
  "udiedrichsen-clawdbot-sync": keepSkill(
    "agent-skill-sync",
    "Agent Skill Sync",
    "Synchronize memory, preferences, and skills between approved agents.",
    ["clawdbot-tools", "sync", "agent-ops", "memory", "company-scoped", "requires-human-confirmation"],
  ),
  "hopyky-clawdbot-update-plus": keepSkill(
    "agent-update-plus",
    "Agent Update Plus",
    "Back up, update, and restore Clawdbot or PaperClaw-style installations.",
    ["clawdbot-tools", "backup", "maintenance", "agent-ops", "requires-human-confirmation"],
  ),
  "nicholasspisak-clawddocs": keepSkill(
    "claw-documentation-navigator",
    "Claw Documentation Navigator",
    "Help agents navigate Clawdbot, OpenClaw, and PaperClaw documentation and decisions.",
    ["clawdbot-tools", "documentation", "agent-onboarding", "knowledge-base", "agent-ops"],
  ),
  "nukewire-clawdefender": keepSkill(
    "agent-input-defender",
    "Agent Input Defender",
    "Scan and sanitize risky inputs before agent workflows consume them.",
    ["clawdbot-tools", "security", "prompt-safety", "input-validation", "agent-safety", "untrusted-content"],
  ),
  "ajspig-honcho-setup": keepSkill(
    "honcho-memory-setup",
    "Honcho Memory Setup",
    "Configure persistent cross-session memory for long-running approved agents.",
    ["clawdbot-tools", "memory", "state-persistence", "agent-ops", "company-scoped"],
  ),
  "maverick-software-maton-agent-tools": keepSkill(
    "maton-saas-connector",
    "Maton SaaS Connector",
    "Connect agents to SaaS tools through Maton AI for approved operations workflows.",
    ["clawdbot-tools", "saas-ops", "integrations", "external-account", "requires-human-confirmation"],
  ),
  "nantes-mcp-client": keepSkill(
    "mcp-client",
    "MCP Client",
    "Connect agents to MCP tools, data sources, and services.",
    ["clawdbot-tools", "mcp", "tooling", "agent-ops", "integrations"],
  ),
  "al-one-mcp-hass": keepSkill(
    "home-assistant-mcp",
    "Home Assistant MCP",
    "Query or control approved Home Assistant devices through MCP with operator oversight.",
    ["clawdbot-tools", "smart-home", "facilities", "mcp", "physical-device-control", "requires-human-confirmation"],
  ),
  "pkycy-meegle-mcp-skill": keepSkill(
    "meegle-mcp-connector",
    "Meegle MCP Connector",
    "Let agents interact with Meegle project management through MCP.",
    ["clawdbot-tools", "project-management", "mcp", "ops", "external-account"],
  ),
  "maverick-software-pipedream-connect": keepSkill(
    "pipedream-api-connector",
    "Pipedream API Connector",
    "Connect agents to managed OAuth API workflows through Pipedream.",
    ["clawdbot-tools", "api-automation", "oauth", "ops", "external-account", "requires-human-confirmation"],
  ),
  "c-joey-provider-sync": keepSkill(
    "provider-model-sync",
    "Provider Model Sync",
    "Sync provider model metadata into OpenClaw or PaperClaw configuration.",
    ["clawdbot-tools", "model-routing", "config", "agent-ops", "company-scoped"],
  ),
  "maverick-software-zapier-mcp": keepSkill(
    "zapier-mcp-connector",
    "Zapier MCP Connector",
    "Connect agents to Zapier MCP for approved app automation workflows.",
    ["clawdbot-tools", "automation", "mcp", "saas-ops", "external-account", "requires-human-confirmation"],
  ),
};



const MOLTBOOK_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "orosha-ai-agent-relay-digest": keepSkill(
    "agent-conversation-digest",
    "Agent Conversation Digest",
    "Create curated digests of agent conversations for review, handoff, and board reporting.",
    ["moltbook", "agent-coordination", "summaries", "ops", "knowledge-base"],
  ),
  "tjamescouch-agentchat": keepSkill(
    "agentchat-protocol",
    "AgentChat Protocol",
    "Enable real-time agent-to-agent communication through the AgentChat protocol.",
    ["moltbook", "agent-communication", "coordination", "protocol", "agent-ops"],
  ),
  "hukifl1-clankedin": keepSkill(
    "agent-professional-network",
    "Agent Professional Network",
    "Register agents, post updates, and manage useful agent-network connections.",
    ["moltbook", "agent-directory", "agent-social", "coordination", "external-account", "requires-human-confirmation"],
  ),
  "kbanc85-claudia-agent-rms": keepSkill(
    "agent-relationship-memory",
    "Agent Relationship Memory",
    "Remember and track agent interactions across Moltbook-style networks.",
    ["moltbook", "agent-memory", "coordination", "relationship-management", "company-scoped"],
  ),
  "promadgenius-ez-cronjob": keepSkill(
    "cron-job-troubleshooter",
    "Cron Job Troubleshooter",
    "Diagnose and fix common cron and job automation failures.",
    ["moltbook", "cron", "job-automation", "ops", "developer-ops"],
  ),
  "mrzilvis-fieldy-ai-webhook": keepSkill(
    "fieldy-webhook-transform",
    "Fieldy Webhook Transform",
    "Wire Fieldy webhook transforms into agent hooks.",
    ["moltbook", "webhooks", "ops", "automation", "external-account"],
  ),
  "local-gohome": keepSkill(
    "gohome-ops-client",
    "GoHome Ops Client",
    "Test or operate GoHome through gRPC discovery, metrics, and approved controls.",
    ["moltbook", "grpc", "metrics", "ops", "requires-human-confirmation"],
  ),
  "ttulttul-mailchannels": keepSkill(
    "mailchannels-email-ops",
    "MailChannels Email Ops",
    "Send email and ingest signed inbound events through MailChannels.",
    ["moltbook", "email", "webhooks", "ops", "external-account", "requires-human-confirmation"],
  ),
  "drjmz-molt-trust": keepSkill(
    "agent-trust-analytics",
    "Agent Trust Analytics",
    "Analyze Moltbook-style agent trust and reputation signals.",
    ["moltbook", "analytics", "agent-social", "trust", "coordination"],
  ),
  "mattprd-moltbook": keepSkill(
    "moltbook-agent-network",
    "Moltbook Agent Network",
    "Interact with Moltbook when agent social coordination is useful.",
    ["moltbook", "agent-social", "coordination", "external-account", "requires-human-confirmation"],
  ),
  "lunarcmd-moltbook-interact": keepSkill(
    "moltbook-interaction-client",
    "Moltbook Interaction Client",
    "Post, read, and coordinate through Moltbook-style agent-network workflows.",
    ["moltbook", "agent-social", "coordination", "external-account", "requires-human-confirmation"],
  ),
  "oyi77-joko-moltbook": keepSkill(
    "joko-moltbook-client",
    "Joko Moltbook Client",
    "Interact with Moltbook social-network workflows for agents.",
    ["moltbook", "agent-social", "coordination", "external-account", "requires-human-confirmation"],
  ),
  "nextfrontierbuilds-moltbot-best-practices": keepSkill(
    "agent-best-practices",
    "Agent Best Practices",
    "Apply best practices for safer and more reliable AI-agent operation.",
    ["moltbook", "best-practices", "agent-ops", "safety", "agent-safety"],
  ),
  "mkrdiop-moltbot-docker": keepSkill(
    "docker-operations",
    "Docker Operations",
    "Manage Docker containers, images, and stacks for approved ops workflows.",
    ["moltbook", "docker", "devops", "host-mutation", "requires-human-confirmation"],
  ),
  "iamvaleriofantozzi-moltbot-ha": keepSkill(
    "home-assistant-operations",
    "Home Assistant Operations",
    "Control approved Home Assistant devices, lights, and scenes.",
    ["moltbook", "smart-home", "facilities", "ops", "physical-device-control", "requires-human-confirmation"],
  ),
  "nextfrontierbuilds-moltbot-security": keepSkill(
    "agent-security-hardening",
    "Agent Security Hardening",
    "Apply security hardening guidance for AI agents.",
    ["moltbook", "security", "hardening", "best-practices", "agent-safety"],
  ),
  "eduarddriessen1-moltlang": keepSkill(
    "agent-communication-language",
    "Agent Communication Language",
    "Use compact symbolic conventions for AI-to-AI communication.",
    ["moltbook", "agent-communication", "protocol", "coordination"],
  ),
  "luluf0x-post-queue": keepSkill(
    "rate-limited-post-queue",
    "Rate-Limited Post Queue",
    "Queue posts for rate-limited external platforms with reviewable workflow state.",
    ["moltbook", "queue", "rate-limits", "ops", "social-media", "requires-human-confirmation"],
  ),
  "nextfrontierbuilds-skill-scaffold": keepSkill(
    "skill-scaffolder",
    "Skill Scaffolder",
    "Scaffold new agent skills with a repeatable CLI workflow.",
    ["moltbook", "skill-development", "developer-tools", "agent-ops"],
  ),
  "spsneo-speedtest": keepSkill(
    "network-speed-test",
    "Network Speed Test",
    "Test internet connectivity for local operations diagnostics.",
    ["moltbook", "diagnostics", "network", "ops"],
  ),
  "fiddlybit-whisper": keepSkill(
    "private-agent-messaging",
    "Private Agent Messaging",
    "Use encrypted private messaging for agent-to-agent coordination.",
    ["moltbook", "secure-messaging", "agent-communication", "privacy", "coordination"],
  ),
};



const SHOPPING_ECOMMERCE_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "phheng-amazon-competitor-analyzer": keepSkill(
    "amazon-competitor-analyzer",
    "Amazon Competitor Analyzer",
    "Scrape Amazon ASIN data for competitor, pricing, listing, review, and positioning research.",
    ["ecommerce", "commerce", "amazon", "competitor-analysis", "product-data", "market-research", "external-account"],
  ),
  "atoship-dev-atoship": keepSkill(
    "shipping-operations",
    "Shipping Operations",
    "Compare carrier rates, buy discounted labels, and track shipments across USPS, FedEx, and UPS for reviewed fulfillment workflows.",
    ["ecommerce", "commerce", "logistics", "shipping", "fulfillment", "carrier-rates", "financial-action", "external-account", "requires-human-confirmation"],
  ),
  "odrobnik-bricklink": keepSkill(
    "bricklink-marketplace-api",
    "BrickLink Marketplace API",
    "Query BrickLink store and catalog APIs for marketplace inventory, product data, and collectible commerce operations.",
    ["ecommerce", "commerce", "marketplace", "product-data", "inventory", "collectibles", "oauth", "external-account", "requires-human-confirmation"],
  ),
  "alhwyn-clawpify": keepSkill(
    "shopify-admin-operator",
    "Shopify Admin Operator",
    "Query and manage Shopify store products, orders, and commerce data through the GraphQL Admin API.",
    ["ecommerce", "commerce", "shopify", "store-ops", "orders", "product-data", "admin-api", "external-account", "requires-human-confirmation"],
  ),
  "nwang783-clawver-digital-products": keepSkill(
    "digital-product-seller",
    "Digital Product Seller",
    "Create and sell digital products through Clawver workflows for reviewed creator-business and product-launch operations.",
    ["ecommerce", "commerce", "digital-products", "store-ops", "product-launch", "sales", "external-account", "requires-human-confirmation"],
  ),
  "nwang783-clawver-reviews": keepSkill(
    "customer-review-manager",
    "Customer Review Manager",
    "Monitor, triage, and respond to customer reviews for product feedback, reputation, and support workflows.",
    ["ecommerce", "commerce", "reviews", "customer-feedback", "customer-success", "reputation", "external-account", "requires-human-confirmation"],
  ),
  "crisanmm-dupe": keepSkill(
    "similar-product-finder",
    "Similar Product Finder",
    "Find visually or commercially similar products from an input product URL for sourcing, comparison, and positioning research.",
    ["ecommerce", "commerce", "product-research", "marketplace-search", "similar-products", "competitive-research"],
  ),
  "eftalyurtseven-eachlabs-product-visuals": keepSkill(
    "product-visual-studio",
    "Product Visual Studio",
    "Generate ecommerce product photography and videos for listings, ads, storefronts, and campaign drafts.",
    ["ecommerce", "commerce", "product-visuals", "image-generation", "video-generation", "creative-assets", "marketing", "external-account", "requires-human-confirmation"],
  ),
  "artyomx33-jtbd-analyzer": keepSkill(
    "jobs-to-be-done-analyzer",
    "Jobs-To-Be-Done Analyzer",
    "Analyze customer language to uncover the job customers hire a product to do and turn findings into positioning work.",
    ["ecommerce", "commerce", "product-research", "customer-research", "positioning", "jtbd", "strategy", "draft-only"],
  ),
  "pvoo-marktplaats": keepSkill(
    "marktplaats-marketplace-search",
    "Marktplaats Marketplace Search",
    "Search Dutch classifieds with filters for marketplace research, price discovery, and resale product scans.",
    ["ecommerce", "commerce", "marketplace-search", "classifieds", "product-research", "price-research", "netherlands", "public-data"],
  ),
  "eliaskress-popup-referrals": keepSkill(
    "referral-program-tracker",
    "Referral Program Tracker",
    "Track PopUp referral links, earnings, and referred vendor status for growth and partner-sales reporting.",
    ["ecommerce", "commerce", "referrals", "growth", "partner-sales", "revenue", "external-account"],
  ),
  "g9pedro-whop-cli": keepSkill(
    "whop-digital-products-admin",
    "Whop Digital Products Admin",
    "Manage Whop products, plans, payments, and memberships for reviewed digital-product commerce operations.",
    ["ecommerce", "commerce", "digital-products", "store-ops", "payments", "memberships", "subscriptions", "financial-action", "external-account", "requires-human-confirmation"],
  ),
};



const SMART_HOME_IOT_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "chris6970barbarian-hue-glitch-homeassistant": keepSkill(
    "home-assistant-device-control",
    "Home Assistant Device Control",
    "Control and inspect smart home devices through the Home Assistant API for local automation, scenes, and environment workflows.",
    ["smart-home", "iot", "home-assistant", "hub", "automation", "local-control", "physical-device-control", "access-control-or-presence", "external-account", "requires-human-confirmation"],
  ),
  "jiasenl-clawdbot-skill-homebridge": keepSkill(
    "homebridge-device-control",
    "Homebridge Device Control",
    "Control HomeKit-compatible smart home devices through Homebridge Config UI X for reviewed facility and lab automation.",
    ["smart-home", "iot", "homebridge", "homekit", "hub", "automation", "physical-device-control", "access-control-or-presence", "external-account", "requires-human-confirmation"],
  ),
  "maxsumrall-homey": keepSkill(
    "athom-homey-device-control",
    "Athom Homey Device Control",
    "Control Athom Homey smart home devices and flows through local LAN, VPN, or cloud APIs.",
    ["smart-home", "iot", "homey", "hub", "local-control", "cloud-control", "physical-device-control", "local-network-access", "access-control-or-presence", "external-account", "requires-human-confirmation"],
  ),
  "krausefx-homey-cli": keepSkill(
    "homey-cli-device-control",
    "Homey CLI Device Control",
    "Control Homey home automation hubs from the command line for reviewed device and scene workflows.",
    ["smart-home", "iot", "homey", "cli", "hub", "automation", "physical-device-control", "access-control-or-presence", "requires-human-confirmation"],
  ),
  "falderebet-dirigera-control": keepSkill(
    "ikea-dirigera-device-control",
    "IKEA Dirigera Device Control",
    "Control IKEA Dirigera smart home devices and scenes for facility, lab, and demo-space automation.",
    ["smart-home", "iot", "ikea-dirigera", "matter", "zigbee", "hub", "lighting", "physical-device-control", "access-control-or-presence", "requires-human-confirmation"],
  ),
  "mjrussell-beestat": keepSkill(
    "ecobee-telemetry-monitor",
    "Ecobee Telemetry Monitor",
    "Query Ecobee thermostat and indoor climate telemetry through Beestat for facilities, labs, and office operations agents.",
    ["smart-home", "iot", "telemetry", "climate", "thermostat", "facilities", "external-account", "thermal-or-heating-risk"],
  ),
  "noahseeger-dht11-temp": keepSkill(
    "dht11-sensor-monitor",
    "DHT11 Sensor Monitor",
    "Read temperature and humidity from DHT11 sensors for lightweight environmental monitoring workflows.",
    ["iot", "sensors", "telemetry", "temperature", "humidity", "environment", "facilities"],
  ),
  "brianppetty-farmos-weather": keepSkill(
    "farm-field-weather-monitor",
    "Farm Field Weather Monitor",
    "Query field-level weather data and forecasts for agricultural, outdoor, and field-operations agents.",
    ["iot", "weather", "agriculture", "field-ops", "forecasting", "external-data", "external-account"],
  ),
  "porygonthebot-frigate": keepSkill(
    "frigate-nvr-camera-monitor",
    "Frigate NVR Camera Monitor",
    "Access Frigate NVR cameras for camera review, incident triage, and monitored-site workflows.",
    ["iot", "cameras", "nvr", "security", "monitoring", "camera-privacy", "sensitive-personal-data", "external-account", "requires-human-confirmation"],
  ),
  "ltpop-ipcam": keepSkill(
    "onvif-ip-camera-control",
    "ONVIF IP Camera Control",
    "Discover ONVIF cameras, control PTZ, and capture RTSP streams for site-monitoring agents.",
    ["iot", "cameras", "onvif", "ptz", "rtsp", "monitoring", "camera-privacy", "local-network-access", "physical-device-control", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "tag-assistant-nest-sdm": keepSkill(
    "nest-sdm-device-monitor",
    "Nest SDM Device Monitor",
    "Access Nest thermostats, doorbells, and cameras through Google Smart Device Management for facility and security monitoring.",
    ["smart-home", "iot", "nest", "google-sdm", "thermostat", "doorbell", "cameras", "climate", "facilities", "camera-privacy", "thermal-or-heating-risk", "access-control-or-presence", "external-account", "requires-human-confirmation"],
  ),
  "wranglerdriver-tempest-weather": keepSkill(
    "tempest-station-monitor",
    "Tempest Station Monitor",
    "Read current conditions from WeatherFlow Tempest stations for local environmental and field-operations monitoring.",
    ["iot", "weather", "sensors", "telemetry", "field-ops", "forecasting", "external-account"],
  ),
  "tobiasbischoff-bambu-cli": keepSkill(
    "bambu-lab-printer-cli",
    "Bambu Lab Printer CLI",
    "Operate and troubleshoot Bambu Lab 3D printers through bambu-cli for prototyping and print-farm workflows.",
    ["iot", "3d-printing", "bambu-lab", "printer", "cli", "physical-device-control", "local-network-access", "requires-human-confirmation"],
  ),
  "tanguyvans-bambu-local": keepSkill(
    "bambu-lab-local-mqtt-control",
    "Bambu Lab Local MQTT Control",
    "Control Bambu Lab 3D printers locally over MQTT for reviewed prototyping and print-farm operations.",
    ["iot", "3d-printing", "bambu-lab", "mqtt", "local-control", "printer", "physical-device-control", "local-network-access", "requires-human-confirmation"],
  ),
  "tmustier-dyson-cli": keepSkill(
    "dyson-climate-device-control",
    "Dyson Climate Device Control",
    "Control Dyson air purifiers, fans, and heaters over local MQTT for reviewed facility climate workflows.",
    ["smart-home", "iot", "dyson", "air-purifier", "fan", "heater", "mqtt", "physical-device-control", "local-network-access", "thermal-or-heating-risk", "requires-human-confirmation"],
  ),
  "daniel-laszlo-enzoldhazam": keepSkill(
    "ngbs-icon-thermostat-control",
    "NGBS iCON Thermostat Control",
    "Control NGBS iCON smart home thermostats for reviewed climate and facilities workflows.",
    ["smart-home", "iot", "thermostat", "climate", "ngbs-icon", "physical-device-control", "thermal-or-heating-risk", "requires-human-confirmation"],
  ),
  "mitchellbernstein-google-home": keepSkill(
    "google-nest-device-control",
    "Google Nest Device Control",
    "Control Google Nest and Google Home devices for reviewed smart home and facility automation workflows.",
    ["smart-home", "iot", "google-home", "nest", "hub", "thermostat", "cloud-control", "physical-device-control", "access-control-or-presence", "external-account", "requires-human-confirmation"],
  ),
  "kaiofreitas-lg-thinq": keepSkill(
    "lg-thinq-appliance-control",
    "LG ThinQ Appliance Control",
    "Control LG smart appliances through the ThinQ API for reviewed appliance and facilities workflows.",
    ["smart-home", "iot", "appliances", "lg-thinq", "external-account", "physical-device-control", "thermal-or-heating-risk", "requires-human-confirmation"],
  ),
};



const WEB_FRONTEND_DEVELOPMENT_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "felipeoff-ant-design-skill": keepSkill(
    "react-ui-patterns-with-ant-design",
    "React UI Patterns With Ant Design",
    "Build maintainable React admin interfaces with Ant Design component, layout, form, and table patterns.",
    ["web-frontend", "frontend", "react", "ant-design", "forms", "tables", "component-systems"],
  ),
  "kjaylee-anti-slop-design": keepSkill(
    "production-ui-polish",
    "Production UI Polish",
    "Review and improve frontend interfaces so agent-built screens feel specific, polished, and production-ready.",
    ["web-frontend", "frontend", "ui-design", "visual-polish", "product-ui", "design-review"],
  ),
  "dylanb-axe-devtools": keepSkill(
    "axe-accessibility-testing",
    "Axe Accessibility Testing",
    "Test and remediate web accessibility issues with axe-powered browser and DevTools workflows.",
    ["web-frontend", "accessibility", "a11y", "wcag", "qa", "browser-devtools"],
  ),
  "generaljerel-copilotkit-react": keepSkill(
    "agentic-react-ui-patterns",
    "Agentic React UI Patterns",
    "Apply CopilotKit React patterns for agent-aware frontend interfaces, task copilots, and interactive operator tools.",
    ["web-frontend", "frontend", "react", "agent-ui", "copilotkit", "component-patterns"],
  ),
  "kjaylee-kj-ui-ux-pro-max": keepSkill(
    "control-plane-ux-review",
    "Control Plane UX Review",
    "Audit complex product screens for clearer hierarchy, denser workflows, useful states, and operator-friendly UI polish.",
    ["web-frontend", "ui-design", "ux-audit", "product-ui", "dashboard", "design-review"],
  ),
  "kjaylee-kj-web-design-guidelines": keepSkill(
    "ui-code-design-review",
    "UI Code Design Review",
    "Review frontend implementation against practical web design, responsive layout, and interaction-quality guidelines.",
    ["web-frontend", "frontend", "responsive-design", "ui-design", "code-review", "accessibility"],
  ),
  "leonaaardob-lb-motion-skill": keepSkill(
    "motion-ui-animation",
    "Motion UI Animation",
    "Use Motion.dev animation patterns for purposeful frontend transitions, feedback, and interaction polish.",
    ["web-frontend", "frontend", "motion", "animation", "interaction-design", "react"],
  ),
  "leonaaardob-lb-tailwindcss-skill": keepSkill(
    "tailwind-css-reference",
    "Tailwind CSS Reference",
    "Use Tailwind CSS documentation and patterns for responsive layouts, utility styling, and design-system implementation.",
    ["web-frontend", "frontend", "tailwind", "css", "responsive-design", "design-systems"],
  ),
  "kjaylee-react-perf": keepSkill(
    "react-performance-tuning",
    "React Performance Tuning",
    "Optimize React and Next.js rendering, bundle behavior, hydration, and interaction performance for web apps.",
    ["web-frontend", "frontend", "react", "performance", "core-web-vitals", "nextjs"],
  ),
  "guifav-shadcn-theme-default": keepSkill(
    "shadcn-tailwind-theme-baseline",
    "shadcn/Tailwind Theme Baseline",
    "Apply a clean shadcn/ui neutral theme with Tailwind v4 and OKLCH tokens for consistent frontend surfaces.",
    ["web-frontend", "frontend", "shadcn", "tailwind", "design-tokens", "css"],
  ),
  "ryudi84-sovereign-accessibility-auditor": keepSkill(
    "wcag-html-css-auditor",
    "WCAG HTML/CSS Auditor",
    "Audit frontend HTML and CSS for WCAG 2.1 accessibility risks before web work ships.",
    ["web-frontend", "accessibility", "a11y", "wcag", "html", "css", "qa"],
  ),
  "a2mus-stitch-ui-designer": keepSkill(
    "design-to-code-ui-prototyping",
    "Design-To-Code UI Prototyping",
    "Design, preview, and generate UI code from Google Stitch-backed design workflows.",
    ["web-frontend", "ui-design", "prototyping", "design-to-code", "frontend", "external-account"],
  ),
  "tippyentertainment-wasm-spa-autofix-react-imports": keepSkill(
    "react-tsx-import-autofix",
    "React TSX Import Autofix",
    "Repair common React TSX import and runtime issues in SPA and WASM frontend builds.",
    ["web-frontend", "frontend", "react", "tsx", "bundling", "debugging"],
  ),
  "kjaylee-web-design-pro": keepSkill(
    "frontend-design-engineering",
    "Frontend Design Engineering",
    "Apply modern web design engineering patterns for design tokens, accessible UI, responsive layout, and frontend craft.",
    ["web-frontend", "frontend", "ui-design", "design-tokens", "accessibility", "responsive-design"],
  ),
  "podcasting101-chrome-devtools": keepSkill(
    "chrome-devtools-automation",
    "Chrome DevTools Automation",
    "Debug, inspect, profile, and troubleshoot web apps through Chrome DevTools MCP.",
    ["web-frontend", "browser-devtools", "debugging", "qa", "performance", "browser-automation"],
  ),
  "vmercel-playwright-skill": keepSkill(
    "playwright-browser-automation",
    "Playwright Browser Automation",
    "Automate browser navigation, screenshots, interactions, and scripted web flows with Playwright.",
    ["web-frontend", "playwright", "browser-automation", "web-qa", "screenshots", "e2e"],
  ),
  "kjaylee-playwright-testing": keepSkill(
    "playwright-web-app-testing",
    "Playwright Web App Testing",
    "Test web applications with Playwright-driven browser checks, regressions, and interactive flow validation.",
    ["web-frontend", "playwright", "web-qa", "e2e", "testing", "regression-testing"],
  ),
  "spiceman161-playwright-mcp": keepSkill(
    "playwright-mcp-automation",
    "Playwright MCP Automation",
    "Use a Playwright MCP server for agent-driven browser inspection, interaction, and end-to-end testing.",
    ["web-frontend", "playwright", "mcp", "browser-automation", "web-qa", "e2e"],
  ),
  "mahone-bot-playwright-npx": keepSkill(
    "scripted-playwright-runner",
    "Scripted Playwright Runner",
    "Run quick Node/NPX Playwright scripts for targeted browser automation, screenshots, and smoke checks.",
    ["web-frontend", "playwright", "node", "qa-scripting", "browser-automation", "smoke-testing"],
  ),
  "flyingzl-web-form-automation": keepSkill(
    "web-form-automation",
    "Web Form Automation",
    "Automate login, uploads, text entry, and form submission for reviewed web QA and operator workflows.",
    ["web-frontend", "forms", "playwright", "browser-automation", "web-qa", "requires-human-confirmation"],
  ),
  "tahseen137-qa-patrol": keepSkill(
    "web-qa-patrol",
    "Web QA Patrol",
    "Run practical web app QA checks with local browser automation for agent-built UI changes.",
    ["web-frontend", "qa", "web-qa", "browser-automation", "local-testing", "regression-testing"],
  ),
  "erdinccurebal-webcli": keepSkill(
    "browser-ui-inspection",
    "Browser UI Inspection",
    "Browse, click, fill forms, capture screenshots, and inspect accessibility snapshots from a CLI workflow.",
    ["web-frontend", "browser-automation", "screenshots", "forms", "accessibility", "web-qa"],
  ),
  "dqhieu-website-flow-monitor": keepSkill(
    "website-flow-monitor",
    "Website Flow Monitor",
    "Discover critical user flows and create monitoring plans for business-important website paths.",
    ["web-frontend", "website-monitoring", "flow-monitoring", "web-qa", "conversion", "synthetic-monitoring"],
  ),
  "adityak6798-website-usability-test-nova-act": keepSkill(
    "website-usability-testing",
    "Website Usability Testing",
    "Run AI-orchestrated website usability tests for frontend UX, conversion friction, and operator-visible reports.",
    ["web-frontend", "usability-testing", "ux-audit", "conversion", "browser-automation", "external-account"],
  ),
  "quanru-midscene-computer-browser": keepSkill(
    "vision-driven-browser-automation",
    "Vision-Driven Browser Automation",
    "Use Midscene visual browser automation for UI workflows where DOM-only automation is not enough.",
    ["web-frontend", "visual-automation", "browser-automation", "vision", "web-qa", "external-account"],
  ),
  "neilhexiaoning-alt-visual-rpa-skill": keepSkill(
    "visual-rpa-automation",
    "Visual RPA Automation",
    "Automate UI workflows with visual RPA patterns for QA, demos, and controlled browser or desktop tasks.",
    ["web-frontend", "visual-rpa", "ui-automation", "web-qa", "browser-automation", "requires-human-confirmation"],
  ),
  "h4gen-web-hosting": keepSkill(
    "web-hosting-orchestrator",
    "Web Hosting Orchestrator",
    "Deploy local web projects to production URLs through GitHub/API-backed hosting workflows.",
    ["web-frontend", "hosting", "deploy", "github", "static-sites", "host-mutation", "external-account", "requires-human-confirmation"],
  ),
  "fortunto2-solo-deploy": keepSkill(
    "stack-aware-deploy-runner",
    "Stack-Aware Deploy Runner",
    "Deploy web projects with stack-aware CLI workflows such as Vercel, Wrangler, and repo-specific commands.",
    ["web-frontend", "deployment", "deploy", "vercel", "cloudflare", "wrangler", "host-mutation", "external-account"],
  ),
  "guifav-deploy-pilot": keepSkill(
    "deploy-pilot",
    "Deploy Pilot",
    "Validate builds, push to GitHub, deploy to Vercel, and run health checks for reviewed web releases.",
    ["web-frontend", "deployment", "vercel", "github", "health-checks", "ci", "host-mutation", "external-account"],
  ),
  "kjaylee-kj-web-deploy-github": keepSkill(
    "github-pages-static-deploy",
    "GitHub Pages Static Deploy",
    "Create and deploy single-page static web artifacts to GitHub Pages for demos, docs, and reports.",
    ["web-frontend", "github-pages", "static-site", "deploy", "artifact", "host-mutation", "external-account"],
  ),
  "kjaylee-web-bundling": keepSkill(
    "single-file-web-bundler",
    "Single-File Web Bundler",
    "Bundle web apps into portable single-file HTML artifacts for demos, reports, and task handoffs.",
    ["web-frontend", "bundling", "single-html", "static-artifacts", "portable", "frontend"],
  ),
  "operator-auteng-ai-auteng-docs": keepSkill(
    "technical-docs-publisher",
    "Technical Docs Publisher",
    "Publish technical docs with Mermaid, KaTeX, and code highlighting for agent-built project artifacts.",
    ["web-frontend", "docs", "publishing", "mermaid", "katex", "static-docs"],
  ),
  "1999azzar-cloudflare-manager": keepSkill(
    "cloudflare-dns-and-tunnel-manager",
    "Cloudflare DNS And Tunnel Manager",
    "Manage Cloudflare DNS records, tunnels, and Zero Trust settings for reviewed web exposure workflows.",
    ["web-frontend", "cloudflare", "dns", "tunnels", "zero-trust", "hosting", "host-mutation", "external-account", "requires-human-confirmation"],
  ),
  "leonaaardob-lb-vercel-skill": keepSkill(
    "vercel-cli-reference",
    "Vercel CLI Reference",
    "Use Vercel CLI workflows for web project deployment, inspection, and hosting operations.",
    ["web-frontend", "vercel", "cli", "deploy", "hosting", "host-mutation", "external-account"],
  ),
  "abhibavishi-wp-to-static": keepSkill(
    "wordpress-to-cloudflare-pages",
    "WordPress To Cloudflare Pages",
    "Convert WordPress sites to static output and publish them to Cloudflare Pages.",
    ["web-frontend", "wordpress", "static-site", "cloudflare-pages", "migration", "host-mutation", "external-account"],
  ),
  "codeninja23-native-google-analytics": keepSkill(
    "ga4-analytics",
    "GA4 Analytics",
    "Query Google Analytics 4 website data through the Analytics Data API for product and growth reporting.",
    ["web-frontend", "analytics", "ga4", "reporting", "website", "external-account"],
  ),
  "chloepark85-plausible-analytics": keepSkill(
    "plausible-analytics",
    "Plausible Analytics",
    "Query privacy-friendly website analytics from Plausible for product, marketing, and operator reports.",
    ["web-frontend", "analytics", "plausible", "privacy", "website", "external-account"],
  ),
  "hfichter-umami-stats": keepSkill(
    "umami-analytics",
    "Umami Analytics",
    "Query Umami Cloud website analytics data for traffic, events, and board-ready reporting.",
    ["web-frontend", "analytics", "umami", "privacy", "reporting", "external-account"],
  ),
  "bennyqp-datafast-analytics": keepSkill(
    "datafast-analytics",
    "DataFast Analytics",
    "Query DataFast website metrics, realtime stats, visitors, and time series through the DataFast API.",
    ["web-frontend", "analytics", "datafast", "realtime", "website", "external-account"],
  ),
  "wells1137-similarweb-analytics": keepSkill(
    "similarweb-traffic-analytics",
    "Similarweb Traffic Analytics",
    "Analyze domains and websites with Similarweb traffic, market, and competitive intelligence data.",
    ["web-frontend", "analytics", "similarweb", "competitive-intel", "traffic", "external-account"],
  ),
  "geozhu-ahrefs": keepSkill(
    "ahrefs-seo-toolkit",
    "Ahrefs SEO Toolkit",
    "Use Ahrefs SEO data for keywords, backlinks, site audits, and competitive website analysis.",
    ["web-frontend", "seo", "ahrefs", "keywords", "backlinks", "site-audit", "external-account"],
  ),
  "aaron-he-zhu-technical-seo-checker": keepSkill(
    "technical-seo-checker",
    "Technical SEO Checker",
    "Check technical SEO, page speed, crawl issues, and Core Web Vitals for websites.",
    ["web-frontend", "technical-seo", "core-web-vitals", "performance", "crawl", "website-audit"],
  ),
  "kxrbx-schemaorg-site-enhancer": keepSkill(
    "schema-org-site-enhancer",
    "Schema.org Site Enhancer",
    "Add structured data to agent-built websites for SEO, rich snippets, and search visibility.",
    ["web-frontend", "seo", "schema", "structured-data", "rich-results", "website"],
  ),
  "mattvalenta-pls-audit-website": keepSkill(
    "website-health-audit",
    "Website Health Audit",
    "Audit websites for technical friction, UX issues, conversion blockers, and frontend health.",
    ["web-frontend", "website-audit", "ux-audit", "technical-health", "conversion", "qa"],
  ),
  "mattvalenta-pls-seo-audit": keepSkill(
    "seo-gap-audit",
    "SEO Gap Audit",
    "Scan sites and content for SEO gaps, competitor opportunities, and actionable ranking improvements.",
    ["web-frontend", "seo", "content", "competitors", "audit", "website"],
  ),
  "claudiodrusus-shelly-seo-analyzer": keepSkill(
    "webpage-seo-analyzer",
    "Webpage SEO Analyzer",
    "Analyze a webpage URL and return practical SEO recommendations for frontend and content teams.",
    ["web-frontend", "seo", "page-audit", "recommendations", "website"],
  ),
  "claudiodrusus-website-monitor": keepSkill(
    "website-uptime-monitor",
    "Website Uptime Monitor",
    "Run lightweight uptime monitoring for websites and published agent artifacts.",
    ["web-frontend", "website-monitoring", "uptime", "alerts", "website"],
  ),
  "jakes420-web-monitor-pro": keepSkill(
    "web-monitor-pro",
    "Web Monitor Pro",
    "Monitor page changes, price drops, stock availability, and custom website conditions.",
    ["web-frontend", "website-monitoring", "change-detection", "alerts", "website"],
  ),
  "rogue-agent1-web-monitor": keepSkill(
    "web-page-change-monitor",
    "Web Page Change Monitor",
    "Monitor web pages for content changes and alerts after launches, releases, or competitor checks.",
    ["web-frontend", "website-monitoring", "change-detection", "alerts", "website"],
  ),
  "brianrwagner-brw-homepage-audit": keepSkill(
    "homepage-conversion-audit",
    "Homepage Conversion Audit",
    "Run quick conversion and clarity audits for homepages, product pages, and landing pages.",
    ["web-frontend", "conversion", "homepage", "landing-page", "cro", "website-audit"],
  ),
  "cybercentry-cybercentry-web-application-verification": keepSkill(
    "owasp-web-app-verification",
    "OWASP Web App Verification",
    "Run OWASP-oriented verification checks for websites, web apps, APIs, and dApp frontends.",
    ["web-frontend", "security", "owasp", "web-scan", "vulnerability-scanning", "authorized-testing-only", "requires-human-confirmation"],
  ),
  "dmx64-security-scanner": keepSkill(
    "web-security-scanner",
    "Web Security Scanner",
    "Scan web apps, APIs, and infrastructure for common vulnerability classes before release.",
    ["web-frontend", "security", "vulnerability-scanning", "api-security", "authorized-testing-only", "requires-human-confirmation"],
  ),
  "adamnaghs-safe-web": keepSkill(
    "prompt-safe-web-fetch",
    "Prompt-Safe Web Fetch",
    "Fetch and search web content with PromptGuard scanning before untrusted text reaches agents.",
    ["web-frontend", "web-fetch", "prompt-injection-defense", "untrusted-content", "security"],
  ),
  "deegerwalker-aegis-shield": keepSkill(
    "aegis-shield",
    "Aegis Shield",
    "Screen untrusted web text for prompt injection, data exfiltration, and agent-facing safety risks.",
    ["web-frontend", "security", "prompt-injection-defense", "data-loss-prevention", "untrusted-content"],
  ),
  "staybased-reef-prompt-guard": keepSkill(
    "prompt-guard",
    "Prompt Guard",
    "Detect and filter prompt injection attempts in untrusted web or user-provided content.",
    ["web-frontend", "security", "prompt-injection-defense", "filtering", "untrusted-content"],
  ),
  "awlevin-secret-portal": keepSkill(
    "one-time-secret-portal",
    "One-Time Secret Portal",
    "Spin up a one-time web UI for secure human secret entry into reviewed agent workflows.",
    ["web-frontend", "secrets", "web-ui", "env-vars", "secret-handling", "human-secret-entry", "requires-human-confirmation"],
  ),
  "tradmangh-expiring-local-fileshare": keepSkill(
    "expiring-file-share",
    "Expiring File Share",
    "Share files through expiring tokenized local HTTP links for controlled handoffs.",
    ["web-frontend", "file-sharing", "web-server", "token-gated-access", "least-exposure", "secret-handling"],
  ),
  "chandika-mirage-proxy": keepSkill(
    "pii-and-secret-filter-proxy",
    "PII And Secret Filter Proxy",
    "Proxy LLM requests while filtering PII and secrets from web or agent-facing payloads.",
    ["web-frontend", "privacy", "pii", "secrets", "proxy", "data-loss-prevention", "secret-handling"],
  ),
};



const IOS_MACOS_DEVELOPMENT_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "thesethrose-apple-docs": keepSkill(
    "apple-developer-docs",
    "Apple Developer Docs",
    "Query Apple Developer Documentation, APIs, and WWDC videos for iOS, macOS, Swift, and SwiftUI engineering work.",
    ["ios", "macos", "apple-docs", "wwdc", "developer-tools", "research-lab", "public-data"],
  ),
  "steipete-instruments-profiling": keepSkill(
    "instruments-profiling",
    "Instruments Profiling",
    "Profile native iOS and macOS apps with Instruments to investigate performance, memory, and runtime behavior.",
    ["ios", "macos", "profiling", "performance", "xcode", "qa", "local-only-macos", "host-mutation"],
  ),
  "tristanmanchester-ios-simulator": keepSkill(
    "ios-simulator-automation",
    "iOS Simulator Automation",
    "Automate iOS Simulator workflows for app installs, tests, screenshots, repro steps, and mobile QA.",
    ["ios", "ios-simulator", "simulator", "xcode", "mobile-qa", "testing", "qa", "local-only-macos", "host-mutation", "requires-human-confirmation"],
  ),
  "dimillian-macos-spm-app-packaging": keepSkill(
    "macos-swiftpm-app-packaging",
    "macOS SwiftPM App Packaging",
    "Scaffold, build, and package SwiftPM-based macOS apps for reviewed release and artifact workflows.",
    ["macos", "swiftpm", "packaging", "release", "artifact", "local-only-macos", "requires-human-confirmation"],
  ),
  "svkozak-sfsymbol-generator": keepSkill(
    "sf-symbol-asset-generator",
    "SF Symbol Asset Generator",
    "Generate Xcode SF Symbol asset catalog .symbolset artifacts for iOS and macOS app interfaces.",
    ["ios", "macos", "sf-symbols", "xcode", "assets", "artifact"],
  ),
  "steipete-swift-concurrency-expert": keepSkill(
    "swift-concurrency-review",
    "Swift Concurrency Review",
    "Review and remediate Swift Concurrency issues for correctness, performance, and maintainability in Apple-platform apps.",
    ["ios", "macos", "swift", "concurrency", "code-review", "qa", "developer-tools"],
  ),
  "michaelversus-swiftfindrefs": keepSkill(
    "swift-reference-finder",
    "Swift Reference Finder",
    "Use swiftfindrefs and IndexStoreDB to find Swift source references for code navigation and refactoring.",
    ["ios", "macos", "swift", "indexstoredb", "code-analysis", "xcode", "developer-tools", "research-lab"],
  ),
  "ignaciocervino-swiftui-empty-app-init": keepSkill(
    "swiftui-app-starter",
    "SwiftUI App Starter",
    "Initialize a minimal SwiftUI iOS app for prototypes, Research Lab experiments, and reviewed starter projects.",
    ["ios", "swiftui", "scaffolding", "xcode", "research-lab", "artifact", "host-mutation", "requires-human-confirmation"],
  ),
  "steipete-swiftui-liquid-glass": keepSkill(
    "swiftui-liquid-glass-review",
    "SwiftUI Liquid Glass Review",
    "Implement, review, and improve modern SwiftUI Liquid Glass-style features for iOS and macOS apps.",
    ["ios", "macos", "swiftui", "ui", "design-system", "qa", "developer-tools"],
  ),
  "steipete-swiftui-performance-audit": keepSkill(
    "swiftui-performance-audit",
    "SwiftUI Performance Audit",
    "Audit SwiftUI runtime performance and propose targeted fixes for Apple-platform app teams.",
    ["ios", "macos", "swiftui", "performance", "profiling", "qa", "developer-tools"],
  ),
  "dimillian-swiftui-ui-patterns": keepSkill(
    "swiftui-ui-patterns",
    "SwiftUI UI Patterns",
    "Use best-practice SwiftUI patterns and examples for building maintainable iOS and macOS interfaces.",
    ["ios", "macos", "swiftui", "ui-patterns", "developer-tools", "research-lab"],
  ),
  "steipete-swiftui-view-refactor": keepSkill(
    "swiftui-view-refactor",
    "SwiftUI View Refactor",
    "Refactor and review SwiftUI view files for readability, modularity, and app performance.",
    ["ios", "macos", "swiftui", "refactoring", "code-review", "qa", "developer-tools"],
  ),
  "szpakkamil-pagerkit": keepSkill(
    "pagerkit-swiftui-guide",
    "PagerKit SwiftUI Guide",
    "Apply PagerKit guidance for advanced paged SwiftUI interfaces in iOS and macOS applications.",
    ["ios", "macos", "swiftui", "pagerkit", "ui", "developer-tools"],
  ),
  "szpakkamil-symbolpicker": keepSkill(
    "symbolpicker-swiftui-guide",
    "SymbolPicker SwiftUI Guide",
    "Use SymbolPicker guidance for native SwiftUI SF Symbol selection workflows.",
    ["ios", "macos", "swiftui", "sf-symbols", "ui", "developer-tools"],
  ),
  "alirezarezvani-app-store-optimization": keepSkill(
    "app-store-optimization",
    "App Store Optimization",
    "Review App Store metadata, keyword strategy, and release positioning for iOS product and growth teams.",
    ["ios", "app-store", "aso", "marketing", "product", "release", "external-account", "requires-human-confirmation"],
  ),
  "rogue-agent1-brew-audit": keepSkill(
    "homebrew-audit",
    "Homebrew Audit",
    "Audit Homebrew packages, outdated dependencies, cleanup opportunities, and local development environment health.",
    ["macos", "homebrew", "diagnostics", "dependencies", "developer-tools", "local-only-macos", "requires-human-confirmation"],
  ),
  "aadipapp-android-transfer-skill": keepSkill(
    "android-file-transfer",
    "Android File Transfer",
    "Transfer files from macOS to Android devices with checksum verification and path validation for mobile QA workflows.",
    ["macos", "android", "file-transfer", "mobile-qa", "artifact", "local-only-macos", "host-mutation", "requires-human-confirmation"],
  ),
  "easonc13-lulu-monitor": keepSkill(
    "lulu-firewall-monitor",
    "LuLu Firewall Monitor",
    "Monitor macOS LuLu Firewall activity so approved agents can review local network behavior and suspicious connections.",
    ["macos", "firewall", "security", "monitoring", "local-only-macos", "requires-human-confirmation"],
  ),
  "johnnylambada-toolguard-daemon-control": keepSkill(
    "launchd-service-control",
    "launchd Service Control",
    "Manage approved long-running macOS services through launchd with reviewed labels, plists, and operator confirmation.",
    ["macos", "launchd", "process-control", "self-hosting", "local-only-macos", "host-mutation", "requires-human-confirmation"],
  ),
  "hazy2go-agent-defibrillator": keepSkill(
    "agent-gateway-watchdog",
    "Agent Gateway Watchdog",
    "Monitor an AI agent gateway on macOS and restart approved gateway processes after crashes or liveness failures.",
    ["macos", "watchdog", "process-control", "self-hosting", "agent-ops", "host-mutation", "requires-human-confirmation"],
  ),
};



const MARKETING_SALES_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "pauldelavallaz-ad-ready-pro": keepSkill(
    "ad-creative-generator",
    "Ad Creative Generator",
    "Generate reviewed product ad creative from URLs for campaign drafts, ecommerce tests, and marketing experiments.",
    ["marketing", "ads", "creative-assets", "image-generation", "ecommerce", "external-account", "requires-human-confirmation"],
  ),
  "dimitripantzos-brand-voice-profile": keepSkill(
    "brand-voice-profile",
    "Brand Voice Profile",
    "Define and store a company-scoped brand voice profile so content, sales, and support agents write consistently.",
    ["marketing", "brand", "copywriting", "knowledge-base", "company-scoped"],
  ),
  "brianrwagner-brw-newsletter-creation-curation": keepSkill(
    "b2b-newsletter-builder",
    "B2B Newsletter Builder",
    "Create role-aware B2B newsletter briefs, curated sections, and reviewed campaign drafts.",
    ["marketing", "newsletter", "content", "research-lab", "requires-human-confirmation"],
  ),
  "alirezarezvani-content-creator": keepSkill(
    "seo-content-creator",
    "SEO Content Creator",
    "Create SEO-optimized marketing content with brand voice, topic structure, and review-ready drafts.",
    ["marketing", "seo", "content", "copywriting", "brand-voice", "requires-human-confirmation"],
  ),
  "chrisagiddings-ghost-cms": keepSkill(
    "ghost-blog-newsletter-publisher",
    "Ghost Blog & Newsletter Publisher",
    "Create, publish, schedule, and manage Ghost CMS blog posts and newsletters through approved account access.",
    ["marketing", "cms", "blog", "newsletter", "external-account", "requires-human-confirmation"],
  ),
  "azade-c-bearblog": keepSkill(
    "bear-blog-publisher",
    "Bear Blog Publisher",
    "Create and manage Bear Blog posts for lightweight content marketing and founder-led publishing workflows.",
    ["marketing", "blog", "cms", "external-account", "requires-human-confirmation"],
  ),
  "postiz": keepSkill(
    "social-scheduler",
    "Social Scheduler",
    "Schedule social media posts and threads across channels with reviewed content, timing, and account access.",
    ["marketing", "social-media", "scheduling", "external-account", "outbound-contact", "requires-human-confirmation"],
  ),
  "staybased-reef-copywriting": keepSkill(
    "direct-response-copywriter",
    "Direct-Response Copywriter",
    "Draft landing pages, ads, product descriptions, and sales copy with direct-response frameworks.",
    ["marketing", "copywriting", "landing-pages", "ads", "draft-only", "requires-human-confirmation"],
  ),
  "vansearch-flwr-branding-studio-kit": keepSkill(
    "brand-strategy-studio",
    "Brand Strategy Studio",
    "Develop brand strategy, creative direction, and messaging systems for product launches and company positioning.",
    ["marketing", "brand", "strategy", "creative-brief", "board-inbox"],
  ),
  "urrrich-writing-assistant": keepSkill(
    "writing-team-lead",
    "Writing Team Lead",
    "Coordinate specialized writers for reviewed marketing, editorial, and long-form content workflows.",
    ["marketing", "writing", "content", "multi-agent", "requires-human-confirmation"],
  ),
  "jackfriks-b2c-marketing": keepSkill(
    "b2c-app-growth-playbook",
    "B2C App Growth Playbook",
    "Apply organic B2C app growth strategy for acquisition, activation, and mobile product marketing plans.",
    ["marketing", "app-growth", "organic-growth", "mobile-apps", "strategy"],
  ),
  "jk-0001-go-to-market": keepSkill(
    "go-to-market-planner",
    "Go-To-Market Planner",
    "Build GTM strategy for product launches, new markets, ICPs, messaging, channels, and launch sequencing.",
    ["marketing", "gtm", "product", "strategy", "launch", "research-lab"],
  ),
  "alirezarezvani-marketing-strategy-pmm": keepSkill(
    "product-marketing-strategist",
    "Product Marketing Strategist",
    "Create positioning, competitive intelligence, PMM strategy, and launch plans for product teams.",
    ["marketing", "pmm", "positioning", "competitive-intelligence", "launch", "strategy"],
  ),
  "oyi77-business-development": keepSkill(
    "business-development-research",
    "Business Development Research",
    "Research partnerships, markets, competitors, and outreach angles before approved business-development action.",
    ["sales", "partnerships", "market-research", "competitor-research", "outreach", "draft-only", "requires-human-confirmation"],
  ),
  "staybased-lead-magnets": keepSkill(
    "lead-magnet-builder",
    "Lead Magnet Builder",
    "Design reviewed lead magnets, conversion hooks, and opt-in offers for growth and demand-generation agents.",
    ["marketing", "lead-generation", "content", "conversion", "draft-only", "requires-human-confirmation"],
  ),
  "grahac-botsee": keepSkill(
    "botsee-ai-visibility-monitor",
    "BotSee AI Visibility Monitor",
    "Monitor brand visibility in AI answers and produce reports for AI SEO, messaging, and positioning work.",
    ["marketing", "ai-seo", "ai-visibility", "brand-monitoring", "reporting", "external-account"],
  ),
  "nttylock-citedy-seo-agent": keepSkill(
    "citedy-seo-content-platform",
    "Citedy SEO Content Platform",
    "Connect agents to Citedy for SEO content workflows, topic execution, and reviewed content operations.",
    ["marketing", "seo", "content", "external-account", "requires-human-confirmation"],
  ),
  "kein-s-meta-ads-report": keepSkill(
    "meta-ads-reporting",
    "Meta Ads Reporting",
    "Monitor Meta Facebook and Instagram ad performance for spend review, creative analysis, and growth reports.",
    ["marketing", "ads", "meta-ads", "analytics", "reporting", "external-account", "sensitive-personal-data"],
  ),
  "aaron-he-zhu-meta-tags-optimizer": keepSkill(
    "meta-tags-optimizer",
    "Meta Tags Optimizer",
    "Draft title tags, meta descriptions, Open Graph tags, and CTR-oriented metadata for reviewed web pages.",
    ["marketing", "seo", "metadata", "open-graph", "ctr", "web-frontend", "requires-human-confirmation"],
  ),
  "aaron-he-zhu-performance-reporter": keepSkill(
    "seo-performance-reporter",
    "SEO Performance Reporter",
    "Generate SEO, traffic, performance, and dashboard reports for growth and content teams.",
    ["marketing", "seo", "analytics", "reporting", "dashboards", "external-account", "sensitive-personal-data"],
  ),
  "simonfunk-posthog": keepSkill(
    "posthog-analytics-api",
    "PostHog Analytics API",
    "Query PostHog product analytics through REST APIs for growth, product, and funnel reports.",
    ["analytics", "marketing", "product", "posthog", "reporting", "external-account", "sensitive-personal-data"],
  ),
  "quinlanjager-posthog-query": keepSkill(
    "posthog-sql-analyst",
    "PostHog SQL Analyst",
    "Run SQL and HogQL-style PostHog analysis for product funnels, cohorts, and campaign impact reports.",
    ["analytics", "marketing", "posthog", "sql", "product", "reporting", "external-account", "sensitive-personal-data"],
  ),
  "fortunto2-solo-metrics-track": keepSkill(
    "posthog-metrics-planner",
    "PostHog Metrics Planner",
    "Plan PostHog events, funnels, KPIs, benchmarks, and scale-or-kill thresholds for product growth.",
    ["analytics", "marketing", "posthog", "funnels", "metrics", "product", "strategy"],
  ),
  "carlosarturoleon-windsor-ai": keepSkill(
    "windsor-ai-marketing-data-hub",
    "Windsor.ai Marketing Data Hub",
    "Query cross-channel marketing data from Windsor.ai sources including ads, GA4, HubSpot, and attribution feeds.",
    ["analytics", "marketing", "ads", "attribution", "reporting", "external-account", "sensitive-personal-data"],
  ),
  "jhumanj-apollo": keepSkill(
    "apollo-prospect-enrichment",
    "Apollo Prospect Enrichment",
    "Search, enrich, and organize Apollo.io people and organization data for approved sales research workflows.",
    ["sales", "prospecting", "lead-generation", "data-enrichment", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "capt-marbles-attio-enhanced": keepSkill(
    "attio-crm",
    "Attio CRM",
    "Manage Attio CRM contacts, companies, lists, and batch operations through reviewed account access.",
    ["sales", "crm", "contacts", "batch-ops", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "g9pedro-clovercli": keepSkill(
    "clover-pos-operations",
    "Clover POS Operations",
    "Query Clover POS inventory, orders, payments, customers, employees, discounts, and sales analytics.",
    ["sales", "sales-ops", "pos", "customers", "orders", "payments", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "danielfoch-kvcore-mcp-cli": keepSkill(
    "kvcore-crm",
    "KVcore CRM",
    "Manage KVcore real-estate CRM contacts, tags, notes, calls, email, text, and follow-up workflows.",
    ["sales", "real-estate-crm", "crm", "contacts", "email-marketing", "sms", "outbound-contact", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "ashrf-in-odoo-reporting": keepSkill(
    "odoo-sales-reporting",
    "Odoo Sales Reporting",
    "Query Odoo salesperson performance, CRM, orders, invoices, accounting, and customer analytics.",
    ["sales", "crm", "erp", "analytics", "reporting", "external-account", "sensitive-personal-data"],
  ),
  "leo-paz-outlit-mcp": keepSkill(
    "outlit-customer-data",
    "Outlit Customer Data",
    "Query Outlit customer data through MCP tools for sales, support, and account intelligence reports.",
    ["sales", "customer-data", "mcp", "external-account", "sensitive-personal-data"],
  ),
  "suminhthanh-pancake-skills": keepSkill(
    "pancake-platform",
    "Pancake Platform",
    "Manage Pancake pages, conversations, messages, customers, statistics, tags, posts, and social-commerce workflows.",
    ["sales", "social-commerce", "customers", "messages", "pages", "outbound-contact", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "vishalgojha-sentiment-priority-scorer": keepSkill(
    "lead-sentiment-scorer",
    "Lead Sentiment Scorer",
    "Score real-estate leads by sentiment, urgency, intent, recency, and record type for prioritized follow-up.",
    ["sales", "lead-scoring", "real-estate", "prioritization", "sensitive-personal-data"],
  ),
  "extraterrest-workcrm": keepSkill(
    "workcrm",
    "WorkCRM",
    "Use a lightweight local-first CRM with an explicit confirmation gate for contact and sales workflows.",
    ["sales", "crm", "local-first", "contacts", "confirmation-gate", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "kevjade-kit-email-operator": keepSkill(
    "kit-email-marketing",
    "Kit Email Marketing",
    "Operate Kit email marketing workflows for newsletters, subscribers, forms, sequences, and reviewed sends.",
    ["marketing", "email-marketing", "newsletter", "contacts", "outbound-contact", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "yujesyoga-brevo": keepSkill(
    "brevo-email-marketing",
    "Brevo Email Marketing",
    "Manage Brevo contacts, lists, templates, and email marketing workflows through approved account credentials.",
    ["marketing", "email-marketing", "contacts", "lists", "outbound-contact", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "teamtelnyx-telnyx-10dlc": keepSkill(
    "telnyx-10dlc-registration",
    "Telnyx 10DLC Registration",
    "Prepare and manage Telnyx 10DLC registration steps for compliant US SMS campaign setup.",
    ["marketing", "sms-compliance", "telnyx", "10dlc", "external-account", "requires-human-confirmation"],
  ),
  "nicholasrae-nicholasrae-review-reply": keepSkill(
    "app-store-review-replies",
    "App Store Review Replies",
    "Monitor App Store reviews and draft warm, on-brand replies for unhappy customers before human approval.",
    ["marketing", "app-store", "reviews", "customer-support", "ios", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
};



const NOTES_PKM_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "impkind-acc-error-memory": keepSkill(
    "error-pattern-memory",
    "Error Pattern Memory",
    "Record recurring mistakes, failure modes, and lessons learned so engineering and QA agents can avoid repeating known issues.",
    ["memory", "qa", "lessons-learned", "agent-safety", "company-scoped", "knowledge-base"],
  ),
  "globalcaos-agent-memory-ultimate": keepSkill(
    "company-memory-toolkit",
    "Company Memory Toolkit",
    "Maintain durable, company-scoped agent memory with explicit review before memories affect future PaperClaw decisions.",
    ["memory", "knowledge-base", "company-scoped", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "bowen31337-agent-wal": keepSkill(
    "agent-state-wal",
    "Agent State WAL",
    "Use write-ahead-log style checkpoints for agent state, task continuity, and auditable recovery after interrupted runs.",
    ["memory", "state-persistence", "audit", "continuity", "company-scoped"],
  ),
  "eth3rnit3-alexandrie": keepSkill(
    "alexandrie-notes",
    "Alexandrie Notes",
    "Connect Alexandrie-style notes and knowledge resources to approved research, documentation, and PKM workflows.",
    ["alexandrie", "notes", "pkm", "knowledge-base", "external-account", "sensitive-personal-data"],
  ),
  "gyroninja-anki-connect": keepSkill(
    "anki-deck-operations",
    "Anki Deck Operations",
    "Create, update, and review Anki flashcards for onboarding, training, research notes, and operator learning workflows.",
    ["anki", "flashcards", "training", "learning", "local-app", "knowledge-base", "requires-human-confirmation"],
  ),
  "steipete-apple-notes": keepSkill(
    "apple-notes-manager",
    "Apple Notes Manager",
    "Search, create, and organize Apple Notes for local operator capture, meeting follow-up, and private knowledge workflows.",
    ["apple-notes", "notes", "capture", "knowledge-base", "local-only-macos", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "trypto1019-arc-wake-state": keepSkill(
    "agent-wake-state",
    "Agent Wake State",
    "Restore agent context after crashes, pauses, or restarts by preserving task state and wake-up summaries.",
    ["context", "state-persistence", "context-recovery", "agent-ops", "memory", "company-scoped"],
  ),
  "ddrayne-bbc-news": keepSkill(
    "bbc-news-briefings",
    "BBC News Briefings",
    "Turn BBC public news into concise source-aware briefings for research, strategy, and executive update workflows.",
    ["news", "briefings", "public-data", "research-lab", "reporting", "knowledge-intake"],
  ),
  "steipete-bear-notes": keepSkill(
    "bear-notes-manager",
    "Bear Notes Manager",
    "Use Bear notes as a local PKM surface for search, capture, summaries, and reviewed note updates.",
    ["bear", "notes", "pkm", "knowledge-base", "local-only-macos", "sensitive-personal-data"],
  ),
  "tyler6204-better-notion": keepSkill(
    "notion-workspace-manager",
    "Notion Workspace Manager",
    "Manage Notion pages, databases, research notes, and operating manuals through approved workspace access.",
    ["notion", "documents", "database", "notes", "knowledge-base", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "steipete-blogwatcher": keepSkill(
    "blog-feed-watcher",
    "Blog & Feed Watcher",
    "Monitor blogs and feeds, then prepare research digests, market notes, and briefing material for company agents.",
    ["rss", "atom", "blogs", "monitoring", "knowledge-intake", "research-lab", "reporting"],
  ),
  "xenofex7-bookstack": keepSkill(
    "bookstack-wiki-manager",
    "BookStack Wiki Manager",
    "Manage BookStack wiki pages and documentation spaces for company knowledge-base and onboarding workflows.",
    ["bookstack", "wiki", "documentation", "knowledge-base", "external-account", "requires-human-confirmation"],
  ),
  "chair4ce-braindb": keepSkill(
    "semantic-agent-memory",
    "Semantic Agent Memory",
    "Store and retrieve semantic memories for agents that need source-aware company knowledge across longer projects.",
    ["memory", "semantic-search", "knowledge-base", "company-scoped", "sensitive-personal-data"],
  ),
  "codezz-brainrepo": keepSkill(
    "company-knowledge-repository",
    "Company Knowledge Repository",
    "Organize durable company knowledge, notes, and agent discoveries into a repository-style memory surface.",
    ["memory", "knowledge-base", "pkm", "company-scoped", "documentation"],
  ),
  "boscoeuk-context-anchor": keepSkill(
    "context-anchor",
    "Context Anchor",
    "Pin important task context, constraints, and decisions so long-running agents can recover without losing the thread.",
    ["context", "context-recovery", "memory", "agent-ops", "company-scoped"],
  ),
  "matthewubundi-cortex-memory": keepSkill(
    "knowledge-graph-memory",
    "Knowledge Graph Memory",
    "Track entities, relationships, and temporal context as a knowledge graph for research, strategy, and complex agent work.",
    ["memory", "knowledge-graph", "entity-tracking", "temporal-reasoning", "company-scoped", "sensitive-personal-data"],
  ),
  "atomtanstudio-craft-do": keepSkill(
    "craft-docs-api",
    "Craft Docs API",
    "Create and update Craft documents through approved API access for notes, docs, and knowledge-base workflows.",
    ["craft", "documents", "notes", "knowledge-base", "external-account", "requires-human-confirmation"],
  ),
  "liam8-cubox": keepSkill(
    "cubox-knowledge-collector",
    "Cubox Knowledge Collector",
    "Capture read-later links, clips, and memos into a research queue for analyst, content, and strategy agents.",
    ["cubox", "read-later", "bookmarks", "capture", "knowledge-intake", "research-lab", "external-account"],
  ),
  "meimakes-daily-memory-save": keepSkill(
    "session-memory-checkpoints",
    "Session Memory Checkpoints",
    "Save daily summaries and checkpoints so agent sessions leave concise, reviewable memory for future work.",
    ["memory", "continuity", "summaries", "company-scoped", "sensitive-personal-data"],
  ),
  "sssamuelll-dev-chronicle": keepSkill(
    "developer-chronicle",
    "Developer Chronicle",
    "Turn development work, git activity, and session transcripts into narrative progress artifacts for handoff and review.",
    ["developer-productivity", "git-history", "session-transcripts", "summaries", "reporting", "knowledge-base", "company-scoped"],
  ),
  "tristanmanchester-fabric-api": keepSkill(
    "fabric-knowledge-api",
    "Fabric Knowledge API",
    "Create, search, and manage Fabric knowledge resources for research, notes, and company memory workflows.",
    ["fabric", "knowledge-base", "search", "capture", "knowledge-intake", "external-account", "sensitive-personal-data"],
  ),
  "leegitw-failure-memory": keepSkill(
    "failure-memory",
    "Failure Memory",
    "Capture failures, root causes, and prevention notes so agents can consult prior lessons before similar tasks.",
    ["memory", "qa", "lessons-learned", "agent-safety", "company-scoped"],
  ),
  "autogame-17-feishu-memory-recall": keepSkill(
    "feishu-memory-recall",
    "Feishu Memory Recall",
    "Recall approved Feishu knowledge and notes for teams that use Feishu as a company collaboration memory surface.",
    ["feishu", "memory", "knowledge-base", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "xiaoluoboding-flomo-notes": keepSkill(
    "flomo-inbox-capture",
    "Flomo Inbox Capture",
    "Capture short notes and memos into Flomo for lightweight inbox, reflection, and research workflows.",
    ["flomo", "notes", "inbox", "capture", "knowledge-intake", "external-account", "sensitive-personal-data"],
  ),
  "devhoangkien-medium-writer": keepSkill(
    "medium-draft-publisher",
    "Medium Draft Publisher",
    "Draft and publish Medium articles for reviewed content workflows with explicit approval before external publication.",
    ["publishing", "medium", "content", "marketing", "external-account", "requires-human-confirmation"],
  ),
  "user520512-meeting-notes": keepSkill(
    "meeting-notes",
    "Meeting Notes",
    "Transform meeting transcripts into structured notes, decisions, risks, and board-readable summaries.",
    ["meetings", "transcripts", "summaries", "action-items", "knowledge-base", "sensitive-personal-data"],
  ),
  "codedao12-meeting-to-action": keepSkill(
    "meeting-action-extractor",
    "Meeting Action Extractor",
    "Extract decisions, owners, and follow-up actions from meeting notes so operators can turn discussion into work.",
    ["meetings", "transcripts", "decisions", "action-items", "tasks", "board-inbox", "sensitive-personal-data"],
  ),
  "morrow-agent-memory": keepSkill(
    "agent-continuity-memory",
    "Agent Continuity Memory",
    "Preserve agent continuity memories with company-scoped recall for long-running projects and handoffs.",
    ["memory", "continuity", "context-recovery", "company-scoped", "sensitive-personal-data"],
  ),
  "billhao-nosi": keepSkill(
    "nosi-share-publisher",
    "Nosi Share Publisher",
    "Publish reviewed notes or artifacts to share links when operators need lightweight external report distribution.",
    ["publishing", "share-links", "documents", "external-account", "requires-human-confirmation"],
  ),
  "swaylq-session-memory": keepSkill(
    "session-memory-toolkit",
    "Session Memory Toolkit",
    "Persist session-level summaries, context, and decisions so agents can resume work with auditable continuity.",
    ["memory", "continuity", "context", "company-scoped", "sensitive-personal-data"],
  ),
  "jarvis-drakon-shieldcortex-skill": keepSkill(
    "shieldcortex-memory-safety",
    "ShieldCortex Memory Safety",
    "Review memory for poisoning, prompt-injection risks, and unsafe recall before it influences future agent behavior.",
    ["security", "memory-safety", "memory-poisoning", "prompt-injection", "company-scoped", "requires-human-confirmation"],
  ),
  "caqlayan-tweet-processor": keepSkill(
    "tweet-insight-processor",
    "Tweet Insight Processor",
    "Turn public tweets and social links into structured insights for market research, content planning, and knowledge capture.",
    ["twitter", "social-media", "knowledge-intake", "summaries", "research-lab", "public-data"],
  ),
  "wemcdonald-upnote": keepSkill(
    "upnote-manager",
    "UpNote Manager",
    "Manage UpNote notebooks and notes for local or personal PKM workflows assigned to trusted operator agents.",
    ["upnote", "notes", "notebooks", "knowledge-base", "local-only-macos", "sensitive-personal-data"],
  ),
  "toniaczlog-voice-notes-pro": keepSkill(
    "voice-notes-processor",
    "Voice Notes Processor",
    "Transcribe and summarize voice notes into structured knowledge intake for meetings, WhatsApp, and operator capture.",
    ["voice-notes", "transcription", "whatsapp", "summaries", "knowledge-intake", "sensitive-personal-data"],
  ),
};



const PRODUCTIVITY_TASKS_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "enzoricciulli-adaptive-reasoning": keepSkill(
    "adaptive-reasoning-router",
    "Adaptive Reasoning Router",
    "Assess task complexity and choose an appropriate reasoning depth before agents spend time or model budget.",
    ["planning", "reasoning", "cost-control", "workflow", "agent-ops", "quality-control"],
  ),
  "k0nkupa-asana": keepSkill(
    "asana-project-manager",
    "Asana Project Manager",
    "Manage Asana projects, tasks, comments, and status updates through approved workspace access.",
    ["asana", "project-management", "tasks", "external-account", "requires-human-confirmation", "board-visible"],
  ),
  "atakanermis-atlassian-mcp": keepSkill(
    "atlassian-jira-manager",
    "Atlassian Jira Manager",
    "Use Atlassian and Jira MCP workflows for issues, project tracking, comments, and team coordination.",
    ["jira", "atlassian", "issues", "project-management", "external-account", "requires-human-confirmation"],
  ),
  "xejrax-brainz-tasks": keepSkill(
    "todoist-task-manager",
    "Todoist Task Manager",
    "Manage Todoist tasks for operator follow-ups, small-team checklists, and personal chief-of-staff workflows.",
    ["todoist", "tasks", "todo", "external-account", "requires-human-confirmation", "sensitive-personal-data"],
  ),
  "insipidpoint-checkmate": keepSkill(
    "completion-criteria-gate",
    "Completion Criteria Gate",
    "Turn goals into pass/fail criteria, run a worker loop, and judge completion before work moves to done.",
    ["qa", "acceptance-criteria", "review-loop", "agent-safety", "board-visible", "quality-control"],
  ),
  "pvoo-clickup-mcp": keepSkill(
    "clickup-workspace-manager",
    "ClickUp Workspace Manager",
    "Manage ClickUp tasks, docs, time tracking, comments, chat, and search through approved workspace access.",
    ["clickup", "tasks", "docs", "time-tracking", "project-management", "external-account", "requires-human-confirmation"],
  ),
  "davidedicillo-codifica": keepSkill(
    "context-handoff",
    "Context Handoff",
    "Preserve useful context when work moves between agents or between an agent and a human reviewer.",
    ["context", "handoff", "company-scoped", "memory-safety", "agent-ops"],
  ),
  "amaialex-excel-workflow": keepSkill(
    "excel-workflow-automation",
    "Excel Workflow Automation",
    "Process Excel workbooks, preserve formulas, and coordinate Google Drive sync for approved reporting workflows.",
    ["spreadsheets", "excel", "google-drive", "reporting", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "cimes19-facture-make": keepSkill(
    "facture-invoice-handoff",
    "Facture Invoice Handoff",
    "Generate professional invoice drafts and hand them to Make.com only after an explicit confirmation step.",
    ["invoicing", "make", "finance-ops", "automation", "external-account", "financial-action", "requires-human-confirmation"],
  ),
  "agrublev-freedcamp-agent-skill": keepSkill(
    "freedcamp-project-manager",
    "Freedcamp Project Manager",
    "Manage Freedcamp projects, groups, tasks, comments, notifications, and task lists through approved API credentials.",
    ["freedcamp", "project-management", "tasks", "comments", "external-account", "requires-human-confirmation"],
  ),
  "jk-0001-goal-setting-okrs": keepSkill(
    "okr-planner",
    "OKR Planner",
    "Set and track company goals, objectives, key results, and planning frameworks for board-visible strategy work.",
    ["okrs", "goals", "planning", "strategy", "board-visible", "project-management"],
  ),
  "armandobrazil-humanod": keepSkill(
    "humanod-human-task-delegation",
    "Humanod Human Task Delegation",
    "Create and track real-world human tasks through Humanod while keeping scope, cost, and shared context reviewable.",
    ["human-delegation", "real-world-tasks", "operations", "external-account", "financial-action", "requires-human-confirmation", "sensitive-personal-data"],
  ),
  "kambrosgroup-invoice-tracker-pro": keepSkill(
    "invoice-tracker-pro",
    "Invoice Tracker Pro",
    "Track freelance invoices, payment status, billing follow-up, and reviewed invoice workflows.",
    ["invoicing", "finance-ops", "billing", "payments", "financial-action", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "bivex-kanboard-skill": keepSkill(
    "kanboard-project-manager",
    "Kanboard Project Manager",
    "Manage Kanboard projects, columns, tasks, and comments for self-hosted company task boards.",
    ["kanboard", "kanban", "tasks", "project-management", "self-hosted", "external-account", "requires-human-confirmation"],
  ),
  "olegantonov-limesurvey": keepSkill(
    "limesurvey-operations",
    "LimeSurvey Operations",
    "Create, manage, and inspect LimeSurvey surveys and responses for research and operations workflows.",
    ["forms", "surveys", "research", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "yonghaozhao722-longrunning-agent": keepSkill(
    "long-running-project-continuity",
    "Long-Running Project Continuity",
    "Support long-running projects across sessions with scoped checkpoints and resumable context.",
    ["continuity", "state-persistence", "context-recovery", "company-scoped", "agent-ops", "workflow"],
  ),
  "seesayearn-boop-loopuman-human-tasks": keepSkill(
    "loopuman-human-worker-delegation",
    "Loopuman Human Worker Delegation",
    "Delegate approved work to human workers while keeping task scope, cost, and status visible to operators.",
    ["human-delegation", "tasks", "operations", "external-account", "financial-action", "requires-human-confirmation"],
  ),
  "heyitsaif-magic-api": keepSkill(
    "magic-human-assistant-handoff",
    "Magic Human Assistant Handoff",
    "Hand off tasks to human assistants and track completion with reviewable instructions and results.",
    ["human-assistants", "delegation", "task-tracking", "external-account", "financial-action", "requires-human-confirmation", "sensitive-personal-data"],
  ),
  "slemo54-mcp-workflow": keepSkill(
    "mcp-workflow-patterns",
    "MCP Workflow Patterns",
    "Design MCP-based workflow automation patterns that keep tool access scoped and reviewable.",
    ["mcp", "workflow", "agent-ops", "tooling", "requires-human-confirmation"],
  ),
  "bparticle-natural-language-planner": keepSkill(
    "natural-language-planner",
    "Natural Language Planner",
    "Turn natural-language goals into task plans, project structure, and board-inbox proposals.",
    ["planning", "tasks", "project-management", "board-inbox"],
  ),
  "staybased-ops-hygiene": keepSkill(
    "agent-ops-hygiene",
    "Agent Ops Hygiene",
    "Apply operational maintenance, security hygiene, and system-health SOPs for agent teams.",
    ["agent-ops", "security", "maintenance", "observability", "requires-human-confirmation"],
  ),
  "gakkiismywife-recruiter-assistant": keepSkill(
    "recruiting-workflow-assistant",
    "Recruiting Workflow Assistant",
    "Screen resumes, draft interview questions, and organize recruiting workflows with human review for candidate decisions.",
    ["recruiting", "hr", "resume-screening", "interviews", "sensitive-personal-data", "regulated-workflow", "requires-human-confirmation"],
  ),
  "staybased-reef-n8n-automation": keepSkill(
    "n8n-workflow-automation",
    "n8n Workflow Automation",
    "Build and customize reviewed n8n automations from workflow templates for approved operations tasks.",
    ["automation", "n8n", "workflow", "saaS-ops", "external-account", "host-mutation", "requires-human-confirmation"],
  ),
  "ndgates-sanctifai": keepSkill(
    "sanctifai-human-review",
    "SanctifAI Human Review",
    "Send reviewed questions or artifacts to human-in-the-loop reviewers and wait for responses.",
    ["human-in-the-loop", "review", "operations", "external-account", "requires-human-confirmation", "sensitive-personal-data"],
  ),
  "xbillwatsonx-session-watchdog": keepSkill(
    "session-checkpoint-watchdog",
    "Session Checkpoint Watchdog",
    "Watch context levels and save scoped checkpoints before compaction or long-running session handoff.",
    ["context", "tokens", "state-persistence", "context-recovery", "agent-ops", "company-scoped"],
  ),
  "sarthib7-sokosumi": keepSkill(
    "sokosumi-sub-agent-marketplace",
    "Sokosumi Sub-Agent Marketplace",
    "Hire specialist sub-agents from Sokosumi only after reviewed scope, spend, and data-sharing approval.",
    ["agent-marketplace", "delegation", "specialists", "external-account", "financial-action", "requires-human-confirmation"],
  ),
  "tokyo-s-smartbill": keepSkill(
    "smartbill-invoicing",
    "SmartBill Invoicing",
    "Issue SmartBill invoices through approved account access with explicit review before financial actions.",
    ["invoicing", "smartbill", "finance-ops", "external-account", "financial-action", "requires-human-confirmation", "sensitive-personal-data"],
  ),
  "richardsun700-task-resume": keepSkill(
    "interrupted-task-resume",
    "Interrupted Task Resume",
    "Resume interrupted tasks with queueing and recovery checks while preserving ownership and scoped context.",
    ["state-persistence", "context-recovery", "workflow", "agent-ops", "company-scoped"],
  ),
  "kamil-rudnicki-timecamp": keepSkill(
    "timecamp-time-tracker",
    "TimeCamp Time Tracker",
    "Read and manage TimeCamp time entries, tasks, and timers for operational reporting and budget visibility.",
    ["timecamp", "time-tracking", "tasks", "operations", "external-account", "requires-human-confirmation"],
  ),
  "nickian-vikunja-tasks": keepSkill(
    "vikunja-task-manager",
    "Vikunja Task Manager",
    "Manage tasks and projects in a self-hosted Vikunja instance through approved API access.",
    ["vikunja", "tasks", "projects", "self-hosted", "project-management", "external-account", "requires-human-confirmation"],
  ),
  "tallhamn-wrike": keepSkill(
    "wrike-project-manager",
    "Wrike Project Manager",
    "Manage Wrike tasks, projects, folders, and comments for enterprise project workflows.",
    ["wrike", "project-management", "tasks", "folders", "comments", "external-account", "requires-human-confirmation"],
  ),
  "zlc000190-writing-plans": keepSkill(
    "implementation-plan-writer",
    "Implementation Plan Writer",
    "Write implementation plans, acceptance criteria, and verification steps before agents start complex work.",
    ["planning", "issues", "acceptance-criteria", "board-visible", "quality-control"],
  ),
  "cramtek-plans-methodology": keepSkill(
    "plans-methodology",
    "Plans Methodology",
    "Use a structured planning methodology for work tracking while keeping PaperClaw issues as the source of truth.",
    ["planning", "project-management", "issues", "board-visible"],
  ),
  "leegitw-workflow-tools": keepSkill(
    "workflow-diagnostics",
    "Workflow Diagnostics",
    "Detect loops, improve task splits, and review workflow quality before agents waste time on weak plans.",
    ["workflow", "loop-detection", "agent-safety", "quality-control", "agent-ops"],
  ),
  "deeqyaqub1-cmd-zero-rules": keepSkill(
    "deterministic-task-router",
    "Deterministic Task Router",
    "Route deterministic work to cheap tools before using an LLM for math, time, currency, files, or scheduling checks.",
    ["deterministic-tools", "cost-control", "workflow", "agent-ops"],
  ),
  "lokendragami1-envato-comment-task-to-sheet": keepSkill(
    "envato-comments-to-tasks",
    "Envato Comments to Tasks",
    "Convert ThemeForest and CodeCanyon comments into structured product, support, and development task sheets.",
    ["customer-feedback", "task-extraction", "spreadsheets", "product", "support", "external-account"],
  ),
  "dasonshi-hylo-ghl": keepSkill(
    "gohighlevel-workflow-automation",
    "GoHighLevel Workflow Automation",
    "Automate reviewed GoHighLevel CRM and workflow actions for sales, marketing, and operations teams.",
    ["crm", "ghl", "sales", "marketing", "saaS-ops", "external-account", "outbound-contact", "requires-human-confirmation", "sensitive-personal-data"],
  ),
  "nonlinear-token-management": keepSkill(
    "api-token-management",
    "API Token Management",
    "Manage API token workflows for agent operations without exposing raw credentials in issues or transcripts.",
    ["secrets", "token-management", "security", "agent-ops", "company-scoped", "requires-human-confirmation", "sensitive-personal-data"],
  ),
};



const SECURITY_PASSWORDS_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "steipete-1password": keepSkill(
    "onepassword-cli-vault",
    "1Password CLI Vault",
    "Use the 1Password CLI for tightly scoped credential lookup and vault-backed secret workflows.",
    ["security", "secrets", "password-manager", "onepassword", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "raghulpasupathi-age-verification": keepSkill(
    "age-verification-gates",
    "Age Verification Gates",
    "Review age-appropriate access and content-filtering workflows for regulated or child-safety-sensitive products.",
    ["security", "content-safety", "age-verification", "regulated-workflow", "child-data", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "brandonwise-api-security": keepSkill(
    "api-security-patterns",
    "API Security Patterns",
    "Review API authentication, authorization, input validation, rate limiting, and secure design patterns.",
    ["security", "api", "auth", "authorization", "rate-limiting", "input-validation", "code-review", "research-lab"],
  ),
  "authensor-authensor-gateway": keepSkill(
    "openclaw-policy-gateway",
    "OpenClaw Policy Gateway",
    "Evaluate policy-gateway patterns for marketplace skill execution, install safety, and agent tool governance.",
    ["security", "marketplace", "policy-gateway", "openclaw", "agent-safety", "install-safety", "requires-human-confirmation"],
  ),
  "asleep123-bitwarden": keepSkill(
    "bitwarden-vaultwarden-manager",
    "Bitwarden/Vaultwarden Manager",
    "Access Bitwarden or Vaultwarden password-manager workflows through approved account and vault access.",
    ["security", "secrets", "password-manager", "bitwarden", "vaultwarden", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "misirov-clawdstrike": keepSkill(
    "openclaw-gateway-threat-model",
    "OpenClaw Gateway Threat Model",
    "Threat-model OpenClaw gateway hosts and route findings into reviewed security or infrastructure issues.",
    ["security", "gateway", "threat-model", "openclaw", "infrastructure", "agent-safety", "requires-human-confirmation"],
  ),
  "davida-ps-clawtributor": keepSkill(
    "community-incident-reporting",
    "Community Incident Reporting",
    "Prepare community incident, marketplace abuse, and trust reports with reviewed evidence and disclosure boundaries.",
    ["security", "incident-reporting", "trust", "marketplace", "board-visible", "requires-human-confirmation"],
  ),
  "gnarco-dashlane": keepSkill(
    "dashlane-vault-access",
    "Dashlane Vault Access",
    "Access Dashlane passwords, secure notes, secrets, and OTP workflows for trusted security agents.",
    ["security", "secrets", "password-manager", "dashlane", "otp", "external-account", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "jamesouttake-domain-trust-check": keepSkill(
    "domain-trust-check",
    "Domain Trust Check",
    "Check URLs for phishing, malware, brand abuse, and scam signals before agents visit, cite, or share them.",
    ["security", "domain-trust", "phishing", "malware", "brand-abuse", "external-account", "requires-human-confirmation"],
  ),
  "aronchick-expanso-tls-inspect": keepSkill(
    "tls-certificate-inspector",
    "TLS Certificate Inspector",
    "Inspect TLS certificate expiry, SANs, chain, and cipher details for domain and infrastructure reviews.",
    ["security", "tls", "certificates", "domain-trust", "public-data", "monitoring"],
  ),
  "amascia-gg-ggshield-scanner": keepSkill(
    "gitguardian-secrets-scanner",
    "GitGuardian Secrets Scanner",
    "Detect hardcoded secrets in repositories and generated artifacts before handoff or publication.",
    ["security", "secrets", "scanner", "code-review", "dependencies", "external-account", "requires-human-confirmation"],
  ),
  "thegdsks-glin-profanity": keepSkill(
    "content-moderation-filter",
    "Content Moderation Filter",
    "Scan agent outputs, user submissions, comments, and reports for profanity or moderation flags as an advisory check.",
    ["security", "content-safety", "moderation", "text-classification", "privacy"],
  ),
  "irook661-go-security-vulnerability": keepSkill(
    "go-vulnerability-scanner",
    "Go Vulnerability Scanner",
    "Identify and triage Go security vulnerabilities, dependency risks, and remediation candidates.",
    ["security", "go", "vulnerability-scanning", "dependencies", "code-review", "qa"],
  ),
  "raghulpasupathi-hash-toolkit": keepSkill(
    "hash-and-dedup-toolkit",
    "Hash & Dedup Toolkit",
    "Generate content hashes for deduplication, provenance checks, evidence correlation, and safe artifact comparison.",
    ["security", "content-safety", "hashing", "deduplication", "provenance", "privacy"],
  ),
  "cenralsolution-mfa-word": keepSkill(
    "mfa-word-gate",
    "MFA Word Gate",
    "Add a lightweight local confirmation word gate before sensitive files or system commands are accessed.",
    ["security", "approvals", "confirmation-gate", "host-mutation", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "youdaolee-page-behavior-audit": keepSkill(
    "page-behavior-audit",
    "Page Behavior Audit",
    "Audit page behavior, policy signals, and suspicious content patterns for controlled browser or QA reviews.",
    ["security", "browser-automation", "page-audit", "behavior-audit", "policy", "qa", "agent-safety"],
  ),
  "grittygrease-safe-encryption-skill": keepSkill(
    "safe-encryption-cli",
    "SAFE Encryption CLI",
    "Encrypt, decrypt, and manage keys through SAFE CLI workflows with explicit review for private files and keys.",
    ["security", "encryption", "keys", "files", "sensitive-personal-data", "requires-human-confirmation"],
  ),
  "brandonwise-secure-auth-patterns": keepSkill(
    "auth-session-security-patterns",
    "Auth & Session Security Patterns",
    "Review JWT, OAuth2, session management, RBAC, authentication, and authorization patterns for applications.",
    ["security", "auth", "oauth", "jwt", "sessions", "rbac", "code-review", "sensitive-personal-data"],
  ),
  "snapsynapse-skill-provenance": keepSkill(
    "skill-provenance-verifier",
    "Skill Provenance Verifier",
    "Verify skill bundle versions, provenance, and integrity before marketplace review or installation.",
    ["security", "marketplace", "provenance", "integrity", "install-safety", "agent-safety"],
  ),
  "raullenchai-vnsh": keepSkill(
    "encrypted-expiring-file-share",
    "Encrypted Expiring File Share",
    "Create encrypted expiring file-share links for reviewed private artifact handoffs.",
    ["security", "file-sharing", "encryption", "external-link", "sensitive-personal-data", "requires-human-confirmation"],
  ),
};



const DATA_ANALYTICS_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "jeftekhari-add-analytics": keepSkill(
    "google-analytics-installer",
    "Google Analytics Installer",
    "Add GA4 tracking to approved web projects with reviewable code changes for growth and product analytics.",
    ["analytics", "marketing", "web-frontend", "host-mutation", "requires-human-confirmation"],
  ),
  "sohamganatra-amplitude-automation": keepSkill(
    "amplitude-automation",
    "Amplitude Automation",
    "Automate Amplitude project, event, dashboard, and reporting workflows through approved external credentials.",
    ["analytics", "product", "external-account", "requires-human-confirmation"],
  ),
  "jeftekhari-check-analytics": keepSkill(
    "analytics-implementation-audit",
    "Analytics Implementation Audit",
    "Audit Google Analytics tracking, tags, and event coverage before launches or growth reports.",
    ["analytics", "qa", "marketing", "web-frontend"],
  ),
  "gitgoodordietrying-csv-pipeline": keepSkill(
    "csv-json-pipeline",
    "CSV & JSON Pipeline",
    "Process, transform, analyze, and report on CSV and JSON datasets for operations and Research Lab work.",
    ["data-processing", "reporting", "research-lab", "analytics"],
  ),
  "visualdeptcreative-daily-report": keepSkill(
    "daily-metrics-report",
    "Daily Metrics Report",
    "Produce daily progress, metrics, memory, and activity summaries for operators and board-visible updates.",
    ["reporting", "metrics", "board-inbox", "memory", "company-scoped"],
  ),
  "oyi77-data-analyst": keepSkill(
    "data-analyst",
    "Data Analyst",
    "Generate SQL, visualizations, spreadsheet analysis, and board-ready reports from approved datasets.",
    ["analytics", "reporting", "sql", "spreadsheets", "sensitive-personal-data"],
  ),
  "visualdeptcreative-data-enricher": keepSkill(
    "lead-data-enricher",
    "Lead Data Enricher",
    "Enrich lead lists and normalize prospect data for sales and research workflows.",
    ["marketing", "sales", "data-enrichment", "external-account", "sensitive-personal-data"],
  ),
  "datadrivenconstruction-data-lineage-tracker": keepSkill(
    "data-lineage-tracker",
    "Data Lineage Tracker",
    "Track source, transformation, and provenance metadata for datasets used in reports and decisions.",
    ["data-governance", "lineage", "audit", "reporting"],
  ),
  "camelsprout-duckdb-cli-ai-skills": keepSkill(
    "duckdb-sql-analyst",
    "DuckDB SQL Analyst",
    "Use DuckDB CLI for local SQL analysis, joins, transformations, and repeatable data inspection.",
    ["database", "sql", "analytics", "local-only", "data-processing"],
  ),
  "longmaba-facebook-page-manager": keepSkill(
    "facebook-page-manager",
    "Facebook Page Manager",
    "Manage Facebook Page content and insights through Meta Graph API under reviewed account access.",
    ["marketing", "social-media", "external-account", "requires-human-confirmation"],
  ),
  "rich-song-google-analytics-api": keepSkill(
    "google-analytics-api",
    "Google Analytics API",
    "Query Google Analytics properties and reports for product, marketing, and executive dashboards.",
    ["analytics", "marketing", "reporting", "external-account", "sensitive-personal-data"],
  ),
  "tiagom101-ipinfo": keepSkill(
    "ip-geolocation-lookup",
    "IP Geolocation Lookup",
    "Resolve IP metadata for fraud review, support diagnostics, traffic analysis, and security reports.",
    ["security", "analytics", "public-data", "external-account"],
  ),
  "nickian-nocodb": keepSkill(
    "nocodb-operations",
    "NocoDB Operations",
    "Access and manage NocoDB tables, records, and operational databases through approved API credentials.",
    ["database", "saaS-ops", "external-account", "requires-human-confirmation"],
  ),
  "orosha-ai-osint-graph-analyzer": keepSkill(
    "osint-graph-analyzer",
    "OSINT Graph Analyzer",
    "Build knowledge graphs from OSINT sources for due diligence, market research, and risk reports.",
    ["research-lab", "osint", "knowledge-graph", "public-data"],
  ),
  "jeftekhari-remove-analytics": keepSkill(
    "analytics-removal",
    "Analytics Removal",
    "Remove Google Analytics tracking from approved projects for privacy, compliance, or migration work.",
    ["privacy", "analytics", "web-frontend", "host-mutation", "requires-human-confirmation"],
  ),
  "alirezarezvani-senior-data-engineer": keepSkill(
    "senior-data-engineer",
    "Senior Data Engineer",
    "Design data pipelines, warehouse models, validation checks, and scalable analytics workflows.",
    ["data-engineering", "pipelines", "database", "analytics", "research-lab"],
  ),
  "alirezarezvani-senior-data-scientist": keepSkill(
    "senior-data-scientist",
    "Senior Data Scientist",
    "Run statistical analysis, modeling, experiments, and data-science reports for strategic decisions.",
    ["data-science", "analytics", "experiments", "research-lab", "sensitive-personal-data"],
  ),
  "skywork-excel": keepSkill(
    "skywork-excel-analysis",
    "Skywork Excel Analysis",
    "Create, analyze, and report from spreadsheets for planning, finance, operations, and board summaries.",
    ["spreadsheets", "analytics", "reporting", "external-account", "sensitive-personal-data"],
  ),
  "stopmoclay-supabase": keepSkill(
    "supabase-operations",
    "Supabase Operations",
    "Work with Supabase databases, storage, and vector search for approved app and data workflows.",
    ["database", "vector-database", "external-account", "host-mutation", "requires-human-confirmation"],
  ),
  "noblepayne-tabstack-extractor": keepSkill(
    "tabstack-extractor",
    "Tabstack Extractor",
    "Extract structured data from websites for market research, audits, and reporting workflows.",
    ["web-research", "data-extraction", "public-data", "research-lab"],
  ),
  "hoangnv170752-thingsboard-skill": keepSkill(
    "thingsboard-operations",
    "ThingsBoard Operations",
    "Manage ThingsBoard devices, dashboards, and telemetry for IoT and operations teams.",
    ["iot", "telemetry", "dashboards", "external-account", "requires-human-confirmation"],
  ),
};



const CLI_UTILITIES_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "x1xhlol-agent-hardening": keepSkill(
    "agent-hardening-tester",
    "Agent Hardening Tester",
    "Stress-test agents and instructions against unsafe behavior, prompt injection, and tool misuse before assigning sensitive work.",
    ["cli-utilities", "security", "agent-safety", "qa", "requires-human-confirmation"],
  ),
  "theagentwire-agent-rate-limiter": keepSkill(
    "agent-rate-limiter",
    "Agent Rate Limiter",
    "Apply rate-limit patterns to agent API calls and external tool usage so autonomous teams do not overload services.",
    ["cli-utilities", "agent-ops", "reliability", "api", "cost-control"],
  ),
  "cerbug45-agents-skill-security-audit": keepSkill(
    "skill-security-audit",
    "Skill Security Audit",
    "Review skills, scripts, manifests, and setup instructions for supply-chain and runtime risks before marketplace approval.",
    ["cli-utilities", "security", "marketplace", "install-safety", "requires-human-confirmation"],
  ),
  "cerbug45-agents-skill-tdd-helper": keepSkill(
    "agent-tdd-helper",
    "Agent TDD Helper",
    "Help engineering agents convert requirements into focused tests, implementation loops, and regression checks.",
    ["cli-utilities", "qa", "testing", "coding", "research-lab"],
  ),
  "trypto1019-arc-memory-pruner": keepSkill(
    "agent-memory-pruner",
    "Agent Memory Pruner",
    "Clean and compact long-running agent memory so company knowledge stays useful, scoped, and auditable.",
    ["cli-utilities", "memory", "knowledge-base", "company-scoped", "sensitive-personal-data"],
  ),
  "hagiss-askhuman": keepSkill(
    "ask-human",
    "Ask Human",
    "Pause agent work and request operator judgment when a task needs context, approval, or a business decision.",
    ["cli-utilities", "approvals", "workflow", "agent-ops", "requires-human-confirmation"],
  ),
  "itsnishi-audit-code": keepSkill(
    "code-security-audit",
    "Code Security Audit",
    "Audit code for vulnerabilities, unsafe patterns, and dependency risks before Research Lab or production handoff.",
    ["cli-utilities", "security", "code-review", "qa", "research-lab"],
  ),
  "andyxinweiminicloud-behavioral-invariant-monitor": keepSkill(
    "behavioral-invariant-monitor",
    "Behavioral Invariant Monitor",
    "Monitor agent behavior against expected invariants so regressions, drift, and unsafe loops are caught early.",
    ["cli-utilities", "agent-safety", "observability", "qa", "agent-ops"],
  ),
  "tkuehnl-cacheforge-stats": keepSkill(
    "cacheforge-stats",
    "CacheForge Stats",
    "Inspect cache usage and performance signals so agents can reduce repeated work and token waste.",
    ["cli-utilities", "observability", "cost-control", "performance", "agent-ops"],
  ),
  "fusionlabssource-clawprint-verify": keepSkill(
    "clawprint-verify",
    "ClawPrint Verify",
    "Add lightweight verification checks for human approval, operator confirmation, and sensitive task handoffs.",
    ["cli-utilities", "approvals", "security", "requires-human-confirmation"],
  ),
  "marcoracer-clean-pytest": keepSkill(
    "clean-pytest",
    "Clean Pytest",
    "Improve Python test output and failure triage for engineering agents working in Research Lab projects.",
    ["cli-utilities", "qa", "testing", "coding", "research-lab"],
  ),
  "kaicianflone-consensus-interact": keepSkill(
    "consensus-workflow",
    "Consensus Workflow",
    "Collect multi-agent or multi-model opinions before high-impact recommendations go to the CEO or board.",
    ["cli-utilities", "multi-agent", "approvals", "quality-control", "board-inbox"],
  ),
  "emberdesire-context-compactor": keepSkill(
    "context-compactor",
    "Context Compactor",
    "Compress task context into durable summaries so long-running agents keep the important decisions without wasting tokens.",
    ["cli-utilities", "context", "memory", "tokens", "cost-control"],
  ),
  "nietzsche247-context-sentinel": keepSkill(
    "context-sentinel",
    "Context Sentinel",
    "Watch agent context size and quality so sessions can summarize, checkpoint, or switch model strategy at the right time.",
    ["cli-utilities", "context", "tokens", "agent-ops", "observability"],
  ),
  "gopinathnelluri-contextkeeper": keepSkill(
    "contextkeeper",
    "ContextKeeper",
    "Maintain project and task context across agent sessions while preserving PaperClaw company boundaries.",
    ["cli-utilities", "context", "memory", "company-scoped", "knowledge-base"],
  ),
  "steipete-create-cli": keepSkill(
    "cli-designer",
    "CLI Designer",
    "Design useful command-line interfaces, commands, help text, and workflow ergonomics for tools agents build.",
    ["cli-utilities", "coding", "developer-tools", "research-lab"],
  ),
  "arnarsson-curl-http": keepSkill(
    "curl-http-toolkit",
    "Curl HTTP Toolkit",
    "Run structured HTTP checks for API testing, integration debugging, and service verification.",
    ["cli-utilities", "api", "qa", "research-lab", "external-account"],
  ),
  "fratua-dependency-audit": keepSkill(
    "dependency-audit",
    "Dependency Audit",
    "Audit dependency health and known vulnerabilities before installs, builds, and production handoffs.",
    ["cli-utilities", "security", "dependencies", "qa", "research-lab"],
  ),
  "domain-checker": keepSkill(
    "domain-checker",
    "Domain Checker",
    "Check domain availability with DNS and WHOIS signals for company naming, product launches, and marketing research.",
    ["cli-utilities", "marketing", "research-lab", "public-data"],
  ),
  "amar1432-error-guard": keepSkill(
    "error-guard",
    "Error Guard",
    "Detect and prevent fragile agent execution paths, deadlocks, and repeated failures before they waste operator time.",
    ["cli-utilities", "agent-safety", "qa", "observability"],
  ),
  "andyxinweiminicloud-evolution-drift-detector": keepSkill(
    "skill-drift-detector",
    "Skill Drift Detector",
    "Detect when skills, instructions, or expected agent behaviors drift from approved marketplace behavior.",
    ["cli-utilities", "marketplace", "security", "agent-safety", "observability"],
  ),
  "aronchick-expanso-edge": keepSkill(
    "expanso-edge-pipelines",
    "Expanso Edge Pipelines",
    "Build lightweight text and JSON processing pipelines for operational data, logs, and Research Lab artifacts.",
    ["cli-utilities", "data-processing", "workflow", "research-lab"],
  ),
  "aronchick-expanso-json-flatten": keepSkill(
    "json-flatten",
    "JSON Flatten",
    "Flatten nested JSON into easier-to-review fields for API debugging, reports, and data inspection.",
    ["cli-utilities", "json", "data-processing", "api"],
  ),
  "aronchick-expanso-json-validate": keepSkill(
    "json-validator",
    "JSON Validator",
    "Validate JSON payloads and config snippets before agents use them in APIs, scripts, or generated artifacts.",
    ["cli-utilities", "json", "qa", "api"],
  ),
  "aronchick-expanso-language-detect": keepSkill(
    "language-detector",
    "Language Detector",
    "Detect language in customer text, documents, transcripts, and research snippets for routing and localization.",
    ["cli-utilities", "language", "data-processing", "sensitive-personal-data"],
  ),
  "aronchick-expanso-pii-redact": keepSkill(
    "pii-redactor",
    "PII Redactor",
    "Redact sensitive personal data from logs, transcripts, and documents before agents store or share them.",
    ["cli-utilities", "privacy", "security", "sensitive-personal-data", "knowledge-base"],
  ),
  "aronchick-expanso-sentiment-score": keepSkill(
    "sentiment-scorer",
    "Sentiment Scorer",
    "Score sentiment in customer messages, reviews, and research excerpts for support and marketing reports.",
    ["cli-utilities", "analytics", "marketing", "sensitive-personal-data"],
  ),
  "aronchick-expanso-text-summarize": keepSkill(
    "text-summarizer",
    "Text Summarizer",
    "Summarize long text into concise operational notes for agents, meetings, research, and board handoffs.",
    ["cli-utilities", "summaries", "knowledge-base", "research-lab"],
  ),
  "arnarsson-fd-find": keepSkill(
    "fd-file-search",
    "fd File Search",
    "Search local workspaces quickly so coding and Research Lab agents can find files without broad shell exploration.",
    ["cli-utilities", "developer-tools", "coding", "research-lab"],
  ),
  "rumengkai-find-slills": keepSkill(
    "skill-finder",
    "Skill Finder",
    "Find relevant skills for an agent task and prepare marketplace review notes before installation.",
    ["cli-utilities", "marketplace", "skills", "agent-ops"],
  ),
  "lidekahdjdhdhsjjs-lang-hz-context-optimizer": keepSkill(
    "context-optimizer",
    "Context Optimizer",
    "Optimize prompt and task context so agents preserve important facts while reducing noise and cost.",
    ["cli-utilities", "context", "tokens", "cost-control", "agent-ops"],
  ),
  "bowen31337-intelligent-router": keepSkill(
    "intelligent-model-router",
    "Intelligent Model Router",
    "Route work to the right model or agent class based on cost, quality, and task complexity.",
    ["cli-utilities", "model-routing", "cost-control", "agent-ops", "multi-agent"],
  ),
  "iyeque-iyeque-local-system-info": keepSkill(
    "local-system-info",
    "Local System Info",
    "Read local CPU, memory, disk, and process metrics for diagnostics in self-hosted PaperClaw deployments.",
    ["cli-utilities", "diagnostics", "self-hosting", "sensitive-personal-data"],
  ),
  "xd4o-kimi-usage-monitor": keepSkill(
    "kimi-usage-monitor",
    "Kimi Usage Monitor",
    "Monitor Kimi API usage and quota so agents can stay within approved budget and provider limits.",
    ["cli-utilities", "cost-control", "model-provider", "external-account"],
  ),
  "wanng-ide-markdown-validator": keepSkill(
    "markdown-link-validator",
    "Markdown Link Validator",
    "Validate Markdown structure and links before reports, docs, and Research Lab summaries reach the board.",
    ["cli-utilities", "documentation", "qa", "research-lab"],
  ),
  "andrewandrewsen-messageguard": keepSkill(
    "messageguard",
    "MessageGuard",
    "Scan outbound agent messages for secrets, sensitive data, and risky content before external delivery.",
    ["cli-utilities", "security", "privacy", "approvals", "requires-human-confirmation"],
  ),
  "raghulpasupathi-nsfw-detection": keepSkill(
    "content-safety-detection",
    "Content Safety Detection",
    "Detect unsafe or explicit content in media and text workflows before agents store, publish, or summarize it.",
    ["cli-utilities", "content-safety", "privacy", "sensitive-personal-data"],
  ),
  "moep90-restic-home-backup-safe": keepSkill(
    "restic-backup-operator-safe",
    "Restic Backup Operator Safe",
    "Design and operate safer encrypted restic backups for self-hosted PaperClaw directories and operator workspaces.",
    ["cli-utilities", "backup", "self-hosting", "host-mutation", "requires-human-confirmation"],
  ),
  "aronchick-sentiment-score": keepSkill(
    "sentiment-scoring",
    "Sentiment Scoring",
    "Analyze sentiment in customer feedback, market research, and support messages for company reports.",
    ["cli-utilities", "analytics", "marketing", "sensitive-personal-data"],
  ),
  "rushant-123-session-cost-tracker": keepSkill(
    "session-cost-tracker",
    "Session Cost Tracker",
    "Track session-level token and API spend so operators can manage autonomous agent budgets.",
    ["cli-utilities", "cost-control", "tokens", "observability", "agent-ops"],
  ),
  "qsmtco-session-state-tracker": keepSkill(
    "session-state-tracker",
    "Session State Tracker",
    "Persist session state across restarts while keeping context scoped to the active company and task.",
    ["cli-utilities", "memory", "context", "company-scoped", "agent-ops"],
  ),
  "claudiodrusus-shelly-competitor-analyzer": keepSkill(
    "competitor-analyzer",
    "Competitor Analyzer",
    "Research competitors and turn findings into source-aware summaries for CEO, CMO, and board review.",
    ["cli-utilities", "research-lab", "marketing", "reporting"],
  ),
  "claudiodrusus-shelly-meeting-summarizer": keepSkill(
    "meeting-summarizer",
    "Meeting Summarizer",
    "Turn meeting notes and transcripts into decisions, risks, action items, and board-ready summaries.",
    ["cli-utilities", "meetings", "summaries", "board-inbox", "sensitive-personal-data"],
  ),
  "raghulpasupathi-smart-cache": keepSkill(
    "smart-cache",
    "Smart Cache",
    "Cache repeated work and data lookups so agent workflows run faster with less duplicated context.",
    ["cli-utilities", "performance", "cost-control", "agent-ops"],
  ),
  "cerbug45-sql-query-generator": keepSkill(
    "sql-query-generator",
    "SQL Query Generator",
    "Generate and review SQL for reporting and diagnostics, with clear separation between read-only and mutating database actions.",
    ["cli-utilities", "database", "analytics", "qa", "sensitive-personal-data"],
  ),
  "raghulpasupathi-text-detection": keepSkill(
    "ai-text-detection",
    "AI Text Detection",
    "Flag likely AI-written text for content review while keeping detector uncertainty visible to human reviewers.",
    ["cli-utilities", "content-safety", "marketing", "qa"],
  ),
  "diegofcornejo-totp": keepSkill(
    "totp-approval-gate",
    "TOTP Approval Gate",
    "Require time-based one-time-passcode confirmation before sensitive agent actions proceed.",
    ["cli-utilities", "security", "approvals", "requires-human-confirmation"],
  ),
  "sabrinaaquino-venice-transcribe": keepSkill(
    "audio-transcription",
    "Audio Transcription",
    "Transcribe meetings, calls, interviews, and Research Lab recordings into searchable company artifacts.",
    ["cli-utilities", "speech-to-text", "meetings", "sensitive-personal-data", "external-account"],
  ),
};



const CODING_AGENTS_IDES_KEEP_CURATIONS: Record<string, SkillCuration> = {
  "roosch269-agent-audit-trail": keepSkill(
    "agent-audit-trail",
    "Agent Audit Trail",
    "Create tamper-evident audit logs for autonomous agent decisions, tool calls, and handoffs.",
    ["coding-agents", "agent-ops", "audit", "security", "board-visible"],
  ),
  "olmmlo-cmd-agent-guardrails": keepSkill(
    "agent-guardrails",
    "Agent Guardrails",
    "Detect and block agent attempts to bypass command, policy, or operator rules.",
    ["coding-agents", "security", "agent-safety", "approvals"],
  ),
  "compass-soul-agent-safety": keepSkill(
    "agent-safety",
    "Agent Safety",
    "Scan outbound agent output before it leaves the workspace so sensitive or unsafe content is caught early.",
    ["coding-agents", "security", "privacy", "agent-safety", "requires-human-confirmation"],
  ),
  "andreagriffiths11-agent-context": keepSkill(
    "agent-context",
    "Agent Context",
    "Maintain local memory and context for coding agents while keeping state explicit and reviewable.",
    ["coding-agents", "memory", "context", "company-scoped", "sensitive-personal-data"],
  ),
  "neal-collab-agent-cost-monitor": keepSkill(
    "agent-cost-monitor",
    "Agent Cost Monitor",
    "Track token usage, cost, alerts, and budget pressure across autonomous agent work.",
    ["coding-agents", "cost-control", "tokens", "observability", "agent-ops"],
  ),
  "exe215-agentbench": keepSkill(
    "agentbench",
    "AgentBench",
    "Benchmark AI agents on realistic tasks so PaperClaw can compare reliability and regression risk.",
    ["coding-agents", "qa", "benchmarks", "agent-ops"],
  ),
  "nguyenphutrong-agentlens": keepSkill(
    "agentlens",
    "AgentLens",
    "Navigate and understand codebases with hierarchical maps for faster Research Lab and engineering work.",
    ["coding-agents", "code-analysis", "research-lab", "developer-tools"],
  ),
  "jeremysommerfeld8910-cpu-ai-collab": keepSkill(
    "ai-collab",
    "AI Collab",
    "Coordinate parallel AI coding agents while preserving shared task context and handoff visibility.",
    ["coding-agents", "multi-agent", "coding", "workflow"],
  ),
  "quratus-cli-worker": keepSkill(
    "cli-worker",
    "CLI Worker",
    "Run coding agents in isolated worktrees with visible task boundaries and reviewable output.",
    ["coding-agents", "coding", "research-lab", "host-mutation", "requires-human-confirmation"],
  ),
  "yaxuan42-claude-code-orchestrator": keepSkill(
    "claude-code-orchestrator",
    "Claude Code Orchestrator",
    "Trigger and observe Claude Code development tasks through managed terminal sessions.",
    ["coding-agents", "adapter", "coding", "agent-ops", "host-mutation"],
  ),
  "shalomobongo-codex-conductor": keepSkill(
    "codex-conductor",
    "Codex Conductor",
    "Coordinate Codex delivery sessions with structured planning, execution, and verification.",
    ["coding-agents", "adapter", "codex", "coding", "qa"],
  ),
  "microcarft-codex-orchestrator": keepSkill(
    "codex-orchestrator",
    "Codex Orchestrator",
    "Monitor, control, and orchestrate background Codex sessions for engineering work.",
    ["coding-agents", "adapter", "codex", "agent-ops", "host-mutation"],
  ),
  "daxingplay-cursor-cli-headless": keepSkill(
    "cursor-cli-headless",
    "Cursor CLI Headless",
    "Run Cursor-style coding work headlessly for controlled IDE-agent workflows.",
    ["coding-agents", "ide", "coding", "host-mutation", "requires-human-confirmation"],
  ),
  "bowen31337-pyright-lsp": keepSkill(
    "pyright-lsp",
    "Pyright LSP",
    "Provide Python static analysis, type checking, and code intelligence for agents.",
    ["coding-agents", "ide", "lsp", "python", "coding"],
  ),
  "bowen31337-gopls-lsp": keepSkill(
    "gopls-lsp",
    "gopls LSP",
    "Add Go language-server diagnostics for coding agents and IDE workflows.",
    ["coding-agents", "ide", "lsp", "coding"],
  ),
  "bowen31337-rust-analyzer-lsp": keepSkill(
    "rust-analyzer-lsp",
    "rust-analyzer LSP",
    "Provide Rust language-server diagnostics and code intelligence for agents.",
    ["coding-agents", "ide", "lsp", "rust", "coding"],
  ),
  "sadikjarvis-dcg-guard": keepSkill(
    "dangerous-command-guard",
    "Dangerous Command Guard",
    "Guard agent shell execution against destructive or high-risk commands.",
    ["coding-agents", "security", "agent-safety", "host-mutation", "requires-human-confirmation"],
  ),
  "fratua-dependency-auditor": keepSkill(
    "dependency-auditor",
    "Dependency Auditor",
    "Audit dependencies and package-manager risk before agent installs or releases.",
    ["coding-agents", "security", "dependencies", "qa", "research-lab"],
  ),
  "nirwandogra-credential-scanner": keepSkill(
    "credential-scanner",
    "Credential Scanner",
    "Scan repositories and generated artifacts for secrets before handoff or publishing.",
    ["coding-agents", "security", "secrets", "qa"],
  ),
  "poolguy24-skillsentry": keepSkill(
    "skillsentry-security-audit",
    "SkillSentry Security Audit",
    "Audit OpenClaw skills for prompt injection and unsafe install behavior before marketplace approval.",
    ["coding-agents", "security", "marketplace", "install-safety"],
  ),
  "benlee2144-skillshield": keepSkill(
    "skillshield-scanner",
    "SkillShield Scanner",
    "Run deep security scanning on skill folders with SARIF-style findings for review workflows.",
    ["coding-agents", "security", "marketplace", "qa"],
  ),
  "adainthelab-skulk-skill-scanner": keepSkill(
    "skulk-skill-scanner",
    "Skulk Skill Scanner",
    "Scan skill folders for red flags before installing or publishing them.",
    ["coding-agents", "security", "marketplace", "install-safety"],
  ),
  "yoder-bawt-yoder-skill-auditor": keepSkill(
    "skill-auditor",
    "Skill Auditor",
    "Review skills for security, prompt-injection risk, and supply-chain concerns.",
    ["coding-agents", "security", "marketplace", "install-safety"],
  ),
  "joetomasone-policy-engine": keepSkill(
    "policy-engine",
    "Policy Engine",
    "Apply deterministic governance rules to tool execution and sensitive agent actions.",
    ["coding-agents", "security", "approvals", "agent-safety"],
  ),
  "stephancill-permissions-broker": keepSkill(
    "permissions-broker",
    "Permissions Broker",
    "Broker agent permissions through auditable governance decisions instead of implicit tool access.",
    ["coding-agents", "security", "approvals", "agent-identity"],
  ),
  "mikeholownych-governance-wrapper": keepSkill(
    "governance-wrapper",
    "Governance Wrapper",
    "Wrap agent execution with policy checks, evidence logging, and approval-friendly traces.",
    ["coding-agents", "security", "audit", "approvals"],
  ),
  "tkuehnl-vibe-check": keepSkill(
    "code-quality-audit",
    "Code Quality Audit",
    "Review code changes for quality, correctness, and completion risks before delivery.",
    ["coding-agents", "qa", "code-review", "research-lab"],
  ),
  "guifav-test-sentinel": keepSkill(
    "test-sentinel",
    "Test Sentinel",
    "Run QA, lint, and test checks for agent-authored code before it is marked complete.",
    ["coding-agents", "qa", "testing", "coding"],
  ),
  "zlc000190-verification-before-completion": keepSkill(
    "verification-before-completion",
    "Verification Before Completion",
    "Require fresh verification evidence before an agent claims that work is done.",
    ["coding-agents", "qa", "verification", "agent-safety"],
  ),
  "kjaylee-verify-before-done": keepSkill(
    "verify-before-done",
    "Verify Before Done",
    "Force explicit verification steps before agent tasks move to done.",
    ["coding-agents", "qa", "verification", "agent-safety"],
  ),
  "glucksberg-pr-ship": keepSkill(
    "pr-ship",
    "PR Ship",
    "Create pre-ship risk and readiness reports for engineering changes.",
    ["coding-agents", "qa", "pull-requests", "coding"],
  ),
  "zerone0x-pr-triage": keepSkill(
    "pr-triage",
    "PR Triage",
    "Triage pull requests by risk, scope, and review priority.",
    ["coding-agents", "qa", "pull-requests", "coding"],
  ),
  "don-gbot-repo-analyzer": keepSkill(
    "repo-analyzer",
    "Repo Analyzer",
    "Analyze repository trust, quality, and engineering signals for due diligence.",
    ["coding-agents", "code-analysis", "research-lab", "qa"],
  ),
  "sarielwang93-context-budgeting": keepSkill(
    "context-budgeting",
    "Context Budgeting",
    "Control prompt and task context size to reduce cost while preserving important evidence.",
    ["coding-agents", "context", "tokens", "cost-control"],
  ),
  "igorls-context-builder": keepSkill(
    "context-builder",
    "Context Builder",
    "Build focused codebase context for agents before implementation or review.",
    ["coding-agents", "context", "code-analysis", "research-lab"],
  ),
  "phenomenoner-context-clean-up": keepSkill(
    "context-clean-up",
    "Context Clean Up",
    "Remove transcript noise while retaining decisions, risks, and audit-relevant details.",
    ["coding-agents", "context", "memory", "cost-control"],
  ),
  "mkhaytman87-token-counter": keepSkill(
    "token-counter",
    "Token Counter",
    "Track and analyze token usage across main, cron, and sub-agent sessions.",
    ["coding-agents", "tokens", "cost-control", "observability"],
  ),
  "tradmangh-token-monitor": keepSkill(
    "token-monitor",
    "Token Monitor",
    "Monitor token quotas and alert before long-running agent sessions exceed budget.",
    ["coding-agents", "tokens", "cost-control", "observability"],
  ),
  "vintlin-usage-visualizer": keepSkill(
    "usage-visualizer",
    "Usage Visualizer",
    "Visualize usage and cost signals for operators managing an AI company.",
    ["coding-agents", "cost-control", "observability", "reporting"],
  ),
  "samstone908-smart-models": keepSkill(
    "smart-model-router",
    "Smart Model Router",
    "Route work to models by task type, cost, and expected quality.",
    ["coding-agents", "model-routing", "cost-control", "agent-ops"],
  ),
  "dorukardahan-zeroapi": keepSkill(
    "zeroapi-model-router",
    "ZeroAPI Model Router",
    "Route tasks across approved model subscriptions and providers.",
    ["coding-agents", "model-routing", "cost-control", "external-account"],
  ),
  "gtovd-zown-gemini-governor": keepSkill(
    "gemini-governor",
    "Gemini Governor",
    "Manage Gemini token and model behavior for stable agent execution.",
    ["coding-agents", "model-routing", "tokens", "cost-control"],
  ),
  "rogue-agent1-port-check": keepSkill(
    "port-check",
    "Port Check",
    "Check local ports and service readiness for dev servers and Research Lab demos.",
    ["coding-agents", "devops", "diagnostics", "research-lab"],
  ),
  "tkuehnl-pager-triage": keepSkill(
    "pager-triage",
    "Pager Triage",
    "Triage incidents and alerts into operational next steps for engineering teams.",
    ["coding-agents", "incidents", "devops", "external-account"],
  ),
  "seanwyngaard-technical-doc-generator": keepSkill(
    "technical-doc-generator",
    "Technical Doc Generator",
    "Generate technical documentation for code, APIs, and architecture decisions.",
    ["coding-agents", "documentation", "coding", "research-lab"],
  ),
  "fratua-readme-generator": keepSkill(
    "readme-generator",
    "README Generator",
    "Generate README drafts from project context for Research Lab and release workflows.",
    ["coding-agents", "documentation", "research-lab"],
  ),
  "sunghyo-youtube-summary": keepSkill(
    "youtube-summary",
    "YouTube Summary",
    "Summarize YouTube videos into structured Markdown for research and knowledge-base intake.",
    ["coding-agents", "research-lab", "summaries", "knowledge-base"],
  ),
  "alti-systems-yt-transcript": keepSkill(
    "youtube-transcript",
    "YouTube Transcript",
    "Extract transcripts from YouTube videos for research, training notes, and sourced summaries.",
    ["coding-agents", "research-lab", "transcription", "knowledge-base"],
  ),
  "jovijovi-xiaohongshu-extract": keepSkill(
    "xiaohongshu-extract",
    "Xiaohongshu Extract",
    "Extract read-only Xiaohongshu metadata for market and content research.",
    ["coding-agents", "research-lab", "marketing", "public-data"],
  ),
  "cplusdev-urlcheck": keepSkill(
    "url-safety-checker",
    "URL Safety Checker",
    "Check URLs before agents fetch, open, install, or cite external resources.",
    ["coding-agents", "security", "web-research", "agent-safety"],
  ),
  "nutt-adam-tutti": keepSkill(
    "tutti-agent-orchestrator",
    "Tutti Agent Orchestrator",
    "Orchestrate multiple coding agents, handoffs, and workflow capacity for engineering delivery.",
    ["coding-agents", "multi-agent", "coding", "agent-ops", "host-mutation"],
  ),
  "vinayakv22-speckit-workflow": keepSkill(
    "speckit-workflow",
    "Speckit Workflow",
    "Run spec-driven development workflows that keep implementation aligned with requirements.",
    ["coding-agents", "planning", "coding", "qa"],
  ),
};



function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function includesAny(value: string | null | undefined, needles: string[]) {
  const normalized = value?.toLowerCase() ?? "";
  return needles.some((needle) => normalized.includes(needle));
}

function sourceSlug(skill: CuratableMarketplaceSkill) {
  if (skill.sourceUrl) {
    try {
      const parsed = new URL(skill.sourceUrl);
      const parts = parsed.pathname.split("/").filter(Boolean);
      const last = parts.pop();
      if (last && last.toLowerCase() !== "skill.md" && last.toLowerCase() !== "readme.md") return last.toLowerCase();
      const previous = parts.pop();
      if (previous) return previous.toLowerCase();
    } catch {
      // Fall back to id/slug below.
    }
  }
  const idTail = skill.id.split("/").filter(Boolean).pop();
  return (idTail || skill.slug).toLowerCase();
}

function isAppleAppsSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === APPLE_APPS_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/"])
      && (
        APPLE_APPS_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isAiLlmsSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === AI_LLMS_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/"])
      && (
        AI_LLMS_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isBrowserAutomationSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === BROWSER_AUTOMATION_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/"])
      && (
        BROWSER_AUTOMATION_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isCalendarSchedulingSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === CALENDAR_SCHEDULING_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/"])
      && (
        CALENDAR_SCHEDULING_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isClawdbotToolsSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === CLAWDBOT_TOOLS_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/"])
      && (
        CLAWDBOT_TOOLS_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isCliUtilitiesSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === CLI_UTILITIES_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "clawhub.ai/"])
      && (
        CLI_UTILITIES_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isCodingAgentsIdesSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === CODING_AGENTS_IDES_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/"])
      && (
        CODING_AGENTS_IDES_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isCommunicationSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === COMMUNICATION_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/"])
      && (
        COMMUNICATION_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isDataAnalyticsSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === DATA_ANALYTICS_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/"])
      && (
        DATA_ANALYTICS_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isDevopsAndCloudSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === DEVOPS_AND_CLOUD_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/"])
      && (
        DEVOPS_AND_CLOUD_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isHealthAndFitnessSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === HEALTH_AND_FITNESS_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/"])
      && (
        HEALTH_AND_FITNESS_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isImageVideoSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === IMAGE_VIDEO_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/", "github.com/clawdbot/skills/", "clawhub.ai/"])
      && (
        IMAGE_VIDEO_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isMediaStreamingSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === MEDIA_STREAMING_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/"])
      && (
        MEDIA_STREAMING_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isMoltbookSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === MOLTBOOK_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/"])
      && (
        MOLTBOOK_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isPdfDocumentsSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === PDF_DOCUMENTS_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/"])
      && (
        PDF_DOCUMENTS_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isPersonalDevelopmentSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === PERSONAL_DEVELOPMENT_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/"])
      && (
        PERSONAL_DEVELOPMENT_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isIosMacosDevelopmentSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === IOS_MACOS_DEVELOPMENT_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/"])
      && (
        IOS_MACOS_DEVELOPMENT_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isMarketingSalesSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === MARKETING_SALES_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/", "clawhub.ai/"])
      && (
        MARKETING_SALES_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isNotesPkmSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === NOTES_PKM_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/", "clawhub.ai/"])
      && (
        NOTES_PKM_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isProductivityTasksSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === PRODUCTIVITY_TASKS_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/"])
      && (
        PRODUCTIVITY_TASKS_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isSecurityPasswordsSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === SECURITY_PASSWORDS_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "clawhub.ai/"])
      && (
        SECURITY_PASSWORDS_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isShoppingEcommerceSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === SHOPPING_ECOMMERCE_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/"])
      && (
        SHOPPING_ECOMMERCE_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isSmartHomeIotSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === SMART_HOME_IOT_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/"])
      && (
        SMART_HOME_IOT_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isWebFrontendDevelopmentSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === WEB_FRONTEND_DEVELOPMENT_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/", "clawhub.ai/"])
      && (
        WEB_FRONTEND_DEVELOPMENT_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isSearchResearchSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === SEARCH_RESEARCH_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/"])
      && (
        SEARCH_RESEARCH_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isSelfHostedAutomationSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === SELF_HOSTED_AUTOMATION_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/"])
      && (
        SELF_HOSTED_AUTOMATION_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isSpeechTranscriptionSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === SPEECH_TRANSCRIPTION_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/"])
      && (
        SPEECH_TRANSCRIPTION_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isTransportationSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === TRANSPORTATION_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "clawhub.ai/"])
      && (
        TRANSPORTATION_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isGamingSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === GAMING_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/"])
      && (
        GAMING_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function isGitGithubSkill(skill: CuratableMarketplaceSkill) {
  return skill.categorySlug === GIT_GITHUB_CATEGORY_SLUG
    || includesAny(skill.sourceUrl, ["clawskills.sh/skills/", "github.com/openclaw/skills/"])
      && (
        GIT_GITHUB_KEEP_CURATIONS[sourceSlug(skill)] !== undefined
      );
}

function curationForSkill(skill: CuratableMarketplaceSkill) {
  const slug = sourceSlug(skill);
  if (isWebFrontendDevelopmentSkill(skill) && WEB_FRONTEND_DEVELOPMENT_KEEP_CURATIONS[slug]) {
    return WEB_FRONTEND_DEVELOPMENT_KEEP_CURATIONS[slug];
  }
  return APPLE_APPS_KEEP_CURATIONS[slug]
    ?? AI_LLMS_KEEP_CURATIONS[slug]
    ?? BROWSER_AUTOMATION_KEEP_CURATIONS[slug]
    ?? CALENDAR_SCHEDULING_KEEP_CURATIONS[slug]
    ?? CLAWDBOT_TOOLS_KEEP_CURATIONS[slug]
    ?? CLI_UTILITIES_KEEP_CURATIONS[slug]
    ?? CODING_AGENTS_IDES_KEEP_CURATIONS[slug]
    ?? COMMUNICATION_KEEP_CURATIONS[slug]
    ?? DATA_ANALYTICS_KEEP_CURATIONS[slug]
    ?? DEVOPS_AND_CLOUD_KEEP_CURATIONS[slug]
    ?? GAMING_KEEP_CURATIONS[slug]
    ?? GIT_GITHUB_KEEP_CURATIONS[slug]
    ?? HEALTH_AND_FITNESS_KEEP_CURATIONS[slug]
    ?? IMAGE_VIDEO_KEEP_CURATIONS[slug]
    ?? IOS_MACOS_DEVELOPMENT_KEEP_CURATIONS[slug]
    ?? MARKETING_SALES_KEEP_CURATIONS[slug]
    ?? MEDIA_STREAMING_KEEP_CURATIONS[slug]
    ?? MOLTBOOK_KEEP_CURATIONS[slug]
    ?? NOTES_PKM_KEEP_CURATIONS[slug]
    ?? PDF_DOCUMENTS_KEEP_CURATIONS[slug]
    ?? PERSONAL_DEVELOPMENT_KEEP_CURATIONS[slug]
    ?? PRODUCTIVITY_TASKS_KEEP_CURATIONS[slug]
    ?? SECURITY_PASSWORDS_KEEP_CURATIONS[slug]
    ?? SHOPPING_ECOMMERCE_KEEP_CURATIONS[slug]
    ?? SMART_HOME_IOT_KEEP_CURATIONS[slug]
    ?? WEB_FRONTEND_DEVELOPMENT_KEEP_CURATIONS[slug]
    ?? SEARCH_RESEARCH_KEEP_CURATIONS[slug]
    ?? SELF_HOSTED_AUTOMATION_KEEP_CURATIONS[slug]
    ?? SPEECH_TRANSCRIPTION_KEEP_CURATIONS[slug]
    ?? TRANSPORTATION_KEEP_CURATIONS[slug]
    ?? null;
}

export function marketplaceSkillCurationPolicy(skill: CuratableMarketplaceSkill): "keep" | "reject" | "uncurated" {
  const slug = sourceSlug(skill);
  if (isAppleAppsSkill(skill)) {
    if (APPLE_APPS_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isAiLlmsSkill(skill)) {
    if (AI_LLMS_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isBrowserAutomationSkill(skill)) {
    if (BROWSER_AUTOMATION_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isCalendarSchedulingSkill(skill)) {
    if (CALENDAR_SCHEDULING_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isClawdbotToolsSkill(skill)) {
    if (CLAWDBOT_TOOLS_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isCliUtilitiesSkill(skill)) {
    if (CLI_UTILITIES_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isCodingAgentsIdesSkill(skill)) {
    if (CODING_AGENTS_IDES_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isCommunicationSkill(skill)) {
    if (COMMUNICATION_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isDataAnalyticsSkill(skill)) {
    if (DATA_ANALYTICS_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isDevopsAndCloudSkill(skill)) {
    if (DEVOPS_AND_CLOUD_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isHealthAndFitnessSkill(skill)) {
    if (HEALTH_AND_FITNESS_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isImageVideoSkill(skill)) {
    if (IMAGE_VIDEO_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isMediaStreamingSkill(skill)) {
    if (MEDIA_STREAMING_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isMoltbookSkill(skill)) {
    if (MOLTBOOK_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isPdfDocumentsSkill(skill)) {
    if (PDF_DOCUMENTS_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isPersonalDevelopmentSkill(skill)) {
    if (PERSONAL_DEVELOPMENT_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isIosMacosDevelopmentSkill(skill)) {
    if (IOS_MACOS_DEVELOPMENT_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isMarketingSalesSkill(skill)) {
    if (MARKETING_SALES_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isNotesPkmSkill(skill)) {
    if (NOTES_PKM_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isProductivityTasksSkill(skill)) {
    if (PRODUCTIVITY_TASKS_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isSecurityPasswordsSkill(skill)) {
    if (SECURITY_PASSWORDS_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isShoppingEcommerceSkill(skill)) {
    if (SHOPPING_ECOMMERCE_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isSmartHomeIotSkill(skill)) {
    if (SMART_HOME_IOT_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isWebFrontendDevelopmentSkill(skill)) {
    if (WEB_FRONTEND_DEVELOPMENT_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isSearchResearchSkill(skill)) {
    if (SEARCH_RESEARCH_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isSelfHostedAutomationSkill(skill)) {
    if (SELF_HOSTED_AUTOMATION_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isSpeechTranscriptionSkill(skill)) {
    if (SPEECH_TRANSCRIPTION_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isTransportationSkill(skill)) {
    if (TRANSPORTATION_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isGamingSkill(skill)) {
    if (GAMING_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  if (isGitGithubSkill(skill)) {
    if (GIT_GITHUB_KEEP_CURATIONS[slug]) return "keep";
    return "reject";
  }
  return "uncurated";
}

function genericMarkdown(skill: CuratableMarketplaceSkill, curation: SkillCuration) {
  const tags = curation.tags ?? [];
  const setupTags = tags.filter((tag) =>
    tag === "external-account"
    || tag === "financial-action"
    || tag === "host-mutation"
    || tag === "local-only-macos"
    || tag === "requires-human-confirmation"
    || tag === "sensitive-personal-data"
    || tag === "child-data"
    || tag === "not-medical-advice"
    || tag === "regulated-workflow"
    || tag === "outbound-contact"
    || tag === "draft-only"
    || tag === "confirmation-gate"
    || tag === "company-scoped"
    || tag === "memory-safety"
    || tag === "not-financial-advice"
    || tag === "physical-device-control"
    || tag === "local-network-access"
    || tag === "thermal-or-heating-risk"
    || tag === "camera-privacy"
    || tag === "access-control-or-presence"
    || tag === "radio-transmission-control"
    || tag === "human-approval"
    || tag === "authorized-testing-only"
    || tag === "prompt-injection-defense"
    || tag === "untrusted-content"
    || tag === "secret-handling"
  );
  const bestFit = (() => {
    if (tags.includes("meetings")) return "Meeting, assistant, CEO, operations, and knowledge-base agents.";
    if (tags.includes("email") || tags.includes("inbox") || tags.includes("agent-inbox")) return "CEO assistant, support, sales, operations, and approved email-handling agents.";
    if (tags.includes("messaging") || tags.includes("team-chat")) return "CEO, COO, support, operations, and agent-coordination teams that need auditable messaging.";
    if (
      tags.includes("speech-and-transcription")
      || tags.includes("speech-to-text")
      || tags.includes("text-to-speech")
      || tags.includes("transcription")
      || tags.includes("voice-generation")
      || tags.includes("audio-generation")
      || tags.includes("translation")
    ) return "Meeting, support, accessibility, multilingual, and knowledge-base agents.";
    if (tags.includes("alerts")) return "CEO, CTO, operations, platform, and agent-operations agents that need status notifications.";
    if (tags.includes("calendar") || tags.includes("scheduling") || tags.includes("timezone")) return "CEO assistant, COO, operations, meeting coordinator, project-management, and approved scheduling agents.";
    if (
      tags.includes("transportation")
      || tags.includes("transit")
      || tags.includes("public-transit")
      || tags.includes("route-planning")
      || tags.includes("journey-planning")
      || tags.includes("flights")
      || tags.includes("flight-status")
      || tags.includes("travel-planning")
      || tags.includes("ev-charging")
      || tags.includes("fleet")
      || tags.includes("logistics")
    ) return "CEO assistant, operations, travel, logistics, field-ops, and Research Lab agents handling travel coordination.";
    if (tags.includes("game-development") || tags.includes("assets")) return "Research Lab, CTO, product, design, and game-development agents working in isolated project workspaces.";
    if (
      tags.includes("web-frontend")
      || tags.includes("frontend")
      || tags.includes("react")
      || tags.includes("tailwind")
      || tags.includes("ui-design")
      || tags.includes("accessibility")
      || tags.includes("a11y")
      || tags.includes("playwright")
      || tags.includes("web-qa")
      || tags.includes("browser-devtools")
      || tags.includes("website-monitoring")
      || tags.includes("technical-seo")
      || tags.includes("core-web-vitals")
      || tags.includes("website-audit")
      || tags.includes("hosting")
      || tags.includes("static-site")
    ) return "CTO, frontend engineering, QA, design, growth, platform, and approved web release agents.";
    if (tags.includes("dashboard")) return "COO, operations, platform, and support agents that manage reviewed status dashboards.";
    if (
      tags.includes("clawdbot-tools")
      || tags.includes("moltbook")
      || tags.includes("agent-coordination")
      || tags.includes("agent-communication")
      || tags.includes("mcp")
      || tags.includes("skill-management")
      || tags.includes("agent-monitoring")
    ) return "CEO, CTO, agent-ops, platform, security, and Research Lab agents managing company agent operations.";
    if (
      tags.includes("search-and-research")
      || tags.includes("web-search")
      || tags.includes("deep-research")
      || tags.includes("academic-research")
      || tags.includes("public-data")
      || tags.includes("market-research")
      || tags.includes("competitive-intel")
      || tags.includes("social-listening")
      || tags.includes("semantic-search")
      || tags.includes("reference")
    ) return "CEO, CMO, analyst, Research Lab, knowledge-base, strategy, and board-reporting agents.";
    if (
      tags.includes("self-hosted")
      || tags.includes("backup")
      || tags.includes("workspace-sync")
      || tags.includes("developer-ops")
      || tags.includes("notifications")
      || tags.includes("code-quality")
      || tags.includes("workflow-design")
    ) return "CTO, COO, platform, SRE, operations, documentation, and approved workflow automation agents.";
    if (
      tags.includes("smart-home")
      || tags.includes("iot")
      || tags.includes("home-assistant")
      || tags.includes("homebridge")
      || tags.includes("homey")
      || tags.includes("hub")
      || tags.includes("physical-device-control")
      || tags.includes("local-network-access")
      || tags.includes("thermal-or-heating-risk")
      || tags.includes("camera-privacy")
      || tags.includes("access-control-or-presence")
      || tags.includes("telemetry")
      || tags.includes("sensors")
      || tags.includes("facilities")
      || tags.includes("cameras")
      || tags.includes("nvr")
      || tags.includes("3d-printing")
      || tags.includes("appliances")
      || tags.includes("weather")
      || tags.includes("field-ops")
    ) return "COO, facilities, lab, field-ops, security, platform, and approved physical-device operations agents.";
    if (
      tags.includes("personal-development")
      || tags.includes("agent-development")
      || tags.includes("agent-evaluation")
      || tags.includes("agent-training")
      || tags.includes("reflection")
      || tags.includes("case-studies")
    ) return "CEO, CTO, Research Lab, marketplace-review, training, and long-running agent-operations teams.";
    if (
      tags.includes("password-manager")
      || tags.includes("secrets")
      || tags.includes("vault")
      || tags.includes("otp")
      || tags.includes("auth")
      || tags.includes("authorization")
      || tags.includes("oauth")
      || tags.includes("jwt")
      || tags.includes("sessions")
      || tags.includes("rbac")
      || tags.includes("tls")
      || tags.includes("certificates")
      || tags.includes("domain-trust")
      || tags.includes("phishing")
      || tags.includes("malware")
      || tags.includes("vulnerability-scanning")
      || tags.includes("provenance")
      || tags.includes("integrity")
      || tags.includes("install-safety")
      || tags.includes("content-safety")
      || tags.includes("age-verification")
      || tags.includes("moderation")
      || tags.includes("hashing")
      || tags.includes("encryption")
      || tags.includes("keys")
      || tags.includes("file-sharing")
      || tags.includes("incident-reporting")
      || tags.includes("confirmation-gate")
      || tags.includes("policy-gateway")
      || tags.includes("threat-model")
      || tags.includes("page-audit")
      || tags.includes("behavior-audit")
    ) return "Security, CTO, platform, marketplace-review, compliance, and trusted credential-handling agents.";
    if (
      tags.includes("tasks")
      || tags.includes("todo")
      || tags.includes("project-management")
      || tags.includes("planning")
      || tags.includes("okrs")
      || tags.includes("goals")
      || tags.includes("board-visible")
      || tags.includes("acceptance-criteria")
      || tags.includes("workflow")
      || tags.includes("state-persistence")
      || tags.includes("context-recovery")
      || tags.includes("time-tracking")
      || tags.includes("human-delegation")
      || tags.includes("human-assistants")
      || tags.includes("human-in-the-loop")
      || tags.includes("task-tracking")
      || tags.includes("task-extraction")
      || tags.includes("invoicing")
      || tags.includes("finance-ops")
      || tags.includes("surveys")
      || tags.includes("hr")
      || tags.includes("recruiting")
      || tags.includes("automation")
      || tags.includes("n8n")
      || tags.includes("token-management")
    ) return "CEO, COO, operations, project-management, finance-ops, HR, and approved workflow automation agents.";
    if (
      tags.includes("ecommerce")
      || tags.includes("commerce")
      || tags.includes("store-ops")
      || tags.includes("marketplace")
      || tags.includes("marketplace-search")
      || tags.includes("product-research")
      || tags.includes("product-data")
      || tags.includes("competitor-analysis")
      || tags.includes("shipping")
      || tags.includes("fulfillment")
      || tags.includes("orders")
      || tags.includes("payments")
      || tags.includes("memberships")
      || tags.includes("reviews")
      || tags.includes("product-visuals")
      || tags.includes("referrals")
    ) return "COO, CMO, commerce, support, fulfillment, product, growth, and approved revenue-operations agents.";
    if (
      tags.includes("marketing")
      || tags.includes("sales")
      || tags.includes("crm")
      || tags.includes("lead-generation")
      || tags.includes("prospecting")
      || tags.includes("outbound-contact")
      || tags.includes("email-marketing")
      || tags.includes("ads")
      || tags.includes("gtm")
      || tags.includes("pmm")
      || tags.includes("ai-seo")
      || tags.includes("brand-monitoring")
      || tags.includes("social-media")
      || tags.includes("copywriting")
    ) return "CMO, growth, sales, content, RevOps, product marketing, and approved outbound/revenue agents.";
    if (
      tags.includes("ios")
      || tags.includes("macos")
      || tags.includes("swift")
      || tags.includes("swiftui")
      || tags.includes("xcode")
      || tags.includes("ios-simulator")
      || tags.includes("apple-docs")
      || tags.includes("sf-symbols")
      || tags.includes("mobile-qa")
    ) return "CTO, iOS/macOS engineering, QA, release, product, and approved Apple-platform development agents.";
    if (tags.includes("pull-requests") || tags.includes("code-review")) return "CTO, engineering, security, QA, and approved PR review agents.";
    if (tags.includes("ci") || tags.includes("release")) return "CTO, release, QA, platform, and approved engineering automation agents.";
    if (tags.includes("git") || tags.includes("github") || tags.includes("repos")) return "CTO, engineering, Research Lab, documentation, and approved repository-management agents.";
    if (
      tags.includes("devops")
      || tags.includes("cloud")
      || tags.includes("infrastructure")
      || tags.includes("deployment")
      || tags.includes("incidents")
      || tags.includes("ssh")
      || tags.includes("terraform")
      || tags.includes("kubernetes")
      || tags.includes("docker")
      || tags.includes("secrets")
      || tags.includes("server-health")
    ) return "Platform, CTO, SRE, DevOps, incident-response, and approved infrastructure agents.";
    if (
      tags.includes("health-data")
      || tags.includes("wearables")
      || tags.includes("fitness")
      || tags.includes("wellness")
      || tags.includes("sleep")
      || tags.includes("recovery")
      || tags.includes("workouts")
      || tags.includes("heart-rate")
      || tags.includes("biomarkers")
      || tags.includes("healthspan")
      || tags.includes("medical-device")
      || tags.includes("baby-care")
      || tags.includes("pharmacy")
      || tags.includes("nutrition")
      || tags.includes("training")
    ) return "CEO, personal chief-of-staff, wellness, Research Lab, and approved health-data analysis agents.";
    if (
      tags.includes("pdf-documents")
      || tags.includes("docx")
      || tags.includes("markdown")
      || tags.includes("data-conversion")
      || tags.includes("internal-comms")
    ) return "CEO, COO, operations, documentation, knowledge-base, Research Lab, and approved document-processing agents.";
    if (
      tags.includes("image-video")
      || tags.includes("image-generation")
      || tags.includes("video-generation")
      || tags.includes("video-editing")
      || tags.includes("creative-assets")
      || tags.includes("design")
      || tags.includes("figma")
      || tags.includes("ocr")
      || tags.includes("diagrams")
      || tags.includes("visualization")
      || tags.includes("cad")
      || tags.includes("stock-photos")
      || tags.includes("subtitles")
      || tags.includes("qr-codes")
    ) return "CMO, design, content, product, Research Lab, and approved media-production agents.";
    if (
      tags.includes("media-streaming")
      || tags.includes("content-repurposing")
      || tags.includes("content-planning")
      || tags.includes("podcasts")
      || tags.includes("youtube")
      || tags.includes("media-processing")
      || tags.includes("business-reporting")
      || tags.includes("competitor-research")
    ) return "CMO, content, marketing, support, Research Lab, operations, and approved media workflow agents.";
    if (
      tags.includes("notes")
      || tags.includes("pkm")
      || tags.includes("knowledge-intake")
      || tags.includes("knowledge-base")
      || tags.includes("knowledge-graph")
      || tags.includes("memory")
      || tags.includes("memory-safety")
      || tags.includes("state-persistence")
      || tags.includes("context-recovery")
      || tags.includes("action-items")
      || tags.includes("voice-notes")
      || tags.includes("flashcards")
      || tags.includes("read-later")
      || tags.includes("wiki")
      || tags.includes("apple-notes")
      || tags.includes("bear")
      || tags.includes("notion")
      || tags.includes("bookstack")
      || tags.includes("craft")
      || tags.includes("flomo")
      || tags.includes("upnote")
      || tags.includes("fabric")
      || tags.includes("cubox")
      || tags.includes("anki")
    ) return "CEO, research, analyst, documentation, meeting, and long-running company-memory agents.";
    if (
      tags.includes("analytics")
      || tags.includes("database")
      || tags.includes("data-processing")
      || tags.includes("data-engineering")
      || tags.includes("data-science")
      || tags.includes("data-governance")
      || tags.includes("data-enrichment")
      || tags.includes("spreadsheets")
      || tags.includes("reporting")
      || tags.includes("public-data")
      || tags.includes("sql")
      || tags.includes("telemetry")
      || tags.includes("dashboards")
    ) return "Data analyst, COO, CEO, Research Lab, operations, and approved reporting agents.";
    if (tags.includes("security")) return "Security, CTO, Research Lab, and marketplace-review agents.";
    if (tags.includes("browser-automation") || tags.includes("qa")) return "QA, CTO, Research Lab, support, and operations agents that need controlled browser or testing access.";
    if (tags.includes("saaS-ops") || tags.includes("project-management")) return "COO, operations, support, sales, project-management, and approved admin agents.";
    if (tags.includes("model-routing") || tags.includes("cost-control")) return "CEO, CTO, platform, and agent-operations agents.";
    if (tags.includes("memory") || tags.includes("knowledge-base")) return "CEO, research, analyst, and long-running company agents.";
    if (tags.includes("marketing") || tags.includes("brand")) return "CMO, content, growth, and brand strategy agents.";
    if (tags.includes("ecommerce") || tags.includes("orders")) return "Operations, support, logistics, and commerce agents.";
    if (tags.includes("research-lab")) return "Research Lab, CTO, strategy, and specialist build agents.";
    return "Assign to the smallest set of agents whose role genuinely needs this capability.";
  })();
  return [
    `# ${curation.name ?? skill.name}`,
    "",
    curation.description ?? skill.description ?? "Curated PaperClaw marketplace skill.",
    "",
    "## PaperClaw fit",
    "",
    "This skill is curated for PaperClaw agents because it supports a concrete company workflow rather than a one-off personal automation.",
    "",
    "## Recommended assignment",
    "",
    bestFit,
    "",
    "Install it into the company library first, then assign it only to approved agents. CEO-wide assignment should use board approval when the skill can spend money, call external APIs, touch personal data, or mutate production systems.",
    "",
    "## Setup and safety notes",
    "",
    ...(setupTags.length > 0
      ? setupTags.map((tag) => `- ${titleFromSlug(tag)}.`)
      : ["- Review the upstream skill instructions before installing."]),
    "- Keep credentials in PaperClaw secrets when the skill requires an external account.",
    "- Use board approval for actions that mutate external systems, spend money, expose personal data, or speak/print sensitive content.",
    "- Keep generated outputs traceable to the source task, meeting, issue, or Research Lab run that requested them.",
    "",
    skill.sourceUrl ? `Source: ${skill.sourceUrl}` : "",
  ].filter(Boolean).join("\n");
}

export function curateMarketplaceSkill<T extends CuratableMarketplaceSkill>(skill: T): T {
  const curation = curationForSkill(skill);
  if (!curation) return skill;
  return {
    ...skill,
    slug: curation.slug ?? skill.slug,
    name: curation.name ?? skill.name,
    description: curation.description ?? skill.description,
    tags: Array.from(new Set([...(curation.tags ?? []), ...(skill.tags ?? [])])),
    trustLevel: "unknown",
    markdown: curation.markdown ?? genericMarkdown(skill, curation),
    installNotes: curation.installNotes ?? [
      "This PaperClaw-curated entry keeps the original source URL for traceability.",
      "Review setup requirements and safety notes before assigning it to agents.",
      CATALOG_FALLBACK_NOTE,
    ].join("\n"),
  };
}

export function isMarketplaceSkillVisible(skill: CuratableMarketplaceSkill) {
  const policy = marketplaceSkillCurationPolicy(skill);
  return policy === "keep";
}

export function curateVisibleMarketplaceSkill<T extends CuratableMarketplaceSkill>(skill: T): T | null {
  const curated = curateMarketplaceSkill(skill);
  return isMarketplaceSkillVisible(curated) ? curated : null;
}

export function curateMarketplaceSkills<T extends CuratableMarketplaceSkill>(skills: T[]): T[] {
  return skills
    .map((skill) => curateVisibleMarketplaceSkill(skill))
    .filter((skill): skill is T => Boolean(skill));
}

export function marketplaceSkillMatchesQuery(skill: CuratableMarketplaceSkill, query: {
  q?: string | null;
  category?: string | null;
}) {
  const category = query.category?.trim();
  if (category && skill.categorySlug !== category) return false;
  const q = query.q?.trim().toLowerCase();
  if (!q) return true;
  return [
    skill.name,
    skill.description,
    skill.categoryName,
    skill.slug,
    skill.sourceUrl,
    skill.installSource,
    skill.markdown,
    skill.installNotes,
    ...(skill.tags ?? []),
  ].some((value) => value?.toLowerCase().includes(q));
}
