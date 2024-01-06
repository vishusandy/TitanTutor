
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
    root: Child<L, N>;

    /// Create a new binary tree.  Expects an array of [value, probability] where the probability inceases for each item
    constructor(arr: [L, N][]) {
        const a = [...arr].sort(([, a], [, b]) =>
            (a > b) ? 1 : (a === b) ? 0 : -1
        );

        this.root = build(a.map(([v, n]) => new Leaf(n, v)));
    }

    /**
     * Create a normalized bst with incementing probabilities.  Ex array:
     * [['a', 0.25], ['b', 0.5], ['c', 0.75], ['d', 1]]
     * @param arr   Array with 
     * @param probSum 
     * @returns 
     */
    static normalized_cumulative<L>(arr: [L, number][], sum: number) {
        const a: [L, number][] = Array.from(arr.map(([w, n]) => [w, n / sum]));
        return new BinaryTree(a);
    }

    static normalized<L>(arr: [L, number][]) {
        const a: [L, number][] = [];
        let sum = 0;
        arr.forEach(([l, n]) => {
            sum += n;
            a.push([l, sum]);
        });
        return BinaryTree.normalized_cumulative(a, sum);
    }

    search(n: N): L {
        let node = this.root;
        while (isNode(node)) {
            if (n <= node.n) node = node.left;
            else node = node.right;
        }
        return node.value;
    }

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





