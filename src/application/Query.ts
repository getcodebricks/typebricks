export interface QueryProps {
    [index: string]: any;
}

/**
 * Abstract class for Queries.
 * 
 * Demos: 
 * 
 * - [Query](https://getcodebricks.com/docs/fundamentals/query-api)
 * 
 */
export abstract class Query<T extends QueryProps> {
    public readonly props: T;

    constructor (props: T) {
        this.props = Object.freeze(props);
    }
}