import { ValidationError } from "../../../../../src/domain/ValidationError";
import { ValueObject } from "../../../../../src/domain/ValueObject";
import { OverwriteProtectionBody } from "../../../../../src/utils/OverwriteProtectionDecorator"
import { shallowEqualObject } from "../../../../../src/utils/shallowEqualObject"
import { isType } from "is-what";

export class BankAccountIdValueObject implements ValueObject {
    constructor(readonly _value: string) {
        this.validate(_value);
    }

    @OverwriteProtectionBody(false)
    validate(value: string): void {
        if (!isType(value, String) || !value.length) {
            throw new ValidationError(`BankAccountIdValueObject: ${value} is invalid`);
        }
    }

    @OverwriteProtectionBody(false)
    equals(other: ValueObject): boolean {
        return other && isType(other, BankAccountIdValueObject) && shallowEqualObject(this, other);
    }

    get value(): string {
        return this._value;
    }
}
