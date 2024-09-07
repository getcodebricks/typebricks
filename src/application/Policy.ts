import { EventMessage } from "../infrastructure/persistence/aggregate/EventMessage";
import { PolicyInboxEntity } from "../infrastructure/consuming/PolicyInboxEntity";
import { PolicyPositionEntity } from "../infrastructure/consuming/PolicyPositionEntity";
import { PolicyRepository } from "../infrastructure/consuming/PolicyRepository";
import { InboundEvent } from "./InboundEvent";

export type ProcessMethods = {
    [key: string]: (eventMessage: InboundEvent<any>) => Promise<void>;
};

/**
 * Handles processing of consumed events.
 * 
 * Demos: 
 * 
 * - [Consuming](https://getcodebricks.com/docs/consuming)
 * 
 */
export abstract class Policy {
    abstract useCaseName: string;
    abstract processMethods: ProcessMethods;
    abstract streamNames: string[];

    /**
     * Initializes Policy
     * 
     * @param repository - Policy's repository
     */
    constructor(readonly repository: PolicyRepository<PolicyInboxEntity, PolicyPositionEntity>) {
    }

    /**
     * Accepts event, decompresses it and passes it to the repository to persist.
     * 
     * @param eventMessage
     * @returns 
     */
    async acceptIntoInbox(eventMessage: EventMessage): Promise<void> {
        const inboxEventMessage: EventMessage = eventMessage.compressed ? await eventMessage.uncompressPayload() : eventMessage;
        await this.repository.insertIntoInbox(
            inboxEventMessage.no!,
            this.useCaseName,
            inboxEventMessage.streamName,
            JSON.stringify(inboxEventMessage)
        );
    }

    /**
     * Processes events from all streams until there is none left in the inbox.
     * 
     * @returns
     */
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
