<script lang="ts">
	import { BinaryTree } from '$lib/bst';

	console.log('starting test');
	const arr: [number, string][] = [
		[1.0, 'j'],
		[0.1, 'a'],
		[0.3, 'c'],
		[0.9, 'i'],
		[0.4, 'd'],
		[0.5, 'e'],
		[0.6, 'f'],
		[0.7, 'g'],
		[0.2, 'b'],
		[0.8, 'h']
	];
	const bst = new BinaryTree(arr);
	console.log('tree created.');
	console.log(bst);
	bst.print();
	console.log(bst.search(0.01));
</script>
