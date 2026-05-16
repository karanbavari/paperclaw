import { ChangeEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  COMPANY_AGENT_RUN_LIMIT_OPTIONS,
  COMPANY_PROFILE_CURRENCY_OPTIONS,
  COMPANY_PROFILE_LANGUAGE_OPTIONS,
  COMPANY_PROFILE_TIMEZONE_OPTIONS,
  DEFAULT_COMPANY_ATTACHMENT_MAX_BYTES,
  MAX_COMPANY_ATTACHMENT_MAX_BYTES,
} from "@kesarcloud/shared";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { companiesApi } from "../api/companies";
import { companyMemoryApi } from "../api/companyMemory";
import { accessApi } from "../api/access";
import { assetsApi } from "../api/assets";
import { queryKeys } from "../lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Settings, Check, Download, Upload } from "lucide-react";
import { CompanyPatternIcon } from "../components/CompanyPatternIcon";
import {
  Field,
  ToggleField,
  HintIcon,
} from "../components/agent-config-primitives";

type AgentSnippetInput = {
  onboardingTextUrl: string;
  connectionCandidates?: string[] | null;
  testResolutionUrl?: string | null;
};

const BYTES_PER_MIB = 1024 * 1024;
const DEFAULT_COMPANY_ATTACHMENT_MAX_MIB = DEFAULT_COMPANY_ATTACHMENT_MAX_BYTES / BYTES_PER_MIB;
const MAX_COMPANY_ATTACHMENT_MAX_MIB = MAX_COMPANY_ATTACHMENT_MAX_BYTES / BYTES_PER_MIB;
const CUSTOM_CONTEXT_OPTION = "__custom__";
const UNLIMITED_RUN_LIMIT_VALUE = "unlimited";

const COMPANY_CATEGORY_OPTIONS = [
  {
    value: "technology",
    label: "Technology",
    subcategories: ["SaaS", "AI/ML", "Developer tools", "Cloud infrastructure", "Cybersecurity"],
  },
  {
    value: "commerce",
    label: "Commerce",
    subcategories: ["E-commerce", "Retail", "Marketplace", "D2C brand", "Wholesale"],
  },
  {
    value: "services",
    label: "Professional services",
    subcategories: ["Agency", "Consulting", "Legal", "Finance", "Operations"],
  },
  {
    value: "education",
    label: "Education",
    subcategories: ["EdTech", "Coaching", "Training", "Research", "Content"],
  },
  {
    value: "health",
    label: "Health",
    subcategories: ["Healthcare", "Wellness", "Fitness", "Diagnostics", "Care operations"],
  },
  {
    value: "pats-shop",
    label: "Pats Shop",
    subcategories: ["Online Store", "Boutique", "Handmade", "Print on Demand", "Digital Products"],
  },
] as const;

function getLocalTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function normalizeTimezone(value: string | null | undefined) {
  if (value && COMPANY_PROFILE_TIMEZONE_OPTIONS.includes(value as any)) return value;
  const local = getLocalTimezone();
  return COMPANY_PROFILE_TIMEZONE_OPTIONS.includes(local as any) ? local : "UTC";
}

function findCategoryOptionByLabel(label: string) {
  return COMPANY_CATEGORY_OPTIONS.find((option) => option.label === label) ?? null;
}

