export const ENGINE_VERSION = '1.0.0';
export const LIMITS = { document: 80000, steps: 100, lines: 1500 };
export const LIMITATIONS = [
  'Text comparison and lexical retrieval, not semantic understanding or compliance certification.',
  'Text unchanged means only the located passage is unchanged; it may not support the checklist instruction.',
  'Section anchors are strongest. Synonyms, renamed headings, cross-references and long multi-topic sections can defeat retrieval.',
  'Example-language detection is a small heuristic, not a complete detector of misleading or nonbinding text.',
  'A changed passage is a review candidate, not an instruction to revise. A person must read the evidence.'
];
const stop = new Set('a an the to of for and or in on at by with from is are be as it this that must should shall may will can do not no only before after within than then each all your our their its per up into'.split(' '));
export const normalize = s => s.toLowerCase().replace(/\s+/g, ' ').trim();
const comparable = s => s.replace(/\s+/g, ' ').trim(); // case is meaningful in source text
export const tokens = s => [...new Set((s.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter(t => !stop.has(t)))];
const headingKey = s => normalize(s).replace(/[^\p{L}\p{N} ]/gu, '');

export function parseDocument(text) {
  // Keep original byte-for-character JS string offsets, including CRLF and blank lines.
  const lines = text.split('\n');
  let offset = 0;
  const records = lines.map((raw, index) => {
    const r = { raw, start: offset, end: offset + raw.length, line: index + 1 };
    offset += raw.length + 1;
    return r;
  });
  const hasHeadings = records.some(r => /^#{1,6}\s+\S/.test(r.raw));
  const chunks = [];
  let current = null;
  const flush = () => {
    if (!current || !current.records.length) return;
    let rows = current.records;
    while (rows.length && !rows[0].raw.trim()) rows = rows.slice(1);
    while (rows.length && !rows.at(-1).raw.trim()) rows = rows.slice(0, -1);
    if (!rows.length) return;
    const start = rows[0].start, end = rows.at(-1).end;
    chunks.push({ heading: current.heading, key: headingKey(current.heading), text: text.slice(start, end), start, end, lineStart: rows[0].line, lineEnd: rows.at(-1).line });
  };
  for (const row of records) {
    const h = row.raw.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
    if (h) {
      flush(); current = { heading: h[1], records: [] };
    } else if (hasHeadings) {
      if (!current) current = { heading: '', records: [] };
      current.records.push(row);
    } else if (row.raw.trim()) {
      current = { heading: '', records: [row] }; flush(); current = null;
    }
  }
  flush();
  return chunks;
}

export function parseSteps(text) {
  return text.split('\n').map(s => s.trim()).filter(Boolean).map((raw, i) => {
    const clean = raw.replace(/^(?:[-*]\s+|\d+[.)]\s+)/, '');
    const match = clean.match(/^\[([^\]]+)\]\s*(.*)$/);
    return { id: `step-${i + 1}`, text: match ? match[2] : clean, anchor: match ? match[1].trim() : null };
  });
}

