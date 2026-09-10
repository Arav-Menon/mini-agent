import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { Agent } from "./agent.js";

const rl = createInterface({
    input: stdin,
    output: stdout
});

const agent = new Agent(
    "./workspace"
);

console.log("🤖 Mini Coding Agent");
console.log("Type 'exit' to quit.\n");

while (true) {

    const prompt = await rl.question(
        "You: "
    );

    if (prompt === "exit") {
        break;
    }

    try {

        const answer =
            await agent.run(prompt);

        console.log(
            `\nAgent: ${answer}\n`
        );

    } catch (error) {

        console.error(
            "\nAgent error:",
            error
        );
    }
}

rl.close();