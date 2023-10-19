<script lang="ts">
	import '../styles/global.scss';

	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	onMount(() => {
		document.documentElement.setAttribute('lang', data.config.lang.lang);
	});
</script>

<slot />
