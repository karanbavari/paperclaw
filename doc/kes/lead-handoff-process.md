# Lead Handoff Process — Qualification to Sales

**Owner:** Lead-Generation (KES)
**Version:** 1.0
**Last Updated:** 2026-05-15

---

## Overview

This document defines the process for handing off qualified leads from Lead-Generation to Sales-Agent. It covers both inbound and outbound handoffs, qualification criteria, handoff package requirements, and post-handoff responsibilities.

**Purpose:** Ensure every lead handed to Sales is qualified, contextualized, and ready for a sales conversation. No cold handoffs. No incomplete data.

---

## Handoff Triggers

| Source | Trigger | Gate |
|---|---|---|
| **Inbound** | Lead completes qualification form or responds to nurture with buying intent | BANT score >= 2 Green |
| **Outbound** | Lead responds positively to outreach AND passes BANT qualification | BANT score >= 2 Green |
| **Referral** | Referral source confirms interest and provides introduction | Verified referral |
| **Event / Conference** | Lead expresses interest and provides contact information | Opt-in recorded |

---

## Inbound Handoff

### Inbound Lead Path

1. Lead arrives via inbound channel (website, content download, webinar registration)
2. Lead captured in CRM via [Lead Capture Form](/KES/issues/KES-18#document-lead-capture-form)
3. UTM source, campaign, and medium logged via [UTM Tracking](/KES/issues/KES-18#document-utm-tracking)
4. Lead scored against [ICP Definition](/KES/doc/kes/icp-definition.md) criteria
5. Lead qualified per [Lead Scoring Criteria](/KES/issues/KES-18#document-lead-scoring-criteria)
6. If qualified → Outbound Handoff section below

### Inbound-Specific Checks

- [ ] UTM parameters captured and valid
- [ ] Source attribution verified (channel, campaign)
- [ ] Lead scoring threshold met (score >= threshold)
- [ ] No duplicate or existing contact in CRM
- [ ] GDPR/consent status verified (EEA leads require opt-in record)
- [ ] Lead enrichment completed (Clearbit/LinkedIn)

---

## Outbound Handoff

### Outbound Lead Path

1. Account sourced and added to [Target Account List](/KES/doc/kes/target-account-list.md)
2. Account researched and ICP scored
3. Multi-channel outreach executed per [Outbound Prospecting Sequence](/KES/doc/kes/outbound-prospecting-sequence.md)
4. Lead responds positively → begin BANT qualification
5. If qualified → handoff to Sales

### Outbound Qualification Gate

Before handoff, verify:

- [ ] Lead responded positively with buying intent (not just curiosity)
- [ ] BANT qualification completed (2+ Green)
- [ ] Pain points confirmed in lead's own words
- [ ] Decision-maker status confirmed (or path to DM identified)
- [ ] Budget authority or process understood
- [ ] Timeline confirmed (0-6 months)
- [ ] Competitive landscape understood (if applicable)
- [ ] Warm introduction path documented (if any)

### Outbound-Specific Handoff Package

| Item | Required | Format | Owner |
|---|---|---|---|
| ICP score and tier | Yes | CRM field | Lead-Generation |
| Engagement history (touches, responses, timing) | Yes | CRM activity log | Lead-Generation |
| Pain points identified (prospect-validated) | Yes | CRM lead notes | Lead-Generation |
| BANT qualification summary | Yes | CRM lead score | Lead-Generation |
| Trigger event / reason for outreach | Yes | CRM notes | Lead-Generation |
| Competitor information (if known) | Recommended | CRM notes | Lead-Generation |
| Warm introduction path (if exists) | Recommended | CRM notes | Lead-Generation |
| Relevant collateral / case studies | Recommended | Link in CRM task | Lead-Generation |
| Suggested next step | Yes | CRM task | Lead-Generation |

---

## Handoff Package Template

### CRM Task: Lead Handoff to Sales

```
**Subject:** Qualified Lead Handoff: [Company Name] - [Contact Name]

**From:** Lead-Generation
**To:** Sales-Agent

---

**Contact:**
- Name: [First Name] [Last Name]
- Title: [Job Title]
- Company: [Company Name]
- Email: [Email]
- Phone: [Phone]
- LinkedIn: [URL]

**Account:**
- Industry: [Industry]
- Size: [Employee Count]
- Revenue: [Revenue Range]
- ICP Tier: [1 / 2 / 3]
- ICP Score: [X.X / 10]

**Qualification Summary:**
- Budget: [Green / Yellow / Red] — [Notes]
- Authority: [Green / Yellow / Red] — [Notes]
- Need: [Green / Yellow / Red] — [Notes]
- Timeline: [Green / Yellow / Red] — [Notes]

**Pain Points (prospect-validated):**
1. [Pain point 1]
2. [Pain point 2]
3. [Pain point 3]

**Engagement History:**
- First touch: [Date] via [Channel]
- Responses: [Summary of interactions]
- Key quotes / signals: [Notable prospect comments]

**Trigger Event:**
[What prompted this outreach / what is driving their interest]

**Competitive Context:**
[Current vendor / competitive evaluation details]

**Warm Introduction Path:**
[Mutual connections, referral source, or existing relationship]

**Suggested Next Step:**
[Discovery call / demo / proposal / intro call with stakeholder]

**Attached Collateral:**
- [Link to relevant case study]
- [Link to relevant product page]
- [Custom deck if created]

**Handoff Notes:**
[Free text — anything Sales should know before contacting]
```

---

## Post-Handoff Workflow

### Sales-Agent Actions (Within 24 Hours)

- [ ] Accept handoff task in CRM
- [ ] Review handoff package for completeness
- [ ] Contact lead within 24 hours (email or phone)
- [ ] Log initial contact outcome in CRM
- [ ] Update lead status to `In Discovery` or `Rejected`

### Lead-Generation Actions (Post-Handoff)

- [ ] Monitor handoff acceptance — follow up if not accepted within 24h
- [ ] Do NOT contact lead further unless Sales-Agent requests re-engagement
- [ ] Log handoff completion date and attribution data

### Rejected Lead Protocol

If Sales-Agent rejects a handoff (lead not ready, wrong persona, data issues):

1. Sales-Agent logs rejection reason in CRM
2. Lead-Generation reviews within 48 hours
3. If fixable (missing data, wrong contact): fix and re-queue
4. If not fixable: move lead to appropriate nurture or suppression list
5. Track rejection reasons quarterly to improve qualification criteria

---

## Escalation Paths

| Situation | Action | Owner |
|---|---|---|
| Handoff not accepted within 24h | Lead-Generation pings Sales-Agent in CRM | Lead-Generation |
| Handoff rejected without clear reason | Lead-Generation escalates to CMO | Lead-Generation |
| Lead responds while in handoff queue | Lead-Generation acknowledges and routes to Sales-Agent | Lead-Generation |
| Multiple rejections from same Sales-Agent | Quarterly review of qualification criteria alignment | Lead-Generation + Sales Lead |

---

## Quality Metrics

| Metric | Target | Measurement |
|---|---|---|
| Handoff package completeness | > 95% | All required fields populated |
| Handoff acceptance rate (Sales accepts within 24h) | > 90% | CRM task completion |
| Handoff rejection rate | < 15% | Rejected / total handoffs |
| Time from handoff to first Sales contact | < 24 hours | CRM timestamps |
| Conversion rate from handoff to discovery call booked | > 60% | CRM stage progression |
| Attribution logging completeness (UTM, source, campaign) | > 95% | CRM field audit |

---

## References

- [ICP Definition](/KES/doc/kes/icp-definition.md) — lead scoring criteria
- [Target Account List Template](/KES/doc/kes/target-account-list.md) — account sourcing
- [Outbound Prospecting Sequence](/KES/doc/kes/outbound-prospecting-sequence.md) — outbound lead path
- [Cold Email Template](/KES/doc/kes/cold-email-template.md) — first-touch outreach
- [Follow-Up Sequence](/KES/doc/kes/follow-up-sequence.md) — post-initial-outreach cadence
- [Objection Handling Guide](/KES/doc/kes/objection-handling-guide.md) — response framework
- [Demo Script](/KES/doc/kes/demo-script.md) — post-handoff demo flow
