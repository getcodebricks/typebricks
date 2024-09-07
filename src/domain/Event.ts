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

    get id(): string {
        return this.properties.id;
    }

    get aggregateId(): string {
        return this.properties.aggregateId;
    }

    get aggregateVersion(): number {
        return this.properties.aggregateVersion;
    }

    get name(): string {
        return this.properties.name;
    }

    get payload(): TPayload {
        return this.properties.payload;
    }

    get occurredAt(): Date {
        return this.properties.occurredAt;
    }
}