import { PrimaryGeneratedColumn, Entity, Column, UpdateDateColumn, Unique } from "typeorm";

@Entity()
@Unique(['readmodelName', 'streamName'])
abstract class ReadmodelProjectionPositionEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    readmodelName: string

    @Column()
    streamName: string

    @Column({ type: 'int' })
    lastProjectedNo: number

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date

    constructor(readmodelName: string, streamName: string, lastProjectedNo: number) {
        this.readmodelName = readmodelName;
        this.streamName = streamName;
        this.lastProjectedNo = lastProjectedNo;
    }
}

export { ReadmodelProjectionPositionEntity };