import { ValidationError } from "../../../../../src/domain/ValidationError";
import { ValueObject, ValueObjectProps } from "../../../../../src/domain/ValueObject";

export interface BalanceProps extends ValueObjectProps {
    value: number,
}

export class Balance extends ValueObject<BalanceProps> {
    get value (): number {
        return this.props.value;
    }

    constructor (props: BalanceProps) {
        super(props);
        this.validate(props);
    }

    static fromObject(o: any): Balance {
        return new this({
            value: o.value
        });
    }

    private validate(props: BalanceProps): void {
        if (props.value < 0) {
            throw new ValidationError('Balance can not be negative');
        }
    }
}