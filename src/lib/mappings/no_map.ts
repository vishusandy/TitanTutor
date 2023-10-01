import { Mapping, functionKeys } from "$lib/mappings";

export class NoMap extends Mapping {
    static mapName: string = 'no_map';

    getName(): string {
        return NoMap.mapName;
    }

    get(key: string): string | undefined {
        return key;
    }
    controlKey(key: string): boolean {
        return functionKeys.has(key);
    }
}
