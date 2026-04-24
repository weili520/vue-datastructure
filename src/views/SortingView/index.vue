<template>
  <main class="sorting-view">
    <section class="sorting-view__hero">
      <div>
        <p class="sorting-view__eyebrow">Sorting algorithms</p>
        <h1>经典排序算法可视化</h1>
        <p class="sorting-view__intro">
          左侧切换算法类型，右侧使用内置随机数据展示比较、交换、分区和归并过程，帮助观察不同排序策略的执行路径。
        </p>
      </div>
      <span class="sorting-view__status">{{ activeAlgorithm.complexity }}</span>
    </section>

    <section class="sorting-view__workspace">
      <aside class="sorting-view__panel">
        <div>
          <p class="sorting-view__panel-title">排序类型</p>
          <label class="sorting-view__field">
            <span>排序算法</span>
            <span class="sorting-view__select-wrap">
              <select v-model="activeAlgorithmKey" :disabled="isAnimating" @change="handleAlgorithmChange">
                <option v-for="algorithm in algorithms" :key="algorithm.key" :value="algorithm.key">
                  {{ algorithm.name }} · {{ algorithm.complexity }}
                </option>
              </select>
            </span>
          </label>
        </div>

        <div class="sorting-view__controls">
          <p class="sorting-view__panel-title">控制面板</p>
          <button class="sorting-view__button sorting-view__button--primary" type="button" :disabled="isAnimating" @click="runSort">
            开始演示
          </button>
          <button class="sorting-view__button" type="button" :disabled="!isAnimating" @click="togglePause">
            {{ isPaused ? '继续演示' : '暂停演示' }}
          </button>
          <label class="sorting-view__field">
            <span>播放间隔</span>
            <input v-model.number="stepDelay" type="number" min="80" max="2000" step="20" aria-label="播放间隔毫秒" />
            <small>单位：ms</small>
          </label>
          <button class="sorting-view__button" type="button" :disabled="isAnimating" @click="shuffleData">
            重新生成数据
          </button>
          <button class="sorting-view__button sorting-view__button--subtle" type="button" :disabled="isAnimating" @click="resetCurrentData">
            重置当前数据
          </button>
        </div>

        <div class="sorting-view__log">
          <p class="sorting-view__panel-title">当前步骤</p>
          <p>{{ notice }}</p>
          <span>{{ stepLabel }}</span>
        </div>
      </aside>

      <section class="sorting-view__canvas-card">
        <div class="sorting-view__canvas-head">
          <div>
            <p class="sorting-view__eyebrow">Visualization</p>
            <h2>{{ activeAlgorithm.name }}</h2>
            <p>{{ activeAlgorithm.description }}</p>
          </div>
          <span class="sorting-view__badge">{{ data.length }} 个元素</span>
        </div>

        <TransitionGroup class="sorting-view__bars" name="sorting-bars" tag="div" role="img" :aria-label="`${activeAlgorithm.name} 排序柱状图`">
          <div
            v-for="(item, index) in data"
            :key="item.id"
            class="sorting-view__bar-wrap"
          >
            <span
              class="sorting-view__bar"
              :class="barClass(index)"
              :style="{ height: `${item.value}%` }"
            >
              <span>{{ item.value }}</span>
            </span>
            <small>{{ index + 1 }}</small>
          </div>
        </TransitionGroup>

        <SortingInternalView :algorithm="activeAlgorithmKey" :values="data" :detail="currentDetail" />
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { SortingAlgorithms, type AdvancedSortStepDetail, type SortingAlgorithmKey } from '../../class/SortingAlgorithms'
import SortingInternalView from '../../components/SortingInternalView.vue'

type AlgorithmKey = SortingAlgorithmKey

type Algorithm = {
  key: AlgorithmKey
  name: string
  complexity: string
  description: string
}

const DEFAULT_STEP_DELAY = 420

