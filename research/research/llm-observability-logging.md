# LLM Observability and Logging

## My Use Case

I want to log and see AI chats when using Ollama. Specifically:
- Log chats being used with the Ollama API
- Search through conversation history
- Works even when I'm using something like Obsidian Web Clipper that calls Ollama (code I don't control)

**Key insight:** When you don't control the client code, you need a proxy-based approach. Langfuse/LangSmith are great but need to be inserted at the right layer.

---

## The Problem

When using local LLMs (Ollama) or any AI client, you often want to:
- Log all prompts and responses
- Search through conversation history
- Debug issues with AI interactions
- Track usage patterns

## Solutions Overview

### 1. Terminal Logging (Quick & Dirty)

```bash
# Redirect output to file
ollama run llama3 | tee chat_log.txt

# Full session recording with timestamps
script -t chat_log.txt ollama run llama3
```

### 2. Proxy-Based Logging (For Clients You Don't Control)

When using tools like Obsidian Web Clipper that call Ollama internally, you can't modify the code. Instead, proxy the API:

```python
# Run Ollama on custom port
export OLLAMA_HOST=0.0.0.0:11435
ollama serve

# Then proxy port 11434 to log all traffic
# See Flask proxy example below
```

**Flask Proxy Pattern:**
- Listen on default Ollama port (11434)
- Log requests/responses to JSON
- Forward to real Ollama on custom port (11435)
- Works with `/api/chat` and `/api/generate`

### 3. Langfuse (Recommended for Full Observability)

Open-source observability platform for LLM interactions.

**Why Langfuse:**
- Full traces (prompts/responses/history)
- Searchable dashboard (filter by timestamp, model, keywords)
- LangChain integration via callbacks
- Self-hosted or cloud

**Quick Setup:**
```bash
# Self-host with Docker
docker run -p 3000:3000 -p 5432:5432 --name langfuse langfuse/langfuse
```

**Python Integration:**
```python
from langfuse import Langfuse

langfuse = Langfuse(
    public_key="your_public_key",
    secret_key="your_secret_key",
    host="http://localhost:3000"
)

trace = langfuse.trace(
    name="clipper_chat",
    input={"model": model, "messages": messages}
)
```

**Resources:**
- [Langfuse Ollama Guide](https://langfuse.com/integrations/model-providers/ollama)
- [GitHub: langfuse/langfuse](https://github.com/langfuse/langfuse)

### 4. LangSmith (LangChain Native)

LangChain's official tracing/observability platform.

**Setup:**
```bash
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=your_key
export LANGCHAIN_PROJECT=my-project
```

**When to Use:**
- Already using LangChain
- Need eval scores and cost tracking
- Prefer cloud-hosted solution

**Resources:**
- [LangSmith Tracing Docs](https://docs.langchain.com/langsmith/observability)

### 5. LiteLLM Proxy (Advanced)

Drop-in proxy with built-in logging, auth, load balancing.

```bash
pip install litellm
litellm --model ollama/llama3.2 --api_base http://localhost:11435
```

**Features:**
- Callback logging hooks
- API key management
- Multiple model routing

---

## LangChain Memory for History

If you're building with LangChain, use memory for automatic history:

```python
from langchain_ollama import ChatOllama
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

llm = ChatOllama(model="llama3", temperature=0.7)
memory = ConversationBufferMemory(return_messages=True, memory_key="history")
chain = ConversationChain(llm=llm, memory=memory)

# Chat and access history
result = chain.invoke({"input": "What is life?"})
print(memory.buffer)  # View full history
```

**Saving/Loading History:**
```python
import json
from langchain.schema import HumanMessage, AIMessage

# Save
with open('history.json', 'w') as f:
    json.dump([msg.dict() for msg in memory.chat_memory.messages], f)

# Load
saved = json.load(open('history.json'))
messages = [HumanMessage(content=m["content"]) if m["type"] == "human"
            else AIMessage(content=m["content"]) for m in saved]
memory.chat_memory.add_messages(messages)
```

---

## Simple UI Options

### Streamlit Log Viewer

```python
import streamlit as st
import json
import pandas as pd

st.title("Ollama Log Viewer")

with open('logs.json', 'r') as f:
    logs = json.load(f)

df = pd.json_normalize(logs)
search = st.text_input("Search:")

if search:
    df = df[df.apply(lambda row: search.lower() in str(row).lower(), axis=1)]

st.dataframe(df[['timestamp', 'model', 'prompt', 'response']])
```

### Existing UI Tools

| Tool | Description | Install |
|------|-------------|---------|
| **ollama-chat** | Web UI, saves to Markdown | `pip install ollama-chat` |
| **tiny-ollama-chat** | Docker UI, SQLite storage | Docker image |
| **Chainlit** | LangChain chat UI with history | `pip install chainlit` |

---

## Recommendation Matrix

| Need | Solution |
|------|----------|
| Quick terminal logging | `tee` or `script` |
| Log uncontrolled clients | Flask/LiteLLM proxy |
| Full observability + search | Langfuse (self-hosted) |
| LangChain project | LangSmith |
| Simple UI viewer | Streamlit custom app |
