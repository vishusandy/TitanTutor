export const ssr = false;
export const prerender = false;

import { connect } from "$lib/db.js";

export async function load({ fetch }: { fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response> }) {
    return { db: await connect() };
}
