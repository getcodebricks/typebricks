import { Projector } from "../../application/Projector";
import { EventMessage } from "../persistence/aggregate/EventMessage";
import { toSnakeCase } from "../../utils/toSnakeCase";

/**
 * Recreates a projection from the start of the eventstream
 * 
 * Demos: 
 * 
 * - [Recreating](https://codebricks.tech/docs/code/techniques/event-replaying)
 * 
 */
class ProjectionRecreator {

    /**
     * Initializes ProjectionRecreator
     * 
     * @param projector - Projection's projector
     */
    constructor(
        private readonly projector: Projector,
    ) {
    }

    /**
     * Recreate projection from the start of the eventstream.
     * @returns 
     */
    async recreateProjection(): Promise<void> {
        for (const streamName of this.projector.streamNames) {
            const eventStreamName: string = this.getEventStreamNameFromProjectorStreamName(streamName);
            await this.acceptEventsIntoInbox(eventStreamName, streamName);
        }

        await this.projector.projectFromInbox();
    }

    private getEventStreamNameFromProjectorStreamName(streamName: string): string {
        const aggregateName: string | undefined = streamName.split('.')[1];
        if (aggregateName === undefined) {
            throw new Error(`Stream name does not is not in format 'BoundedContext.Aggregate'`);
        }
        const eventStreamName: string = toSnakeCase(`${aggregateName} event stream`);

        return eventStreamName;
    }

    private async acceptEventsIntoInbox(eventStreamName: string, streamName: string) {
        var offset: number = 0;
        const limit: number = 100;
        var continueFetching: boolean = true;
        while (continueFetching) {
            const eventResult = await this.projector.repository.datasource.query(`SELECT * FROM ${eventStreamName} WHERE no IS NOT NULL ORDER BY no LIMIT ${limit} OFFSET ${offset};`);
            if (eventResult.length === 0) {
                continueFetching = false;
            } else {
                await this.projector.acceptIntoInbox(
                    eventResult.map((event: any) => {
                        return new EventMessage({
                            streamName: streamName,
                            no: event.no,
                            id: event.id,
                            name: event.name,
                            aggregateId: event.aggregate_id,
                            aggregateVersion: event.aggregate_version,
                            occurredAt: event.occurred_at,
                            payload: event.payload,
                        })
                    }),
                );
                offset = offset + eventResult.length;
            }
        }
    }
}

export { ProjectionRecreator };
