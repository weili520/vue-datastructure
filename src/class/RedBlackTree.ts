export type RedBlackTraversalMode = 'preorder' | 'inorder' | 'postorder'
export type RedBlackColor = 'red' | 'black'

export interface RedBlackTreeEdge {
  id: string
  from: RedBlackTreeNode
  to: RedBlackTreeNode
}

type BalanceInfo = {
  type: '变色' | '左旋' | '右旋' | '双旋'
  text: string
}

type InsertResult =
  | {
      inserted: true
      node: RedBlackTreeNode
      path: RedBlackTreeNode[]
      balance: BalanceInfo | null
    }
  | {
      inserted: false
      node: RedBlackTreeNode | null
      path: RedBlackTreeNode[]
      balance: null
    }

type SearchResult = { node: RedBlackTreeNode | null; path: RedBlackTreeNode[] }

type RemoveResult =
  | {
      removed: true
      node: RedBlackTreeNode
      path: RedBlackTreeNode[]
      caseText: string
      balance: BalanceInfo | null
    }
  | { removed: false; node: null; path: RedBlackTreeNode[]; caseText: ''; balance: null }

export class RedBlackTreeNode {
  left: RedBlackTreeNode | null = null
  right: RedBlackTreeNode | null = null
  parent: RedBlackTreeNode | null = null
  color: RedBlackColor = 'red'
  x: number
  y = 78

  constructor(
    public readonly id: number,
    public value: number,
    treeWidth: number,
  ) {
    this.x = treeWidth / 2
  }

  get colorLabel() {
    return this.color === 'red' ? 'R' : 'B'
  }
}

export class RedBlackTree {
  root: RedBlackTreeNode | null = null
  width = 980
  height = 480

  private nextNodeId = 1
  private readonly minNodeGap = 86
  private readonly levelHeight = 108

  insert(value: number): InsertResult {
    const existing = this.search(value)
    if (existing.node) return { inserted: false, node: existing.node, path: existing.path, balance: null }

    const path: RedBlackTreeNode[] = []
    const node = this.createNode(value)
    let parent: RedBlackTreeNode | null = null
    let current = this.root

    while (current) {
      parent = current
      path.push(current)
      current = value < current.value ? current.left : current.right
    }

    node.parent = parent
    path.push(node)

    if (!parent) {
      this.root = node
    } else if (value < parent.value) {
      parent.left = node
    } else {
      parent.right = node
    }

    const balance = this.fixInsert(node)
    this.layout()
    return { inserted: true, node, path, balance }
  }

  search(value: number): SearchResult {
    const path: RedBlackTreeNode[] = []
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
    if (!searchResult.node) return { removed: false, node: null, path: searchResult.path, caseText: '', balance: null }

    const target = searchResult.node
    const caseText = this.getDeleteCaseText(target)
    const successor = target.left && target.right ? this.findMin(target.right) : null
    const removedNode = successor ?? target
    const replacement = removedNode.left ?? removedNode.right
    const replacementParent = removedNode.parent
    const removedColor = removedNode.color

    if (successor) target.value = successor.value
    this.transplant(removedNode, replacement)

    const balance = removedColor === 'black' ? this.fixRemove(replacement, replacementParent) : null
    this.layout()

    return { removed: true, node: target, path: searchResult.path, caseText, balance }
  }

  traverse(mode: RedBlackTraversalMode) {
    const nodes: RedBlackTreeNode[] = []
    this.traverseNode(this.root, mode, nodes)
    return nodes
  }

  reset() {
    this.root = null
    this.width = 980
    this.height = 480
    this.nextNodeId = 1
  }

