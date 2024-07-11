import { EventMessage } from "../infrastructure/persistence/aggregate/EventMessage";
import { PolicyInboxEntity } from "../infrastructure/consuming/PolicyInboxEntity";
import { PolicyPositionEntity } from "../infrastructure/consuming/PolicyPositionEntity";
import { PolicyRepository } from "../infrastructure/consuming/PolicyRepository";
import { InboundEvent } from "./errors/InboundEvent";

export type ProcessMethods = {
    [key: string]: (eventMessage: InboundEvent<any>) => Promise<void>;
};

export abstract class Policy {
    abstract useCaseName: string;
    abstract processMethods: ProcessMethods;
    abstract streamNames: string[];

    constructor(readonly repository: PolicyRepository<PolicyInboxEntity, PolicyPositionEntity>) {
    }

    async acceptIntoInbox(eventMessage: EventMessage): Promise<void> {
        const inboxEventMessage: EventMessage = eventMessage.compressed ? await eventMessage.uncompressPayload() : eventMessage;
        await this.repository.insertIntoInbox(
            inboxEventMessage.no!,
            this.useCaseName,
            inboxEventMessage.streamName,
            JSON.stringify(inboxEventMessage)
        );
    }

    async processFromInbox(): Promise<void> {
        for (const streamName of this.streamNames) {
            var keepProcessing: boolean = true;
            while (keepProcessing) {
                const lastProcessedNo: number | null = await this.repository.processNextInboxEvent(
                    this.useCaseName,
                    streamName,
                    async (eventMessage: EventMessage) => {
                        const processionMethod: string = `${streamName}.${eventMessage.name}`;
                        await this.processMethods[processionMethod](
                            {
                                streamName: eventMessage.streamName,
                                no: eventMessage.no!,
                                id: eventMessage.id,
                                aggregateId: eventMessage.aggregateId,
                                aggregateVersion: eventMessage.aggregateVersion,
                                name: eventMessage.name,
                                payload: JSON.parse(eventMessage.payload),
                                occurredAt: eventMessage.occurredAt,
                            }
                        );
                    }
                );

                if (!lastProcessedNo) {
                    keepProcessing = false;
                }
            }
        }
    }
}
