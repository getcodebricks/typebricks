import { EventStreamEntity } from "./EventStreamEntity";
import { Event } from "../../../domain/Event";

interface EventBuilder {
    [key: string]: (storedEvent: EventStreamEntity) => Event<any>;
}

export abstract class EventFactory {
    readonly getEvent: EventBuilder;
}
