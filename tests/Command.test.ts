import { expect } from 'chai';
import { AppendTransactionCommand } from '../examples/bank/account/useCases/appendTransaction/AppendTransactionCommand';

describe('command', function() {
    it('command', function() {
        const bodyObject = {
            bankAccountId: 'some id',
            amount: 20.0,
        };
        const bodyHttpRequest = JSON.stringify(bodyObject);
        const body = JSON.parse(bodyHttpRequest);

        const appendTransaction = AppendTransactionCommand.fromDto(body);
        expect(appendTransaction.bankAccountId).equal(bodyObject.bankAccountId);
        expect(appendTransaction.amount.value).equal(bodyObject.amount);
    });

    it('command missing attribute', function() {
        const bodyObjectInvalid = {
            bankAccountId: 'some id'
        };
        const bodyHttpRequest = JSON.stringify(bodyObjectInvalid);
        const body = JSON.parse(bodyHttpRequest);

        const appendTransaction = new AppendTransactionCommand(body);
        expect(appendTransaction.bankAccountId).equal(bodyObjectInvalid.bankAccountId);
        expect(appendTransaction.amount).equal(undefined);
    });
});