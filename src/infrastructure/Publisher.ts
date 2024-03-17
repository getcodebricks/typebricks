import { EventBridgeClient, PutEventsCommand, PutEventsResponse } from "@aws-sdk/client-eventbridge";
import { DataSource, EntityManager, ObjectType } from "typeorm";
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
        await this.appDataSource.manager.transaction("READ COMMITTED", async (transactionalEntityManager: EntityManager) => {
            const outboxEvents = await transactionalEntityManager
                .getRepository(this.outBoxEntity)
                .createQueryBuilder(this.outBoxEntity.name)
                .setLock("pessimistic_write")
                .setOnLocked("skip_locked")
                .limit(10)
                .getMany();

            await Promise.all(outboxEvents.map(async (outboxEvent: T) => {
                const inboxEventMessage: EventMessage = new EventMessage(JSON.parse(outboxEvent.message));
                const eventMessage: EventMessage = inboxEventMessage;
                if (!await this.sendEvent(eventMessage.name, JSON.stringify(eventMessage))) {
                    throw new Error('failed to publish event meesage');
                }
            }));

            await transactionalEntityManager
                .getRepository(this.outBoxEntity)
                .remove(outboxEvents);
        });
        return [];
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
