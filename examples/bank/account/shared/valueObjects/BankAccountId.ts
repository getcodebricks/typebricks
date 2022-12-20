import { ValidationError } from "../../../../../src/domain/ValidationError";
import { ValueObject, ValueObjectProps } from "../../../../../src/domain/ValueObject";
import { validate as uuidValidate } from 'uuid';

export interface BankAccountIdProps extends ValueObjectProps {
    value: string,
}

export class BankAccountId extends ValueObject<BankAccountIdProps> {
    get value (): string {
        return this.props.value;
    }

    constructor (props: BankAccountIdProps) {
        super(props);
        this.validate(props);
    }

    private validate(props: BankAccountIdProps): void {
        if (!uuidValidate(props.value)) {
            throw new ValidationError('BankAccountId is not a valid uuid');
        }
    }
}