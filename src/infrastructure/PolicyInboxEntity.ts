import { PrimaryGeneratedColumn, Entity, Column, Unique } from "typeorm";

export interface IPolicyInboxEntity {
    id?: string;
    no: number;
    useCaseName: string;
    streamName: string;
    message: string;
};

@Entity()
@Unique(['no', 'useCaseName', 'streamName'])
export abstract class PolicyInboxEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column({ name: 'no', type: 'int' })
    no: number;

    @Column({ name: 'use_case_name' })
    useCaseName: string;

    @Column({ name: 'stream_name' })
    streamName: string;

    @Column({ name: 'message', type: 'jsonb'})
    message: string;

    constructor(props?: IPolicyInboxEntity) {
        if (props?.no && props?.useCaseName && props?.streamName && props?.message) {
            this.no = props.no;
            this.useCaseName = props.useCaseName;
            this.streamName = props.streamName;
            this.message = props.message;
        }
    }
}