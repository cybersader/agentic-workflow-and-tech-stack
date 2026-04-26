---
created: 2025-01-15
updated: 2025-01-15
tags:
  - architecture
  - enterprise
  - mcp
  - identity
  - reference
---

# Enterprise AI Architecture

## The Big Picture

```mermaid
graph TB
    subgraph "Users"
        DEV[Developers<br/>Cursor/Cline/Claude Code]
        BIZ[Business Users<br/>Teams/Portal]
        AUTO[Automation<br/>Scheduled Jobs]
    end

    subgraph "Identity"
        ENTRA[Entra ID<br/>SSO + MFA]
        SP[Service Principals<br/>Agent Identities]
    end

    subgraph "Gateways"
        MG[Model Gateway<br/>Azure APIM]
        TG[Tool Gateway<br/>MCP Gateway + OPA]
    end

    subgraph "AI Services"
        LLM[Azure OpenAI<br/>or Anthropic]
        ORCH[Orchestration<br/>LangGraph/SK]
    end

    subgraph "MCP Servers"
        M365[M365 MCP<br/>Graph API]
        SQL[SQL MCP<br/>Databases]
        SNOW[ServiceNow MCP<br/>Tickets]
    end

    subgraph "Observability"
        TRACE[Traces<br/>LangSmith]
        SIEM[SIEM<br/>Sentinel]
    end

    DEV --> ENTRA
    BIZ --> ENTRA
    AUTO --> SP

    ENTRA --> MG
    SP --> TG

    MG --> LLM
    LLM --> ORCH
    ORCH --> TG

    TG --> M365
    TG --> SQL
    TG --> SNOW

    ORCH --> TRACE
    TG --> SIEM
```

---

## The Core Problem: Identity

### Why Standard OAuth Fails for Agents

```mermaid
graph LR
    subgraph "Traditional App"
        U1[User] -->|login| A1[App]
        A1 -->|user token| R1[Resource]
    end

    subgraph "AI Agent (BROKEN)"
        U2[User] -->|login| A2[Agent]
        A2 -->|user token| R2[Resource]
        INJECT[Prompt Injection] -.->|hijacks| A2
        A2 -->|user token| EVIL[Attacker Goal]
    end

    style INJECT fill:#f66
    style EVIL fill:#f66
```

**The "Confused Deputy" Problem:**
- Agent inherits user's full permissions
- Prompt injection = agent does attacker's bidding with user's access
- Traditional RBAC doesn't help

### The Solution: Layered Identity

```mermaid
graph TB
    subgraph "User Layer"
        USER[User: alice@contoso.com<br/>Role: Finance-Analyst]
    end

    subgraph "Agent Layer"
        AGENT[Agent: finance-report-bot<br/>Service Principal<br/>Scopes: Finance.Read]
    end

    subgraph "Tool Layer"
        TOOL[Tool: sql_query<br/>Constraints: read-only<br/>Tables: transactions, balances]
    end

    subgraph "Purpose Layer"
        PURPOSE[Purpose Context<br/>ticket_id: INC123<br/>justification: Monthly report]
    end

    USER -->|triggers| AGENT
    AGENT -->|scoped token| TOOL
    TOOL -->|requires| PURPOSE
```

---

## Developer Access Pattern

### How Developers Use AI Coding Assistants

```mermaid
graph TB
    subgraph "Developer Machine"
        IDE[VS Code + Cline<br/>or Claude Code]
    end

    subgraph "Corporate Controls"
        MDM[Intune/MDM<br/>Pushes Config]
        PROXY[Model Gateway<br/>APIM/LiteLLM]
        TOOL_GW[Tool Gateway<br/>Allowlisted MCPs]
    end

    subgraph "Allowed Services"
        LLM[Azure OpenAI<br/>Claude API]
        GIT[GitHub/GitLab<br/>Code repos]
        DOCS[Internal Docs<br/>SharePoint]
    end

    MDM -->|config| IDE
    IDE -->|all LLM traffic| PROXY
    IDE -->|tool calls| TOOL_GW
    PROXY --> LLM
    TOOL_GW --> GIT
    TOOL_GW --> DOCS
```

### Developer Controls

| Control | Implementation | Purpose |
|---------|---------------|---------|
| **Endpoint config** | Intune pushes MCP config | Only approved MCP servers |
| **Model gateway** | Force traffic through APIM | DLP, cost tracking, logging |
| **Tool allowlist** | Gateway blocks unapproved tools | Prevent shadow AI tools |
| **No production access** | Agents can't reach prod via MCP | Blast radius limitation |

### Claude Code in Enterprise

```yaml
# ~/.claude/mcp_servers.json (pushed by MDM)
{
  "servers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"  # From corp SSO
      }
    },
    "internal-docs": {
      "url": "https://mcp-gateway.corp.com/docs",
      "auth": "entra"  # SSO integration
    }
  }
}
```

