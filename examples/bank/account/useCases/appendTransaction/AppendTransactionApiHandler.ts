import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AppendTransactionCommand, AppendTransactionCommandDto } from "./AppendTransactionCommand";
import { AppendTransactionCommandHandler } from "./AppendTransactionCommandHandler";
import { BankAccountRepository } from "../../shared/BankAccountRepository";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    var body: AppendTransactionCommandDto = JSON.parse(event.body ? event.body : '{}') as AppendTransactionCommandDto;

    const command: AppendTransactionCommand = AppendTransactionCommand.fromDto(body);
    const commandHandler: AppendTransactionCommandHandler = new AppendTransactionCommandHandler(new BankAccountRepository());
    const aggregate = await commandHandler.handle(command);
    const response = {
        id: aggregate?.id,
    };

    return { statusCode: 200, body: JSON.stringify({ data: response }) };
}