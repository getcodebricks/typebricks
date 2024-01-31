import { expect } from 'chai';

import { StoredEvent } from '../../src/application/StoredEvent';
import { BankAccount } from '../../examples/bank/account/shared/BankAccount';
import { BankAccountOpened, BankAccountOpenedPayload  } from '../../examples/bank/account/shared/events/BankAccountOpened';
import { BankAccountTransactionAppended  } from '../../examples/bank/account/shared/events/BankAccountTransactionAppended';
import { StatusValues } from '../../examples/bank/account/shared/valueObjects/StatusValueObject';

describe('event', () => {
    it('one event serialization and deserialization', () => {
        const bankAccountOpened = new BankAccountOpened(
            'some id',
            1,
            {
                customer: {
                        email: 'name@provider.com',
                        firstName: 'Peter'
                },
                status: StatusValues.NOT_ACTIVATED,
                balance: 0.0
            }
        );

        const bankAccountOpenedJson = JSON.stringify(bankAccountOpened);
        const obj = JSON.parse(bankAccountOpenedJson);
        const bankAccountOpenedFromJson = new BankAccountOpened(
            obj.aggregateId,
            obj.aggregateVersion,
            obj.payload,
            new Date(obj.occurredAt)
        );

        expect(bankAccountOpenedFromJson.name).equal(BankAccountOpened.name);
        expect(bankAccountOpenedFromJson.aggregateId).equal(bankAccountOpened.aggregateId);
        expect(bankAccountOpenedFromJson.aggregateVersion).equal(bankAccountOpened.aggregateVersion);
        expect(bankAccountOpenedFromJson.occurredAt.toDateString()).equal(bankAccountOpened.occurredAt.toDateString());
        expect(bankAccountOpenedFromJson.payload.status).equal(bankAccountOpened.payload.status);
        expect(bankAccountOpenedFromJson.payload.customer.email).equal(bankAccountOpened.payload.customer.email);
    });

    it('multiple event serialization and deserialization', () => {
        const bankAccountOpened = new BankAccountOpened(
            'some id',
            1,
            {
                customer: {
                    email: 'name@provider.com',
                    firstName: 'Peter'
                },
                status: StatusValues.NOT_ACTIVATED,
                balance: 0.0
            }
        );

        const bankAccountTransactionAppended = new BankAccountTransactionAppended(
            'some id',
            2,
            {
                newBalance: 20.0
            }
        );
        const eventStream: StoredEvent[] = [
            {
                name: bankAccountOpened.name,
                aggregateId: bankAccountOpened.aggregateId,
                aggregateVersion: bankAccountOpened.aggregateVersion,
                payload: JSON.stringify(bankAccountOpened.payload),
                occurredAt: bankAccountOpened.occurredAt
            },
            {
                name: bankAccountTransactionAppended.name,
                aggregateId: bankAccountTransactionAppended.aggregateId,
                aggregateVersion: bankAccountTransactionAppended.aggregateVersion,
                payload: JSON.stringify(bankAccountTransactionAppended.payload),
                occurredAt: bankAccountTransactionAppended.occurredAt
            }
        ];

        const events = eventStream.map((storedEvent: StoredEvent) => {
            switch (storedEvent.name) {
                case BankAccountOpened.name:
                    return new BankAccountOpened(
                        storedEvent.aggregateId,
                        storedEvent.aggregateVersion,
                        JSON.parse(storedEvent.payload),
                        new Date(storedEvent.occurredAt)
                    );

                case BankAccountTransactionAppended.name:
                    return new BankAccountTransactionAppended(
                        storedEvent.aggregateId,
                        storedEvent.aggregateVersion,
                        JSON.parse(storedEvent.payload),
                        new Date(storedEvent.occurredAt)
                    );
            }
        });

        expect(events.length).equal(2);

        const bankAccountOpenedDeserialized = events[0];
        const bankAccountTransactionAppendedDeserialized = events[1];

        expect(bankAccountOpenedDeserialized instanceof BankAccountOpened).equal(true);
        expect(bankAccountOpenedDeserialized?.payload.customer.email).equal(bankAccountOpened.payload.customer.email);
        expect(bankAccountTransactionAppendedDeserialized instanceof BankAccountTransactionAppended).equal(true);
        expect(bankAccountTransactionAppendedDeserialized?.payload.newBalance).equal(bankAccountTransactionAppended.payload.newBalance);
    });
});