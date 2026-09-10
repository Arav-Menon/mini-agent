import type { AgentTool } from "../src/types.js";

export const rememberTool: AgentTool = {
    name: "remember",

    description:
        "Store an important fact that should be remembered in future conversations.",

    parameters: {
        type: "object",

        properties: {
            memory: {
                type: "string",
                description:
                    "The important fact to remember"
            }
        },

        required: ["memory"]
    },

    async execute(args, context) {

        await context.memory.add(args.memory);

        return `Memory saved: ${args.memory}`;
    }
};