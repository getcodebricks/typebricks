import { ValueTransformer } from "typeorm";
import { parseToDateTime } from "../../../utils/parseToDateTime";

export class JsonColumnTransformer implements ValueTransformer {
    from(value: string) {
        return JSON.parse(value, parseToDateTime);
    }
    to(value: any) {
        return JSON.stringify(value);
    }
}