import { PrimaryGeneratedColumn, Entity, Column, UpdateDateColumn, Unique } from "typeorm";

export interface IProjectionPositionEntity {
    id?: string;
    projectionName: string;
    streamName: string;
    lastProjectedNo: number;
    updatedAt: Date;
}

/**
 * Persists current position of the projection for each stream.
 * 
 * * Demos: 
 * 
 * - [Consuming](https://codebricks.tech/docs/code/techniques/consuming)
 * 
 */
@Entity()
@Unique(['projectionName', 'streamName'])
export abstract class ProjectionPositionEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column({ name: 'projection_name' })
    projectionName: string;

    @Column({ name: 'stream_name' })
    streamName: string;

    @Column({ name: 'last_projected_no', type: 'int' })
    lastProjectedNo: number;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    constructor(props?: IProjectionPositionEntity) {
        if (props?.projectionName && props?.streamName && props?.lastProjectedNo) {
            this.projectionName = props.projectionName;
            this.streamName = props.streamName;
            this.lastProjectedNo = props.lastProjectedNo;
        }
    }
}