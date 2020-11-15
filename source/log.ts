let logDisabled = false;

let messages: string[] = [];

export function withLogDisabled<T>(f: () => T): T {
    const wasLogDisabled = logDisabled;
    logDisabled = true;
    const val = f();
    logDisabled = wasLogDisabled;
    return val;
}

export function consoleFlush() {
    for (const msg of messages) {
        console.log(msg);
    }
    messages = [];
}

export function log(msg: string) {
    if (!logDisabled) {
        messages.push(msg);
    }
}