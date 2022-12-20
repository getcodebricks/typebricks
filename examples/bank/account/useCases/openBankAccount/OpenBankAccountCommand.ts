import { Command, CommandPayload } from "../../../../../src/domain/Command";
import { Customer } from "../../shared/valueObjects/Customer";
import { Email } from "../../shared/valueObjects/Email";
import { Firstname } from "../../shared/valueObjects/Firstname";

export interface OpenBankAccountCommandDto {
    customer: {
        email: string,
        firstname: string
    }
}

export interface OpenBankAccountCommandPayload extends CommandPayload {
    customer: Customer;
}

export class OpenBankAccountCommand extends Command<OpenBankAccountCommandPayload> {
    get customer (): Customer {
        return this.payload.customer;
    }

    constructor (payload: OpenBankAccountCommandPayload) {
        super(payload);
    }

    static fromDto(dto: OpenBankAccountCommandDto): OpenBankAccountCommand {
        return new this({
            customer: new Customer({
                email: new Email({
                    value: dto.customer.email
                }),
                firstname: new Firstname({
                    value: dto.customer.firstname
                })
            })
        });
    }
}