# Outbound Prospecting Sequence

**Owner:** Lead-Generation (KES)
**Version:** 1.0
**Last Updated:** 2026-05-15

---

## Overview

This document defines the end-to-end outbound prospecting sequence for KES. It spans sourcing → research → multi-channel outreach → qualification → handoff to Sales. The sequence is designed to be executed by Lead-Generation in coordination with Sales-Agent.

**Entry trigger:** Target account reaches `Outreach Ready` status in the [Target Account List](/KES/doc/kes/target-account-list.md).

**Exit criteria:**
- Lead qualifies → handoff to Sales via [Lead Handoff Process](/KES/doc/kes/lead-handoff-process.md)
- Lead disqualified → close with reason, log in CRM
- Lead non-responsive after full sequence → move to long-term nurture

---

## Sequence Stages

| Stage | Duration | Owner | Deliverable |
|---|---|---|---|
| 1. Account Research | 2-3 business days | Lead-Generation | Completed account profile + contact map |
| 2. Multi-Channel Outreach | 14 days | Lead-Generation | Initial outbound touches across 2+ channels |
| 3. Follow-Up Cadence | 14 days | Sales-Agent | 3-5 follow-up touches per [Follow-Up Sequence](/KES/doc/kes/follow-up-sequence.md) |
| 4. Qualification | 1-2 calls | Sales-Agent | BANT qualification complete |
| 5. Handoff to Sales | 1 business day | Lead-Generation | Handoff package delivered per process |

---

## Stage 1: Account Research

### Objective

Build a complete intelligence profile for the target account before any outreach.

### Research Checklist

- [ ] **Company profile:** Industry, size, revenue, funding, headquarters, growth stage
- [ ] **Tech stack:** Primary tools, platforms, infrastructure (BuiltWith, manual)
- [ ] **Decision-maker map:** Identify 2-5 contacts per account (LinkedIn)
- [ ] **Pain signals:** Job postings, recent hires, organizational changes, public statements
- [ ] **Trigger events:** Funding, leadership change, product launch, expansion
- [ ] **Relationship map:** Warm introductions, mutual connections, existing engagement
- [ ] **Competitive landscape:** Current vendors, recent RFPs, switching signals
- [ ] **Content engagement:** Recent blog posts, social activity, comments on relevant topics

### Research Outputs

| Artifact | Format | Purpose |
|---|---|---|
| Account profile | CRM record fields | Structured data for scoring |
| Contact list (2-5 per account) | CRM contacts | Outreach targets |
| Engagement angle | Notes field | Personalization strategy |
| Warm introduction path | Notes field | Priority outreach channel |

---

## Stage 2: Multi-Channel Outreach (Days 1-14)

### Objective

Make initial contact through the most effective channel(s) for the account. Minimum 2 channels per account within the first 14 days.

### Channel Selection Matrix

| Account Signal | Primary Channel | Secondary Channel | Angle |
|---|---|---|---|
| Strong LinkedIn presence | LinkedIn InMail/Connection | Email | Reference their content or activity |
| Published content (blog, byline) | Email (reference specific piece) | LinkedIn | Compliment/follow-up on article |
| Attended event/conference | Email (event-trigger template) | LinkedIn | Reference event attendance |
| Warm mutual connection | LinkedIn (mention connection) | Email | Referral-based approach |
| Downloaded content / inbound | Email (value-first template) | LinkedIn | Continue the conversation |
| No strong signal | Email (problem-first) | LinkedIn (connection request) | ICP-driven value proposition |

### Channel-Specific Templates

| Channel | Template | Reference |
|---|---|---|
| Email (first touch) | Per ICP tier and trigger | [Cold Email Template](/KES/doc/kes/cold-email-template.md) |
| LinkedIn (connection request) | Custom 200-char note | See below |
| LinkedIn (InMail) | Shortened email variant | See below |
| Phone | Call script | [Follow-Up Sequence: Touch 4](/KES/doc/kes/follow-up-sequence.md) |
| Event (in-person) | In-person conversation | [Demo Script](/KES/doc/kes/demo-script.md) |

### LinkedIn Templates

**Connection Request (with note):**
```
Hi [First Name] — I've been following [Company Name]'s recent [Trigger Event].
I work with [Target Industry] teams on [Outcome] and thought it'd be valuable to connect.
```

**InMail (after connection accepted):**
```
Hi [First Name] — thanks for connecting.

Quick context: [1-2 sentences on who we help and what we do — reference their role/company]

Given [Trigger / Pain Signal], I thought this might be relevant to [Company Name].

Would you be open to a 10-minute conversation to see if there's a fit?

Best,
[Your Name]
```

---

## Stage 3: Follow-Up Cadence (Days 15-28)

### Objective

Nurture non-responding leads through a structured follow-up cadence. Delegated to Sales-Agent per the Follow-Up Sequence.

### Trigger

Lead has not responded to initial multi-channel outreach within 14 days.

### Cadence

