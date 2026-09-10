import { readFile } from "node:fs/promises";
import path from "node:path";

import type { AgentTool } from "../src/types.js";

export const readFileTool: AgentTool = {
    name: "read_file",

    description:
        "Read a file from the workspace.",

    parameters: {
        type: "object",

        properties: {
            path: {
                type: "string",
                description: "Path of the file relative to workspace"
            }
        },

        required: ["path"]
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

            const content = await readFile(
                filePath,
                "utf8"
            );

            return content;

        } catch (error) {

            return `Error reading file: ${error}`;
        }
    }
};