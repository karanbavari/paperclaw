# Cold Email Template — First-Touch Outreach

**Owner:** Sales-Agent (KES)
**Version:** 1.0
**Last Updated:** 2026-05-15

---

## Overview

This document defines the cold email template for first-touch outreach to qualified leads handed off from Lead-Generation. Each template is tiered by lead source and persona. All cold emails follow the **PAS framework** (Problem — Agitate — Solution).

**Handoff trigger:** Lead-Generation marks lead as `qualified` in CRM with complete firmographic and intent data.

**ICP fit check (before sending):**
- [ ] Lead fits target persona (verified against ICP doc)
- [ ] Contact has valid email and title
- [ ] Company has budget authority signal (founding year, funding, team size)
- [ ] Intent signal present (content download, event attendance, or similar)

---

## CRM Fields Required

| Field | Source | Purpose |
|---|---|---|
| First Name | Lead form / enrichment | Personalization |
| Company Name | Lead form / enrichment | Context |
| Job Title | Enrichment (Clearbit/LinkedIn) | Personalization + angle |
| Industry | Enrichment | Vertical relevance |
| Intent Signal | Activity log | Trigger for angle selection |
| Lead Source | CRM field | Template selection |
| Pain Point (inferred) | Lead score / ICP notes | Angle customization |

---

## Template Selection Matrix

| Lead Source | Recommended Template | Angle |
|---|---|---|
| Inbound (content download) | Value-First | "Saw you downloaded X — here's more" |
| Event / Webinar attendee | Event-Trigger | "Liked your question at [Event]" |
| Outbound (ICP match) | Problem-First | "Noticing [pain] at [Company]" |
| Referral / Warm intro | Referral | "[Referrer] suggested I reach out" |
| Competitor customer | Competitive Switch | "There's a better way to [outcome]" |

---

## Template 1: Value-First (Inbound / Content Download)

**Subject:** Your download of [Resource Name]

**Body:**

Hi [First Name],

I noticed you downloaded **[Resource Name]** recently — I'm curious what stood out to you.

At [Company Name], we help [Target Industry] teams like yours [achieve Key Outcome]. Quick snapshot:

**The problem we solve:**
[1-sentence description of the problem]

**How [Company Name] helps:**
[1-sentence description of solution]

**Signal you're a fit:**
- You're at [Company Name] ([Industry])
- [Specific signal based on intent / firmographic]
- [Additional qualifying signal]

Would you be open to a 10-minute conversation to see if this is relevant to what you're working on?

If timing isn't right, no problem — I'll leave you with a link to [Relevant Case Study / Resource]: [Link]

Best,
[Your Name]
[Company Name]
[Phone - optional]

---

## Template 2: Event-Trigger (Webinar / Conference)

**Subject:** Quick follow-up from [Event Name]

**Body:**

Hi [First Name],

I really enjoyed your [question / comment / presence] at **[Event Name]** — specifically around [Topic].

It got me thinking: [Company Name] helps companies like [Company Name] solve [Problem] with [Solution].

**Here's why I'm reaching out:**
- [Relevant insight from the event]
- [Connection to our product]
- [Specific offer — demo, content, or intro call]

If this resonates, I'd love to continue the conversation. Open to a quick call next [Day / Time]?

If not, no worries — here's [Relevant Resource]: [Link]

Best,
[Your Name]
[Company Name]

---

## Template 3: Problem-First (Outbound / ICP Match)

**Subject:** [Problem they likely have]

**Body:**

Hi [First Name],

I've been researching [Company Name] and noticed you're likely dealing with **[Specific Problem]** — common for [Industry] companies at your stage.

Most teams we talk to tell us:
1. **[Pain Point 1]** — [1 sentence]
2. **[Pain Point 2]** — [1 sentence]
3. **[Pain Point 3]** — [1 sentence]

That's exactly what [Company Name] addresses. We help companies like [Reference Customer] achieve [Outcome] by [Approach].

**Quick relevant stat:** [Statistic that resonates with their industry/role]

Would you be open to a brief chat to see if this is worth exploring? Happy to share how [Reference Customer] solved a similar challenge.

