---
allowed-tools: Read, Glob, Grep, Bash
argument-hint: "[category: structure|links|schema|all]"
title: Validate Workflow Structure
stratum: 3
branches: [agentic]
---

Run deterministic checks on the workflow scaffold to catch structural issues.

## Quick Reference

| Check | What It Validates |
|-------|-------------------|
| **structure** | Skill/agent file organization |
| **links** | Internal wikilinks point to real files |
| **schema** | YAML frontmatter and required fields |
| **all** | Run all checks (default) |

## Process

### Step 1: Determine Scope

Parse the argument to focus validation:

- `/validate` or `/validate all` → Run all checks
- `/validate structure` → Only structural checks
- `/validate links` → Only link validation
- `/validate schema` → Only schema/frontmatter checks

### Step 2: Run Structure Checks (F01)

**Skill Structure:**
```bash
# Find all skill files - should be in subdirectory/SKILL.md format
find .claude/skills -name "SKILL.md" -type f 2>/dev/null

# Find loose .md files in skills root (except meta/) - these are wrong
find .claude/skills -maxdepth 1 -name "*.md" -type f 2>/dev/null
```

**Agent Structure:**
```bash
# Find all agent files
find .claude/agents -name "*.md" -type f 2>/dev/null

# Check agents have .md extension
ls -la .claude/agents/**/*.md 2>/dev/null
```

**Pass Criteria:**
- All skills in `.claude/skills/{name}/SKILL.md` or `.claude/skills/{name}.md` format
- All agents in `.claude/agents/**/*.md` format
- No orphan files outside expected locations

### Step 3: Run Schema Checks (F02)

For each skill and agent file, verify:

**Skills must have:**
- YAML frontmatter with `---` delimiters
- `description:` field (required)
- `keywords:` field (recommended)

**Agents must have:**
- Clear Purpose section
- When to Use section
- Capabilities section
- Expected Output section

Check with grep:
```bash
# Check for frontmatter in skills
grep -l "^---" .claude/skills/**/*.md 2>/dev/null

# Check for description in skills
grep -l "description:" .claude/skills/**/*.md 2>/dev/null
```

### Step 4: Run Link Checks (F04)

Find all wikilinks and verify targets exist:

```bash
# Extract wikilinks from all .md files
grep -roE '\[\[[^]]+\]\]' --include="*.md" . 2>/dev/null

# For each link, check if target file exists
# Note: This is simplified - full check requires parsing link paths
```

**Pass Criteria:**
- All `[[link]]` references point to existing files
- No broken cross-references in documentation

### Step 5: Generate Report

Output a summary table:

```markdown
## Validation Results

**Run Date:** [timestamp]
**Scope:** [all|structure|links|schema]

### Summary

| Category | Checks | Passed | Failed | Warnings |
|----------|--------|--------|--------|----------|
| Structure | X | Y | Z | W |
| Schema | X | Y | Z | W |
| Links | X | Y | Z | W |
| **Total** | **X** | **Y** | **Z** | **W** |

### Details

#### Structure Issues
- [List any structure problems found]

#### Schema Issues
- [List any missing fields or malformed YAML]

#### Link Issues
- [List any broken links]

### Recommendations

1. [First fix needed]
2. [Second fix needed]

---

Run `/validate [category]` to re-check after fixes.
```

## Check Definitions

### F01: Skill Structure

| Status | Condition |
|--------|-----------|
| PASS | All skills in `{name}/SKILL.md` format |
| WARN | Skills in `{name}.md` flat format (deprecated) |
| FAIL | Mixed formats or orphan files |

### F02: Agent Schema

| Status | Condition |
|--------|-----------|
| PASS | All required sections present |
| WARN | Missing recommended sections |
| FAIL | Missing required sections |

### F03: Frontmatter

| Status | Condition |
|--------|-----------|
| PASS | Valid YAML between `---` delimiters |
| WARN | Valid but missing recommended fields |
| FAIL | Malformed YAML or missing delimiters |

### F04: Link Validation

| Status | Condition |
|--------|-----------|
| PASS | All wikilinks resolve to files |
| WARN | Links to files outside project |
| FAIL | Broken internal links |

### F05: Naming Consistency

| Status | Condition |
|--------|-----------|
| PASS | Directory names match internal metadata |
| WARN | Minor inconsistencies (case) |
| FAIL | Directory/file name mismatches |

## Examples

### Example: Full Validation

```
User: /validate

AI: Running all validation checks...

## Validation Results

**Run Date:** 2025-12-24
**Scope:** all

### Summary

| Category | Checks | Passed | Failed | Warnings |
|----------|--------|--------|--------|----------|
| Structure | 15 | 14 | 0 | 1 |
| Schema | 23 | 22 | 1 | 0 |
| Links | 45 | 45 | 0 | 0 |
| **Total** | **83** | **81** | **1** | **1** |

### Details

#### Structure Warnings
- `.claude/skills/delegation-advisor.md` uses flat format (recommend `delegation-advisor/SKILL.md`)

#### Schema Issues
- `.claude/agents/meta/test-scaffolder.md` missing "Expected Output" section

### Recommendations

1. Migrate `delegation-advisor.md` to subdirectory format
2. Add "Expected Output" section to `test-scaffolder.md`

---

1 failure, 1 warning. Run `/validate schema` after fixing.
```

### Example: Structure Only

```
User: /validate structure

AI: Running structure checks only...

## Validation Results

**Run Date:** 2025-12-24
**Scope:** structure

### Summary

| Category | Checks | Passed | Failed | Warnings |
|----------|--------|--------|--------|----------|
| Structure | 15 | 15 | 0 | 0 |

All structure checks passed!
```

## Integration with Testing

After running `/validate`:
- Results can be added to `test-workspace/RESULTS.md` under Category F
- Use %%PASS%% or %%FAIL%% comments to track
- Run `/improve` to get suggestions for fixing issues

## Notes

- This command runs READ-ONLY checks - it never modifies files
- For automated CI use, see `test-workspace/scripts/validate.sh`
- This validates structure, not behavior - use `/test` for functional testing
