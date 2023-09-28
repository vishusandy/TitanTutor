<script lang="ts">
	import Typing from '$lib/components/typing.svelte';
	import type { Session } from '$lib/session';
	import { pregen_test } from '$lib/lesson';
	import { defaultConfig } from '$lib/config';
	import { Stats } from '$lib/stats';

	let config = defaultConfig();
	let session: Session = {
		started: undefined,
		dur: 0,
		config: config,
		lesson: pregen_test,
		stats: new Stats()
	};
</script>

<Typing {session} />
