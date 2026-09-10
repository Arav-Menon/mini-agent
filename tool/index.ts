import type { AgentTool } from "../src/types.js";

import { readFileTool } from "./read-file.js";
import { writeFileTool } from "./write-file.js";
import { runCommandTool } from "./exe-command.js";
import { rememberTool } from "./remember.js";

export const tools: AgentTool[] = [
    readFileTool,
    writeFileTool,
    runCommandTool,
    rememberTool
];