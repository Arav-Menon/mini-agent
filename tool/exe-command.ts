import { exec } from "node:child_process";
import { promisify } from "node:util";

import type { AgentTool } from "../src/types.js";

const execAsync = promisify(exec);

export const runCommandTool: AgentTool = {
    name: "run_command",

    description:
        "Run a shell command inside the workspace.",

    parameters: {
        type: "object",

        properties: {
            command: {
                type: "string",
                description: "Shell command to execute"
            }
        },

        required: ["command"]
    },

    async execute(args, context) {

        try {

            const result = await execAsync(
                args.command,
                {
                    cwd: context.workspace,
                    timeout: 30_000,
                    maxBuffer: 1024 * 1024
                }
            );

            return `
STDOUT:
${result.stdout}

STDERR:
${result.stderr}
`;

        } catch (error: any) {

            return `
Command failed.

STDOUT:
${error.stdout ?? ""}

STDERR:
${error.stderr ?? ""}

ERROR:
${error.message}
`;
        }
    }
};