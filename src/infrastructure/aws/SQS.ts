export interface SQSRecord {
    messageId: string;
    receiptHandle: string;
    body: string;
    attributes: SQSRecordAttributes;
    messageAttributes: SQSMessageAttributes;
    md5OfBody: string;
    eventSource: string;
    eventSourceARN: string;
    awsRegion: string;
}

export interface SQSEvent {
    Records: SQSRecord[];
    isWarmer?: boolean;
}

export interface SQSRecordAttributes {
    AWSTraceHeader?: string | undefined;
    ApproximateReceiveCount: string;
    SentTimestamp: string;
    SenderId: string;
    ApproximateFirstReceiveTimestamp: string;
    SequenceNumber?: string | undefined;
    MessageGroupId?: string | undefined;
    MessageDeduplicationId?: string | undefined;
    DeadLetterQueueSourceArn?: string | undefined;
}

export type SQSMessageAttributeDataType = "String" | "Number" | "Binary" | string;

export interface SQSMessageAttribute {
    stringValue?: string | undefined;
    binaryValue?: string | undefined;
    stringListValues?: string[] | undefined;
    binaryListValues?: string[] | undefined;    dataType: SQSMessageAttributeDataType;
}

export interface SQSMessageAttributes {
    [name: string]: SQSMessageAttribute;
}

export interface SQSBatchResponse {
    batchItemFailures: SQSBatchItemFailure[];
}

export interface SQSBatchItemFailure {
    itemIdentifier: string;
}
