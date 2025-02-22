import { NotFoundError } from "../../application/errors/NotFoundError";
import { ConflictError } from "../../domain/errors/ConflictError";
import { PreconditionFailedError } from "../../domain/errors/PreconditionFailedError";
import { ValidationError } from "../../domain/errors/ValidationError";
import { ApiResponse, defaultCORSHeaders } from "./ApiResponse";

export function renderError(error: any, headers: any = null): ApiResponse<any> {
    if (error instanceof ValidationError) {
        return {
            statusCode: 400,
            body: { error: error.message },
            headers: headers ?? defaultCORSHeaders
        };
    } else if (error instanceof SyntaxError && error.message.match(/Unexpected.token.*JSON.*/i)) {
        return {
            statusCode: 400,
            body: { error: "bad request: invalid json" },
            headers: headers ?? defaultCORSHeaders
        };
    } else if (error instanceof NotFoundError) {
        return {
            statusCode: 404,
            body: { error: error.message },
            headers: headers ?? defaultCORSHeaders
        };
    } else if (error instanceof ConflictError) {
        return {
            statusCode: 409,
            body: { error: error.message },
            headers: headers ?? defaultCORSHeaders
        };
    } else if (error instanceof PreconditionFailedError) {
        return {
            statusCode: 412,
            body: { error: error.message },
            headers: headers ?? defaultCORSHeaders
        };
    }

    return {
        statusCode: 500,
        body: { error: "Internal Server Error" },
        headers: headers ?? defaultCORSHeaders
    };
}