const algorithms: Algorithm[] = [
  {
    key: 'bubble',
    name: '冒泡排序',
    complexity: 'O(n²)',
    description: '相邻元素两两比较，把较大的元素逐轮推向数组末尾。',
  },
  {
    key: 'selection',
    name: '选择排序',
    complexity: 'O(n²)',
    description: '每轮从未排序区间中选择最小值，放到当前起点位置。',
  },
  {
    key: 'insertion',
    name: '插入排序',
    complexity: 'O(n²)',
    description: '维护左侧有序区间，把当前元素插入到合适位置。',
  },
  {
    key: 'quick',
    name: '快速排序',
    complexity: '平均 O(n log n)',
    description: '选择基准值进行分区，再递归处理基准左右两侧。',
  },
  {
    key: 'merge',
    name: '归并排序',
    complexity: 'O(n log n)',
    description: '先递归拆分数组，再把局部有序结果合并为整体有序。',
  },
  {
    key: 'shell',
    name: '希尔排序',
    complexity: '平均 O(n log n)',
    description: '按递减间隔进行分组插入排序，让元素更快接近最终位置。',
  },
  {
    key: 'heap',
    name: '堆排序',
    complexity: 'O(n log n)',
    description: '先建立最大堆，再不断把堆顶最大值移动到数组末尾。',
  },
  {
    key: 'counting',
    name: '计数排序',
    complexity: 'O(n + k)',
    description: '统计数值出现次数，再按数值顺序回写得到有序结果。',
  },
  {
    key: 'bucket',
    name: '桶排序',
    complexity: '平均 O(n + k)',
    description: '把数据按值域分配到桶中，桶内排序后依次合并。',
  },
  {
    key: 'radix',
    name: '基数排序',
    complexity: 'O(d(n + k))',
    description: '按个位、十位等位次稳定分配和回写，逐位完成排序。',
  },
]

const initialData = ref(SortingAlgorithms.createRandomData())
const data = ref([...initialData.value])
const activeAlgorithmKey = ref<AlgorithmKey>('bubble')
const activeIndices = ref<number[]>([])
const sortedIndices = ref<number[]>([])
const notice = ref('选择一种排序算法后点击“开始演示”，观察随机数据如何逐步变为有序。')
const stepIndex = ref(0)
const totalSteps = ref(0)
const isAnimating = ref(false)
const isPaused = ref(false)
const stepDelay = ref(DEFAULT_STEP_DELAY)
const currentDetail = ref<AdvancedSortStepDetail | null>(null)

const activeAlgorithm = computed(() => {
  return algorithms.find((algorithm) => algorithm.key === activeAlgorithmKey.value) ?? algorithms[0]
})

const currentStepDelay = computed(() => Math.min(Math.max(stepDelay.value || DEFAULT_STEP_DELAY, 80), 2000))

const stepLabel = computed(() => {
  if (!totalSteps.value) return '尚未开始'
  return `第 ${stepIndex.value} / ${totalSteps.value} 步`
})

const handleAlgorithmChange = () => {
  resetCurrentData()
  notice.value = `已切换到${activeAlgorithm.value.name}，点击“开始演示”查看排序过程。`
}

const shuffleData = () => {
  initialData.value = SortingAlgorithms.createRandomData()
  resetCurrentData()
  notice.value = '已生成一组新的默认随机数据。'
}

const resetCurrentData = () => {
  data.value = initialData.value.map((item) => ({ ...item }))
  activeIndices.value = []
  sortedIndices.value = []
  stepIndex.value = 0
  totalSteps.value = 0
  currentDetail.value = null
  isPaused.value = false
}

const togglePause = () => {
  if (!isAnimating.value) return
  isPaused.value = !isPaused.value
}

const runSort = async () => {
  if (isAnimating.value) return

  isAnimating.value = true
  isPaused.value = false
  activeIndices.value = []
  sortedIndices.value = []
  currentDetail.value = null

  const steps = SortingAlgorithms.createSteps(activeAlgorithmKey.value, initialData.value)
  totalSteps.value = steps.length

  for (let index = 0; index < steps.length; index++) {
    const step = steps[index]
    data.value = step.values.map((item) => ({ ...item }))
    activeIndices.value = [...step.active]
    sortedIndices.value = [...step.sorted]
    currentDetail.value = step.detail ?? null
    notice.value = step.note
    stepIndex.value = index + 1
    await waitForNextStep()
  }

  activeIndices.value = []
  sortedIndices.value = data.value.map((_, index) => index)
  notice.value = `${activeAlgorithm.value.name}演示完成。`
  isPaused.value = false
  isAnimating.value = false
}

const barClass = (index: number) => {
  return {
    'sorting-view__bar--active': activeIndices.value.includes(index),
    'sorting-view__bar--sorted': sortedIndices.value.includes(index),
  }
}

const waitForNextStep = async () => {
  const tick = 40
  let elapsed = 0

  while (elapsed < currentStepDelay.value) {
    await wait(tick)
    if (!isPaused.value) elapsed += tick
  }
}

const wait = (ms: number) => {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
</script>

<style scoped lang="scss">
@import url('./index.scss');
</style>
