import { ValidationError } from "../../../../../src/domain/ValidationError";
import { ValueObject, ValueObjectProps } from "../../../../../src/domain/ValueObject";

export interface AmountProps extends ValueObjectProps {
    value: number,
}

export class Amount extends ValueObject<AmountProps> {
    get value (): number {
        return this.props.value;
    }

    constructor (props: AmountProps) {
        super(props);
        this.validate(props);
    }

    private validate(props: AmountProps): void {
        if (props.value < 0) {
            throw new ValidationError('Amount can not be negative');
        }
    }
}