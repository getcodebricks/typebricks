import { EntityManager, FindOneOptions, FindManyOptions, DeleteResult, DataSource, BaseEntity } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { EventMessage } from "./EventMessage";
import { IProjectionInboxEntity, ProjectionInboxEntity } from "./ProjectionInboxEntity";
import { IProjectionPositionEntity, ProjectionPositionEntity } from "./ProjectionPositionEntity";

export interface IProjectionRepositoryMethods<TProjectedEntity> {
    getOne: (findOneOptions: FindOneOptions) => Promise<TProjectedEntity | null>;
    getMany: (findManyOptions: FindManyOptions) => Promise<TProjectedEntity[]>;
    updateOne: (projectedEntity: TProjectedEntity) => Promise<TProjectedEntity | null>;
    updateMany: (projectedEntities: TProjectedEntity[]) => Promise<TProjectedEntity[]>;
    delete: (findManyOptions: FindManyOptions) => Promise<number | null | undefined>;
}

export abstract class ProjectionRepository<TInboxEntity extends ProjectionInboxEntity, TPositionEntity extends ProjectionPositionEntity, TProjectedEntity extends BaseEntity, TProjectionRepositoryMethods extends IProjectionRepositoryMethods<TProjectedEntity>> {

    protected constructor(
        readonly datasource: DataSource,
        readonly inboxEntity: new (params: IProjectionInboxEntity) => TInboxEntity,
        readonly positionEntity: new (params: IProjectionPositionEntity) => TPositionEntity,
        readonly projectedEntity: new (params: any) => TProjectedEntity,
    ) {
    }

    async insertIntoInbox(no: number, projectionName: string, streamName: string, message: string): Promise<void> {
        try {
            const projectionInboxEntity: TInboxEntity = new this.inboxEntity({
                no: no,
                projectionName: projectionName,
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


    async projectNextInboxEvent(projectionName: string, streamName: string, projectMethod: (eventMessage: EventMessage, methods: TProjectionRepositoryMethods) => Promise<void>): Promise<number | null> {
        try {
            const lastProjectedNo: number | null = await this.getProjectionPosition(this.datasource.manager, projectionName, streamName);
            if (lastProjectedNo == null) {
                console.log(`Error getting last projected event no for ${projectionName} and stream ${streamName}`);
                throw new Error(`Error getting last projected event no for ${projectionName} and stream ${streamName}`);
            }
            await this.datasource.manager.transaction("READ COMMITTED", async (transactionalEntityManager: EntityManager) => {
                const inboxEvent: TInboxEntity | null = await this.getFromInbox(transactionalEntityManager, projectionName, streamName, lastProjectedNo + 1);
                if (!inboxEvent) {
                    console.log(`No inbox event found for no ${lastProjectedNo + 1} of ${projectionName} and stream ${streamName}`);
                    throw new Error(`No inbox event found for no ${lastProjectedNo + 1} of ${projectionName} and stream ${streamName}`);
                }
                const inboxEventMessage: EventMessage = new EventMessage(JSON.parse(inboxEvent.message));
                await projectMethod(
                    inboxEventMessage,
                    {
                        getOne: (findOneOptions: FindOneOptions) => this.getOne(transactionalEntityManager, findOneOptions),
                        getMany: (findManyOptions: FindManyOptions) => this.getMany(transactionalEntityManager, findManyOptions),
                        updateOne: (projectedEntity: TProjectedEntity) => this.updateOne(transactionalEntityManager, projectedEntity),
                        updateMany: (projectedEntities: TProjectedEntity[]) => this.updateMany(transactionalEntityManager, projectedEntities),
                        delete: (findManyOptions: FindManyOptions) => this.delete(transactionalEntityManager, findManyOptions)
                    } as TProjectionRepositoryMethods
                );

                const updatePositionEntry: QueryDeepPartialEntity<ProjectionPositionEntity> = {
                    projectionName: projectionName,
                    streamName: streamName,
                    lastProjectedNo: inboxEvent.no,
                    updatedAt: new Date(),
                };
                await transactionalEntityManager
                    .getRepository(this.positionEntity)
                    .upsert(
                        updatePositionEntry as QueryDeepPartialEntity<TPositionEntity>,
                        ['projectionName', 'streamName']
                    );
            });
            return lastProjectedNo + 1;
        } catch (error: any) {
            console.log(error);
            return null;
        }
    }

    async getFromInbox(entityManager: EntityManager, projectionName: string, streamName: string, no: number): Promise<TInboxEntity | null> {
        return await entityManager
            .getRepository(this.inboxEntity)
            .createQueryBuilder(this.inboxEntity.name)
            .setLock("pessimistic_write")
            .setOnLocked("skip_locked")
            .where('projection_name = :projectionName', { projectionName: projectionName })
            .andWhere('stream_name = :streamName', { streamName: streamName })
            .andWhere('no = :no', { no: no })
            .getOne();
    }

    async getProjectionPosition(entityManager: EntityManager, projectionName: string, streamName: string): Promise<number | null> {
        try {
            const findOptions: FindOneOptions<ProjectionPositionEntity> = {
                where: {
                    projectionName: projectionName,
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

    async updateProjectionPosition(entityManager: EntityManager, no: number, projectionName: string, streamName: string, message: string): Promise<boolean> {
        try {
            await entityManager
                .getRepository(this.positionEntity)
                .save(
                    new this.positionEntity({
                        projectionName: projectionName,
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

    async getOne(entityManager: EntityManager, findOneOptions: FindOneOptions): Promise<TProjectedEntity | null> {
        return await entityManager.findOne(this.projectedEntity, findOneOptions);
    }

    async getMany(entityManager: EntityManager, findManyOptions: FindManyOptions): Promise<TProjectedEntity[]> {
        return await entityManager.find(this.projectedEntity, findManyOptions);
    }

    async updateOne(entityManager: EntityManager, projectedEntity: TProjectedEntity): Promise<TProjectedEntity | null> {
        console.log(projectedEntity);
        return await entityManager.save(projectedEntity);
    }

    async updateMany(entityManager: EntityManager, projectedEntities: TProjectedEntity[]): Promise<TProjectedEntity[]> {
        return await entityManager.save(projectedEntities);
    }

    async delete(entityManager: EntityManager, findManyOptions: FindManyOptions): Promise<number | null | undefined> {
        const deleteResult: DeleteResult = await entityManager.delete(this.projectedEntity, findManyOptions.where);
        return deleteResult.affected;
    }
}
