import { EventStore } from "./EventStore";
import { Aggregate, AggregateState } from "./Aggregate";
import { Event } from "./Event";
import { Pool } from 'pg';


import * as AWS from 'aws-sdk'
import { SNS, AWSError } from 'aws-sdk';
AWS.config.update({region: process.env.AWS_REGION});

export interface IRepository<T extends Aggregate> {
    new (id: string): T;
  }

class Repository<T extends Aggregate> {

    constructor(
        private readonly eventStore: EventStore,
        private Type: new (id: string) => T,
        private readonly pool: Pool
    ) {}

    async setup(name: string): Promise<void> {
        const client = await this.pool.connect();
        const query = `CREATE TABLE IF NOT EXISTS ${name}_stream (
            aggregate_id uuid NOT NULL,
            aggregate_version integer NOT NULL,
            topic text,
            payload text,
            PRIMARY KEY (aggregate_id, aggregate_version, topic))`;

        console.info('query');
        console.info(query);

        try {
            const res = await client.query(query);
        } finally {
            client.release();
        }
    }

    async get(id: string): Promise<T> {
        const client = await this.pool.connect();
        const query = `SELECT * FROM event_stream WHERE aggregate_id='${id}'`;
        var rows: any[] = [];

        try {
            const result = await client.query(query);
            if (result) {
                rows = result.rows;
            }
        } finally {
            client.release();   
        }

        var events = [];
        for (var i = 0; i < rows.length; i++) {
            const row = rows[i];
            events.push(row);
        }

        const aggregate: T = new this.Type(id) as T;
        aggregate.loadFromHistory(events);

        return aggregate;
    }

    async save(aggregate: Aggregate): Promise<void> {
        await this.setup('event');
        
        for (var i = 0; i < aggregate.changes.length; i++) {
            const event: Event = aggregate.changes[i];
            const query = `INSERT INTO event_stream VALUES ('${event.aggregateId}', ${event.aggregateVersion}, '${event.name}', '${JSON.stringify(event.payload)}')`;
            console.info('query');
            console.info(query);
            const client = await this.pool.connect();
            try {
                const res = await client.query(query);
                console.info('res save');
                console.info(res);
            } finally {
                client.release();   
            }

            const eventMessage = {
                aggregateId: event.aggregateId,
                aggregateVersion: event.aggregateVersion,
                name: event.name,
                payload: event.payload
            };
            await this.publish(JSON.stringify(eventMessage), event.name);
        }
    }

    async publish(message: string, eventName: string): Promise<void> {
        console.log('publish');
        var params = {
            Message: message,
            TopicArn: process.env.SQS_TOPIC,
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: `${eventName}`
                }
            }
        };

        console.log(params);

        const sns = new AWS.SNS({apiVersion: '2010-03-31'});

        const result = await sns.publish(params).promise();
        console.log('result');
        console.log(result);
        //   var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
          
        //   publishTextPromise.then(
        //     function(data) {
        //       console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
        //       console.log("MessageID is " + data.MessageId);
        //     }).catch(
        //       function(err) {
        //       console.error(err, err.stack);
        //     });
    }
}

export { Repository };
