import { PrimaryGeneratedColumn, PrimaryColumn, Entity, Column, Unique } from "typeorm";

export interface IReadmodelInboxEntity {
    id?: string;
    no: number;
    readmodelName: string;
    streamName: string;
    message: string;
};

@Entity()
@Unique(['no', 'readmodelName', 'streamName'])
export abstract class ReadmodelInboxEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @PrimaryColumn({ name: 'no', type: 'int' })
    no: number;

    @PrimaryColumn({ name: 'readmodel_name' })
    readmodelName: string;

    @PrimaryColumn({ name: 'stream_name' })
    streamName: string;

    @Column({ name: 'message', type: 'text' })
    message: string;

    constructor(props?: IReadmodelInboxEntity) {
        if (props?.no && props?.readmodelName && props?.streamName && props?.message) {
            this.no = props.no;
            this.readmodelName = props.readmodelName;
            this.streamName = props.streamName;
            this.message = props.message;
        }
    }
}