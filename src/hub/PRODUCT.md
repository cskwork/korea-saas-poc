# Product

<!-- impeccable:product-schema 1 -->

> Source note: written without a live interview (unattended run, 2026-09-24). Facts are inferred from the
> repository (the legacy `pocs/index.html` catalogue, the ten POC READMEs) and from the owner's request to
> ship all ten POCs as one production deployment. Items marked (assumption) were not confirmed by the owner.

## Platform

web

## Users

- **Primary: a visitor evaluating one-person Korean SaaS business models** — a would-be solo founder, a
  collaborator, or someone the owner sends the link to. They arrive from a shared link, usually on a phone
  (assumption), want to understand what the ten models are, and open the ones that interest them.
- **Secondary: the owner**, who uses the page as the front door of the portfolio when presenting the work.

## Product Purpose

The hub is the front door to ten working SaaS products, each a different business model a single person can
run in Korea with AI (content agency, SmartStore dropshipping, reservation micro-SaaS, online courses,
affiliate marketing, automation agency, paid newsletter, AI design/video studio, dev freelancing, niche
community). Success: within seconds a visitor knows these are real, usable products (not slides), can tell the
ten apart, and opens one.

## Positioning

Every entry opens a working product, not a mock-up: each visitor gets a private demo workspace with its own
data that they can change and reset. Ten products share one platform (one deployment, one database) while each
keeps its own identity.

## Operating Context

- Entry: shared link → hub → a product (`/<slug>`) → back to the hub.
- Each product seeds sample data on first visit; nothing a visitor does affects anyone else.
- Catalogue data (name, category, tagline, description, audience, signature colour) comes from each module's
  `meta.ts` via `src/pocs/registry.ts`; the hub must render whatever the registry holds, in its order.

## Capabilities and Constraints

- Ten modules today; the catalogue must accept more without redesign (extensible architecture is a stated goal).
- Korean UI. Product names mix Korean and Latin (예약잇다, DevFlow, AutoMate Pro).
- The hub has no data of its own and needs no database.

## Evidence on Hand

- The ten products themselves (live routes) and their catalogue metadata.
- No real customers, revenue, testimonials or usage numbers exist. The legacy READMEs state revenue _targets_
  ("월 최대 1,500만원" etc.); these are goals, not results, and must not be presented as achievements.

## Product Principles

1. Show the products, don't describe the category: the page proves that ten real tools exist.
2. Ten identities, one door: each product keeps its own colour and voice; the hub stays the frame.
3. Honest demo: sample data is labelled as sample; no invented traction.
4. Built to grow: an eleventh product slots in without layout surgery.

## Accessibility & Inclusion

WCAG AA contrast, keyboard navigation through every entry, readable at phone width (assumption: standard AA).
