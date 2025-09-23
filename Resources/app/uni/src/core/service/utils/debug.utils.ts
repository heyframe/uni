export function warn(name = 'Core', ...message: any[]): void {
    if (import.meta.env.DEV && typeof console !== 'undefined') {
        message.unshift(`[${name}]`);
        console.warn(...message);
    }
}

export function error(name = 'Core', ...message: any[]): void {
    if (import.meta.env.DEV && typeof console !== 'undefined') {
        message.unshift(`[${name}]`);
        console.error(...message);
    }
}
