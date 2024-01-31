import { EntitySchema } from "typeorm";

interface BankAccountOverview {
    id?: string;
    aggregateId: string;
    firstName: string;
    email: string;
    active: boolean;
    balance: number;
};

const BankAccountOverviewEntity = new EntitySchema<BankAccountOverview>({
    name: 'bank_account_overview_read_model',
    columns: {
        id: {
            type: 'uuid',
            primary: true,
            generated: 'uuid',
        },
        aggregateId: {
            type: 'uuid'
        },
        firstName: {
            type: 'varchar',
            default: null,
        },
        email: {
            type: 'varchar',
            default: null,
        },
        active: {
            type: 'boolean',
            default: false,
        },
        balance: {
            type: 'float',
            default: null,
        },
    },
});

export { BankAccountOverviewEntity, BankAccountOverview };
