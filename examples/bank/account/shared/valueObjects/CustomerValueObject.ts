import { ValidationError } from "../../../../../src/domain/ValidationError";
import { ValueObject } from "../../../../../src/domain/ValueObject";
import { OverwriteProtectionBody } from "../../../../../src/OverwriteProtectionDecorator"
import { shallowEqualObject } from "../../../../../src/utils/shallowEqualObject"
import { isType } from "is-what";
import { EmailValueObject } from "./EmailValueObject";
import { FirstNameValueObject } from "./FirstNameValueObject";
import { CustomerObject } from "../objects/CustomerObject";

export class CustomerValueObject implements ValueObject {
    constructor(readonly _email: EmailValueObject, readonly _firstName: FirstNameValueObject) {
        this.validate(_email, _firstName);
    }

    @OverwriteProtectionBody(false)
    validate(email: EmailValueObject, firstName: FirstNameValueObject): void {
        if (!isType(email, EmailValueObject)) {
            throw new ValidationError(`CustomerValueObject.email: ${email} is invalid`);
        }
        if (!isType(firstName, FirstNameValueObject)) {
            throw new ValidationError(`CustomerValueObject.firstName: ${firstName} is invalid`);
        }
    }

    @OverwriteProtectionBody(false)
    equals(other: ValueObject): boolean {
        return other && isType(other, CustomerValueObject) && shallowEqualObject(this, other);
    }

    static fromObject(object: CustomerObject): CustomerValueObject {
        return new this(
            new EmailValueObject(object.email),
            new FirstNameValueObject(object.firstName),
        );
    }

    toObject(): CustomerObject {
        return{
            email: this.email.value,
            firstName: this.firstName.value,
        };
    }

    get email(): EmailValueObject {
        return this._email;
    }

    get firstName(): FirstNameValueObject {
        return this._firstName;
    }
}
