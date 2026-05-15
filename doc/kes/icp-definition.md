# Ideal Customer Profile (ICP) Document

**Owner:** Lead-Generation (KES)
**Version:** 1.0
**Last Updated:** 2026-05-15

---

## Overview

This document defines the Ideal Customer Profile for KES. Every outbound prospect is scored against these criteria before entering the pipeline. Leads that fall outside acceptable thresholds are deprioritized or routed to long-term nurture.

**Purpose:** Ensure outbound effort is concentrated on accounts with the highest likelihood of conversion, highest lifetime value, and strongest fit with KES's product and business model.

---

## ICP Pillars

| Pillar | Weight | Description |
|---|---|---|
| Firmographic | 30% | Company size, industry, revenue, location |
| Technographic | 20% | Current tech stack, tool maturity, integration needs |
| Authority & Role | 20% | Decision-maker access, buyer persona match |
| Intent & Timing | 15% | Active projects, budget cycle, expressed pain |
| Fit & Values | 15% | Culture match, partnership potential, innovation appetite |

---

## Tier 1: Core ICP (Highest Priority)

### Firmographic Criteria

| Criterion | Minimum | Ideal | Acceptable |
|---|---|---|---|
| Company size (employees) | 50 | 200-1,000 | 20-50 or 1,000-5,000 |
| Annual revenue | $10M | $50M-$500M | $5M-$10M or $500M+ |
| Industry | B2B SaaS, Fintech, Healthtech, E-commerce | Same as left | B2B services, Edtech, Logistics |
| Headquarters | North America, Western Europe | Same as left | APAC, LATAM |
| Growth stage | Series A+ or profitable bootstrapped | Series B-D | Pre-seed/Seed (lower priority), Public |
| Tech budget | $50K+/year on SaaS | $200K+/year | $10K-$50K/year |

### Technographic Criteria

| Signal | Ideal | Acceptable |
|---|---|---|
| Uses modern tech stack (cloud, API-first) | Yes — demonstrated via job postings, engineering blog | Mixed — some modern, some legacy |
| Has in-house engineering team | 5+ engineers | 1-4 engineers |
| Uses complementary tools (CRM, analytics, workflow automation) | Uses 2+ tools in adjacent categories | Uses 1 adjacent tool |
| Has a data/analytics function | Dedicated data team or BI lead | Data function outsourced or project-based |

### Decision-Maker Personas

**Primary: Head of Product / VP Engineering / CTO**

| Attribute | Description |
|---|---|
| Title | Head of Product, VP Engineering, CTO, Director of Engineering |
| Reporting line | CEO, COO, or Board |
| Budget authority | Yes — can approve up to $50K, influences larger |
| Pain points | Engineering velocity, team productivity, tool sprawl, integration debt |
| Goals | Ship faster, reduce overhead, consolidate toolchain, improve developer experience |
| Information sources | Tech blogs, Hacker News, industry newsletters, peer recommendations |
| Objection profile | Technical rigor, ROI proof, integration complexity, security |

**Secondary: Head of Sales / CRO / VP of Growth**

| Attribute | Description |
|---|---|
| Title | VP Sales, CRO, Head of Revenue, Director of Growth |
| Reporting line | CEO or Board |
| Budget authority | Yes — can approve up to $30K, influences larger |
| Pain points | Sales efficiency, lead conversion, reporting accuracy, tool fragmentation |
| Goals | Increase pipeline velocity, improve forecasting, reduce churn, scale revenue operations |
| Information sources | Sales blogs, LinkedIn, peer networks, industry events |
| Objection profile | ROI timeframe, implementation disruption, team training cost |

### Intent & Timing Signals

| Signal | Score Boost | Source |
|---|---|---|
| Recently raised funding (Series A+) | High | Crunchbase, PitchBook |
| New VP/Director-level hire in target role | High | LinkedIn, press releases |
| Job postings for roles our product supports | Medium | LinkedIn, company careers page |
| Competitor usage detected (scraping, integrations) | Medium | BuiltWith, manual research |
| Active G2/Capterra search in our category | High | Intent data provider |
| Relevant conference attendance or speaking | Medium | Event websites, speaker lists |
| Recent thought leadership content on pain point | Low | Blog, social media |

