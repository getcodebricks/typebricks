import { DataSource,  } from "typeorm";

import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

import { Event, EventPayload } from '../../../../src/domain/Event';
import { StoredEvent } from '../../../../src/application/StoredEvent';
import { BankAccount } from "./BankAccount";
import { BankAccountOpened } from "./events/BankAccountOpened";
import { BankAccountTransactionAppended } from "./events/BankAccountTransactionAppended";
import { ActivationEmailSent } from "./events/ActivationEmailSent";
import { BankAccountEventStreamEntity } from "./BankAccountEventStreamEntity";
import { AppDataSource } from "./AppDataSource";

const sns = new SNSClient({});

export class BankAccountRepository {
    factory: EventFactory = new EventFactory();

    async initDataSource(): Promise<void> {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
            .then(() => {
                // console.log("Data Source has been initialized!");
            })
            .catch((err) => {
                console.error("Error during Data Source initialization", err);
            });
        }
    }

    async get(aggregateId: string): Promise<BankAccount | null> {
        await this.initDataSource();

        const rawEvents: BankAccountEventStreamEntity[] = await AppDataSource.manager.findBy(BankAccountEventStreamEntity, {
            aggregateId: aggregateId,
        });
        if (!rawEvents.length) {
            return null;
        }

        // const events: Array<BankAccountOpened | BankAccountTransactionAppended | ActivationEmailSent> = rawEvents.map((storedEvent: StoredEvent) => {
        //     switch (storedEvent.topic) {
        //         case BankAccountOpened.name:
        //             return new BankAccountOpened(
        //                 storedEvent.aggregateId,
        //                 storedEvent.aggregateVersion,
        //                 JSON.parse(storedEvent.payload),
        //                 new Date(storedEvent.occuredAt)
        //             );

        //         case BankAccountTransactionAppended.name:
        //             return new BankAccountTransactionAppended(
        //                 storedEvent.aggregateId,
        //                 storedEvent.aggregateVersion,
        //                 JSON.parse(storedEvent.payload),
        //                 new Date(storedEvent.occuredAt)
        //             );

        //         case ActivationEmailSent.name:
        //             return new ActivationEmailSent(
        //                 storedEvent.aggregateId,
        //                 storedEvent.aggregateVersion,
        //                 JSON.parse(storedEvent.payload),
        //                 new Date(storedEvent.occuredAt)
        //             );
        //     }
        // }).filter(Boolean) as Array<BankAccountOpened | BankAccountTransactionAppended | ActivationEmailSent>;


        const events: Array<Event<EventPayload>> = await this.parseRawEvents(rawEvents);
        const aggregate =  new BankAccount(aggregateId);
        aggregate.loadFromHistory(events);
        return aggregate;
    }

    async parseRawEvents(rawEvents: Array<StoredEvent>): Promise<Array<Event<EventPayload>>> {
        const events: Array<Event<EventPayload>> = rawEvents.map((storedEvent: StoredEvent) => {
            return this.factory.getEvent[`${storedEvent.name}`](storedEvent);
        }).filter(Boolean) as Array<Event<EventPayload>>;

        return events;
    }

    async save(aggregate: BankAccount): Promise<any> {
        await this.initDataSource();
        try {
            await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                //TODO: Condition should be checked on the Postgres Server
                const result = await transactionalEntityManager.find(BankAccountEventStreamEntity, {
                    where: [
                        { aggregateId: aggregate.pendingEvents[0].aggregateId, aggregateVersion: aggregate.pendingEvents[0].aggregateVersion },
                        { aggregateId: aggregate.pendingEvents[0].aggregateId, aggregateVersion: aggregate.pendingEvents[aggregate.pendingEvents.length-1].aggregateVersion }
                    ]
                });
                if (result.length) {
                    console.error("race condition");
                    throw new Error("race condition");
                }
                for (let index = 0; index < aggregate.pendingEvents.length; index++) {
                    const pendingEvent = aggregate.pendingEvents[index];
                    const bankAccountEvent: BankAccountEventStreamEntity = new BankAccountEventStreamEntity();
                    bankAccountEvent.aggregateId = pendingEvent.aggregateId;
                    bankAccountEvent.aggregateVersion = pendingEvent.aggregateVersion;
                    bankAccountEvent.payload = JSON.stringify(pendingEvent.payload);
                    bankAccountEvent.occuredAt = pendingEvent.occuredAt;

                    await transactionalEntityManager.insert(
                        BankAccountEventStreamEntity,
                        bankAccountEvent
                    );
                    const publish = await sns.send(new PublishCommand({
                        TopicArn: process.env.SQS_TOPIC,
                        Message: JSON.stringify(pendingEvent.payload),
                        MessageAttributes: {
                            eventName: {
                                DataType: 'String',
                                StringValue: `${pendingEvent.name}`
                            }
                        }
                    }));
                    if (!publish) {
                        console.error("Error during publishing the message to sns");
                        throw new Error("Error during publishing the message to sns");
                    }
                }
            });
            aggregate.pendingEvents = [];
        } catch (error) {
            console.error("Errror during transaction");
        }
        
        return;
    }
}

class EventFactory {
    readonly getEvent: any = {
        BankAccountOpened: this.getBankAccountOpened,
        BankAccountTransactionAppended: this.getBankAccountTransactionAppended,
        ActivationEmailSent: this.getActivationEmailSent
    };

    getBankAccountOpened(storedEvent: StoredEvent): BankAccountOpened {
        return new BankAccountOpened(
            storedEvent.aggregateId,
            storedEvent.aggregateVersion,
            JSON.parse(storedEvent.payload),
            new Date(storedEvent.occuredAt)
        );
    }

    getBankAccountTransactionAppended(storedEvent: StoredEvent): BankAccountTransactionAppended {
        return new BankAccountTransactionAppended(
            storedEvent.aggregateId,
            storedEvent.aggregateVersion,
            JSON.parse(storedEvent.payload),
            new Date(storedEvent.occuredAt)
        );
    }

    getActivationEmailSent(storedEvent: StoredEvent): ActivationEmailSent {
        return new ActivationEmailSent(
            storedEvent.aggregateId,
            storedEvent.aggregateVersion,
            JSON.parse(storedEvent.payload),
            new Date(storedEvent.occuredAt)
        );
    }
}