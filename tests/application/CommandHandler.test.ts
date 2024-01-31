require('dotenv').config();

import { expect } from 'chai';
import { v4 as uuid } from "uuid";

import { OpenBankAccountCommandHandler } from '../../examples/bank/account/useCases/openBankAccount/OpenBankAccountCommandHandler';
import { BankAccountRepository } from '../../examples/bank/account/shared/BankAccountRepository';
import { OpenBankAccountCommand } from '../../examples/bank/account/useCases/openBankAccount/OpenBankAccountCommand';

import { mockClient } from 'aws-sdk-client-mock';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { EmailValueObject } from '../../examples/bank/account/shared/valueObjects/EmailValueObject';
import { CustomerValueObject } from '../../examples/bank/account/shared/valueObjects/CustomerValueObject';
import { FirstNameValueObject } from '../../examples/bank/account/shared/valueObjects/FirstNameValueObject';
const snsMock = mockClient(SNSClient);

describe('command handler', function() {
    it('bank account command Handler', async function() {
        snsMock.reset();
        snsMock.on(PublishCommand).resolves({
            MessageId: '12345678-1111-2222-3333-111122223333',
        });

        const openBankAccountCommandHandler = new OpenBankAccountCommandHandler(new BankAccountRepository());
        const bankAccount = await openBankAccountCommandHandler.handle(
            new OpenBankAccountCommand({
                customer: new CustomerValueObject(
                    new EmailValueObject('name@provider.com'),
                    new FirstNameValueObject('Hans')
                )
            })
        );

        expect(bankAccount?.pendingEvents.length).equal(0);
        expect(bankAccount?.version).equal(1);
        expect(bankAccount?.state.customer.firstName.value).equal('Hans');
        expect(
            bankAccount?.state.customer.email.equals(
                new EmailValueObject('name@provider.com')
            )
        ).equal(true);
    });
});