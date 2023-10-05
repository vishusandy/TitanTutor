import { base } from '$app/paths';

const defaultMap: string = 'no_map';

export async function loadUserKbMap(fetchFn: typeof fetch): Promise<KbMapping> {
    return loadKbMap(localStorage.getItem('kbmap') ?? defaultMap, fetchFn);
}

export async function loadKbMap(name: string, fetchFn: typeof fetch): Promise<KbMapping> {
    if (name !== 'no_map') {
        const req = new Request(`${base}/data/kbmaps/${name}.json`);
        return fetchFn(req)
            .then((resp) => {
                if (!resp.ok)
                    return NoMap;
                return resp.json();
            })
            .then((arr: [string, string][]) => new KbMapLoaded(name, new Map(arr)))
    }

    return new Promise((resolve) => resolve(NoMap));
}

export interface KbMapping {
    getName(): string;
    get(key: string): string | undefined;
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
    // 'Tab',
]);


export const NoMap: KbMapping = {
    getName(): string {
        return 'no_map';
    },
    get(key: string): string | undefined {
        return key;
    }
}

export class KbMapLoaded implements KbMapping {
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
