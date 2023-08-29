
import { shallowEqual } from "shallow-equal-object";
import { shallowEqualArrays } from "shallow-equal";

export interface ValueObjectProps {
    [index: string]: any;
}

export abstract class ValueObject<T extends ValueObjectProps> {
    public readonly props: T;

    constructor (props: T) {
        this.props = Object.freeze(props);
    }

    toJSON() {
        return this.props;
    }

    public equals (vo?: ValueObject<T>): boolean {
        if (vo === null || vo === undefined) {
            return false;
        }
        if (vo.props === null || vo.props === undefined) {
            return false;
        }
        return shallowEqual(this.props, vo.props, {debug: undefined, customEqual: customEqual});
    }
}

function customEqual(x: any, y: any): boolean {
    if (Array.isArray(x) || Array.isArray(y)) {
        if (x.length !== y.length) {
            return false;
        }
        const e =  shallowEqualArrays(x, y);
        return shallowEqualArrays(x, y);
    } else if ((typeof x) === 'object') {
        const keysX = Object.keys(x.props);
        const keysY = Object.keys(y.props);
        if (keysX.length != keysY.length) {
            return false;
        }
        for (var i: number = 0; i < keysX.length; i++) {
            const key = keysX[i];
            if (!(key in y.props)) {
                return false;
            }
            return shallowEqual(x.props[key].props, y.props[key].props, {debug: undefined, customEqual: customEqual});
        }
        return true;
    }

    if (x === y) {
        return x !== 0 || y !== 0 || 1 / x === 1 / y;
    }
    else {
        return x !== x && y !== y;
    }
}