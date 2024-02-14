import { PrimaryGeneratedColumn, PrimaryColumn, Entity, Column, Unique } from "typeorm";

export interface IOutboxEntity {
    id?: string;
    no: number;
    name: string;
    message: string;
};

@Entity()
@Unique(['no'])
export abstract class OutboxEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @PrimaryColumn({ name: 'no', type: 'int' })
    no: number;

    @Column({ name: 'name' })
    name: string;

    @Column({ name: 'message', type: 'text' })
    message: string;

    constructor(props?: IOutboxEntity) {
        if (props?.no && props?.name && props?.message) {
            this.no = props.no;
            this.name = props.name;
            this.message = props.message;
        }
    }
}
