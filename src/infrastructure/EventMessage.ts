import { gzip, ungzip } from "node-gzip";

export class EventMessage {
    streamName: string;
    no: number;
    aggregateId: string;
    aggregateVersion: number;
    name: string;
    payload: string;
    occurredAt: Date;
    compressed: boolean;

    constructor (streamName: string, no: number, aggregateId: string, aggregateVersion: number, name: string, payload: string, occurredAt: Date, compressed: boolean = false) {
        this.streamName = streamName;
        this.no = no;
        this.aggregateId = aggregateId;
        this.aggregateVersion = aggregateVersion;
        this.name = name;
        this.payload = payload;
        this.occurredAt = occurredAt;
        this.compressed = compressed;
    }

    async compressPayload(): Promise<EventMessage> {
        if (!this.compressed) {
            const payloadCompressed: string = (await gzip(this.payload)).toString('base64');
            return new EventMessage(
                this.streamName,
                this.no,
                this.aggregateId,
                this.aggregateVersion,
                this.name,
                payloadCompressed,
                this.occurredAt,
                true
            );
        } 
        throw new Error('Payload is already compressed');
    }

    async uncompressPayload(): Promise<EventMessage> {
        if (this.compressed) {
            const payloadUncompressed = (await ungzip(Buffer.from(this.payload, 'base64'))).toString();
            return new EventMessage(
                this.streamName,
                this.no,
                this.aggregateId,
                this.aggregateVersion,
                this.name,
                payloadUncompressed,
                this.occurredAt,
                false
            );
        }
        throw new Error('Payload is not compressed');
    }

    static fromObject(object: any): EventMessage {
        return new EventMessage(
            object.streamName,
            object.no,
            object.aggregateId,
            object.aggregateVersion,
            object.name,
            object.payload,
            object.occurredAt,
            object?.compressed ? object.compressed : false
        );
    }
}