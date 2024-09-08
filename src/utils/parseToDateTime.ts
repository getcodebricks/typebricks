export function parseToDateTime(key: any, value: any): any {
    if (typeof value === 'string') {
        const date: Date = new Date(value);

        return isValidDate(date) ? date : value;
    }
    
    return value;
}

function isValidDate(date: Date): boolean {
    return !isNaN(date.getTime());
}
