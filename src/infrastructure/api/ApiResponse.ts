export const defaultCORSHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
}

export interface ApiResponse<T> {
    statusCode: number;
    body: {
        data?: T;
        error?: any;
    };
    headers: any;
}