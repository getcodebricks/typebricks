import { EventStore } from "./EventStore";
import { Aggregate, AggregateState } from "./Aggregate";
import { Event } from "./Event";
import { Pool, Client } from 'pg';

export interface IRepository<T extends Aggregate> {
    new (id: string): T;
  }

class Repository<T extends Aggregate> {
    // readonly eventStore: EventStore;
    readonly pool: Pool = new Pool({connectionString: process.env.PG_CONNECTION_STRING});;

    constructor(
        private readonly eventStore: EventStore,
        private Type: new (id: string) => T
      ) {}

    // constructor(eventStore: EventStore) {
    //     this.eventStore = eventStore;
    //     this.pool = new Pool({connectionString: process.env.PG_CONNECTION_STRING});
    // }

    async setup(): Promise<void> {
        const client = await this.pool.connect();
        const query = `CREATE TABLE IF NOT EXISTS event_stream (
            aggregate_id uuid NOT NULL,
            aggregate_version integer NOT NULL,
            topic text,
            payload text,
            PRIMARY KEY (aggregate_id, aggregate_version, topic))`;
        await client.query(query);
    }

    async get(id: string): Promise<T> {
        const client = await this.pool.connect();
        const query = `SELECT * FROM event_stream WHERE aggregate_id='${id}'`;
        const { rows } = await client.query(query);
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
        const client = await this.pool.connect();

        for (var i = 0; i < aggregate.changes.length; i++) {
            const event: Event = aggregate.changes[i];
            const query = `INSERT INTO event_stream VALUES ('${event.aggregateId}', ${event.aggregateVersion}, '${event.name}', '${JSON.stringify(event.payload)}')`;
            const res = await client.query(query);
            console.log(res);
        }
    }
}

export { Repository };
