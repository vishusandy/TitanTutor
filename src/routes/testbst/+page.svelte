<script lang="ts">
	import { BinaryTree } from '$lib/util/bst';

	// const arr: [string, number][] = [
	// 	['j', 1.0],
	// 	['a', 0.1],
	// 	['c', 0.3],
	// 	['i', 0.9],
	// 	['d', 0.4],
	// 	['e', 0.5],
	// 	['f', 0.6],
	// 	['g', 0.7],
	// 	['b', 0.2],
	// 	['h', 0.8]
	// ];
	// const bst = new BinaryTree(arr);
	// console.log('tree created.');
	// console.log(bst);
	// bst.print();
	// console.log(bst.search(0.24));

	const arr: [string, number][] = [
		['j', 1 / 10],
		['a', 1 / 10],
		['c', 1 / 10],
		['i', 1 / 10],
		['d', 1 / 10],
		['e', 1 / 10],
		['f', 1 / 10],
		['g', 1 / 10],
		['b', 1 / 10],
		['h', 1 / 10]
	];
	const bst = BinaryTree.normalized(arr);
	console.log('tree created.');
	console.log(bst);
	bst.print();
	console.log(bst.search(0.24));

	// const arr = [1 / 10, 1 / 10, 1 / 10, 1 / 10, 1 / 10, 1 / 10, 1 / 10, 1 / 10, 1 / 10, 1 / 10];
	// const bst = BinaryTree.normalized(arr);
</script>
