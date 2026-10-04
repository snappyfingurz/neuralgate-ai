# ⚡ NeuralGate AI — Multi-Tier LLM Cost-Optimization & Caching Gateway

> An intelligent, high-throughput, low-latency LLM Proxy Gateway that reduces AI token costs by up to 90% using Semantic Vector Caching, Provider Prefix Caching Alignment, Algorithmic Prompt Compression, and Dynamic Model Routing.

---

## 🌟 Key Features

### 1. Multi-Tier Caching Engine
- **Semantic Caching ($0.00 Cost)**: Converts queries into 128-dimensional dense vector embeddings. If a query has $\ge 95\%$ cosine similarity to a past query, it returns the cached response in **~4ms**, completely bypassing the LLM API.
- **Prefix Caching Alignment (90% Cost Reduction)**: Automatically restructures payloads to place static system rules, tool declarations, and RAG context at the front of the prompt to trigger provider prompt caching discounts (OpenAI & Anthropic).

### 2. Algorithmic Prompt Compression
- **Lexical Stripping**: Pre-processor regex engine that strips polite filler words (*"please kindly", "if you don't mind"*) and redundant whitespace.
- **LLMLingua Token Density Compression**: Information entropy calculator that identifies and prunes low-density tokens up to 70% while preserving key entities, numbers, and code structures.

### 3. Dynamic Model Routing & Output Management
- **Intent Classification & Confidence Cascading**: Automatically routes simple queries (data extraction, summarization, simple Q&A) to cheap models (`gpt-4o-mini`, `claude-3-haiku`), reserving flagship models (`gpt-4o`, `claude-3-5-sonnet`) for complex logic or coding tasks.
- **Sliding Window Conversation Memory**: Dynamically caps chat history turns.
- **Output Constraining**: Injects strict schema constraints and anti-filler system rules to limit expensive output tokens.

---

## 🖥️ Macintosh System 7 & CRT Terminal Retro Dashboard

Includes an authentic retro Macintosh CRT web dashboard displaying:
- **Real-Time Savings Telemetry** (USD saved, tokens saved, cache hit rate, response latencies).
- **Interactive Gateway Playground** (Live prompt testing, layer toggles, and side-by-side prompt compression diffs).
- **Searchable Request Telemetry Logs** & **Semantic Vector Cache Inspector**.

---

## 🚀 Quickstart Guide

### 1. Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/neuralgate-ai.git
cd neuralgate-ai

# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Running Locally

```bash
# Terminal 1: Start Gateway Proxy Server (Port 5000)
cd server
npm run start

# Terminal 2: Start Retro Dashboard UI (Port 3000)
cd client
npm run dev
```

Open **`http://localhost:3000`** in your browser to access the Gateway Dashboard!

---

## 🔌 Connecting to Your Code / AI Frameworks

NeuralGate is **100% OpenAI-Compatible**. Simply change the `baseURL` in your script or framework to `http://localhost:5000/v1`:

### Python Example:
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:5000/v1",
    api_key="anything"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Please kindly summarize the report."}]
)

print(response.choices[0].message.content)
```

---

## 🛡️ License

MIT License. Built for high-performance AI cost optimization.
