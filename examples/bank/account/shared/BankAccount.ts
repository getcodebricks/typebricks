import { Aggregate, AggregateState } from "../../../../src/domain/Aggregate";
import { DomainError } from "../../../../src/domain/DomainError";
import { Balance } from "./valueObjects/Balance";
import { Customer } from "./valueObjects/Customer";
import { Amount } from "./valueObjects/Amount";
import { BankAccountOpened } from "./events/BankAccountOpened";
import { BankAccountTransactionAppended } from "./events/BankAccountTransactionAppended";
import { ActivationEmailSent } from "./events/ActivationEmailSent";
import { Firstname } from "./valueObjects/Firstname";
import { Email } from "./valueObjects/Email";
import { Status, StatusValues } from "./valueObjects/Status";

export interface BankAccountState extends AggregateState {
    customer: Customer,
    balance: Balance
}

export class BankAccount extends Aggregate<AggregateState> {
    constructor (id: string) {
        super(
            id,
            0,
            {}
        );
    }

    public open(customer: Customer): void {
        this.addEvent(
            new BankAccountOpened(
                this.id,
                this.version+1,
                {
                    customer: {
                        email: customer.email.value,
                        firstname: customer.firstname.value
                    },
                    balance: 0.0,
                    status: StatusValues.NOT_ACTIVATED.toString()
                }
            )
        );
    }

    public appendTransaction(amount: Amount): void {
        const newBalance = new Balance({
            value: this.state.balance.value + amount.value
        });
        this.addEvent(
            new BankAccountTransactionAppended(
                this.id,
                this.version+1,
                {
                    newBalance: newBalance.value
                }
            )
        );
    }

    public sendActivationEmail(): void {
        if (this.state.status.value == StatusValues.ACTIVE) {
            throw new DomainError("Account is already active");
        }

        this.addEvent(
            new ActivationEmailSent(
                this.id,
                this.version+1,
                {
                    status: StatusValues.ACTIVATION_EMAIL_SENT.toString()
                }
            )
        );
    }

    apply(event: BankAccountOpened | BankAccountTransactionAppended | ActivationEmailSent): BankAccountState | void {
        switch (event.name) {
            case BankAccountOpened.name:
                return this.applyBankAccountOpened(event as BankAccountOpened);

            case BankAccountTransactionAppended.name:
                return this.applyBankAccountTransactionAppended(event as BankAccountTransactionAppended)

            case ActivationEmailSent.name:
                return this.applyActivationEmailSent(event as ActivationEmailSent)
        }
    }

    applyBankAccountOpened(event: BankAccountOpened): BankAccountState {
        const newState: BankAccountState = {
            customer: new Customer({
                firstname: new Firstname({
                    value: event.payload.customer.firstname
                }),
                email: new Email({
                    value: event.payload.customer.email
                })
            }),
            balance: new Balance({
                value: event.payload.balance
            }),
            status: new Status({
                value: StatusValues[event.payload.status as keyof typeof StatusValues]
            })
        };
        return newState;
    }

    applyBankAccountTransactionAppended(event: BankAccountTransactionAppended): BankAccountState {
        const newState: BankAccountState = {
            customer: this.state.customer,
            balance: new Balance({
                value: event.payload.newBalance
            })
        };
        return newState;
    }

    applyActivationEmailSent(event: ActivationEmailSent): BankAccountState {
        const newState: BankAccountState = {
            customer: this.state.customer,
            balance: this.state.balance,
            status: new Status({
                value: StatusValues[event.payload.status as keyof typeof StatusValues]
            })
        };
        return newState;
    }
}