import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import type { AgentTool } from "../src/types.js";

export const writeFileTool: AgentTool = {
    name: "write_file",

    description:
        "Create or overwrite a file inside the workspace.",

    parameters: {
        type: "object",

        properties: {
            path: {
                type: "string",
                description: "Path relative to workspace"
            },

            content: {
                type: "string",
                description: "Complete file content"
            }
        },

        required: ["path", "content"]
    },

    async execute(args, context) {

        const filePath = path.resolve(
            context.workspace,
            args.path
        );

        const workspace = path.resolve(context.workspace);

        if (!filePath.startsWith(workspace)) {
            return "Error: Cannot access files outside workspace.";
        }

        try {

            await mkdir(
                path.dirname(filePath),
                { recursive: true }
            );

            await writeFile(
                filePath,
                args.content,
                "utf8"
            );

            return `Successfully wrote ${args.path}`;

        } catch (error) {

            return `Error writing file: ${error}`;
        }
    }
};