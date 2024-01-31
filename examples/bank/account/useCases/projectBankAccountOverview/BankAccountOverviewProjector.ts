import { AppDataSource } from "../../shared/AppDatasource";

import { BankAccountOverviewRepository } from '../../shared/readModels/BankAccountOverviewRepository';
import { BankAccountOverview, BankAccountOverviewEntity } from '../../shared/readModels/BankAccountOverviewEntity';
import { BankAccountOpened, BankAccountOpenedPayload } from '../../shared/events/BankAccountOpened';
import { BankAccountTransactionAppended, BankAccountTransactionAppendedPayload } from '../../shared/events/BankAccountTransactionAppended';
import { ActivationEmailSent, ActivationEmailSentPayload } from '../../shared/events/ActivationEmailSent';

class BankAccountOverviewProjector {
    repository: BankAccountOverviewRepository;
    readonly getProjector: any = {
        BankAccountOpened: this.projectBankAccountOpened,
        ActivationEmailSent: this.projectActivationEmailSent,
        TransactionAppended: this.projectBankAccountTransactionAppended,
    };

    constructor(repository: BankAccountOverviewRepository) {
        this.repository = repository;
    }

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

    async project(aggregateId: string, eventName: string, payload: any, aggregateVersion: number): Promise<void> {
        await this.initDataSource();

        const state: BankAccountOverview | null = await AppDataSource.manager.findOneBy(BankAccountOverviewEntity, {
            aggregateId: aggregateId,
        });
        const newState: BankAccountOverview | null = await this.getProjector[`${eventName}`](state, payload, aggregateId, aggregateVersion);
        if (newState) {
            await this.repository.save(newState);
        }

        return;
    }

    async projectBankAccountOpened(state: BankAccountOverview | null, payload: BankAccountOpenedPayload, aggregateId: string, aggregateVersion: number): Promise<BankAccountOverview> {
        const newState: BankAccountOverview = {
            aggregateId: aggregateId,
            firstName: payload.customer.firstName,
            email: payload.customer.email,
            active: false,
            balance: 0.0
        };

        return newState;
    }

    async projectActivationEmailSent(state: BankAccountOverview | null, payload: ActivationEmailSentPayload, aggregateId: string, aggregateVersion: number): Promise<BankAccountOverview> {
        const newState: BankAccountOverview = {
            aggregateId: aggregateId,
            firstName: state ? state.firstName : '',
            email: state? state.email : '',
            active: state ? state.active : false,
            balance: state ? state.balance : 0.0
        };

        return newState;
    }
    async projectBankAccountTransactionAppended(state: BankAccountOverview | null, payload: BankAccountTransactionAppendedPayload, aggregateId: string, aggregateVersion: number): Promise<BankAccountOverview> {
        const newState: BankAccountOverview = {
            aggregateId: aggregateId,
            firstName: state ? state.firstName : '',
            email: state? state.email : '',
            active: state ? state.active : false,
            balance: payload.newBalance
        };

        return newState;
    }

}

export { BankAccountOverviewProjector };