import { AggregateState } from "./Aggregate";

export interface EventDto {
    aggregateId: string,
    aggregateVersion: number,
    name: string,
    payload: any,
    occuredAt: Date
}

export interface EventPayload {
    [index: string]: any;
}

export class Event <TPayload extends EventPayload> {
    readonly aggregateId: string;
    readonly aggregateVersion: number;
    readonly name: string;
    readonly payload: TPayload;
    readonly occuredAt: Date;

    constructor(aggregateId: string, aggregateVersion: number, name: string, payload: TPayload, occuredAt: Date) {
        this.aggregateId = aggregateId;
        this.aggregateVersion = aggregateVersion;
        this.name = name;
        this.payload = payload;
        this.occuredAt = occuredAt;
    }

    object() {
        return {
            aggregateId: this.aggregateId,
            aggregateVersion: this.aggregateVersion,
            name: this.name,
            payload: JSON.stringify(this.payload),
            occuredAt: this.occuredAt
        }
    }
}