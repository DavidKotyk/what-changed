# What this review does—and cannot establish

## Evidence contract
Every displayed nonempty quote is an exact slice of an input document with JavaScript string offsets and one-based start/end line numbers. Rendering uses text nodes. Visual highlights partition that exact text without changing it. Highlights can include unchanged words between separate edits.

Explicit [Section heading] anchors choose a passage by source heading, not by the truth of the procedure. Unanchored steps use unique-word coverage: at least two shared words, coverage >= 0.30 for a candidate; >= 0.60 and a margin >= 0.15 over the next candidate for a strong match. These are engineering heuristics, not calibrated confidence probabilities. No confidence percentages are shown.

“Review change” means located text differs after whitespace normalization. Case, negation, numbers and punctuation remain meaningful. “Text unchanged” only describes the located passage, which can still be irrelevant to or contradict the checklist. “Uncertain” is a request to investigate. Missing evidence never produces a fabricated quote or rewrite.

## Known failure cases
The diagnostic set deliberately retains two failures:

- **Cross-reference outside the anchor:** “Use the general deadline” is unchanged, but the general-deadline section changes. The app currently labels the anchored passage text unchanged; it does not follow references. A reviewer must read the full source and raw diff.
- **Subtle hypothetical wording:** “Imagine a world … This is a story” is not detected by the small example/nonbinding trigger list. It can become a change flag even though it should be uncertain.

These are observable shortcomings, not hypothetical model guarantees. Tests for explicit example language passing do not prove that every misleading phrase is detected. Diagnostic cases were authored during development; they are not independent held-out data.

Other limits: synonyms and paraphrases may be missed; section renames may become missing evidence; repeated headings are ambiguous; nested Markdown headings produce separate sections; a parent section does not absorb its child sections. Multi-topic sections can produce irrelevant flags. No PDF, DOCX, OCR, table semantics, cross-document dependencies or legal interpretation. The app cannot know whether an input is the authentic, complete or applicable policy.

## Baseline comparison
Simple line LCS diff shows additions/removals across the complete documents. It catches text changes outside anchored sections, which the checklist view can miss. It offers no automatic step association. The app organizes passage candidates around steps; it has not been shown to save reviewer time, outperform semantic tools or improve real-world correctness. No novelty or prize claim is made.

## Storage and resources
Only explicit Save writes the procedure to localStorage. Documents and review decisions are tab memory; refresh/close loses them. There is no encrypted vault, collaboration, undo history or import of a past review JSON. Downloaded JSON contains full inputs. No runtime network calls, paid APIs or models. Small fixtures run quickly, but no formal peak-memory or worst-case performance study has been performed. Limits bound document size and the quadratic line-diff table.

## Verification scope
Automated engine tests, Chrome browser workflow checks and screenshots are agent verification. They do not substitute for user usability feedback, an accessibility audit, Safari validation or real operations-team validation. The final human review remains pending. Public links, exact Devpost form prompts and exit survey are unverified until authorized publication/entry.
