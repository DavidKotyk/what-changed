---
doc: scope
status: approved
approval_basis: user-provided objective and explicit authorization to implement autonomously; no separate review claimed
---
# What Changed?
Compare two document versions against a saved checklist, with inspectable evidence.
## The Unique Kernel
A text diff tells you which words moved. This app connects those passages to the procedure steps a person maintains, preserving uncertainty and both source passages.
## Who It's For
Implementation assumption: an operations coordinator who maintains a small team's procedures when a reference policy changes. Current alternative: read a diff and manually cross-reference a checklist.
## The Core Loop
Paste two versions and a checklist → compare → inspect each step's evidence → record a review decision → export the review. Save the checklist locally for the next revision.
## Inspiration & Identity
User asks for a polished interface and a clear, useful demonstration. Agent design choice: a calm editorial review desk, warm paper background, ink typography, teal actions and amber uncertainty.
## Why This Matters to the Learner
User requests a competitive contest entry that honestly reports limitations; no personal motivation inferred.
## What "Working" Looks Like
A synthetic shipping policy changes a deadline. The associated checklist step shows the precise old/new passages. An unchanged step remains visible. A removed passage and misleading example are marked uncertain. A reviewer exports the evidence and decisions.
## The POC Boundary
Local English plain-text/Markdown documents; saved checklist; conservative passage retrieval; review statuses; exact quotations; a simple line-diff baseline; JSON review export; reproducible tests and demonstration.
## Later
PDF extraction, semantic models, teams, revision history, rich document formats.
## Explicitly Cut
Automatic procedure rewriting: would invent intent. Compliance certification: evidence is insufficient. Accounts and hosted services: unnecessary for the local core loop. Runtime generative AI: no paid services or large downloads authorized; deterministic comparisons remain auditable.
