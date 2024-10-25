import { Between, FindManyOptions, MoreThan, FindOneOptions, QueryRunner } from "typeorm";
import { EventStreamEntity, IEventStreamEntity } from "./EventStreamEntity";
import { EventMessage } from "./EventMessage";
import { Aggregate } from "../../../domain/Aggregate";
import { Event } from "../../../domain/Event";
import { IOutboxEntity, OutboxEntity } from "../../publishing/OutboxEntity";
import { AbstractAggregateStateEntity, IAggregateStateEntity } from "./AggregateStateEntity";
import { EventFactory } from "./EventFactory";
import { ConflictError } from "../../../domain/errors/ConflictError";
import { parseToDateTime } from "../../../utils/parseToDateTime";

/**
 * Persists and load aggregates and the corresponding events
 * 
 * Demos: 
 * 
 * - [Publishing](https://codebricks.tech/docs/code/techniques/publishing)
 * 
 */
export abstract class AbstractAggregateRepository<TAggregate extends Aggregate<any>, TEventStreamEntity extends EventStreamEntity, TOutBoxEntity extends OutboxEntity, TAggregateStateEntity extends AbstractAggregateStateEntity, TEventFactory extends EventFactory> {

    /**
     * Initializes AbstractAggregateRepository
     * 
     * @param queryRunner - Typeorm QueryRunner
     * @param aggregate - Aggregate Class
     * @param eventStreamEntity - Event stream Typeorm entity
     * @param outBoxEntity - Event outbox Typeorm entity
     * @param aggregateStateEntity - Aggregate state Typeorm entity
     * @param eventFactory - Event factory for deserialization
     * @param streamName - Event stream name
     */
    protected constructor(
        readonly queryRunner: QueryRunner,
        readonly aggregate: new (id: string) => TAggregate,
        readonly eventStreamEntity: new (params: IEventStreamEntity) => TEventStreamEntity,
        readonly outBoxEntity: new (params: IOutboxEntity) => TOutBoxEntity,
        readonly aggregateStateEntity: new (params: IAggregateStateEntity) => TAggregateStateEntity,
        readonly eventFactory: new () => TEventFactory,
        readonly streamName: string,
    ) {
    }

    /**
     * Persists an aggregate, saves its pending events to event stream and outbox
     * 
     * @param aggregate - Aggregate to persist
     */
    async save(aggregate: TAggregate): Promise<void> {
        if (!aggregate.pendingEvents.length) {
            throw new ConflictError('No events to persist.');
        }

        try {
            const findOptions: FindManyOptions<EventStreamEntity> = {
                where: {
                    aggregateId: aggregate.id,
                    aggregateVersion: Between(
                        aggregate.pendingEvents[0].aggregateVersion,
                        aggregate.pendingEvents[aggregate.pendingEvents.length - 1].aggregateVersion
                    )
                }
            };
            const result: TEventStreamEntity[] = await this.queryRunner.manager.find(
                this.eventStreamEntity,
                findOptions as FindManyOptions<TEventStreamEntity>
            );

            if (result.length) {
                console.error("Race condition while persisting aggregate.");
                throw new Error("Race condition while persisting aggregate.");
            }

            var setTransaction = false;
            if (!this.queryRunner.isTransactionActive) {
                setTransaction = true;
                await this.queryRunner.startTransaction();
            }
            try {
                await Promise.all(aggregate.pendingEvents.map(async (pendingEvent: Event<any>) => {
                    const event: TEventStreamEntity = new this.eventStreamEntity(pendingEvent);
                    await this.queryRunner.manager.save(
                        this.eventStreamEntity,
                        event
                    );
                    const eventMessage: EventMessage = new EventMessage({
                        streamName: this.streamName,
                        id: pendingEvent.id,
                        aggregateId: pendingEvent.aggregateId,
                        aggregateVersion: pendingEvent.aggregateVersion,
                        name: pendingEvent.name,
                        payload: JSON.stringify(pendingEvent.payload),
                        occurredAt: pendingEvent.occurredAt,
                    });
                    const outbox: TOutBoxEntity = new this.outBoxEntity({
                        id: pendingEvent.id,
                        name: eventMessage.name,
                        message: JSON.stringify(eventMessage)
                    });
                    await this.queryRunner.manager.save(
                        this.outBoxEntity,
                        outbox
                    );
                }));
                if (setTransaction) await this.queryRunner.commitTransaction();
            } catch (error) {
                if (setTransaction) await this.queryRunner.rollbackTransaction();

                console.error('Error during transaction saving of Aggregate: ' + error);
                throw error;
            }
            aggregate.pendingEvents = [];

            await this.queryRunner.manager.save(
                new this.aggregateStateEntity({
                    aggregateId: aggregate.id,
                    aggregateVersion: aggregate.version,
                    state: JSON.stringify(aggregate.state)
                })
            );
        } catch (error) {
            console.error('Error during transaction saving of Aggregate: ' + error);
            throw error;
        }
    }

    /**
     * Loads aggregate from state or from event history.
     * 
     * @param aggregateId - Id of the aggreagte to load.
     * @returns Aggregate or null
     */
    async get(aggregateId: string): Promise<TAggregate | null> {
        const aggregateState: TAggregateStateEntity | null = await this.getAggregateState(aggregateId);
        const rawEvents: TEventStreamEntity[] = await this.getRawEvents(
            aggregateId,
            aggregateState?.aggregateVersion ?? 0
        );
        if (!aggregateState && !rawEvents.length) {
            return null
        }
        const events: Event<any>[] = await this.parseRawEvents(rawEvents);
        const aggregate: TAggregate = new this.aggregate(aggregateId);
        if (aggregateState) {
            aggregate.state = JSON.parse(aggregateState.state, parseToDateTime);
            aggregate.version = aggregateState.aggregateVersion;
        }
        aggregate.loadFromHistory(events);

        return aggregate;
    }

    private async getAggregateState(aggregateId: string): Promise<TAggregateStateEntity | null> {
        const findOptions: FindOneOptions<AbstractAggregateStateEntity> = {
            where: {
                aggregateId: aggregateId
            }
        };
        const aggregateState: TAggregateStateEntity | null = await this.queryRunner.manager.findOne(
            this.aggregateStateEntity,
            findOptions as FindOneOptions<TAggregateStateEntity>
        );

        return aggregateState;
    }

    private async getRawEvents(aggregateId: string, aggregateVersion: number): Promise<TEventStreamEntity[]> {
        const findOptions: FindManyOptions<EventStreamEntity> = {
            where: {
                aggregateId: aggregateId,
                aggregateVersion: MoreThan(aggregateVersion)
            },
            order: {
                aggregateVersion: 'ASC'
            }
        };
        const rawEvents: TEventStreamEntity[] = await this.queryRunner.manager.find(
            this.eventStreamEntity,
            findOptions as FindManyOptions<TEventStreamEntity>
        );

        return rawEvents;
    }

    private async parseRawEvents(rawEvents: TEventStreamEntity[]): Promise<Event<any>[]> {
        return rawEvents.map(
            (rawEvent: TEventStreamEntity) => new this.eventFactory().getEvent[rawEvent.name](rawEvent)
        ).filter(Boolean) as Event<any>[];
    }
}
