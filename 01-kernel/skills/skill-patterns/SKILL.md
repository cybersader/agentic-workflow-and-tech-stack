---
name: skill-patterns
description: Expertise in designing Claude Code skills. Use when creating or refining model-invoked or user-invoked skills, skill resources, mirrors, templates, or activation tests.
title: Skill Patterns
stratum: 2
branches: [agentic]
---

# Skill patterns

## Purpose

Design skills whose invocation, instructions, side effects, and completion conditions are explicit and testable.

> **Choose the firing layer first.** Skills are the least reliable automatic layer because model invocation depends on semantic description matching. Put must-fire behavior in a hook or always-loaded `CLAUDE.md`; use a skill for the detailed content. Read `proactive-patterns` → “Firing Reliability — Pick the Right Mechanism FIRST” before authoring must-fire behavior.

## What a skill is

A skill is a package of instructions and optional resources loaded into the current session. It is not an isolated worker.

| Mode | Invocation | Best use |
|---|---|---|
| **Model-invoked** | Claude matches the frontmatter `description` | Optional expertise Claude should consider when a task fits |
| **User-invoked** | The user explicitly invokes `/skill-name` | A named transformation, inspection, or guided workflow |
| **Both** | Description matching or explicit invocation | Expertise that is useful automatically but also worth a direct entry point |

Use `disable-model-invocation: true` when only the user should start the workflow. Explicit skills may contain ordered actions; they still run in the current session rather than a fresh agent context.

## Required structure

Skills live in a named directory with a `SKILL.md` file:

```text
.claude/skills/
└── my-skill/
    ├── SKILL.md
    └── references/        # optional
```

Minimum frontmatter for a model-invoked skill:

```yaml
---
name: my-skill
description: What this skill provides and the distinct situations that should load it.
---
```

Explicit-only workflow:

```yaml
---
name: my-rewrite
description: Rewrite supplied prose while preserving facts and formatting.
disable-model-invocation: true
argument-hint: "[text or file path]"
allowed-tools: Read
---
```

The old `## Activation Keywords` convention is not a Claude Code feature. Put semantic trigger conditions in `description` or use an explicit-only skill.

## Before writing

Complete these steps in order:

1. Read the applicable global and project instructions.
2. Inspect the active runtime directories and current skill reference rather than relying on remembered harness behavior.
3. Search for existing skills, commands, agents, or always-loaded rules with overlapping scope.
4. Choose the correct mechanism: hook, `CLAUDE.md`, user-invoked skill, model-invoked skill, or isolated agent.
5. Identify one authoring source and every maintained mirror, generated view, installer, or public copy.
6. Freeze the skill contract before drafting the body.
7. Write and test only the invocation branches the skill actually supports.
8. Remove obsolete, duplicated, or contradictory instructions before completion.

## Freeze the contract

An actionable skill should define each field below. If a field does not apply, say so briefly or omit the corresponding branch instead of leaving it ambiguous.

| Contract field | Question to answer |
|---|---|
| **Invocation** | Model-invoked, user-invoked, or both? |
| **Inputs** | Inline text, `$ARGUMENTS`, file paths, repository state, or another explicit source? |
| **Scope** | What does the skill handle, and what belongs elsewhere? |
| **Order** | Which actions must happen in sequence? |
| **Outputs** | What response or artifact shape must it return? |
| **Side effects** | Which reads, writes, commands, network calls, or external actions are allowed? |
| **Stop conditions** | What missing input, conflict, ambiguity, or failure must stop the workflow? |
| **Completion criteria** | What observable conditions prove the work is done? |

Use direct verbs and positive target behavior. “Preserve link targets” is stronger than a long list of ways not to damage links. A prohibition earns space when the safe alternative cannot express the boundary; pair it with the desired action.

## Write the description as a pointer

For a model-invoked skill, `description` controls when the body loads. It must state:

1. what the skill provides; and
2. each genuinely distinct task branch that should trigger it.

Good:

```yaml
description: Diagnose agent-workflow activation, installer propagation, hook behavior, and scaffold portability claims. Use when validating skills, agents, hooks, or workflow structure.
```

Weak:

```yaml
description: Helps with testing and workflows.
```

Avoid synonym piles that repeat one branch. Avoid a broad trigger that competes with an unrelated general skill.

