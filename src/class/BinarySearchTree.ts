export type TraversalMode = 'preorder' | 'inorder' | 'postorder'

export interface BinaryTreeEdge {
  id: string
  from: BinaryTreeNode
  to: BinaryTreeNode
}

type InsertResult =
  | { inserted: true; node: BinaryTreeNode; parent: BinaryTreeNode | null; path: BinaryTreeNode[] }
  | { inserted: false; node: BinaryTreeNode | null; parent: null; path: BinaryTreeNode[] }

type SearchResult = { node: BinaryTreeNode | null; path: BinaryTreeNode[] }

type RemoveResult =
  | { removed: true; node: BinaryTreeNode; path: BinaryTreeNode[]; caseText: string }
  | { removed: false; node: null; path: BinaryTreeNode[]; caseText: '' }

export class BinaryTreeNode {
  left: BinaryTreeNode | null = null
  right: BinaryTreeNode | null = null
  x: number
  y = 70

  constructor(
    public readonly id: number,
    public value: number,
    treeWidth: number,
  ) {
    this.x = treeWidth / 2
  }
}

export class BinarySearchTree {
  root: BinaryTreeNode | null = null
  width = 920
  height = 420

  private nextNodeId = 1
  private readonly levelHeight = 110
  private readonly minNodeGap = 78

  get nodes() {
    const nodes: BinaryTreeNode[] = []
    this.collectNodes(this.root, nodes)
    return nodes
  }

  get edges() {
    const edges: BinaryTreeEdge[] = []
    this.collectEdges(this.root, edges)
    return edges
  }

  get size() {
    return this.nodes.length
  }

  insert(value: number): InsertResult {
    const path: BinaryTreeNode[] = []

    if (!this.root) {
      this.root = this.createNode(value)
      this.layout()
      return { inserted: true, node: this.root, parent: null, path }
    }

    let current: BinaryTreeNode | null = this.root
    while (current) {
      path.push(current)

      if (value === current.value) {
        return { inserted: false, node: current, parent: null, path }
      }

      if (value < current.value) {
        if (!current.left) {
          current.left = this.createNode(value)
          path.push(current.left)
          this.layout()
          return { inserted: true, node: current.left, parent: current, path }
        }
        current = current.left
      } else {
        if (!current.right) {
          current.right = this.createNode(value)
          path.push(current.right)
          this.layout()
          return { inserted: true, node: current.right, parent: current, path }
        }
        current = current.right
      }
    }

    return { inserted: false, node: null, parent: null, path }
  }

  search(value: number): SearchResult {
    const path: BinaryTreeNode[] = []
    let current = this.root

    while (current) {
      path.push(current)
      if (value === current.value) return { node: current, path }
      current = value < current.value ? current.left : current.right
    }

    return { node: null, path }
  }

  remove(value: number): RemoveResult {
    const result = this.search(value)
    if (!result.node) return { removed: false, node: null, path: result.path, caseText: '' }

    const caseText = this.getDeleteCaseText(result.node)
    this.root = this.removeNode(this.root, value)
    this.layout()

    return { removed: true, node: result.node, path: result.path, caseText }
  }

  traverse(mode: TraversalMode) {
    const nodes: BinaryTreeNode[] = []
    this.traverseNode(this.root, mode, nodes)
    return nodes
  }

  reset() {
    this.root = null
    this.width = 920
    this.height = 420
    this.nextNodeId = 1
  }

  private createNode(value: number) {
    return new BinaryTreeNode(this.nextNodeId++, value, this.width)
  }

  private removeNode(node: BinaryTreeNode | null, value: number): BinaryTreeNode | null {
    if (!node) return null

    if (value < node.value) {
      node.left = this.removeNode(node.left, value)
      return node
    }
    if (value > node.value) {
      node.right = this.removeNode(node.right, value)
      return node
    }

    if (!node.left) return node.right
    if (!node.right) return node.left

    const successor = this.findMin(node.right)
    node.value = successor.value
    node.right = this.removeNode(node.right, successor.value)
    return node
  }

  private findMin(node: BinaryTreeNode) {
    let current = node
    while (current.left) current = current.left
    return current
  }

  private getDeleteCaseText(node: BinaryTreeNode) {
    if (!node.left && !node.right) return '它是叶子节点，直接移除。'
    if (!node.left || !node.right) return '它只有一个子节点，由子节点接替位置。'
    return '它有两个子节点，使用右子树最小节点接替。'
  }

  private traverseNode(node: BinaryTreeNode | null, mode: TraversalMode, nodes: BinaryTreeNode[]) {
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
    this.width = Math.max(920, nodes.length * this.minNodeGap + 160)
    this.height = Math.max(420, depth * this.levelHeight + 120)

    let order = 0
    this.assignInorderX(this.root, () => 80 + order++ * this.minNodeGap)
    this.normalizeRootPosition()
  }

  private assignInorderX(node: BinaryTreeNode | null, getX: () => number, depth = 0) {
    if (!node) return
    this.assignInorderX(node.left, getX, depth + 1)
    node.x = getX()
    node.y = depth * this.levelHeight + 70
    this.assignInorderX(node.right, getX, depth + 1)
  }

  private normalizeRootPosition() {
    if (!this.root) return
    const offset = this.width / 2 - this.root.x
    for (const node of this.nodes) node.x += offset
  }

  private getDepth(node: BinaryTreeNode | null): number {
    if (!node) return 0
    return Math.max(this.getDepth(node.left), this.getDepth(node.right)) + 1
  }

  private collectNodes(node: BinaryTreeNode | null, nodes: BinaryTreeNode[]) {
    if (!node) return
    nodes.push(node)
    this.collectNodes(node.left, nodes)
    this.collectNodes(node.right, nodes)
  }

  private collectEdges(node: BinaryTreeNode | null, edges: BinaryTreeEdge[]) {
    if (!node) return
    if (node.left) edges.push({ id: `${node.id}-${node.left.id}`, from: node, to: node.left })
    if (node.right) edges.push({ id: `${node.id}-${node.right.id}`, from: node, to: node.right })
    this.collectEdges(node.left, edges)
    this.collectEdges(node.right, edges)
  }
}
