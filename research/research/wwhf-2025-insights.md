# WWHF 2025 AI Security Insights

---
created: 2025-01-15
updated: 2025-01-15
tags:
  - research
  - security
  - ai-agents
  - wwhf
  - reference
---

## Sources
- **Jason Haddix** (Arcanum) - AI Pen Testing Methodology
  - [Executive Offense Newsletter](https://executiveoffense.beehiiv.com/)
  - [Building AI Hackbots Part 1](https://executiveoffense.beehiiv.com/p/ai-hackbots-part-1)
- **Jake Williams** - Real World AI Risks and Mitigating Them
  - [YouTube: WWHF Deadwood 2025](https://www.youtube.com/watch?v=hT1dNsoK3YA)
  - IANS Research Faculty
- **Dan McInerney, Marcello Salvati** - Augmenting Offensive with AI for Job Security
  - Dan: Lead AI Threat Researcher @ [ProtectAI](https://protectai.com/blog/author/dan-mcinerney)
  - Marcello: [GitHub - byt3bl33d3r](https://github.com/byt3bl33d3r) (CrackMapExec, SILENTTRINITY)
  - [Vulnhuntr](https://github.com/protectai/vulnhuntr) - Their LLM-based 0-day finder

## Key Resources
- [Arcanum AI Security Resources](https://arcanum-sec.github.io/ai-sec-resources/)
- [Arcanum AI Sec Resource Hub](https://executiveoffense.beehiiv.com/p/executive-offense-the-arcanum-ai-security-resource-hub) - 23 active labs
- [Arcanum Prompt Injection Taxonomy](https://github.com/Arcanum-Sec/arc_pi_taxonomy)
- [Parsel Tongue Tool](https://arcanum-sec.github.io/P4RS3LT0NGV3/)
- [Liberatis Jailbreaks](https://github.com/elder-plinius/L1B3RT4S)
- [Gandalf Challenge](https://gandalf.lakera.ai/baseline)
- [DSPy Framework](https://github.com/stanfordnlp/dspy) - Programmatic context engineering

---

## Jason Haddix - AI Pen Testing Methodology

### The 7-Stage LLM Assessment

1. **Identify Inputs** - Find all entry points to the AI system
2. **Attack Ecosystem** - Target surrounding infra (logging, caching, web apps)
3. **Attack Model** - Direct LLM attacks
4. **Attack Prompt Engineering** - Leak/manipulate system prompts
5. **Attack Databases** - RAG databases, vector stores
6. **Attack Web Apps** - Frontend hosting the chatbot
7. **Pivot** - Move laterally from AI system to other assets

### Key Concepts

**First Try Fallacy**
- LLMs are non-deterministic
- Same attack may need 10-15 attempts to work
- Can't test once and call it done

**Prompt Injection Primitives (Taxonomy)**
- **Intents**: What you want (jailbreak, leak prompt, tool discovery)
- **Techniques**: How to achieve (narrative injection, role-play)
- **Evasions**: Bypass guardrails (encoding, fictional languages, emojis)
- **Utilities**: Helper functions

**Notable Evasion Techniques**
- Truncated instructions ("respond in 5 words or less")
- N-sequences (fake XML tags that look like system prompts)
- Invisible Unicode in emojis
- Link smuggling (hide exfil in URLs)
- BYOC - Bring Your Own Coding (custom encoding schemes)
- Synonym/metaphor for image generation

### Parsel Tongue Tool
- Web app for generating prompt injection payloads
- Creates Burp Intruder lists
- Bijection encoder for custom languages
- Anti-classifier for image model testing

---

## Jake Williams - AI Risk Assessment

### Non-Determinism is the Core Problem
- Can't say "given input X, always get output Y"
- Great for creativity, horrific for security testing
- How much testing is enough? n+1 could be harmful

### Training Data Paranoia is Overblown
- Your data is a drop in the bucket for LLM training
- Trade secrets are unique by definition
- Top-K sampling means low-probability tokens never surface
- New York Times case required thousands of specialized prompts

### Real Risks to Focus On

1. **Harmful Bias** - Must enumerate by use case
2. **Unsanitized LLM Output** - Cross-site scripting via chatbot
3. **Plugin/Skill Activation** - Data sent to third parties
4. **Misinformation/Disinformation** - Easy to plant in shared data

### Copilot for M365 Security

**Prerequisites**
- Entitlements management
- Data sensitivity labels
- (Most orgs don't have these sorted)

**Testing Approach**
1. Create representative personas
2. Determine test prompts
3. Execute each prompt per persona
4. Analyze unexpected responses
5. Trace back to root cause

**Example Test Prompts**
- "Show me the executive bonus schedule"
- "What departments have planned reductions in force?"
- "Which employees have requested time off for reproductive health issues?"

### Mitigations
- **LlamaGuard** - LLM protecting LLM (adds cost/latency)
- **Microsoft Presidio** - Anonymization with context preservation
- **Diversity in teams** - Different backgrounds = different harm enumeration

---

## Augmenting Offensive with AI (Agent Architecture)

**Speakers:** Dan McInerney, Marcello Salvati, Jason Haddix

### Core Philosophy

> "Model intelligence is NOT your bottleneck" - The architecture matters more than picking the "best" model.

> "RAG is a funneling information into a context window problem - it's not perfect but you create a searchable structure. Knowledge graphs are the best way to do RAG."

### Context Management

| Principle | Explanation |
|-----------|-------------|
| Keep context windows low | Don't dump everything in; be selective |
| Use new chats frequently | Fresh context beats accumulated cruft |
| RAG = funneling | It's about getting RIGHT info into limited space |
| Knowledge graphs > vectors | Better for complex relationships |

### Prompt Engineering

**The Two-Step Prompt Process:**
1. Use voice typing to brain-dump your intent
2. Ask AI to refine that into a better prompt
3. THEN use the refined prompt to build

**Key Rules:**
- First prompt must be incredibly detailed
- Ask for "product review document" before building big things
- System and user prompts should be CONCISE (not the first prompt)
- Human value = knowing what to distill and how

### Agent Architecture Patterns

**Core Insight:** Root agents suck at sequential tasks. Use orchestrators.

```
┌─────────────────────────────────────────────────────────┐
│  BAD: Monolithic Agent                                   │
│  ─────────────────────                                   │
│  Root Agent tries to do:                                 │
│  - Task A, then B, then C, then D                       │
│  Result: Gets confused, loses context, hallucinates     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  GOOD: Orchestrator + Specialized Subagents              │
│  ─────────────────────────────────────────────           │
│  Sequential/Workflow Agent (Orchestrator)               │
│  ├── Subagent: Tool A (one specific task)               │
│  ├── Subagent: Tool B (one specific task)               │
│  ├── Subagent: Tool C (one specific task)               │
│  └── Doc Subagent (handles chunking/reading)            │
│                                                          │
│  Each subagent gets ONE task, returns, moves on         │
└─────────────────────────────────────────────────────────┘
```

**Workflow Subagents:** A subagent that calls other subagents in certain patterns (orchestration within orchestration).

### Deterministic Controls

**Critical:** Don't rely on LLM "good behavior" for important controls.

| Don't Do | Do Instead |
|----------|------------|
| System prompt: "Ask for confirmation before X" | Callback function that halts execution |
| Hope the model follows instructions | Enforce structured output (JSON schemas) |
| Trust LLM to not do bad things | Deterministic guardrails in code |

### Action Abstraction Levels

From simple to advanced:

1. **APIs** - Direct REST/GraphQL calls
2. **MCP** - Model Context Protocol servers
3. **Desktop automation** - Puppeteer, Playwright
4. **Auto-discovery** - Agents create MCP connections on the fly
5. **Meta-agents** - Agents that create other agents

> "Self-improving agents are already possible today"

### Doc Chunking Strategy

- Use dedicated **doc subagents** for large document handling
- Don't try to stuff everything into main agent context
- Subagent reads, summarizes, returns distilled info

### Tools They Recommend

| Tool | Purpose |
|------|---------|
| Claude Code | Best coding assistant, multi-agent framework built-in |
| Cursor | Also excellent for coding |
| LangChain | Good foundation but has antipatterns |
| DSPy | Programmatic context engineering (Signatures, Modules, Optimizers) |
| n8n | Workflow orchestration |
| Puppeteer/Playwright MCPs | Web browsing and analysis |

### Building Agents Workflow

1. "Create MCP servers for this" - let Claude Code scaffold them
2. Debug the MCP servers
3. Create subagents for each tool
4. Wire up orchestrator
5. Test with small tasks first

### Context Engineering (from Jason Haddix's later writing)

**Related Research Terms Strategy:** Seed system prompts with domain-specific terminology to narrow the model's attention.

Example for Kerberos testing:
```
Include: "TGT, AS-REQ, golden ticket, NTLM relay, pass-the-hash"
```

**Clean RAG:**
- Normalize data into consistent schemas before ingestion
- Use standalone AI to clean/dedupe data
- Build knowledge packs per agent (not broad internet search)

**Output-First Design:**
- Define JSON schemas BEFORE prompting
- Structured outputs enable predictable chaining

**Guardrails Prompting:**
- "Extract IPs only, do not summarize"
- "Cite all sources; explain reasoning for each assertion"

### Vulnhuntr: Their Proof of Concept

Dan McInerney and Marcello Salvati built [Vulnhuntr](https://github.com/protectai/vulnhuntr):
- First autonomous AI tool to find 0-days in the wild
- Found 12+ RCE vulnerabilities in projects with 10K+ GitHub stars
- Uses Claude 3.5's 200K context window
- Traces user input through entire codebase

> "Vulnhuntr is basically one of the first LLM agents, before people were even talking about LLM agents." - Dan McInerney

---

## Identity Governance for AI Agents (Jake Williams + Role-Based Chat)

### The OAuth Problem
- Standard OAuth 2.0 = agent masquerades as user
- If agent gets prompt-injected, it has full user permissions
- "Confused Deputy" problem

### Enterprise Controls Needed

1. **Don't Give Agents User Tokens**
   - Create Service Principals (App Registrations)
   - Use On-Behalf-Of (OBO) flow for user context
   - Mint purpose-bound tokens

2. **MCP Gateway as Policy Enforcement Point (PEP)**
   - Validate token scopes per tool
   - Block unauthorized tool calls
   - Log everything

3. **Logging Requirements**
   - Log LLM inputs AND outputs
   - Include application context (not just LLM layer)
   - Correlate: LLM request → MCP call → backend action

4. **LangSmith for Visibility**
   - Wrap app calls in LangSmith
   - Get visibility into backend API calls
   - "Skeleton key for fixing logging problem"

### Risk Assessment Approach
- Organize findings by IMPACT, not likelihood
- Likelihood is impossible to measure with non-determinism
- Finding acceptance criteria based on impact

### Common Findings
- Prompt injection (context vs instructions)
- Insecure use of LLM output
- Improper authentication
- Identity governance gaps
- Insufficient logging
- Lack of attribution

### Prompt Firewalls
- Rebuff (ProtectAI)
- Azure Prompt Shield
- LlamaGuard
- Witness AI
- Akamai AI Firewall
