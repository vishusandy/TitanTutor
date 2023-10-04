<script lang="ts">
	import { createVoiceDialog } from '$lib/dialog';
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<button on:click={() => createVoiceDialog(data.lang).then((d) => console.log(d))}>Open</button>
