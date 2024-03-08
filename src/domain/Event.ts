export interface EventProperties<TPayload> {
    id: string;
    aggregateId: string;
    aggregateVersion: number;
    name: string;
    payload: TPayload;
    occurredAt: Date;
}

export class Event <TPayload> {
    constructor(readonly properties: EventProperties<TPayload>) {}

    object() {
        return {
            id: this.properties.id,
            aggregateId: this.properties.aggregateId,
            aggregateVersion: this.properties.aggregateVersion,
            name: this.properties.name,
            payload: JSON.stringify(this.properties.payload),
            occurredAt: this.properties.occurredAt
        }
    }
}