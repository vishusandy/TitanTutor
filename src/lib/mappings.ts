
export abstract class Mapping {
    // Big sad.  https://github.com/microsoft/TypeScript/issues/34516
    abstract getName(): string;

    abstract get(key: string): string | undefined;

    controlKey(key: string): boolean {
        return functionKeys.has(key);
    }

    serialize(): string {
        return this.getName();
    }
}


export const functionKeys = new Set([
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
]);


// export type KbRows = {
//     bottomLeft: string[],
//     topLeft: string[],
//     homeLeft: string[],
//     bottomCenter: string[],
//     topCenter: string[],
//     homeCenter: string[],
//     bottomRight: string[],
//     topRight: string[],
//     homeRight: string[],
// }



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
