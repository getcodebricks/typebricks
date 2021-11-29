import { ReadModel } from './ReadModel';
import { Pool } from 'pg';

interface QueryRequest {
    query: {}
}

interface QueryResponse {
    data: any
}

class Query {
    readonly pool: Pool;
    readonly request: QueryRequest;
    readonly readModel;
    readonly requestStateMapping: any;
    

    constructor(pool: Pool, request: QueryRequest, readModel: ReadModel, requestStateMapping: any) {
        this.pool = pool;
        this.request = request;
        this.readModel = readModel;
        this.requestStateMapping = requestStateMapping;
    }

    selectStatement(): string {
        const select: string = this.readModel.fields
            .map((field) => `${field.nameDatabase} AS "${field.nameState}"`)
            .join(", ");
        const where: string = Object.entries(this.request)
            .map((parameter) => `${this.requestStateMapping[parameter[0]]}='${parameter[1]}'`)
            .join(", ");

        const sqlStatement = `SELECT aggregate_id as "aggregateId", ${select} FROM ${this.readModel.nameDatabase} WHERE ${where}`;
        console.info(sqlStatement);

        return sqlStatement;
    }

    async getOne(): Promise<any | null> {
        const client = await this.pool.connect();

        const selectStatement = this.selectStatement();
        var state: any | null = null;
        try {
            const { rows } = await client.query(selectStatement);
            if (rows.length) {
                console.info('rows');
                console.info(rows);
                state = rows[0];
            }
        } finally {
            client.release();   
        }

        return { data: state };
    }

    async getList(): Promise<any | null> {
        const client = await this.pool.connect();

        const selectStatement = this.selectStatement();
        var state: any | null = null;
        try {
            const { rows } = await client.query(selectStatement);
            if (rows.length) {
                console.info('rows');
                console.info(rows);
                state = rows;
            }
        } finally {
            client.release();   
        }

        return { data: state };
    }

    async query(): Promise<any> {
        console.info('handle():');
        console.info(this.request);
        const result: any = await this.getOne();
        return result;
    }
}

export { Query, QueryRequest, QueryResponse };