  private fixInsert(node: RedBlackTreeNode): BalanceInfo | null {
    let current = node
    let usedColorFlip = false
    let usedRotation = false

    while (current.parent?.color === 'red') {
      const parent = current.parent
      const grandparent = parent.parent
      if (!grandparent) break

      if (parent === grandparent.left) {
        const uncle = grandparent.right
        if (this.getColor(uncle) === 'red') {
          parent.color = 'black'
          uncle!.color = 'black'
          grandparent.color = 'red'
          current = grandparent
          usedColorFlip = true
          continue
        }

        if (current === parent.right) {
          current = parent
          this.rotateLeft(current)
        }

        current.parent!.color = 'black'
        grandparent.color = 'red'
        this.rotateRight(grandparent)
        usedRotation = true
      } else {
        const uncle = grandparent.left
        if (this.getColor(uncle) === 'red') {
          parent.color = 'black'
          uncle!.color = 'black'
          grandparent.color = 'red'
          current = grandparent
          usedColorFlip = true
          continue
        }

        if (current === parent.left) {
          current = parent
          this.rotateRight(current)
        }

        current.parent!.color = 'black'
        grandparent.color = 'red'
        this.rotateLeft(grandparent)
        usedRotation = true
      }
    }

    if (this.root) this.root.color = 'black'
    if (usedColorFlip && usedRotation) return { type: '双旋', text: '插入后先变色再旋转，红黑树性质已恢复。' }
    if (usedRotation) return { type: '左旋', text: '插入后通过旋转和重新染色消除连续红节点。' }
    if (usedColorFlip) return { type: '变色', text: '父节点与叔节点同为红色，已通过变色向上修复。' }
    return null
  }

  private fixRemove(node: RedBlackTreeNode | null, parent: RedBlackTreeNode | null): BalanceInfo | null {
    let current = node
    let currentParent = parent
    let usedColorFlip = false
    let usedRotation = false

    while (current !== this.root && this.getColor(current) === 'black') {
      if (current === currentParent?.left) {
        let sibling = currentParent.right

        if (this.getColor(sibling) === 'red') {
          sibling!.color = 'black'
          currentParent.color = 'red'
          this.rotateLeft(currentParent)
          sibling = currentParent.right
          usedRotation = true
        }

        if (this.getColor(sibling?.left ?? null) === 'black' && this.getColor(sibling?.right ?? null) === 'black') {
          if (sibling) sibling.color = 'red'
          current = currentParent
          currentParent = current.parent
          usedColorFlip = true
        } else {
          if (this.getColor(sibling?.right ?? null) === 'black') {
            if (sibling?.left) sibling.left.color = 'black'
            if (sibling) {
              sibling.color = 'red'
              this.rotateRight(sibling)
            }
            sibling = currentParent.right
            usedRotation = true
          }

          if (sibling) sibling.color = currentParent.color
          currentParent.color = 'black'
          if (sibling?.right) sibling.right.color = 'black'
          this.rotateLeft(currentParent)
          current = this.root
          currentParent = null
          usedRotation = true
        }
      } else if (currentParent) {
        let sibling = currentParent.left

        if (this.getColor(sibling) === 'red') {
          sibling!.color = 'black'
          currentParent.color = 'red'
          this.rotateRight(currentParent)
          sibling = currentParent.left
          usedRotation = true
        }

        if (this.getColor(sibling?.right ?? null) === 'black' && this.getColor(sibling?.left ?? null) === 'black') {
          if (sibling) sibling.color = 'red'
          current = currentParent
          currentParent = current.parent
          usedColorFlip = true
        } else {
          if (this.getColor(sibling?.left ?? null) === 'black') {
            if (sibling?.right) sibling.right.color = 'black'
            if (sibling) {
              sibling.color = 'red'
              this.rotateLeft(sibling)
            }
            sibling = currentParent.left
            usedRotation = true
          }

          if (sibling) sibling.color = currentParent.color
          currentParent.color = 'black'
          if (sibling?.left) sibling.left.color = 'black'
          this.rotateRight(currentParent)
          current = this.root
          currentParent = null
          usedRotation = true
        }
      } else {
        break
      }
    }

    if (current) current.color = 'black'
    if (this.root) this.root.color = 'black'
    if (usedColorFlip && usedRotation) return { type: '双旋', text: '删除黑节点后通过变色与旋转恢复黑高一致。' }
    if (usedRotation) return { type: '右旋', text: '删除黑节点后通过兄弟节点旋转完成修复。' }
    if (usedColorFlip) return { type: '变色', text: '删除黑节点后兄弟子树黑高不足，已通过变色向上修复。' }
    return { type: '变色', text: '删除后重新染黑替代节点，红黑树性质保持成立。' }
  }

