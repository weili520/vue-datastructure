export type BalancedTraversalMode = 'preorder' | 'inorder' | 'postorder'

export interface BalancedTreeEdge {
  id: string
  from: BalancedTreeNode
  to: BalancedTreeNode
}

type InsertResult =
  | {
      inserted: true
      node: BalancedTreeNode
      path: BalancedTreeNode[]
      rotation: RotationInfo | null
    }
  | {
      inserted: false
      node: BalancedTreeNode | null
      path: BalancedTreeNode[]
      rotation: null
    }

type SearchResult = { node: BalancedTreeNode | null; path: BalancedTreeNode[] }

type RemoveResult =
  | {
      removed: true
      node: BalancedTreeNode
      path: BalancedTreeNode[]
      caseText: string
      rotation: RotationInfo | null
    }
  | { removed: false; node: null; path: BalancedTreeNode[]; caseText: ''; rotation: null }

type RotationInfo = {
  type: 'LL' | 'RR' | 'LR' | 'RL'
  pivotValue: number
  text: string
}

type MutationState = {
  path: BalancedTreeNode[]
  insertedNode: BalancedTreeNode | null
  removedNode: BalancedTreeNode | null
  rotation: RotationInfo | null
}

export class BalancedTreeNode {
  left: BalancedTreeNode | null = null
  right: BalancedTreeNode | null = null
  height = 1
  x: number
  y = 70

  constructor(
    public readonly id: number,
    public value: number,
    treeWidth: number,
  ) {
    this.x = treeWidth / 2
  }

  get balanceFactor() {
    return BalancedBinarySearchTree.getNodeHeight(this.left) - BalancedBinarySearchTree.getNodeHeight(this.right)
  }
}

export class BalancedBinarySearchTree {
  root: BalancedTreeNode | null = null
  width = 960
  height = 460

  private nextNodeId = 1
  private readonly minNodeGap = 82
  private readonly levelHeight = 108

  insert(value: number): InsertResult {
    const state: MutationState = {
      path: [],
      insertedNode: null,
      removedNode: null,
      rotation: null,
    }

    const existing = this.search(value)
    if (existing.node) {
      return { inserted: false, node: existing.node, path: existing.path, rotation: null }
    }

    this.root = this.insertNode(this.root, value, state)
    this.layout()

    if (!state.insertedNode) return { inserted: false, node: null, path: state.path, rotation: null }
    return { inserted: true, node: state.insertedNode, path: state.path, rotation: state.rotation }
  }

  search(value: number): SearchResult {
    const path: BalancedTreeNode[] = []
    let current = this.root

    while (current) {
      path.push(current)
      if (value === current.value) return { node: current, path }
      current = value < current.value ? current.left : current.right
    }

    return { node: null, path }
  }

  remove(value: number): RemoveResult {
    const searchResult = this.search(value)
    if (!searchResult.node) return { removed: false, node: null, path: searchResult.path, caseText: '', rotation: null }

    const state: MutationState = {
      path: [...searchResult.path],
      insertedNode: null,
      removedNode: searchResult.node,
      rotation: null,
    }
    const caseText = this.getDeleteCaseText(searchResult.node)

    this.root = this.removeNode(this.root, value, state)
    this.layout()

    return { removed: true, node: searchResult.node, path: searchResult.path, caseText, rotation: state.rotation }
  }

  traverse(mode: BalancedTraversalMode) {
    const nodes: BalancedTreeNode[] = []
    this.traverseNode(this.root, mode, nodes)
    return nodes
  }

  reset() {
    this.root = null
    this.width = 960
    this.height = 460
    this.nextNodeId = 1
  }

  static getNodeHeight(node: BalancedTreeNode | null) {
    return node?.height ?? 0
  }

  private insertNode(node: BalancedTreeNode | null, value: number, state: MutationState): BalancedTreeNode {
    if (!node) {
      const newNode = this.createNode(value)
      state.path.push(newNode)
      state.insertedNode = newNode
      return newNode
    }

    state.path.push(node)

    if (value < node.value) {
      node.left = this.insertNode(node.left, value, state)
    } else {
      node.right = this.insertNode(node.right, value, state)
    }

    return this.rebalance(node, state)
  }

  private removeNode(node: BalancedTreeNode | null, value: number, state: MutationState): BalancedTreeNode | null {
    if (!node) return null

    if (value < node.value) {
      node.left = this.removeNode(node.left, value, state)
      return this.rebalance(node, state)
    }
    if (value > node.value) {
      node.right = this.removeNode(node.right, value, state)
      return this.rebalance(node, state)
    }

    if (!node.left) return node.right
    if (!node.right) return node.left

    const successor = this.findMin(node.right)
    node.value = successor.value
    node.right = this.removeNode(node.right, successor.value, state)
    return this.rebalance(node, state)
  }

