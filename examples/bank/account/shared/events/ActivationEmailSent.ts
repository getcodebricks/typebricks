import { Event, EventPayload } from "../../../../../src/domain/Event";

export interface ActivationEmailSentPayload extends EventPayload {
    status: string;
}

export class ActivationEmailSent extends Event<ActivationEmailSentPayload> {
    constructor(aggregateId: string, aggregateVersion: number, payload: ActivationEmailSentPayload, occurredAt: Date = new Date()) {
        super(
            aggregateId,
            aggregateVersion,
            ActivationEmailSent.name,
            payload,
            occurredAt
        );
    }
}