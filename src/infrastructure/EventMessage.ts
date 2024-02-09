import { gzip, ungzip } from "node-gzip";

export interface IEventMessage {
    streamName: string;
    no: number;
    aggregateId: string;
    aggregateVersion: number;
    name: string;
    payload: string;
    occurredAt: Date;
    compressed?: boolean;
}

export class EventMessage {
    streamName: string;
    no: number;
    aggregateId: string;
    aggregateVersion: number;
    name: string;
    payload: string;
    occurredAt: Date;
    compressed: boolean;

    constructor (props: IEventMessage) {
        this.streamName = props.streamName;
        this.no = props.no;
        this.aggregateId = props.aggregateId;
        this.aggregateVersion = props.aggregateVersion;
        this.name = props.name;
        this.payload = props.payload;
        this.occurredAt = props.occurredAt;
        this.compressed = props?.compressed ?? false;
    }

    async compressPayload(): Promise<EventMessage> {
        if (!this.compressed) {
            const payloadCompressed: string = (await gzip(this.payload)).toString('base64');
            return new EventMessage({
                ...this,
                payload: payloadCompressed,
                compressed: true
            });
        } 
        throw new Error('Payload is already compressed');
    }

    async uncompressPayload(): Promise<EventMessage> {
        if (this.compressed) {
            const payloadUncompressed = (await ungzip(Buffer.from(this.payload, 'base64'))).toString();
            return new EventMessage({
                ...this,
                payload: payloadUncompressed,
                compressed: false
            });
        }
        throw new Error('Payload is not compressed');
    }
}