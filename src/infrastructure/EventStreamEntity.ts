import { PrimaryGeneratedColumn, Entity, Column, CreateDateColumn } from "typeorm";

export interface IEventStreamEntity {
    no?: number;
    aggregateId: string;
    aggregateVersion: number;
    name: string;
    payload: string;
    occurredAt: Date;
};

@Entity()
export abstract class EventStreamEntity {
    @PrimaryGeneratedColumn({ name: 'no' })
    no: number;

    @Column({ name: 'aggregate_id' })
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
        if (props?.aggregateId && props?.aggregateVersion && props?.name && props?.payload && props?.occurredAt) {
            this.aggregateId = props.aggregateId;
            this.aggregateVersion = props.aggregateVersion;
            this.name = props.name;
            this.payload = props.payload;
            this.occurredAt = props.occurredAt;
        }
    }
}
