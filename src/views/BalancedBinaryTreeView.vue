<template>
  <main class="balanced-tree">
    <section class="balanced-tree__hero">
      <div>
        <p class="balanced-tree__eyebrow">AVL tree</p>
        <h1>平衡二叉树可视化</h1>
        <p class="balanced-tree__intro">
          插入、删除或搜索整数时展示访问路径，节点会在失衡后通过 LL、RR、LR、RL 旋转恢复平衡。
        </p>
      </div>
      <span class="balanced-tree__status">{{ statusText }}</span>
    </section>

    <section class="balanced-tree__workspace">
      <aside class="balanced-tree__panel">
        <label class="balanced-tree__field-label" for="balanced-tree-value">节点值</label>
        <input
          id="balanced-tree-value"
          v-model.trim="inputValue"
          class="balanced-tree__input"
          type="number"
          placeholder="例如 30"
          :disabled="isAnimating"
          @keyup.enter="insertValue"
        />

        <div class="balanced-tree__button-grid">
          <button class="balanced-tree__button balanced-tree__button--primary" type="button" :disabled="isAnimating" @click="insertValue">
            插入
          </button>
          <button class="balanced-tree__button" type="button" :disabled="isAnimating" @click="deleteValue">
            删除
          </button>
          <button class="balanced-tree__button" type="button" :disabled="isAnimating" @click="searchValue">
            搜索
          </button>
          <button class="balanced-tree__button balanced-tree__button--subtle" type="button" :disabled="isAnimating" @click="resetTree">
            重置
          </button>
        </div>

        <div class="balanced-tree__traversal">
          <p class="balanced-tree__panel-title">遍历演示</p>
          <div class="balanced-tree__button-grid balanced-tree__button-grid--compact">
            <button class="balanced-tree__button" type="button" :disabled="isAnimating || !tree.root" @click="runTraversal('preorder')">
              先序
            </button>
            <button class="balanced-tree__button" type="button" :disabled="isAnimating || !tree.root" @click="runTraversal('inorder')">
              中序
            </button>
            <button class="balanced-tree__button" type="button" :disabled="isAnimating || !tree.root" @click="runTraversal('postorder')">
              后序
            </button>
          </div>
          <div class="balanced-tree__result" :class="{ 'balanced-tree__result--empty': !traversalResult.length }">
            <span v-if="traversalResult.length">{{ traversalResult.join(' -> ') }}</span>
            <span v-else>点击遍历按钮查看访问顺序</span>
          </div>
        </div>

        <div class="balanced-tree__log">
          <p class="balanced-tree__panel-title">当前步骤</p>
          <p>{{ notice }}</p>
        </div>
      </aside>

      <section class="balanced-tree__canvas-card">
        <div class="balanced-tree__canvas-head">
          <div>
            <p class="balanced-tree__eyebrow">Visualization</p>
            <h2>AVL 结构动画</h2>
          </div>
          <span v-if="traversalMode" class="balanced-tree__mode-badge">{{ getTraversalName(traversalMode) }}</span>
          <span v-else-if="rotationText" class="balanced-tree__mode-badge">{{ rotationText }}</span>
        </div>

        <div class="balanced-tree__canvas-scroll">
          <svg class="balanced-tree__svg" :viewBox="`0 0 ${tree.width} ${tree.height}`" role="img">
            <title>平衡二叉树图形展示</title>
            <g class="balanced-tree__edges">
              <line
                v-for="edge in treeEdges"
                :key="edge.id"
                :x1="edge.from.x"
                :y1="edge.from.y"
                :x2="edge.to.x"
                :y2="edge.to.y"
              />
            </g>
            <g class="balanced-tree__nodes">
              <g
                v-for="node in treeNodes"
                :key="node.id"
                class="balanced-tree__node"
                :class="nodeClass(node)"
                :transform="`translate(${node.x}, ${node.y})`"
              >
                <circle :r="NODE_RADIUS" />
                <text class="balanced-tree__node-value" dy="5">{{ node.value }}</text>
                <text class="balanced-tree__node-meta" dy="42">h{{ node.height }} / bf{{ node.balanceFactor }}</text>
              </g>
            </g>
          </svg>

          <div v-if="!tree.root" class="balanced-tree__empty">
            输入整数并点击“插入”，AVL 树会在失衡时自动旋转。
          </div>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  BalancedBinarySearchTree,
  type BalancedTraversalMode,
  type BalancedTreeNode,
} from '../class/BalancedBinarySearchTree'

const STEP_DELAY = 420
const NODE_RADIUS = 25

const tree = reactive(new BalancedBinarySearchTree())
const treeNodes = computed(() => tree.nodes)
const treeEdges = computed(() => tree.edges)

const statusText = computed(() => {
  if (!tree.root) return '空树'
  return `${tree.size} 个节点 / 高度 ${tree.root.height}`
})

