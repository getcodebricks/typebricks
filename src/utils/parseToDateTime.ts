export function parseToDateTime(key: any, value: any): any {
    if (typeof value === 'string') {

        return isValidDate(value) ? new Date(value) : value;
    }
    
    return value;
}

function isValidDate(dateTimeString: string): boolean {
    const flexibleISO8601Regex = /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/;
    return flexibleISO8601Regex.test(dateTimeString);
}
