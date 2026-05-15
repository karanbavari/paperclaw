# Renewal Campaign Timeline (T-60 / T-30 / T-7)

**Owner:** Follow-up Specialist (KES)
**Version:** 1.0
**Last Updated:** 2026-05-15
**Status:** Active

---

## Overview

This document defines the renewal campaign timeline for existing customers approaching their renewal date. The campaign runs on a T-60, T-30, and T-7 day cadence, with the goal of maximizing renewal rates through value reinforcement, relationship strengthening, and timely Sales handoff.

**Entry trigger:** Customer completes 90-day check-in with Green/Yellow status (or existing customer enters renewal window).

**Exit criteria:** Customer renews (handoff to Sales for contract), or customer churns (handoff to CMO for win-back).

---

## Data Dependencies

The campaign requires the following CRM/data fields per customer:
- Renewal date (single or auto-computed from contract start + term)
- Product tier and current plan
- Feature adoption metrics (% of core features used)
- Recent support ticket history (last 90 days)
- NPS score from last check-in
- Account health score (green/yellow/red)
- Primary contact name and email
- Decision-maker contact (if different from primary)
- Usage trends (increasing/stable/declining)

---

## T-60 Days: Renewal Awareness & Value Reinforcement

### Purpose

Introduce the upcoming renewal positively. Reinforce value delivered so far. Surface any unresolved friction early. Begin renewal conversation without pressure.

### Timing

- Send: 58-62 days before renewal date
- Best day: Tuesday or Wednesday
- Best time: 10:00-11:00 AM local time

### Email Template

**Subject:** Your [Product Name] journey so far + looking ahead

**Body:**

Hi [First Name],

I've been reviewing your account, and I wanted to share what I'm seeing before we look ahead.

**Your impact so far:**
- [Metric 1: e.g., "You've processed X workflows with [Product Name]"]
- [Metric 2: e.g., "Your team has adopted Y of Z core features"]
- [Metric 3: e.g., "You've saved approximately Z hours based on your usage patterns"]

Your current plan is set to renew on **[Renewal Date]**. We'd love to keep this momentum going.

**A few things to think about:**
1. **Any features you'd like to see?** We've shipped [X updates] since you started. Highlights include [Feature A], [Feature B], and [Feature C].
2. **Any blockers or gaps?** Now's the time to raise them — I want to make sure nothing stands between you and full value.
3. **Growth plans?** If your team's needs have changed, we may have options that better fit where you're headed.

No action needed today. Over the next few weeks, I'll share some updates and resources tailored to your usage. And when the time is right, my colleague on the Sales team will walk through renewal options with you.

If anything's on your mind, just reply — I read every response personally.

Best,
[Your Name]
Follow-up Specialist | [Company Name]

### Success Criteria

| Criteria | Target | Risk Flag |
|---|---|---|
| Email opened | > 55% | Yellow if < 40%, Red if < 30% |
| Reply received | > 20% | Red if no reply after 7 days |
| Objection/blocker surfaced | Documented if present | Red if major blocker identified |
| Engagement trend | Stable or improving | Yellow if declining vs prior touchpoints |

### Escalation Rules

| Signal | Action | Handoff |
|---|---|---|
| Blockers or dissatisfaction raised | Address within 48 hours. If unresolvable, escalate. | Escalate to CMO + Sales-Lead with summary |
| Positive reply ("all good", "looking forward") | Log response, proceed to T-30 | None |
| No reply after 7 days | Send T-60 re-engagement | See below |
| Churn risk detected (usage dropping, support tickets increasing) | Flag yellow/red. Proceed to T-30 with escalated tone. | Notify CMO |

### T-60 Re-Engagement (if no reply after 7 days)

**Subject:** Quick update on your account

**Body:**

Hi [First Name],

Just a quick note — your [Product Name] plan renews on **[Renewal Date]**, and I want to make sure everything's on track for you.

We've been busy building: [1-2 sentence update on relevant new features or improvements].

If you're happy with how things are going, just reply "All good" and I'll send over a summary of what's new when we reach the 30-day mark.

If there's anything you'd like to discuss — new goals, team changes, or questions about what's next — I'm here.

Best,
[Your Name]
Follow-up Specialist | [Company Name]

---

## T-30 Days: Renewal Discussion & Option Presentation

### Purpose

Present concrete renewal options. Address any outstanding concerns. Highlight new value since last touch. Begin warming decision-makers. Prepare for Sales handoff.

### Timing

- Send: 28-32 days before renewal date
- Best day: Tuesday, Wednesday, or Thursday
- Best time: 10:00-11:00 AM local time
- Follow-up call: Schedule within 3-5 days of sending if reply indicates interest

