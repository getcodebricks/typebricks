import { PrimaryGeneratedColumn, PrimaryColumn, Entity, Column, Unique } from "typeorm";

export interface IInboxEntity {
    id?: string;
    no: number;
    usecaseName: string;
    streamName: string;
    message: string;
};

@Entity()
@Unique(['no', 'usecaseName', 'streamName'])
export abstract class InboxEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @PrimaryColumn({ name: 'no', type: 'int' })
    no: number;

    @PrimaryColumn({ name: 'usecase_name' })
    usecaseName: string;

    @PrimaryColumn({ name: 'stream_name' })
    streamName: string;

    @Column({ name: 'message', type: 'jsonb'})
    message: string;

    constructor(props: IInboxEntity) {
        this.no = props.no;
        this.usecaseName = props.usecaseName;
        this.streamName = props.streamName;
        this.message = props.message;
    }
}