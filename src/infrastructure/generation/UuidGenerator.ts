import { v4 as uuid } from "uuid";

export class UuidGenerator {
    static uuid(): string {
        return uuid();
    }
}