---

## Business User Access Pattern

### Teams Bot / Portal

```mermaid
graph TB
    subgraph "User Interface"
        TEAMS[Teams Bot]
        PORTAL[Internal Portal]
    end

    subgraph "Orchestration"
        COPILOT[Copilot Studio<br/>or Custom]
        WORKFLOW[Power Automate<br/>Approvals]
    end

    subgraph "AI Backend"
        AGENT[Bounded Agent<br/>LangGraph]
        GW[Tool Gateway]
    end

    subgraph "Resources"
        M365[SharePoint/Email]
        DATA[Business Data]
    end

    TEAMS --> COPILOT
    PORTAL --> COPILOT
    COPILOT --> WORKFLOW
    WORKFLOW -->|approved| AGENT
    AGENT --> GW
    GW --> M365
    GW --> DATA
```

### Key Difference from Developers

| Aspect | Developers | Business Users |
|--------|-----------|----------------|
| **Surface** | CLI/IDE | Teams/Portal |
| **Agent type** | General coding assistant | Purpose-built bot |
| **Tools** | File system, Git, shell | Specific business actions |
| **Approval flow** | Optional | Often required |

---

## RBAC for MCP Tools

### Layered Authorization

```mermaid
graph LR
    subgraph "Request"
        REQ[Agent Request<br/>tool: sql_query]
    end

    subgraph "Checks"
        C1[1. Agent Identity<br/>Is this agent registered?]
        C2[2. Tool Permission<br/>Can agent use sql_query?]
        C3[3. Constraints<br/>Read-only? Which tables?]
        C4[4. Purpose<br/>Is ticket_id valid?]
    end

    subgraph "Outcome"
        ALLOW[ALLOW]
        DENY[DENY + Log]
    end

    REQ --> C1 --> C2 --> C3 --> C4
    C4 -->|pass| ALLOW
    C1 -->|fail| DENY
    C2 -->|fail| DENY
    C3 -->|fail| DENY
    C4 -->|fail| DENY
```

### Policy Definition (OPA/Rego)

```rego
package mcp.authz

default allow = false

# Agent must be registered
allow {
    agent_registered(input.agent_id)
    agent_has_tool(input.agent_id, input.tool)
    constraints_satisfied(input.agent_id, input.tool, input.parameters)
    purpose_valid(input.purpose)
}

agent_has_tool(agent, tool) {
    role := data.agents[agent].roles[_]
    tool == data.roles[role].tools[_].name
}

constraints_satisfied(agent, tool, params) {
    role := data.agents[agent].roles[_]
    tool_def := data.roles[role].tools[_]
    tool_def.name == tool
    check_constraints(tool_def.constraints, params)
}
```

### Role Examples

```yaml
roles:
  finance-report-reader:
    tools:
      - name: sql_query
        constraints:
          read_only: true
          tables: [transactions, balances, reports]
      - name: sharepoint_read
        constraints:
          sites: [finance, accounting]

  hr-assistant:
    tools:
      - name: employee_lookup
        constraints:
          fields: [name, department, manager]  # No salary, SSN
      - name: calendar_read
        constraints:
          own_calendar_only: true

agents:
  agent-finance-daily:
    roles: [finance-report-reader]
    service_principal: sp-finance-agent

  agent-hr-onboarding:
    roles: [hr-assistant]
    service_principal: sp-hr-agent
    requires_approval: true
```

---

## Observability Requirements

### What to Log

```mermaid
graph TB
    subgraph "Trace Chain"
        L1[User Request<br/>who, what, when]
        L2[LLM Call<br/>prompt, response, tokens]
        L3[Tool Decision<br/>allowed/denied, why]
        L4[Backend Action<br/>what changed]
    end

    subgraph "Correlation"
        TRACE[trace_id: abc123<br/>Links all spans]
    end

    L1 --> L2 --> L3 --> L4
    TRACE -.-> L1
    TRACE -.-> L2
    TRACE -.-> L3
    TRACE -.-> L4
```

### Log Schema

```json
{
  "trace_id": "abc123",
  "timestamp": "2025-01-15T10:30:00Z",

  "identity": {
    "user": "alice@contoso.com",
    "agent": "agent-finance-daily",
    "service_principal": "sp-finance-agent"
  },

  "action": {
    "tool": "sql_query",
    "parameters": {"query": "SELECT..."},
    "decision": "ALLOW",
    "result": "150 rows"
  },

  "purpose": {
    "ticket_id": "INC0012345",
    "justification": "Monthly close report"
  }
}
```

---

## Stack Patterns

### Pattern A: Microsoft-Native

