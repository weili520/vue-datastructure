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

type SearchResult = {
    path: TreeNode[];
    parent: null | TreeNode;
    founded: boolean;
    node?: TreeNode;
}

class Tree {
    root: TreeNode | null;

    constructor() {
        this.root = null;
    }

    /** 插入 */
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

            if (node.value <= current.value) {
                if (!current.left) {
                    current.left = node;
                    // path.push(node);
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
                    // path.push(node);
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

    /** 搜索 */
    searchNode(curNode: TreeNode | null, value: TreeNodeValue): SearchResult {
        let _curNode = curNode;
        const _path: TreeNode[] = [];
        let _parent: TreeNode | null = null;

        while (_curNode) {
            _path.push(_curNode);

            if (_curNode.value === value) {
                return {
                    path: _path,
                    node: _curNode,
                    parent: _parent,
                    founded: true
                }
            }

            if (value < _curNode.value) {
                if (!_curNode.left) {
                    return {
                        path: _path,
                        parent: _curNode,
                        founded: false
                    }
                }

                _parent = _curNode;
                _curNode = _curNode.left
            } else {
                if (!_curNode.right) {
                    return {
                        path: _path,
                        parent: _curNode,
                        founded: false
                    }
                }

                _parent = _curNode;
                _curNode = _curNode.right
            }
        }

        return {
            path: [],
            parent: null,
            founded: false,
        }
    }
    search(value: TreeNodeValue) {
        return this.searchNode(this.root, value)
    }

    /** 获取 最小值 节点 */
    private findMin(node: TreeNode): TreeNode {
        let current = node;

        while (current.left) {
            current = current.left;
        }

        return current;
    }

    private findMax(node: TreeNode): TreeNode {
        let current = node;

        while (current.right) {
            current = current.right;
        }

        return current;
    }

    /** 
     * 删除某个节点。三种节点之一: 
     * 1）没有叶子 的节点
     * 2）单个叶子 的节点
     * 3）左右叶子 的节点
     * */
    private deleteNode(node: TreeNode | null, value: TreeNodeValue): TreeNode | null {
        if (!node) return null;

        if (value < node.value) {
            node.left = this.deleteNode(node.left, value);
            return node;
        }

        if (value > node.value) {
            node.right = this.deleteNode(node.right, value);
            return node;
        }

        // 单叶子 节点
        if (!node.left) return node.right;
        if (!node.right) return node.left;

        // 双叶子节点
        const _rightTreeMin = this.findMin(node.right); // 找到右侧最小的节点；亦可找到左侧最大节点
        // const _maxNode = this.findMax(node.left);
        node.value = _rightTreeMin.value;
        node.right = this.deleteNode(node.right, _rightTreeMin.value);
        return node;
    }
    delete(value: TreeNodeValue) {
        this.root = this.deleteNode(this.root, value)
    }

    /**
     * 先序遍历
     */
    preOrderTraversal(node: TreeNode | null, callback: (value: TreeNodeValue) => void) {
        if (!node) {
            return
        }

        callback(node.value)
        this.preOrderTraversal(node.left, callback)
        this.preOrderTraversal(node.right, callback)
    }

    /**
     * 中序遍历
     */
    inOrderTraversal(node: TreeNode | null, callback: (value: TreeNodeValue) => void) {
        if (!node) {
            return
        }

        this.preOrderTraversal(node.left, callback)
        callback(node.value)
        this.preOrderTraversal(node.right, callback)
    }

    /**
         * 后序遍历
         */
    postOrderTraversal(node: TreeNode | null, callback: (value: TreeNodeValue) => void) {
        if (!node) {
            return
        }

        this.preOrderTraversal(node.left, callback)
        this.preOrderTraversal(node.right, callback)
        callback(node.value)
    }

}

export default Tree