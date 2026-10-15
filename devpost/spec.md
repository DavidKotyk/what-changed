---
doc: spec
status: approved
approval_basis: autonomous implementation authorized; technical choices below are agent choices, not attributed to learner
---
# What Changed? — Technical Spec
## How This Works, In Plain Language
The browser reads two documents and a saved checklist. It locates the section named in each step, or looks for shared meaningful words. It copies the actual passages into a review card, compares their text, and labels weak or missing evidence uncertain. A person decides whether to revise a step. No model invents a summary or replacement instruction.
## The Core Journey Through the System
PRD ref: prd.md > The Core Journey. Text inputs → bounded validation → section parser → retrieval per step/version → conservative category → evidence cards → in-memory human decisions → JSON download. Explicit save persists only the checklist.
## Stack
Agent choice: dependency-free JavaScript ES modules, HTML, CSS. Node >=20 supplies local HTTP server and built-in tests. No runtime external service, key or model. Docs: https://nodejs.org/api/http.html and https://nodejs.org/api/test.html ; browser APIs https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage .
## Where It Runs and How Someone Tries It
Run `npm start`, open http://127.0.0.1:4173 . `npm test` runs engine tests and `npm run evaluate` writes a transparent baseline report. Desktop browser on M1 Mac; current Chrome/Safari targeted. Public repo and public under-three-minute video still require user approval to publish.
## Look and Feel
Implements prd.md > Look and Feel using CSS variables, system fonts and responsive grid. No remote fonts, trackers, images or analytics.
## Components
### Evidence engine
Implements prd.md > Step-linked evidence and Review categories. Parse Markdown headings into sections (or nonempty lines without headings), retain exact text offsets and line numbers. Explicit [heading] anchors require a unique exact heading on each side. Otherwise score token coverage using a small stopword list; prefer stronger overlap and require a margin over second-best. Changed passage means normalized text differs, not semantic entailment. Detect example/illustrative/nonbinding language and flag uncertainty. Retrieval is independently performed on both versions; changed headings may become missing evidence.
### Review workspace
Implements prd.md > Screens and Layout and Saved procedure and decisions. Safe DOM rendering via textContent. Inputs invalidate reports immediately. Filters never remove results from exports. localStorage exceptions handled.
### Baseline and export
Implements prd.md > Raw diff and export. LCS line diff bounded by line count with explicit fallback for large documents. Export complete source text, evidence, decisions, engine version and limitations; no automatic procedure rewrite.
### Local server
Serve only known project app assets from loopback. No upload endpoint, no document logging. Browser computation stays local.
## Data Model
Input strings old/new/checklist in memory. Step: id, text, optional anchor. Evidence: text, start/end offsets, start/end lines, heading, score/reason, ambiguous flag. Result: step, before/after evidence or null, category, reasons. Review decision and note keyed by current step id; discarded upon input edits/recompare. localStorage key `what-changed.procedure.v1` stores only procedure text.
## File Structure
```
index.html                 # workspace skeleton
src/engine.js              # parsing/retrieval/categories/diff
src/app.js                 # safe rendering, saved procedure, export
src/style.css              # responsive design
src/demo.js                # explicitly synthetic documents
scripts/serve.js           # loopback static server
scripts/evaluate.js        # baseline and measured fixtures
 tests/engine.test.js      # built-in Node tests
 devpost/                  # plans, build checklist, app map
 docs/                     # rules evidence, limitations, submission preparation
 demo/                     # recording script and video artifacts
```
## External Services and Dependencies
None at runtime. Devpost Skill Pack installed from challengepost/learn-ai-basics; source commit recorded in docs/workflow.md. Development tooling for browser checks/recording may be used locally; no paid service or large model authorized.
## Important Failure Modes
Missing evidence → uncertain and blank missing side. Duplicate headings/near ties → uncertain with candidates described. Lexical overlap with an example → uncertain. Plain-text semantic changes/synonyms → possible misses, disclosed. Very large diff → explicit baseline fallback.
## What Was Simplified and Why
Bounded document formats keep source evidence verifiable; no extraction service. Deterministic lexical matching avoids unsupported generative conclusions. Manual anchor notation improves traceability while preserving automatic unanchored retrieval. No claim that this is semantic AI at runtime; contest uses AI-assisted development.
## Decisions and Open Issues
Main engineering uncertainty: lexical matches can look strong while being nonbinding examples or incorrect topics. Investigate with misleading-wording fixtures and report false positives/misses rather than hiding them. This is an agent-identified risk, not an invented learner uncertainty. Final browser verification, video recording, user review and publication approval remain open.
