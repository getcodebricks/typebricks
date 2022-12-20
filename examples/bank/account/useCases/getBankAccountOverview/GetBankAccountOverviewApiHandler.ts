import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetBankAccountOverviewQuery, GetBankAccountOverviewQueryDto } from "./GetBankAccountOverviewQuery";
import { BankAccountOverviewRepository } from "../../shared/readModels/BankAccountOverviewRepository";
import { GetBankAccountOverviewQueryHandler } from './GetBankAccountOverviewQueryHandler';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    var body: GetBankAccountOverviewQueryDto = JSON.parse(event.body ? event.body : '{}') as GetBankAccountOverviewQueryDto;

    const query: GetBankAccountOverviewQuery = GetBankAccountOverviewQuery.fromDto(body);
    const queryHandler: GetBankAccountOverviewQueryHandler = new GetBankAccountOverviewQueryHandler(new BankAccountOverviewRepository());
    const response = await queryHandler.handle(query);

    return { statusCode: 200, body: JSON.stringify({ data: response }) };
}