import { Event } from './Event';

/**
 * Aggregate root
 * 
 * Demos: 
 * 
 * - [Command API](https://codebricks.tech/docs/code/fundamentals/command-api/)
 * 
 * API: 
 * 
 * - [Aggregate](https://codebricks.tech/docs/code/fundamentals/command-api/aggregate) 
 * 
 */
export abstract class Aggregate<TState> {
    /**
     * Aggregate's id
     */
    id: string;
    /**
     * Aggregate's version
     */
    version: number;
    /**
     * Aggregate's state
     */
    state: TState;
    /**
     * Events to be persisted
     */
    pendingEvents: Event<any>[];
    /**
     * Aggregate's last change date
     */
    changedAt: Date;
  
    /**
     * Initializes Aggregate
     * 
     * @param id - Aggregate's id 
     * @param version - Aggregate's version 
     * @param state - Aggregate's state 
     */
    constructor (id: string, version: number, state: TState) {
        this.id = id;
        this.version = version;
        this.state = state;
        this.pendingEvents = [];
        this.changedAt = new Date();
    }

    /**
     * Maps events to their apply methods.
     * 
     * @param event - Event to apply on aggregate
     */
    abstract apply(event: Event<any>): TState | void;

    /**
     * Add event to be persisted and applied to aggregate.
     * 
     * @param event - Added Event
     */
    addEvent(event: Event<any>): void {
        this.pendingEvents.push(event);
        this.applyEvent(event);
    }

    /**
     * Applies event to aggregate: 
     * - update state via specific apply method
     * - increate version
     * - set changed at
     * 
     * @param event - Event to apply on aggregate 
     */
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
        this.changedAt = event.occurredAt;
    }

    /**
     * Load aggregate via its event history.
     * 
     * @param events - Aggregates event history
     */
    loadFromHistory(events: Event<any>[]): void {
        events.forEach((event: Event<any>) => {
            this.applyEvent(event);
        });
    }
}