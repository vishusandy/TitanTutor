<script lang="ts">
	import '$lib/../styles/global.scss';
</script>

<div class="frame">
	<div class="one">Lorem</div>
	<div class="two">ipsum<br />dolor</div>
	<div class="three">sit amet,</div>
	<div class="three">
		<p>
			consectetur adipiscing elit. Praesent eu viverra ipsum. Quisque nec nunc sapien. Pellentesque
			habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In suscipit
			metus in elit accumsan placerat vehicula nec turpis. Sed varius euismod sapien, a placerat
			tortor placerat sed. Nunc facilisis.
		</p>
	</div>
</div>

<style>
	.frame {
		display: grid;
		height: 100%;
		grid-template-rows: repeat(3, min-content) auto;
	}
</style>
