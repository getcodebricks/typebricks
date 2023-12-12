import { PrimaryGeneratedColumn, PrimaryColumn, Entity, Column, Unique } from "typeorm";

@Entity()
@Unique(['no', 'readmodelName', 'streamName'])
abstract class ReadmodelInboxEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @PrimaryColumn({ type: 'int' })
    no: number;

    @PrimaryColumn()
    readmodelName: string;

    @PrimaryColumn()
    streamName: string;

    @Column({type: 'text'})
    message: string;

    constructor(no: number, readmodelName: string, streamName: string, message: string) {
        this.no = no;
        this.readmodelName = readmodelName;
        this.streamName = streamName;
        this.message = message;
    }
}

export { ReadmodelInboxEntity };
