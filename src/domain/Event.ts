export class Event <TPayload> {
    constructor(readonly aggregateId: string, readonly aggregateVersion: number, readonly name: string, readonly payload: TPayload, readonly occurredAt: Date) {
    }

    object() {
        return {
            aggregateId: this.aggregateId,
            aggregateVersion: this.aggregateVersion,
            name: this.name,
            payload: JSON.stringify(this.payload),
            occurredAt: this.occurredAt
        }
    }
}