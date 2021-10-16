import { Aggregate } from "./Aggregate";

class CommandHandler {
    constructor() {
    }

    async save(aggregate: Aggregate): Promise<any> {
        for (const event in await aggregate.getEvents()) {
        }
    }
}

export { CommandHandler };
