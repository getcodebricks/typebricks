import { Event, EventPayload } from "../../../../../src/domain/Event";

export interface BankAccountTransactionAppendedPayload extends EventPayload {
    newBalance: number;
}

export class BankAccountTransactionAppended extends Event<BankAccountTransactionAppendedPayload> {
    constructor(aggregateId: string, aggregateVersion: number, payload: BankAccountTransactionAppendedPayload, occuredAt: Date = new Date()) {
        super(
            aggregateId,
            aggregateVersion,
            BankAccountTransactionAppended.name,
            payload,
            occuredAt
        );
    }
}