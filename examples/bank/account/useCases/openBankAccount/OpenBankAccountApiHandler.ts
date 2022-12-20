import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { OpenBankAccountCommand, OpenBankAccountCommandDto } from "./OpenBankAccountCommand";
import { OpenBankAccountCommandHandler } from "./OpenBankAccountCommandHandler";
import { BankAccountRepository } from "../../shared/BankAccountRepository";

import { ValidationError } from "../../../../../src/domain/ValidationError";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        var body: OpenBankAccountCommandDto = JSON.parse(event.body ? event.body : '{}') as OpenBankAccountCommandDto;

        const command: OpenBankAccountCommand = OpenBankAccountCommand.fromDto(body);
        const commandHandler: OpenBankAccountCommandHandler = new OpenBankAccountCommandHandler(new BankAccountRepository());
        const aggregate = await commandHandler.handle(command);
        const response = {
            id: aggregate?.id,
        };

        return { statusCode: 200, body: JSON.stringify({ data: response }) };
    } catch (error) {
        // console.log(error);
        if (error instanceof ValidationError) {
            return { statusCode: 400, body: JSON.stringify({ message: error.message }) };    
        } else if (error instanceof SyntaxError && error.message.match(/Unexpected.token.*JSON.*/i)) {
            return { statusCode: 400, body: JSON.stringify({ message: error.message }) };    
        }

        return { statusCode: 500, body: JSON.stringify({ data: {} }) };
    }
}