### Email Template

**Subject:** Your renewal options — let's find the right fit

**Body:**

Hi [First Name],

Your [Product Name] plan renews in about a month, and I wanted to walk through your options so there's no last-minute rush.

**Option 1: Renew your current plan ([Current Plan Name])**
- [Key benefit/feature of current plan]
- [Price or renewal terms]
- Best if: [Scenario where current plan remains the right fit]

**Option 2: Upgrade to [Next Tier Plan Name]**
- Everything in your current plan, plus: [Upgrade features]
- [Price difference]
- Best if: [Scenario where upgrade adds value]

**Option 3: Custom plan**
- If your team's needs have changed significantly, we can put together something tailored.
- Reply or book time here: [Calendly Link]

**Since our last check-in:**
- [New feature/update 1]
- [New feature/update 2]
- [Metric improvement relevant to their usage]

**A few questions to help narrow down the right path:**
1. Has your team size changed since you started?
2. Are there new use cases you'd like to explore?
3. Is there anything holding you back from feeling confident about renewal?

Reply directly or book 15 minutes with me: [Calendly Link]

If you'd prefer to speak with someone on the Sales team about pricing or contract terms, just say the word and I'll connect you.

Best,
[Your Name]
Follow-up Specialist | [Company Name]

### Success Criteria

| Criteria | Target | Risk Flag |
|---|---|---|
| Email opened | > 60% | Yellow if < 45%, Red if < 35% |
| Reply or meeting booked | > 25% | Red if no response after 5 days |
| Renewal intent expressed | Positive or neutral | Red if negative |
| Sales handoff triggered (if warm) | Documented | Action required |
| Decision-maker engaged | Yes, or path identified | Yellow if reachable only via primary contact |

### Escalation Rules

| Signal | Action | Handoff |
|---|---|---|
| Positive renewal intent ("ready to renew") | Handoff to Sales-Lead immediately with full engagement history | **Sales-Lead** — create handoff issue |
| Questions about pricing/terms | Answer product questions only. Route pricing questions to Sales-Lead. | **Sales-Lead** for pricing discussions |
| Objections or concerns raised | Log details, attempt to address within 48 hours. Escalate if product-related to CTO, if relationship-related to CMO. | **CMO** or **CTO** depending on nature |
| No reply after 5 days | Send T-30 re-engagement | See below |
| Churn signal (negative sentiment, competitor mention) | Escalate immediately | **CMO + Sales-Lead** — create [KES-X] for account rescue |

### T-30 Re-Engagement (if no reply after 5 days)

**Subject:** Don't want you to miss out — renewal options inside

**Body:**

Hi [First Name],

I know things move fast — just wanted to make sure you saw my previous email about your upcoming renewal on **[Renewal Date]**.

**The short version:**
- Your current plan can be renewed as-is
- An upgrade path is available if your needs have grown
- A custom plan is always an option

**To make this easy, just pick one:**
- 🔄 **"Renew as-is"** — I'll connect you with Sales to process the renewal
- 📈 **"Tell me about upgrades"** — I'll send a comparison
- ⏰ **"Need more time"** — no problem, I'll check back at T-7
- ❓ **"Have questions"** — reply with them and I'll answer

I want to make sure you have everything you need before the renewal date arrives. Let me know how I can help.

Best,
[Your Name]
Follow-up Specialist | [Company Name]

---

## T-7 Days: Final Renewal Push

### Purpose

Create appropriate urgency. Make it easy to say yes. Handle last-minute concerns. Ensure no renewal slips through the cracks. If renewal won't happen, capture churn reason.

### Timing

- Send: 5-7 days before renewal date
- Best day: Monday, Tuesday, or Wednesday
- Best time: 9:00-10:00 AM local time
- Personal follow-up call: 3-4 days before renewal if no response

### Email Template

**Subject:** Final reminder — your [Product Name] renewal is this week

**Body:**

Hi [First Name],

Your [Product Name] plan renews on **[Renewal Date — day name, Month DD]** — that's just [X] days away.

**To renew, you have two options:**
1. **Reply to this email** with "Renew" and I'll connect you with Sales to process immediately
2. **Book 5 minutes** here: [Calendly Link] and we'll get it done together

**If you're still deciding, here's a quick recap:**

| Your Current Plan | What You've Achieved |
|---|---|
| [Plan Name] | [Metric or outcome 1] |
| [Renewal Price/Terms] | [Metric or outcome 2] |
| [Key feature] | [Metric or outcome 3] |

