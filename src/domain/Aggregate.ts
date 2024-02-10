import { Event } from './Event';

export abstract class Aggregate<TState> {
    id: string;
    version: number;
    state: TState;
    pendingEvents: Event<any>[];
  
    constructor (id: string, version: number, state: TState) {
        this.id = id;
        this.version = version;
        this.state = state;
        this.pendingEvents = [];
    }

    abstract apply(event: Event<any>): TState | void;

    addEvent(event: Event<any>): void {
        this.pendingEvents.push(event);
        this.applyEvent(event);
    }

    applyEvent(event: Event<any>): void {
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

    loadFromHistory(events: Event<any>[]): void {
        events.forEach((event: Event<any>) => {
            this.applyEvent(event);
        });
    }
}