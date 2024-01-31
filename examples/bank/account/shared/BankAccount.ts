import { Aggregate, AggregateState } from "../../../../src/domain/Aggregate";
import { DomainError } from "../../../../src/domain/DomainError";
import { BalanceValueObject } from "./valueObjects/BalanceValueObject";
import { CustomerValueObject } from "./valueObjects/CustomerValueObject";
import { AmountValueObject } from "./valueObjects/AmountValueObject";
import { BankAccountOpened } from "./events/BankAccountOpened";
import { BankAccountTransactionAppended } from "./events/BankAccountTransactionAppended";
import { ActivationEmailSent } from "./events/ActivationEmailSent";
import { StatusValues } from "./valueObjects/StatusValueObject";
import { CustomerObject } from "./objects/CustomerObject";

export interface BankAccountState extends AggregateState {
    customer: CustomerObject,
    balance: number,
    status: string,
}

export class BankAccount extends Aggregate<AggregateState> {
    constructor (id: string) {
        super(
            id,
            0,
            {}
        );
    }

    public open(customer: CustomerValueObject): void {
        this.addEvent(
            new BankAccountOpened(
                this.id,
                this.version+1,
                {
                    customer: {
                        email: customer.email.value,
                        firstName: customer.firstName.value
                    },
                    balance: 0.0,
                    status: StatusValues.NOT_ACTIVATED.toString()
                }
            )
        );
    }

    public appendTransaction(amount: AmountValueObject): void {
        const newBalance = new BalanceValueObject(
            this.state.balance.value + amount.value
        );
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
            customer: event.payload.customer,
            balance: event.payload.balance,
            status: event.payload.status
        };
        return newState;
    }

    applyBankAccountTransactionAppended(event: BankAccountTransactionAppended): BankAccountState {
        const newState: BankAccountState = {
            customer: this.state.customer,
            balance: event.payload.newBalance,
            status: this.state.status,
        };
        return newState;
    }

    applyActivationEmailSent(event: ActivationEmailSent): BankAccountState {
        const newState: BankAccountState = {
            customer: this.state.customer,
            balance: this.state.balance,
            status: event.payload.status,
        };
        return newState;
    }
}