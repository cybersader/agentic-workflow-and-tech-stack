---
name: testing-patterns
description: Test agent-workflow and scaffold behavior: skill invocation, agent routing, hooks, delegation, installation, structure, portability claims, and documentation. Not for ordinary application unit, integration, E2E, TDD, or debugging work.
title: Testing Patterns
stratum: 2
branches: [agentic]
---

# Testing patterns

Use this skill to validate AI-agent workflow scaffolds and their installed behavior. The nearest applicable `TESTING.md`, actual files, installer, and current runtime are the source of truth.

**In scope:** skills, agents, commands, hooks, delegation rules, installers, scaffold structure, documented portability, adoption paths, and deterministic metadata checks.

**Out of scope:** ordinary application unit tests, integration/E2E suites, TDD, performance debugging, browser harnesses, and product-specific test infrastructure. Use project testing guidance for those.

## Quick reference

| Concept | Pattern |
|---|---|
| Test categories | Adoption, Modularity, Portability, Intuitiveness, Documentation, Deterministic |
| Comment syntax | `%%PASS%%`, `%%FAIL%%`, `%%NOTE%%`, `%%TODO%%`, `%%QUESTION%%` |
| Results format | `RESULTS.md` with category tables |
| Improvement loop | Run → Record → Analyze → Correct → Rerun |
| Activation evidence | Observable invocation or distinctive behavior in a fresh process |

## Category framework

### Adoption

**Question:** Can someone new reach a useful workflow without hidden setup?

Measure:

- time to first useful interaction;
- clarity of README and entry points;
- recovery from incomplete installation;
- discovery of available skills, commands, or agents.

### Modularity

**Question:** Can a component work within its stated boundaries?

Validate:

- one skill works without unrelated skills;
- one agent has the tools and references it declares;
- optional components fail clearly when absent;
- partial installation behaves as documented.

### Portability

**Question:** Are portability claims true on the named tools and scopes?

Verify only claims the repository actually makes:

- supported frontmatter and file layout;
- global versus project-scoped precedence;
- tool-specific features are labeled as such;
- mirrored or public copies retain the intended behavior.

Do not assume two tools implement skills, hooks, agents, or commands identically.

### Intuitiveness

**Question:** Does the component activate and behave when a user would reasonably expect it to?

Check:

- supported prompts trigger model-invoked skills;
- nearby out-of-scope prompts do not trigger them;
- explicit-only skills run only after direct invocation;
- names, help text, side effects, and errors match the contract;
- no surprising writes or external actions occur.

### Documentation

**Question:** Do instructions match the current environment?

Verify:

- links and referenced files exist;
- commands and examples execute where claimed;
- source-of-truth and mirror relationships are accurate;
- stale component names and historical behavior are removed or labeled;
- generated views derive from the documented source.

### Deterministic checks

**Question:** Which claims can a script prove cheaply?

Prefer checks that are:

- scriptable;
- repeatable;
- fast;
- binary;
- scoped to the behavior under test.

## Skill invocation tests

Model-invoked and user-invoked skills need different evidence.

### Model-invoked

1. Start a fresh process in the intended scope.
2. Submit a prompt that matches one documented trigger branch.
3. Confirm distinctive skill guidance appears in the behavior.
4. Submit a nearby out-of-scope prompt.
5. Confirm the skill does not activate merely because one word overlaps.

### User-invoked

1. Confirm `disable-model-invocation: true` is present when explicit-only behavior is required.
2. Start a fresh process after installing or changing the skill.
3. Submit an ordinary request without the slash invocation and confirm the skill does not auto-activate.
4. Invoke `/skill-name` explicitly with valid input.
5. Verify input handling, output shape, side effects, stop conditions, and completion criteria.

Do not expect a permission prompt for normal skill loading. Evidence is invocation or distinctive behavior, not an assumed UI event.

Current sessions can retain their launch-time skill registry and body. Static inspection can validate structure, but only a fresh process can validate activation after a change.

## Test template

```markdown
### [ID]: [Test name]

**Goal:** [One observable outcome]

**Scope:** [Tool, directory, component, and version]

**Setup:**
1. [Prerequisite]
2. [Fresh-process or installation requirement]

**Steps:**
1. [Action]
2. [Action]

**Pass criteria:**
- [ ] [Binary observable]
- [ ] [Binary observable]

**Evidence:**
- Command or prompt: `[exact input]`
- Observed result: [quote or path]

**Status:** PASS | FAIL | PARTIAL | SKIP | TODO
**Comments:** %%Add one concrete observation%%
```

