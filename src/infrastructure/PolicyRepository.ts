import { EntityManager, FindOneOptions, DataSource } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { EventMessage } from "./EventMessage";
import { NoInboxEventFoundError } from "./NoInboxEventFoundError";
import { IPolicyPositionEntity, PolicyPositionEntity } from "./PolicyPositionEntity";
import { IPolicyInboxEntity, PolicyInboxEntity } from "./PolicyInboxEntity";

export abstract class PolicyRepository<TInboxEntity extends PolicyInboxEntity, TPositionEntity extends PolicyPositionEntity> {

    protected constructor(
        readonly datasource: DataSource,
        readonly inboxEntity: new (params: IPolicyInboxEntity) => TInboxEntity,
        readonly positionEntity: new (params: IPolicyPositionEntity) => TPositionEntity,
    ) {
    }

    async insertIntoInbox(no: number, useCaseName: string, streamName: string, message: string): Promise<void> {
        try {
            const projectionInboxEntity: TInboxEntity = new this.inboxEntity({
                no: no,
                useCaseName: useCaseName,
                streamName: streamName,
                message: message
            });
            await this.datasource.manager.save(projectionInboxEntity);
        } catch (error: any) {
            if (error?.code == 23505) {
                return;
            }
            throw error;
        }
    }


    async processNextInboxEvent(useCaseName: string, streamName: string, processMethod: (eventMessage: EventMessage) => Promise<void>): Promise<number | null> {
        try {
            const lastProcessedNo: number | null = await this.getPolicyPosition(this.datasource.manager, useCaseName, streamName);
            if (lastProcessedNo == null) {
                console.log(`Error getting last processed event no for ${useCaseName} and stream ${streamName}`);
                throw new Error(`Error getting last processed event no for ${useCaseName} and stream ${streamName}`);
            }
            await this.datasource.manager.transaction("READ COMMITTED", async (transactionalEntityManager: EntityManager) => {
                const inboxEvent: TInboxEntity | null = await this.getFromInbox(transactionalEntityManager, useCaseName, streamName, lastProcessedNo + 1);
                if (!inboxEvent) {
                    throw new NoInboxEventFoundError(`No inbox event found for no ${lastProcessedNo + 1} of ${useCaseName} and stream ${streamName}`);
                }
                const inboxEventMessage: EventMessage = new EventMessage(JSON.parse(inboxEvent.message));
                try {
                    await processMethod(
                        inboxEventMessage,
                    );
                } catch (error: any) {
                    if (!(error instanceof TypeError)) {
                        throw error;
                    }
                }

                const updatePositionEntry: QueryDeepPartialEntity<PolicyPositionEntity> = {
                    useCaseName: useCaseName,
                    streamName: streamName,
                    lastProcessedNo: inboxEvent.no,
                    updatedAt: new Date(),
                };
                await transactionalEntityManager
                    .getRepository(this.positionEntity)
                    .upsert(
                        updatePositionEntry as QueryDeepPartialEntity<TPositionEntity>,
                        ['useCaseName', 'streamName']
                    );
            });
            return lastProcessedNo + 1;
        } catch (error: any) {
            if (error instanceof NoInboxEventFoundError) {
                return null;
            }
            console.log(error);
            return null;
        }
    }

    async getFromInbox(entityManager: EntityManager, useCaseName: string, streamName: string, no: number): Promise<TInboxEntity | null> {
        return await entityManager
            .getRepository(this.inboxEntity)
            .createQueryBuilder(this.inboxEntity.name)
            .setLock("pessimistic_write")
            .setOnLocked("skip_locked")
            .where('use_case_name = :useCaseName', { useCaseName: useCaseName })
            .andWhere('stream_name = :streamName', { streamName: streamName })
            .andWhere('no = :no', { no: no })
            .getOne();
    }

    async getPolicyPosition(entityManager: EntityManager, useCaseName: string, streamName: string): Promise<number | null> {
        try {
            const findOptions: FindOneOptions<PolicyPositionEntity> = {
                where: {
                    useCaseName: useCaseName,
                    streamName: streamName
                }
            };
            const position: TPositionEntity | null = await entityManager.findOne(
                this.positionEntity,
                findOptions as FindOneOptions<TPositionEntity>
            );
            return position ? position.lastProcessedNo : 0;
        } catch (error: any) {
            console.log(error);
            return null;
        }
    }

    async updatePolicyPosition(entityManager: EntityManager, no: number, useCaseName: string, streamName: string, message: string): Promise<boolean> {
        try {
            await entityManager
                .getRepository(this.positionEntity)
                .save(
                    new this.positionEntity({
                        useCaseName: useCaseName,
                        streamName: streamName,
                        lastProcessedNo: no,
                        updatedAt: new Date(),
                    }),
                );
            return true;
        } catch (error: any) {
            console.log(error);
            return false;
        }
    }
}
