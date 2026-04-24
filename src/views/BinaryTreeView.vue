<template>
  <main class="binary-tree">
    <section class="binary-tree__hero">
      <div>
        <p class="binary-tree__eyebrow">Binary search tree</p>
        <h1>二叉搜索树可视化</h1>
        <p class="binary-tree__intro">
          输入整数后执行插入、删除或搜索，页面会高亮算法走过的路径，并展示三种深度优先遍历结果。
        </p>
      </div>
      <span class="binary-tree__status">{{ statusText }}</span>
    </section>

    <section class="binary-tree__workspace">
      <aside class="binary-tree__panel">
        <label class="binary-tree__field-label" for="tree-value">节点值</label>
        <div class="binary-tree__input-row">
          <input
            id="tree-value"
            v-model.trim="inputValue"
            class="binary-tree__input"
            type="number"
            placeholder="例如 42"
            :disabled="isAnimating"
            @keyup.enter="insertValue"
          />
        </div>

        <div class="binary-tree__button-grid">
          <button
            class="binary-tree__button binary-tree__button--primary"
            type="button"
            :disabled="isAnimating"
            @click="insertValue"
          >
            插入
          </button>
          <button class="binary-tree__button" type="button" :disabled="isAnimating" @click="deleteValue">
            删除
          </button>
          <button class="binary-tree__button" type="button" :disabled="isAnimating" @click="searchValue">
            搜索
          </button>
          <button
            class="binary-tree__button binary-tree__button--subtle"
            type="button"
            :disabled="isAnimating"
            @click="resetTree"
          >
            重置
          </button>
        </div>

        <div class="binary-tree__traversal">
          <p class="binary-tree__panel-title">遍历演示</p>
          <div class="binary-tree__button-grid binary-tree__button-grid--compact">
            <button class="binary-tree__button" type="button" :disabled="isAnimating || !tree.root" @click="runTraversal('preorder')">
              先序
            </button>
            <button class="binary-tree__button" type="button" :disabled="isAnimating || !tree.root" @click="runTraversal('inorder')">
              中序
            </button>
            <button class="binary-tree__button" type="button" :disabled="isAnimating || !tree.root" @click="runTraversal('postorder')">
              后序
            </button>
          </div>
          <div class="binary-tree__result" :class="{ 'binary-tree__result--empty': !traversalResult.length }">
            <span v-if="traversalResult.length">{{ traversalResult.join(' -> ') }}</span>
            <span v-else>点击遍历按钮查看访问顺序</span>
          </div>
        </div>

        <div class="binary-tree__log">
          <p class="binary-tree__panel-title">当前步骤</p>
          <p>{{ notice }}</p>
        </div>
      </aside>

      <section class="binary-tree__canvas-card">
        <div class="binary-tree__canvas-head">
          <div>
            <p class="binary-tree__eyebrow">Visualization</p>
            <h2>树结构动画</h2>
          </div>
          <span v-if="traversalMode" class="binary-tree__mode-badge">{{ getTraversalName(traversalMode) }}</span>
        </div>

        <div class="binary-tree__canvas-scroll">
          <svg class="binary-tree__svg" :viewBox="`0 0 ${tree.width} ${tree.height}`" role="img">
            <title>二叉搜索树图形展示</title>
            <g class="binary-tree__edges">
              <line
                v-for="edge in treeEdges"
                :key="edge.id"
                :x1="edge.from.x"
                :y1="edge.from.y"
                :x2="edge.to.x"
                :y2="edge.to.y"
              />
            </g>
            <g class="binary-tree__nodes">
              <g
                v-for="node in treeNodes"
                :key="node.id"
                class="binary-tree__node"
                :class="nodeClass(node)"
                :transform="`translate(${node.x}, ${node.y})`"
              >
                <circle :r="NODE_RADIUS" />
                <text dy="6">{{ node.value }}</text>
              </g>
            </g>
          </svg>

          <div v-if="!tree.root" class="binary-tree__empty">
            输入一个整数并点击“插入”，第一颗节点会成为根节点。
          </div>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { BinarySearchTree, type BinaryTreeNode, type TraversalMode } from '../class/BinarySearchTree'

const STEP_DELAY = 420
const NODE_RADIUS = 24

