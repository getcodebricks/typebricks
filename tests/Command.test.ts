import { expect } from 'chai';
import { AppendTransaction } from '../examples/bank/account/useCases/appendTransaction/AppendTransaction';

describe('command', function() {
    it('command', function() {
        const bodyObject = {
            bankAccountId: 'some id',
            amount: 20.0,
        };
        const bodyHttpRequest = JSON.stringify(bodyObject);
        const body = JSON.parse(bodyHttpRequest);

        const appendTransaction = AppendTransaction.fromDto(body);
        expect(appendTransaction.bankAccountId).equal(bodyObject.bankAccountId);
        expect(appendTransaction.amount.value).equal(bodyObject.amount);
    });

    it('command missing attribute', function() {
        const bodyObjectInvalid = {
            bankAccountId: 'some id'
        };
        const bodyHttpRequest = JSON.stringify(bodyObjectInvalid);
        const body = JSON.parse(bodyHttpRequest);

        const appendTransaction = new AppendTransaction(body);
        expect(appendTransaction.bankAccountId).equal(bodyObjectInvalid.bankAccountId);
        expect(appendTransaction.amount).equal(undefined);
    });
});