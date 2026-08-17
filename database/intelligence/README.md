# MathBridge Intelligence Layer

This directory joins the MathBridge curriculum, teaching and diagnostic data.

## Structure

```text
Concept
  ↓
Curriculum placement and progression
  ↓
Representations
  ↓
Teaching moves
  ↓
Misconceptions
  ↓
Diagnostic questions
  ↓
Classroom response
  ↓
Evidence
```

The join is reference-based. Curriculum statements stay in curriculum and progression files. Representations stay in the teaching catalogs. Misconceptions and questions stay in diagnostics. Intelligence profiles only record which records belong together.

## Main files

- `concept_intelligence_manifest.json` — entry point for all Grade 1–6 concept profiles.
- `concept_intelligence_index.json` — first set of fully joined profiles.
- `profiles/number_remaining.json` — remaining number concepts.
- `profiles/algebraic_thinking.json` — patterns, equations, ratio and proportion.
- `profiles/measurement.json` — measurement, time, money, area and volume.
- `profiles/geometry.json` — shape, angles, position and transformations.
- `profiles/statistics_probability.json` — data and probability.
- `profiles/mathematical_practices.json` — problem solving, reasoning, communication and modelling.
- `reference_registry.json` — canonical file locations and IDs.
- `assembly_rules.json` — rules for assembling one teacher-facing concept card.

## Coverage

The taxonomy contains 121 concepts. Each concept now has an intelligence profile.

This means the structural join is complete. It does **not** mean every concept has complete research. Many profiles still have one or more of these states:

- curriculum mapping required
- diagnostic question required
- misconception research required
- current PEP grade placement required

The renderer must show those gaps rather than fill them with assumptions.

## Evidence rules

Joining records does not increase their evidence status. If a Chinese textbook placement is still `research_required`, linking it to a verified representation does not make the placement verified.

Use **England** for the statutory National Curriculum in England. Treat Common Core as a US comparison baseline rather than a single nationwide curriculum. Keep legacy PEP textbook sequences separate from the current 12th-series sequence.

## Copy rules

Teacher-facing copy must be plain and educational.

Use:
- short headings
- direct explanations
- specific teacher actions
- clear examples
- clear evidence labels

Avoid:
- marketing language
- promotional claims
- slogans
- hype
- vague claims
- unnecessary adjectives
- AI-style filler

The aim is to explain the mathematics and the teaching decision clearly.

## Diagnostics

A wrong answer is not a diagnosis. Ask a follow-up question or request a representation before recording a likely misconception.

Separate:
- conceptual misunderstanding
- procedural weakness
- fluency
- representation difficulty
- language difficulty

In bilingual settings, use a simpler or Chinese-language version when wording may be the problem.
