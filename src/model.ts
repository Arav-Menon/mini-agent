import axios from "axios";
import type { Message, AgentTool } from "./types.js";

const OLLAMA_URL =
    "http://localhost:11434/api/chat";

const MODEL = "qwen3:4b";

export async function callModel(
    messages: Message[],
    tools: AgentTool[]
) {

    const response = await axios.post(
        OLLAMA_URL,
        {
            model: MODEL,

            messages,

            tools: tools.map((tool) => ({
                type: "function",

                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters
                }
            })),

            stream: false
        },
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    return response.data.message;
}           