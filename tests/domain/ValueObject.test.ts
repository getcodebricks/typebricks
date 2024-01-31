import { expect } from 'chai';

import { ValidationError } from "../../src/domain/ValidationError";
import { BalanceValueObject } from '../../examples/bank/account/shared/valueObjects/BalanceValueObject';

describe('valueObject', function() {
    it('balance valid', function() {
        const balanceValue = 123;
        const balance = new BalanceValueObject(balanceValue);
        expect(balance.value).equal(balanceValue);
    });

    it('balance invalid', function() {
        expect(
            () => new BalanceValueObject('foo' as unknown as number)
        ).to.throw(ValidationError, 'BalanceValueObject: foo is invalid');
    });

    it('balance equal', function() {
        const balanceA = new BalanceValueObject(123);
        const balanceB = new BalanceValueObject(123);
        expect(balanceA.equals(balanceB)).equal(true);
    });

    it('balance not equal', function() {
        const balanceA = new BalanceValueObject(123);
        const balanceB = new BalanceValueObject(321);
        expect(balanceA.equals(balanceB)).equal(false);
    });
});