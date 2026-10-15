import { compare, lineDiff, LIMITATIONS } from './engine.js';
import { demo } from './demo.js';
const $ = id => document.getElementById(id);
const fields = ['before', 'after', 'procedure'];
const labels = { changed: 'Review change', unchanged: 'Text unchanged', uncertain: 'Uncertain' };
let report = null, selected = null, decisions = {}, snapshot = null;
const storageKey = 'what-changed.procedure.v1';
function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
function notice(message, error = false) { $('notice').textContent = message; $('notice').className = error ? 'error' : ''; }
function invalidate() {
  if (report) notice('Inputs changed. Compare again to refresh the evidence; previous decisions were cleared.');
  report = null; snapshot = null; selected = null; decisions = {};
  $('review').hidden = true; $('empty').hidden = false; $('export').disabled = true; $('review-meta').textContent = 'Compare to start a fresh review';
}
fields.forEach(id => $(id).addEventListener('input', () => {
  invalidate(); $('demo-label').textContent = 'Edited inputs. Documents stay in this tab.';
  if (id === 'procedure') $('saved-label').textContent = 'Unsaved edits';
}));
function loadDemo() {
  const hasCustom = fields.some(id => $(id).value.trim() && $(id).value !== demo[id]);
  if (hasCustom && !window.confirm('Replace the current inputs and clear review decisions with the synthetic example? The saved procedure copy is kept.')) return;
  invalidate(); fields.forEach(id => $(id).value = demo[id]);
  $('inputs').open = true; $('demo-label').textContent = 'SYNTHETIC EXAMPLE · Harbor Desk is fictional. These are not real policies.';
  $('saved-label').textContent = 'Example · not saved';
  notice('Synthetic example loaded. Compare versions to begin.');
}
$('demo').addEventListener('click', loadDemo); $('empty-demo').addEventListener('click', loadDemo);
$('compare').addEventListener('click', () => {
  try {
    const input = Object.fromEntries(fields.map(id => [id, $(id).value]));
    report = compare(input.before, input.after, input.procedure); snapshot = input;
    decisions = {}; selected = report.results[0].step.id; $('filter').value = 'all';
    $('empty').hidden = true; $('review').hidden = false; $('export').disabled = false;
    $('inputs').open = false; $('review-meta').textContent = `${report.results.length} steps · Human review required`;
    render(); renderDiff(); notice('Comparison ready. Inspect both passages before recording a decision.');
    $('workspace').focus();
  } catch (error) { invalidate(); notice(error.message, true); $('inputs').open = true; }
});
function render() {
  $('counts').replaceChildren(...['changed', 'uncertain', 'unchanged'].map(category => {
    const box = el('div', 'count'); box.append(el('strong', '', String(report.counts[category])), el('span', '', labels[category])); return box;
  }));
  renderQueue(); renderDetail();
}
function renderQueue() {
  const filtered = report.results.filter(r => $('filter').value === 'all' || r.category === $('filter').value);
  if (!filtered.some(r => r.step.id === selected)) selected = filtered[0]?.step.id || null;
  const nodes = filtered.map(result => {
    const button = el('button', 'step-button' + (selected === result.step.id ? ' selected' : ''));
    button.setAttribute('aria-pressed', String(selected === result.step.id));
    button.append(el('span', 'step-number', `STEP ${result.step.id.split('-')[1].padStart(2, '0')}`), el('span', 'step-text', result.step.text), el('span', `badge ${result.category}`, labels[result.category]));
    if (decisions[result.step.id]?.decision && decisions[result.step.id].decision !== 'unreviewed') button.append(el('span', 'decision-dot', `Your decision: ${decisions[result.step.id].decision}`));
    button.addEventListener('click', () => { selected = result.step.id; renderQueue(); renderDetail(); }); return button;
  });
  $('step-list').replaceChildren(...(nodes.length ? nodes : [el('p', 'muted', 'No steps in this category.')]));
}
function evidenceCard(result, side) {
  const e = result[side], card = el('section', 'evidence');
  card.setAttribute('aria-label', `${side === 'before' ? 'Before' : 'After'} evidence`);
  const header = el('div', 'evidence-header'); header.append(el('strong', '', side === 'before' ? 'BEFORE' : 'AFTER'), el('span', '', e ? `L${e.lineStart}${e.lineEnd !== e.lineStart ? '–' + e.lineEnd : ''}` : 'MISSING'));
  card.append(header, el('blockquote', e ? '' : 'missing', e?.text || 'No supporting passage located. This absence is not evidence that the instruction was removed or reversed.'), el('p', 'match-reason', result.match[side])); return card;
}
function renderDetail() {
  const result = report.results.find(r => r.step.id === selected);
  if (!result) { $('detail').replaceChildren(el('p', 'muted', 'Choose another filter to see steps.')); return; }
  const head = el('div', 'detail-heading'); head.append(el('p', 'eyebrow', `PROCEDURE / STEP ${result.step.id.split('-')[1].padStart(2, '0')}`), el('span', `badge ${result.category}`, labels[result.category]));
  const title = el('h3', '', result.step.text);
  const reason = el('div', 'reason-box'); reason.append(...result.reasons.map(s => el('p', '', s)));
  const evidence = el('div', 'evidence-grid'); evidence.append(evidenceCard(result, 'before'), evidenceCard(result, 'after'));
  const panel = el('section', 'decision-panel'); panel.append(el('h4', '', 'Your review, your decision'));
  const row = el('div', 'decision-row'), choice = el('div'), note = el('div');
  const choiceLabel = el('label', '', 'Decision'); choiceLabel.htmlFor = 'decision'; const select = el('select'); select.id = 'decision';
  for (const [value, text] of [['unreviewed','Not reviewed'],['revise','Revise step'],['keep','Keep step'],['investigate','Investigate']]) { const o = el('option', '', text); o.value = value; select.append(o); }
  const existing = decisions[result.step.id] || { decision: 'unreviewed', note: '' }; select.value = existing.decision;
  const noteLabel = el('label', '', 'Review note (optional)'); noteLabel.htmlFor = 'review-note'; const textarea = el('textarea'); textarea.id = 'review-note'; textarea.placeholder = 'What needs a closer look?'; textarea.maxLength = 4000; textarea.value = existing.note;
  const save = () => { decisions[result.step.id] = { decision: select.value, note: textarea.value }; renderQueue(); };
  select.addEventListener('change', save); textarea.addEventListener('input', save);
  choice.append(choiceLabel, select); note.append(noteLabel, textarea); row.append(choice, note); panel.append(row, el('p', 'muted', 'Decisions stay in this tab until exported. Comparing again clears them.'));
  $('detail').replaceChildren(head, title, reason, evidence, panel);
}
$('filter').addEventListener('change', () => { renderQueue(); renderDetail(); });
function renderDiff() {
  const diff = lineDiff(snapshot.before, snapshot.after);
  if (diff.unavailable) { $('diff').replaceChildren(el('p', 'muted', diff.unavailable)); return; }
  $('diff').replaceChildren(...diff.lines.map(l => {
    const row = el('div', 'diff-line ' + l.kind); row.append(el('span', 'line-no', `${l.beforeLine || '·'} / ${l.afterLine || '·'}`), el('span', '', `${l.kind === 'add' ? '+ ' : l.kind === 'remove' ? '− ' : '  '}${l.text}`)); return row;
  }));
}
$('save').addEventListener('click', () => {
  const text = $('procedure').value;
  if (!text.trim()) { notice('Add a procedure before saving.', true); return; }
  if (text.length > 30000) { notice('Procedure must be at most 30,000 characters.', true); return; }
  try { localStorage.setItem(storageKey, text); $('saved-label').textContent = 'Saved in this browser'; notice('Procedure saved in this browser. Documents and review decisions are not saved.'); }
  catch { notice('Browser storage is unavailable. You can still compare and export; saving did not succeed.', true); }
});
$('forget').addEventListener('click', () => {
  try { localStorage.removeItem(storageKey); $('saved-label').textContent = 'Not saved'; notice('Saved procedure removed. Current inputs remain in the tab.'); }
  catch { notice('Browser storage is unavailable; the saved copy could not be removed.', true); }
});
try { const saved = localStorage.getItem(storageKey); if (saved && saved.length <= 30000) { $('procedure').value = saved; $('saved-label').textContent = 'Loaded saved procedure'; } }
catch { notice('Browser storage unavailable; comparison still works.', true); }
for (const side of ['before','after']) $('file-' + side).addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 320000) throw new Error('File is too large. Import a smaller UTF-8 text document.');
    const text = await file.text();
    if (text.length > 80000) throw new Error('Each document must be at most 80,000 characters.');
    if (text.includes('\u0000')) throw new Error('This looks like a binary file. Use plain UTF-8 .txt or .md.');
    $(side).value = text; $(side).dispatchEvent(new Event('input')); notice(`${side === 'before' ? 'Before' : 'After'} document imported locally.`);
  } catch (error) { notice(error.message, true); }
  event.target.value = '';
});
$('export').addEventListener('click', () => {
  if (!report || !snapshot) return;
  const payload = { title: 'What Changed? — Evidence review', exportedAt: new Date().toISOString(), engineVersion: report.engineVersion, method: 'Deterministic section anchors and lexical retrieval; no generative AI at runtime.', inputs: snapshot, counts: report.counts, results: report.results.map(r => ({ ...r, review: decisions[r.step.id] || { decision: 'unreviewed', note: '' } })), limitations: LIMITATIONS };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = el('a'); link.href = url; link.download = 'what-changed-review.json'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  notice('Review exported. The downloaded JSON includes both documents, exact passages and your notes.');
});
