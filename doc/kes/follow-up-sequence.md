# Follow-Up Sequence — 3-5 Touch Cadence for Non-Responders

**Owner:** Sales-Agent (KES)
**Version:** 1.0
**Last Updated:** 2026-05-15

---

## Overview

This document defines the follow-up cadence for leads who do not respond to the initial cold email outreach. The sequence spans **3 email touches + optional call touchpoints** over a 14-day window.

**Entry trigger:** Lead receives cold email and does not respond within 72 hours.

**Exit criteria:**
- Lead responds positively → transition to qualification/discovery
- Lead responds negatively → log objection or mark as cold
- Lead completes all 5 touches with no response → move to long-term nurture
- Lead opts out → immediately remove from sequence

---

## Sequence at a Glance

| Touch | Day | Channel | Purpose | Action |
|---|---|---|---|---|
| 1 | D+0 | Email | Cold email (initial outreach) | Per [Cold Email Template](/KES/doc/kes/cold-email-template.md) |
| 2 | D+3 | Email | Value-add follow-up | Share relevant content or insight |
| 3 | D+6 | Email | Social proof + case study | Show similar company success |
| 4 | D+9 | Phone call | Direct outreach attempt | Leave VM if no answer |
| 5 | D+12 | Email | Breakup / last attempt | Give clear opt-out, leave door open |

---

## CRM Fields Required

| Field | Source | Purpose |
|---|---|---|
| Sequence touch count | Auto-tracked | Determine next touch |
| Last touch date | Auto-logged | Cadence timing |
| Last touch type | Auto-logged | Channel |
| Lead response status | Manual | Branching logic |
| Lead score | CRM | Priority for call touches |

---

## Touch 2: Value-Add Follow-Up (D+3)

### Purpose

Provide value before asking again. Demonstrate expertise. Build credibility. No direct pitch.

### Timing

- Send: 72 hours after initial cold email (mid-week, 7:00-10:00 AM recipient timezone)
- If initial email was sent on Thu, bump to following Tue

### Email Template

**Subject:** A quick resource for [Topic relevant to their role]

**Body:**

Hi [First Name],

Quick follow-up — I wanted to share something that might be timely for you.

**[Resource Title / Blog Post / Case Study / Industry Report]**

