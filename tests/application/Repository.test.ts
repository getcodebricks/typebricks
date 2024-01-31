import { expect } from 'chai';
import { v4 as uuid } from "uuid";

import { BankAccountRepository } from '../../examples/bank/account/shared/BankAccountRepository';
import { BankAccountEventStreamEntity } from '../../examples/bank/account/shared/BankAccountEventStreamEntity';
import { BankAccount, BankAccountState } from '../../examples/bank/account/shared/BankAccount';
import { ValidationError } from "../../src/domain/ValidationError";

import { mockClient } from 'aws-sdk-client-mock';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { CustomerValueObject } from '../../examples/bank/account/shared/valueObjects/CustomerValueObject';
import { EmailValueObject } from '../../examples/bank/account/shared/valueObjects/EmailValueObject';
import { FirstNameValueObject } from '../../examples/bank/account/shared/valueObjects/FirstNameValueObject';
import { AmountValueObject } from '../../examples/bank/account/shared/valueObjects/AmountValueObject';
const snsMock = mockClient(SNSClient);

describe('repository', function() {
    it('bank account repository', async function() {
        const messageIds = [
            '12345678-1111-2222-3333-111122223333',
            '12345678-1111-2222-3333-111122223334'
        ]
        snsMock.reset();
        snsMock.on(PublishCommand)
        .resolves({
            MessageId: messageIds[0]
        })
        .resolves({
            MessageId: messageIds[1]
        });
        const bankAccountRepository: BankAccountRepository = new BankAccountRepository();

        const bankAccount = new BankAccount(uuid());
        bankAccount.open(
            new CustomerValueObject(
                new EmailValueObject('name@provider.com'),
                new FirstNameValueObject('Hans')
            )
        );
        bankAccount.appendTransaction(
            new AmountValueObject(20.0)
        );

        const pendingEvents = bankAccount.pendingEvents;
        await bankAccountRepository.save(bankAccount);
        

        const bankAccountLoaded = await bankAccountRepository.get(bankAccount.id);
        expect(bankAccount.id).equal(bankAccountLoaded?.id);
        expect(bankAccount.version).equal(bankAccountLoaded?.version);
        expect(bankAccount.state.customer.firstName.value).equal(bankAccountLoaded?.state.customer.firstName.value);
        expect(bankAccount.state.customer.email.value).equal(bankAccountLoaded?.state.customer.email.value);

        const snsCalls = snsMock.calls();
        expect(snsCalls.length).equal(2);
        expect(JSON.stringify(snsCalls[0].args[0].input)).equal(JSON.stringify({
            TopicArn: undefined,
            Message: JSON.stringify(pendingEvents[0].payload),
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: pendingEvents[0].name
                }
            }
        }));
        expect(JSON.stringify(snsCalls[1].args[0].input)).equal(JSON.stringify({
            TopicArn: undefined,
            Message: JSON.stringify(pendingEvents[1].payload),
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: pendingEvents[1].name
                }
            }
        }));
    });
});