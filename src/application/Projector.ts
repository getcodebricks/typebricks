import { BaseEntity } from "typeorm";
import { EventMessage } from "../infrastructure/EventMessage";
import { InboundEvent } from "./InboundEvent";
import { IProjectionRepositoryMethods, ProjectionRepository } from "../infrastructure/ProjectionRepository";
import { ProjectionInboxEntity } from "../infrastructure/ProjectionInboxEntity";
import { ProjectionPositionEntity } from "../infrastructure/ProjectionPositionEntity";

export type ProjectMethods = {
    [key: string]: (eventMessage: InboundEvent<any>, methods: IProjectionRepositoryMethods<any>) => Promise<void>;
};

export abstract class Projector<TProjectionEntity extends BaseEntity> {
    abstract projectionName: string;
    abstract projectMethods: ProjectMethods;
    abstract streamNames: string[];

    constructor(readonly repository: ProjectionRepository<ProjectionInboxEntity, ProjectionPositionEntity, BaseEntity, IProjectionRepositoryMethods<any>>) {
    }

    async acceptIntoInbox(eventMessage: EventMessage): Promise<void> {
        const inboxEventMessage: EventMessage = eventMessage.compressed ? await eventMessage.uncompressPayload() : eventMessage;
        await this.repository.insertIntoInbox(
            inboxEventMessage.no,
            this.projectionName,
            inboxEventMessage.streamName,
            JSON.stringify(inboxEventMessage)
        );
    }

    async projectFromInbox(): Promise<void> {
        for (const streamName of this.streamNames) {
            var keepProjecting: boolean = true;
            while (keepProjecting) {
                const lastProjectedNo: number | null = await this.repository.projectNextInboxEvent(
                    this.projectionName,
                    streamName,
                    async (eventMessage: EventMessage, methods: IProjectionRepositoryMethods<TProjectionEntity>) => {
                        const projectionMethod: string = `${streamName}.${eventMessage.name}`;
                        await this.projectMethods[projectionMethod](
                            {
                                streamName: eventMessage.streamName,
                                no: eventMessage.no,
                                id: eventMessage.id,
                                aggregateId: eventMessage.aggregateId,
                                aggregateVersion: eventMessage.aggregateVersion,
                                name: eventMessage.name,
                                payload: JSON.parse(eventMessage.payload),
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