const inputValue = ref('')
const notice = ref('插入 30、20、10 或 10、30、20，可以观察不同旋转如何恢复平衡。')
const isAnimating = ref(false)
const activeIds = ref<number[]>([])
const foundId = ref<number | null>(null)
const traversalResult = ref<number[]>([])
const traversalMode = ref<BalancedTraversalMode | ''>('')
const rotationText = ref('')

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
    notice.value = `${value} 已存在，AVL 树不插入重复值。`
    finishAction()
    return
  }

  foundId.value = result.node.id
  rotationText.value = result.rotation?.type ?? ''
  notice.value = result.rotation ? `已插入 ${value}，${result.rotation.text}` : `已插入 ${value}，当前仍满足 AVL 平衡条件。`
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
  rotationText.value = removeResult.rotation?.type ?? ''
  notice.value = removeResult.rotation
    ? `已删除 ${value}，${removeResult.caseText}${removeResult.rotation.text}`
    : `已删除 ${value}，${removeResult.caseText}当前仍满足 AVL 平衡条件。`
  inputValue.value = ''
  finishAction()
}

const runTraversal = async (mode: BalancedTraversalMode) => {
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
  rotationText.value = ''
  inputValue.value = ''
  notice.value = '树已清空，可以重新插入节点。'
}

const highlightProgress = async (path: BalancedTreeNode[]) => {
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
  rotationText.value = ''
}

const finishAction = () => {
  isAnimating.value = false
}

const nodeClass = (node: BalancedTreeNode) => {
  return {
    'balanced-tree__node--active': activeIds.value.includes(node.id),
    'balanced-tree__node--found': foundId.value === node.id,
  }
}

const getTraversalName = (mode: BalancedTraversalMode) => {
  return {
    preorder: '先序',
    inorder: '中序',
    postorder: '后序',
  }[mode]
}

const formatPath = (path: BalancedTreeNode[]) => {
  return path.map((node) => node.value).join(' -> ')
}

const wait = (ms: number) => {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
</script>

<style scoped lang="scss">
.balanced-tree {
  min-height: calc(100svh - 58px);
  padding: 32px clamp(16px, 4vw, 64px) 48px;
  background:
    radial-gradient(circle at 18% 16%, rgba(30, 174, 219, 0.12), transparent 28%),
    linear-gradient(180deg, var(--ps-white), var(--ps-mist));
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
    background: linear-gradient(135deg, #051017, var(--ps-black) 52%, #053a55);
    padding: 24px;
    color: var(--ps-white);
    box-shadow: var(--ps-shadow-80);

    h1 {
      margin: 8px 0 16px;
      color: var(--ps-white);
      font-size: 27px;
    }

    .balanced-tree__eyebrow {
      color: var(--ps-white);
    }
  }

  &__eyebrow,
  &__panel-title {
    color: var(--ps-blue-dark);
    font-size: 14px;
    font-weight: 700;
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
    grid-template-columns: 330px minmax(0, 1fr);
    gap: 24px;
    margin-top: 40px;
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
    color: var(--ps-charcoal);
    font-weight: 500;
  }

  &__input {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--ps-muted);
    border-radius: 12px;
    background: var(--ps-white);
    color: var(--ps-charcoal);
    padding: 12px 14px;
    font-size: 16px;
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease;

    &:focus {
      border-color: var(--ps-blue);
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
    border: 1px solid #dedede;
    border-radius: 999px;
    background: transparent;
    color: var(--ps-charcoal);
    cursor: pointer;
    padding: 12px 18px;
    font-size: 16px;
    font-weight: 500;
    white-space: nowrap;
    transition:
      background 180ms ease,
      box-shadow 180ms ease,
      color 180ms ease,
      opacity 180ms ease,
      transform 180ms ease;

    &:hover:not(:disabled),
    &:focus-visible {
      outline: 0;
      background: var(--ps-cyan);
      color: var(--ps-white);
      box-shadow: var(--ps-ring);
      transform: translateY(-1px);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    &--primary {
      border-color: var(--ps-blue);
      background: var(--ps-blue);
      color: var(--ps-white);
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

    .balanced-tree__panel-title {
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
    min-height: 560px;
    overflow: auto;
    background:
      linear-gradient(rgba(0, 112, 204, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 112, 204, 0.04) 1px, transparent 1px),
      var(--ps-white);
    background-size: 28px 28px;
  }

  &__svg {
    display: block;
    width: 100%;
    min-width: 960px;
    height: 590px;
  }

  &__edges {
    line {
      stroke: rgba(0, 112, 204, 0.38);
      stroke-linecap: round;
      stroke-width: 2;
      transition: all 350ms ease;
    }
  }

  &__node {
    transition: transform 350ms ease;

    circle {
      fill: var(--ps-white);
      stroke: var(--ps-blue);
      stroke-width: 2;
      filter: drop-shadow(0 5px 9px rgba(0, 0, 0, 0.08));
      transition:
        fill 180ms ease,
        stroke 180ms ease,
        stroke-width 180ms ease;
    }

    text {
      text-anchor: middle;
      pointer-events: none;
    }

    &-value {
      fill: var(--ps-charcoal);
      font-size: 16px;
      font-weight: 700;
    }

    &-meta {
      fill: var(--ps-gray);
      font-size: 12px;
      font-weight: 700;
    }

    &--active {
      circle {
        fill: var(--ps-blue);
        stroke: var(--ps-white);
        stroke-width: 3;
      }

      .balanced-tree__node-value {
        fill: var(--ps-white);
      }
    }

    &--found {
      circle {
        fill: var(--ps-cyan);
        stroke: var(--ps-blue);
        stroke-width: 4;
      }

      .balanced-tree__node-value {
        fill: var(--ps-white);
      }
    }
  }

  &__empty {
    position: absolute;
    inset: 50% auto auto 50%;
    width: min(380px, calc(100% - 40px));
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
