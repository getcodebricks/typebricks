import { EventStreamEntity } from '../../../../src/infrastructure/EventStreamEntity';
import { Entity } from "typeorm";

@Entity()
class BankAccountEventStreamEntity extends EventStreamEntity {
}
export { BankAccountEventStreamEntity };
