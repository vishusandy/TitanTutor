export interface Mapping {
    get(key: string): string | undefined;
    controlKey(key: string): boolean;
}

const functionKeyList = [
    'Delete',
    'Enter',
    'ArrowDown',
    'ArrowUp',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
    'PageUp',
    'PageDown',
    'Escape',
    'Insert',
    // 'Tab',
];

const functionKeys = new Set(functionKeyList);


export class NoMap implements Mapping {
    get(key: string): string | undefined {
        return key;
    }
    controlKey(key: string): boolean {
        return functionKeys.has(key);
    }
}

export type KbRows = {
    bottomLeft: string[],
    topLeft: string[],
    homeLeft: string[],
    bottomCenter: string[],
    topCenter: string[],
    homeCenter: string[],
    bottomRight: string[],
    topRight: string[],
    homeRight: string[],
}



/*
Alt
Compose
Shift
Delete
Home
End
PageUp
PageDown
Control
Shift
Tab
Alt
F1-12
*/
