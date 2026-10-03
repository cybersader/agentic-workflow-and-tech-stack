---
title: Cost-effective agentic coding models via API (OpenRouter + first-party), 2026-09-14
description: Live-priced comparison of tool-capable coding models cheaper than Fable/Astra, with capability signals and what $20 buys; input for the OpenRouter lane.
status: research
tags: [ai-coding, cliproxyapi, openrouter, pricing]
date: 2026-09-14
---

## Method

Pricing pulled live from `https://openrouter.ai/api/v1/models` (445 models, retrieved **2026-09-14T22:09:25Z**), filtered to models that list `tools` in `supported_parameters` and have `context_length >= 128000`, across `z-ai/`, `deepseek/`, `qwen/`, `moonshotai/`, `minimax/`, `mistralai/` (codestral/devstral only), `openai/`, `anthropic/`, `google/` (gemini flash/pro only), `x-ai/` (grok-code only — none found, see below). First-party pricing cross-checked against `claude.com/pricing` (redirected from `anthropic.com/pricing`) and `developers.openai.com/api/docs/pricing` (redirected from `platform.openai.com/docs/pricing`; `openai.com/api/pricing/` returned HTTP 403 and was not usable). Capability figures are vendor self-reported unless noted, pulled from official blog posts/technical reports via search — third-party aggregator numbers are flagged as such and never used as the only source. **Prices and benchmark scores drift; re-verify before relying on this for a purchase decision.**

**Pricing discrepancy found:** OpenRouter lists `openai/gpt-5.6-sol` at $2/$10 per M tokens; OpenAI's own pricing page lists a promotional rate of $4/$20 (in effect through 2026-11-21) with a $8/$30 long-context tier. Anthropic and GPT-6 Astra prices matched exactly between OpenRouter and the vendor page.

## Main table (sorted by $/M output ascending)

