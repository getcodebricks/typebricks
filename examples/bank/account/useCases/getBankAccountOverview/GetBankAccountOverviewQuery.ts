import { Query, QueryProps } from "../../../../../src/application/Query";

export interface GetBankAccountOverviewQueryDto {
    bankAccountId: string,
}

export interface GetBankAccountOverviewQueryProps extends QueryProps {
    bankAccountId: string,
}

export class GetBankAccountOverviewQuery extends Query<GetBankAccountOverviewQueryProps> {
    get bankAccountId (): string {
        return this.props.bankAccountId;
    }

    constructor (props: GetBankAccountOverviewQueryProps) {
        super(props);
    }

    static fromDto(dto: GetBankAccountOverviewQueryDto): GetBankAccountOverviewQuery {
        return new this({
            bankAccountId: dto.bankAccountId
        });
    }
}