import { BankAccountOverview, BankAccountOverviewEntity } from "./BankAccountOverviewEntity";
import { AppDataSource } from "../../shared/AppDatasource";


export class BankAccountOverviewRepository {
    async initDataSource(): Promise<void> {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
            .then(() => {
                // console.log("Data Source has been initialized!");
            })
            .catch((err) => {
                console.error("Error during Data Source initialization", err);
            });
        }
    }

    async getOverview(aggregateId: string): Promise<BankAccountOverview | null> {
        await this.initDataSource();

        const bankAccountOverview = await AppDataSource.manager.findOneBy(BankAccountOverviewEntity, {
            aggregateId: aggregateId,
        });

        return bankAccountOverview;
    }

    async save(bankAccountOverview: BankAccountOverview): Promise<any> {
        await this.initDataSource();

        try {
            await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                await transactionalEntityManager.upsert(
                    BankAccountOverviewEntity,
                    bankAccountOverview,
                    ['id'],
                );   
            });
        } catch (error) {
            console.error("Errror during transaction");
        }

        return;
    }
}