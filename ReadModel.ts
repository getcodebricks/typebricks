class ReadModelState {
    readonly id: string;

    constructor(id: string) {
        this.id = id;
    }
}

class ReadModel {
    readonly fields: any[];
    readonly nameDatabase: string;

    constructor(fields: any[], nameDatabase: string) {
        this.fields = fields;
        this.nameDatabase = nameDatabase;
    }
}

export { ReadModel, ReadModelState };
