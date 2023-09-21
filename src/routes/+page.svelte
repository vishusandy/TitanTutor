<script lang="ts">
	import Typing from '$lib/components/typing.svelte';
	import type { Session } from '$lib/session';
	import { pregen_test } from '$lib/lesson';
	import { defaultConfig } from '$lib/config';
	let config = defaultConfig();
	let session: Session = { started: new Date(), config: config, lesson: pregen_test };
</script>

<Typing {session} />
