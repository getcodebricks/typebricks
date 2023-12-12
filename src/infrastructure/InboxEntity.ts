import { PrimaryGeneratedColumn, PrimaryColumn, Entity, Column, Unique } from "typeorm";

@Entity()
@Unique(['no', 'usecaseName', 'streamName'])
abstract class InboxEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @PrimaryColumn({ type: 'int' })
    no: number;

    @PrimaryColumn()
    usecaseName: string;

    @PrimaryColumn()
    streamName: string;

    @Column({type: 'jsonb'})
    message: string;

    constructor(no: number, usecaseName: string, streamName: string, message: string) {
        this.no = no;
        this.usecaseName = usecaseName;
        this.streamName = streamName;
        this.message = message;
    }
}

export { InboxEntity };
