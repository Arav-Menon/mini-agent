import type { Message } from "./types.js";
import type { MemoryStore } from "./memory.js";

export async function buildContext(
    memoryStore: MemoryStore
): Promise<Message[]> {

    const memory = await memoryStore.load();

    const memoryText =
        memory.memories.length > 0
            ? memory.memories.map((m) => `- ${m}`).join("\n")
            : "No stored memories.";

    return [
        {
            role: "system",
            content: `
You are a coding agent.

You work inside a workspace directory.

Your job is to help the user modify and understand their code.

Rules:

1. Use tools when you need information or need to modify files.
2. Never pretend you executed a command if you didn't.
3. When modifying code, inspect the relevant files first.
4. Keep changes focused.
5. Explain what you did after finishing.

IMPORTANT:

You have persistent memories about the user/project.

MEMORY:
${memoryText}
`
        }
    ];
}