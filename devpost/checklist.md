---
doc: checklist
status: approved
approval_basis: autonomous implementation authorized by user; no separate learner sign-off claimed
---
# Build Checklist
Build mode: fast, adapted to explicit autonomous work instruction (docs/workflow.md).
## Slices
- [x] **1. Compare a synthetic policy against procedure steps with exact evidence**
  Becomes usable: Local app shows changed, unchanged and uncertain step cards with both passages.
  Why now: Proves the unique kernel before polish and shipping work.
  PRD ref: `prd.md > Step-linked evidence`, `prd.md > Review categories`
  Spec ref: `spec.md > Evidence engine`, `spec.md > Review workspace`
  Build: Scaffold app, parser, retrieval, uncertainty, demo, source cards and tests.
  Verify (mechanical): `npm test`; start server and browser-check synthetic comparison.
  Learner check: Load demo; inspect deadline change, unchanged return instruction, missing archive and misleading example.
  Commit: `Build step-linked document evidence review`
- [x] **2. Save procedures, record decisions and export a review**
  Becomes usable: Complete repeatable review journey with saved checklist and evidence export.
  Why now: Adds useful review workflow on verified evidence.
  PRD ref: `prd.md > Saved procedure and decisions`, `prd.md > Raw diff and export`
  Spec ref: `spec.md > Review workspace`, `spec.md > Baseline and export`
  Build: Storage, decision notes, filters, diff, import/export, input invalidation and responsive polish.
  Verify (mechanical): Engine tests; browser checks persistence, edited-input invalidation, filter, decisions, export, mobile layout.
  Learner check: Save, reload, compare, choose a decision, export, edit input and confirm stale results clear.
  Commit: `Complete saved procedure and review export workflow`
- [ ] **3. Package reproducible evidence and a short working demonstration**
  Becomes usable: Publication-ready repository, baseline evaluation, video and draft submission.
  Why now: Present and substantiate the completed function.
  PRD ref: `prd.md > What We're Building`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`
  Build: README, license, evaluation, limitations, app map, recording and submission preparation.
  Verify (mechanical): Fresh startup/tests/evaluation; inspect video duration and rendered footage; audit tracked files/history.
  Learner check: Review running app, video, draft and exact publication actions before approval.
  Commit: `Prepare verified demo and contest submission materials`
## Hands-on Checkpoints
- [ ] User exploration/feedback pending; agent checks are not learner feedback.
- [ ] Final kick-the-tires exploration and feedback completed.
## Final Review
- [ ] Final review complete — feedback resolved and learner confirms ready to ship.
## Code Tour and App Map
- [ ] Reference map generated, verified and shown.
- [ ] Brief evidence-based recap delivered; no hands-on learning claimed.
Optional edit/reflection not requested, per autonomy preference. No learner survey response fabricated.
## Revisions
- Initial implementation also included saving, decisions and export so the browser could exercise the complete journey immediately. Slice 2 retains the independent workflow verification and polish checkpoint.

Browser verification: Chrome 155, ten assertions covering input errors, exact evidence, categories, filter, export, persistence, invalidation, literal HTML, mobile overflow, exceptions and external requests. Results in docs/browser-check.json (copied from local artifact). No learner feedback inferred.
