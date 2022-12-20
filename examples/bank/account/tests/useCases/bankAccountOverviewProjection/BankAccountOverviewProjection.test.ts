import { expect } from 'chai';

import { v4 as uuid } from "uuid";
import { SQSEvent, SQSRecord } from 'aws-lambda/trigger/sqs';

import { AppDataSource } from "../../../shared/AppDataSource";
import { BankAccountOverview, BankAccountOverviewEntity } from '../../../shared/readModels/BankAccountOverviewEntity';

import { BankAccountOpened, BankAccountOpenedPayload } from '../../../shared/events/BankAccountOpened';

import { BankAccountOverviewProjector } from '../../../useCases/projectBankAccountOverview/BankAccountOverviewProjector';
import { handler } from '../../../useCases/projectBankAccountOverview/BankAccountOverviewProjectionHandler';
import { BankAccountOverviewRepository } from '../../../shared/readModels/BankAccountOverviewRepository';

describe('bank account overview projection', function() {
    it('projector', async function() {
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
        )

        const bankAccountOverviewProjector: BankAccountOverviewProjector = new BankAccountOverviewProjector(new BankAccountOverviewRepository());
        await bankAccountOverviewProjector.project(
            bankAccountOpened.aggregateId,
            bankAccountOpened.name,
            bankAccountOpened.payload,
            bankAccountOpened.aggregateVersion
        );

        const state: BankAccountOverview | null = await AppDataSource.manager.findOneBy(BankAccountOverviewEntity, {
            aggregateId: aggregateId
        });

        expect(state?.aggregateId).equal(bankAccountOpened.aggregateId);
        expect(state?.firstname).equal(bankAccountOpened.payload.customer.firstname);
        expect(state?.email).equal(bankAccountOpened.payload.customer.email);
        expect(state?.active).equal(false);
        expect(state?.balance).equal(bankAccountOpened.payload.balance);

    });

    it('projection handler', async function() {
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
        console.log('aggregateId: '+aggregateId);

        const bankAccountOpened = new BankAccountOpened(
            aggregateId,
            1,
            {
                customer: {
                    email: 'peter1@provider.com',
                    firstname: 'Peter1'
                },
                balance: 0.0,
                status: 'NOT_ACTIVATED'
            },
            new Date()
        );

        const sQSEvent: SQSEvent = {
            Records: [
                {
                    messageId: 'dc283a2a-c18b-4676-b03f-9a287caeb606',
                    body: JSON.stringify(bankAccountOpened),
                } as SQSRecord
            ]
        };
        await handler(sQSEvent);

        const state: BankAccountOverview | null = await AppDataSource.manager.findOneBy(BankAccountOverviewEntity, {
            aggregateId: aggregateId
        });

        expect(state?.aggregateId).equal(bankAccountOpened.aggregateId);
        expect(state?.firstname).equal(bankAccountOpened.payload.customer.firstname);
        expect(state?.email).equal(bankAccountOpened.payload.customer.email);
        expect(state?.active).equal(false);
        expect(state?.balance).equal(bankAccountOpened.payload.balance);
    });
});