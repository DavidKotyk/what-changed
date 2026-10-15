import test from 'node:test';
import assert from 'node:assert/strict';
import { compare, parseDocument, lineDiff, changedSpan, LIMITS } from '../src/engine.js';
import { demo } from '../src/demo.js';
test('synthetic journey: change, unchanged, missing evidence, misleading wording', () => {
  const r = compare(demo.before, demo.after, demo.procedure);
  assert.deepEqual(r.results.map(x => x.category), ['changed', 'unchanged', 'uncertain', 'uncertain']);
  assert.match(r.results[0].before.text, /3 p.m./);
  assert.match(r.results[0].after.text, /1 p.m./);
  assert.equal(r.results[2].after, null);
  assert.match(r.results[3].reasons.join(' '), /nonbinding/);
});
test('all returned quotes are exact source slices and line references', () => {
  for (const result of compare(demo.before, demo.after, demo.procedure).results) {
    for (const side of ['before', 'after']) {
      const e = result[side]; if (!e) continue;
      assert.equal(demo[side].slice(e.start, e.end), e.text);
      assert.equal(demo[side].slice(0, e.start).split('\n').length, e.lineStart);
      assert.equal(demo[side].slice(0, e.end).split('\n').length, e.lineEnd);
    }
  }
});
test('CRLF, blank lines, unicode and literal HTML retain exact offsets', () => {
  const text = '# Préparation\r\n\r\n  Keep <script>literal</script>.\r\nSecond line.\r\n';
  for (const e of parseDocument(text)) assert.equal(text.slice(e.start, e.end), e.text);
  assert.equal(parseDocument(text)[0].lineStart, 3);
});
test('negation, numeric and case changes are not normalized away', () => {
  for (const after of ['Do not release parcel.', 'Release parcel in 2 days.', 'RELEASE parcel.']) {
    assert.equal(compare('## Release\nRelease parcel.', '## Release\n' + after, '[Release] Release parcel.').results[0].category, 'changed');
  }
});
test('whitespace-only changes are unchanged and explicitly limited', () => {
  const r = compare('## Returns\nInspect items.', '## Returns\nInspect   items.', '[Returns] Inspect items.').results[0];
  assert.equal(r.category, 'unchanged'); assert.match(r.reasons[0], /does not validate/);
});
test('duplicate anchors and missing headings cannot become confident changes', () => {
  assert.equal(compare('## A\nOne.\n## A\nTwo.', '## A\nThree.', '[A] Do work.').results[0].category, 'uncertain');
  assert.equal(compare('## A\nOne.', '## Renamed\nOne.', '[A] Do work.').results[0].category, 'uncertain');
});
test('unanchored lexical retrieval handles a strong candidate', () => {
  const r = compare('Inspect returned items within 5 business days.\nLog dispatched parcels.', 'Inspect returned items within 3 business days.\nLog dispatched parcels.', 'Inspect returned items within 5 business days.').results[0];
  assert.equal(r.category, 'changed');
});
test('unrelated, weak and tied candidates stay uncertain', () => {
  const cases = [['Bake bread.', 'Inspect returned items.'], ['Inspect returned items.\nInspect returned items carefully.', 'Inspect returned items.'], ['Returned parcels need labels.', 'Inspect returned items within 5 business days.']];
  for (const [doc, step] of cases) assert.equal(compare(doc, doc, step).results[0].category, 'uncertain');
});
test('example and nonbinding language detection across both versions', () => {
  for (const word of ['Example only', 'Hypothetical', 'Non-binding', 'For reference only', 'Not a requirement']) {
    assert.equal(compare('## A\nSend in 2 days.', `## A\n${word}: Send in 1 day.`, '[A] Send parcel.').results[0].category, 'uncertain');
  }
});
test('input validation rejects empty, oversize and blank anchored steps', () => {
  for (const args of [['', 'b', 'c'], ['a', 'b', '[A]'], ['a'.repeat(80001), 'b', 'c'], ['a','b',Array(101).fill('Step').join('\n')]]) assert.throws(() => compare(...args));
});
test('simple line diff reconstructs both versions including blank lines', () => {
  for (const [a, b] of [['one\ntwo\n', 'one\nthree\n'], ['a\na\nb', 'a\nb\na'], ['', 'new']]) {
    const d = lineDiff(a, b).lines;
    assert.equal(d.filter(x => x.kind !== 'add').map(x => x.text).join('\n'), a);
    assert.equal(d.filter(x => x.kind !== 'remove').map(x => x.text).join('\n'), b);
  }
  assert.ok(lineDiff('\n'.repeat(LIMITS.lines), 'a').unavailable);
});

test('visual change spans preserve exact original text', () => {
  for (const [a,b] of [['Submit by 3 p.m.', 'Submit by 1 p.m.'], ['AB','ABCD'], ['Same','Same'], ['','abc'], ['no café','café'], ['Keep old line.','Keep new line.']]) {
    const s = changedSpan(a,b); assert.equal(s.prefix + s.changed + s.suffix, a);
    if (a === b) assert.equal(s.changed, '');
  }
});