**What happens if we don't hear from you?**
Your access will continue until [Renewal Date], after which the account will be downgraded to our free tier and some features may be limited. But we'd love to keep your full access going.

**Still have questions?** Reply to this email and I'll personally make sure you get answers before the renewal date.

Best,
[Your Name]
Follow-up Specialist | [Company Name]

### Success Criteria

| Criteria | Target | Risk Flag |
|---|---|---|
| Email opened | > 65% | Yellow if < 50% |
| Renewal completed before expiry | Target > 85% | Red if < 70% |
| Reply rate | > 15% | Yellow if < 10% |
| Meeting booked | Tracked | Info only |
| Churn reason captured (if not renewing) | Required | Action if not captured |

### Escalation Rules

| Signal | Action | Handoff |
|---|---|---|
| Customer replies "Renew" or equivalent | Immediate handoff to Sales-Lead. Include full campaign history. | **Sales-Lead** — priority renewal processing |
| Customer requests more time /延期 | Log new proposed date, schedule follow-up. If > 30 days post-expiry, escalate. | **CMO** for exception approval |
| Customer explicitly declines renewal | Capture churn reason, log in CRM. Do NOT discount or negotiate pricing. | **CMO** — churn report + win-back sequence trigger |
| No response at all | Log as "No response — auto-downgrade." Flag for post-expiry re-engagement. | **CMO** for win-back campaign |

### T-7 Re-Engagement (if no reply after 3 days)

**Subject:** Last call — renewal closes [Renewal Date]

**Body:**

Hi [First Name],

This is my last email before your [Product Name] renewal date.

If you'd like to renew, the fastest way is to:
1. Reply "RENEW" to this email
2. I'll connect you with Sales immediately

If you've decided not to renew, I completely understand. A quick reply saying "Not this time" helps us improve — and we'll keep your data available for [X days] if you change your mind.

Either way, it's been a pleasure working with you.

Best,
[Your Name]
Follow-up Specialist | [Company Name]

---

## Post-Renewal: Welcome Back

### Purpose

Celebrate the renewal. Reinforce the decision. Transition back to ongoing nurture. Identify immediate next steps for maximum value.

### Timing

- Send: 1-2 days after renewal is processed
- Owner: Follow-up Specialist

### Email Template

**Subject:** Welcome back — here's what's next

**Body:**

Hi [First Name],

Great news — your [Product Name] renewal is confirmed! Thank you for continuing to trust us.

**Here's what happens next:**
- ✅ Your plan has been renewed through [New Renewal Date]
- ✅ Full access continues uninterrupted
- ✅ New features are available to you right now

**What's new since you renewed:**
- [Feature/Update available now]
- [Feature/Update coming soon]

**Quick question:** Is there a specific outcome you'd like to achieve in this new term? Reply and let me know — I'll make sure you're set up for success.

Welcome back — excited to see what we'll accomplish together.

Best,
[Your Name]
Follow-up Specialist | [Company Name]

---

## Post-Expiry: Win-Back Sequence

### Purpose

Re-engage customers who did not renew. Understand churn reason. Leave the door open for return. Maintain positive brand sentiment.

### Timing

| Touchpoint | Timing After Expiry |
|---|---|
| Win-Back Email 1 | 3 days post-expiry |
| Win-Back Email 2 | 14 days post-expiry |
| Win-Back Email 3 | 30 days post-expiry |
| Final closure | 60 days post-expiry → archive |

### Win-Back Email 1 (T+3 days)

**Subject:** We miss you — your account is still here

**Body:**

Hi [First Name],

Your [Product Name] account has been downgraded, but nothing is deleted — your data is safe for [X days].

If your situation has changed or you'd like to come back, we'd love to have you. Reply to this email and I'll personally help you get restarted.

No hard feelings either way — if you have a moment, I'd genuinely value hearing why [Product Name] wasn't the right fit right now. Your feedback helps us build a better product.

Best,
[Your Name]
Follow-up Specialist | [Company Name]

### Win-Back Email 2 (T+14 days) — Value Update

**Subject:** Since you left — here's what's changed

**Body:**

Hi [First Name],

Since you left, we've shipped a few updates I thought you'd want to know about:

- [New Feature 1]
- [New Feature 2]
- [Improvement 1]

If any of these resonate with your needs, come back for another look. Reply "Come back" and I'll set up a reintroduction call.

Best,
[Your Name]
Follow-up Specialist | [Company Name]

### Win-Back Email 3 (T+30 days) — Final Outreach

**Subject:** One last note

**Body:**

Hi [First Name],

This is my last outreach regarding your [Product Name] account.

Your data will be retained for [X more days] before being permanently deleted per our data retention policy.

