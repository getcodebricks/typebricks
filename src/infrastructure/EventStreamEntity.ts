import { PrimaryGeneratedColumn, Entity, Column, CreateDateColumn } from "typeorm";
import { Event } from "../domain/Event";

@Entity()
abstract class EventStreamEntity {
    @PrimaryGeneratedColumn()
    no: number;

    @Column()
    aggregateId: string;

    @Column({ type: 'int' })
    aggregateVersion: number;

    @Column()
    name: string;

    @Column({type: 'text'})
    payload: string;

    @CreateDateColumn({ type: 'timestamptz' })
    occurredAt: Date;

    constructor(aggregateIdOrObject: string | any, aggregateVersion?: number, name?: string, payload?: string, occurredAt?: Date) {
        if (typeof aggregateIdOrObject === 'object') {
            this.aggregateId = aggregateIdOrObject?.aggregateId;
            this.aggregateVersion = aggregateIdOrObject?.aggregateVersion;
            this.name = aggregateIdOrObject?.name;
            this.payload = aggregateIdOrObject?.payload;
            this.occurredAt = aggregateIdOrObject?.occurredAt;
        } else if (aggregateIdOrObject && aggregateVersion && name && payload && occurredAt) {
            this.aggregateId = aggregateIdOrObject;
            this.aggregateVersion = aggregateVersion;
            this.name = name;
            this.payload = payload;
            this.occurredAt = occurredAt;
        }
    }
}

export { EventStreamEntity };
