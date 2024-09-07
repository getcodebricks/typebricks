export abstract class Command<TCommandPayload> {
    constructor (readonly payload: TCommandPayload) {
        this.payload = Object.freeze(payload);
    }
}