import { EventBridgeClient, PutEventsCommand, PutEventsResponse } from "@aws-sdk/client-eventbridge";
import { DataSource, FindManyOptions, ObjectType } from "typeorm";
import { EventMessage } from "./EventMessage";
import { OutboxEntity } from "./OutboxEntity";

export class Publisher<T extends OutboxEntity> {
    readonly client: EventBridgeClient = new EventBridgeClient({});

    constructor(readonly appDataSource: DataSource, readonly outBoxEntity: ObjectType<T>, readonly aggregateName: string, readonly contextName: string) {
    }

    async initDataSource(): Promise<void> {
        if (!this.appDataSource.isInitialized) {
            await this.appDataSource.initialize()
                .then(() => { })
                .catch((err) => {
                    console.error("Error during Data Source initialization", err);
                });
        }
    }

    async publish(): Promise<(EventMessage | undefined)[]> {
        await this.initDataSource();
        const findOptions: FindManyOptions<OutboxEntity> = {
            order: {
                no: "ASC"
            }
        };
        const outboxEvents: T[] = await this.appDataSource.manager.find(
            this.outBoxEntity,
            findOptions as FindManyOptions<T>
        );
        return await Promise.all(outboxEvents.map(async (outboxEvent: OutboxEntity) => {
            const inboxEventMessage: EventMessage = new EventMessage(JSON.parse(outboxEvent.message));
            const eventMessage: EventMessage = await inboxEventMessage.compressPayload();
            if (await this.sendEvent(eventMessage.name, JSON.stringify(eventMessage))) {
                await this.appDataSource.manager.delete(
                    {
                        type: this.outBoxEntity,
                        name: this.outBoxEntity.name
                    },
                    {
                        no: eventMessage.no
                    }
                );
                return inboxEventMessage;
            }
        }));
    }

    async sendEvent(name: string, message: string): Promise<boolean> {
        const source: string = `${this.contextName}.${this.aggregateName}`;
        const published: PutEventsResponse = await this.client.send(
            new PutEventsCommand({
                Entries: [{
                    EventBusName: String(process.env.EVENT_BUS_NAME),
                    Source: source,
                    DetailType: name,
                    Detail: message,
                }],

            })
        );
        if (published.FailedEntryCount == 0) {
            return true;
        }
        return false;
    }
}
