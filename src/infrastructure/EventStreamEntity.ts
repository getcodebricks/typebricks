import { PrimaryGeneratedColumn, Entity, Column, CreateDateColumn } from "typeorm";

@Entity()
abstract class EventStreamEntity {
    @PrimaryGeneratedColumn()
    no: number

    @Column()
    aggregateId: string

    @Column({ type: 'int' })
    aggregateVersion: number

    @Column()
    topic: string

    @Column()
    name: string

    @Column()
    payload: string

    @CreateDateColumn({ type: 'timestamptz' })
    occuredAt: Date
}

export { EventStreamEntity };
