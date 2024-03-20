export type APIGatewayProxyEvent = APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>;

export type APIGatewayEventDefaultAuthorizerContext =
    | undefined
    | null
    | {
        [name: string]: any;
    };

export interface APIGatewayProxyResult {
    statusCode: number;
    headers?:
    | {
        [header: string]: boolean | number | string;
    }
    | undefined;
    multiValueHeaders?:
    | {
        [header: string]: Array<boolean | number | string>;
    }
    | undefined;
    body: string;
    isBase64Encoded?: boolean | undefined;
}

export interface APIGatewayProxyEventBase<TAuthorizerContext> {
    body: string | null;
    headers: APIGatewayProxyEventHeaders;
    multiValueHeaders: APIGatewayProxyEventMultiValueHeaders;
    httpMethod: string;
    isBase64Encoded: boolean;
    path: string;
    pathParameters: APIGatewayProxyEventPathParameters | null;
    queryStringParameters: APIGatewayProxyEventQueryStringParameters | null;
    multiValueQueryStringParameters: APIGatewayProxyEventMultiValueQueryStringParameters | null;
    stageVariables: APIGatewayProxyEventStageVariables | null;
    requestContext: APIGatewayEventRequestContextWithAuthorizer<TAuthorizerContext>;
    resource: string;
}

export interface APIGatewayEventRequestContextWithAuthorizer<TAuthorizerContext> {
    accountId: string;
    apiId: string;
    authorizer: TAuthorizerContext;
    connectedAt?: number | undefined;
    connectionId?: string | undefined;
    domainName?: string | undefined;
    domainPrefix?: string | undefined;
    eventType?: string | undefined;
    extendedRequestId?: string | undefined;
    protocol: string;
    httpMethod: string;
    identity: APIGatewayEventIdentity;
    messageDirection?: string | undefined;
    messageId?: string | null | undefined;
    path: string;
    stage: string;
    requestId: string;
    requestTime?: string | undefined;
    requestTimeEpoch: number;
    resourceId: string;
    resourcePath: string;
    routeKey?: string | undefined;
}

export interface APIGatewayEventIdentity {
    accessKey: string | null;
    accountId: string | null;
    apiKey: string | null;
    apiKeyId: string | null;
    caller: string | null;
    clientCert: APIGatewayEventClientCertificate | null;
    cognitoAuthenticationProvider: string | null;
    cognitoAuthenticationType: string | null;
    cognitoIdentityId: string | null;
    cognitoIdentityPoolId: string | null;
    principalOrgId: string | null;
    sourceIp: string;
    user: string | null;
    userAgent: string | null;
    userArn: string | null;
}

export interface APIGatewayEventClientCertificate {
    clientCertPem: string;
    serialNumber: string;
    subjectDN: string;
    issuerDN: string;
    validity: {
        notAfter: string;
        notBefore: string;
    };
}

export interface APIGatewayProxyEventHeaders {
    [name: string]: string | undefined;
}

export interface APIGatewayProxyEventMultiValueHeaders {
    [name: string]: string[] | undefined;
}

export interface APIGatewayProxyEventPathParameters {
    [name: string]: string | undefined;
}

export interface APIGatewayProxyEventQueryStringParameters {
    [name: string]: string | undefined;
}

export interface APIGatewayProxyEventMultiValueQueryStringParameters {
    [name: string]: string[] | undefined;
}

export interface APIGatewayProxyEventStageVariables {
    [name: string]: string | undefined;
}