[2-3 sentence summary of the resource and why it's relevant to their role or company]

A few highlights:
- [Key insight or data point from resource]
- [Practical takeaway they can apply]
- [Connection to what we discussed / their likely challenge]

No strings attached — just thought you'd find it useful.

If [Topic] is on your radar and you'd like to explore how [Company Name] fits in, I'm here.

Best,
[Your Name]
[Company Name]

---

## Touch 3: Social Proof + Case Study (D+6)

### Purpose

Build credibility through customer success stories. Reduce perceived risk. Make the solution tangible.

### Timing

- Send: 6 days after initial cold email (3 days after touch 2)

### Email Template

**Subject:** How [Reference Customer] achieved [Outcome]

**Body:**

Hi [First Name],

Following up one more time — I wanted to share how a company similar to yours is using [Company Name].

**Case Study: [Reference Customer Name]**

**[Industry/Company type] | [Team size] | [Use Case]**

**The challenge:**
[1-2 sentences on what they struggled with — match prospect's likely pain]

**The solution:**
[1-2 sentences on how they used our product]

**The results:**
- **[Metric 1]:** [X% improvement]
- **[Metric 2]:** [X hours saved]
- **[Metric 3]:** [ROI / revenue impact]

**[Full case study link]**

**Why this matters for [Prospect Company]:**
[1-2 sentences connecting the case study to the prospect's situation]

Would you be open to a brief conversation to see how this compares to what you're working on?

Best,
[Your Name]
[Company Name]

---

## Touch 4: Phone Call (D+9)

### Purpose

Direct personal outreach. Humanize the interaction. Break through email fatigue. Demonstrate genuine interest.

### Timing

- Call window: Day 9 after initial email (3 days after touch 3)
- Best days: Tue-Thu
- Best times: 9:00-11:00 AM or 1:30-3:30 PM local time
- Max 2 call attempts at different times of day

### Phone Script

**If they answer:**

"Hi [First Name], this is [Your Name] from [Company Name]. I sent you a few emails about [Topic] — wanted to see if the timing was right for a quick conversation.

I know you're busy, so I'll be brief: we help [Target Audience] [Core Benefit]. Given [Signal / Trigger for outreach], I thought this might be relevant.

Is [Topic] something you're thinking about right now?"

**Call flow:**
1. Wait for response
2. If interested → suggest next step (demo, discovery call, calendar link)
3. If neutral → offer to send specific resource first
4. If not interested → thank them, ask for feedback, note in CRM

**If voicemail:**

"Hi [First Name], this is [Your Name] with [Company Name]. I've been trying to reach you about [Topic]. I'll send one more email with a summary of how we might be able to help. If it's relevant to you, reply or book time here: [Calendly Link]. Otherwise, no worries — I won't continue reaching out. Take care."

**CRM logging requirements:**
- Call duration
- Contact reached (Y/N)
- Voicemail left (Y/N)
- Summary of conversation
- Next step agreed

---

## Touch 5: Breakup Email — Last Attempt (D+12)

### Purpose

One final, respectful attempt. Give a clear opt-out. Leave the door open for future. End the sequence gracefully.

### Timing

- Send: 12 days after initial email (3 days after phone call)
- This is the final touch in the standard sequence

### Email Template

**Subject:** Closing the loop

**Body:**

Hi [First Name],

I've reached out a few times and haven't heard back — I'll take that as a sign that timing isn't right, and I'll stop here out of respect for your inbox.

**A few ways to stay connected:**
- **[Monthly Newsletter]:** [Link] — relevant insights without sales
- **[Blog / Resource Hub]:** [Link] — learn at your own pace
- **Social:** [LinkedIn / Twitter link]

If your situation changes or [Topic] becomes a priority, my door is open. Just reply to this email and I'll pick up right where we left off.

Wishing you and [Company Name] all the best.

Best,
[Your Name]
[Company Name]

P.S. If you'd prefer I don't reach out again, just reply "Opt out" and I'll remove you immediately. No hard feelings.

---

## Response Branching Logic

| Prospect Response | Action | Next Step |
|---|---|---|
| Positive / Interested | Log in CRM, schedule discovery call within 48h | Transition to qualification |
| Positive but timing is wrong | Log as `lukewarm`, set re-engagement date (30/60/90 days) | [Re-engagement Template](/KES/doc/kes/re-engagement-template.md) |
| Request for specific info | Provide within 24h, log request type | Continue sequence or accelerate to demo |
| Objection raised | Log objection, respond per [Objection Handling Guide](/KES/doc/kes/objection-handling-guide.md) | Continue or pause based on objection severity |
| Negative / Not interested | Log reason, remove from cadence | Move to long-term nurture |
| Already evaluating competitors | Log competitive intel, adjust positioning | Consider [Competitive Cold Email Template](/KES/doc/kes/cold-email-template.md) |
| Bounce / Invalid | Remove, clean list | Update CRM |
| Opt out / Unsubscribe | Immediate removal | Log for list hygiene |

---

## Automated Trigger Rules

| Event | Action |
|---|---|
| Cold email sent (Touch 1) | Auto-create Touch 2 task at D+3 |
| Touch 2 sent | Auto-create Touch 3 task at D+6 |
| Positive reply at any touch | Cancel remaining automated touches, notify Sales-Agent |
| Opt-out at any touch | Immediately remove from all future touches |
| Touch 4 call completed | Auto-schedule Touch 5 email at D+12 (unless positive response) |
| Sequence completed (no response) | Move lead to `long-term nurture` status, tag `cold-outreach-complete` |
| Lead re-engages (opens email or visits site) after dormant | Flag for manual review |

---

## Success Metrics & Targets

| Metric | Definition | Target |
|---|---|---|
| Sequence completion rate | Leads completing all 5 touches | < 60% (want earlier conversion) |
| Reply rate per touch | Replies / sent per touch | Touch 2 > 8%, Touch 3 > 12%, Touch 5 > 5% |
| Positive conversion rate | Positive / total replies | > 30% |
| Call connect rate | Calls answered / calls attempted | > 20% |
| Opt-out rate | Opt-outs / total in sequence | < 5% |
| Time-to-conversion | Days from first email to positive response | < 10 days |
| Overall sequence conversion | Positive responses / leads entered | > 8% |

---

## Escalation / Pause Rules

| Signal | Action | Handoff |
|---|---|---|
| Lead requests call with manager or executive | Escalate to Sales-Lead | Sales-Lead handles call |
| Lead mentions competitor evaluation with strong competitor preference | Flag as competitive deal | Sales-Lead review |
| Lead is a named account / strategic priority | Manual handling only — bypass standard sequence | Sales-Lead |
| Sequence completes with no response | Move to long-term nurture | [Re-engagement Template](/KES/doc/kes/re-engagement-template.md) at D+90 |
