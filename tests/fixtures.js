// Synthetic, hand-authored diagnostic cases. Expected categories express the
// desired reviewer routing, not a representative accuracy benchmark.
export const fixtures = [
  {
    name: "Deadline changes",
    before: "## Dispatch\nSubmit labels by 3 p.m.",
    after: "## Dispatch\nSubmit labels by 1 p.m.",
    procedure: "[Dispatch] Submit labels by 3 p.m.",
    expected: "changed",
  },
  {
    name: "Exact unchanged passage",
    before: "## Returns\nInspect within 5 days.",
    after: "## Returns\nInspect within 5 days.",
    procedure: "[Returns] Inspect within 5 days.",
    expected: "unchanged",
  },
  {
    name: "Source section removed",
    before: "## Archive\nKeep manifests for 90 days.",
    after: "## Returns\nInspect within 5 days.",
    procedure: "[Archive] Keep manifests for 90 days.",
    expected: "uncertain",
  },
  {
    name: "Nonbinding example changes",
    before: "## Service\nExample only: deliver within 24 hours.",
    after: "## Service\nExample only: deliver within 12 hours.",
    procedure: "[Service] Deliver within 24 hours.",
    expected: "uncertain",
  },
  {
    name: "Negation changes",
    before: "## Parcel\nRelease the parcel.",
    after: "## Parcel\nDo not release the parcel.",
    procedure: "[Parcel] Release the parcel.",
    expected: "changed",
  },
  {
    name: "Competing lexical candidates",
    before: "Inspect returned items.\nInspect returned items carefully.",
    after: "Inspect returned items.\nInspect returned items carefully.",
    procedure: "Inspect returned items.",
    expected: "uncertain",
  },
  {
    name: "Renamed source heading",
    before: "## Labels\nSubmit by noon.",
    after: "## Dispatch\nSubmit by noon.",
    procedure: "[Labels] Submit by noon.",
    expected: "uncertain",
  },
  {
    name: "Duplicate explicit heading",
    before: "## Returns\nInspect in 5 days.\n## Returns\nInspect in 10 days.",
    after: "## Returns\nInspect in 3 days.",
    procedure: "[Returns] Inspect returns.",
    expected: "uncertain",
  },
  {
    name: "Unanchored numeric change",
    before:
      "Inspect returned items within 5 business days.\nLog dispatched parcels.",
    after:
      "Inspect returned items within 3 business days.\nLog dispatched parcels.",
    procedure: "Inspect returned items within 5 business days.",
    expected: "changed",
  },
  {
    name: "No shared vocabulary",
    before: "Bake bread daily.",
    after: "Bake bread weekly.",
    procedure: "Inspect returned items within 5 days.",
    expected: "uncertain",
  },
  {
    name: "Cross-reference change outside anchor",
    before:
      "## Returns\nUse the general deadline.\n## General deadline\nInspect within 5 days.",
    after:
      "## Returns\nUse the general deadline.\n## General deadline\nInspect within 2 days.",
    procedure: "[Returns] Inspect returns within 5 days.",
    expected: "changed",
    knownLimitation:
      "No cross-reference resolution: anchored passage unchanged although its referenced deadline changed.",
  },
  {
    name: "Implicit hypothetical without trigger words",
    before:
      "## Service\nImagine a world where parcels arrive in 24 hours. This is a story.",
    after:
      "## Service\nImagine a world where parcels arrive in 12 hours. This is a story.",
    procedure: "[Service] Promise parcel arrival within 24 hours.",
    expected: "uncertain",
    knownLimitation:
      "The small example-language heuristic misses this hypothetical phrasing.",
  },
];
