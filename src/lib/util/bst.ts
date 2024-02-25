
type Child<L, N> = Leaf<L, N> | Node<L, N>;

function isNode<L, N>(child: Child<L, N>): child is Node<L, N> {
    return child.isNode;
}

class Leaf<L, N> {
    isNode: boolean = false;
    n: N;
    value: L;

    constructor(nodeVal: N, leafVal: L) {
        this.value = leafVal;
        this.n = nodeVal;
    }

    print(): string {
        return `Leaf(${this.n}, ${this.value})`;
    }
}

class Node<L, N> {
    isNode: boolean = true;
    n: N;
    left: Child<L, N>;
    right: Child<L, N>;

    constructor(val: N, left: Child<L, N>, right: Child<L, N>) {
        this.n = val;
        this.left = left;
        this.right = right;
    }

    print(): string {
        return `Node(${this.n})`;
    }
}

function build<L, N>(nodes: Child<L, N>[]): Child<L, N> {
    if (nodes.length >= 3) {
        const half = Math.ceil(nodes.length / 2);
        return new Node(nodes[half - 1].n, build(nodes.slice(0, half)), build(nodes.slice(half)));
    } else if (nodes.length === 2) {
        return new Node(nodes[0].n, nodes[0], nodes[1]);
    } else if (nodes.length === 1) {
        return nodes[0];
    } else {
        throw new Error('nodes.length === 0');
    }
}

export class BinaryTree<L, N> {
    /** @hidden */
    private root: Child<L, N>;

    /**
     * @hidden
     * @see {@link fromRawLeafNodesUnsafe}
     */
    private constructor(arr: Array<[L, N]>) {
        const a = [...arr].sort(([, a], [, b]) =>
            (a > b) ? 1 : (a === b) ? 0 : -1
        );

        this.root = build(a.map(([v, n]) => new Leaf(n, v)));
    }


    /**
     * Creates a new complete binary search tree from an array containing the 
     * raw leaf node values.
     * 
     * **This avoids all safety checks**.
     * 
     * Each leaf node in `arr` must have a value greater than the previous.
     * 
     * @param arr - an array containing the leaf nodes and proportions
     * @returns returns a new complete binary search tree
     * 
     * @see {@link newNormalized}
     * @see {@link newProportioned}
     * @see {@link newProportionedNormalized}
     */
    static fromRawLeafNodesUnsafe<L, N>(arr: Array<[L, N]>): BinaryTree<L, N> {
        return new BinaryTree(arr);
    }


    /**
     * Creates a new complete binary search tree from an array containing the 
     * raw leaf node values.
     * 
     * Each leaf node in `arr` must have a value greater than the previous.
     * 
     * @param arr - an array containing the leaf nodes and proportions
     * @returns returns a new complete binary search tree
     * 
     * @throws will throw an error if `arr` is not an array with at least one element
     * @throws will throw if `arr` is not an array of numbers, BigInts, or strings
     * @throws will throw when `arr` if each element is not greater than the previous
     * 
     * @see {@link newNormalized}
     * @see {@link newProportioned}
     * @see {@link newProportionedNormalized}
     */
    static fromRawLeafNodes<L, N>(arr: Array<[L, N]>): BinaryTree<L, N> {
        if (arr.length === 0) {
            throw new Error('arr must be an array with at least one element');
        }

        const t = typeof arr[0][1];
        if (t !== 'number' && t !== 'bigint' && t !== 'string') {
            throw new Error('The node values must be a number, BigInt, or string.');
        }

        if (!isIncrementing(arr as [L, number | BigInt | string][])) {
            console.error("Array must be sorted in ascending order - each element must larger than the next.", arr);
            throw new Error('Invalid array - not in ascending order');
        }

        return new BinaryTree(arr);
    }


    /**
     * Create a normalized binary tree from an array of leaf nodes with incrementing values.
     * 
     * Each leaf node must be larger than the next.
     * 
     * @example
     * Example input:
     * 
     * ```js
     * const arr = [['a', 1], ['b', 3], ['c', 4], ['d', 5]]
     * const bst = BinaryTree.newNormalized(arr);
     * ```
     * 
     * which will result in the following leaf nodes:
     * 
     * ```js
     * ['a', 0.2], ['b', 0.6], ['c', 0.8], ['d', 1]
     * ```
     * 
     * Searching the tree for 0.5 would return `'b'`.
     * 
     * ```js
     * bst.search(0.5)
     * ```
     * 
     * Searching 0.5 would return `'b'` since the values are normalized such 
     * that the highest value (`'d'`) is 1.
     * 
     * @param arr - an array containing the leaf nodes and proportions
     * @param [sum] - an optional sum that can be passed to avoid an extra array loop
     * @returns returns a new complete binary search tree
     * @throws will throw an error if `arr` is not an array with at least one element
     */
    private static newNormalized<L>(arr: Array<[L, number]>, sum?: number): BinaryTree<L, number> {
        if (arr.length === 0) {
            throw new Error('arr must be an array with at least one element');
        }
        // TODO: allow initial values less than zero in input array (largest-smallest)
        if (arr[0][1] < 0) {
            console.error("The first value must be larger than or equal to 0");
        }
        if (!isIncrementing(arr)) {
            console.error("Array must be sorted in ascending order - each element must be larger than the next.", arr);
        }

        if (sum === undefined) {
            sum = arr.reduce((sum, cur) => cur[1] + sum, 0);
        }

        const a: [L, number][] = Array.from(arr.map(([w, n]) => [w, n / sum!]));
        return new BinaryTree(a);
    }


