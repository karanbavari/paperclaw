# Target Account List Template

**Owner:** Lead-Generation (KES)
**Version:** 1.0
**Last Updated:** 2026-05-15

---

## Overview

This template defines the structure for building and maintaining KES's target account list. Each account is researched, scored against the [ICP Definition](/KES/doc/kes/icp-definition.md), and assigned a priority tier before outbound outreach begins.

**Purpose:** Ensure every outbound dollar and minute is spent on accounts with ICP fit, clear decision-maker access, and actionable intent signals.

---

## Account Sourcing Channels

| Channel | Frequency | Owner | Notes |
|---|---|---|---|
| LinkedIn Sales Navigator | Weekly | Lead-Generation | Build saved searches by ICP criteria |
| CrunchBase / PitchBook | Weekly | Lead-Generation | Track fundraising, acquisitions |
| G2 / Capterra category pages | Bi-weekly | Lead-Generation | Prospects actively searching for solutions |
| Industry events & webinars | As announced | Lead-Generation | Attendee lists, speaker lists |
| Competitor customer lists (public) | Monthly | Lead-Generation | Tech stack detection (BuiltWith, Wappalyzer) |
| Inbound lead qualification rejects | Ongoing | Lead-Generation | Accounts that fit ICP but individual didn't |
| Referral / partner introductions | As received | Lead-Generation | Prioritize warm leads |
| Content engagement signals | Weekly | Lead-Generation | Blog/subscriber data enrichment |

---

## Account List Fields

### Required Fields (Must populate before outreach)

| Field | Type | Example | Source |
|---|---|---|---|
| Company Name | Text | Acme Corp | Manual entry |
| Domain | URL | acme.com | Manual entry |
| Industry | Text | B2B SaaS | Enrichment (Clearbit) |
| Employee Count | Number | 250 | Enrichment (LinkedIn/Clearbit) |
| Annual Revenue (est.) | Text | $50M-$100M | Enrichment (CrunchBase) |
| Headquarters | Text | San Francisco, CA | Enrichment |
| ICP Tier | Select | Tier 1 | Calculation |
| ICP Score | Number | 8.2 | Calculation |
| Source | Select | LinkedIn Sales Navigator | Manual |
| Status | Select | Researching / Outreach Ready / In Sequence / Paused / Disqualified | Manual |

### Recommended Fields (Populate before first touch)

| Field | Type | Example | Source |
|---|---|---|---|
| Tech Stack (detected) | Tags | Salesforce, HubSpot, Jira, Slack | BuiltWith, manual |
| Key Decision Makers | List | Jane Doe (CTO), John Smith (VP Eng) | LinkedIn research |
| Recent Triggers | Text | "Raised $30M Series B in March 2026" | CrunchBase, press |
| Pain Signals | Text | "Hiring 5 engineers — likely scaling pains" | Job posts, social |
| Competitor In Use | Text | CompetitorX | Tech detection |
| Target Persona | Select | CTO / VP Eng / Head of Product / CRO | Manual |
| Account Priority | Select | High / Medium / Low | Manual override |

### Tracking Fields (Populated during outreach)

| Field | Type | Example | Source |
|---|---|---|---|
| Date Added | Date | 2026-05-15 | Auto |
| Date First Touched | Date | 2026-05-20 | Auto (CRM) |
| Outreach Channel | Select | Email / LinkedIn / Phone / Event | Manual |
| Sequence Stage | Select | Touch 1 / Touch 2 / Touch 3 / Call / Breakup / Won | Auto (CRM) |
| Last Activity | Date | 2026-05-22 | Auto |
| Response Status | Select | No Response / Interested / Not Interested / Meeting Booked / Disqualified | Manual |
| Meeting Date | Date | 2026-06-01 | Manual |
| Handoff to Sales Date | Date | 2026-06-01 | Manual |
| Notes | Text | "Spoke at DevOps Summit — mentioned toolchain pain" | Manual |

---

## Account List Template (CSV Format)

