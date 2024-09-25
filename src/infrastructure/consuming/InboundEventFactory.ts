import { InboundEvent } from "../../application/InboundEvent";
import { PolicyInboxEntity } from "./PolicyInboxEntity";
import { ProjectionInboxEntity } from "./ProjectionInboxEntity";

interface InboundEventBuilder {
    [key: string]: (inboxEvent: PolicyInboxEntity|ProjectionInboxEntity) => InboundEvent<any>;
}

/**
 * Deserializes generic inbox event stream entities into their corresponding inbound event classes.
 */
export abstract class InboundEventFactory {
    readonly getInboundEvent: InboundEventBuilder;
}
