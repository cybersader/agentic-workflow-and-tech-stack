---
name: plainspoken-rewrite
description: Intensive, meaning-preserving rewrite for prose that sounds formulaic, generic, overproduced, or model-like. Use only when the user explicitly invokes /plainspoken-rewrite.
disable-model-invocation: true
allowed-tools: Read, Glob, Grep
argument-hint: "[text or file path] [optional audience or tone constraints]"
title: Plainspoken Rewrite
stratum: 2
branches: [agentic]
---

# Plainspoken rewrite

Rewrite supplied prose so it is more direct, plain, specific, and natural without changing what the author means.

## Input

Use `$ARGUMENTS` as the source request.

1. If it contains prose, rewrite that prose.
2. If it names one unambiguous file, read that file and return a rewritten version in the conversation.
3. If it includes audience, tone, length, or format constraints, treat those as part of the contract.
4. If the source is missing, inaccessible, conflicting, or ambiguous, stop and ask for the smallest clarification needed.
5. Do not search broadly for something to rewrite. The user must identify the text or file.

This skill is read-only. Never modify a supplied file or claim that a file changed.

## Preservation contract

Preserve all of the following unless the user explicitly asks to change them:

- meaning, argumentative direction, emphasis, and speaker intent;
- certainty, uncertainty, qualifications, and material hedging;
- facts, names, dates, numbers, chronology, and causal relationships;
- quotations verbatim;
- citations, footnotes, URLs, and Markdown link targets;
- headings, lists, tables, blockquotes, frontmatter, code fences, and inline code;
- precise technical and domain terms when they name something accurately;
- requested audience, tone, length, and output format.

If a stylistic change would alter one of these, keep the original wording or ask before changing it.

## Rewrite process

1. Identify the concrete point of each paragraph or block.
2. Lead with that point when doing so preserves the intended emphasis.
3. Replace generic framing, canned praise, vague reactions, and inflated claims with specific statements supported by the source.
4. Prefer precise nouns and verbs. Keep specialist language when it is the clearest accurate term.
5. Remove repetition, empty transitions, formulaic contrasts, forced list shapes, and conclusions that only restate earlier prose.
6. Split sentences that make the reader backtrack. Combine choppy sentences when one thought reads better as a unit.
7. Vary rhythm according to the content rather than forcing every paragraph into the same cadence.
8. Preserve useful rhetoric, punctuation, headings, and formatting. Judge each by function rather than applying a blacklist.
9. Read the result once for coherence and once for fidelity to the source.
10. Return the rewritten content without a style report or self-congratulatory commentary.

## Stop conditions

Stop and ask rather than guess when:

- the source cannot be read;
- the requested scope is unclear;
- two supplied versions conflict;
- quotation or citation boundaries are ambiguous;
- the requested tone would materially change factual certainty or speaker intent.

Never invent facts, examples, experiences, quotations, citations, or confidence. Never claim that the result will evade an AI detector.

## Completion check

Before returning, verify that:

- every material factual unit in the source remains represented;
- names, numbers, quotations, citations, URLs, links, and code remain intact;
- Markdown structure and link destinations still work;
- no unsupported factual claim or stronger certainty was introduced;
- the result is more direct, plain, and specific without flattening the author's voice.
