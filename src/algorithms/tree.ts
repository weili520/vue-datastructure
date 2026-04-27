type TreeNodeValue = number;

export class TreeNode {
    value: TreeNodeValue;
    left: TreeNode | null;
    right: TreeNode | null;

    constructor(value: TreeNodeValue) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

type InsertResult = {
    inserted: boolean;
    node: TreeNode;
    parent: TreeNode | null;
    path: TreeNode[];
}

class Tree {
    root: TreeNode | null;

    constructor() {
        this.root = null;
    }

    private insertNode(root: TreeNode, node: TreeNode): InsertResult {
        const path: TreeNode[] = [];
        let current: TreeNode | null = root;
        let parent: TreeNode | null = null;

        while (current) {
            parent = current;
            path.push(current);

            if (node.value === current.value) {
                return {
                    path,
                    parent,
                    node: current,
                    inserted: false,
                };
            }

            if (node.value < current.value) {
                if (!current.left) {
                    current.left = node;
                    path.push(node);
                    return {
                        inserted: true,
                        node,
                        parent: current,
                        path,
                    };
                }

                current = current.left;
            } else {
                if (!current.right) {
                    current.right = node;
                    path.push(node);
                    return {
                        inserted: true,
                        node,
                        parent: current,
                        path,
                    };
                }

                current = current.right;
            }
        }

        return {
            inserted: false,
            node,
            parent,
            path,
        };
    }

    /** 插入 */
    insert(value: TreeNodeValue): InsertResult {
        const node = new TreeNode(value);

        if (!this.root) {
            this.root = node;

            return {
                node,
                path: [node],
                parent: null,
                inserted: true,
            };
        }

        return this.insertNode(this.root, node);
    }

    search() {

    }
}

export default Tree