---

## Tier 2: Expanding ICP (Next Priority)

Used when Tier 1 pipeline is healthy and capacity allows broader outreach.

| Criterion | Threshold |
|---|---|
| Company size | 20-49 or 1,000-5,000 employees |
| Revenue | $5M-$10M or $500M+ |
| Industry | B2B services, Edtech, Logistics |
| Geography | APAC, LATAM |
| Growth stage | Pre-seed/Seed (strong product-market fit) |
| Tech maturity | Legacy but actively modernizing |
| Decision-maker access | Champion-level (manager/director) with path to exec |

---

## Negative Fit Indicators (Deprioritize)

Any single red flag or two+ yellow flags move account to nurture-only.

| Red Flags | Yellow Flags |
|---|---|
| Industry: Government, Defense, Non-profit (unless explicit mission fit) | Revenue < $5M |
| No engineering team | No active tech hiring in 6+ months |
| Current contract lock with direct competitor (12+ months remaining) | Heavy customization requirements |
| History of failed SaaS implementations | Procurement process > 6 months |
| Strong negative brand signals (layoffs, funding crisis, regulatory action) | Recently acquired or in active M&A |
| Geographic region with restrictive data laws (no local entity) | Single point of contact risk |

---

## ICP Scoring Matrix

Score each account against the ICP framework. Weighted sum determines priority tier.

| Criterion | Points | Weight | Max Score |
|---|---|---|---|
| Company size match | 0-10 | 10% | 1.0 |
| Industry match | 0-10 | 10% | 1.0 |
| Revenue match | 0-10 | 5% | 0.5 |
| Tech stack fit | 0-10 | 15% | 1.5 |
| Decision-maker access | 0-10 | 15% | 1.5 |
| Pain/intent signal strength | 0-10 | 15% | 1.5 |
| Buyer persona match | 0-10 | 10% | 1.0 |
| Budget authority signal | 0-10 | 10% | 1.0 |
| Negative fit (penalty) | -10 - 0 | 10% | -1.0 |

**Score thresholds:**
| Range | Tier | Action |
|---|---|---|
| 7.0 - 10.0 | Tier 1 (Core) | Immediate outreach — highest priority |
| 4.0 - 6.9 | Tier 2 (Expanding) | Sequence outreach — standard cadence |
| 2.0 - 3.9 | Tier 3 (Nurture) | Long-term nurture — no direct outreach |
| < 2.0 | Reject | Exclude from pipeline |

---

## ICP Lifecycle & Review

| Event | Action | Owner |
|---|---|---|
| New product launch or pivot | Review and update ICP within 2 weeks | Lead-Generation + CMO |
| Quarterly business review | Validate ICP against conversion data. Update weights if needed. | Lead-Generation + Sales Lead |
| Market shift (new competitor, regulation, economic change) | Assess impact on ICP. Update scoring thresholds as needed. | Lead-Generation + CMO |
| Closed-won analysis (quarterly) | Analyze shared traits of won deals. Strengthen ICP where patterns emerge. | Sales Lead + Lead-Generation |
| Closed-lost analysis (quarterly) | Analyze shared traits of lost deals. Adjust negative fit indicators. | Sales Lead + Lead-Generation |

---

## CRM Integration

| ICP Field | CRM Mapping | Auto-populated? |
|---|---|---|
| ICP Tier | Lead score category | Yes (calc on enrichment) |
| ICP Score | Custom lead field | Yes (calc on enrichment) |
| Firmographic match | Account-level field | Yes (enrichment) |
| Technographic match | Account-level field | Manual (researcher) |
| Decision-maker access | Contact-level field | Manual (researcher) |
| Intent signals | Activity log | Yes (intent provider) |
| Negative fit flags | Account-level tags | Manual (researcher) |

---

## References

- [Cold Email Template](/KES/doc/kes/cold-email-template.md) — uses ICP fit check before sending
- [Target Account List Template](/KES/doc/kes/target-account-list.md) — scored account pipeline
- [Lead Handoff Process](/KES/doc/kes/lead-handoff-process.md) — qualified lead routing to Sales
- [Outbound Prospecting Sequence](/KES/doc/kes/outbound-prospecting-sequence.md) — full outbound cadence
