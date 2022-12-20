import { Command, CommandPayload } from "../../../../../src/domain/Command";
import { BankAccountId } from "../../shared/valueObjects/BankAccountId";

export interface SendActivationEmailCommandDto {
    bankAccountId: string
}

export interface SendActivationEmailCommandPayload extends CommandPayload {
    bankAccountId: BankAccountId,
}

export class SendActivationEmailCommand extends Command<SendActivationEmailCommandPayload> {
    get bankAccountId (): BankAccountId {
        return this.payload.bankAccountId;
    }

    constructor (payload: SendActivationEmailCommandPayload) {
        super(payload);
    }

    static fromDto(dto: SendActivationEmailCommandDto): SendActivationEmailCommand {
        return new this({
            bankAccountId: new BankAccountId({
                value: dto.bankAccountId
            })
        });
    }
}