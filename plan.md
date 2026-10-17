# Professional Relationship Intelligence — MVP Plan

## Product boundary

PRIS is a private, single-user relationship decision-support workspace. It stores selected professional contacts, user-provided context, permitted public-source evidence, manual interactions, AI interpretations, verified projects, and follow-ups. It never sends messages, scrapes LinkedIn, reads private messages, or converts uncertain signals into facts.

## Implementation approach

- **Frontend:** React + Wouter + Tailwind, with a calm editorial workspace shell: left navigation, focused content column, right-side context rail where useful.
- **Backend:** Express + tRPC. All mutations and reads use the authenticated Manus user as the owner; no data is shared across users.
- **Database:** Managed MySQL through Drizzle. Relational tables cover contacts, evidence, interactions, analyses, projects, profile, follow-ups, and state history. JSON columns are used only for bounded structured AI results and tags.
- **AI:** Built-in Manus LLM through the server-only `invokeLLM` helper using `gpt-5-mini`, structured JSON schemas, validation, and explicit failure states. No external LLM or research API key is required. AI receives only the minimum professional context needed for the requested operation.
- **Research:** Phase-one manual evidence capture. Users can add public source URL, title, excerpt, claim, source type, review date, and verification label. LinkedIn URLs remain references; the app never claims to have accessed them.
- **Persistence:** The managed database is the source of truth. The UI invalidates tRPC queries after writes. Export produces a JSON file from persisted records.

## Core end-to-end workflow

1. Create or edit a contact.
2. Add user-provided evidence and research notes.
3. Generate a person intelligence card from the contact and evidence.
4. Generate a first introduction for human review.
5. Record the exact message manually sent.
6. Capture a response or other interaction.
7. Analyze the latest interaction in context.
8. Review one recommended next action, optional draft, evidence, uncertainty, and timing.
9. Approve/reject/defer the recommendation and optionally confirm a relationship-state change.
10. Schedule or complete a follow-up and review the dashboard.

## Data model

`contacts`, `evidence_items`, `interactions`, `analyses`, `projects`, `value_matches`, `follow_ups`, `state_history`, `profile`, and `users`. Every person-specific claim is user-provided, verified from an entered source, inference, unknown, or outdated. Interaction history is append-only from the user's perspective; edits preserve the actual content and dates.

## UI structure

- `/` Dashboard: actual record counts, action queue, recent activity, pipeline snapshot, follow-ups.
- `/contacts`: searchable/filterable directory and add contact dialog.
- `/contacts/:id`: relationship workspace with overview, intelligence, evidence, timeline, analysis, next action, value matches, and follow-up controls.
- `/pipeline`: relationship-state lanes with counts and compact contact cards.
- `/profile`: professional profile, skills, career context, communication preferences.
- `/projects`: verified project library with relevance and caveat fields.
- `/follow-ups`: follow-up queue with complete/reschedule actions.

## Design direction

- **Design movement:** Editorial operations desk — the quiet rigor of a research notebook combined with a premium modern CRM.
- **Core principles:** evidence is visible; hierarchy beats decoration; actions are calm and reversible; empty states teach the workflow.
- **Color philosophy:** warm paper background, ink text, slate structure, and one ownable moss/teal accent for focus. Amber signals review and muted red is reserved for boundaries.
- **Layout paradigm:** persistent left rail + wide working canvas + contextual side panels, with generous whitespace and list-to-detail transitions instead of a centered card grid.
- **Signature elements:** evidence chips with provenance labels; vertical interaction timeline; compact “next move” cards with confidence and timing.
- **Interaction philosophy:** every AI output has a visible rationale, evidence, uncertainty, and explicit user decision. Drafts are visually distinct from sent records.
- **Animation:** short 160–220ms fades and slide-ins for drawers/toasts; no looping ornament or attention-seeking motion.
- **Typography:** Instrument Sans for UI/body and Fraunces for editorial headings; large numerals for dashboard counts, compact uppercase labels for provenance.
- **Brand essence:** “A thoughtful operating system for professional relationships.” Personality: grounded, perceptive, humane.
- **Brand voice:** direct, specific, non-salesy. Example lines: “Know what is true before you personalize.” / “Choose the next move — or choose to wait.”
- **Wordmark/logo:** PRIS mark as two offset brackets forming a quiet bridge, paired with a compact wordmark.
- **Signature brand color:** deep moss `#47645A` — signals steadiness, judgment, and human context.

## Project structure

- `client/src/App.tsx`: route map and app shell.
- `client/src/pages/`: dashboard, contacts, workspace, pipeline, profile, projects, follow-ups.
- `client/src/components/`: shared shell, badges, modals, timeline and form primitives.
- `client/src/lib/`: tRPC client and display helpers.
- `drizzle/schema.ts`: relational application schema.
- `server/db.ts`: database access helpers.
- `server/ai.ts`: prompt contracts, structured LLM calls, safe parsing.
- `server/routers.ts`: CRUD, dashboard, export, and AI procedures.
- `public/manus-routes.json`: complete route manifest.

## Deferred

Browser automation, LinkedIn scraping, private-message sync, external enrichment APIs, n8n, team features, billing, multi-tenant architecture, complex scoring, and commercial Arowai packaging.
