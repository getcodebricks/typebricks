import { EventDto } from "../../../../../src/domain/Event";
import { SQSEvent, SQSRecord } from 'aws-lambda/trigger/sqs';
import { BankAccountOverviewRepository } from "../../shared/readModels/BankAccountOverviewRepository";
import { BankAccountOverviewProjector } from "./BankAccountOverviewProjector";

export async function  handler(event: SQSEvent) {
    const bankAccountOverviewProjector: BankAccountOverviewProjector = new BankAccountOverviewProjector(new BankAccountOverviewRepository);

    await Promise.all(event.Records.map(async (record: SQSRecord) => {
        const body = JSON.parse(record.body) as EventDto;
        await bankAccountOverviewProjector.project(
            body.aggregateId,
            body.name,
            body.payload,
            body.aggregateVersion
        );
    }));
}