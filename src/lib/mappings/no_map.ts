import { Mapping } from "$lib/mappings";

export class NoMap extends Mapping {
    static mapName: string = 'no_map';

    getName(): string {
        return NoMap.mapName;
    }

    get(key: string): string | undefined {
        return key;
    }
}
