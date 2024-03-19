import { EntityManager, FindOneOptions, FindManyOptions, DeleteResult, DataSource, BaseEntity } from "typeorm";
import { EventMessage } from "./EventMessage";
import { IReadmodelInboxEntity, ReadmodelInboxEntity } from "./ReadmodelInboxEntity";
import { IReadmodelProjectionPositionEntity, ReadmodelProjectionPositionEntity } from "./ReadmodelProjectionPositionEntity";


export interface IProjectionRepositoryMethods<TReadModelEntity> {
    getOne: (findOneOptions: FindOneOptions) => Promise<TReadModelEntity | null>;
    getMany: (findManyOptions: FindManyOptions) => Promise<TReadModelEntity[]>;
    updateOne: (projectedEntity: TReadModelEntity) => Promise<TReadModelEntity | null>;
    updateMany: (projectedEntities: TReadModelEntity[]) => Promise<TReadModelEntity[]>;
    delete: (findManyOptions: FindManyOptions) => Promise<number | null | undefined>;
}

export abstract class ReadmodelRepository<TInboxEntity extends ReadmodelInboxEntity, TPositionEntity extends ReadmodelProjectionPositionEntity, TReadModelEntity extends BaseEntity, TProjectionRepositoryMethods extends IProjectionRepositoryMethods<TReadModelEntity>> {

    protected constructor(
        readonly datasource: DataSource,
        readonly inboxEntity: new (params: IReadmodelInboxEntity) => TInboxEntity,
        readonly positionEntity: new (params: IReadmodelProjectionPositionEntity) => TPositionEntity,
        readonly readModelEntity: new (params: any) => TReadModelEntity,
    ) {
    }

    async insertIntoInbox(no: number, readmodelName: string, streamName: string, message: string): Promise<void> {
        try {
            const readmodelInboxEntity: TInboxEntity = new this.inboxEntity({
                no: no,
                readmodelName: readmodelName,
                streamName: streamName,
                message: message
            });
            await this.datasource.manager.save(readmodelInboxEntity);
        } catch (error: any) {
            if (error?.code == 23505) {
                return;
            }
            throw error;
        }
    }


    async projectNextInboxEvent(readmodelName: string, streamName: string, projectMethod: (eventMessage: EventMessage, methods: TProjectionRepositoryMethods) => Promise<void>): Promise<number | null> {
        try {
            const lastProjectedNo: number | null = await this.getProjectionPosition(this.datasource.manager, readmodelName, streamName);
            if (lastProjectedNo == null) {
                console.log(`Error getting last projected event no for ${readmodelName} and stream ${streamName}`);
                throw new Error(`Error getting last projected event no for ${readmodelName} and stream ${streamName}`);
            }
            await this.datasource.manager.transaction("READ COMMITTED", async (transactionalEntityManager: EntityManager) => {
                const inboxEvent: TInboxEntity | null = await this.getFromInbox(transactionalEntityManager, readmodelName, streamName, lastProjectedNo + 1);
                if (!inboxEvent) {
                    console.log(`No inbox event found for no ${lastProjectedNo + 1} of ${readmodelName} and stream ${streamName}`);
                    throw new Error(`No inbox event found for no ${lastProjectedNo + 1} of ${readmodelName} and stream ${streamName}`);
                }
                const inboxEventMessage: EventMessage = new EventMessage(JSON.parse(inboxEvent.message));
                await projectMethod(
                    inboxEventMessage,
                    {
                        getOne: (findOneOptions: FindOneOptions) => this.getOne(transactionalEntityManager, findOneOptions),
                        getMany: (findManyOptions: FindManyOptions) => this.getMany(transactionalEntityManager, findManyOptions),
                        updateOne: (projectedEntity: TReadModelEntity) => this.updateOne(transactionalEntityManager, projectedEntity),
                        updateMany: (projectedEntities: TReadModelEntity[]) => this.updateMany(transactionalEntityManager, projectedEntities),
                        delete: (findManyOptions: FindManyOptions) => this.delete(transactionalEntityManager, findManyOptions)
                    } as TProjectionRepositoryMethods
                );

                await transactionalEntityManager
                    .getRepository(this.positionEntity)
                    .save(
                        new this.positionEntity({
                            readmodelName: readmodelName,
                            streamName: streamName,
                            lastProjectedNo: inboxEvent.no,
                            updatedAt: new Date(),
                        }),
                    );
            });
            return lastProjectedNo + 1;
        } catch (error: any) {
            return null;
        }
    }

    async getFromInbox(entityManager: EntityManager, readmodelName: string, streamName: string, no: number): Promise<TInboxEntity | null> {
        return await entityManager
            .getRepository(this.inboxEntity)
            .createQueryBuilder(this.inboxEntity.name)
            .setLock("pessimistic_write")
            .setOnLocked("skip_locked")
            .where('readmodel_name = :readmodelName', { readmodelName: readmodelName })
            .andWhere('stream_name = :streamName', { streamName: streamName })
            .andWhere('no = :no', { no: no })
            .getOne();
    }

    async getProjectionPosition(entityManager: EntityManager, readmodelName: string, streamName: string): Promise<number | null> {
        try {
            const findOptions: FindOneOptions<ReadmodelProjectionPositionEntity> = {
                where: {
                    readmodelName: readmodelName,
                    streamName: streamName
                }
            };
            const position: TPositionEntity | null = await entityManager.findOne(
                this.positionEntity,
                findOptions as FindOneOptions<TPositionEntity>
            );
            return position ? position.lastProjectedNo : 0;
        } catch (error: any) {
            console.log(error);
            return null;
        }
    }

    async updateProjectionPosition(entityManager: EntityManager, no: number, readmodelName: string, streamName: string, message: string): Promise<boolean> {
        try {
            await entityManager
                .getRepository(this.positionEntity)
                .save(
                    new this.positionEntity({
                        readmodelName: readmodelName,
                        streamName: streamName,
                        lastProjectedNo: no,
                        updatedAt: new Date(),
                    }),
                );
            return true;
        } catch (error: any) {
            console.log(error);
            return false;
        }
    }

    async getOne(entityManager: EntityManager, findOneOptions: FindOneOptions): Promise<TReadModelEntity | null> {
        return await entityManager.findOne(this.readModelEntity, findOneOptions);
    }

    async getMany(entityManager: EntityManager, findManyOptions: FindManyOptions): Promise<TReadModelEntity[]> {
        return await entityManager.find(this.readModelEntity, findManyOptions);
    }

    async updateOne(entityManager: EntityManager, projectedEntity: TReadModelEntity): Promise<TReadModelEntity | null> {
        console.log(projectedEntity);
        return await entityManager.save(projectedEntity);
    }

    async updateMany(entityManager: EntityManager, projectedEntities: TReadModelEntity[]): Promise<TReadModelEntity[]> {
        return await entityManager.save(projectedEntities);
    }

    async delete(entityManager: EntityManager, findManyOptions: FindManyOptions): Promise<number | null | undefined> {
        const deleteResult: DeleteResult = await entityManager.delete(this.readModelEntity, findManyOptions.where);
        return deleteResult.affected;
    }
}
