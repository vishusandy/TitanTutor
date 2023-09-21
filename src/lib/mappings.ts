export interface Mapping {
    get(key: string): string | undefined;
}

export class NoMap implements Mapping {
    get(key: string): string | undefined {
        return key;
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
