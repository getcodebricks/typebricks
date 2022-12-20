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
        const newState = this.apply(event);
        if (newState) {
            this.state = newState;
            this.version = event.aggregateVersion;
        } else {
            throw new Error(`can not apply event ${event.name} to aggregate`);
        }
    }

    loadFromHistory(events: Event<EventPayload>[]): void {
        events.forEach((event: Event<EventPayload>) => {
            this.applyEvent(event);
        });
    }
}