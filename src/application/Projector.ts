import { BaseEntity } from "typeorm";
import { EventMessage } from "../infrastructure/persistence/aggregate/EventMessage";
import { InboundEvent } from "./InboundEvent";
import { IProjectionRepositoryMethods, ProjectionRepository } from "../infrastructure/consuming/ProjectionRepository";
import { ProjectionInboxEntity } from "../infrastructure/consuming/ProjectionInboxEntity";
import { ProjectionPositionEntity } from "../infrastructure/consuming/ProjectionPositionEntity";
import { parseToDateTime } from "../utils/parseToDateTime";

export type ProjectMethods = {
    [key: string]: (eventMessage: InboundEvent<any>, methods: IProjectionRepositoryMethods) => Promise<void>;
};


/**
 * Handles projecting of consumed events. 
 * 
 * Demos: 
 * 
 * - [Consuming](https://getcodebricks.com/docs/consuming)
 * 
 */
export abstract class Projector {
    abstract projectionName: string;
    abstract projectMethods: ProjectMethods;
    abstract streamNames: string[];

     /**
     * Initializes Projector
     * 
     * @param repository - Projector's repository
     */
    constructor(readonly repository: ProjectionRepository<ProjectionInboxEntity, ProjectionPositionEntity, BaseEntity, IProjectionRepositoryMethods>) {
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
            this.projectionName,
            inboxEventMessage.streamName,
            JSON.stringify(inboxEventMessage)
        );
    }

    /**
     * Projects events from all streams until there is none left in the inbox.
     * 
     * @returns
     */
    async projectFromInbox(): Promise<void> {
        for (const streamName of this.streamNames) {
            var keepProjecting: boolean = true;
            while (keepProjecting) {
                const lastProjectedNo: number | null = await this.repository.projectNextInboxEvent(
                    this.projectionName,
                    streamName,
                    async (eventMessage: EventMessage, methods: IProjectionRepositoryMethods) => {
                        const projectionMethod: string = `${streamName}.${eventMessage.name}`;
                        await this.projectMethods[projectionMethod](
                            {
                                streamName: eventMessage.streamName,
                                no: eventMessage.no!,
                                id: eventMessage.id,
                                aggregateId: eventMessage.aggregateId,
                                aggregateVersion: eventMessage.aggregateVersion,
                                name: eventMessage.name,
                                payload: JSON.parse(eventMessage.payload, parseToDateTime),
                                occurredAt: eventMessage.occurredAt,
                            },
                            methods
                        );
                    }
                );

                if (!lastProjectedNo) {
                    keepProjecting = false;
                }
            }
        }
    }
}