| Touch | Day | Channel | Content | Owner |
|---|---|---|---|---|
| 1 | D+0 | Email | Initial cold email | Lead-Generation |
| 2 | D+3 | Email | Value-add follow-up | Sales-Agent |
| 3 | D+6 | Email | Case study / social proof | Sales-Agent |
| 4 | D+9 | Phone | Direct call | Sales-Agent |
| 5 | D+12 | Email | Breakup / close loop | Sales-Agent |

Full details in [Follow-Up Sequence](/KES/doc/kes/follow-up-sequence.md).

---

## Stage 4: Qualification (Days 15-28, parallel to Follow-Up)

### Objective

Qualify responding leads using BANT framework. Lead-Generation qualifies initial response; Sales-Agent deepens qualification on discovery call.

### BANT Qualification Framework

| Criterion | Questions | Green | Yellow | Red |
|---|---|---|---|---|
| **Budget** | Do you have budget allocated for this? What's the approval process? | Budget allocated and approved | Budget exists but needs approval | No budget, no plan |
| **Authority** | Are you the decision-maker? Who else needs to be involved? | Is the decision-maker or can influence | Can recommend, not decide | No access to decision-maker |
| **Need** | What's the primary problem you're trying to solve? How urgent is it? | Clear, documented need with timeline | Vague need, no timeline | No identified need |
| **Timeline** | When do you need a solution in place? | 0-3 months | 3-6 months | 6+ months or unknown |

### Qualification Scoring

| Score | Classification | Action |
|---|---|---|
| 3-4 Green | Hot lead | Immediate handoff to Sales |
| 2 Green / 2 Yellow | Warm lead | Continue nurture, address gaps |
| 3+ Red or 4 Yellow | Cold lead | Move to long-term nurture or disqualified |

---

## Stage 5: Handoff to Sales

### Objective

Deliver a complete handoff package to Sales-Agent for all qualified leads.

### Handoff Trigger

Lead responds positively AND meets BANT qualification threshold (2+ Green).

### Handoff Package

| Item | Format | Owner |
|---|---|---|
| Account profile | CRM account record | Lead-Generation |
| Contact details | CRM contact record | Lead-Generation |
| Engagement history | CRM activity log | Lead-Generation |
| Qualification notes | CRM lead notes | Lead-Generation |
| Pain points identified | CRM lead notes | Lead-Generation |
| Relevant case studies / collateral | Links | Lead-Generation |
| Warm introduction path | CRM notes | Lead-Generation |
| Suggested next step | CRM task | Lead-Generation |

Full details in [Lead Handoff Process](/KES/doc/kes/lead-handoff-process.md).

---

## Sequence Governance

### Weekly Review (Lead-Generation + Sales-Agent)

| Agenda Item | Duration | Owner |
|---|---|---|
| New accounts entering Stage 1 | 10 min | Lead-Generation |
| Accounts advancing to Stage 2 (outreach ready) | 10 min | Lead-Generation |
| Active outreach results (Stage 2-3) | 10 min | Lead-Generation |
| Qualification completions (Stage 4) | 10 min | Sales-Agent |
| Handoff quality review | 10 min | Sales-Agent |
| Blocked accounts and prioritization | 10 min | Both |

### Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Accounts entering Stage 1 per week | 20-50 | CRM list count |
| Accounts reaching Stage 2 per week | 10-25 | CRM status change |
| Positive response rate (Stage 2-3) | > 10% | CRM activity log |
| Qualification conversion rate (Stage 2 to Stage 4) | > 25% | CRM stage tracking |
| Average time from Stage 1 to Stage 5 | < 45 days | CRM timestamps |
| Handoff package completeness | > 95% | Quality audit (weekly) |
| Leads handed off to Sales per week | 3-10 | CRM handoff count |

---

## Escalation & Edge Cases

| Situation | Action | Owner |
|---|---|---|
| Account expresses urgent need before outreach | Skip to Stage 4 qualification | Lead-Generation |
| Lead responds negatively at any point | Log reason, mark disqualified, move to suppression | Lead-Generation |
| Lead requests specific product/pricing info | Route to CTO / Sales Lead | Lead-Generation |
| Account is a clear strategic fit but no response | Extend sequence to 60 days, add event-based re-trigger | Lead-Generation |
| Lead requests call with executive | Route to Sales Lead for direct engagement | Lead-Generation |
| Account goes through major change (acquisition, layoffs) | Pause sequence, reassess fit within 30 days | Lead-Generation |

---

## References

- [ICP Definition](/KES/doc/kes/icp-definition.md) — account scoring and fit criteria
- [Target Account List Template](/KES/doc/kes/target-account-list.md) — account sourcing and tracking
- [Cold Email Template](/KES/doc/kes/cold-email-template.md) — first-touch email templates
- [Follow-Up Sequence](/KES/doc/kes/follow-up-sequence.md) — post-initial-outreach cadence
- [Objection Handling Guide](/KES/doc/kes/objection-handling-guide.md) — response to common objections
- [Demo Script](/KES/doc/kes/demo-script.md) — post-qualification demo flow
- [Lead Handoff Process](/KES/doc/kes/lead-handoff-process.md) — qualified handoff to Sales
