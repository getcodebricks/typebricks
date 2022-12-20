import { SQSEvent, SQSRecord } from 'aws-lambda/trigger/sqs';
import { SendActivationEmailCommand, SendActivationEmailCommandDto } from "./SendActivationEmailCommand";
import { SendActivationEmailCommandHandler } from "./SendActivationEmailCommandHandler";
import { BankAccountRepository } from "../../shared/BankAccountRepository";

export async function handler(event: SQSEvent) {
    await Promise.all(
        event.Records.map(async (record: SQSRecord) => {
            var body: SendActivationEmailCommandDto = JSON.parse(record.body) as SendActivationEmailCommandDto;
            const command: SendActivationEmailCommand = SendActivationEmailCommand.fromDto(body);
            const commandHandler: SendActivationEmailCommandHandler = new SendActivationEmailCommandHandler(new BankAccountRepository());
            await commandHandler.handle(command);      
        })
    );
}