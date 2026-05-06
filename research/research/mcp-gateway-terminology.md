# "MCP Gateway" - Terminology Clarification

## The Confusion

"MCP Gateway" is used to mean **at least 4 different things**:

| Name | Who | What It Actually Is |
|------|-----|---------------------|
| **Docker MCP Gateway** | Docker Inc. | Container orchestrator for MCP servers |
| **Microsoft MCP Gateway** | Microsoft | K8s-based routing + Azure integration |
| **Generic "MCP Gateway"** | Industry term | Any reverse proxy in front of MCP servers |
| **MCP Gateway Registry** | Agentic Community | OSS gateway + registry + auth |

---

## 1. Docker MCP Gateway

**Repo**: [github.com/docker/mcp-gateway](https://github.com/docker/mcp-gateway)

**What it is**: Docker's tool to run MCP servers as isolated containers.

**Focus**:
- Container isolation (1 CPU, 2GB RAM cap per server)
- Credential management via Docker Desktop
- Logging/tracing
- Works with Docker's MCP Catalog

**NOT**: A general-purpose API gateway or auth proxy.

**Use case**: You want Docker to manage MCP server lifecycles in containers.

---

## 2. Microsoft MCP Gateway

**Repo**: [github.com/microsoft/mcp-gateway](https://github.com/microsoft/mcp-gateway)

**What it is**: Kubernetes-native reverse proxy for MCP servers.

**Focus**:
- Session-aware routing (sticky sessions)
- Azure Entra ID auth
- Lifecycle management (deploy/update/delete)
- Enterprise telemetry

**NOT**: Simple to self-host outside Azure/K8s.

**Use case**: Enterprise Azure shops with K8s infrastructure.

---

## 3. Generic "MCP Gateway" (The Concept)

When docs (like MCP Auth Proxy) mention "MCP Gateway," they often mean **the generic concept**:

> A reverse proxy that sits between Claude and your MCP servers, handling routing, auth, and policies.

This is **not a specific product** - it's the architectural pattern.

**MCP Auth Proxy says**:
> "If you need to manage multiple MCPs centrally (aggregation, policies/permissions, auditing, centralized logging), you'd use an MCP Gateway instead."

They mean: use *some* gateway product, not a specific one.

---

## 4. MCP Gateway Registry (Agentic Community)

**Repo**: [github.com/agentic-community/mcp-gateway-registry](https://github.com/agentic-community/mcp-gateway-registry)

**What it is**: Open source gateway + registry + auth hub.

**Focus**:
- Self-hostable
- Keycloak/Cognito auth
- Tool-level RBAC
- Agent-to-agent communication

**Use case**: Self-hosters who want full governance.

---

## So What Are People Usually Referring To?

| Context | They Probably Mean |
|---------|-------------------|
| "Docker MCP Gateway" | Docker's container orchestrator |
| "Microsoft MCP Gateway" | Azure/K8s enterprise solution |
| Blog posts about "MCP Gateway" | Generic concept OR Docker's |
| MCP Auth Proxy docs | Generic concept |
| "Self-host an MCP Gateway" | MCPJungle, Gateway Registry, or DIY |

---

## For Your Use Case

You want:
- Central management
- Visibility
- Security
- Self-hosted on TrueNAS

**Docker MCP Gateway**: Maybe - if you want container isolation, but it's Docker-Desktop focused.

**Microsoft MCP Gateway**: No - needs K8s/Azure.

**MCP Gateway Registry**: Yes - designed for self-hosting, has UI.

**MCPJungle**: Yes - simpler, also self-hostable.

**MCP Auth Proxy**: Partial - just auth, no registry/UI.

---

## TL;DR

When someone says "MCP Gateway" online:
1. Check if they specify Docker/Microsoft
2. If not, they likely mean the **generic concept**
3. For self-hosting, look at **MCPJungle** or **MCP Gateway Registry**
