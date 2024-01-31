import common from "mocha/lib/interfaces/common";
import { Command, CommandPayload } from "../../../../../src/domain/Command";
import { CustomerValueObject } from "../../shared/valueObjects/CustomerValueObject";
import { EmailValueObject } from "../../shared/valueObjects/EmailValueObject";
import { FirstNameValueObject } from "../../shared/valueObjects/FirstNameValueObject";

export interface OpenBankAccountCommandDto {
    customer: {
        email: string,
        firstName: string
    }
}

export interface OpenBankAccountCommandPayload extends CommandPayload {
    customer: CustomerValueObject;
}

export class OpenBankAccountCommand extends Command<OpenBankAccountCommandPayload> {
    get customer(): CustomerValueObject {
        return this.payload.customer;
    }

    constructor(payload: OpenBankAccountCommandPayload) {
        super(payload);
    }

    static fromDto(dto: OpenBankAccountCommandDto): OpenBankAccountCommand {
        return new this(
            {
                customer: new CustomerValueObject(
                    new EmailValueObject(dto.customer.email),
                    new FirstNameValueObject(dto.customer.firstName),
                )
            }
        );
    }
}