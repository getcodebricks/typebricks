import { EventMessage } from "../infrastructure/persistence/aggregate/EventMessage";
import { PolicyInboxEntity } from "../infrastructure/consuming/PolicyInboxEntity";
import { PolicyPositionEntity } from "../infrastructure/consuming/PolicyPositionEntity";
import { PolicyRepository } from "../infrastructure/consuming/PolicyRepository";
import { InboundEvent } from "./InboundEvent";

export type ProcessMethods = {
    [key: string]: (inboundEvent: InboundEvent<any>) => Promise<void>;
};

/**
 * Handles processing of consumed events.
 * 
 * Demos: 
 * 
 * - [Consuming](https://codebricks.tech/docs/code/techniques/consuming)
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
    async acceptIntoInbox(eventMessages: EventMessage[]): Promise<void> {
        await this.repository.insertIntoInbox(
            await Promise.all(
                eventMessages.map(async (eventMessage: EventMessage) => (
                    {
                        id: eventMessage.id!,
                        no: eventMessage.no!,
                        useCaseName: this.useCaseName,
                        streamName: eventMessage.streamName,
                        message: JSON.stringify(eventMessage.compressed ? await eventMessage.uncompressPayload() : eventMessage)
                    }
                ))
            ),
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
                    async (inboundEvent: InboundEvent<any>) => {
                        const processingMethod: string = `${streamName}.${inboundEvent.name}`;
                        await this.processMethods[processingMethod](inboundEvent);
                    }
                );

                if (!lastProcessedNo) {
                    keepProcessing = false;
                }
            }
        }
    }
}
