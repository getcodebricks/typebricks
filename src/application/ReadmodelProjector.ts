import { BaseEntity } from "typeorm";
import { EventMessage } from "../infrastructure/EventMessage";
import { IProjectionRepositoryMethods } from "../infrastructure/ReadmodelRepository";

export abstract class ReadmodelProjector<TReadModelEntity extends BaseEntity> {
    abstract readmodelName: string;
    abstract projectMethods: any ;
    abstract streamNames: string[];

    constructor(readonly repository: any) {
    }

    async acceptIntoInbox(eventMessage: EventMessage): Promise<void> {
        const inboxEventMessage: EventMessage = eventMessage.compressed ? await eventMessage.uncompressPayload() : eventMessage;
        await this.repository.insertIntoInbox(
            inboxEventMessage.no,
            this.readmodelName,
            inboxEventMessage.streamName,
            JSON.stringify(inboxEventMessage)
        );
    }

    async projectFromInbox(): Promise<void> {
        var keepProjecting: boolean = true;
        while (keepProjecting) {
            const lastProjectedNo: number | null = await this.repository.projectNextInboxEvent(
                this.readmodelName,
                this.streamNames[0],
                async (eventMessage: EventMessage, methods: IProjectionRepositoryMethods<TReadModelEntity>) => {
                    const projectionMethod: string = `${this.streamNames[0]}.${eventMessage.name}`;
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
        };
    }
}