  private rotateLeft(node: RedBlackTreeNode) {
    const pivot = node.right
    if (!pivot) return

    node.right = pivot.left
    if (pivot.left) pivot.left.parent = node
    pivot.parent = node.parent

    if (!node.parent) {
      this.root = pivot
    } else if (node === node.parent.left) {
      node.parent.left = pivot
    } else {
      node.parent.right = pivot
    }

    pivot.left = node
    node.parent = pivot
  }

  private rotateRight(node: RedBlackTreeNode) {
    const pivot = node.left
    if (!pivot) return

    node.left = pivot.right
    if (pivot.right) pivot.right.parent = node
    pivot.parent = node.parent

    if (!node.parent) {
      this.root = pivot
    } else if (node === node.parent.right) {
      node.parent.right = pivot
    } else {
      node.parent.left = pivot
    }

    pivot.right = node
    node.parent = pivot
  }

  private transplant(node: RedBlackTreeNode, replacement: RedBlackTreeNode | null) {
    if (!node.parent) {
      this.root = replacement
    } else if (node === node.parent.left) {
      node.parent.left = replacement
    } else {
      node.parent.right = replacement
    }

    if (replacement) replacement.parent = node.parent
  }

  private getColor(node: RedBlackTreeNode | null): RedBlackColor {
    return node?.color ?? 'black'
  }

  private createNode(value: number) {
    return new RedBlackTreeNode(this.nextNodeId++, value, this.width)
  }

  private findMin(node: RedBlackTreeNode) {
    let current = node
    while (current.left) current = current.left
    return current
  }

  private getDeleteCaseText(node: RedBlackTreeNode) {
    if (!node.left && !node.right) return node.color === 'red' ? '它是红色叶子节点，可直接移除。' : '它是黑色叶子节点，移除后需要修复黑高。'
    if (!node.left || !node.right) return '它只有一个子节点，由子节点接替并重新着色。'
    return '它有两个子节点，使用右子树最小节点接替后继续修复颜色。'
  }

  private traverseNode(node: RedBlackTreeNode | null, mode: RedBlackTraversalMode, nodes: RedBlackTreeNode[]) {
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
    this.width = Math.max(980, nodes.length * this.minNodeGap + 180)
    this.height = Math.max(480, depth * this.levelHeight + 140)

    let order = 0
    this.assignInorderX(this.root, () => 90 + order++ * this.minNodeGap)
    this.normalizeRootPosition()
  }

  private assignInorderX(node: RedBlackTreeNode | null, getX: () => number, depth = 0) {
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

  private getDepth(node: RedBlackTreeNode | null): number {
    if (!node) return 0
    return Math.max(this.getDepth(node.left), this.getDepth(node.right)) + 1
  }

  get nodes() {
    const nodes: RedBlackTreeNode[] = []
    this.collectNodes(this.root, nodes)
    return nodes
  }

  get edges() {
    const edges: RedBlackTreeEdge[] = []
    this.collectEdges(this.root, edges)
    return edges
  }

  get size() {
    return this.nodes.length
  }

  get blackHeight() {
    return this.getBlackHeight(this.root)
  }

  private getBlackHeight(node: RedBlackTreeNode | null): number {
    if (!node) return 1
    return Math.max(this.getBlackHeight(node.left), this.getBlackHeight(node.right)) + (node.color === 'black' ? 1 : 0)
  }

  private collectNodes(node: RedBlackTreeNode | null, nodes: RedBlackTreeNode[]) {
    if (!node) return
    nodes.push(node)
    this.collectNodes(node.left, nodes)
    this.collectNodes(node.right, nodes)
  }

  private collectEdges(node: RedBlackTreeNode | null, edges: RedBlackTreeEdge[]) {
    if (!node) return
    if (node.left) edges.push({ id: `${node.id}-${node.left.id}`, from: node, to: node.left })
    if (node.right) edges.push({ id: `${node.id}-${node.right.id}`, from: node, to: node.right })
    this.collectEdges(node.left, edges)
    this.collectEdges(node.right, edges)
  }
}
