export class InboundEvent<TPayload> {
    constructor(
        readonly streamName: string,
        readonly no: number,
        readonly aggregateId: string,
        readonly aggregateVersion: number,
        readonly payload: TPayload,
        readonly occurredAt: Date
    ) {}
}