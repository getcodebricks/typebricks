import { SQSClient, SendMessageCommand, SendMessageCommandInput } from "@aws-sdk/client-sqs";

/**
 * Send SQS Event to trigger publishing. 
 * 
 * * Demos: 
 * 
 * - [Publishing](https://getcodebricks.com/docs/publishing)
 * 
 */
export class PublisherTrigger {
    
    /**
     * Initialize Publisher Trigger
     * 
     * @param queueUrl - SQS url 
     * @param sqsClient - SQS Cleint
     */
    constructor(readonly queueUrl: string, readonly sqsClient: SQSClient = new SQSClient()) {
    }

    /**
     * Triggers SQS publisher message
     * @returns
     */
    async trigger(): Promise<void> {
        const params: SendMessageCommandInput = {
            MessageBody: '{}',
            QueueUrl: this.queueUrl
        };
        await this.sqsClient.send(new SendMessageCommand(params));
    }
}
