import { Aggregate } from "./Aggregate";

class Event {
    readonly aggregateId: any; //UUID
    readonly aggregateVersion: number;
    readonly name: string;
    readonly payload: any;
    readonly occuredAt: Date;

    constructor(aggregateId: any, aggregateVersion: number, name: string, payload: any, occuredAt: Date) {
        this.aggregateId = aggregateId;
        this.aggregateVersion = aggregateVersion;
        this.name = name;
        this.payload = payload;
        this.occuredAt = occuredAt;
    }

    apply(aggregateState: any): any {
        return aggregateState;
    }
    
}

export { Event };
