export interface InboundEventProperties<TPayload> {
    streamName: string;
    no: number;
    id: string;
    aggregateId: string;
    aggregateVersion: number;
    name: string;
    payload: TPayload;
    occurredAt: Date;
}

export class InboundEvent<TPayload> {
    streamName: string;
    no: number;
    id: string;
    aggregateId: string;
    aggregateVersion: number;
    name: string;
    payload: TPayload;
    occurredAt: Date;

    constructor (readonly props: InboundEventProperties<TPayload>) {
        this.streamName = props.streamName;
        this.no = props.no;
        this.id = props.id;
        this.aggregateId = props.aggregateId;
        this.aggregateVersion = props.aggregateVersion;
        this.name = props.name;
        this.payload = props.payload;
        this.occurredAt = props.occurredAt;
    }
}