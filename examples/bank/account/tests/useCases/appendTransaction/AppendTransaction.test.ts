import { expect } from 'chai';
import { mockClient } from 'aws-sdk-client-mock';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
const snsMock = mockClient(SNSClient);

import { ValidationError } from "../../../../../../src/domain/ValidationError";
import { APIGatewayProxyEvent } from 'aws-lambda';

import { APIGatewayEvent } from 'aws-lambda';
import { handler } from '../../../useCases/appendTransaction/AppendTransactionApiHandler';
import { BankAccountRepository } from '../../../shared/BankAccountRepository';
import { BankAccount } from '../../../shared/BankAccount';
import { CustomerValueObject } from '../../../shared/valueObjects/CustomerValueObject';
import { FirstNameValueObject } from '../../../shared/valueObjects/FirstNameValueObject';
import { EmailValueObject } from '../../../shared/valueObjects/EmailValueObject';

import { v4 as uuid } from "uuid";

describe('send activation email', function () {
    it('send activation email api handler', async function () {
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
            bankAccountId: bankAccount.id,
            amount: 20.0
        };
        const apiGatewayEvent = {
            body: JSON.stringify(bodyObject),
        } as APIGatewayProxyEvent;

        await handler(apiGatewayEvent);
    });
});