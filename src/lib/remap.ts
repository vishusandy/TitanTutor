import { base } from '$app/paths';

export const defaultMap: string = 'no_map';

export abstract class Remap {
    abstract getName(): string;
    abstract get(key: string): string | undefined;
    static load(name: string, fetchFn: typeof fetch): Promise<Remap> {
        if (name === 'no_map') {
            return new Promise((resolve) => resolve(NoRemap));
        }

        const req = new Request(`${base}/data/kbmaps/${name}.json`);
        return fetchFn(req)
            .then((resp) => {
                if (!resp.ok)
                    return NoRemap;
                return resp.json();
            })
            .then((arr: [string, string][]) => new KbRemap(name, new Map(arr)))
    }
}


export const controlKeys = new Set([
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
    'Shift',
    // 'Tab',
]);


export const NoRemap: Remap = {
    getName(): string {
        return 'no_map';
    },
    get(key: string): string | undefined {
        return key;
    }
}

export class KbRemap implements Remap {
    mapName: string;
    map: Map<string, string>;

    constructor(name: string, map: Map<string, string>) {
        this.mapName = name
        this.map = map;
    }

    getName(): string {
        return this.mapName;
    }

    get(key: string): string | undefined {
        return this.map.get(key);
    }
}
