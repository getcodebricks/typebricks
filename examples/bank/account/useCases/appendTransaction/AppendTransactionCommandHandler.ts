import { v4 as uuid } from "uuid";
import { BankAccountRepository } from "../../shared/BankAccountRepository";
import { AppendTransactionCommand } from "./AppendTransactionCommand";
import { BankAccount } from "../../shared/BankAccount";

export class AppendTransactionCommandHandler {
    repository: BankAccountRepository;

    constructor(repository: BankAccountRepository) {
        this.repository = repository;
    }

    async handle(command: AppendTransactionCommand): Promise<BankAccount | null> {
        const bankAccount = await this.repository.get(command.bankAccountId.value);
        if (!bankAccount) {
            throw new Error("Bank account not found");
        }
        bankAccount.appendTransaction(
            command.amount
        );
        await this.repository.save(bankAccount);
        return bankAccount;
    }
}