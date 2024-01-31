
import { ValidationError } from "../../../../../src/domain/ValidationError";
import { ValueObject } from "../../../../../src/domain/ValueObject";
import { OverwriteProtectionBody } from "../../../../../src/OverwriteProtectionDecorator"
import { shallowEqualObject } from "../../../../../src/utils/shallowEqualObject"
import { isType } from "is-what";

export enum StatusValues {
    NOT_ACTIVATED = 'NOT_ACTIVATED',
    ACTIVATION_EMAIL_SENT = 'ACTIVATION_EMAIL_SENT',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export class StatusValueObject implements ValueObject {
    constructor(readonly _value: string) {
        this.validate(_value);
    }

    @OverwriteProtectionBody(false)
    validate(value: string): void {
        if (!isType(value, String) || !value.length) {
            throw new ValidationError(`StatusValueObject: ${value} is invalid`);
        }
        if (!Object.values(StatusValues).includes(value as StatusValues)) {
            throw new ValidationError(`Status must be one this values: ${Object.keys(StatusValues)}`);
        }
    }

    @OverwriteProtectionBody(false)
    equals(other: ValueObject): boolean {
        return other && isType(other, StatusValueObject) && shallowEqualObject(this, other);
    }

    get value(): string {
        return this._value;
    }
}
