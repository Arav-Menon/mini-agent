import { callModel } from "./model.js";
import { buildContext } from "./context.js";
import { MemoryStore } from "./memory.js";
import { tools } from "../tool/index.js";

import type { Message } from "./types.js";

export class Agent {

    private memory: MemoryStore;

    constructor(
        private workspace: string
    ) {
        this.memory = new MemoryStore(
            "./memory.json"
        );
    }

    async run(userPrompt: string) {

        const messages: Message[] = [
            ...(await buildContext(this.memory)),

            {
                role: "user",
                content: userPrompt
            }
        ];

        while (true) {

            console.log("\n🤖 Thinking...\n");

            const response = await callModel(
                messages,
                tools
            );

            console.log(response)

            /*
             * Add assistant response
             * to conversation context.
             */
            messages.push({
                role: "assistant",
                content: response.content ?? ""
            });

            /*
             * No tool call means
             * agent is finished.
             */
            if (
                !response.tool_calls ||
                response.tool_calls.length === 0
            ) {

                return response.content;
            }

            /*
             * Agent requested tools.
             */
            for (const toolCall of response.tool_calls) {

                const toolName =
                    toolCall.function.name;

                const args =
                    toolCall.function.arguments;

                console.log(
                    `🔧 Tool: ${toolName}`,
                    args
                );

                const tool =
                    tools.find(
                        (tool) => tool.name === toolName
                    );

                if (!tool) {

                    messages.push({
                        role: "tool",
                        content:
                            `Tool ${toolName} not found.`,
                        name: toolName
                    });

                    continue;
                }

                /*
                 * Execute the tool.
                 */
                const result =
                    await tool.execute(
                        args,
                        {
                            workspace: this.workspace,

                            memory: {
                                add: (memory) =>
                                    this.memory.add(memory)
                            }
                        }
                    );

                console.log(
                    `📦 Result:\n${result}\n`
                );

                /*
                 * Give tool result
                 * back to the model.
                 */
                messages.push({
                    role: "tool",
                    name: toolName,
                    content: result
                });
            }

            /*
             * Loop starts again.
             *
             * LLM now sees:
             *
             * previous request
             * +
             * tool call
             * +
             * tool result
             *
             * and decides what to do next.
             */
        }
    }
}