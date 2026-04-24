<template>
  <main class="red-black-tree">
    <section class="red-black-tree__hero">
      <div>
        <p class="red-black-tree__eyebrow">Red-black tree</p>
        <h1>红黑树可视化</h1>
        <p class="red-black-tree__intro">
          插入、删除或搜索整数时高亮访问路径，并展示变色、旋转和三种深度优先遍历结果。
        </p>
      </div>
      <span class="red-black-tree__status">{{ statusText }}</span>
    </section>

    <section class="red-black-tree__workspace">
      <aside class="red-black-tree__panel">
        <label class="red-black-tree__field-label" for="red-black-tree-value">节点值</label>
        <input
          id="red-black-tree-value"
          v-model.trim="inputValue"
          class="red-black-tree__input"
          type="number"
          placeholder="例如 41"
          :disabled="isAnimating"
          @keyup.enter="insertValue"
        />

        <div class="red-black-tree__button-grid">
          <button class="red-black-tree__button red-black-tree__button--primary" type="button" :disabled="isAnimating" @click="insertValue">
            插入
          </button>
          <button class="red-black-tree__button" type="button" :disabled="isAnimating" @click="deleteValue">
            删除
          </button>
          <button class="red-black-tree__button" type="button" :disabled="isAnimating" @click="searchValue">
            搜索
          </button>
          <button class="red-black-tree__button red-black-tree__button--subtle" type="button" :disabled="isAnimating" @click="resetTree">
            重置
          </button>
        </div>

        <div class="red-black-tree__traversal">
          <p class="red-black-tree__panel-title">遍历演示</p>
          <div class="red-black-tree__button-grid red-black-tree__button-grid--compact">
            <button class="red-black-tree__button" type="button" :disabled="isAnimating || !tree.root" @click="runTraversal('preorder')">
              先序
            </button>
            <button class="red-black-tree__button" type="button" :disabled="isAnimating || !tree.root" @click="runTraversal('inorder')">
              中序
            </button>
            <button class="red-black-tree__button" type="button" :disabled="isAnimating || !tree.root" @click="runTraversal('postorder')">
              后序
            </button>
          </div>
          <div class="red-black-tree__result" :class="{ 'red-black-tree__result--empty': !traversalResult.length }">
            <span v-if="traversalResult.length">{{ traversalResult.join(' -> ') }}</span>
            <span v-else>点击遍历按钮查看访问顺序</span>
          </div>
        </div>

        <div class="red-black-tree__legend">
          <p class="red-black-tree__panel-title">颜色规则</p>
          <span><i class="red-black-tree__dot red-black-tree__dot--black" />根节点和叶子 NIL 视为黑色</span>
          <span><i class="red-black-tree__dot red-black-tree__dot--red" />红节点不能连续相邻</span>
        </div>

        <div class="red-black-tree__log">
          <p class="red-black-tree__panel-title">当前步骤</p>
          <p>{{ notice }}</p>
        </div>
      </aside>

      <section class="red-black-tree__canvas-card">
        <div class="red-black-tree__canvas-head">
          <div>
            <p class="red-black-tree__eyebrow">Visualization</p>
            <h2>红黑树结构动画</h2>
          </div>
          <span v-if="traversalMode" class="red-black-tree__mode-badge">{{ getTraversalName(traversalMode) }}</span>
          <span v-else-if="balanceText" class="red-black-tree__mode-badge">{{ balanceText }}</span>
        </div>

        <div class="red-black-tree__canvas-scroll">
          <svg class="red-black-tree__svg" :viewBox="`0 0 ${tree.width} ${tree.height}`" role="img">
            <title>红黑树图形展示</title>
            <g class="red-black-tree__edges">
              <line
                v-for="edge in treeEdges"
                :key="edge.id"
                :x1="edge.from.x"
                :y1="edge.from.y"
                :x2="edge.to.x"
                :y2="edge.to.y"
              />
            </g>
            <g class="red-black-tree__nodes">
              <g
                v-for="node in treeNodes"
                :key="node.id"
                class="red-black-tree__node"
                :class="nodeClass(node)"
                :transform="`translate(${node.x}, ${node.y})`"
              >
                <circle :r="NODE_RADIUS" />
                <text class="red-black-tree__node-value" dy="5">{{ node.value }}</text>
                <text class="red-black-tree__node-meta" dy="43">{{ node.colorLabel }}</text>
              </g>
            </g>
          </svg>

          <div v-if="!tree.root" class="red-black-tree__empty">
            输入整数并点击“插入”，红黑树会用变色和旋转保持近似平衡。
          </div>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RedBlackTree, type RedBlackTraversalMode, type RedBlackTreeNode } from '../../class/RedBlackTree'

const STEP_DELAY = 420
const NODE_RADIUS = 25

const tree = reactive(new RedBlackTree())
const treeNodes = computed(() => tree.nodes)
const treeEdges = computed(() => tree.edges)

