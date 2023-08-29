import { PrimaryGeneratedColumn, PrimaryColumn, Entity, Column, Unique } from "typeorm";

@Entity()
@Unique(['no'])
abstract class OutboxEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @PrimaryColumn({ type: 'int' })
    no: number;

    @Column()
    name: string;

    @Column({type: 'text'})
    message: string;

    constructor(noOrObject: number | any, name: string, message: string) {
        if (typeof noOrObject === 'object') {
            this.no = noOrObject?.no;
            this.name = noOrObject?.name;
            this.message = noOrObject?.message;
        } else if (noOrObject && name && message) {
            this.no = noOrObject;
            this.name = name;
            this.message = message;
        }
    }
}

export { OutboxEntity };
