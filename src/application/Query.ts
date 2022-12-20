export interface QueryProps {
    [index: string]: any;
}

export abstract class Query<T extends QueryProps> {
    public readonly props: T;

    constructor (props: T) {
        this.props = Object.freeze(props);
    }
}