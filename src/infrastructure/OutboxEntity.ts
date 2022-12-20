import { PrimaryGeneratedColumn, PrimaryColumn, Entity, Column, Unique } from "typeorm";

@Entity()
@Unique(['no', 'topic'])
abstract class OutboxEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @PrimaryColumn({ type: 'int' })
    no: number;

    @PrimaryColumn()
    topic: string;

    @Column()
    name: string;

    @Column()
    message: string;
}

export { OutboxEntity };
