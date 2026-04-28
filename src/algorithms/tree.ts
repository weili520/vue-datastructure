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
                        parent: _parent,
                        founded: false
                    }
                }

                _parent = _curNode;
                _curNode = _curNode.left
            } else {
                if (!_curNode.right) {
                    return {
                        path: _path,
                        parent: _parent,
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

    /** 删除 */
    delete(value: TreeNodeValue) {
        const _target = this.searchNode(this.root, value)

        if (_target?.founded) {
            const _curNode = _target.node

            _target.node = undefined;
        }
    }
}

export default Tree