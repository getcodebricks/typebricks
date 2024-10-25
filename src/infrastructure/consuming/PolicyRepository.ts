import { FindOneOptions, QueryRunner } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { IPolicyInboxEntity, PolicyInboxEntity } from "./PolicyInboxEntity";
import { PolicyPositionEntity, IPolicyPositionEntity } from "./PolicyPositionEntity";
import { NoInboxEventFoundError } from "./errors/NoInboxEventFoundError";
import { InboundEvent } from "../../application/InboundEvent";
import { InboundEventFactory } from "./InboundEventFactory";

/**
 * Persists incoming events from inbox and processes events from inbox.
 * 
 * Demos: 
 * 
 * - [Consuming](https://codebricks.tech/docs/code/techniques/consuming)
 * 
 */
export abstract class PolicyRepository<TInboxEntity extends PolicyInboxEntity, TPositionEntity extends PolicyPositionEntity> {

    /**
     * Initializes PolicyRepository.
     * 
     * @param queryRunner - Typeorm QueryRunner
     * @param inboxEntity - Policy's inbox Typeorm entity
     * @param positionEntity - Policy's position Typeorm entity
     * @param eventFactory - Event factory for deserialization
     */
    protected constructor(
        readonly queryRunner: QueryRunner,
        readonly inboxEntity: new (params: IPolicyInboxEntity) => TInboxEntity,
        readonly positionEntity: new (params: IPolicyPositionEntity) => TPositionEntity,
        readonly eventFactory: InboundEventFactory,
    ) {
    }

    /**
     * Inserts event into Policy's inbox.
     * 
     * @param no - Event no
     * @param useCaseName - Policy name
     * @param streamName - Consumed stream name
     * @param message - Event message
     * @returns 
     */
    async insertIntoInbox(no: number, useCaseName: string, streamName: string, message: string): Promise<void> {
        try {
            const projectionInboxEntity: TInboxEntity = new this.inboxEntity({
                no: no,
                useCaseName: useCaseName,
                streamName: streamName,
                message: message
            });
            await this.queryRunner.manager.save(projectionInboxEntity);
        } catch (error: any) {
            if (error?.code == 23505) {
                return;
            }
            throw error;
        }
    }

    /**
     * Gets next inbox event according to the position and passes it to callback process method. 
     * Increases policy's position afterwards and deletes the processed inbox events.
     * 
     * @param useCaseName - Policy name
     * @param streamName - Consumed stream name
     * @param processMethod - Callback process method
     * @returns Last processed event no.
     */
    async processNextInboxEvent(useCaseName: string, streamName: string, processMethod: (inboxEvent: InboundEvent<any>) => Promise<void>): Promise<number | null> {
        await this.queryRunner.startTransaction();
        try {
            const lastProcessedNo: number | null = await this.getPolicyPosition(useCaseName, streamName);
            if (lastProcessedNo == null) {
                console.log(`Error getting last processed event no for ${useCaseName} and stream ${streamName}`);
                throw new Error(`Error getting last processed event no for ${useCaseName} and stream ${streamName}`);
            }
            const inboxEvent: TInboxEntity | null = await this.getFromInbox(useCaseName, streamName, lastProcessedNo + 1);
            if (!inboxEvent) {
                throw new NoInboxEventFoundError(`No inbox event found for no ${lastProcessedNo + 1} of ${useCaseName} and stream ${streamName}`);
            }
            const inboundEvent: InboundEvent<any> | null = await this.parseRawInboxEvent(inboxEvent);
            if (inboundEvent) {
                try {
                    await processMethod(inboundEvent);
                } catch (error: any) {
                    if (!(error instanceof TypeError)) {
                        throw error;
                    }
                }
            }
            await this.updatePolicyPosition(useCaseName, streamName, inboxEvent.no);
            await this.queryRunner.commitTransaction();
            await this.deleteInboxEntriesUntil(useCaseName, streamName, lastProcessedNo);
            return lastProcessedNo + 1;
        } catch (error: any) {
            await this.queryRunner.rollbackTransaction();
            if (error instanceof NoInboxEventFoundError) {
                return null;
            }
            console.log(error);
            return null;
        }
    }

    private async getFromInbox(useCaseName: string, streamName: string, no: number): Promise<TInboxEntity | null> {
        return await this.queryRunner.manager
            .getRepository(this.inboxEntity)
            .createQueryBuilder(this.inboxEntity.name)
            .setLock("pessimistic_write")
            .setOnLocked("skip_locked")
            .where('use_case_name = :useCaseName', { useCaseName: useCaseName })
            .andWhere('stream_name = :streamName', { streamName: streamName })
            .andWhere('no = :no', { no: no })
            .getOne();
    }

    private async getPolicyPosition(useCaseName: string, streamName: string): Promise<number | null> {
        try {
            const findOptions: FindOneOptions<PolicyPositionEntity> = {
                where: {
                    useCaseName: useCaseName,
                    streamName: streamName
                }
            };
            const position: TPositionEntity | null = await this.queryRunner.manager.findOne(
                this.positionEntity,
                findOptions as FindOneOptions<TPositionEntity>
            );
            return position ? position.lastProcessedNo : 0;
        } catch (error: any) {
            console.log(error);
            return null;
        }
    }

    private async updatePolicyPosition(useCaseName: string, streamName: string, no: number): Promise<void> {
        const updatePositionEntry: QueryDeepPartialEntity<PolicyPositionEntity> = {
            useCaseName: useCaseName,
            streamName: streamName,
            lastProcessedNo: no,
            updatedAt: new Date(),
        };
        await this.queryRunner.manager
            .getRepository(this.positionEntity)
            .upsert(
                updatePositionEntry as QueryDeepPartialEntity<TPositionEntity>,
                ['useCaseName', 'streamName']
            );
    }

    private async deleteInboxEntriesUntil(useCaseName: string, streamName: string, lastProcessedNo: number) {
        await this.queryRunner.manager
            .getRepository(this.inboxEntity)
            .createQueryBuilder(this.inboxEntity.name)
            .where('use_case_name = :useCaseName', { useCaseName: useCaseName })
            .andWhere('stream_name = :streamName', { streamName: streamName })
            .andWhere('no <= :no', { no: lastProcessedNo + 1 })
            .delete()
            .execute();
    }

    private async parseRawInboxEvent(rawEvent: TInboxEntity): Promise<InboundEvent<any> | null> {
        const eventName: string = JSON.parse(rawEvent.message).name;
        try {
            return this.eventFactory.getInboundEvent[eventName](rawEvent);
        } catch (error: any) {
            if (!(error instanceof TypeError)) {
                throw error;
            }
        }

        return null;
    }
}
