# Domain docs

Use one domain context for this repository.

## Before exploring

Read `docs/improvements/CONTEXT.md` if it exists and relevant decisions under `docs/improvements/adr/` if present. Also read any existing root `CONTEXT.md`, `CONTEXT-MAP.md`, or `docs/adr/` relevant to the work. If a referenced context or decision document is absent, continue; create it lazily when a domain term or architectural decision has actually been resolved.

Use the domain glossary's vocabulary in issues, proposals, tests, and code. When a needed concept is missing, record the gap or reconsider the term. If a proposal conflicts with an existing decision, name the decision and explain why reopening it is justified.

## Layout for new improvement documentation

- Domain glossary and context: `docs/improvements/CONTEXT.md`.
- Architectural decisions: `docs/improvements/adr/NNNN-<decision>.md`.
- Setup configuration: `docs/improvements/agents/`.
- Local tracker: `docs/improvements/tracker/`.

Keep existing context and decisions in place; use links rather than copying them into this layout.
