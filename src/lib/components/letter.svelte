<script lang="ts">
	import { LetterState } from '$lib/types';
	export let letter: string;
	export let state: LetterState;
</script>

<span
	class="letter"
	class:incomplete={state === LetterState.Incomplete}
	class:active-letter={state === LetterState.Active}
	class:complete={state === LetterState.Complete}
	class:error={state === LetterState.Error}
>
	{letter}
</span>

<style>
	.incomplete {
		color: black;
	}
	.active-letter {
		color: #0be2e2;
	}
	.error {
		color: #d43f3f;
	}
</style>
