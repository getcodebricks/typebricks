import { ValidationError } from "../../../../../src/domain/ValidationError";
import { ValueObject } from "../../../../../src/domain/ValueObject";
import { OverwriteProtectionBody } from "../../../../../src/utils/OverwriteProtectionDecorator"
import { shallowEqualObject } from "../../../../../src/utils/shallowEqualObject"
import { isType } from "is-what";

export class AmountValueObject implements ValueObject {
    constructor(readonly _value: number) {
        this.validate(_value);
    }

    @OverwriteProtectionBody(false)
    validate(value: number): void {
        if (!isType(value, Number)) {
            throw new ValidationError(`AmountValueObject: ${value} is invalid`);
        }
    }

    @OverwriteProtectionBody(false)
    equals(other: ValueObject): boolean {
        return other && isType(other, AmountValueObject) && shallowEqualObject(this, other);
    }

    get value(): number {
        return this._value;
    }
}
