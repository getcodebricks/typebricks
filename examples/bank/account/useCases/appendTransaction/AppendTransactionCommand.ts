import { Command, CommandPayload } from "../../../../../src/domain/Command";
import { BankAccountIdValueObject } from "../../shared/valueObjects/BankAccountIdValueObject";
import { AmountValueObject } from "../../shared/valueObjects/AmountValueObject";

export interface AppendTransactionCommandDto {
    bankAccountId: string,
    amount: number,
}

export interface AppendTransactionCommandPayload extends CommandPayload {
    bankAccountId: BankAccountIdValueObject,
    amount: AmountValueObject
}

export class AppendTransactionCommand extends Command<AppendTransactionCommandPayload> {
    get bankAccountId(): BankAccountIdValueObject {
        return this.payload.bankAccountId;
    }

    get amount(): AmountValueObject {
        return this.payload.amount;
    }

    constructor(payload: AppendTransactionCommandPayload) {
        super(payload);
    }

    static fromDto(dto: AppendTransactionCommandDto): AppendTransactionCommand {
        return new this(
            {
                bankAccountId: new BankAccountIdValueObject(dto.bankAccountId),
                amount: new AmountValueObject(dto.amount)
            }
        );
    }
}