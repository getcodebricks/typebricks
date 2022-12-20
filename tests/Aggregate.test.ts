import { expect } from 'chai';

import { BankAccount, BankAccountState } from '../examples/bank/account/shared/BankAccount';
import { ValidationError } from "../src/domain/ValidationError";
import { Amount } from '../examples/bank/account/shared/valueObjects/Amount';
import { Email } from '../examples/bank/account/shared/valueObjects/Email';
import { Customer } from '../examples/bank/account/shared/valueObjects/Customer';
import { Firstname } from '../examples/bank/account/shared/valueObjects/Firstname';
import { Status, StatusValues } from '../examples/bank/account/shared/valueObjects/Status';
import { Balance } from '../examples/bank/account/shared/valueObjects/Balance';

describe('aggregate', function() {
    it('bank account events', function() {
        const bankAccount = new BankAccount('some id');
        expect(bankAccount.state).to.deep.equal({});
        expect(bankAccount.version).equal(0);
        expect(bankAccount.id).equal('some id');
        expect(bankAccount.pendingEvents.length).equal(0);

        bankAccount.open(
            new Customer({
                firstname: new Firstname({
                    value: 'Peter'
                }),
                email: new Email({
                    value: 'name@provider.com'
                })
            })
        );
        expect(bankAccount.version).equal(1);
        expect(bankAccount.state.balance.value).equal(0.0);
        expect(bankAccount.state.customer.profile.email.value).equal('name@provider.com');
        expect(bankAccount.pendingEvents.length).equal(1);
        expect(bankAccount.pendingEvents.slice(-1).shift()?.payload.customer.profile.email).equal('name@provider.com');

        bankAccount.appendTransaction(
            new Amount({
                value: 20.0
            })
        );
        expect(bankAccount.version).equal(2);
        expect(bankAccount.state.balance.value).equal(20.0);
        expect(bankAccount.state.customer.profile.email.value).equal('name@provider.com');
        expect(bankAccount.pendingEvents.length).equal(2);
        expect(bankAccount.pendingEvents.slice(-1).shift()?.payload.newBalance).equal(20.0);
    });
});