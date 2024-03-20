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

export interface APIGatewayTokenAuthorizerEvent {
    type: "TOKEN";
    methodArn: string;
    authorizationToken: string;
}

export interface APIGatewayAuthorizerResult {
    principalId: string;
    policyDocument: PolicyDocument;
    context?: APIGatewayAuthorizerResultContext | null | undefined;
    usageIdentifierKey?: string | null | undefined;
}

export interface APIGatewayAuthorizerResultContext {
    [name: string]: string | number | boolean | null | undefined;
}


export interface PolicyDocument {
    Version: string;
    Id?: string | undefined;
    Statement: Statement[];
}

export type Statement = BaseStatement & StatementAction & (StatementResource | StatementPrincipal);

export interface BaseStatement {
    Effect: string;
    Sid?: string | undefined;
    Condition?: ConditionBlock | undefined;
}

export interface ConditionBlock {
    [condition: string]: Condition | Condition[];
}

export interface Condition {
    [key: string]: string | string[];
}

export type StatementAction = { Action: string | string[] } | { NotAction: string | string[] };

export type StatementResource =
    & MaybeStatementPrincipal
    & ({ Resource: string | string[] } | { NotResource: string | string[] });

export type StatementPrincipal =
    & MaybeStatementResource
    & ({ Principal: PrincipalValue } | { NotPrincipal: PrincipalValue });

export interface MaybeStatementPrincipal {
    Principal?: PrincipalValue | undefined;
    NotPrincipal?: PrincipalValue | undefined;
}

export interface MaybeStatementResource {
    Resource?: string | string[] | undefined;
    NotResource?: string | string[] | undefined;
}

export type PrincipalValue = { [key: string]: string | string[] } | string | string[];