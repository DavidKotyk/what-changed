---
doc: prd
status: approved
approval_basis: autonomous implementation authorized in user objective; agent assumptions are labeled below
---
# What Changed? — Product Requirements
Source: scope.md > The Unique Kernel and The POC Boundary.
## The Core Journey
1. Open the local app; understand its purpose and privacy boundary.
2. Load the clearly labeled synthetic example or paste old and new documents.
3. Enter one procedure step per line; optional [Section heading] binds a step to a source section. Save explicitly in this browser.
4. Compare; see counts and a step queue. Select a step to inspect exact old/new passages with line numbers and the matching rationale.
5. Filter by review category, record a human decision and note, and export a JSON evidence report. Open the raw line diff for comparison.
## Screens and Layout
Agent-selected: one workspace, a collapsible inputs panel above a two-column review desk. Left: filterable checklist. Right: selected step, reasoning, paired evidence, human decision. Header: brand, local-only indicator, export. Mobile: stack columns; horizontal scrolling confined to long source text.
## Look and Feel
Agent-selected under autonomy: warm neutral paper, dark ink, teal buttons, restrained amber review badges, serif display heading and system sans body. Status communicated through words as well as color. Visible keyboard focus, labeled inputs, native form elements.
## Features and Behavior
### Document inputs
Editable old/new Markdown or plain text, bounded at 80,000 characters each and 100 checklist lines. Optional UTF-8 .txt/.md import. Demo overwrites only after a warning if input differs from the demo. Empty inputs produce actionable errors.
### Step-linked evidence
Implements scope.md > The Unique Kernel. Exact text and line numbers from each version, with a visual highlight over the changed span (which may include unchanged text between multiple edits). Anchored sections matched by heading; unanchored steps use conservative lexical retrieval. Each result explains its basis. A missing side has no fabricated quote. Duplicate anchors, weak matches and potentially misleading examples require verification.
### Review categories
“Review change”: a confidently located passage differs; no claim that the instruction must change. “Text unchanged”: confidently located passages match after whitespace normalization; no semantic certification. “Uncertain”: missing/ambiguous/weak or potentially misleading evidence. Every step remains available, including unchanged steps.
### Saved procedure and decisions
Explicit Save stores checklist only in localStorage; documents and decisions stay in memory. Clear saved procedure removes that local copy. Decisions: unreviewed, revise, keep, investigate; note text is reviewer-authored. Recompare clears decisions to avoid carrying them onto different evidence. Input edits invalidate results and disable export until recompare.
### Raw diff and export
Simple line LCS diff available alongside the checklist view. JSON contains input documents, exact evidence locations, categories, matching reasons and reviewer decisions. Explain that downloaded files include document contents.
## States and Boundaries
First use: synthetic demo available with a single click, never presented as real customer evidence. No match: uncertainty, not an empty success. Storage unavailable: visible message; comparison still works. No network requests from the app. Source content rendered as text, never executed as HTML. Oversize input: reject, never silently truncate.
## Product Decisions
User decisions: exact passages from both versions, uncertainty, saved checklist, clear demo, tests for misleading wording and baseline comparison. Remaining UI and implementation decisions are agent assumptions under autonomous authorization.
## What We're Building
The complete core journey, tests, publication-ready local repository, short demo video and draft submission materials.
## Deferred From the POC
Semantic entailment, multilingual support, PDF/DOCX import, collaborative review and automated rewriting. They require substantially different evidence and validation.
## Non-Goals
No correctness certification, unproven novelty claim, invented recommendation, live policy fetching or cloud document storage.
## Open Questions
Whether the user prefers another visual style can be answered at final review; it does not block authorized implementation. User hands-on feedback and publication approval remain pending until actually received.
