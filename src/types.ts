export type MessageRole =
    | "system"
    | "user"
    | "assistant"
    | "tool";

export interface Message {
    role: MessageRole;
    content: string;
    tool_call_id?: string;
    name?: string;
}

export interface ToolContext {
    workspace: string;
    memory: {
        add(memory: string): Promise<void>;
    };
}

export interface AgentTool {
    name: string;
    description: string;

    parameters: {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
    };

    execute(
        args: Record<string, any>,
        context: ToolContext
    ): Promise<string>;
}