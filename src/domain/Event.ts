/**
 * @deprecated Replaced with EventMessage
 */
export interface EventDto {
    aggregateId: string,
    aggregateVersion: number,
    name: string,
    payload: any,
    occurredAt: Date
}

export interface EventPayload {
    [index: string]: any;
}

export class Event <TPayload extends EventPayload> {
    readonly aggregateId: string;
    readonly aggregateVersion: number;
    readonly name: string;
    readonly payload: TPayload;
    readonly occurredAt: Date;

    constructor(aggregateId: string, aggregateVersion: number, name: string, payload: TPayload, occurredAt: Date) {
        this.aggregateId = aggregateId;
        this.aggregateVersion = aggregateVersion;
        this.name = name;
        this.payload = payload;
        this.occurredAt = occurredAt;
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