import { Event, EventPayload } from "./Event";

export interface AggregateState {
  [index: string]: any;
}

export abstract class Aggregate<TState extends AggregateState> {
    id: string;
    version: number;
    state: TState;
    pendingEvents: Event<EventPayload>[];
  
    constructor (id: string, version: number, state: TState) {
        this.id = id;
        this.version = version;
        this.state = state;
        this.pendingEvents = [];
    }

    abstract apply(event: Event<EventPayload>): TState | void;

    addEvent(event: Event<EventPayload>): void {
        this.pendingEvents.push(event);
        this.applyEvent(event);
    }

    applyEvent(event: Event<EventPayload>): void {
        if (this.version != (event.aggregateVersion - 1)) {
            throw new Error(`can not apply event with aggregate version ${event.aggregateVersion} to aggregate with version ${this.version}`);
        }
        const newState = this.apply(event);

        if (!newState) {
            throw new Error(`can not apply event ${event.name} to aggregate`);
        }
        this.state = newState;
        this.version = event.aggregateVersion;
    }

    loadFromHistory(events: Event<EventPayload>[]): void {
        events.forEach((event: Event<EventPayload>) => {
            this.applyEvent(event);
        });
    }
}