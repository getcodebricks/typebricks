import { EventStreamEntity } from "./EventStreamEntity";
import { Event } from "../../../domain/Event";

interface EventBuilder {
    [key: string]: (storedEvent: EventStreamEntity) => Event<any>;
}

/**
 * Deserializes generic event stream entities into their corresponding event classes.
 */
export abstract class EventFactory {
    readonly getEvent: EventBuilder;
}
