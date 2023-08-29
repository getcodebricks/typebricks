import { PrimaryGeneratedColumn, Entity, Column, CreateDateColumn } from "typeorm";
import { Event } from "../domain/Event";

@Entity()
abstract class EventStreamEntity {
    @PrimaryGeneratedColumn()
    no: number

    @Column()
    aggregateId: string

    @Column({ type: 'int' })
    aggregateVersion: number

    @Column()
    name: string

    @Column({type: 'text'})
    payload: string

    @CreateDateColumn({ type: 'timestamptz' })
    occuredAt: Date

    constructor(aggregateIdOrObject: string | any, aggregateVersion?: number, name?: string, payload?: string, occuredAt?: Date) {
        if (typeof aggregateIdOrObject === 'object') {
            this.aggregateId = aggregateIdOrObject?.aggregateId;
            this.aggregateVersion = aggregateIdOrObject?.aggregateVersion;
            this.name = aggregateIdOrObject?.name;
            this.payload = aggregateIdOrObject?.payload;
            this.occuredAt = aggregateIdOrObject?.occuredAt;
        } else if (aggregateIdOrObject && aggregateVersion && name && payload && occuredAt) {
            this.aggregateId = aggregateIdOrObject;
            this.aggregateVersion = aggregateVersion;
            this.name = name;
            this.payload = payload;
            this.occuredAt = occuredAt;
        }
    }
}

export { EventStreamEntity };
