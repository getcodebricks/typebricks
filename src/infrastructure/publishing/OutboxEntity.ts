import { PrimaryGeneratedColumn, Entity, Column, PrimaryColumn } from "typeorm";

export interface IOutboxEntity {
    id: string;
    no?: number;
    name: string;
    message: string;
};

/**
 * Saves persisted events for publishing. 
 * 
 * * Demos: 
 * 
 * - [Publishing](https://getcodebricks.com/docs/publishing)
 * 
 */
@Entity()
export abstract class OutboxEntity {
    @PrimaryColumn('uuid', { name: 'id' })
    id: string;

    @Column({ name: 'no', type: 'int', nullable: true})
    no?: number;

    @Column({ name: 'name' })
    name: string;

    @Column({ name: 'message', type: 'text' })
    message: string;

    constructor(props?: IOutboxEntity) {
        if (props?.name && props?.name && props?.message) {
            this.id = props.id;
            this.no = props.no;
            this.name = props.name;
            this.message = props.message;
        }
    }
}
