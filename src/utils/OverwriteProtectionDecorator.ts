export function OverwriteProtectionBody(overwriteProtected: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {};
}