export type TraversalMode = 'preorder' | 'inorder' | 'postorder'

// 用于图形化连线的数据结构，表示父节点到子节点的一条边。
export interface BinaryTreeEdge {
  id: string
  from: BinaryTreeNode
  to: BinaryTreeNode
}

// 插入操作的结果，包含是否插入成功、目标节点、父节点和查找路径。
type InsertResult =
  | { inserted: true; node: BinaryTreeNode; parent: BinaryTreeNode | null; path: BinaryTreeNode[] }
  | { inserted: false; node: BinaryTreeNode | null; parent: null; path: BinaryTreeNode[] }

// 查找操作的结果，node 为 null 表示未找到。
type SearchResult = { node: BinaryTreeNode | null; path: BinaryTreeNode[] }

// 删除操作的结果，caseText 用于说明当前节点对应的删除情况。
type RemoveResult =
  | { removed: true; node: BinaryTreeNode; path: BinaryTreeNode[]; caseText: string }
  | { removed: false; node: null; path: BinaryTreeNode[]; caseText: '' }

// 二叉树节点，保存节点值、左右子节点和图形化坐标。
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
    // 新节点先放在画布中间，后续 layout 会重新计算准确位置。
    this.x = treeWidth / 2
  }
}

// 二叉搜索树：左子树值小于当前节点，右子树值大于当前节点。
export class BinarySearchTree {
  root: BinaryTreeNode | null = null
  width = 920
  height = 420

  private nextNodeId = 1
  private readonly minNodeGap = 78
  private readonly levelHeight = 110


  // 插入新值，并返回插入过程中经过的路径，方便页面展示动画。
  insert(value: number): InsertResult {
    const path: BinaryTreeNode[] = []

    // 空树时，新节点直接成为根节点。
    if (!this.root) {
      this.root = this.createNode(value)
      this.layout()
      return { inserted: true, node: this.root, parent: null, path }
    }

    let current: BinaryTreeNode | null = this.root
    while (current) {
      path.push(current)

      // 二叉搜索树不插入重复值，直接返回已存在的节点。
      if (value === current.value) {
        return { inserted: false, node: current, parent: null, path }
      }

      // 小于当前节点时继续查找左子树。
      if (value < current.value) {
        if (!current.left) {
          current.left = this.createNode(value)
          path.push(current.left)
          this.layout()
          return { inserted: true, node: current.left, parent: current, path }
        }
        current = current.left
      } else {
        // 大于当前节点时继续查找右子树。
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

  // 按二叉搜索树规则查找目标值，并记录访问路径。
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

  // 删除目标值，删除成功后重新布局整棵树。
  remove(value: number): RemoveResult {
    const result = this.search(value)
    if (!result.node) return { removed: false, node: null, path: result.path, caseText: '' }

    const caseText = this.getDeleteCaseText(result.node)
    this.root = this.removeNode(this.root, value)
    this.layout()

    return { removed: true, node: result.node, path: result.path, caseText }
  }

  // 根据传入模式返回前序、中序或后序遍历结果。
  traverse(mode: TraversalMode) {
    const nodes: BinaryTreeNode[] = []
    this.traverseNode(this.root, mode, nodes)
    return nodes
  }

  // 清空树，并恢复画布和节点编号的初始状态。
  reset() {
    this.root = null
    this.width = 920
    this.height = 420
    this.nextNodeId = 1
  }

  // 创建带唯一 id 的新节点。
  private createNode(value: number) {
    return new BinaryTreeNode(this.nextNodeId++, value, this.width)
  }

  // 递归删除节点，并返回删除后当前子树的新根节点。
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

    // 没有左子树时，用右子树接替当前位置。
    if (!node.left) return node.right
    // 没有右子树时，用左子树接替当前位置。
    if (!node.right) return node.left

    // 有两个子节点时，用右子树中的最小节点作为后继节点。
    const successor = this.findMin(node.right)
    node.value = successor.value
    node.right = this.removeNode(node.right, successor.value)
    return node
  }

  // 找到当前子树中的最小节点。
  private findMin(node: BinaryTreeNode) {
    let current = node
    while (current.left) current = current.left
    return current
  }

  // 根据节点的子节点数量生成删除说明文案。
  private getDeleteCaseText(node: BinaryTreeNode) {
    if (!node.left && !node.right) return '它是叶子节点，直接移除。'
    if (!node.left || !node.right) return '它只有一个子节点，由子节点接替位置。'
    return '它有两个子节点，使用右子树最小节点接替。'
  }

  // 按指定遍历顺序递归收集节点。
  private traverseNode(node: BinaryTreeNode | null, mode: TraversalMode, nodes: BinaryTreeNode[]) {
    if (!node) return
    if (mode === 'preorder') nodes.push(node)
    this.traverseNode(node.left, mode, nodes)
    if (mode === 'inorder') nodes.push(node)
    this.traverseNode(node.right, mode, nodes)
    if (mode === 'postorder') nodes.push(node)
  }

  // 根据节点数量和树深度重新计算画布大小与节点坐标。
  private layout() {
    const nodes = this.nodes
    const depth = this.getDepth(this.root)
    this.width = Math.max(920, nodes.length * this.minNodeGap + 160)
    this.height = Math.max(420, depth * this.levelHeight + 120)

    let order = 0
    this.assignInorderX(this.root, () => 80 + order++ * this.minNodeGap)
    this.normalizeRootPosition()
  }

  // 用中序遍历给节点分配横坐标，保证左子树在左、右子树在右。
  private assignInorderX(node: BinaryTreeNode | null, getX: () => number, depth = 0) {
    if (!node) return
    this.assignInorderX(node.left, getX, depth + 1)
    node.x = getX()
    node.y = depth * this.levelHeight + 70
    this.assignInorderX(node.right, getX, depth + 1)
  }

  // 平移所有节点，让根节点保持在画布水平中间。
  private normalizeRootPosition() {
    if (!this.root) return
    const offset = this.width / 2 - this.root.x
    for (const node of this.nodes) node.x += offset
  }

  // 计算树的最大深度。
  private getDepth(node: BinaryTreeNode | null): number {
    if (!node) return 0
    return Math.max(this.getDepth(node.left), this.getDepth(node.right)) + 1
  }

  // 返回当前树中的所有节点。
  get nodes() {
    const nodes: BinaryTreeNode[] = []
    this.collectNodes(this.root, nodes)
    return nodes
  }

  // 返回当前树中的所有连线。
  get edges() {
    const edges: BinaryTreeEdge[] = []
    this.collectEdges(this.root, edges)
    return edges
  }

  // 返回当前树的节点数量。
  get size() {
    return this.nodes.length
  }

  // 递归收集节点。
  private collectNodes(node: BinaryTreeNode | null, nodes: BinaryTreeNode[]) {
    if (!node) return
    nodes.push(node)
    this.collectNodes(node.left, nodes)
    this.collectNodes(node.right, nodes)
  }

  // 递归收集父子节点之间的边。
  private collectEdges(node: BinaryTreeNode | null, edges: BinaryTreeEdge[]) {
    if (!node) return
    if (node.left) edges.push({ id: `${node.id}-${node.left.id}`, from: node, to: node.left })
    if (node.right) edges.push({ id: `${node.id}-${node.right.id}`, from: node, to: node.right })
    this.collectEdges(node.left, edges)
    this.collectEdges(node.right, edges)
  }
}
