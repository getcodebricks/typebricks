import { ValidationError } from "../../../../../src/domain/ValidationError";
import { ValueObject, ValueObjectProps } from "../../../../../src/domain/ValueObject";

export interface FirstnameProps extends ValueObjectProps {
    value: string,
}

export class Firstname extends ValueObject<FirstnameProps> {
    get value (): string {
        return this.props.value;
    }

    constructor (props: FirstnameProps) {
        super(props);
        this.validate(props);
    }

    static fromObject(o: any): Firstname {
        return new this({
            value: o.value
        });
    }

    private validate(props: FirstnameProps): void {
        if (!((typeof props.value) == 'string')) {
            throw new ValidationError('Firstname must be a string');
        }
    }
}