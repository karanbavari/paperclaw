# Re-engagement Template — Lost / Lukewarm Leads

**Owner:** Sales-Agent (KES)
**Version:** 1.0
**Last Updated:** 2026-05-15

---

## Overview

This document defines the re-engagement sequence for leads who did not convert during initial outreach — either because timing was wrong (lukewarm) or the lead explicitly declined (lost). The goal is to maintain a positive brand relationship and re-activate when signals change.

**Entry trigger (lukewarm):** Lead responded positively but timing was wrong; tagged with future re-engagement date (30/60/90 days).

**Entry trigger (lost):** Lead explicitly declined or completed the full outreach sequence without response. Cold period of 90 days before re-engagement.

**Exit criteria:**
- Lead responds positively → transition to new qualification/discovery
- Lead responds negatively or opts out → permanent removal from re-engagement
- Lead does not respond after full re-engagement sequence → move to long-term nurture

---

## Lead Classification

| Category | Definition | Re-engagement Window | Cadence |
|---|---|---|---|
| **Lukewarm** | Positive response but bad timing | 30-90 days post-last-touch | Priority — faster cadence (3 touches over 14 days) |
| **Cold / No response** | Completed outreach sequence with no reply | 90 days post-last-touch | Standard cadence (3 touches over 21 days) |
| **Explicit decline** | Said "no" or "not interested" | 180 days (only if new signal appears) | Single touch — only if strong re-activation signal |
| **Bounced / Invalid** | Email invalid | N/A | Do not re-engage until new contact info obtained |

---

## Re-engagement Signals

Do not re-engage without a signal. Watch for:

| Signal | Source | Action |
|---|---|---|
| Website visit (after dormant period) | Analytics / tracking | Flag as warm — initiate re-engagement |
| Content download / resource access | Content platform | Send related follow-up |
| Event registration / attendance | Event platform | Send event-triggered email |
| Job change (new role / company) | LinkedIn / enrichment | Re-target at new company |
| Company news (funding, expansion, new product) | News / enrichment | Craft relevant outreach |
| Social media engagement (like, share, comment) | Social platform | Use as conversation starter |
| Referral from existing customer | Referral source | Warm re-engagement |
| Competitor mention / churn signal | Intent data / news | Targeted competitive outreach |

**Do NOT re-engage without a signal** unless the lead was marked lukewarm with a set date.

---

## Re-engagement Sequence: Lukewarm (Priority)

### Touch 1: Value Update (D+0)

**Subject:** Something that made me think of [Company Name]

**Body:**

Hi [First Name],

When we last spoke [Timeframe], the timing wasn't right for [Topic]. Totally understood.

Since then, a few things have happened that I thought you'd want to know about:

1. **[New feature / capability]:** [1-sentence description and why it matters]
2. **[New case study / result]:** [Customer] achieved [Result] — [Link]
3. **[Industry trend / insight]:** [Relevant update]

If [Topic] has become more relevant, I'd love to reconnect. If not, no worries at all — just wanted to keep you in the loop.

Best,
[Your Name]
[Company Name]

---

### Touch 2: Direct Re-connect (D+7)

**Subject:** Quick catch-up?

**Body:**

Hi [First Name],

Following up on my last note — I know timing was an issue before, but wanted to check if anything has changed.

**Quick question:** Is [Topic / Pain Point from initial conversation] still a priority, or has your focus shifted?

- If it's still relevant, I'd love to pick up where we left off — 15 minutes is all I'd ask.
- If it's not, just say the word and I'll leave you be.

Appreciate the honesty either way.

Best,
[Your Name]
[Company Name]

---

### Touch 3: Break-up / Soft Close (D+14)

**Subject:** Closing this loop

**Body:**

Hi [First Name],

I've checked in a couple of times and haven't heard back — completely fine.

I'll assume the timing still isn't right, and I'll stop here.

**If anything changes:**
- Reply to this email and I'll pick up immediately
- Book time directly: [Calendly Link]
- Subscribe to our monthly newsletter: [Link]

If you'd prefer I don't reach out in the future, reply "Opt out" and I'll remove you permanently.

Wishing you and [Company Name] all the best.

Best,
[Your Name]
[Company Name]

---

## Re-engagement Sequence: Cold / No Response (Standard)

### Touch 1: "It's been a while" (D+0)

**Subject:** It's been a while — checking in

**Body:**

Hi [First Name],

