import { expect } from 'chai';
import { mockClient } from 'aws-sdk-client-mock';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
const snsMock = mockClient(SNSClient);

import { ValidationError } from "../../../../../../src/domain/ValidationError";
import { APIGatewayProxyEvent } from 'aws-lambda';

import { handler } from '../../../useCases/openBankAccount/OpenBankAccountApiHandler';
import { OpenBankAccountCommand } from '../../../useCases/openBankAccount/OpenBankAccountCommand';
import { OpenBankAccountCommandHandler } from '../../../useCases/openBankAccount/OpenBankAccountCommandHandler';
import { BankAccountRepository } from '../../../shared/BankAccountRepository';
import { CustomerValueObject } from '../../../shared/valueObjects/CustomerValueObject';
import { EmailValueObject } from '../../../shared/valueObjects/EmailValueObject';
import { FirstNameValueObject } from '../../../shared/valueObjects/FirstNameValueObject';
import { StatusValues } from '../../../shared/valueObjects/StatusValueObject';

describe('open bank account', function() {
    it('open bank account api handler', async function() {
        snsMock.reset();
        snsMock.on(PublishCommand).resolves({
            MessageId: '12345678-1111-2222-3333-111122223333',
        });

        const bodyObject = {
            customer: {
                email: 'name@provider.com',
                firstName: 'Peter'
            }
        };

        const apiGatewayEvent: APIGatewayProxyEvent = {
            body: JSON.stringify(bodyObject)
        } as APIGatewayProxyEvent;

        const result = await handler(apiGatewayEvent);
        const body = JSON.parse(result.body ? result.body : '{}');

        expect(result?.statusCode).equal(200);
        expect(body.data.id).to.match(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/);
    });

    it('open bank account command handler', async function() {
        snsMock.reset();
        snsMock.on(PublishCommand).resolves({
            MessageId: '12345678-1111-2222-3333-111122223333',
        });

        const openBankAccountCommandHandler = new OpenBankAccountCommandHandler(new BankAccountRepository());
        const bankAccount = await openBankAccountCommandHandler.handle(
            new OpenBankAccountCommand({
                customer: new CustomerValueObject(
                    new EmailValueObject('name@provider.com'),
                    new FirstNameValueObject('Hans'),
                )
            })
        );

        expect(bankAccount?.pendingEvents.length).equal(0);
        expect(bankAccount?.version).equal(1);
        expect(bankAccount?.state.customer.firstName.value).equal('Hans');
        expect(
            bankAccount?.state.customer.email.equals(
                new EmailValueObject('name@provider.com')
            )
        ).equal(true);
        expect(bankAccount?.state.balance.value).equal(0.0);
        expect(bankAccount?.state.status.value).equal(StatusValues.NOT_ACTIVATED);
    });

    it('open bank account command', function() {
        const bodyObject = {
            customer: {
                email: 'name@provider.com',
                firstName: 'Peter'
            }
        };
        const openBankAccountCommand = OpenBankAccountCommand.fromDto(bodyObject);
        expect(openBankAccountCommand.customer.email.value).equal(bodyObject.customer.email);
        expect(openBankAccountCommand.customer.firstName.value).equal(bodyObject.customer.firstName);
    });

    it('open bank account command invalid email', async function() {
        snsMock.reset();
        snsMock.on(PublishCommand).resolves({
            MessageId: '12345678-1111-2222-3333-111122223333',
        });

        const bodyObject = {
            customer: {
                email: 'nameATprovider.com',
                firstName: 'Peter'
            }
        };

        const apiGatewayEvent: APIGatewayProxyEvent = {
            body: JSON.stringify(bodyObject)
        } as APIGatewayProxyEvent;

        const result = await handler(apiGatewayEvent);
        const body = JSON.parse(result.body ? result.body : '{}');

        expect(result?.statusCode).equal(400);
    });

    it('open bank account command missing firstName', async function() {
        snsMock.reset();
        snsMock.on(PublishCommand).resolves({
            MessageId: '12345678-1111-2222-3333-111122223333',
        });

        const bodyObject = {
            customer: {
                email: 'name@provider.com'
            }
        };

        const apiGatewayEvent: APIGatewayProxyEvent = {
            body: JSON.stringify(bodyObject)
        } as APIGatewayProxyEvent;

        const result = await handler(apiGatewayEvent);
        const body = JSON.parse(result.body ? result.body : '{}');

        expect(result?.statusCode).equal(400);
    });

    it('open bank account command invalid json in request', async function() {
        snsMock.reset();
        snsMock.on(PublishCommand).resolves({
            MessageId: '12345678-1111-2222-3333-111122223333',
        });

        const bodyString = 'customer:{email: xoxo}}';

        const apiGatewayEvent: APIGatewayProxyEvent = {
            body: bodyString
        } as APIGatewayProxyEvent;

        const result = await handler(apiGatewayEvent);
        const body = JSON.parse(result.body ? result.body : '{}');

        expect(result?.statusCode).equal(400);
    });
});