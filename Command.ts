import Ajv from "ajv";
import { Aggregate } from "./Aggregate";

class Command {
    // readonly id: string;
    // readonly aggregateId: string | null;
    readonly payload: any;
    readonly schema: any = {};
    // readonly payload: any;
    // readonly expectedAggregateVersion: number;

    // constructor(id: string, aggregateId: string | null) { //, expectedAggregateVersion: number
    //     this.id = id;
    //     this.aggregateId = aggregateId;
    //     // this.expectedAggregateVersion = expectedAggregateVersion;
    // }

    constructor(payload: any) {
        // super('id', 'aggregateId');
        this.payload = payload;
    }

    validate(): any | null {
        console.log('validate');
        console.log(this.schema);
        const ajv = new Ajv();
        const validate = ajv.compile(this.schema);
        const valid = validate(this.payload);
        if (!valid) {
            console.log(validate.errors);
            return validate.errors;
        }

        return null;
    }
}

export { Command };
