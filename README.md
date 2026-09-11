# mini-agent

A beginner-friendly coding agent that runs locally using Ollama. No cloud APIs, no API keys — just a small local LLM that can read, write, and execute code in a sandboxed workspace.

This is a **prototype**, not a production agent. It's meant to teach you how agents work from the inside out.

## Who is this for?

If you want to build an AI agent but don't know where to start — this is for you. Read the code, break it, extend it. The goal is to understand the fundamentals.

## Prerequisites

1. **Install Ollama** — https://ollama.com

2. **Pull the model** — use this small model, this is enough:

```bash
ollama pull qwen3:4b
```

3. **Node.js** (v18+) and **pnpm**

## Quick Start

```bash
git clone <repo-url>
cd mini-agent
pnpm install
pnpm dev
```

You'll see a prompt. Start chatting with your agent:

```
You: Read example.ts and explain what it does
You: Create a new file called hello.py with a Flask server
You: Remember that I prefer TypeScript over JavaScript
```

Type `exit` to quit.

## Project Structure

```
mini-agent/
├── src/
│   ├── index.ts        # Entry point — CLI loop
│   ├── agent.ts        # Core agent loop (tool-calling cycle)
│   ├── context.ts      # Builds system prompt, injects memory
│   ├── model.ts        # Calls Ollama API
│   ├── memory.ts       # Persistent memory (read/write memory.json)
│   └── types.ts        # TypeScript type definitions
├── tool/
│   ├── index.ts        # Tool registry
│   ├── read-file.ts    # Tool: read files from workspace
│   ├── write-file.ts   # Tool: create/overwrite files
│   ├── exe-command.ts  # Tool: run shell commands
│   └── remember.ts     # Tool: store facts for future sessions
├── workspace/          # Sandboxed directory the agent operates in
│   ├── example.ts
│   └── example.py
├── memory.json         # Persistent memory store
├── package.json
└── tsconfig.json
```

## How It Works

The agent follows a simple loop — this is the core pattern behind most AI agents:

```
┌─────────────────────────────────────────────────┐
│                  USER INPUT                      │
└──────────────────────┬──────────────────────────┘
                       │
                       v
┌─────────────────────────────────────────────────┐
│            BUILD CONTEXT                         │
│  Load memory.json → inject into system prompt   │
│  Prepend system message + user message          │
└──────────────────────┬──────────────────────────┘
                       │
                       v
┌─────────────────────────────────────────────────┐
│              CALL LLM (qwen3:4b)                │
│  Send messages + tool definitions to Ollama     │
└──────────────────────┬──────────────────────────┘
                       │
                       v
┌─────────────────────────────────────────────────┐
│           LLM RESPONDS                          │
│  Does it want to call a tool?                   │
└──────┬──────────────────────────┬───────────────┘
       │                          │
       │ YES                      │ NO
       v                          v
┌──────────────────┐    ┌─────────────────────────┐
│  EXECUTE TOOL    │    │  RETURN FINAL ANSWER    │
│  read_file /     │    │  Print to user,         │
│  write_file /    │    │  loop back to input     │
│  run_command /   │    └─────────────────────────┘
│  remember        │
└────────┬─────────┘
         │
         v
┌─────────────────────────────────────────────────┐
│         FEED RESULT BACK TO LLM                 │
│  Push tool result into messages array           │
│  Loop back → CALL LLM                           │
└─────────────────────────────────────────────────┘
```

The LLM keeps calling tools and seeing results until it has enough information to give a final answer. This is called a **ReAct loop** (Reason + Act).

## Tools

The agent has 4 tools it can use:

| Tool | Description |
|------|-------------|
| `read_file` | Read a file from the workspace |
| `write_file` | Create or overwrite a file in the workspace |
| `run_command` | Execute a shell command (30s timeout, 1MB buffer) |
| `remember` | Store a fact that persists across conversations |

Both `read_file` and `write_file` validate that paths stay inside the workspace — the agent can't escape the sandbox.

## Memory System

The agent has persistent memory stored in `memory.json`. Here's how it works:

1. **On startup** — `context.ts` loads all memories from `memory.json` and injects them into the system prompt
2. **During conversation** — if the LLM decides something is worth remembering, it calls the `remember` tool
3. **The `remember` tool** — appends the fact to `memory.json`
4. **Next session** — the agent loads the updated memories, so it remembers past conversations

Example `memory.json`:

```json
{
  "memories": [
    "user prefers Python over JavaScript",
    "project uses PostgreSQL database",
    "deployment happens on AWS"
  ]
}
```

## Where to Start Reading

Read the code in this order:

1. **`src/index.ts`** — The entry point. See how the CLI loop works and how the agent is instantiated.

2. **`src/agent.ts`** — The core loop. This is where the magic happens. Understand how messages flow between the user, the LLM, and the tools.

3. **`src/context.ts`** — How the system prompt is built and how memory gets injected.

4. **`src/model.ts`** — How the agent talks to Ollama. Just a single POST request with messages and tool definitions.

5. **`src/memory.ts`** — Simple JSON file read/write for persistent memory.

6. **`tool/`** — Each tool is self-contained. Start with `tool/remember.ts` (simplest), then `tool/read-file.ts`, `tool/write-file.ts`, and `tool/exe-command.ts`.

7. **`src/types.ts`** — The shared interfaces that tie everything together.

## Adding Your Own Tool

Creating a new tool takes 2 steps:

**Step 1: Create the tool file** in `tool/`:

```typescript
import type { AgentTool } from "../src/types.js";

export const myTool: AgentTool = {
    name: "my_tool",

    description: "Description the LLM sees when deciding which tool to use.",

    parameters: {
        type: "object",
        properties: {
            input: {
                type: "string",
                description: "What this parameter does"
            }
        },
        required: ["input"]
    },

    async execute(args, context) {
        // args.input contains the value the LLM passed
        // context.workspace is the sandboxed directory
        // context.memory.add() stores a memory

        return `Result: did something with ${args.input}`;
    }
};
```

**Step 2: Register it** in `tool/index.ts`:

```typescript
import { myTool } from "./my-tool.js";

export const tools: AgentTool[] = [
    readFileTool,
    writeFileTool,
    runCommandTool,
    rememberTool,
    myTool           // <-- add here
];
```

That's it. The LLM will now see your tool in its available tools list and can call it when relevant.

## Tech Stack

- **Runtime** — Node.js + TypeScript (via `tsx`, no build step)
- **LLM** — Ollama running `qwen3:4b` locally
- **HTTP** — Axios for Ollama API calls
- **Memory** — Plain JSON file (`memory.json`)
- **Modules** — ESM (`"type": "module"`)
