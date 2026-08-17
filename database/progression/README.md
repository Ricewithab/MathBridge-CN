# MathBridge progression layer

The progression layer converts curriculum evidence into a queryable cross-system sequence.

## Current files

- `core_number_cn_uk_us.json` — cross-system progression spine for early number/place value, multiplicative thinking, and fractions.
- `../research/england_primary_number_progression_verified.json` — England Year 1–6 evidence package.
- `../research/us_common_core_number_progression_verified.json` — Common Core Grade 1–6 evidence package.
- `../research/number_place_value_verified.json` — China/England/US place-value research package.
- `../research/cn_pep_unit_sequence_seed.json` — edition-aware PEP unit evidence.

## Query pattern

The app should resolve a comparison in this order:

1. Select neutral `concept_id` from `concept_taxonomy.json`.
2. Resolve curriculum placement for the requested system.
3. Resolve grade/year/stage evidence and source IDs.
4. Resolve teaching principles and representations.
5. Generate a teacher-facing comparison only from supported claims.
6. Display source/evidence status with the comparison.

## Granularity rules

- **China:** National standards may be stage-based. Exact grade/semester placement requires verified current textbook evidence.
- **England:** Year-specific statutory requirements can be mapped directly to Years 1–6.
- **US:** Common Core is a baseline comparison framework, not a national curriculum. State overlays must remain identifiable.

## UI behavior

When exact equivalence is unavailable, the UI should say so. It should show `introduced`, `developing`, or `secure` progression states rather than manufacturing a one-to-one grade match.

A future `alignment_strength` field can score mappings such as `direct`, `partial`, `earlier`, `later`, or `different-emphasis`.
