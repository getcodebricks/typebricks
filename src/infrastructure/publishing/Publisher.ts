import { EventBridgeClient, PutEventsCommand, PutEventsResponse } from "@aws-sdk/client-eventbridge";
import { DataSource, EntityManager, ObjectType } from "typeorm";
import { OutboxEntity } from "./OutboxEntity";
import { EventMessage } from "../persistence/aggregate/EventMessage";

export class Publisher<T extends OutboxEntity> {
    readonly client: EventBridgeClient = new EventBridgeClient({});

    constructor(readonly appDataSource: DataSource, readonly eventStreamEntity: ObjectType<T>, readonly outBoxEntity: ObjectType<T>, readonly aggregateName: string, readonly contextName: string) {
    }

    async publish(): Promise<void> {
        await this.initDataSource();
        await this.setSequenceNumbers();
        await this.publishEvents();
    }

    private async initDataSource(): Promise<void> {
        if (!this.appDataSource.isInitialized) {
            await this.appDataSource.initialize()
                .then(() => { })
                .catch((err) => {
                    console.error("Error during Data Source initialization", err);
                });
        }
    }

    private async setSequenceNumbers() {
        await this.appDataSource.manager.transaction("READ COMMITTED", async (transactionalEntityManager: EntityManager) => {
            const events = await transactionalEntityManager
                .getRepository(this.eventStreamEntity)
                .createQueryBuilder('events')
                .where('events.no IS NULL')
                .orderBy('events.occurredAt')
                .setLock("pessimistic_write")
                .limit(10)
                .getMany();

            const result = await transactionalEntityManager
                .getRepository(this.eventStreamEntity)
                .createQueryBuilder()
                .select("MAX(no)", "max")
                .getRawOne() ?? { max: 0 };

            var maxEventNo = result.max;
            for (const event of events) {
                await transactionalEntityManager.createQueryBuilder()
                    .update(this.eventStreamEntity)
                    .set({ no: maxEventNo + 1 })
                    .where('id = :id', { id: event.id })
                    .execute();

                await transactionalEntityManager.createQueryBuilder()
                    .update(this.outBoxEntity)
                    .set({
                        no: maxEventNo + 1,
                        message: () => `jsonb_set(message::jsonb, '{no}', '${maxEventNo + 1}', true)`
                    })
                    .where('id = :id', { id: event.id })
                    .execute();

                maxEventNo++;
            }
        });
    }

    private async publishEvents() {
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
                    throw new Error('failed to publish event message');
                }
            }));

            await transactionalEntityManager
                .getRepository(this.outBoxEntity)
                .remove(outboxEvents);
        });
    }

    private async sendEvent(name: string, message: string): Promise<boolean> {
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