## Writing pass criteria

Weak:

- [ ] It works.
- [ ] The skill loads.
- [ ] The installer is fine.

Strong:

- [ ] `/plainspoken-rewrite` appears only after explicit invocation in a fresh process.
- [ ] The installed `SKILL.md` is byte-identical to the active runtime source.
- [ ] A file supplied to a read-only skill has the same hash before and after invocation.
- [ ] The response preserves the fixture's number, quote, URL, link target, and code block.

Criteria should be observable, binary, independent, and specific. Never mark a semantic test passed from frontmatter or prose inspection alone.

## Recording results

Use these statuses honestly:

- `PASS` — every pass criterion was observed.
- `FAIL` — at least one criterion was disproved.
- `PARTIAL` — some criteria ran; others remain unresolved.
- `SKIP` — intentionally not applicable or blocked, with the reason recorded.
- `TODO` — not run.

Record evidence directly in the nearest `TESTING.md` or `RESULTS.md`. A quiet or skipped command is not a pass.

Comment syntax:

| Comment | Use |
|---|---|
| `%%PASS: ...%%` | Observed criterion passed |
| `%%FAIL: expected ...; observed ...%%` | Criterion failed |
| `%%NOTE: ...%%` | Context needed to interpret evidence |
| `%%TODO: ...%%` | Specific unrun work |
| `%%QUESTION: ...%%` | Decision or ambiguity needing resolution |

## Improvement loop

```text
1. Run the selected scaffold checks.
2. Record prompts, commands, and observations in TESTING.md or RESULTS.md.
3. Separate confirmed failures from blocked or unrun checks.
4. Identify the smallest source-of-truth correction.
5. Apply the correction without editing generated copies.
6. Rerun affected checks.
7. Record the actual result and remaining limits.
```

Fix the source behavior, not only the test fixture. Do not broaden a focused failure into unrelated application-testing work.

## Installer testing

Use an isolated temporary `HOME` when testing global installation:

1. Create a temporary home directory.
2. Place sentinel unrelated files or directories in it.
3. Run the documented installer with `HOME` pointing there.
4. Compare installed target files with their active sources.
5. Confirm sentinel content remains unchanged.
6. Remove the temporary directory.

Do not overwrite the real global configuration merely to prove an installer test.

## Common anti-patterns

| Anti-pattern | Correction |
|---|---|
| Testing internal prose instead of user-visible behavior | Assert the documented outcome or side effect |
| Only testing successful activation | Add a nearby negative activation case |
| Treating static inspection as semantic evidence | Use a fresh process and record the prompt/result |
| Assuming portability | Test each named tool or narrow the claim |
| Editing generated output | Fix the authoring source and regenerate/dry-run |
| Hiding blocked checks as “fragile” | Record what ran, what failed, and what access is missing |
| Rewriting unrelated test infrastructure | Stay within scaffold QA and route application tests elsewhere |
| Forgetting results | Update `TESTING.md` or `RESULTS.md` immediately |

## Deterministic check examples

### Skill structure

```bash
find .claude/skills -mindepth 2 -maxdepth 2 -name SKILL.md -type f
find .claude/skills -maxdepth 1 -name '*.md' -type f
```

### Directory and YAML names

```bash
for dir in .claude/skills/*/; do
  name=$(basename "$dir")
  grep -q "^name: $name$" "$dir/SKILL.md" || printf 'Mismatch: %s\n' "$dir"
done
```

### Stale references

```bash
rg -n 'old-command|removed-agent|obsolete-path' .claude 01-kernel test-workspace
```

### Mirror comparison

Normalize allowed publishing metadata, then compare bodies rather than assuming independent copies stay aligned by accident.

## Related

- `skill-patterns` — skill contracts, invocation modes, and mirror discipline
- `proactive-patterns` — trigger reliability and mechanism choice
- `delegation-advisor` — worker contracts and bounded delegation
- `TESTING.md` — active scaffold scenarios
- `RESULTS.md` — recorded outcomes
- `/validate` — deterministic scaffold checks
- `/test` — interactive scaffold test runner
