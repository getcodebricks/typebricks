import { DataSource } from "typeorm";
import { BankAccountEventStreamEntity } from "./BankAccountEventStreamEntity";
import { BankAccountOverviewEntity } from "./readModels/BankAccountOverviewEntity";

const AppDataSource = new DataSource({
        type: 'postgres',
        port: parseInt(process.env.POSTGRES_PORT || '') || 5432,
        logging: false,
        synchronize: true,
        url: process.env.POSTGRES_URL,
        migrationsTableName: 'custom_migration_table',
        entities: [
            BankAccountEventStreamEntity,
            BankAccountOverviewEntity
        ]
    })
;

export { AppDataSource };