# Contest submission draft — for user review

Agent-prepared at the user's explicit request. Not submitted, published or represented as learner-written reflection. The actual submission form has not been accessed; map these sections to its fields after approval. The Skill Pack normally asks for human-authored copy; this adaptation is disclosed in workflow.md. Personal learning and survey answers remain for the user.

## Project name
What Changed?

## Short description
Turn a document revision into a checklist review—with exact passages, visible uncertainty and a human decision at every step.

## What it does / intended audience
Operations coordinators often maintain a procedure derived from a longer reference document. When that document changes, a text diff identifies edited words but leaves the coordinator to work out which checklist steps to inspect.

What Changed? places the saved procedure beside old and new source passages. Section anchors or shared-word matching locate candidate evidence. A reviewer sees change flags, unchanged text and uncertainty, then records a decision and exports the sources and notes. Nothing is automatically rewritten.

## Demonstration
The fictional Harbor Desk shipping policy moves its dispatch cutoff from 3 p.m. to 1 p.m. The app links that passage to the corresponding checklist step, keeps unchanged returns evidence visible, flags a missing archive passage and warns about an edited nonbinding example. The video also shows saving the procedure, recording a review decision, exporting a review and comparing with the raw diff. All demonstration documents are synthetic.

## How it was built
Built from an empty folder with the Devpost Learn Skill Pack using an AI coding agent. Scope, PRD, spec and verified build checkpoints are in the repository. The local browser app uses dependency-free JavaScript, HTML and CSS with a small Node server. No paid API, account, cloud storage or model download is needed. AI assisted the development process; runtime comparison uses deterministic section anchors and lexical matching, not a generative model.

## What is distinctive
The review is organized around the procedure people have to maintain. Both source versions stay inspectable, missing evidence stays missing, uncertainty remains visible and the final decision belongs to the reviewer. This is a focused product approach, not a claim of algorithmic novelty.

## Validation and limitations
Built-in tests cover changed/unchanged passages, missing evidence, explicit misleading wording, ambiguity and exact source locations. Browser checks exercise persistence, decisions, exports, input invalidation, literal HTML rendering and a mobile viewport. A hand-authored 12-case diagnostic set matches 10 expected routing outcomes, with two retained misses: unresolved cross-references and subtle hypothetical language. These numbers do not establish real-world accuracy or superiority over a simple text diff. The full source and raw diff remain available for human review.

## Learning / challenges
User-authored response pending. Factual topics the user can assess: writing acceptance criteria before code; distinguishing exact quotation from correct interpretation; retaining failing diagnostic examples; testing stale-result invalidation. Do not submit this list as a personal reflection.

## Next steps
Broader independently authored examples, user feedback from procedure owners, cross-reference warnings and better handling of renamed sections. These are future directions, not implemented features.

## Built with
JavaScript, HTML, CSS, Node.js, Devpost Learn Skill Pack, AI-assisted development. Local QA/recording: Playwright, Chrome and FFmpeg helper.

## Links awaiting approval and publication
- Public repository URL: pending
- Public YouTube demo URL: https://youtu.be/vTV7kH7ZSBE (published, public, signed-out playback verified)
- Optional live hosted app: not planned; local run plus public video/repo meets the documented artifact requirements
- Exact form fields / exit survey: unverified; user answers required where personal attestation or reflection is requested
