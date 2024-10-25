export interface QueryProps {
    [index: string]: any;
}

/**
 * Abstract class for Queries.
 * 
 * Demos: 
 * 
 * - [Query](https://codebricks.tech/docs/code/fundamentals/query-api/query)
 * 
 */
export abstract class Query<T extends QueryProps> {
    public readonly props: T;

    constructor (props: T) {
        this.props = Object.freeze(props);
    }
}