```csv
Company Name,Domain,Industry,Employee Count,Annual Revenue,Headquarters,ICP Tier,ICP Score,Source,Status,Tech Stack,Key Decision Makers,Recent Triggers,Pain Signals,Competitor In Use,Target Persona,Account Priority,Date Added
```

### Google Sheets / Airtable Columns

| Column | Width | Formatting |
|---|---|---|
| Company Name | 200px | Bold |
| Domain | 180px | Hyperlink |
| Industry | 150px | — |
| Employee Count | 100px | Number |
| Annual Revenue | 120px | — |
| Headquarters | 150px | — |
| ICP Tier | 80px | Color: Tier 1=Green, Tier 2=Yellow, Tier 3=Red |
| ICP Score | 80px | Number (one decimal) |
| Source | 120px | — |
| Status | 120px | Color: Researching=Grey, Outreach Ready=Blue, In Sequence=Purple, Paused=Yellow, Disqualified=Red |
| Tech Stack | 200px | Tags |
| Key Decision Makers | 250px | Linked names |
| Recent Triggers | 250px | — |
| Pain Signals | 250px | — |
| Competitor In Use | 150px | — |
| Target Persona | 140px | — |
| Account Priority | 100px | Color: High=Green, Medium=Yellow, Low=Grey |
| Date Added | 100px | Date |
| Notes | 300px | Free text |

---

## Weekly Account List Workflow

### Monday: Sourcing & Refresh

1. Review all seven sourcing channels for new accounts
2. Add qualifying accounts to research queue
3. Remove hard-bounced, opt-outs, and disqualified accounts
4. Refresh enrichment data on accounts > 30 days old

### Tuesday: Research & Scoring

1. Complete ICP scoring for all new accounts
2. Identify key decision-makers (LinkedIn)
3. Document pain signals and recent triggers
4. Assign target persona and account priority

### Wednesday: Pipeline Review

1. Review accounts in `Researching` status → advance to `Outreach Ready`
2. Review accounts in `In Sequence` with stale activity
3. Decide pauses and disqualifications based on new intel
4. Review Tier 1 accounts for warm introduction paths

### Thursday: List Export & Outreach

1. Export `Outreach Ready` accounts to CRM sequence
2. Verify CRM field completeness before send
3. Launch new sequence batch (max 50 new accounts/week)

### Friday: Cleanup & Reporting

1. Merge duplicates across channels
2. Log list health metrics (see below)
3. Prepare weekly account report for CMO

---

## Account List Health Metrics

| Metric | Target | Action if Below |
|---|---|---|
| New accounts added per week | 20-50 | Increase sourcing channel coverage |
| % of list with full required fields | > 90% | Enforce field completeness gate before outreach |
| % of accounts advancing to Outreach Ready within 14 days | > 60% | Reduce research cycle time |
| ICP Tier 1 % of list | > 40% | Tighten sourcing criteria |
| Bounce rate on fresh accounts | < 5% | Improve contact sourcing hygiene |
| Disqualification rate (before outreach) | < 20% | Sharpen ICP screening |

---

## CRM Integration

| Action | CRM Effect | Automation |
|---|---|---|
| Account added to list | Create account record (if new) + lead record | Via CSV import / API |
| Account moved to Outreach Ready | Create outreach task in cadence | Manual trigger |
| Account moved to In Sequence | Apply sequence tag, log start date | Manual trigger |
| Account responded positively | Flag for handoff review, trigger Sales notification | Auto via CRM |
| Account disqualified | Close with reason, move to suppression list | Manual |

---

## References

- [ICP Definition](/KES/doc/kes/icp-definition.md) — scoring criteria for account tier assignment
- [Outbound Prospecting Sequence](/KES/doc/kes/outbound-prospecting-sequence.md) — once account is ready
- [Cold Email Template](/KES/doc/kes/cold-email-template.md) — first-touch outreach
- [Follow-Up Sequence](/KES/doc/kes/follow-up-sequence.md) — post-cold-email cadence
- [Lead Handoff Process](/KES/doc/kes/lead-handoff-process.md) — qualified handoff to Sales
