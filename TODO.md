# PRIS MVP outcomes

## Contact workspace and persistence
- I can add a person with a name, LinkedIn URL, role, company, tags, and notes.
- The record persists after reloading the application.
- I can edit and delete contacts and related records.
- The contact directory supports search and filtering by relationship state, industry, role, tags, conversation status, and follow-up.

## Evidence-backed person intelligence
- I can enter professional information, source URLs, excerpts, review dates, and verification labels.
- The system distinguishes verified information, user-provided information, inferences, unknowns, and outdated information.
- If no source is available, the interface reports not verified rather than inventing facts.
- LinkedIn URLs remain manual references and inaccessible pages have a manual-input fallback.

## Drafting and human control
- The system uses the contact context and my professional profile to generate a relevant introduction and explains why it is appropriate.
- Every draft is editable, can be copied, and is visibly separate from a sent message.
- No external message is sent without explicit user action.

## Conversation intelligence
- I can record an outgoing or incoming interaction with date, channel, direction, text/summary, and context.
- The latest response appears in chronological history.
- Analysis evaluates evidence, openness, engagement, reciprocity, relevance, opportunity signals, boundaries, uncertainty, relationship state, next action, timing, and optional draft.
- A polite acknowledgement does not trigger a referral request.
- A clear no-contact request causes a stop recommendation.
- If the user owes a promised reply, the system prioritizes that commitment.
- Low-confidence or insufficient-evidence cases are shown honestly and can be retried.

## Relationship workflow
- Relationship state is separate from conversational openness and opportunity signal.
- I can review and approve, reject, or defer a recommendation.
- Approved state changes create state-history records.
- I can schedule, complete, reschedule, or dismiss a follow-up; the dashboard reflects current status.
- Dashboard counts are calculated from actual persisted records, not fabricated activity.

## Profile and value matching
- I can maintain a user-provided professional profile with qualified skills, career interests, preferences, and disclosure boundaries.
- I can maintain a verified project library with evidence, tools, limitations, URLs, intended audience, and relevant industries.
- A recommended project share explains recipient-specific relevance and does not invent outcomes or capabilities.

## Data portability and platform boundaries
- I can export contacts, interactions, evidence, analyses, projects, follow-ups, profile data, and state history.
- API keys are not present in frontend code.
- Built-in Manus AI is used server-side; external paid APIs are not required for the core MVP.
- Unsupported or incomplete integrations are labeled clearly; no LinkedIn automation or private-message collection is implemented.

## Public shared-workspace access
- The PRIS interface opens without Google sign-in or any login gate.
- All visitors share the existing workspace identity and can view, create, edit, and delete workspace records.
- The interface clearly labels the workspace as shared so visitors understand that changes are visible to everyone.
