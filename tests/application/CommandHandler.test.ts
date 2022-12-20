require('dotenv').config();

import { expect } from 'chai';
import { v4 as uuid } from "uuid";

import { OpenBankAccountCommandHandler } from '../../examples/bank/account/useCases/openBankAccount/OpenBankAccountCommandHandler';
import { BankAccountRepository } from '../../examples/bank/account/shared/BankAccountRepository';
import { OpenBankAccountCommand } from '../../examples/bank/account/useCases/openBankAccount/OpenBankAccountCommand';
import { Customer } from "../../examples/bank/account/shared/valueObjects/Customer";
import { Email } from "../../examples/bank/account/shared/valueObjects/Email";
import { Firstname } from "../../examples/bank/account/shared/valueObjects/Firstname";
import { Status, StatusValues } from "../../examples/bank/account/shared/valueObjects/Status";
import { Balance } from "../../examples/bank/account/shared/valueObjects/Balance";

import { mockClient } from 'aws-sdk-client-mock';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
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
                customer: new Customer({
                    email: new Email({
                        value: 'name@provider.com'
                    }),
                    firstname: new Firstname({
                        value: 'Hans'
                    })
                })
            })
        );

        expect(bankAccount?.pendingEvents.length).equal(0);
        expect(bankAccount?.version).equal(1);
        expect(bankAccount?.state.customer.firstname.value).equal('Hans');
        expect(
            bankAccount?.state.customer.email.equals(
                new Email({
                    value: 'name@provider.com'
                })
            )
        ).equal(true);
    });
});