const tree = reactive(new BinarySearchTree())
const treeNodes = computed(() => tree.nodes)
const treeEdges = computed(() => tree.edges)

const statusText = computed(() => {
  if (!tree.root) return '空树'
  return `${tree.size} 个节点`
})

const inputValue = ref('')
const notice = ref('先插入几个数字，观察二叉搜索树如何按大小关系生长。')

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

const isAnimating = ref(false)
const foundId = ref<number | null>(null)

const insertValue = async () => {
  const value = normalizeValue()
  if (value === null || isAnimating.value) return

  resetVisualState()
  isAnimating.value = true

  const result = tree.insert(value)
  await highlightProgress(result.path)

  if (!result.inserted) {
    foundId.value = result.node?.id ?? null
    notice.value = `${value} 已存在，二叉搜索树不插入重复值。`
    finishAction()
    return
  }

  foundId.value = result.node.id
  notice.value = result.parent
    ? `${value} ${value < result.parent.value ? '小于' : '大于'} ${result.parent.value}，插入到${value < result.parent.value ? '左' : '右'}子树。`
    : `${value} 成为根节点。`
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
  notice.value = `已删除 ${value}，${removeResult.caseText}`
  inputValue.value = ''
  finishAction()
}

const activeIds = ref<number[]>([])
const traversalResult = ref<number[]>([])
const traversalMode = ref<TraversalMode | ''>('')
const runTraversal = async (mode: TraversalMode) => {
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
  inputValue.value = ''
  notice.value = '树已清空，可以重新插入节点。'
}

const highlightProgress = async (path: BinaryTreeNode[]) => {
  for (let index = 1; index <= path.length; index++) {
    await highlightPath(path.slice(0, index))
  }
}

const highlightPath = async (path: BinaryTreeNode[]) => {
  activeIds.value = path.map((node) => node.id)
  await wait(STEP_DELAY)
}

const resetVisualState = () => {
  activeIds.value = []
  foundId.value = null
  traversalResult.value = []
  traversalMode.value = ''
}

const finishAction = () => {
  isAnimating.value = false
}

const nodeClass = (node: BinaryTreeNode) => {
  return {
    'binary-tree__node--active': activeIds.value.includes(node.id),
    'binary-tree__node--found': foundId.value === node.id,
  }
}

const getTraversalName = (mode: TraversalMode) => {
  return {
    preorder: '先序',
    inorder: '中序',
    postorder: '后序',
  }[mode]
}

const formatPath = (path: BinaryTreeNode[]) => {
  return path.map((node) => node.value).join(' -> ')
}

