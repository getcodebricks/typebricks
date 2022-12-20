import { ValidationError } from "../../../../../src/domain/ValidationError";
import { ValueObject, ValueObjectProps } from "../../../../../src/domain/ValueObject";

export interface EmailProps extends ValueObjectProps {
    value: string,
}

export class Email extends ValueObject<EmailProps> {
    get value (): string {
        return this.props.value;
    }

    constructor (props: EmailProps) {
        super(props);
        this.validate(props);
    }

    static fromObject(o: any): Email {
        return new this({
            value: o.value
        });
    }

    private validate(props: EmailProps): void {
        if (
            !props.value.toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
        ) {
            throw new ValidationError('Email is invalid');
        }
    }
}