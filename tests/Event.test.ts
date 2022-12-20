import { expect } from 'chai';

import { StoredEvent } from '../src/application/StoredEvent';
import { BankAccount } from '../examples/bank/account/shared/BankAccount';
import { BankAccountOpened, BankAccountOpenedPayload  } from '../examples/bank/account/shared/events/BankAccountOpened';
import { BankAccountTransactionAppended  } from '../examples/bank/account/shared/events/BankAccountTransactionAppended';
import { Amount } from '../examples/bank/account/shared/valueObjects/Amount';
import { Customer } from '../examples/bank/account/shared/valueObjects/Customer';
import { Firstname } from '../examples/bank/account/shared/valueObjects/Firstname';
import { Email } from '../examples/bank/account/shared/valueObjects/Email';
import { Status, StatusValues } from '../examples/bank/account/shared/valueObjects/Status';
import { Balance } from '../examples/bank/account/shared/valueObjects/Balance';

describe('event', function() {
    it('one event serialization and deserialization', function() {
        const bankAccountOpened = new BankAccountOpened(
            'some id',
            1,
            {
                customer: {
                        email: 'name@provider.com',
                        firstname: 'Peter'
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
            new Date(obj.occuredAt)
        );

        expect(bankAccountOpenedFromJson.name).equal(BankAccountOpened.name);
        expect(bankAccountOpenedFromJson.aggregateId).equal(bankAccountOpened.aggregateId);
        expect(bankAccountOpenedFromJson.aggregateVersion).equal(bankAccountOpened.aggregateVersion);
        expect(bankAccountOpenedFromJson.occuredAt.toDateString()).equal(bankAccountOpened.occuredAt.toDateString());
        expect(bankAccountOpenedFromJson.payload.status).equal(bankAccountOpened.payload.status);
        expect(bankAccountOpenedFromJson.payload.customer.email).equal(bankAccountOpened.payload.customer.email);
    });

    it('multiple event serialization and deserialization', function() {
        const bankAccountOpened = new BankAccountOpened(
            'some id',
            1,
            {
                customer: {
                    email: 'name@provider.com',
                    firstname: 'Peter'
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
                aggregateId: bankAccountOpened.aggregateId,
                aggregateVersion: bankAccountOpened.aggregateVersion,
                payload: JSON.stringify(bankAccountOpened.payload),
                topic: bankAccountOpened.name,
                occuredAt: bankAccountOpened.occuredAt
            },
            {
                aggregateId: bankAccountTransactionAppended.aggregateId,
                aggregateVersion: bankAccountTransactionAppended.aggregateVersion,
                payload: JSON.stringify(bankAccountTransactionAppended.payload),
                topic: bankAccountTransactionAppended.name,
                occuredAt: bankAccountTransactionAppended.occuredAt
            }
        ];

        const events = eventStream.map((storedEvent: StoredEvent) => {
            switch (storedEvent.topic) {
                case BankAccountOpened.name:
                    return new BankAccountOpened(
                        storedEvent.aggregateId,
                        storedEvent.aggregateVersion,
                        JSON.parse(storedEvent.payload),
                        new Date(storedEvent.occuredAt)
                    );

                case BankAccountTransactionAppended.name:
                    return new BankAccountTransactionAppended(
                        storedEvent.aggregateId,
                        storedEvent.aggregateVersion,
                        JSON.parse(storedEvent.payload),
                        new Date(storedEvent.occuredAt)
                    );
            }
        });

        expect(events.length).equal(2);

        const bankAccountOpenedDeserialized = events[0];
        const bankAccountTransactionAppendedDeserialized = events[1];

        expect(bankAccountOpenedDeserialized instanceof BankAccountOpened).equal(true);
        expect(bankAccountOpenedDeserialized?.payload.customer.profile.email).equal(bankAccountOpened.payload.customer.email);
        expect(bankAccountTransactionAppendedDeserialized instanceof BankAccountTransactionAppended).equal(true);
        expect(bankAccountTransactionAppendedDeserialized?.payload.newBalance).equal(bankAccountTransactionAppended.payload.newBalance);
    });
});