const wait = (ms: number) => {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
</script>


<style scoped lang="scss">
.binary-tree {
  min-height: calc(100svh - 58px);
  padding: 32px clamp(16px, 4vw, 64px) 48px;
  background: linear-gradient(180deg, var(--ps-white), var(--ps-mist));
  text-align: left;

  &__hero,
  &__workspace,
  &__panel,
  &__canvas-card,
  &__log,
  &__traversal {
    box-sizing: border-box;
  }

  &__hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 32px;
    border-radius: 24px;
    background: linear-gradient(180deg, var(--ps-shadow-black), var(--ps-black));
    padding: 24px;
    color: var(--ps-white);
    box-shadow: var(--ps-shadow-80);

    h1 {
      margin: 8px 0 16px;
      color: var(--ps-white);
      font-size: 27px;
    }

    .binary-tree__eyebrow {
      color: var(--ps-white);
    }
  }

  &__eyebrow,
  &__panel-title {
    color: var(--ps-blue-dark);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.14px;
  }

  &__intro {
    color: var(--ps-white);
  }

  &__status,
  &__mode-badge {
    flex: 0 0 auto;
    border-radius: 999px;
    background: var(--ps-white);
    color: var(--ps-blue);
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 700;
  }

  &__workspace {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 24px;
    margin-top: 48px;
  }

  &__panel,
  &__canvas-card {
    border-radius: 24px;
    background: var(--ps-white);
    box-shadow: var(--ps-shadow-06);
  }

  &__panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
  }

  &__field-label {
    display: block;
    margin-bottom: 8px;
    color: var(--ps-charcoal);
    font-weight: 500;
  }

  &__input {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--ps-muted);
    border-radius: 3px;
    background: var(--ps-white);
    color: var(--ps-charcoal);
    padding: 12px;
    font-size: 16px;
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease;

    &::placeholder {
      color: rgba(0, 0, 0, 0.6);
    }

    &:focus {
      border-color: var(--ps-muted);
      outline: 0;
      box-shadow: var(--ps-ring);
    }
  }

  &__button-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;

    &--compact {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  &__button {
    border: 0;
    border-radius: 999px;
    background: var(--ps-blue);
    color: var(--ps-white);
    cursor: pointer;
    padding: 12px 18px;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 0.4px;
    white-space: nowrap;
    transition:
      background 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease,
      color 180ms ease,
      opacity 180ms ease,
      transform 180ms ease;

    &:hover:not(:disabled),
    &:focus-visible {
      border: 2px solid var(--ps-white);
      outline: 0;
      background: var(--ps-cyan);
      color: var(--ps-white);
      box-shadow: var(--ps-ring);
      transform: scale(1.2);
    }

    &:active:not(:disabled) {
      opacity: 0.6;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    &:not(.binary-tree__button--primary) {
      border: 1px solid #dedede;
      background: transparent;
      color: var(--ps-charcoal);
      font-size: 16px;
      letter-spacing: 0.1px;
    }

    &--primary {
      background: var(--ps-blue);
    }

    &--subtle {
      color: var(--ps-gray);
    }
  }

  &__traversal,
  &__log {
    border-radius: 19px;
    background: var(--ps-white);
    padding: 20px;
    box-shadow: var(--ps-shadow-06);

    .binary-tree__panel-title {
      margin-bottom: 12px;
    }
  }

  &__result {
    min-height: 24px;
    margin-top: 12px;
    border-radius: 12px;
    background: var(--ps-mist);
    color: var(--ps-charcoal);
    padding: 12px;
    font-size: 14px;
    font-weight: 500;
    word-break: break-word;

    &--empty {
      color: var(--ps-gray);
    }
  }

  &__canvas-card {
    min-width: 0;
    overflow: hidden;
  }

  &__canvas-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 24px 32px;
    border-bottom: 1px solid var(--ps-divider);

    h2 {
      margin: 4px 0 0;
    }
  }

  &__canvas-scroll {
    position: relative;
    min-height: 520px;
    overflow: auto;
    background: var(--ps-white);
  }

  &__svg {
    display: block;
    width: 100%;
    min-width: 920px;
    height: 560px;
  }

  &__edges {
    line {
      stroke: var(--ps-muted);
      stroke-linecap: round;
      stroke-width: 2;
      transition: all 350ms ease;
    }
  }

  &__node {
    transition: transform 350ms ease;

    circle {
      fill: var(--ps-white);
      stroke: var(--ps-muted);
      stroke-width: 2;
      filter: drop-shadow(0 5px 9px rgba(0, 0, 0, 0.08));
      transition:
        fill 180ms ease,
        stroke 180ms ease,
        stroke-width 180ms ease;
    }

    text {
      fill: var(--ps-charcoal);
      font-size: 16px;
      font-weight: 700;
      text-anchor: middle;
      pointer-events: none;
    }

    &--active {
      circle {
        fill: var(--ps-blue);
        stroke: var(--ps-white);
        stroke-width: 3;
      }

      text {
        fill: var(--ps-white);
      }
    }

    &--found {
      circle {
        fill: var(--ps-cyan);
        stroke: var(--ps-blue);
        stroke-width: 4;
      }

      text {
        fill: var(--ps-white);
      }
    }
  }

  &__empty {
    position: absolute;
    inset: 50% auto auto 50%;
    width: min(360px, calc(100% - 40px));
    transform: translate(-50%, -50%);
    border: 1px dashed var(--ps-muted);
    border-radius: 24px;
    background: var(--ps-white);
    color: var(--ps-gray);
    padding: 24px;
    text-align: center;
    box-shadow: var(--ps-shadow-06);
  }

  @media (max-width: 1024px) {
    &__workspace {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 767px) {
    padding: 32px 16px;

    &__hero,
    &__workspace {
      display: flex;
      flex-direction: column;
    }

    &__hero {
      padding: 32px 24px;
    }

    &__button-grid--compact {
      grid-template-columns: 1fr;
    }

    &__canvas-head {
      padding: 20px;
    }
  }
}
</style>