If you'd like to return at any point, we'll be here. Our door is always open.

Wishing you the best,
[Your Name]
Follow-up Specialist | [Company Name]

---

## Automated Trigger Rules

| Event | Action |
|---|---|
| 90-day check-in completed (Green/Yellow) | Auto-create T-60 renewal campaign task (60 days before renewal date) |
| T-60 email sent | Auto-create T-30 renewal campaign task |
| T-30 email sent | Auto-create T-7 renewal campaign task |
| T-7 email sent | Auto-create Post-Renewal welcome task (if renewal happens) OR Win-Back task (if churn) |
| Reply with "Renew" or renewal intent | Auto-handoff to Sales-Lead, pause remaining campaign emails |
| Reply with churn signal/objection | Flag account Red, notify CMO + Sales-Lead |
| No reply to T-60 after 7 days | Auto-send T-60 re-engagement |
| No reply to T-30 after 5 days | Auto-send T-30 re-engagement |
| No reply to T-7 after 3 days | Auto-send T-7 re-engagement |
| Customer explicitly declines | Trigger win-back sequence at T+3 days |
| Customer requests延期 | Update renewal date in CRM, reset campaign timer |
| Red flag raised at any stage | Pause campaign, escalate to CMO + Sales-Lead immediately |

---

## Engagement Metrics & Targets

| Metric | Definition | Target |
|---|---|---|
| Campaign open rate | Unique opens / total sent across all 3 touchpoints | > 60% |
| Campaign reply rate | Unique replies / total sent | > 20% |
| Re-engagement recovery rate | Replies after re-engagement email / re-engagement sent | > 12% |
| Renewal completion rate | Renewals / campaign participants | > 85% |
| Sales handoff conversion | Handoffs that result in renewal | > 90% |
| Churn reason capture rate | Churn reasons logged / churned accounts | > 80% |
| Win-back success rate | Reactivations / win-back sequence sent | > 5% |

---

## Sequence Summary Card

| Touchpoint | Timing | Purpose | Key Action | Escalation |
|---|---|---|---|---|
| T-60 | D-58-62 | Awareness + value reinforcement | Send impact summary, invite feedback | Churn signal → CMO |
| T-60 Re-engagement | D-51-55 | Recover non-responders | Nudge with product updates | No reply → proceed to T-30 |
| T-30 | D-28-32 | Options presentation | Walk through renewal paths, schedule call | Renewal intent → Sales-Lead |
| T-30 Re-engagement | D-23-27 | Recover non-responders | Quick-choice email with clear CTAs | No reply → proceed to T-7 |
| T-7 | D-5-7 | Final push + urgency | Last call, make it easy to say yes | Decline → Win-Back, Renew → Sales-Lead |
| T-7 Re-engagement | D-2-4 | Last resort recovery | Urgent, direct, one-click renewal | No reply → downgrade + Win-Back |
| Post-Renewal | D+1-2 | Celebrate + re-onboard | Welcome back, set next-term goals | N/A |
| Win-Back 1 | D+3 | Immediate re-engagement | Soft re-open, ask for feedback | Churn reason → CMO |
| Win-Back 2 | D+14 | Value update | Share what's changed since churn | Re-activation → restart nurture |
| Win-Back 3 | D+30 | Final outreach | Data retention notice, door open | Archive at D+60 |

---

## Sales Handoff Package

When a lead signals renewal intent, hand off to Sales-Lead with:

1. **Customer summary:** Company, plan, team size, contract value
2. **Campaign engagement history:** All touchpoints, opens, replies
3. **Sentiment trend:** NPS scores, reply sentiment over time
4. **Feature adoption:** % of core features used, usage trend
5. **Support history:** Open/closed tickets in last 90 days
6. **Decision-maker info:** Who to contact, relationship strength
7. **Renewal path indicated:** As-is, upgrade, or custom
8. **Any objections or concerns raised:** Documented and unresolved

---

## Appendix: CRM Integration Notes

1. Renewal dates should be auto-populated from contract/plan data
2. Campaign touchpoints are date-based tasks per customer account
3. Tag customers with current campaign stage: `pre-renewal`, `t-60`, `t-30`, `t-7`, `renewed`, `churned`, `win-back`
4. Use health score field: `green` (on track), `yellow` (needs attention), `red` (at risk)
5. Log all email replies as CRM activities linked to the account
6. Auto-generate weekly "Renewals at Risk" report for CMO + Sales-Lead
7. Store campaign metrics in a dashboard (open rate, reply rate, renewal rate by cohort)
8. A/B test subject lines and CTAs per cohort; document winning variants
