import { Projector } from "../../application/Projector";
import { EventMessage } from "../persistence/aggregate/EventMessage";
import { toSnakeCase } from "../../utils/toSnakeCase";

class ProjectionRecreator {
    constructor(
        private readonly projector: Projector<any>,
    ) {
    }

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
        var continueFetching: boolean = true;
        while (continueFetching) {
            const eventResult = await this.projector.repository.datasource.query(`SELECT * FROM ${eventStreamName} LIMIT 1 OFFSET ${offset};`);
            if (eventResult.length === 0) {
                continueFetching = false;
            } else {
                const event = eventResult[0];
                await this.projector.acceptIntoInbox(new EventMessage({
                    streamName: streamName,
                    no: event.no,
                    id: event.id,
                    name: event.name,
                    aggregateId: event.aggregate_id,
                    aggregateVersion: event.aggregate_version,
                    occurredAt: event.occurred_at,
                    payload: event.payload,
                }));
                offset++;
            }
        }
    }
}

export { ProjectionRecreator };
