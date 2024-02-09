import { PrimaryGeneratedColumn, Entity, Column, UpdateDateColumn, Unique } from "typeorm";

export interface IReadmodelProjectionPositionEntity {
    id?: string;
    readmodelName: string;
    streamName: string;
    lastProjectedNo: number;
    updatedAt: Date;
}

@Entity()
@Unique(['readmodelName', 'streamName'])
export abstract class ReadmodelProjectionPositionEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column({ name: 'readmodel_name' })
    readmodelName: string;

    @Column({ name: 'stream_name' })
    streamName: string;

    @Column({ name: 'last_projected_no', type: 'int' })
    lastProjectedNo: number;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    constructor(props: IReadmodelProjectionPositionEntity) {
        this.readmodelName = props.readmodelName;
        this.streamName = props.streamName;
        this.lastProjectedNo = props.lastProjectedNo;
    }
}