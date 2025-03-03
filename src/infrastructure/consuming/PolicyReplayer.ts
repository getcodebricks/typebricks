import { Policy } from "../../application/Policy";
import { EventMessage } from "../persistence/aggregate/EventMessage";
import { toSnakeCase } from "../../utils/toSnakeCase";

/**
 * Replayes a policy from the start of the eventstream
 * 
 * Demos: 
 * 
 * - [Receating](https://codebricks.tech/docs/code/techniques/event-replaying)
 * 
 */
class PolicyReplayer {

    /**
     * Initializes PolicyReplayer
     * 
     * @param policy - Policy's policy
     */
    constructor(
        private readonly policy: Policy,
    ) {
    }

    /**
     * Replaye policy from the start of the eventstream.
     * @returns 
     */
    async replayPolicy(): Promise<void> {
        for (const streamName of this.policy.streamNames) {
            const eventStreamName: string = this.getEventStreamNameFromPolicyStreamName(streamName);
            await this.acceptEventsIntoInbox(eventStreamName, streamName);
        }

        await this.policy.processFromInbox();
    }

    private getEventStreamNameFromPolicyStreamName(streamName: string): string {
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
            const eventResult = await this.policy.repository.queryRunner.manager.query(`SELECT * FROM ${eventStreamName} WHERE no IS NOT NULL ORDER BY no LIMIT ${limit} OFFSET ${offset};`);
            if (eventResult.length === 0) {
                continueFetching = false;
            } else {
                await this.policy.acceptIntoInbox(
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

export { PolicyReplayer };
