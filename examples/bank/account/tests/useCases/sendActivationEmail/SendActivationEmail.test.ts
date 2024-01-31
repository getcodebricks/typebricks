import { expect } from 'chai';
import { mockClient } from 'aws-sdk-client-mock';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
const snsMock = mockClient(SNSClient);

import { ValidationError } from "../../../../../../src/domain/ValidationError";

import { SQSEvent, SQSRecord } from 'aws-lambda/trigger/sqs';
import { handler } from '../../../useCases/sendActivationEmail/SendActivationEmailPolicyHandler';
import { BankAccountRepository } from '../../../shared/BankAccountRepository';
import { BankAccount } from '../../../shared/BankAccount';

import { v4 as uuid } from "uuid";
import { assert } from 'console';
import { DomainError } from '../../../../../../src/domain/DomainError';
import { CustomerValueObject } from '../../../shared/valueObjects/CustomerValueObject';
import { FirstNameValueObject } from '../../../shared/valueObjects/FirstNameValueObject';
import { EmailValueObject } from '../../../shared/valueObjects/EmailValueObject';

describe('send activation email', function() {
    it('send activation email api handler', async function() {
        snsMock.reset();
        snsMock.on(PublishCommand).resolves({
            MessageId: '12345678-1111-2222-3333-111122223333',
        });

        const bankAccountRepository: BankAccountRepository = new BankAccountRepository();
        const bankAccount = new BankAccount(uuid());
        bankAccount.open(
            new CustomerValueObject(
                new FirstNameValueObject('Peter'),
                new EmailValueObject('peter@provider.com')
            )
        );
        await bankAccountRepository.save(bankAccount);

        const bodyObject = {
            bankAccountId: bankAccount.id
        };
        const sQSEvent: SQSEvent = {
            Records: [
                {
                    messageId: 'dc283a2a-c18b-4676-b03f-9a287caeb606',
                    body: JSON.stringify(bodyObject),
                } as SQSRecord
            ]
        };

       await handler(sQSEvent);
    });

    it('send activation email api handler for not existing account', async function() {
        const bodyObject = {
            bankAccountId: 'dc283a2a-c18b-4676-b03f-9a287caeb606'
        };
        const sQSEvent: SQSEvent = {
            Records: [
                {
                    messageId: 'dc283a2a-c18b-4676-b03f-9a287caeb606',
                    body: JSON.stringify(bodyObject),
                } as SQSRecord
            ]
        };
        try {
            await handler(sQSEvent);
        } catch(error: any) {
            expect(error instanceof DomainError).to.be.equal(true);
            expect(error.message).to.be.equal('Bank account does not exist');
        }
    });
});