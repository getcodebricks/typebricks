export function OverwriteProtectionBody(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {};
}