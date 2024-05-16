import { SQSClient, SendMessageCommand, SendMessageCommandInput } from "@aws-sdk/client-sqs";

export class PublisherTrigger {
    constructor(readonly queueUrl: string, readonly sqsClient: SQSClient = new SQSClient()) {
    }

    async trigger(): Promise<void> {
        const params: SendMessageCommandInput = {
            MessageBody: '{}',
            QueueUrl: this.queueUrl
        };
        await this.sqsClient.send(new SendMessageCommand(params));
    }
}
