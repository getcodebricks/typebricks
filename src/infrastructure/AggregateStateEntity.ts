import { PrimaryColumn, Entity, Column } from "typeorm";

export interface IAggregateStateEntity {
    aggregateId: string;
    aggregateVersion: number;
    state: string;
};

@Entity()
export abstract class AbstractAggregateStateEntity {
    @PrimaryColumn({ name: 'aggregate_id', type: 'uuid' })
    aggregateId: string;

    @Column({ name: 'aggregate_version', type: 'int' })
    aggregateVersion: number;

    @Column({ name: 'state', type: 'text'})
    state: string;

    constructor(props?: IAggregateStateEntity) {
        if (props?.aggregateId && props?.aggregateVersion && props?.state) {
            this.aggregateId = props.aggregateId;
            this.aggregateVersion = props.aggregateVersion;
            this.state = props.state;
        }
    }
}