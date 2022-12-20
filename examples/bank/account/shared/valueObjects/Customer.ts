import { ValidationError } from "../../../../../src/domain/ValidationError";
import { ValueObject, ValueObjectProps } from "../../../../../src/domain/ValueObject";

import { Email } from "./Email";
import { Firstname } from "./Firstname";


export interface CustomerProps extends ValueObjectProps {
    email: Email,
    firstname: Firstname
}

export class Customer extends ValueObject<CustomerProps> {
    get email (): Email {
        return this.props.email;
    }

    get firstname (): Firstname {
        return this.props.firstname;
    }

    constructor (props: CustomerProps) {
        super(props);
        this.validate(props);
    }

    static fromObject(o: any): Customer {
        return new this({
            email: Email.fromObject(o.email),
            firstname: Firstname.fromObject(o.firstname)
        });
    }

    private validate(props: CustomerProps): void {
        if (!(props.email instanceof Email)) {
            throw new ValidationError('Customer requires an email');
        }
        if (!(props.firstname instanceof Firstname)) {
            throw new ValidationError('Customer requires a firstname');
        }
    }
}