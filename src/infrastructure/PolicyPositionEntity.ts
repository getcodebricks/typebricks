import { PrimaryGeneratedColumn, Entity, Column, UpdateDateColumn, Unique } from "typeorm";

export interface IPolicyPositionEntity {
    id?: string;
    useCaseName: string;
    streamName: string;
    lastProcessedNo: number;
    updatedAt: Date;
}

@Entity()
@Unique(['useCaseName', 'streamName'])
export abstract class PolicyPositionEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column({ name: 'use_case_name' })
    useCaseName: string;

    @Column({ name: 'stream_name' })
    streamName: string;

    @Column({ name: 'last_processed_no', type: 'int' })
    lastProcessedNo: number;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    constructor(props?: IPolicyPositionEntity) {
        if (props?.useCaseName && props?.streamName && props?.lastProcessedNo) {
            this.useCaseName = props.useCaseName;
            this.streamName = props.streamName;
            this.lastProcessedNo = props.lastProcessedNo;
        }
    }
}