| model id | ctx | $/M in | $/M out | cache-read $/M | tools | SWE-bench Verified | Terminal-Bench (version) | $20 buys (M out / M in) | source |
|---|---|---|---|---|---|---|---|---|---|
| `openai/gpt-oss-120b` | 131,072 | 0.037 | 0.170 | n/a | yes | n/a | n/a | 118 / 541 | OpenRouter |
| `deepseek/deepseek-v3.2` | 163,840 | 0.269 | 0.400 | 0.134 | yes | ~73% (range 72–74% across harnesses) | outperforms open models on TB2.0, no exact % given | 50 / 74 | OpenRouter; [DeepSeek-V3.2 paper](https://arxiv.org/pdf/2512.02556) |
| `z-ai/glm-5.3-flash` | 1,310,720 | 0.150 | 0.500 | 0.030 | yes | not reported (Z.ai dropped SWE-bench V after GLM-5) | 84.3% on TB **2.1** (vendor) | 40 / 133 | OpenRouter; [Z.ai GLM-5.3 docs](https://docs.z.ai/guides/llm/glm-5.3) |
| `mistralai/codestral-2508` | 256,000 | 0.300 | 0.900 | 0.030 | yes | n/a (not found this pass) | n/a | 22 / 67 | OpenRouter |
| `mistralai/devstral-2512` | 262,144 | 0.400 | 2.000 | 0.040 | yes | 72.2% (Devstral 2 123B, official) | n/a | 10 / 50 | OpenRouter; [Mistral Devstral announcement](https://mistral.ai/news/devstral/) |
| `moonshotai/kimi-k2-thinking` | 262,144 | 0.600 | 2.500 | 0.150 | yes | 71.3% (official) | 47.1% on **original** TB, not TB2.0 | 8 / 33 | OpenRouter; [Moonshot Kimi K2 Thinking](https://www.kimi.com/en/blog/kimi-k2-thinking) |
| `google/gemini-2.5-flash` | 1,048,576 | 0.300 | 2.500 | 0.030 | yes | 48.9% single-attempt / 60.3% multi-attempt | n/a | 8 / 67 | OpenRouter; [Gemini 2.5 tech report](https://arxiv.org/pdf/2507.06261) |
| `qwen/qwen3-coder-plus` | 1,000,000 | 0.650 | 3.250 | 0.130 | yes | 69.6% (Qwen team-lead announcement, not a formal model card) | n/a | 6.2 / 31 | OpenRouter; [Qwen team announcement](https://x.com/JustinLin610/status/1970583176704925827) |
| `anthropic/claude-haiku-4.5` | 200,000 | 1.000 | 5.000 | 0.100 | yes | n/a (not found this pass) | n/a | 4 / 20 | OpenRouter; claude.com/pricing |
| `google/gemini-2.5-pro` | 1,048,576 | 1.250 | 10.000 | 0.125 | yes | 59.6% single-attempt / 67.2% multi-attempt (63.8% at launch w/ custom agent) | n/a | 2 / 16 | OpenRouter; [Gemini 2.5 tech report](https://arxiv.org/pdf/2507.06261) |
| `openai/gpt-5.6-sol` | 1,050,000 | 2.00 (OR) / 4.00 (1st-party) | 10.00 (OR) / 20.00 (1st-party) | 0.20 (OR) / 0.40 (1st-party) | yes | not officially reported; SWE-bench **Pro** 64.6% | 37.3% on TB **4.0** | 2 / 10 (OR price) | OpenRouter; [OpenAI pricing](https://developers.openai.com/api/docs/pricing) |
| `anthropic/claude-sonnet-5` | 1,000,000 | 2.000 | 10.000 | 0.200 | yes | disputed: 85.2% vs. 72.7% across trackers | n/a | 2 / 10 | OpenRouter; claude.com/pricing |
| `anthropic/claude-opus-5` | 1,000,000 | 5.000 | 25.000 | 0.500 | yes | disputed: 96.0% (some trackers) vs. "not published" (others) | n/a | 0.8 / 4 | OpenRouter; claude.com/pricing |
| `openai/gpt-6-astra` | 1,050,000 | 10.000 | 50.000 | 1.000 | yes | not officially reported | 57.9% on TB **4.0** | 0.4 / 2 | OpenRouter; [OpenAI GPT-6 Astra announcement](https://openai.com/index/gpt-6-astra/) |
| `anthropic/claude-fable-5.1` | 1,000,000 | 10.000 | 50.000 | 0.250 | yes | ~95.0% (well-corroborated, but see caveat below) | 55.8% on TB **4.0** | 0.4 / 2 | OpenRouter; claude.com/pricing |

Caveat on Fable 5/5.1's 95% figure: multiple trackers note Anthropic's published table reflects the uncapped "Mythos 5" routing target, since Fable's safety classifiers route some fraction of queries to Opus 5 before they reach the frontier model — treat 95% as a ceiling, not a guaranteed per-call result.

## Tiers (evidence-based, not vibes)

**Throwaway / gathering** — cheap enough to burn through in volume, capability signal thin or absent:
`gpt-oss-120b` ($0.17/M out, no SWE-bench found), `glm-5.3-flash` ($0.50/M out, no SWE-bench V — vendor dropped it), `codestral-2508` (no capability data found this pass). Use for search, boilerplate, log triage — not unattended multi-file edits.

**Routine implementation** — the strongest evidence-to-cost ratio for Claude-Code-style agentic coding:
`deepseek-v3.2` (~73% SWE-V at $0.40/M out — the best-evidenced cheap option), `devstral-2512` (72.2% SWE-V, Mistral's dedicated coding-agent model), `kimi-k2-thinking` (71.3% SWE-V), `qwen3-coder-plus` (69.6% SWE-V). All four are open-weight/vendor models with an official or team-reported SWE-bench Verified number in the 69–73% band at $0.40–$3.25/M out — materially cheaper than Sonnet 5 with capability in the same neighborhood as Sonnet-class models circa 2025. `gemini-2.5-pro` (59.6–67.2% SWE-V) is a reasonable fallback with a huge context window if the DeepSeek/Mistral/Kimi/Qwen family has an outage.

**Consequential design / hard debugging** — where evidence supports paying frontier prices:
`claude-opus-5`, `claude-fable-5.1`, `gpt-6-astra` remain the best-evidenced top tier (Astra's Terminal-Bench 4.0 lead over Sol is real and vendor-confirmed; Fable's ~95% SWE-V is real but caveated). `gpt-5.6-sol` sits awkwardly: no official SWE-bench Verified number exists at all — OpenAI's own materials lean on SWE-bench Pro (64.6%) and Terminal-Bench 4.0 (37.3%, well behind both Astra and Fable) — so treat Sol as mid-tier on coding specifically despite Astra-adjacent pricing tier.

## z-ai/glm-5.3-flash specifically

- **`z-ai/glm-5.3-flash`**: $0.15/M in, $0.50/M out, $0.03/M cache-read, 1.31M context, tools supported. $20 buys ~40M output tokens.
- **`z-ai/glm-5.3-flash:free`**: does not exist. Checked all 19 `:free`-suffixed models currently on OpenRouter; none belong to `z-ai/`, and no free GLM variant of any version was listed at retrieval time. Do not plan around a free tier for this model — it is not currently offered via OpenRouter.
- No official SWE-bench Verified score exists for GLM-5.3 or GLM-5.3-Flash — Z.ai moved its reporting to SWE-rebench/DeepSWE/Terminal-Bench 2.1/3.0 starting with GLM-5, arguing SWE-bench Verified is stale. Z.ai's own number for GLM-5.3-Flash is 84.3% on Terminal-Bench **2.1** (not 2.0) and 63.4% on DeepSWE v1.1 — vendor-reported, not independently reproduced (weights are large — 756GB FP8 / 1.5TB BF16 — so third-party reproduction is limited).

## x-ai/ note

No model literally named "grok code" exists on OpenRouter under `x-ai/` at retrieval time. The closest candidates are `x-ai/grok-4.3`, `grok-4.5`, `grok-4.6`, `grok-4.20`, and `grok-build-0.1` (the last is the closest thing to a dedicated coding SKU, $1.00/M in, $2.00/M out, 256K ctx) — none confirmed as a "Grok Code" branded product in this pass.

## Not measured here

- **Latency / tokens-per-second** — not compared; a cheap model that is also slow can erase the cost advantage in wall-clock time for interactive agentic loops.
- **Rate limits on `:free` routes** — not evaluated (moot here since no relevant `:free` model exists in-scope; would matter for other providers' free tiers).
- **Provider variance on OpenRouter** — OpenRouter routes many of these IDs (especially DeepSeek, Qwen, Kimi, GLM) across multiple backing providers with different actual context caps, quantization, and uptime; the `context_length` and price shown are OpenRouter's aggregate/top listing, not a guarantee for every backing provider you get routed to.
- **Subscription vs. API cost** — this note only compares metered API $/token; it does not compare against the Anthropic/OpenAI subscription plans the user is currently drawing down.