For an explicit-only skill, the description is mainly human-facing help text. Do not pretend it is an automatic trigger.

## Write the body as an operational contract

- Put actions in order when order affects correctness.
- End each phase with an observable completion condition.
- Make required outputs and stop conditions concrete.
- State read/write boundaries explicitly; reinforce them with `allowed-tools` when possible.
- Use examples only when they remove ambiguity. Do not restate the same rule in prose, a table, and an example.
- Reference existing worker-contract or safety guidance instead of copying it. For delegated work, use `delegation-advisor` as the source of truth.
- Keep completion criteria both checkable and demanding enough to prevent premature completion.

## Progressive disclosure by branch

Keep what every invocation needs in `SKILL.md`. Move material down only when a branch earns the split:

- **Model-invoked expertise:** trigger conditions, core rules, and output expectations.
- **User-invoked workflow:** argument handling, ordered steps, side effects, stop conditions, and return format.
- **Resource-backed skill:** branch-specific references, scripts, examples, schemas, or assets.
- **Maintained mirrors:** source-of-truth path, allowed metadata differences, installation path, and regeneration command.

A pointer to disclosed material must say when to load it. A hidden requirement behind a vague pointer is a reliability bug.

## Environment and source of truth

The filesystem, configuration, command help, package scripts, and active runtime are authoritative. Documentation that repeats a cheap lookup is a cache that can go stale.

Document what the environment cannot reveal cheaply:

- why a choice was made;
- which source owns a mirrored body;
- a non-obvious constraint or failure mode;
- what evidence counts as completion.

Keep each behavior in one authoritative place and link to it from other components.

## Overlap and precedence

Skills can conflict. Prevent accidental competition:

1. Higher-priority system, user, global, and project instructions govern over skill text.
2. Project skills should narrow or adapt global guidance, not silently redefine it.
3. Descriptions should not claim the same broad trigger surface unless the relationship is intentional.
4. When overlap is intentional, name the primary workflow and the supporting reference.
5. An explicit skill should not silently start another overlapping workflow.
6. If two instructions disagree, fix or document precedence rather than hoping headers keep them separate.

## Sizing

| Size | Guidance |
|---|---|
| Under 100 lines | One small workflow or reference |
| 100–300 lines | Normal skill |
| 300–500 lines | Large but defensible when branches remain clear |
| Over 500 lines | Split branch-specific reference or remove sediment |

Delete no-op instructions that do not change behavior. Remove stale commands, unsupported tools, obsolete migration steps, and explanatory prose that does not affect execution.

## Testing

Test structure and behavior separately:

1. **Structure:** directory and `SKILL.md` names are correct.
2. **Frontmatter:** required fields and invocation controls are valid.
3. **Positive activation:** supported prompts or explicit invocation load the intended skill.
4. **Negative activation:** nearby but out-of-scope prompts do not load it.
5. **Contract:** inputs, outputs, side effects, stop conditions, and completion criteria behave as written.
6. **Resources:** referenced files exist and load only on the branch that needs them.
7. **Mirrors/installers:** maintained copies and installed output match their source of truth.
8. **Fresh process:** activation tests run after restart when the current session may cache the old registry.

Do not mark semantic behavior passed from static inspection alone.

## Anti-patterns

| Avoid | Use instead |
|---|---|
| A skill as the sole trigger for must-fire behavior | Hook or `CLAUDE.md` trigger, skill for detailed content |
| `## Activation Keywords` | Frontmatter description or explicit invocation |
| “Skills only inform; they never execute workflows” | Distinguish model-invoked expertise from explicit workflows |
| Broad descriptions | Distinct trigger branches and explicit exclusions |
| Giant prohibition lists | Positive target behavior plus necessary hard boundaries |
| Undefined write scope | `allowed-tools`, side-effect contract, and stop conditions |
| Duplicated rules across skills | One source of truth with a pointer |
| Easy environment facts copied into prose | Inspect the environment at runtime |
| Assuming additive skills cannot conflict | Scope, overlap, and precedence rules |
| Testing only successful activation | Positive and negative activation tests |

## Related skills

- `proactive-patterns` — firing reliability and trigger placement
- `agent-patterns` — isolated worker definitions and return contracts
- `delegation-advisor` — bounded delegated-work contracts and model routing
- `testing-patterns` — agent-workflow and scaffold QA
