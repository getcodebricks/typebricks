import { Entity, Column, CreateDateColumn, Unique, PrimaryColumn } from "typeorm";

export interface IEventStreamEntity {
    id: string;
    no?: number;
    aggregateId: string;
    aggregateVersion: number;
    name: string;
    payload: string;
    occurredAt: Date;
};

@Entity()
@Unique(['aggregateId', 'aggregateVersion'])
export abstract class EventStreamEntity {
    
    @PrimaryColumn({ name: 'id' })
    id: string;

    @Column({ name: 'no', nullable: true})
    no?: number;

    @Column({ name: 'aggregate_id' , type: 'uuid' })
    aggregateId: string;

    @Column({ name: 'aggregate_version', type: 'int' })
    aggregateVersion: number;

    @Column({ name: 'name' })
    name: string;

    @Column({ name: 'payload', type: 'text' })
    payload: string;

    @CreateDateColumn({ name: 'occurred_at', type: 'timestamptz' })
    occurredAt: Date;

    constructor(props?: IEventStreamEntity) {
        if (props?.id && props?.aggregateId && props?.aggregateVersion && props?.name && props?.payload && props?.occurredAt) {
            this.id = props.id;
            this.no = props.no;
            this.aggregateId = props.aggregateId;
            this.aggregateVersion = props.aggregateVersion;
            this.name = props.name;
            this.payload = props.payload;
            this.occurredAt = props.occurredAt;
        }
    }
}