const statusText = computed(() => {
  if (!tree.root) return '空树'
  return `${tree.size} 个节点 / 黑高 ${tree.blackHeight}`
})

const inputValue = ref('')
const notice = ref('可以依次插入 41、38、31、12、19、8，观察红黑树如何变色和旋转。')
const isAnimating = ref(false)
const activeIds = ref<number[]>([])
const foundId = ref<number | null>(null)
const traversalResult = ref<number[]>([])
const traversalMode = ref<RedBlackTraversalMode | ''>('')
const balanceText = ref('')

const normalizeValue = () => {
  if (inputValue.value === '') {
    notice.value = '请输入一个整数。'
    return null
  }

  const value = Number(inputValue.value)
  if (!Number.isInteger(value)) {
    notice.value = '请输入一个整数。'
    return null
  }
  return value
}

const insertValue = async () => {
  const value = normalizeValue()
  if (value === null || isAnimating.value) return

  resetVisualState()
  isAnimating.value = true

  const result = tree.insert(value)
  await highlightProgress(result.path)

  if (!result.inserted) {
    foundId.value = result.node?.id ?? null
    notice.value = `${value} 已存在，红黑树不插入重复值。`
    finishAction()
    return
  }

  foundId.value = result.node.id
  balanceText.value = result.balance?.type ?? ''
  notice.value = result.balance ? `已插入 ${value}，${result.balance.text}` : `已插入 ${value}，根节点保持黑色。`
  inputValue.value = ''
  finishAction()
}

const searchValue = async () => {
  const value = normalizeValue()
  if (value === null || isAnimating.value) return

  resetVisualState()
  isAnimating.value = true

  const result = tree.search(value)
  await highlightProgress(result.path)

  if (result.node) {
    foundId.value = result.node.id
    notice.value = `找到 ${value}，搜索路径为 ${formatPath(result.path)}。`
    inputValue.value = ''
    finishAction()
    return
  }

  notice.value = `${value} 不在树中，搜索路径为 ${formatPath(result.path) || '空'}。`
  finishAction()
}

const deleteValue = async () => {
  const value = normalizeValue()
  if (value === null || isAnimating.value) return

  resetVisualState()
  isAnimating.value = true

  const searchResult = tree.search(value)
  await highlightProgress(searchResult.path)

  if (!searchResult.node) {
    notice.value = `${value} 不在树中，无法删除。`
    finishAction()
    return
  }

  foundId.value = searchResult.node.id
  await wait(STEP_DELAY)

  const removeResult = tree.remove(value)
  balanceText.value = removeResult.balance?.type ?? ''
  notice.value = removeResult.balance
    ? `已删除 ${value}，${removeResult.caseText}${removeResult.balance.text}`
    : `已删除 ${value}，${removeResult.caseText}红黑树性质保持成立。`
  inputValue.value = ''
  finishAction()
}

const runTraversal = async (mode: RedBlackTraversalMode) => {
  if (!tree.root || isAnimating.value) return

  resetVisualState()
  isAnimating.value = true
  traversalMode.value = mode
  traversalResult.value = []

  for (const node of tree.traverse(mode)) {
    traversalResult.value.push(node.value)
    activeIds.value = [node.id]
    await wait(STEP_DELAY)
  }

  notice.value = `${getTraversalName(mode)}遍历结果：${traversalResult.value.join(' -> ')}。`
  activeIds.value = []
  isAnimating.value = false
}

const resetTree = () => {
  if (isAnimating.value) return
  tree.reset()
  activeIds.value = []
  foundId.value = null
  traversalResult.value = []
  traversalMode.value = ''
  balanceText.value = ''
  inputValue.value = ''
  notice.value = '树已清空，可以重新插入节点。'
}

const highlightProgress = async (path: RedBlackTreeNode[]) => {
  for (let index = 1; index <= path.length; index++) {
    activeIds.value = path.slice(0, index).map((node) => node.id)
    await wait(STEP_DELAY)
  }
}

const resetVisualState = () => {
  activeIds.value = []
  foundId.value = null
  traversalResult.value = []
  traversalMode.value = ''
  balanceText.value = ''
}

const finishAction = () => {
  isAnimating.value = false
}

const nodeClass = (node: RedBlackTreeNode) => {
  return {
    'red-black-tree__node--red': node.color === 'red',
    'red-black-tree__node--black': node.color === 'black',
    'red-black-tree__node--active': activeIds.value.includes(node.id),
    'red-black-tree__node--found': foundId.value === node.id,
  }
}

const getTraversalName = (mode: RedBlackTraversalMode) => {
  return {
    preorder: '先序',
    inorder: '中序',
    postorder: '后序',
  }[mode]
}

const formatPath = (path: RedBlackTreeNode[]) => {
  return path.map((node) => node.value).join(' -> ')
}

const wait = (ms: number) => {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
</script>

<style scoped lang="scss">
@import url('./index.scss');
</style>
