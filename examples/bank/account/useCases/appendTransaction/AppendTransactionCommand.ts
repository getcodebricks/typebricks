import { Command, CommandPayload } from "../../../../../src/domain/Command";
import { BankAccountId } from "../../shared/valueObjects/BankAccountId";
import { Amount } from "../../shared/valueObjects/Amount";

export interface AppendTransactionCommandDto {
    bankAccountId: string,
    amount: number,
}

export interface AppendTransactionCommandPayload extends CommandPayload {
    bankAccountId: BankAccountId,
    amount: Amount
}

export class AppendTransactionCommand extends Command<AppendTransactionCommandPayload> {
    get bankAccountId (): BankAccountId {
        return this.payload.bankAccountId;
    }

    get amount (): Amount {
        return this.payload.amount;
    }

    constructor (payload: AppendTransactionCommandPayload) {
        super(payload);
    }

    static fromDto(dto: AppendTransactionCommandDto): AppendTransactionCommand {
        return new this({
            bankAccountId: new BankAccountId({
                value: dto.bankAccountId
            }),
            amount: new Amount({
                value: dto.amount
            })
        });
    }
}