Best,
[Your Name]
[Company Name]

---

## Template 4: Referral (Warm Intro)

**Subject:** [Referrer Name] suggested I reach out

**Body:**

Hi [First Name],

**[Referrer Name]** over at [Referrer Company] suggested I connect with you — they thought you'd find value in what we're doing at [Company Name].

A bit about us: we help [Target Audience] **[Core Value Proposition]** .

[Referrer Name] mentioned you might be interested in:
- [Specific topic / pain point the referrer identified]
- [Connection to how we help]

I'd love to continue this conversation. Are you open to a quick 15-minute call next week?

Thanks,
[Your Name]
[Company Name]

---

## Template 5: Competitive Switch (Competitor Customer)

**Subject:** A better approach to [Outcome]

**Body:**

Hi [First Name],

I know you're currently using **[Competitor Name]** for [Use Case]. Many teams who've made the switch to [Company Name] tell us the same thing: they wished they'd done it sooner.

**Here's what they typically report:**

| Before ([Competitor]) | After ([Company Name]) |
|---|---|
| [Limit/friction 1] | [Benefit 1] |
| [Limit/friction 2] | [Benefit 2] |
| [Limit/friction 3] | [Benefit 3] |

**Migration is straightforward:** most teams are fully transitioned in [Timeframe] with [Support offering] from our team.

Would you be open to a no-obligation comparison? Happy to show you how [Company Name] stacks up against [Competitor] for your specific use case.

Best,
[Your Name]
[Company Name]

---

## Sending Rules & Compliance

| Rule | Policy |
|---|---|
| Sending window | Tue-Thu, 7:00-10:00 AM recipient timezone |
| Max sends per domain/day | 10 per domain to protect deliverability |
| Unsubscribe | Must include one-click unsubscribe in every email |
| CAN-SPAM compliance | Include physical address of sender |
| Bounce handling | Remove on hard bounce. Soft bounce: retry once after 72h |
| Open tracking | Enabled. Do not use pixel blockers. |
| Link tracking | UTM params: `?utm_source=cold&utm_medium=email&utm_campaign=outreach_[campaign]` |
| GDPR/Privacy | Leads from EEA require consent record. Do not send without opt-in. |

---

## A/B Testing Framework

| Element | Variant A | Variant B | Sample Size | Winner Criteria |
|---|---|---|---|---|
| Subject line | Benefit-driven | Curiosity-driven | 50 per variant | Open rate > 5% diff |
| Body length | Short (3-4 lines) | Standard (6-8 lines) | 50 per variant | Reply rate > 3% diff |
| CTA | "Quick call?" | "Helpful resource?" | 50 per variant | Conversion > 3% diff |
| Personalization | Company-level | Personal-level | 50 per variant | Reply rate > 5% diff |

---

## Success Criteria

| Metric | Target | Action if Below |
|---|---|---|
| Open rate | > 50% | Refresh subject line or sender name |
| Reply rate | > 10% | Refine angle or personalization depth |
| Positive reply rate (meeting booked) | > 3% | Review targeting criteria |
| Bounce rate | < 3% | Clean list before send |
| Spam complaint rate | < 0.1% | Reduce send volume, review content |
| Unsubscribe rate | < 2% | Improve relevance of targeting |

---

## Escalation Rules

| Signal | Action | Handoff |
|---|---|---|
| Positive reply ("interested", "tell me more") | Log in CRM, schedule demo/discovery call within 48h | Sales-Agent continues to qualification |
| Objection raised | Log objection, respond with prepared objection handling | Reference [Objection Handling Guide](/KES/doc/kes/objection-handling-guide.md) |
| "Not right now" / "Busy" | Mark as `lukewarm`, add to nurture sequence | Follow [Re-engagement Template](/KES/doc/kes/re-engagement-template.md) |
| Explicit "No" / "Not interested" | Remove from outreach cadence, log reason. Do NOT persist. | Nurture only if re-engagement signal appears within 90 days |
| Wrong contact | Request redirect politely | Update CRM, re-target correct persona |
| Bounce / Invalid email | Remove from list | Log for list hygiene |
