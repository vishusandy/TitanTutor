<script lang="ts">
	import { LetterState } from './types';
	export let letter: string;
	export let state: LetterState;
</script>

<span
	class="letter"
	class:incomplete={state === LetterState.Incomplete}
	class:active={state === LetterState.Active}
	class:complete={state === LetterState.Complete}
	class:error={state === LetterState.Error}
>
	{letter}
</span>

<style>
	.incomplete {
		color: black;
	}
	.active {
		color: #eeee0f;
	}
	.complete {
		color: green;
	}
	.error {
		color: #d43f3f;
	}
</style>
