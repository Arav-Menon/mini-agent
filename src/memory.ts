import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

export interface MemoryData {
    memories: string[];
}

export class MemoryStore {
    private file: string;

    constructor(file: string = "memory.json") {
        this.file = file;
    }

    async load(): Promise<MemoryData> {
        if (!existsSync(this.file)) {
            return {
                memories: []
            };
        }

        const content = await readFile(this.file, "utf8");

        return JSON.parse(content);
    }

    async add(memory: string): Promise<void> {
        const data = await this.load();

        data.memories.push(memory);

        await writeFile(
            this.file,
            JSON.stringify(data, null, 2)
        );
    }
}