export const defaultMap: string = 'no_map';

type RemapItem = { name: string, id: string };
export const keyboardRemappings: RemapItem[] = [
    { name: 'none', id: 'no_map' },
    { name: 'Qwerty -> Dvorak', id: 'qwerty_to_dvorak' },
];