    /**
     * Creates a new comlpete binary tree from an array `arr`.
     * 
     * Each element of `arr` will contian an associated value `L` and a number.
     * The `number` represents the portion (out of the sum of all `number`s)
     * that should be assigned to that leaf.
     * 
     * @example
     * An example input would be:
     * 
     * ```js
     * const arr = [ ['a', 1], ['b', 2], ['c', 1], ['d', 1] ];
     * ```
     * 
     * This would result in the leaf nodes:
     * 
     * ```js
     * ['a', 1], ['b', 3], ['c', 4], ['d', 5]
     * ```
     * 
     * Searching the tree for 2 would return `'b'`:
     * 
     * ```js
     * bst.search(2)
     * ```
     * 
     * Searching 2 would yield `'b'` because each element of `arr` has its value
     * added to the previous leaf node, such that the values always increase.
     * 
     * @param arr - an array containing the leaf nodes and proportions
     * @returns returns a new complete binary search tree
     * @throws will throw an error if `arr` is not an array with at least one element
     */
    static newProportioned<L>(arr: Array<[L, number]>): BinaryTree<L, number> {
        if (arr.length === 0) {
            throw new Error('arr must be an array with at least one element');
        }

        const a: [L, number][] = [];
        let sum = 0;
        arr.forEach(([l, n]) => {
            sum += n;
            a.push([l, sum]);
        });

        return new BinaryTree(a);
    }


    /**
     * Creates a new comlpete binary tree from an array `arr`.
     * 
     * Each element of `arr` will contian an associated value `L` and a number.
     * The `number` represents the portion (out of the sum of all `number`s)
     * that should be assigned to that leaf.
     * 
     * Each resulting leaf node will be scaled such that the highest value is 1.
     * 
     * @example
     * An example input would be:
     * 
     * ```js
     * const arr = [ ['a', 1], ['b', 2], ['c', 1], ['d', 1] ];
     * const bst = newProportionedNormalized(arr);
     * ```
     * 
     * This would result in the leaf nodes:
     * 
     * ```js
     * ['a', 0.2], ['b', 0.6], ['c', 0.8], ['d', 1.00]
     * ```
     * 
     * Searching the tree for 0.5 would return `'b'`.
     * 
     * ```js
     * bst.search(0.5)
     * ```
     * 
     * So searching 0.5 would yield `'b'` since the values are normalized such 
     * that the highest value (`'d'`) is 1.  In `arr` the sum of the array is 5
     * so each element would have its value divided by 5 and then added to the
     * previous leaf node's value to return the list of raw leaf nodes.
     * 
     * @param arr - an array containing the leaf nodes and proportions
     * @returns returns a new complete binary search tree
     * @throws will throw an error if `arr` is not an array with at least one element
     */
    static newProportionedNormalized<L>(arr: Array<[L, number]>): BinaryTree<L, number> {
        if (arr.length === 0) {
            throw new Error('arr must be an array with at least one element');
        }

        const a: [L, number][] = [];
        let sum = 0;
        arr.forEach(([l, n]) => {
            sum += n;
            a.push([l, sum]);
        });

        return BinaryTree.newNormalized(a, sum);
    }


    /**
     * Searches the binary tree for a value.
     * 
     * A leaf node will match if `n` is less than or equal its value and larger than the previous leaf node's value.
     * 
     * Behavior when searching for values greater than the largest leaf node's value is undefined.
     * 
     * @param {number} n - the value to search for
     * @returns returns the leaf's associated value
     */
    search(n: N): L {
        let node = this.root;
        while (isNode(node)) {
            if (n <= node.n) node = node.left;
            else node = node.right;
        }
        return node.value;
    }

    /**
     * This will print the binary tree to the console.
     * 
     * This is provided for debugging purposes.
     */
    print() {
        let nodes: Child<L, N>[] = [this.root];

        while (nodes.length > 0) {
            let row = '';
            let f: Child<L, N>[] = [];

            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                row += node.print() + ' ';
                if (isNode(node)) {
                    f.push(node.left);
                    f.push(node.right);
                }
            }
            console.log(row);
            nodes = f;
        }
    }
}

function isIncrementing<L>(arr: Array<[L, number | BigInt | string]>): boolean {
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i][1] > arr[i + 1][1]) {
            console.error(`index ${i} is larger than index ${i}`, arr);
            return false;
        }
    }

    return true;
}