  private rebalance(node: BalancedTreeNode, state: MutationState) {
    this.updateHeight(node)
    const balance = node.balanceFactor

    if (balance > 1) {
      if ((node.left?.balanceFactor ?? 0) >= 0) {
        state.rotation ??= this.describeRotation('LL', node.value)
        return this.rotateRight(node)
      }

      state.rotation ??= this.describeRotation('LR', node.value)
      node.left = node.left ? this.rotateLeft(node.left) : null
      return this.rotateRight(node)
    }

    if (balance < -1) {
      if ((node.right?.balanceFactor ?? 0) <= 0) {
        state.rotation ??= this.describeRotation('RR', node.value)
        return this.rotateLeft(node)
      }

      state.rotation ??= this.describeRotation('RL', node.value)
      node.right = node.right ? this.rotateRight(node.right) : null
      return this.rotateLeft(node)
    }

    return node
  }

  private rotateLeft(node: BalancedTreeNode) {
    const newRoot = node.right
    if (!newRoot) return node

    const movedSubtree = newRoot.left
    newRoot.left = node
    node.right = movedSubtree

    this.updateHeight(node)
    this.updateHeight(newRoot)
    return newRoot
  }

  private rotateRight(node: BalancedTreeNode) {
    const newRoot = node.left
    if (!newRoot) return node

    const movedSubtree = newRoot.right
    newRoot.right = node
    node.left = movedSubtree

    this.updateHeight(node)
    this.updateHeight(newRoot)
    return newRoot
  }

  private updateHeight(node: BalancedTreeNode) {
    node.height = Math.max(BalancedBinarySearchTree.getNodeHeight(node.left), BalancedBinarySearchTree.getNodeHeight(node.right)) + 1
  }

  private createNode(value: number) {
    return new BalancedTreeNode(this.nextNodeId++, value, this.width)
  }

  private findMin(node: BalancedTreeNode) {
    let current = node
    while (current.left) current = current.left
    return current
  }

  private getDeleteCaseText(node: BalancedTreeNode) {
    if (!node.left && !node.right) return '它是叶子节点，直接移除后回溯检查平衡因子。'
    if (!node.left || !node.right) return '它只有一个子节点，由子节点接替后回溯检查平衡因子。'
    return '它有两个子节点，使用右子树最小节点接替后继续保持平衡。'
  }

  private describeRotation(type: RotationInfo['type'], pivotValue: number): RotationInfo {
    const text = {
      LL: `节点 ${pivotValue} 出现 LL 失衡，执行一次右旋。`,
      RR: `节点 ${pivotValue} 出现 RR 失衡，执行一次左旋。`,
      LR: `节点 ${pivotValue} 出现 LR 失衡，先左旋左子树，再右旋。`,
      RL: `节点 ${pivotValue} 出现 RL 失衡，先右旋右子树，再左旋。`,
    }[type]

    return { type, pivotValue, text }
  }

  private traverseNode(node: BalancedTreeNode | null, mode: BalancedTraversalMode, nodes: BalancedTreeNode[]) {
    if (!node) return
    if (mode === 'preorder') nodes.push(node)
    this.traverseNode(node.left, mode, nodes)
    if (mode === 'inorder') nodes.push(node)
    this.traverseNode(node.right, mode, nodes)
    if (mode === 'postorder') nodes.push(node)
  }

  private layout() {
    const nodes = this.nodes
    const depth = this.getDepth(this.root)
    this.width = Math.max(960, nodes.length * this.minNodeGap + 180)
    this.height = Math.max(460, depth * this.levelHeight + 140)

    let order = 0
    this.assignInorderX(this.root, () => 90 + order++ * this.minNodeGap)
    this.normalizeRootPosition()
  }

  private assignInorderX(node: BalancedTreeNode | null, getX: () => number, depth = 0) {
    if (!node) return
    this.assignInorderX(node.left, getX, depth + 1)
    node.x = getX()
    node.y = depth * this.levelHeight + 78
    this.assignInorderX(node.right, getX, depth + 1)
  }

  private normalizeRootPosition() {
    if (!this.root) return
    const offset = this.width / 2 - this.root.x
    for (const node of this.nodes) node.x += offset
  }

  private getDepth(node: BalancedTreeNode | null): number {
    if (!node) return 0
    return Math.max(this.getDepth(node.left), this.getDepth(node.right)) + 1
  }

  get nodes() {
    const nodes: BalancedTreeNode[] = []
    this.collectNodes(this.root, nodes)
    return nodes
  }

  get edges() {
    const edges: BalancedTreeEdge[] = []
    this.collectEdges(this.root, edges)
    return edges
  }

  get size() {
    return this.nodes.length
  }

  private collectNodes(node: BalancedTreeNode | null, nodes: BalancedTreeNode[]) {
    if (!node) return
    nodes.push(node)
    this.collectNodes(node.left, nodes)
    this.collectNodes(node.right, nodes)
  }

  private collectEdges(node: BalancedTreeNode | null, edges: BalancedTreeEdge[]) {
    if (!node) return
    if (node.left) edges.push({ id: `${node.id}-${node.left.id}`, from: node, to: node.left })
    if (node.right) edges.push({ id: `${node.id}-${node.right.id}`, from: node, to: node.right })
    this.collectEdges(node.left, edges)
    this.collectEdges(node.right, edges)
  }
}
