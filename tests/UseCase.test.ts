import { expect } from 'chai';

import { BankAccount } from '../examples/bank/account/shared/BankAccount';
import { ValidationError } from "../src/domain/ValidationError";
import { AppendTransactionCommand } from '../examples/bank/account/useCases/appendTransaction/AppendTransactionCommand';
import { OpenBankAccountCommand } from '../examples/bank/account/useCases/openBankAccount/OpenBankAccountCommand';
import { CustomerValueObject } from '../examples/bank/account/shared/valueObjects/CustomerValueObject';
import { EmailValueObject } from '../examples/bank/account/shared/valueObjects/EmailValueObject';
import { FirstNameValueObject } from '../examples/bank/account/shared/valueObjects/FirstNameValueObject';

describe('use case', function() {
    it('bank account open and append transaction', function() {
        const bankAccount = new BankAccount('some id');
        bankAccount.open(
            new CustomerValueObject(
                new EmailValueObject('name@provider.com'),
                new FirstNameValueObject('Hans')
            )
        );
        expect(bankAccount.version).equal(1);
        expect(bankAccount.state.balance.value).equal(0.0);
        expect(bankAccount.state.customer.profile.email.value).equal('name@provider.com');
        expect(bankAccount.pendingEvents.length).equal(1);
        expect(bankAccount.pendingEvents.slice(-1).shift()?.payload.customer.profile.email).equal('name@provider.com');


        const bodyObjectAppendTransaction = {
            amount: 20.0
        };
        const bodyAppendTransaction = JSON.stringify(bodyObjectAppendTransaction);
        const bodyJsonAppendTransaction = JSON.parse(bodyAppendTransaction);
        const appendTransaction = AppendTransactionCommand.fromDto(bodyJsonAppendTransaction);
        bankAccount.appendTransaction(
            appendTransaction.amount
        );
        expect(bankAccount.version).equal(2);
        expect(bankAccount.state.balance.value).equal(20.0);
        expect(bankAccount.state.customer.profile.email.value).equal('name@provider.com');
        expect(bankAccount.pendingEvents.length).equal(2);
        expect(bankAccount.pendingEvents.slice(-1).shift()?.payload.newBalance).equal(20.0);
    });
});