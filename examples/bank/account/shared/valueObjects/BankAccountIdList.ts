import { ValidationError } from "../../../../../src/domain/ValidationError";
import { ValueObject, ValueObjectProps } from "../../../../../src/domain/ValueObject";
import { validate as uuidValidate } from 'uuid';
import { isArray } from "is-what";

export interface BankAccountIdListProps extends ValueObjectProps {
    value: string[],
}

export class BankAccountIdList extends ValueObject<BankAccountIdListProps> {
    get value (): string[] {
        return this.props.value;
    }

    constructor (props: BankAccountIdListProps) {
        super(props);
        this.validate(props);
    }

    private validate(props: BankAccountIdListProps): void {

        if (!isArray(props.value)) {
            throw new ValidationError(`BoundedContextUserList: ${props.value} is invalid`);
        }

        props.value.map((element: string) => {
            if (!uuidValidate(element)){
                throw new ValidationError(`BoundedContextUserList: ${element} is invalid`);
            }
        })
    }
}