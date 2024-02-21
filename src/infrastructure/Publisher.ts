import { EventBridgeClient, PutEventsCommand, PutEventsResponse } from "@aws-sdk/client-eventbridge";
import { DataSource } from "typeorm";
import { EventMessage } from "./EventMessage";
import { OutboxEntity } from "./OutboxEntity";

export class Publisher {
    readonly client: EventBridgeClient = new EventBridgeClient({});

    constructor(readonly appDataSource: DataSource, readonly outBoxEntity: any, readonly aggregateName: string) {
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

    async publish(): Promise<void> {
        await this.initDataSource();
        const outboxEvents: OutboxEntity[] = await this.appDataSource.manager.find(
            {
                type: this.outBoxEntity,
                name: this.outBoxEntity.name
            },
            {
                order: {
                    no: "ASC"
                }
            }
        );
        await Promise.all(outboxEvents.map(async (outboxEvent: OutboxEntity) => {
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
            }
        }));
    }

    async sendEvent(name: string, message: string): Promise<boolean> {
        const published: PutEventsResponse = await this.client.send(
            new PutEventsCommand({
                Entries: [{
                    EventBusName: String(process.env.EVENT_BUS_NAME),
                    Source: this.aggregateName,
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
