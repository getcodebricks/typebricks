import { gzip, ungzip } from "node-gzip";

export interface IEventMessage {
    streamName: string;
    no?: number;
    id: string;
    aggregateId: string;
    aggregateVersion: number;
    name: string;
    payload: string;
    occurredAt: Date;
    compressed?: boolean;
}

/**
 * Generic event message used for consuming and publishing
 * 
 * Demos: 
 * 
 * - [Publishing](https://codebricks.tech/docs/code/techniques/publishing)
 * - [Consuming](https://codebricks.tech/docs/code/techniques/consuming)
 * 
 */
export class EventMessage {
    streamName: string;
    no?: number;
    id: string;
    aggregateId: string;
    aggregateVersion: number;
    name: string;
    payload: string;
    occurredAt: Date;
    compressed: boolean;

    constructor (props: IEventMessage) {
        this.streamName = props.streamName;
        this.no = props.no;
        this.id = props.id;
        this.aggregateId = props.aggregateId;
        this.aggregateVersion = props.aggregateVersion;
        this.name = props.name;
        this.payload = props.payload;
        this.occurredAt = props.occurredAt;
        this.compressed = props?.compressed ?? false;
    }

    /**
     * Compresses event payload using gzip
     * 
     * @returns Compressed event message
     */
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

    /**
     * Uncompresses event payload using gzip
     * 
     * @returns Uncompressed event message
     */
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