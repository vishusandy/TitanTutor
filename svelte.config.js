// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';


function getBasePath() {
    if (process.argv.includes('dev')) return '/';
    return /** @type { '' | `/${string}` | undefined }`*/ (process.env.BASE_PATH);
};


/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {
        // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
        // If your environment is not supported or you settled on a specific environment, switch out the adapter.
        // See https://kit.svelte.dev/docs/adapters for more information about adapters.
        // adapter: adapter()
        adapter: adapter({
            pages: 'public',
            assets: 'public',
            // fallback: 'app.html',
            fallback: '404.html',
            precompress: false,
            strict: true
        }),
        paths: {
            base: getBasePath(),
        }
    }
};

export default config;
