import { expect } from 'chai';

import { BankAccount } from '../examples/bank/account/shared/BankAccount';
import { AppendTransaction  } from '../examples/bank/account/useCases/appendTransaction/AppendTransaction';
import { OpenBankAccount  } from '../examples/bank/account/useCases/openBankAccount/OpenBankAccountCommand';
import { ValidationError } from "../src/domain/ValidationError";
import { Amount } from '../examples/bank/account/shared/valueObjects/Amount';
import { Customer } from '../examples/bank/account/shared/valueObjects/Customer';
import { Profile } from '../examples/bank/account/shared/valueObjects/Profile';
import { Firstname } from '../examples/bank/account/shared/valueObjects/Firstname';
import { Email } from '../examples/bank/account/shared/valueObjects/Email';
import { Status, StatusValues } from '../examples/bank/account/shared/valueObjects/Status';
import { Balance } from '../examples/bank/account/shared/valueObjects/Balance';

describe('use case', function() {
    it('bank account open and append transaction', function() {
        const bodyObjectOpenBankAccount = {
            profile: new Profile({
                firstname: new Firstname({
                    value: 'Peter'
                }),
                email: new Email({
                    value: 'name@provider.com'
                })
            }),
            status: new Status({
                value: StatusValues.NOT_ACTIVATED
            })
        };
        const bodyJsonOpenBankAccount = JSON.stringify(bodyObjectOpenBankAccount);
        const bodyOpenBankAccount = JSON.parse(bodyJsonOpenBankAccount);
        const openBankAccount = new OpenBankAccount(bodyOpenBankAccount);
        
        const bankAccount = new BankAccount('some id');
        bankAccount.open(
            new Customer({
                profile: new Profile({
                    firstname: new Firstname({
                        value: 'Peter'
                    }),
                    email: new Email({
                        value: 'name@provider.com'
                    })
                }),
                status: new Status({
                    value: StatusValues.NOT_ACTIVATED
                })
            }),
            new Balance({
                value: 0.0
            })
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
        const appendTransaction = AppendTransaction.fromDto(bodyJsonAppendTransaction);
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