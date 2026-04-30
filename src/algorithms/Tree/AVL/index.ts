type TreeNodeValue = number;

export class TreeNode {
    value: TreeNodeValue;
    height: number;
    left: TreeNode | null;
    right: TreeNode | null;

    constructor(value: TreeNodeValue) {
        this.height = 0;
        this.left = null;
        this.right = null;
        this.value = value;
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
/**
 * AVL 平衡二叉树
 * 
 * 任意一个节点的 左子树 和 右子树 高度差 <= 1
 * 
 * 造成失衡的情况有四种（插入后高度差为 2，-2）：
 * 1）LL: 向 左侧子树 的 左叶子节点 插入新节点
 * 2）LR: 向 左侧子树 的 右叶子节点 插入新节点
 * 3）RR: 向 右侧子树 的 右叶子节点 插入新节点
 * 4）RL: 向 右侧子树 的 左叶子节点 插入新节点
 * 
 * 适用情况：
 * 插入操作 和 删除操作 频率较低，主要进行搜索操作
 */
class AVLTree {
    root: TreeNode | null;

    constructor() {
        this.root = null;
    }

    private getNodeHeight(node: TreeNode | null): number {
        return !node ? -1 : node.height
    }

    private updateNodeHeight(node: TreeNode) {
        node.height = Math.max(this.getNodeHeight(node.left), this.getNodeHeight(node.right)) + 1
    }

    /**
     * 计算每个节点的 平衡因子，即该执行哪种操作
     * 合理的 左右子树的 高度差，应该在 -1, 0, 1 三者中，否则需要执行平衡操作、
     */
    getBalanceFactor(node: TreeNode) {
        // 使用 左子树 - 右子树，可能出现的值：-2，-1, 0, 1, 2
        return this.getNodeHeight(node.left) - this.getNodeHeight(node.right)
    }

    /** 右旋 */
    rightRotate(node: TreeNode) {
        const _child = node.left as TreeNode;
        const _grandChild = _child!.right;
        _child!.right = node;
        node.left = _grandChild;

        this.updateNodeHeight(node)
        this.updateNodeHeight(_child)
        return _child
    }

    /** 插入 */
    private insertNode(root: TreeNode, node: TreeNode): InsertResult {
        const path: TreeNode[] = [];
        let current: TreeNode | null = root;
        let parent: TreeNode | null = null;

        let _result: any = {
            inserted: false,
            node,
            parent,
            path,
        };
        while (current) {
            parent = current;
            path.push(current);

            if (node.value === current.value) {
                _result = {
                    path,
                    parent,
                    node: current,
                    inserted: false,
                };

                break;
            }

            if (node.value <= current.value) {
                if (!current.left) {
                    current.left = node;
                    _result = {
                        inserted: true,
                        node,
                        parent: current,
                        path,
                    };

                    break
                }

                current = current.left;
            } else {
                if (!current.right) {
                    current.right = node;
                    _result = {
                        inserted: true,
                        node,
                        parent: current,
                        path,
                    };
                    break
                }

                current = current.right;
            }
        }

        return _result
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

export default AVLTree