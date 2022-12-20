import { v4 as uuid } from "uuid";
import { BankAccountRepository } from "../../shared/BankAccountRepository";
import { OpenBankAccountCommand } from "./OpenBankAccountCommand";
import { BankAccount } from "../../shared/BankAccount";

export class OpenBankAccountCommandHandler {
    repository: BankAccountRepository;

    constructor(repository: BankAccountRepository) {
        this.repository = repository;
    }

    async handle(command: OpenBankAccountCommand): Promise<BankAccount | null> {
        const bankAccount = new BankAccount(uuid());
        bankAccount.open(
            command.customer
        );
        await this.repository.save(bankAccount);
        return bankAccount;
    }
}