export function toSnakeCase(str: string): string {
    const words = str.split(/(?=[A-Z])|\s/);
    const lowerCaseWords = words.map(word => lowercaseFirstLetter(word));
    const snakeCase = lowerCaseWords.join('_');

    return snakeCase;
}

function lowercaseFirstLetter(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
}