export function CompanySettings() {
  const {
    companies,
    selectedCompany,
    selectedCompanyId,
    setSelectedCompanyId
  } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const queryClient = useQueryClient();
  // General settings local state
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [brandColor, setBrandColor] = useState("");
  const [attachmentMaxMiB, setAttachmentMaxMiB] = useState(String(DEFAULT_COMPANY_ATTACHMENT_MAX_MIB));
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [timezone, setTimezone] = useState(() => normalizeTimezone(null));
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessSubcategory, setBusinessSubcategory] = useState("");
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [customSubcategoryMode, setCustomSubcategoryMode] = useState(false);
  const [maxConcurrentAgentRuns, setMaxConcurrentAgentRuns] = useState("10");

  const profileQuery = useQuery({
    queryKey: selectedCompanyId
      ? queryKeys.companyMemory.profile(selectedCompanyId)
      : ["company-memory", "__disabled__", "profile"],
    queryFn: () => companyMemoryApi.getProfile(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  // Sync local state from selected company
  useEffect(() => {
    if (!selectedCompany) return;
    setCompanyName(selectedCompany.name);
    setDescription(selectedCompany.description ?? "");
    setBrandColor(selectedCompany.brandColor ?? "");
    setAttachmentMaxMiB(String(Math.round((selectedCompany.attachmentMaxBytes ?? DEFAULT_COMPANY_ATTACHMENT_MAX_BYTES) / BYTES_PER_MIB)));
    setLogoUrl(selectedCompany.logoUrl ?? "");
  }, [selectedCompany]);

  useEffect(() => {
    setDefaultLanguage(profileQuery.data?.defaultLanguage ?? "en");
    setDefaultCurrency(profileQuery.data?.defaultCurrency ?? "USD");
    setTimezone(normalizeTimezone(profileQuery.data?.timezone));
    const nextCategory = profileQuery.data?.businessCategory ?? "";
    const nextSubcategory = profileQuery.data?.businessSubcategory ?? "";
    const knownCategory = findCategoryOptionByLabel(nextCategory);
    setBusinessCategory(nextCategory);
    setBusinessSubcategory(nextSubcategory);
    setCustomCategoryMode(Boolean(nextCategory && !knownCategory));
    setCustomSubcategoryMode(Boolean(
      nextSubcategory &&
      (!knownCategory || !(knownCategory.subcategories as readonly string[]).includes(nextSubcategory)),
    ));
  }, [profileQuery.data]);

  useEffect(() => {
    if (!selectedCompany) return;
    setMaxConcurrentAgentRuns(
      selectedCompany.maxConcurrentAgentRuns === null
        ? UNLIMITED_RUN_LIMIT_VALUE
        : String(selectedCompany.maxConcurrentAgentRuns ?? 10),
    );
  }, [selectedCompany]);

  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSnippet, setInviteSnippet] = useState<string | null>(null);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [snippetCopyDelightId, setSnippetCopyDelightId] = useState(0);

  const attachmentMaxBytes = Number.parseInt(attachmentMaxMiB, 10) * BYTES_PER_MIB;
  const attachmentMaxValid =
    Number.isInteger(attachmentMaxBytes)
    && attachmentMaxBytes >= BYTES_PER_MIB
    && attachmentMaxBytes <= MAX_COMPANY_ATTACHMENT_MAX_BYTES;

  const generalDirty =
    !!selectedCompany &&
    (companyName !== selectedCompany.name ||
      description !== (selectedCompany.description ?? "") ||
      brandColor !== (selectedCompany.brandColor ?? "") ||
      attachmentMaxBytes !== (selectedCompany.attachmentMaxBytes ?? DEFAULT_COMPANY_ATTACHMENT_MAX_BYTES));

  const localizationDirty =
    defaultLanguage !== (profileQuery.data?.defaultLanguage ?? "en") ||
    defaultCurrency !== (profileQuery.data?.defaultCurrency ?? "USD") ||
    timezone !== normalizeTimezone(profileQuery.data?.timezone);

  const businessContextDirty =
    businessCategory !== (profileQuery.data?.businessCategory ?? "") ||
    businessSubcategory !== (profileQuery.data?.businessSubcategory ?? "");

  const runLimitDirty =
    !!selectedCompany &&
    maxConcurrentAgentRuns !== (
      selectedCompany.maxConcurrentAgentRuns === null
        ? UNLIMITED_RUN_LIMIT_VALUE
        : String(selectedCompany.maxConcurrentAgentRuns ?? 10)
    );

  const selectedCategoryOption = customCategoryMode ? null : findCategoryOptionByLabel(businessCategory);
  const categorySelectValue = customCategoryMode ? CUSTOM_CONTEXT_OPTION : selectedCategoryOption?.value ?? "";
  const subcategorySelectValue = customSubcategoryMode
    ? CUSTOM_CONTEXT_OPTION
    : (selectedCategoryOption?.subcategories as readonly string[] | undefined)?.includes(businessSubcategory)
    ? businessSubcategory
      : "";

  const generalMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description: string | null;
      brandColor: string | null;
      attachmentMaxBytes: number;
    }) => companiesApi.update(selectedCompanyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    }
  });

  const settingsMutation = useMutation({
    mutationFn: (requireApproval: boolean) =>
      companiesApi.update(selectedCompanyId!, {
        requireBoardApprovalForNewAgents: requireApproval
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    }
  });

  const ceoSkillInstallApprovalMutation = useMutation({
    mutationFn: (requireApproval: boolean) =>
      companiesApi.update(selectedCompanyId!, {
        requireBoardApprovalForCeoSkillInstalls: requireApproval,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });

  const localizationMutation = useMutation({
    mutationFn: () =>
      companyMemoryApi.updateProfile(selectedCompanyId!, {
        defaultLanguage: defaultLanguage as any,
        defaultCurrency: defaultCurrency as any,
        timezone: timezone as any,
      }),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.companyMemory.profile(selectedCompanyId!), profile);
      queryClient.invalidateQueries({ queryKey: queryKeys.companyMemory.profile(selectedCompanyId!) });
    },
  });

  const businessContextMutation = useMutation({
    mutationFn: () =>
      companyMemoryApi.updateProfile(selectedCompanyId!, {
        businessCategory: businessCategory.trim() || null,
        businessSubcategory: businessSubcategory.trim() || null,
      }),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.companyMemory.profile(selectedCompanyId!), profile);
      queryClient.invalidateQueries({ queryKey: queryKeys.companyMemory.profile(selectedCompanyId!) });
    },
  });

  const runLimitMutation = useMutation({
    mutationFn: () =>
      companiesApi.update(selectedCompanyId!, {
        maxConcurrentAgentRuns:
          maxConcurrentAgentRuns === UNLIMITED_RUN_LIMIT_VALUE
            ? null
            : Number(maxConcurrentAgentRuns),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      accessApi.createOpenClawInvitePrompt(selectedCompanyId!),
    onSuccess: async (invite) => {
      setInviteError(null);
      const base = window.location.origin.replace(/\/+$/, "");
      const onboardingTextLink =
        invite.onboardingTextUrl ??
        invite.onboardingTextPath ??
        `/api/invites/${invite.token}/onboarding.txt`;
      const absoluteUrl = onboardingTextLink.startsWith("http")
        ? onboardingTextLink
        : `${base}${onboardingTextLink}`;
      setSnippetCopied(false);
      setSnippetCopyDelightId(0);
      let snippet: string;
      try {
        const manifest = await accessApi.getInviteOnboarding(invite.token);
        snippet = buildAgentSnippet({
          onboardingTextUrl: absoluteUrl,
          connectionCandidates:
            manifest.onboarding.connectivity?.connectionCandidates ?? null,
          testResolutionUrl:
            manifest.onboarding.connectivity?.testResolutionEndpoint?.url ??
            null
        });
      } catch {
        snippet = buildAgentSnippet({
          onboardingTextUrl: absoluteUrl,
          connectionCandidates: null,
          testResolutionUrl: null
        });
      }
      setInviteSnippet(snippet);
      try {
        await navigator.clipboard.writeText(snippet);
        setSnippetCopied(true);
        setSnippetCopyDelightId((prev) => prev + 1);
        setTimeout(() => setSnippetCopied(false), 2000);
      } catch {
        /* clipboard may not be available */
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.sidebarBadges(selectedCompanyId!)
      });
    },
    onError: (err) => {
      setInviteError(
        err instanceof Error ? err.message : "Failed to create invite"
      );
    }
  });

  const syncLogoState = (nextLogoUrl: string | null) => {
    setLogoUrl(nextLogoUrl ?? "");
    void queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
  };

  const logoUploadMutation = useMutation({
    mutationFn: (file: File) =>
      assetsApi
        .uploadCompanyLogo(selectedCompanyId!, file)
        .then((asset) => companiesApi.update(selectedCompanyId!, { logoAssetId: asset.assetId })),
    onSuccess: (company) => {
      syncLogoState(company.logoUrl);
      setLogoUploadError(null);
    }
  });

  const clearLogoMutation = useMutation({
    mutationFn: () => companiesApi.update(selectedCompanyId!, { logoAssetId: null }),
    onSuccess: (company) => {
      setLogoUploadError(null);
      syncLogoState(company.logoUrl);
    }
  });

  function handleLogoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.currentTarget.value = "";
    if (!file) return;
    setLogoUploadError(null);
    logoUploadMutation.mutate(file);
  }

  function handleClearLogo() {
    clearLogoMutation.mutate();
  }

  useEffect(() => {
    setInviteError(null);
    setInviteSnippet(null);
    setSnippetCopied(false);
    setSnippetCopyDelightId(0);
  }, [selectedCompanyId]);

  const archiveMutation = useMutation({
    mutationFn: ({
      companyId,
      nextCompanyId
    }: {
      companyId: string;
      nextCompanyId: string | null;
    }) => companiesApi.archive(companyId).then(() => ({ nextCompanyId })),
    onSuccess: async ({ nextCompanyId }) => {
      if (nextCompanyId) {
        setSelectedCompanyId(nextCompanyId);
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.companies.all
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.companies.stats
      });
    }
  });

  useEffect(() => {
    setBreadcrumbs([
      { label: selectedCompany?.name ?? "Company", href: "/dashboard" },
      { label: "Settings" }
    ]);
  }, [setBreadcrumbs, selectedCompany?.name]);

  if (!selectedCompany) {
    return (
      <div className="text-sm text-muted-foreground">
        No company selected. Select a company from the switcher above.
      </div>
    );
  }

  function handleSaveGeneral() {
    generalMutation.mutate({
      name: companyName.trim(),
      description: description.trim() || null,
      brandColor: brandColor || null,
      attachmentMaxBytes
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Company Settings</h1>
      </div>

      {/* General */}
      <div className="space-y-4">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          General
        </div>
        <div className="space-y-3 rounded-md border border-border px-4 py-4">
          <Field label="Company name" hint="The display name for your company.">
            <input
              className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-sm outline-none"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </Field>
          <Field
            label="Description"
            hint="Optional description shown in the company profile."
          >
            <input
              className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-sm outline-none"
              type="text"
              value={description}
              placeholder="Optional company description"
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* Appearance */}
      <div className="space-y-4">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Appearance
        </div>
        <div className="space-y-3 rounded-md border border-border px-4 py-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <CompanyPatternIcon
                companyName={companyName || selectedCompany.name}
                logoUrl={logoUrl || null}
                brandColor={brandColor || null}
                className="rounded-[14px]"
              />
            </div>
            <div className="flex-1 space-y-3">
              <Field
                label="Logo"
                hint="Upload a PNG, JPEG, WEBP, GIF, or SVG logo image."
              >
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    onChange={handleLogoFileChange}
                    className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-sm outline-none file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-2.5 file:py-1 file:text-xs"
                  />
                  {logoUrl && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleClearLogo}
                        disabled={clearLogoMutation.isPending}
                      >
                        {clearLogoMutation.isPending ? "Removing..." : "Remove logo"}
                      </Button>
                    </div>
                  )}
                  {(logoUploadMutation.isError || logoUploadError) && (
                    <span className="text-xs text-destructive">
                      {logoUploadError ??
                        (logoUploadMutation.error instanceof Error
                          ? logoUploadMutation.error.message
                          : "Logo upload failed")}
                    </span>
                  )}
                  {clearLogoMutation.isError && (
                    <span className="text-xs text-destructive">
                      {clearLogoMutation.error.message}
                    </span>
                  )}
                  {logoUploadMutation.isPending && (
                    <span className="text-xs text-muted-foreground">Uploading logo...</span>
                  )}
                </div>
              </Field>
              <Field
                label="Brand color"
                hint="Sets the hue for the company icon. Leave empty for auto-generated color."
              >
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandColor || "#6366f1"}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || /^#[0-9a-fA-F]{0,6}$/.test(v)) {
                        setBrandColor(v);
                      }
                    }}
                    placeholder="Auto"
                    className="w-28 rounded-md border border-border bg-transparent px-2.5 py-1.5 text-sm font-mono outline-none"
                  />
                  {brandColor && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setBrandColor("")}
                      className="text-xs text-muted-foreground"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </Field>
              <Field
                label="Attachment size limit"
                hint={`Accepted range: 1-${MAX_COMPANY_ATTACHMENT_MAX_MIB} MiB.`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={MAX_COMPANY_ATTACHMENT_MAX_MIB}
                      step={1}
                      value={attachmentMaxMiB}
                      onChange={(e) => setAttachmentMaxMiB(e.target.value)}
                      className="w-28 rounded-md border border-border bg-transparent px-2.5 py-1.5 text-sm outline-none"
                    />
                    <span className="text-xs text-muted-foreground">MiB</span>
                  </div>
                  {!attachmentMaxValid && (
                    <span className="text-xs text-destructive">
                      Enter a whole number from 1 to {MAX_COMPANY_ATTACHMENT_MAX_MIB}.
                    </span>
                  )}
                </div>
              </Field>
            </div>
          </div>
        </div>
      </div>

      {/* Save button for General + Appearance */}
      {generalDirty && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSaveGeneral}
            disabled={generalMutation.isPending || !companyName.trim() || !attachmentMaxValid}
          >
            {generalMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
          {generalMutation.isSuccess && (
            <span className="text-xs text-muted-foreground">Saved</span>
          )}
          {generalMutation.isError && (
            <span className="text-xs text-destructive">
              {generalMutation.error instanceof Error
                  ? generalMutation.error.message
                  : "Failed to save"}
            </span>
          )}
        </div>
      )}

      {/* Business context */}
      <div className="space-y-4">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Business context
        </div>
        <div className="space-y-3 rounded-md border border-border px-4 py-4">
          <Field
            label="Category"
            hint="CEO and other agents use this to understand the company domain."
          >
            <div className="space-y-2">
              <select
                value={categorySelectValue}
                onChange={(event) => {
                  const next = event.target.value;
                  if (!next) {
                    setCustomCategoryMode(false);
                    setCustomSubcategoryMode(false);
                    setBusinessCategory("");
                    setBusinessSubcategory("");
                    return;
                  }
                  if (next === CUSTOM_CONTEXT_OPTION) {
                    setCustomCategoryMode(true);
                    setCustomSubcategoryMode(false);
                    setBusinessCategory("");
                    setBusinessSubcategory("");
                    return;
                  }
                  const option = COMPANY_CATEGORY_OPTIONS.find((item) => item.value === next);
                  setCustomCategoryMode(false);
                  setCustomSubcategoryMode(false);
                  setBusinessCategory(option?.label ?? "");
                  setBusinessSubcategory("");
                }}
                className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none"
              >
                <option value="">Select category</option>
                {COMPANY_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                <option value={CUSTOM_CONTEXT_OPTION}>Custom</option>
              </select>
              {categorySelectValue === CUSTOM_CONTEXT_OPTION && (
                <input
                  type="text"
                  value={businessCategory}
                  onChange={(event) => setBusinessCategory(event.target.value)}
                  placeholder="Custom category"
                  className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-sm outline-none"
                />
              )}
            </div>
          </Field>
          <Field
            label="Subcategory"
            hint="Adds a more specific business focus for company-level agent context."
          >
            <div className="space-y-2">
              {selectedCategoryOption ? (
                <select
                  value={subcategorySelectValue}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (!next) {
                      setCustomSubcategoryMode(false);
                      setBusinessSubcategory("");
                      return;
                    }
                    if (next === CUSTOM_CONTEXT_OPTION) {
                      setCustomSubcategoryMode(true);
                      setBusinessSubcategory("");
                      return;
                    }
                    setCustomSubcategoryMode(false);
                    setBusinessSubcategory(next);
                  }}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none"
                >
                  <option value="">Select subcategory</option>
                  {selectedCategoryOption.subcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                  <option value={CUSTOM_CONTEXT_OPTION}>Custom</option>
                </select>
              ) : null}
              {(!selectedCategoryOption || subcategorySelectValue === CUSTOM_CONTEXT_OPTION) && (
                <input
                  type="text"
                  value={businessSubcategory}
                  onChange={(event) => setBusinessSubcategory(event.target.value)}
                  placeholder="Subcategory"
                  className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-sm outline-none"
                />
              )}
            </div>
          </Field>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => businessContextMutation.mutate()}
              disabled={!businessContextDirty || businessContextMutation.isPending || profileQuery.isLoading}
            >
              {businessContextMutation.isPending ? "Saving..." : "Save business context"}
            </Button>
            {businessContextMutation.isSuccess && (
              <span className="text-xs text-muted-foreground">Saved</span>
            )}
            {businessContextMutation.isError && (
              <span className="text-xs text-destructive">
                {businessContextMutation.error instanceof Error
                  ? businessContextMutation.error.message
                  : "Failed to save business context"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Localization */}
      <div className="space-y-4">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Localization
        </div>
        <div className="space-y-3 rounded-md border border-border px-4 py-4">
          <Field
            label="Language"
            hint="Agents use this as the default conversation and output language."
          >
            <select
              value={defaultLanguage}
              onChange={(event) => setDefaultLanguage(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none"
            >
              {COMPANY_PROFILE_LANGUAGE_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Currency"
            hint="Agents use this currency for financial estimates, reports, and business discussion."
          >
            <select
              value={defaultCurrency}
              onChange={(event) => setDefaultCurrency(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none"
            >
              {COMPANY_PROFILE_CURRENCY_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.code} - {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Timezone"
            hint="Agents use this timezone when scheduling, reporting, and interpreting dates."
          >
            <select
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none"
            >
              {COMPANY_PROFILE_TIMEZONE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => localizationMutation.mutate()}
              disabled={!localizationDirty || localizationMutation.isPending || profileQuery.isLoading}
            >
              {localizationMutation.isPending ? "Saving..." : "Save localization"}
            </Button>
            {localizationMutation.isSuccess && (
              <span className="text-xs text-muted-foreground">Saved</span>
            )}
            {localizationMutation.isError && (
              <span className="text-xs text-destructive">
                {localizationMutation.error instanceof Error
                  ? localizationMutation.error.message
                  : "Failed to save localization"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Resource limits */}
      <div className="space-y-4">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Resource limits
        </div>
        <div className="space-y-3 rounded-md border border-border px-4 py-4">
          <Field
            label="Concurrent agent sessions"
            hint="Limits how many agent runs can execute at the same time for this company."
          >
            <select
              value={maxConcurrentAgentRuns}
              onChange={(event) => setMaxConcurrentAgentRuns(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none"
            >
              {COMPANY_AGENT_RUN_LIMIT_OPTIONS.map((value) => (
                <option key={value} value={String(value)}>
                  {value}
                </option>
              ))}
              <option value={UNLIMITED_RUN_LIMIT_VALUE}>Unlimited</option>
            </select>
          </Field>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => runLimitMutation.mutate()}
              disabled={!runLimitDirty || runLimitMutation.isPending}
            >
              {runLimitMutation.isPending ? "Saving..." : "Save limit"}
            </Button>
            {runLimitMutation.isSuccess && (
              <span className="text-xs text-muted-foreground">Saved</span>
            )}
            {runLimitMutation.isError && (
              <span className="text-xs text-destructive">
                {runLimitMutation.error instanceof Error
                  ? runLimitMutation.error.message
                  : "Failed to save limit"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hiring */}
      <div className="space-y-4" data-testid="company-settings-team-section">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Hiring
        </div>
        <div className="rounded-md border border-border px-4 py-3">
          <ToggleField
            label="Require board approval for new hires"
            hint="New agent hires stay pending until approved by board."
            checked={!!selectedCompany.requireBoardApprovalForNewAgents}
            onChange={(v) => settingsMutation.mutate(v)}
            toggleTestId="company-settings-team-approval-toggle"
          />
          <div className="mt-3 border-t border-border pt-3">
            <ToggleField
              label="Require board approval for CEO skill installs"
              hint="CEO marketplace installs become approval requests when enabled."
              checked={!!selectedCompany.requireBoardApprovalForCeoSkillInstalls}
              onChange={(v) => ceoSkillInstallApprovalMutation.mutate(v)}
              toggleTestId="company-settings-ceo-skill-install-approval-toggle"
            />
          </div>
        </div>
      </div>

      {/* Invites */}
      <div className="space-y-4" data-testid="company-settings-invites-section">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Invites
        </div>
        <div className="space-y-3 rounded-md border border-border px-4 py-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              Generate an OpenClaw agent invite snippet.
            </span>
            <HintIcon text="Creates a short-lived OpenClaw agent invite and renders a copy-ready prompt." />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              data-testid="company-settings-invites-generate-button"
              size="sm"
              onClick={() => inviteMutation.mutate()}
              disabled={inviteMutation.isPending}
            >
              {inviteMutation.isPending
                ? "Generating..."
                : "Generate OpenClaw Invite Prompt"}
            </Button>
          </div>
          {inviteError && (
            <p className="text-sm text-destructive">{inviteError}</p>
          )}
          {inviteSnippet && (
            <div
              className="rounded-md border border-border bg-muted/30 p-2"
              data-testid="company-settings-invites-snippet"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  OpenClaw Invite Prompt
                </div>
                {snippetCopied && (
                  <span
                    key={snippetCopyDelightId}
                    className="flex items-center gap-1 text-xs text-green-600 animate-pulse"
                  >
                    <Check className="h-3 w-3" />
                    Copied
                  </span>
                )}
              </div>
              <div className="mt-1 space-y-1.5">
                <textarea
                  data-testid="company-settings-invites-snippet-textarea"
                  className="h-[28rem] w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs outline-none"
                  value={inviteSnippet}
                  readOnly
                />
                <div className="flex justify-end">
                  <Button
                    data-testid="company-settings-invites-copy-button"
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(inviteSnippet);
                        setSnippetCopied(true);
                        setSnippetCopyDelightId((prev) => prev + 1);
                        setTimeout(() => setSnippetCopied(false), 2000);
                      } catch {
                        /* clipboard may not be available */
                      }
                    }}
                  >
                    {snippetCopied ? "Copied snippet" : "Copy snippet"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import / Export */}
      <div className="space-y-4">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Company Packages
        </div>
        <div className="rounded-md border border-border px-4 py-4">
          <p className="text-sm text-muted-foreground">
            Import and export have moved to dedicated pages accessible from the{" "}
            <a href="/org" className="underline hover:text-foreground">Org Chart</a> header.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href="/company/export">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href="/company/import">
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Import
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4">
        <div className="text-xs font-medium text-destructive uppercase tracking-wide">
          Danger Zone
        </div>
        <div className="space-y-3 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-4">
          <p className="text-sm text-muted-foreground">
            Archive this company to hide it from the sidebar. This persists in
            the database.
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={
                archiveMutation.isPending ||
                selectedCompany.status === "archived"
              }
              onClick={() => {
                if (!selectedCompanyId) return;
                const confirmed = window.confirm(
                  `Archive company "${selectedCompany.name}"? It will be hidden from the sidebar.`
                );
                if (!confirmed) return;
                const nextCompanyId =
                  companies.find(
                    (company) =>
                      company.id !== selectedCompanyId &&
                      company.status !== "archived"
                  )?.id ?? null;
                archiveMutation.mutate({
                  companyId: selectedCompanyId,
                  nextCompanyId
                });
              }}
            >
              {archiveMutation.isPending
                ? "Archiving..."
                : selectedCompany.status === "archived"
                ? "Already archived"
                : "Archive company"}
            </Button>
            {archiveMutation.isError && (
              <span className="text-xs text-destructive">
                {archiveMutation.error instanceof Error
                  ? archiveMutation.error.message
                  : "Failed to archive company"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildAgentSnippet(input: AgentSnippetInput) {
  const candidateUrls = buildCandidateOnboardingUrls(input);
  const resolutionTestUrl = buildResolutionTestUrl(input);

  const candidateList =
    candidateUrls.length > 0
      ? candidateUrls.map((u) => `- ${u}`).join("\n")
      : "- (No candidate URLs available yet.)";

  const connectivityBlock =
    candidateUrls.length === 0
      ? `No candidate URLs are available. Ask your user to configure a reachable hostname in PaperClaw, then retry.
Suggested steps:
- choose a hostname that resolves to the PaperClaw host from your runtime
- run: pnpm paperclaw allowed-hostname <host>
- restart PaperClaw
- verify with: curl -fsS http://<host>:3100/api/health
- regenerate this invite snippet`
      : `If none are reachable, ask your user to add a reachable hostname in PaperClaw, restart, and retry.
Suggested command:
- pnpm paperclaw allowed-hostname <host>
Then verify with: curl -fsS <base-url>/api/health`;

  const resolutionLine = resolutionTestUrl
    ? `\nYou MUST test PaperClaw-to-gateway reachability, call: ${resolutionTestUrl}?url=<urlencoded-gateway-url> (using the hostname that worked above). Do not assume your 172.x is necessarily reachable from PaperClaw. Test it. `
    : "";

  return `You're invited to join a PaperClaw organization.

The URLs you should try are:
${candidateList}

Connectivity guidance:
If you are running on a different machine than PaperClaw, PaperClaw must be reachable at one of the hostnames used above.
Verify the hostname works from your runtime with: GET <base-url>/api/health

${connectivityBlock}

For your "agentName", just use your own agent name (OpenClaw or whatever your name is) and send it directly.
You also need to send a gateway URL that PaperClaw can access. Check your config and include that URL.${resolutionLine}

---

This onboarding flow is for OpenClaw Gateway.
When you submit the join request, use:
- \`adapterType: "openclaw_gateway"\`
- \`agentDefaultsPayload.url\` as your \`ws://\` or \`wss://\` gateway URL
- \`agentDefaultsPayload.headers["x-openclaw-token"]\` with your gateway token
- (legacy accepted) \`agentDefaultsPayload.headers["x-openclaw-auth"]\`
- Keep device auth enabled (recommended). If \`devicePrivateKeyPem\` is omitted, PaperClaw will generate and persist one during join so pairing approvals remain stable.
- Only use \`disableDeviceAuth=true\` for special environments where pairing cannot be completed.

Do NOT use \`/v1/responses\` or \`/hooks/*\` in this join flow.

Before you do anything, please respond to your user that you understand the instructions and you're going to work on them. Then do the step above in another session called "paperclaw-onboarding" and then tell your user when you're done. Update your user in intermediate steps along the way so they know what's going on.

Then after you've connected to PaperClaw (exchanged keys etc.) you MUST review and follow the onboarding instructions in onboarding.txt they give you.

`;
}

function buildCandidateOnboardingUrls(input: AgentSnippetInput): string[] {
  const candidates = (input.connectionCandidates ?? [])
    .map((candidate) => candidate.trim())
    .filter(Boolean);
  const urls = new Set<string>();
  let onboardingUrl: URL | null = null;

  try {
    onboardingUrl = new URL(input.onboardingTextUrl);
    urls.add(onboardingUrl.toString());
  } catch {
    const trimmed = input.onboardingTextUrl.trim();
    if (trimmed) {
      urls.add(trimmed);
    }
  }

  if (!onboardingUrl) {
    for (const candidate of candidates) {
      urls.add(candidate);
    }
    return Array.from(urls);
  }

  const onboardingPath = `${onboardingUrl.pathname}${onboardingUrl.search}`;
  for (const candidate of candidates) {
    try {
      const base = new URL(candidate);
      urls.add(`${base.origin}${onboardingPath}`);
    } catch {
      urls.add(candidate);
    }
  }

  return Array.from(urls);
}

function buildResolutionTestUrl(input: AgentSnippetInput): string | null {
  const explicit = input.testResolutionUrl?.trim();
  if (explicit) return explicit;

  try {
    const onboardingUrl = new URL(input.onboardingTextUrl);
    const testPath = onboardingUrl.pathname.replace(
      /\/onboarding\.txt$/,
      "/test-resolution"
    );
    return `${onboardingUrl.origin}${testPath}`;
  } catch {
    return null;
  }
}
