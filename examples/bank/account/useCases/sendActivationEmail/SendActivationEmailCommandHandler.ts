import { DomainError } from "../../../../../src/domain/DomainError";
import { BankAccountRepository } from "../../shared/BankAccountRepository";
import { SendActivationEmailCommand } from "./SendActivationEmailCommand";
import { BankAccount } from "../../shared/BankAccount";

export class SendActivationEmailCommandHandler {
    repository: BankAccountRepository;

    constructor(repository: BankAccountRepository) {
        this.repository = repository;
    }

    async handle(command: SendActivationEmailCommand): Promise<BankAccount | null> {
        const bankAccount = await this.repository.get(command.bankAccountId.value);
        if (!bankAccount) {
            throw new DomainError("Bank account does not exist");
        }
        bankAccount.sendActivationEmail();
        await this.repository.save(bankAccount);
        return bankAccount;
    }
}