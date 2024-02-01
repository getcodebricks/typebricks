import { expect } from 'chai';

import { ValidationError } from "../../src/domain/ValidationError";
import { BalanceValueObject } from '../../examples/bank/account/shared/valueObjects/BalanceValueObject';
import { CustomerValueObject } from '../../examples/bank/account/shared/valueObjects/CustomerValueObject';
import { EmailValueObject } from '../../examples/bank/account/shared/valueObjects/EmailValueObject';
import { FirstNameValueObject } from '../../examples/bank/account/shared/valueObjects/FirstNameValueObject';

describe('valueObject', function () {
    it('balance valid', function () {
        const balanceValue = 123;
        const balance = new BalanceValueObject(balanceValue);
        expect(balance.value).equal(balanceValue);
    });

    it('balance invalid', function () {
        expect(
            () => new BalanceValueObject('foo' as unknown as number)
        ).to.throw(ValidationError, 'BalanceValueObject: foo is invalid');
    });

    it('balance equal', function () {
        const balanceA = new BalanceValueObject(123);
        const balanceB = new BalanceValueObject(123);
        expect(balanceA.equals(balanceB)).equal(true);
    });

    it('balance not equal', function () {
        const balanceA = new BalanceValueObject(123);
        const balanceB = new BalanceValueObject(321);
        expect(balanceA.equals(balanceB)).equal(false);
    });

    it('test object equals.', async function () {
        const customerValueObject: CustomerValueObject = new CustomerValueObject(
            new EmailValueObject('john@doe.com'),
            new FirstNameValueObject('John')
        );
        const customerValueObject1: CustomerValueObject = new CustomerValueObject(
            new EmailValueObject('john@doe.com'),
            new FirstNameValueObject('John')
        );
        expect(customerValueObject.equals(customerValueObject1)).to.be.true;
    });
    it('test from object and to object.', async function () {
        const customerValueObject: CustomerValueObject = new CustomerValueObject(
            new EmailValueObject('john@doe.com'),
            new FirstNameValueObject('John')
        );
        expect(CustomerValueObject.fromObject(customerValueObject.toObject()).equals(customerValueObject)).to.be.true;
    });
});