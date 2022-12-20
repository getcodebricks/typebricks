import { ValidationError } from "../../../../../src/domain/ValidationError";
import { ValueObject, ValueObjectProps } from "../../../../../src/domain/ValueObject";

export enum StatusValues {
    NOT_ACTIVATED = 'NOT_ACTIVATED',
    ACTIVATION_EMAIL_SENT = 'ACTIVATION_EMAIL_SENT',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface StatusProps extends ValueObjectProps {
    value: StatusValues,
}

export class Status extends ValueObject<StatusProps> {
    get value (): StatusValues {
        return this.props.value;
    }

    constructor (props: StatusProps) {
        super(props);
        this.validate(props);
    }

    static fromObject(o: any): Status {
        return new this({
            value: o.value
        });
    }

    private validate(props: StatusProps): void {
        if (!Object.values(StatusValues).includes(props.value as unknown as StatusValues)) {
            throw new ValidationError(`Status must be one this values: ${Object.keys(StatusValues)}`);
        }
    }
}