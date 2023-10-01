<script lang="ts">
	import Typing from '$lib/components/typing.svelte';
	import type { Session } from '$lib/session';
	import { pregen_test } from '$lib/lesson';
	import { Config } from '$lib/config';
	import { Stats } from '$lib/stats';

	let session: Session = {
		config: Config.default(),
		lesson: pregen_test,
		stats: new Stats()
	};
</script>

<Typing {session} />
