import { expect } from 'chai';

import { Balance, BalanceProps } from '../../examples/bank/account/shared/valueObjects/Balance';
import { Customer, CustomerProps } from '../../examples/bank/account/shared/valueObjects/Customer';
import { Status, StatusProps, StatusValues } from '../../examples/bank/account/shared/valueObjects/Status';
import { Email, EmailProps } from '../../examples/bank/account/shared/valueObjects/Email';
import { Firstname, FirstnameProps } from '../../examples/bank/account/shared/valueObjects/Firstname';
import { BankAccountId, BankAccountIdProps } from '../../examples/bank/account/shared/valueObjects/BankAccountId';
import { BankAccountIdList, BankAccountIdListProps } from '../../examples/bank/account/shared/valueObjects/BankAccountIdList';
import { ValidationError } from "../../src/domain/ValidationError";

describe('valueObject', function() {
    const balanceProps: BalanceProps = {
        value: 5.2
    };
    const balancePropsInvalid: BalanceProps = {
        value: -5.2
    };

    const emailProps: EmailProps = {
        value: 'name@provider.com'
    };
    const emailPropsInvalid: EmailProps = {
        value: 'name.com@provider'
    };
    
    const bankAccountIdValid: BankAccountIdProps = {
        value: '4ba48b37-e12d-4571-a5cc-0f6686ac8246'
    };

    it('balance valid', function() {
        const balance = new Balance(balanceProps);
        expect(balance.value).equal(balanceProps.value);
    });

    it('balance negative', function() {
        expect(
            () => new Balance(balancePropsInvalid)
        ).to.throw(ValidationError, 'Balance can not be negative');
    });

    it('balance equal', function() {
        const balanceA = new Balance(balanceProps);
        const balanceB = new Balance({
            value: 5.2
        });
        expect(balanceA.equals(balanceB)).equal(true);
    });

    it('balance not equal', function() {
        const balanceA = new Balance(balanceProps);
        const balanceB = new Balance({
            value: 5.0
        });
        expect(balanceA.equals(balanceB)).equal(false);
    });

    it('email valid', function() {
        const email = new Email(emailProps);
        expect(email.value).equal(emailProps.value);
    });

    it('email invalid', function() {
        expect(
            () => new Email(emailPropsInvalid)
        ).to.throw(ValidationError, 'Email is invalid');
    });

    it('email equal', function() {
        const emailA = new Email(emailProps);
        const emailB = new Email({
            value: 'name@provider.com'
        });
        expect(emailA.equals(emailB)).equal(true);
    });

    it('email not equal', function() {
        const emailA = new Email(emailProps);
        const emailB = new Email({
            value: 'othername@provider.com'
        });
        expect(emailA.equals(emailB)).equal(false);
    });

    it('value object serialize', function() {
        const customer = new Customer({
            email: new Email({
                value: 'name@provider.com'
            }),
            firstname: new Firstname({
                value: 'Hans'
            })
        });

        const customerJson = JSON.stringify(customer);

        const customerFromJson: Customer = Customer.fromObject(JSON.parse(customerJson));
        expect(customerFromJson.email.value).equal(customer.email.value);
        expect(customerFromJson.email instanceof Email).equal(true);
        expect(customerFromJson.firstname.value).equal(customer.firstname.value);
        expect(customerFromJson.firstname instanceof Firstname).equal(true);
        expect(customer.equals(customerFromJson)).equal(true);

        const customerJsonChanged: string = customerJson.replace('Hans', 'Dieter');
        const customerFromJsonChanged: Customer = Customer.fromObject(JSON.parse(customerJsonChanged));
    
        //TODO: fix
        // expect(customer.equals(customerFromJsonChanged)).equal(false);
        expect(customerFromJsonChanged.firstname.value).equal('Dieter');
    });

    it('valid bank account id', function() {
        const uuid: string = '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b';
        const bankAccountIdValid = new BankAccountId({value: uuid});
        expect(bankAccountIdValid.value).equal(uuid);
    });

    it('invalid bank account id', function() {
        const uuid: string = '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0g';
        expect(
            () => new BankAccountId({value: uuid})
        ).to.throw(ValidationError, 'BankAccountId is not a valid uuid');
    });

    it('valid bank account id list', function() {
        const uuid1: string = '6045db68-7e73-4f80-9c85-904dbd0a2ebe';
        const uuid2: string = '358aab5f-c7ba-4f02-8024-9afbff46d317';
        const uuid3: string = 'd1ab5277-e925-42c8-a6a3-2a93c5ede5ea';
        const bankAccountIdListValid = new BankAccountIdList({value: [uuid1, uuid2]});
        expect(bankAccountIdListValid.equals(new BankAccountIdList({value: [uuid1, uuid2]}))).to.be.true;
        expect(bankAccountIdListValid.equals(new BankAccountIdList({value: [uuid1]}))).to.be.false;
        expect(bankAccountIdListValid.equals(new BankAccountIdList({value: [uuid1, uuid3]}))).to.be.false;
    });
});