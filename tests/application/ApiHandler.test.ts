require('dotenv').config();

import { expect } from 'chai';
import { v4 as uuid } from "uuid";
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayEventRequestContext, APIGatewayEventIdentity } from "aws-lambda";
import { handler } from '../../examples/bank/account/useCases/openBankAccount/OpenBankAccountApiHandler';
import { mockClient } from 'aws-sdk-client-mock';
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

describe('api handler', function() {
    it('bank account command Handler', async function() {
        const sqsMock = mockClient(SQSClient);
        sqsMock.reset();
        sqsMock.on(SendMessageCommand).resolves({
            MessageId: '12345678-1111-2222-3333-111122223333'
        });
        const bodyObject = {
            customer: {
                email: 'name@provider.com',
                firstName: 'Peter'
            }
        };

        const identity: APIGatewayEventIdentity =  {
            accessKey: null,
            accountId: null,
            apiKey: null,
            apiKeyId: null,
            caller: null,
            clientCert: null,
            cognitoAuthenticationProvider: null,
            cognitoAuthenticationType: null,
            cognitoIdentityId: null,
            cognitoIdentityPoolId: null,
            principalOrgId: null,
            sourceIp: '127.0.0.1',
            user: null,
            userAgent: null,
            userArn: null
        }

        const apiGatewayRequestContext: APIGatewayEventRequestContext = {
            accountId: '001258663618',
            resourceId: '7fzruc',
            stage: 'DEV',
            requestId: 'e8a2a549-a5ae-4c1b-8aae-4f1e36d479a2',
            requestTime: '23/Jan/2022:21:21:34 +0000',
            requestTimeEpoch: 1642972894867,
            path: '/DEV/bank-account/open-bank-account',
            resourcePath: '/bank-account/open-bank-account',
            httpMethod: 'POST',
            apiId: 'mk4gyhcd09',
            authorizer: null,
            protocol: 'HTTPS',
            identity: identity
        };

        const apiGatewayEvent: APIGatewayProxyEvent = {
            body: JSON.stringify(bodyObject),
            resource: '/bank-account/open-bank-account',
            path: '/bank-account/open-bank-account',
            httpMethod: 'POST',
            headers: {
                Accept: '*/*',
                'accept-encoding': 'gzip, deflate',
                'cache-control': 'no-cache',
                'Content-Type': 'application/json',
                Host: 'xxxxxxxx00.execute-api.eu-central-1.amazonaws.com',
                'Postman-Token': 'ee12cc11-69ca-4771-b07e-5d3432e04be0',
                'User-Agent': 'PostmanRuntime/7.6.0',
                'X-Amzn-Trace-Id': 'Root=1-61edc6de-1cf2ee9e3890444d31642d0f',
                'X-Forwarded-For': '84.172.85.46',
                'X-Forwarded-Port': '443',
                'X-Forwarded-Proto': 'https'
            },
            requestContext: apiGatewayRequestContext,
            multiValueHeaders: {},
            isBase64Encoded: false,
            pathParameters: null,
            queryStringParameters: null,
            multiValueQueryStringParameters: null,
            stageVariables: null
        };

        const result = await handler(apiGatewayEvent);
        const body = JSON.parse(result.body ? result.body : '{}');

        expect(result?.statusCode).equal(200);
        expect(body.data.id).to.match(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/);
    });
});