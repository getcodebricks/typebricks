import { Pool } from 'pg';
import { ReadModel } from './ReadModel';

class Projector {
    readonly pool: Pool;
    readonly readModel: ReadModel;
    // public readonly fields: any[];

    // constructor(pool: Pool, name: string, fields: any[]) {
        constructor(pool: Pool, readModel: ReadModel) {
        this.pool = pool;
        this.readModel = readModel;
        // this.fields = fields;
    }

    async setup(): Promise<void> {
        const client = await this.pool.connect();
        const query = `CREATE TABLE IF NOT EXISTS ${this.readModel.nameDatabase} (
            aggregate_id uuid NOT NULL,
            ${this.readModel.fields.map((field) => `${field.nameDatabase} ${field.typeDatabase}`).join(", ")},
            PRIMARY KEY (aggregate_id))`;
        console.info('query');
        console.info(query);
        try {
            await client.query(query);
        } finally {
            client.release();   
        }
    }

    // snakeCaseToCamelCase(input: string): string {
    //     return input
    //     .split("_")
    //     .reduce(
    //         (res: string, word: string, i: number) =>
    //         i === 0 ? word.toLowerCase() : `${res}${word.charAt(0).toUpperCase()}${word.substr(1).toLowerCase()}`,""
    //     );
    // }

    async get(aggregateId: string): Promise<any | null> {
        const client = await this.pool.connect();
        console.info('get');
        // console.info(this.readModel.fields.map((field) => `${field.nameDatabase} AS ${this.snakeCaseToCamelCase(field.name)}`).join(", "));
        const select: string = this.readModel.fields.map((field) => `${field.nameDatabase} AS "${field.nameState}"`).join(", ");
        const query = `SELECT aggregate_id as "aggregateId", ${select} FROM ${this.readModel.nameDatabase} WHERE aggregate_id='${aggregateId}'`;
        console.info(query);
        var state: any | null = null;
        try {
            const { rows } = await client.query(query);
            if (rows.length) {
                console.info('rows');
                console.info(rows);
                state = rows[0];
            }
        } finally {
            client.release();   
        }

        return state;
    }

    async save(currentState: any | null, newState: any, aggregateId: string, version: number): Promise<void> {
        console.info('save');
        console.info(JSON.stringify(currentState));
        console.info(JSON.stringify(newState));

        const quoteTypes = ['text', 'uuid'];

        const client = await this.pool.connect();
    
        const valuesInsert: string = this.readModel.fields.map((field) => {
            const value = newState[field.nameState];
            return quoteTypes.includes(field.typeDatabase) ? `'${value}'` : `${value}`;
        }).join(", ");
        const queryInsert = `INSERT INTO ${this.readModel.nameDatabase} VALUES ('${aggregateId}', ${valuesInsert})`;
    
        const valuesUpdate: string = this.readModel.fields.map((field) => {
            const value = newState[field.nameState];
            const valueQ = quoteTypes.includes(field.typeDatabase) ? `'${value}'` : `${value}`;
            return `${field.nameDatabase}=${valueQ}`;
        }).join(", ");        
        const queryUpdate = `UPDATE ${this.readModel.nameDatabase} SET ${valuesUpdate} WHERE aggregate_id='${aggregateId}'`;
    
        const query2 = currentState ? queryUpdate : queryInsert;
        console.info('query');
        console.info(query2);
        const query = `SELECT * FROM ${this.readModel.nameDatabase}`;
        try {
            await client.query(query2);
        } finally {
            client.release();   
        }
    }
}

export { Projector };
