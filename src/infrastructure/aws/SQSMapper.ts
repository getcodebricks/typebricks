import { EventMessage } from "../persistence/aggregate/EventMessage";
import { SQSEvent, SQSRecord } from "./SQS";

export function toEventMessages(event: SQSEvent): EventMessage[] {
    return event.Records.map((record: SQSRecord) => {
        const body = JSON.parse(record.body);
        return new EventMessage({
            streamName: body.streamName,
            no: body.no,
            id: body.id,
            aggregateId: body.aggregateId,
            aggregateVersion: body.aggregateVersion,
            name: body.name,
            payload: body.payload,
            occurredAt: body.occurredAt,
            compressed: body.compressed
        });
    });
}