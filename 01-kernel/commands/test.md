---
allowed-tools: Read, Write, Edit, Glob, Grep, AskUserQuestion
argument-hint: "[category: adoption|modularity|portability|intuitive|docs|learning|all]"
title: Interactive Testing Helper
stratum: 3
branches: [agentic]
---

Guide through manual test scenarios and track results.

## Quick Reference

| Category | Tests | What It Validates |
|----------|-------|-------------------|
| **adoption** | A01-A05 | Can someone new get productive quickly? |
| **modularity** | B01-B02 | Can you use pieces independently? |
| **portability** | C01-C03 | Works across tools and projects? |
| **intuitive** | D01 | Works as expected without docs? |
| **docs** | E01 | Documentation accuracy |
| **learning** | G01-G03 | Tutorial usability |
| **all** | All | Full test suite |

## Process

### Step 1: Determine Scope

Parse argument:

- `/test` or `/test all` → Offer category selection
- `/test adoption` → Run adoption tests
- `/test modularity` → Run modularity tests
- etc.

If no argument, ask:

```markdown
Which test category would you like to run?

1. **Adoption** (A01-A05) - New user onboarding
2. **Modularity** (B01-B02) - Independent components
3. **Portability** (C01-C03) - Cross-tool/project
4. **Intuitive** (D01) - Expected behavior
5. **Documentation** (E01) - Accuracy
6. **Learning** (G01-G03) - Tutorial quality
7. **All Priority Tests** - Run the 15 core tests

[Select 1-7]
```

### Step 2: Load Test Definitions

Read `test-workspace/TESTING.md` to get test details.

For each test, extract:
- Test ID and name
- Goal
- Setup steps
- Test steps
- Pass criteria

### Step 3: Present Test

For each test in sequence:

```markdown
## Test [ID]: [Name]

**Goal:** [What we're validating]

### Setup

1. [Setup step 1]
2. [Setup step 2]

### Steps

1. [Test step 1]
2. [Test step 2]
3. [Test step 3]

### Pass Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

---

**Ready to run this test?**
- [Y] Run it now
- [S] Skip to next test
- [Q] Quit testing
```

### Step 4: Execute Test

Guide the user through each step:

```markdown
## Running Test [ID]

### Step 1: [Step description]

[Detailed instructions]

**Expected result:** [What should happen]

---

Did this step work as expected?
- [Y] Yes, continue
- [N] No, there's an issue
- [?] Not sure
```

If user reports issue:

```markdown
### Issue Detected

What happened?
[Open text input]

**Marking as potential failure.** Continuing to next step...
```

### Step 5: Record Results

After each test completes:

```markdown
## Test [ID] Complete

### Results

| Criterion | Result |
|-----------|--------|
| [Criterion 1] | PASS/FAIL |
| [Criterion 2] | PASS/FAIL |
| [Criterion 3] | PASS/FAIL |

### Overall: [PASS/FAIL/PARTIAL]

### Notes
[Any observations from the test]

---

Add to RESULTS.md? [Y/N]
```

If yes, update `test-workspace/RESULTS.md`:
- Update the category table with result
- Add date and notes
- Track in Issue Log if failure

### Step 6: Collect Comments

Prompt for feedback:

```markdown
Any additional observations? Use comment syntax:

%%PASS: [what worked well]%%
%%FAIL: [what failed and why]%%
%%NOTE: [interesting observation]%%
%%TODO: [follow-up needed]%%

[Or press Enter to skip]
```

Add comments to TESTING.md inline at the test location.

### Step 7: Continue or Complete

After each test:

```markdown
### Progress

- [x] A01: Fresh Start - PASS
- [x] A02: Minimal Setup - FAIL
- [ ] A05: First Skill Use - pending

Continue to next test? [Y/N/Summary]
```

If Summary or all tests complete:

```markdown
## Testing Session Complete

### Results Summary

| Test | Result | Notes |
|------|--------|-------|
| A01 | PASS | Completed in 4 min |
| A02 | FAIL | Setup instructions unclear |
| A05 | PASS | Skill triggered correctly |

### Next Steps

1. Review FAIL items in RESULTS.md
2. Run `/improve` to get fix suggestions
3. Re-test after fixes

### Files Updated
- test-workspace/RESULTS.md - Added [X] results
- test-workspace/TESTING.md - Added comments
```

## Test Category Details

### Category A: Adoption

| ID | Name | Focus |
|----|------|-------|
| A01 | Fresh Start (5-min) | README → productive in 5 min |
| A02 | Minimal Setup | Just delegation-advisor works |
| A05 | First Skill Use | Natural language triggers skill |

### Category B: Modularity

| ID | Name | Focus |
|----|------|-------|
| B01 | Single Skill Isolation | One skill works alone |
| B02 | Single Agent Isolation | One agent works alone |

### Category C: Portability

| ID | Name | Focus |
|----|------|-------|
| C01 | Claude Code Compatibility | Works in Claude Code |
| C02 | OpenCode Compatibility | Works in OpenCode |
| C03 | Drop Into Existing | No conflicts with existing .claude/ |

### Category D: Intuitiveness

| ID | Name | Focus |
|----|------|-------|
| D01 | Natural Language Triggers | Right agent activates from natural request |

### Category E: Documentation

| ID | Name | Focus |
|----|------|-------|
| E01 | README Accuracy | All links work, examples run |

### Category G: Learning Path

| ID | Name | Focus |
|----|------|-------|
| G01 | Tutorial 01 Walkthrough | First tutorial completable |
| G02 | Concepts Clarity | CONCEPTS.md understandable |
| G03 | Learning Path Flow | Tutorials build logically |

## Examples

### Example: Run Adoption Tests

```
User: /test adoption

AI: Running Adoption tests (A01, A02, A05)...

## Test A01: Fresh Start (5-min)

**Goal:** New user → productive in 5 minutes

### Setup

1. Open fresh terminal with no prior context
2. Have a timer ready

### Steps

1. Open README.md
2. Follow Quick Start section
3. Try first interaction with AI

### Pass Criteria

- [ ] README clear on what to do first
- [ ] Setup completes without errors
- [ ] First interaction works
- [ ] Total time < 5 minutes

---

Ready to run this test? [Y/S/Q]

User: Y

AI: ## Running Test A01

### Step 1: Open fresh terminal

Please open a new terminal window (or clear your current session).

This simulates a new user with no prior context about the workflow.

**Expected:** Clean terminal ready for commands

---

Did you complete this step? [Y/N]
```

### Example: Quick Single Test

```
User: /test A01

AI: Running single test A01: Fresh Start...

[Goes directly to that test]
```

## Integration

- Results stored in `test-workspace/RESULTS.md`
- Comments tracked in `test-workspace/TESTING.md`
- Use `/validate` for automated structural checks
- Use `/improve` after testing to get fix suggestions
- Use `test-improver` agent for proactive improvement suggestions

## Notes

- Tests are designed to be run independently
- Always test in a clean environment when possible
- Add %%comments%% liberally - they drive improvement
- Re-run failed tests after fixes to confirm
