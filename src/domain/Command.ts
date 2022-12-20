export interface CommandPayload {
    [index: string]: any;
}

export abstract class Command<T extends CommandPayload> {
    public readonly payload: T;

    constructor (payload: T) {
        this.payload = Object.freeze(payload);
    }
}