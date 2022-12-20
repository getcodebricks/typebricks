import { expect } from 'chai';

import { v4 as uuid } from "uuid";

import { AppDataSource } from "../../../shared/AppDatasource";
import { BankAccountOverview, BankAccountOverviewEntity } from '../../../shared/readModels/BankAccountOverviewEntity';

import { BankAccountOpened, BankAccountOpenedPayload } from '../../../shared/events/BankAccountOpened';

import { BankAccountOverviewProjector } from '../../../useCases/projectBankAccountOverview/BankAccountOverviewProjector';
import { handler } from '../../../useCases/projectBankAccountOverview/BankAccountOverviewProjectionHandler';
import { BankAccountOverviewRepository } from '../../../shared/readModels/BankAccountOverviewRepository';

import { GetBankAccountOverviewQuery, GetBankAccountOverviewQueryDto } from '../../../useCases/getBankAccountOverview/GetBankAccountOverviewQuery';
import { GetBankAccountOverviewQueryHandler } from '../../../useCases/getBankAccountOverview/GetBankAccountOverviewQueryHandler';

describe('get bank account overview', function() {
    it('test', async function() {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize()
            .then(() => {
                // console.log("Data Source has been initialized!");
            })
            .catch((err) => {
                console.error("Error during Data Source initialization", err);
            });
        }

        const aggregateId = uuid();

        const bankAccountOpened = new BankAccountOpened(
            aggregateId,
            1,
            {
                customer: {
                    email: 'peter@provider.com',
                    firstname: 'Peter'
                },
                balance: 0.0,
                status: 'NOT_ACTIVATED'
            },
            new Date()
        );

        const bankAccountOverviewProjector: BankAccountOverviewProjector = new BankAccountOverviewProjector(new BankAccountOverviewRepository());
        await bankAccountOverviewProjector.project(
            bankAccountOpened.aggregateId,
            bankAccountOpened.name,
            bankAccountOpened.payload,
            bankAccountOpened.aggregateVersion
        );

        const queryDto: GetBankAccountOverviewQueryDto = {
            bankAccountId: aggregateId
        };
        const query: GetBankAccountOverviewQuery = GetBankAccountOverviewQuery.fromDto(queryDto);
        const queryHandler: GetBankAccountOverviewQueryHandler = new GetBankAccountOverviewQueryHandler(new BankAccountOverviewRepository);
        const bankAccountOverview: BankAccountOverview | null = await queryHandler.handle(query);

        expect(bankAccountOverview?.aggregateId).equal(bankAccountOpened.aggregateId);
        expect(bankAccountOverview?.firstname).equal(bankAccountOpened.payload.customer.firstname);
        expect(bankAccountOverview?.email).equal(bankAccountOpened.payload.customer.email);
        expect(bankAccountOverview?.active).equal(false);
        expect(bankAccountOverview?.balance).equal(bankAccountOpened.payload.balance);
    });
});