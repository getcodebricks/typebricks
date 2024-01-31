import { Command, CommandPayload } from "../../../../../src/domain/Command";
import { BankAccountIdValueObject } from "../../shared/valueObjects/BankAccountIdValueObject";


export interface SendActivationEmailCommandDto {
    bankAccountId: string
}

export interface SendActivationEmailCommandPayload extends CommandPayload {
    bankAccountId: BankAccountIdValueObject,
}

export class SendActivationEmailCommand extends Command<SendActivationEmailCommandPayload> {
    get bankAccountId(): BankAccountIdValueObject {
        return this.payload.bankAccountId;
    }

    constructor(payload: SendActivationEmailCommandPayload) {
        super(payload);
    }

    static fromDto(dto: SendActivationEmailCommandDto): SendActivationEmailCommand {
        return new this(
            {
                bankAccountId: new BankAccountIdValueObject(dto.bankAccountId)
            }
        );
    }
}