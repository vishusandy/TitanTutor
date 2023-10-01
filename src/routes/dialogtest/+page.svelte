<script lang="ts">
	import { createVoiceDialog } from '$lib/dialog';
</script>

<button on:click={() => createVoiceDialog().then((d) => console.log(d))}>Open</button>
