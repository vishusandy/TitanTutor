<script lang="ts">
	import '$lib/../styles/global.scss';
	
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	
	export let data: PageData;
	let db = data.db;
	let config = data.config;
	
	onMount(() => {
		document.documentElement.lang = config.lang.lang;
		document.documentElement.dir = config.lang.textDirection;
	});
	
	
</script>
