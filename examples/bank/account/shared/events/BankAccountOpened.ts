import { Event, EventPayload } from "../../../../../src/domain/Event";

export interface BankAccountOpenedPayload extends EventPayload {
    customer: {
        email: string,
        firstName: string
    };
    balance: number;
    status: string;
}

export class BankAccountOpened extends Event<BankAccountOpenedPayload> {
    constructor(aggregateId: string, aggregateVersion: number, payload: BankAccountOpenedPayload, occurredAt: Date = new Date()) {
        super(
            aggregateId,
            aggregateVersion,
            BankAccountOpened.name,
            payload,
            occurredAt
        );
    }
}