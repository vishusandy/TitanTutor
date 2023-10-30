import { base } from '$app/paths';
import type { Config } from './config';

export const defaultMap: string = 'no_map';

type RemapJSON = { name: string, arr: [string, string][] };

type RemapItem = { name: string, id: string };
export const keyboardRemappings: RemapItem[] = [
    { name: 'none', id: 'no_map' },
    { name: 'Qwerty -> Dvorak', id: 'qwerty_to_dvorak' },
];

export abstract class Remap {
    abstract getId(): string;
    abstract getName(config: Config): string;
    abstract get(key: string): string | undefined;
    static load(file: string, fetchFn: typeof fetch = fetch): Promise<Remap> {
        if (file === 'no_map') {
            return new Promise((resolve) => resolve(NoRemap));
        }

        const req = new Request(`${base}/data/kbmaps/${file}.json`);
        return fetchFn(req)
            .then((resp) => {
                if (!resp.ok)
                    return NoRemap;
                return resp.json();
            })
            .then((json: RemapJSON) => new KbRemap(file, json.name, new Map(json.arr)));
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
    getId(): string {
        return 'no_map';
    },

    getName(config: Config): string {
        return '';
    },

    get(key: string): string | undefined {
        return key;
    }
}

export class KbRemap implements Remap {
    id: string;
    name: string;
    map: Map<string, string>;

    constructor(id: string, name: string, map: Map<string, string>) {
        this.id = id;
        this.map = map;
        this.name = name;
    }

    getId(): string {
        return this.id;
    }

    getName(config: Config): string {
        return this.name;
    }

    get(key: string): string | undefined {
        return this.map.get(key);
    }
}
