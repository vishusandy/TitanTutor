
import { goto } from '$app/navigation';
import { base } from '$app/paths';

export function home() {
    goto(base === '' ? '/' : base);
}
