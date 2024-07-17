import { PrimaryGeneratedColumn, PrimaryColumn, Entity, Column, Unique } from "typeorm";

export interface IProjectionInboxEntity {
    id?: string;
    no: number;
    projectionName: string;
    streamName: string;
    message: string;
};

/**
 * Saves incoming events for projections. 
 * 
 * * Demos: 
 * 
 * - [Consuming](https://getcodebricks.com/docs/consuming)
 * 
 */
@Entity()
@Unique(['no', 'projectionName', 'streamName'])
export abstract class ProjectionInboxEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column({ name: 'no', type: 'int' })
    no: number;

    @Column({ name: 'projection_name' })
    projectionName: string;

    @Column({ name: 'stream_name' })
    streamName: string;

    @Column({ name: 'message', type: 'text' })
    message: string;

    constructor(props?: IProjectionInboxEntity) {
        if (props?.no && props?.projectionName && props?.streamName && props?.message) {
            this.no = props.no;
            this.projectionName = props.projectionName;
            this.streamName = props.streamName;
            this.message = props.message;
        }
    }
}