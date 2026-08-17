# MathBridge Intelligence Layer

This directory joins the existing MathBridge knowledge layers without duplicating their source-of-truth content.

## Core principle

A teacher-facing comparison should be assembled from linked records:

```text
Concept
  ↓
Curriculum placement + progression
  ↓
Representations
  ↓
Teaching moves
  ↓
Likely misconceptions
  ↓
Diagnostic questions
  ↓
Targeted classroom response
  ↓
Evidence and source locators
```

The join is reference-based. Curriculum statements remain in curriculum/progression files; representations remain in the teaching catalog; misconceptions and questions remain in diagnostics. `concept_intelligence_index.json` only records which pieces belong together.

## Files

- `reference_registry.json` — canonical file locations, canonical IDs, and compatibility aliases for older shorthand references.
- `concept_intelligence_index.json` — concept-level joins across curriculum, teaching and diagnostic layers.
- `assembly_rules.json` — rules for turning the linked records into a teacher-facing MathBridge card.

## Example resolution

A request such as:

```text
CN Grade 3 → Multiplication meaning → Compare with England
```

should resolve in this order:

1. Find `multiplication-meaning` in the neutral concept taxonomy.
2. Load its intelligence profile.
3. Resolve China and England curriculum/progression records independently; do not assume Grade 3 and Year 3 are equivalent simply because the numbers match.
4. Load the linked representations: arrays, area model and bar/tape model.
5. Load suitable teaching moves such as connecting representations and reasoning from structure.
6. Load the linked misconception `mult-is-only-repeated-addition`.
7. Load diagnostic question `dq-mult-001`.
8. Resolve the evidence attached to every system-specific claim.
9. Render the sections specified in `assembly_rules.json`.

The resulting UI can therefore explain not only **what is taught**, but **how the mathematics is made visible, why a teaching move may help, what a pupil may misunderstand, and what the teacher can ask next**.

## Evidence rules

The join does not upgrade the confidence of its inputs. If a Chinese current-textbook placement is still `research_required`, joining it to a verified representation does not make the placement verified. The renderer must preserve the lowest relevant evidence status for each surfaced claim.

Use `England` for the statutory National Curriculum in England. Treat Common Core as a US comparison baseline rather than a single nationwide curriculum. Keep legacy PEP textbook sequences separate from the current 12th-series sequence.

## Diagnostics

A diagnostic record is not a label for a pupil. A wrong answer should trigger a probe. The system should distinguish conceptual understanding from procedure, fluency, representation and language. In bilingual settings, wording should be re-probed in a language-light or Chinese form when language could be the barrier.

## Current integrated concepts

The first joined set covers place value, addition/subtraction meaning, multiplication/division meaning, core fraction ideas, decimal place value, and the four written-operation strands. Coverage expands by adding profiles to `concept_intelligence_index.json`; the underlying source files do not need to be duplicated.
