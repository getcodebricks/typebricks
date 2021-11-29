import { Event } from "./Event";

class AggregateState {};

const Events: any = {};

class Aggregate {
    public id: string;
    public version: number;
    public state: AggregateState | null;
    public changes: Array<Event>;
    public events: any;

    constructor(id: string) {
        this.id = id;
        this.version = 0;
        this.state = null;
        this.changes = [];
        this.events = Events;
    }

    async addEvent(event: Event): Promise<void> {
        this.changes.push(event);
        this.state = event.apply(this.state);
        this.version = event.aggregateVersion;
    }


    // applyChange(event: Event): void {
        
    // }

    async getEvents(): Promise<Array<Event>> {
        return this.changes;
    }

    // loadFromHistory(history: any[]): void {
    //     console.log('loadFromHistory');
    //     // console.log(history[0]);
    //     // console.log(typeof history[0]);
    //     history.forEach((event) => {
    //         // this.state = event.apply(this.state);
    //         console.log(event);
    //     });
    // }

    // getVersion(): number {
    //     return this.version;
    // }

    async loadFromHistory(history: any[]): Promise<void> {
        console.log('loadFromHistory');
        // console.log(history[0]);
        // console.log(typeof history[0]);
        history.forEach((rawEvent) => {
            // this.state = event.apply(this.state);
            console.log(rawEvent);
            const topic = rawEvent.topic;
            const eventClassName = `${rawEvent.topic}Event`;
            console.log(topic);
            console.log(this.events);
            console.log(this.events[eventClassName]);

            // const event: Event = new this.events[eventClassName]();
            // console.log(JSON.stringify(event));

            // o.aggregateId, o.version, TodoListCreatedEventPayload.fromObject(o.payload), o.occuredAt
            const event2: Event = this.events[eventClassName].fromObject({
                aggregateId: rawEvent.aggregate_id,
                version: rawEvent.aggregate_version,
                payload: JSON.parse(rawEvent.payload),
                occuredAt: new Date()
            });
            // console.log(event2 instanceof TodoListCreatedEvent);
            // console.log(event2 instanceof TodoListRenamedEvent);
            console.log(event2 instanceof Event);
            this.state = event2.apply(this.state);
            this.version = event2.aggregateVersion;
            console.log(JSON.stringify(event2));
        });
    }

}

export { Aggregate, AggregateState };
