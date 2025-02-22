import { parseToDateTime } from "../../utils/parseToDateTime";
import { ApiResponse } from "../api/ApiResponse";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "./ApiGateway";

export function requestFromAPIGatewayEvent(event: APIGatewayProxyEvent): any {
    return JSON.parse(event.body ? event.body : '{}', parseToDateTime);
}

export function responseToAPIGateWayResult(response: ApiResponse<any>): APIGatewayProxyResult {
    return {
        statusCode: response.statusCode,
        body: JSON.stringify(response.body),
        headers: response.headers
    }
}

export function errorToAPIGatewayResult(error: any): APIGatewayProxyResult {
    if (error instanceof SyntaxError && error.message.match(/Unexpected.token.*JSON.*/i)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "bad request: invalid json"}),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            }
        };
    } else {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error"}),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            }
        };
    }
}