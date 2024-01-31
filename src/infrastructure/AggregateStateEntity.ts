import { PrimaryColumn, Entity, Column } from "typeorm";

@Entity()
abstract class AggregateStateEntity {
    @PrimaryColumn()
    aggregateId: string;

    @Column({ type: 'int' })
    aggregateVersion: number;

    @Column({type: 'text'})
    state: string;

    constructor(aggregateIdOrObject: string | any, aggregateVersion?: number, state?: string) {
        if (typeof aggregateIdOrObject === 'object') {
            this.aggregateId = aggregateIdOrObject?.aggregateId;
            this.aggregateVersion = aggregateIdOrObject?.aggregateVersion;
            this.state = aggregateIdOrObject?.state;
        } else if (aggregateIdOrObject && aggregateVersion && state) {
            this.aggregateId = aggregateIdOrObject;
            this.aggregateVersion = aggregateVersion;
            this.state = state;
        }
    }
}

export { AggregateStateEntity };