function retrieve(step, sections) {
  if (step.anchor) {
    const matches = sections.filter(s => s.key === headingKey(step.anchor));
    if (!matches.length) return { evidence: null, reliable: false, reason: `No passage under “${step.anchor}”.` };
    return { evidence: { ...matches[0], score: 1 }, reliable: matches.length === 1, reason: matches.length === 1 ? `Exact section anchor: ${step.anchor}.` : `${matches.length} sections share this anchor; showing the first candidate only.` };
  }
  const query = tokens(step.text);
  const ranked = sections.map(s => {
    const sourceTokens = new Set(tokens(s.heading + ' ' + s.text));
    const hits = query.filter(t => sourceTokens.has(t)).length;
    return { ...s, hits, score: query.length ? hits / query.length : 0 };
  }).sort((a, b) => b.score - a.score || b.hits - a.hits);
  const top = ranked[0];
  if (!top || top.hits < 2 || top.score < .3) return { evidence: null, reliable: false, reason: 'No sufficiently related passage found by shared words.' };
  const gap = top.score - (ranked[1]?.score || 0);
  const reliable = top.score >= .6 && gap >= .15;
  return { evidence: top, reliable, reason: `Shared words: ${top.hits}/${query.length}. ${reliable ? 'Distinct lexical candidate' : gap < .15 ? 'Competing candidates are too close' : 'Weak lexical match'}; this is not semantic validation.` };
}
const misleading = s => /\b(example|examples|illustrative|illustration|non[- ]?binding|hypothetical|sample|not (?:a |an )?(?:requirement|instruction|policy)|for reference only)\b/i.test(s);
export function compare(before, after, procedure) {
  if (![before, after, procedure].every(s => typeof s === 'string')) throw new Error('Documents and procedure must be text.');
  if (!before.trim() || !after.trim() || !procedure.trim()) throw new Error('Add both document versions and at least one procedure step.');
  if (before.length > LIMITS.document || after.length > LIMITS.document) throw new Error(`Each document must be at most ${LIMITS.document.toLocaleString()} characters.`);
  if (procedure.length > 30000) throw new Error('Procedure must be at most 30,000 characters.');
  const steps = parseSteps(procedure);
  if (steps.length > LIMITS.steps) throw new Error(`Use at most ${LIMITS.steps} procedure steps.`);
  if (steps.some(s => !s.text.trim())) throw new Error('Each procedure line needs instruction text after its optional [anchor].');
  const oldSections = parseDocument(before), newSections = parseDocument(after);
  const results = steps.map(step => {
    const old = retrieve(step, oldSections), next = retrieve(step, newSections);
    const reasons = [];
    if (!old.evidence) reasons.push('Before: supporting passage missing.');
    if (!next.evidence) reasons.push('After: supporting passage missing.');
    if (!old.reliable || !next.reliable) reasons.push('The passage match needs human verification.');
    if ([old.evidence, next.evidence].some(e => e && misleading(e.text + ' ' + e.heading))) reasons.push('Example or nonbinding language detected; do not treat it as an instruction.');
    // Only compare as a matched passage when both sides have a stable heading, or
    // independently strong lexical retrieval. Renamed headings remain uncertain.
    const stablePair = old.evidence && next.evidence && old.evidence.key === next.evidence.key;
    if (old.evidence && next.evidence && !stablePair) reasons.push('The retrieved sections have different headings; their relationship is unverified.');
    const uncertain = reasons.length > 0;
    const identical = old.evidence && next.evidence && comparable(old.evidence.text) === comparable(next.evidence.text);
    return { step, before: old.evidence, after: next.evidence, category: uncertain ? 'uncertain' : identical ? 'unchanged' : 'changed', reasons: uncertain ? reasons : [identical ? 'Located passage text is unchanged apart from whitespace. This does not validate the procedure.' : 'Located passage text differs. Read both versions to decide whether this step needs revision.'], match: { before: old.reason, after: next.reason } };
  });
  return { engineVersion: ENGINE_VERSION, results, counts: Object.fromEntries(['changed', 'unchanged', 'uncertain'].map(c => [c, results.filter(r => r.category === c).length])), limitations: LIMITATIONS };
}

export function lineDiff(before, after) {
  const a = before.split('\n'), b = after.split('\n');
  if (a.length > LIMITS.lines || b.length > LIMITS.lines) return { unavailable: `Line diff is limited to ${LIMITS.lines} lines per version; step review is still available.`, lines: [] };
  const dp = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const lines = []; let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) { lines.push({ kind: 'same', text: a[i], beforeLine: ++i, afterLine: ++j }); }
    else if (j < b.length && (i === a.length || dp[i][j + 1] >= dp[i + 1][j])) { lines.push({ kind: 'add', text: b[j], afterLine: ++j }); }
    else { lines.push({ kind: 'remove', text: a[i], beforeLine: ++i }); }
  }
  return { lines };
}