It's been a few months since we last connected about [Topic]. A lot has changed since then, and I wanted to share a quick update.

**Here's what's new at [Company Name]:**
1. **[Update 1]:** [1 sentence]
2. **[Update 2]:** [1 sentence]
3. **[Update 3]:** [1 sentence]

**Here's what customers are saying:**
[Quote or metric from recent case study]

If any of this resonates with what you're working on, I'd love to reconnect. If not, no worries.

Best,
[Your Name]
[Company Name]

---

### Touch 2: Industry Insight (D+10)

**Subject:** [Industry Trend] and what it means for [Company Name]

**Body:**

Hi [First Name],

Came across something relevant to [Industry / Role] and thought of you.

**[Industry Trend / Report / Insight]**

[2-3 sentence summary and why it matters for their role]

**At [Company Name], we're seeing:**
[Connection between trend and our product — factual, not salesy]

Would love to hear your take if you have a moment. No pitch — genuinely curious.

Best,
[Your Name]
[Company Name]

---

### Touch 3: Final Attempt (D+21)

**Subject:** Last note — no pressure

**Body:**

Hi [First Name],

I've reached out a couple of times and understand if the timing hasn't been right. This will be my last note.

A quick summary so you don't have to search:
- We help [Target Audience] [Key Outcome]
- Companies like [Reference Customer] saw [Key Metric]
- If ever relevant: [Calendly Link]

If you'd like to stay connected without sales outreach, follow us on [LinkedIn] or subscribe to [Newsletter].

Wishing you all the best.

Best,
[Your Name]
[Company Name]

P.S. If you'd prefer no future outreach, just reply "Opt out."

---

## Re-engagement Sequence: Explicit Decline (Signal-Triggered Only)

### Single Touch (D+0) — Only send if strong re-activation signal detected

**Subject:** Something caught my eye

**Body:**

Hi [First Name],

I know we last spoke [Timeframe] and it wasn't the right fit at the time. Respect that completely.

But I noticed [Signal — e.g., "your company recently announced [News]." / "you visited our pricing page."] and wanted to share something relevant:

[1-2 sentence relevant update or resource]

If this changes anything for you, I'm here. If not, no reply needed.

Best,
[Your Name]
[Company Name]

---

## Response Branching Logic

| Prospect Response | Action | Next Step |
|---|---|---|
| Positive / Interested | Treat as new lead. Start fresh discovery. | Schedule discovery call |
| "Timing still isn't right" | Log updated re-engagement date (another 90 days) | Set CRM reminder |
| Not interested / "Leave me alone" | Remove permanently from all sequences. Log reason. | N/A |
| Opt out | Immediate removal. Do not re-engage. | N/A |
| Bounce | Remove from list. | Update CRM |
| Changed company / role | Update contact info, re-target at new company | Treat as new lead at new company |

---

## Automated Trigger Rules

| Event | Action |
|---|---|
| Lead marked `lukewarm` with re-engagement date | Auto-schedule re-engagement sequence at specified date |
| Lead marked `cold-no-response` for 90+ days | Flag for re-engagement review. Auto-initiate if signal detected. |
| Re-activation signal detected (site visit, content download) | Flag lead, recommend re-engagement |
| Re-engagement sequence completes with no response | Move to `long-term nurture`, do not auto-re-engage again |
| Lead response negative or opt-out | Permanently remove from re-engagement sequences |
| Job change detected | Re-classify as new lead at new company |

---

## Success Metrics & Targets

| Metric | Definition | Target |
|---|---|---|
| Re-engagement open rate | Unique opens / sent | > 45% |
| Re-engagement reply rate | Replies / sent | > 8% |
| Re-activation rate | Positive responses / re-engagement attempts | > 5% |
| Second-sequence conversion | Leads who convert after re-engagement | > 3% |
| Opt-out rate from re-engagement | Opt-outs / total | < 8% |

---

## Escalation Rules

| Signal | Action | Handoff |
|---|---|---|
| Lead responds with strong positive intent | Transition to Sales-Agent for new qualification | Sales-Agent |
| Lead from lost category re-engages via strong signal, high fit score | Escalate to Sales-Lead for priority treatment | Sales-Lead |
| Lead mentions competitor switch (from competitor to us) | Flag as competitive win opportunity | Sales-Lead |
| Lead requests removal across all channels | Process opt-out immediately. Do not re-engage. | N/A — compliance |
