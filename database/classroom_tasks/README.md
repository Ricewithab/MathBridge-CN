# Classroom task layer

This layer turns a comparison insight into a short classroom task.

Each task is linked to a neutral `concept_id` and is not labelled as a national method unless direct evidence supports that claim.

## Task fields

- `concept_id` — concept from `concept_taxonomy.json`
- `task_id` — stable task ID
- `title_zh` / `title_en` — short factual title
- `purpose` — what mathematical understanding the task checks or develops
- `use_when` — when the task is useful
- `setup` — materials or board setup
- `teacher_prompt_zh` / `teacher_prompt_en` — what the teacher asks
- `expected_thinking` — the mathematical idea pupils should use
- `listen_for` — evidence of understanding or a misconception
- `variation` — a small change that tests transfer
- `representation_ids` — linked representations
- `teaching_move_ids` — linked teaching moves
- `source_ids` — sources supporting the mathematical/pedagogical rationale
- `evidence_note` — limits on any system-specific claim

## Rules

- Keep tasks short enough to add to an existing lesson.
- The task complements the Chinese curriculum; it does not replace it.
- Use a representation only when it makes the relevant structure visible.
- Do not call a task “British”, “American” or “Chinese” unless the task itself comes from a directly cited curriculum/textbook source.
- Prefer one precise prompt over long activity instructions.
- Copy remains direct and instructional.
