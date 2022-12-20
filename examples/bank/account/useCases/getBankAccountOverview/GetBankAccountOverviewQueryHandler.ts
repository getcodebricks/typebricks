import { BankAccountOverviewRepository } from "../../shared/readModels/BankAccountOverviewRepository";
import { GetBankAccountOverviewQuery } from "./GetBankAccountOverviewQuery";
import { BankAccountOverview } from "../../shared/readModels/BankAccountOverviewEntity";

export class GetBankAccountOverviewQueryHandler {
    repository: BankAccountOverviewRepository;

    constructor(repository: BankAccountOverviewRepository) {
        this.repository = repository;
    }

    async handle(query: GetBankAccountOverviewQuery): Promise<BankAccountOverview | null> {
        const bankAccountOverview = await this.repository.getOverview(query.bankAccountId);
        if (!bankAccountOverview) {
            throw new Error("Bank account overview not found");
        }

        return bankAccountOverview;
    }
}