```mermaid
graph LR
    subgraph "Users"
        T[Teams]
        CS[Copilot Studio]
    end

    subgraph "Platform"
        AIF[Azure AI Foundry]
        SK[Semantic Kernel]
    end

    subgraph "Gateways"
        APIM[Azure APIM]
        MCPGW[mcp-gateway + OPA]
    end

    subgraph "Services"
        AOAI[Azure OpenAI]
        MCP[MCP Servers<br/>Managed Identity]
    end

    subgraph "Data"
        M365[M365]
        SQL[Azure SQL]
    end

    T --> CS --> AIF
    AIF --> SK
    SK --> APIM --> AOAI
    SK --> MCPGW --> MCP --> M365
    MCP --> SQL
```

**Best for:** Microsoft shops, regulated industries, full Entra ID integration

### Pattern B: Hybrid (Entra + OSS)

```mermaid
graph LR
    subgraph "Users"
        N8N[n8n<br/>Entra SSO]
        CC[Claude Code]
    end

    subgraph "Platform"
        LG[LangGraph<br/>Self-hosted]
    end

    subgraph "Gateways"
        LITELLM[LiteLLM]
        JUNGLE[MCPJungle + Keycloak]
    end

    subgraph "Services"
        MULTI[Multiple LLMs<br/>Azure/Anthropic/Local]
        MCP[MCP Servers]
    end

    N8N --> LG
    CC --> LITELLM
    LG --> LITELLM --> MULTI
    LG --> JUNGLE --> MCP
```

**Best for:** Teams wanting flexibility with Microsoft identity backbone

### Pattern C: High Security

```mermaid
graph TB
    subgraph "Private Network"
        USER[Users via VPN/AVD]
        AKS[AKS in VNet<br/>No public IP]
    end

    subgraph "Private Services"
        AOAI[Azure OpenAI<br/>Private Link]
        MCPGW[MCP Gateway<br/>Private Endpoint]
        MCP[MCP Servers]
    end

    subgraph "Data"
        LAKE[Private Data Lake]
    end

    USER --> AKS
    AKS --> AOAI
    AKS --> MCPGW --> MCP --> LAKE

    style AKS fill:#bbf
    style AOAI fill:#bfb
    style MCPGW fill:#bfb
```

**Best for:** Financial services, healthcare, government

---

## Migration Path

### From: Uncontrolled AI Usage

```
Current State:
├── Developers using personal ChatGPT accounts
├── No visibility into what's being shared
├── Shadow AI tools proliferating
└── No MCP/tool governance
```

### To: Governed AI Platform

```mermaid
graph TB
    subgraph "Phase 1: Visibility"
        P1A[Deploy model gateway<br/>Route all LLM traffic]
        P1B[Enable logging<br/>See what's happening]
    end

    subgraph "Phase 2: Identity"
        P2A[Integrate Entra SSO]
        P2B[Create agent service principals]
        P2C[Define roles and scopes]
    end

    subgraph "Phase 3: Tools"
        P3A[Deploy MCP gateway]
        P3B[Register approved MCP servers]
        P3C[Enforce tool-level RBAC]
    end

    subgraph "Phase 4: Purpose"
        P4A[Integrate ticketing system]
        P4B[Require purpose context]
        P4C[Full audit trail]
    end

    P1A --> P1B --> P2A
    P2A --> P2B --> P2C --> P3A
    P3A --> P3B --> P3C --> P4A
    P4A --> P4B --> P4C
```

---

## Quick Reference

### Identity Patterns

| Pattern | Use Case | Token Type |
|---------|----------|------------|
| **Service Principal** | Background jobs, no user context | Agent's own token |
| **On-Behalf-Of (OBO)** | User-triggered, "my data" actions | Reduced-scope user token |
| **Purpose-Bound** | Regulated, audited actions | Token with ticket_id/justification |

### Gateway Functions

| Gateway | Function | Controls |
|---------|----------|----------|
| **Model Gateway** | LLM API access | DLP, cost, rate limits |
| **Tool Gateway** | MCP tool access | RBAC, constraints, audit |

### Key Decisions

| Decision | Recommended | Alternative |
|----------|-------------|-------------|
| Identity provider | Entra ID | Keycloak (self-hosted) |
| Model gateway | Azure APIM | LiteLLM Proxy |
| Tool gateway | mcp-gateway | MCPJungle |
| Policy engine | OPA (Rego) | Cedar |
| Observability | LangSmith → Sentinel | Langfuse (self-hosted) |

---

## See Also

- [Identity Governance Patterns](10-identity-governance-patterns.md) - Deep dive on auth
- [Observability Architecture](11-observability-architecture.md) - Logging and tracing
- [AI Security Testing](../security/ai-security-testing.md) - Testing before deploy
- [Personal Architecture](12-personal-architecture.md) - How this differs at home
