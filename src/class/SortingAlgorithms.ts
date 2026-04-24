export type SortingAlgorithmKey = 'bubble' | 'selection' | 'insertion' | 'quick' | 'merge' | AdvancedSortingAlgorithmKey

export type AdvancedSortingAlgorithmKey = 'shell' | 'heap' | 'counting' | 'bucket' | 'radix'

export type SortPhase = 'group' | 'compare' | 'swap' | 'count' | 'bucket' | 'sort' | 'write' | 'done'

export interface SortBucket {
  label: string
  range?: string
  items: SortItem[]
}

export type AdvancedSortStepDetail =
  | {
      type: 'shell'
      phase: SortPhase
      gap: number
      groups: number[][]
      currentGroup: number[]
      compare: number[]
    }
  | {
      type: 'heap'
      phase: SortPhase
      heapSize: number
      rootIndex?: number
      compare: number[]
      swap: number[]
      sortedStart: number
    }
  | {
      type: 'counting'
      phase: SortPhase
      min: number
      max: number
      counts: number[]
      currentValue?: number
      writeIndex?: number
      output: SortItem[]
    }
  | {
      type: 'bucket'
      phase: SortPhase
      buckets: SortBucket[]
      currentValue?: number
      targetBucket?: number
      activeBucket?: number
    }
  | {
      type: 'radix'
      phase: SortPhase
      place: number
      buckets: SortBucket[]
      currentValue?: number
      targetBucket?: number
    }

// 柱状图中的单个数据项，id 用于保持交换动画的稳定 key。
export interface SortItem {
  id: number
  value: number
}

// 每一步快照描述当前数组、活跃位置、已确定位置、文案和高级算法内部状态。
export interface SortStep {
  values: SortItem[]
  active: number[]
  sorted: number[]
  note: string
  detail?: AdvancedSortStepDetail
}
export class AdvancedSortingAlgorithms {
  static createSteps(key: SortingAlgorithmKey, values: SortItem[]) {
    return {
      shell: AdvancedSortingAlgorithms.createShellSteps,
      heap: AdvancedSortingAlgorithms.createHeapSteps,
      counting: AdvancedSortingAlgorithms.createCountingSteps,
      bucket: AdvancedSortingAlgorithms.createBucketSteps,
      radix: AdvancedSortingAlgorithms.createRadixSteps,
    }[key as AdvancedSortingAlgorithmKey]?.(values) ?? null
  }

  private static pushStep(steps: SortStep[], values: SortItem[], active: number[], sorted: number[], note: string, detail?: AdvancedSortStepDetail) {
    steps.push({ values: values.map((item) => ({ ...item })), active: [...active], sorted: [...sorted], note, detail })
  }

  private static swapItems(values: SortItem[], firstIndex: number, secondIndex: number) {
    ;[values[firstIndex], values[secondIndex]] = [values[secondIndex], values[firstIndex]]
  }

  private static cloneBuckets(buckets: SortBucket[]) {
    return buckets.map((bucket) => ({
      ...bucket,
      items: bucket.items.map((item) => ({ ...item })),
    }))
  }

  private static createShellDetail(phase: SortPhase, gap: number, length: number, currentGroup: number[] = [], compare: number[] = []): AdvancedSortStepDetail {
    const groups = Array.from({ length: gap }, (_, group) => {
      const indices: number[] = []
      for (let index = group; index < length; index += gap) indices.push(index)
      return indices
    })

    return { type: 'shell', phase, gap, groups, currentGroup, compare }
  }

  // 希尔排序：按递减间隔分组插入排序，逐步缩小元素移动距离。
  private static createShellSteps(values: SortItem[]) {
    const arr = [...values]
    const steps: SortStep[] = []

    for (let gap = Math.floor(arr.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
      AdvancedSortingAlgorithms.pushStep(steps, arr, [], [], `当前希尔排序间隔为 ${gap}。`, AdvancedSortingAlgorithms.createShellDetail('group', gap, arr.length))
      for (let index = gap; index < arr.length; index++) {
        let cursor = index
        const group = AdvancedSortingAlgorithms.range(index % gap, arr.length - 1).filter((itemIndex) => itemIndex % gap === index % gap)
        AdvancedSortingAlgorithms.pushStep(steps, arr, [index, index - gap], [], `比较第 ${index + 1} 个元素与同组前一个元素。`, AdvancedSortingAlgorithms.createShellDetail('compare', gap, arr.length, group, [index, index - gap]))
        while (cursor >= gap && arr[cursor - gap].value > arr[cursor].value) {
          AdvancedSortingAlgorithms.swapItems(arr, cursor - gap, cursor)
          AdvancedSortingAlgorithms.pushStep(steps, arr, [cursor - gap, cursor], [], '同组前项更大，交换两个元素。', AdvancedSortingAlgorithms.createShellDetail('swap', gap, arr.length, group, [cursor - gap, cursor]))
          cursor -= gap
        }
      }
    }

    AdvancedSortingAlgorithms.pushStep(steps, arr, [], arr.map((_, index) => index), '所有元素已按升序排列。', AdvancedSortingAlgorithms.createShellDetail('done', 1, arr.length))
    return steps
  }

  // 堆排序：先建立最大堆，再把堆顶最大值交换到末尾。
  private static createHeapSteps(values: SortItem[]) {
    const arr = [...values]
    const steps: SortStep[] = []
    const sorted: number[] = []

    const createHeapDetail = (phase: SortPhase, heapSize: number, rootIndex: number | undefined, compare: number[], swap: number[] = []): AdvancedSortStepDetail => ({
      type: 'heap',
      phase,
      heapSize,
      rootIndex,
      compare,
      swap,
      sortedStart: heapSize,
    })

    const restoreHeap = (heapSize: number, rootIndex: number) => {
      let largest = rootIndex
      const left = rootIndex * 2 + 1
      const right = rootIndex * 2 + 2
      const compared = [rootIndex, left, right].filter((index) => index < heapSize)
      AdvancedSortingAlgorithms.pushStep(steps, arr, compared, sorted, `检查第 ${rootIndex + 1} 个节点的堆关系。`, createHeapDetail('compare', heapSize, rootIndex, compared))

      if (left < heapSize && arr[left].value > arr[largest].value) largest = left
      if (right < heapSize && arr[right].value > arr[largest].value) largest = right

      if (largest !== rootIndex) {
        AdvancedSortingAlgorithms.swapItems(arr, rootIndex, largest)
        AdvancedSortingAlgorithms.pushStep(steps, arr, [rootIndex, largest], sorted, '子节点更大，交换以恢复最大堆。', createHeapDetail('swap', heapSize, rootIndex, compared, [rootIndex, largest]))
        restoreHeap(heapSize, largest)
      }
    }

    for (let index = Math.floor(arr.length / 2) - 1; index >= 0; index--) {
      restoreHeap(arr.length, index)
    }

    for (let end = arr.length - 1; end > 0; end--) {
      AdvancedSortingAlgorithms.swapItems(arr, 0, end)
      sorted.push(end)
      AdvancedSortingAlgorithms.pushStep(steps, arr, [0, end], sorted, `堆顶最大值交换到第 ${end + 1} 个位置。`, createHeapDetail('write', end, 0, [0, end], [0, end]))
      restoreHeap(end, 0)
    }

    sorted.push(0)
    AdvancedSortingAlgorithms.pushStep(steps, arr, [], sorted, '所有元素已按升序排列。', createHeapDetail('done', 0, undefined, []))
    return steps
  }

  // 计数排序：统计每个数值出现次数，再按数值顺序回写。
  private static createCountingSteps(values: SortItem[]) {
    const arr = [...values]
    const steps: SortStep[] = []
    const min = Math.min(...arr.map((item) => item.value))
    const max = Math.max(...arr.map((item) => item.value))
    const counts = Array.from({ length: max - min + 1 }, () => 0)
    const grouped = Array.from({ length: counts.length }, () => [] as SortItem[])
    const output: SortItem[] = []

    const detail = (phase: SortPhase, currentValue?: number, writeIndex?: number): AdvancedSortStepDetail => ({
      type: 'counting',
      phase,
      min,
      max,
      counts: [...counts],
      currentValue,
      writeIndex,
      output: output.map((item) => ({ ...item })),
    })

    AdvancedSortingAlgorithms.pushStep(steps, arr, [], [], '统计每个数值出现次数。', detail('count'))
    for (let index = 0; index < arr.length; index++) {
      const bucketIndex = arr[index].value - min
      counts[bucketIndex]++
      grouped[bucketIndex].push(arr[index])
      AdvancedSortingAlgorithms.pushStep(steps, arr, [index], [], `数值 ${arr[index].value} 的计数加 1。`, detail('count', arr[index].value))
    }

    let writeIndex = 0
    for (let countIndex = 0; countIndex < counts.length; countIndex++) {
      while (grouped[countIndex].length) {
        const item = grouped[countIndex].shift()
        if (!item) continue
        arr[writeIndex] = item
        output.push(item)
        AdvancedSortingAlgorithms.pushStep(steps, arr, [writeIndex], AdvancedSortingAlgorithms.range(0, writeIndex), `按计数结果写入数值 ${item.value}。`, detail('write', item.value, writeIndex))
        writeIndex++
      }
    }

    AdvancedSortingAlgorithms.pushStep(steps, arr, [], arr.map((_, index) => index), '所有元素已按升序排列。', detail('done'))
    return steps
  }

  // 桶排序：按值域分桶，桶内排序后依次回写。
  private static createBucketSteps(values: SortItem[]) {
    const arr = [...values]
    const steps: SortStep[] = []
    const bucketCount = 5
    const min = Math.min(...arr.map((item) => item.value))
    const max = Math.max(...arr.map((item) => item.value))
    const bucketSize = Math.max(1, Math.ceil((max - min + 1) / bucketCount))
    const buckets = Array.from({ length: bucketCount }, (_, index) => {
      const start = min + index * bucketSize
      const end = Math.min(max, start + bucketSize - 1)
      return { label: `${index + 1}`, range: `${start}-${end}`, items: [] as SortItem[] }
    })

    const detail = (phase: SortPhase, currentValue?: number, targetBucket?: number, activeBucket?: number): AdvancedSortStepDetail => ({
      type: 'bucket',
      phase,
      buckets: AdvancedSortingAlgorithms.cloneBuckets(buckets),
      currentValue,
      targetBucket,
      activeBucket,
    })

    for (let index = 0; index < arr.length; index++) {
      const bucketIndex = Math.min(bucketCount - 1, Math.floor((arr[index].value - min) / bucketSize))
      buckets[bucketIndex].items.push(arr[index])
      AdvancedSortingAlgorithms.pushStep(steps, arr, [index], [], `数值 ${arr[index].value} 放入第 ${bucketIndex + 1} 个桶。`, detail('bucket', arr[index].value, bucketIndex, bucketIndex))
    }

    const sortedItems: SortItem[] = []
    for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {
      buckets[bucketIndex].items.sort((first, second) => first.value - second.value)
      sortedItems.push(...buckets[bucketIndex].items)
      AdvancedSortingAlgorithms.pushStep(steps, arr, [], [], `第 ${bucketIndex + 1} 个桶内部排序。`, detail('sort', undefined, undefined, bucketIndex))
    }

    for (let index = 0; index < sortedItems.length; index++) {
      arr[index] = sortedItems[index]
      AdvancedSortingAlgorithms.pushStep(steps, arr, [index], AdvancedSortingAlgorithms.range(0, index), `从桶中回写第 ${index + 1} 个元素。`, detail('write', sortedItems[index].value))
    }

    AdvancedSortingAlgorithms.pushStep(steps, arr, [], arr.map((_, index) => index), '所有元素已按升序排列。', detail('done'))
    return steps
  }

  // 基数排序：按个位、十位依次进行稳定分配和回写。
  private static createRadixSteps(values: SortItem[]) {
    const arr = [...values]
    const steps: SortStep[] = []
    const max = Math.max(...arr.map((item) => item.value))

    const placeName = (place: number) => {
      if (place === 1) return '个位'
      if (place === 10) return '十位'
      if (place === 100) return '百位'
      return `${place} 位`
    }

    for (let place = 1; Math.floor(max / place) > 0; place *= 10) {
      const buckets = Array.from({ length: 10 }, (_, index) => ({ label: `${index}`, items: [] as SortItem[] }))
      const detail = (phase: SortPhase, currentValue?: number, targetBucket?: number): AdvancedSortStepDetail => ({
        type: 'radix',
        phase,
        place,
        buckets: AdvancedSortingAlgorithms.cloneBuckets(buckets),
        currentValue,
        targetBucket,
      })

      for (let index = 0; index < arr.length; index++) {
        const digit = Math.floor(arr[index].value / place) % 10
        buckets[digit].items.push(arr[index])
        AdvancedSortingAlgorithms.pushStep(steps, arr, [index], [], `按 ${placeName(place)} 数字 ${digit} 分配到桶。`, detail('bucket', arr[index].value, digit))
      }

      const merged = buckets.flatMap((bucket) => bucket.items)
      for (let index = 0; index < merged.length; index++) {
        arr[index] = merged[index]
        AdvancedSortingAlgorithms.pushStep(steps, arr, [index], [], `按当前位次回写第 ${index + 1} 个元素。`, detail('write', merged[index].value))
      }
    }

    AdvancedSortingAlgorithms.pushStep(steps, arr, [], arr.map((_, index) => index), '所有元素已按升序排列。', {
      type: 'radix',
      phase: 'done',
      place: 1,
      buckets: Array.from({ length: 10 }, (_, index) => ({ label: `${index}`, items: [] })),
    })
    return steps
  }

  private static range(start: number, end: number) {
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index)
  }
}

export class SortingAlgorithms {

  static readonly dataSize = 14

  // 生成默认演示数据，数值范围直接映射到柱状图高度百分比。
  static createRandomData() {
    return Array.from({ length: SortingAlgorithms.dataSize }, (_, index) => ({
      id: Date.now() + index,
      value: Math.floor(Math.random() * 72) + 18,
    }))
  }

  // 根据算法类型生成完整播放步骤，页面层只负责按步骤渲染。
  static createSteps(key: SortingAlgorithmKey, values: SortItem[]) {
    const advancedSteps = AdvancedSortingAlgorithms.createSteps(key, values)
    if (advancedSteps) return advancedSteps

    const steps = {
      bubble: SortingAlgorithms.createBubbleSteps,
      selection: SortingAlgorithms.createSelectionSteps,
      insertion: SortingAlgorithms.createInsertionSteps,
      quick: SortingAlgorithms.createQuickSteps,
      merge: SortingAlgorithms.createMergeSteps,
    }

    return steps[key as keyof typeof steps](values)
  }

  // 记录数组快照，避免后续交换修改已生成步骤。
  private static pushStep(steps: SortStep[], values: SortItem[], active: number[], sorted: number[], note: string) {
    steps.push({ values: values.map((item) => ({ ...item })), active: [...active], sorted: [...sorted], note })
  }

  // 交换数据项本身，TransitionGroup 会根据稳定 id 生成位移动画。
  private static swapItems(values: SortItem[], firstIndex: number, secondIndex: number) {
    ;[values[firstIndex], values[secondIndex]] = [values[secondIndex], values[firstIndex]]
  }

  // 冒泡排序：相邻比较并把最大值逐轮推到末尾。
  private static createBubbleSteps(values: SortItem[]) {
    const arr = [...values]
    const steps: SortStep[] = []
    const sorted: number[] = []

    for (let end = arr.length - 1; end > 0; end--) {
      for (let index = 0; index < end; index++) {
        SortingAlgorithms.pushStep(steps, arr, [index, index + 1], sorted, `比较第 ${index + 1} 与第 ${index + 2} 个元素。`)
        if (arr[index].value > arr[index + 1].value) {
          SortingAlgorithms.swapItems(arr, index, index + 1)
          SortingAlgorithms.pushStep(steps, arr, [index, index + 1], sorted, '左侧元素更大，交换它们的位置。')
        }
      }
      sorted.push(end)
      SortingAlgorithms.pushStep(steps, arr, [end], sorted, `第 ${end + 1} 个位置已确定。`)
    }

    sorted.push(0)
    SortingAlgorithms.pushStep(steps, arr, [], sorted, '所有元素已按升序排列。')
    return steps
  }

  // 选择排序：每轮在未排序区间中找最小值放到起点。
  private static createSelectionSteps(values: SortItem[]) {
    const arr = [...values]
    const steps: SortStep[] = []
    const sorted: number[] = []

    for (let start = 0; start < arr.length - 1; start++) {
      let minIndex = start
      SortingAlgorithms.pushStep(steps, arr, [start], sorted, `从第 ${start + 1} 个位置开始寻找最小值。`)

      for (let index = start + 1; index < arr.length; index++) {
        SortingAlgorithms.pushStep(steps, arr, [minIndex, index], sorted, '比较当前最小值与候选元素。')
        if (arr[index].value < arr[minIndex].value) {
          minIndex = index
          SortingAlgorithms.pushStep(steps, arr, [minIndex], sorted, '更新本轮最小值位置。')
        }
      }

      if (minIndex !== start) {
        SortingAlgorithms.swapItems(arr, start, minIndex)
        SortingAlgorithms.pushStep(steps, arr, [start, minIndex], sorted, '把本轮最小值交换到有序区末尾。')
      }
      sorted.push(start)
      SortingAlgorithms.pushStep(steps, arr, [start], sorted, `第 ${start + 1} 个位置已确定。`)
    }

    sorted.push(arr.length - 1)
    SortingAlgorithms.pushStep(steps, arr, [], sorted, '所有元素已按升序排列。')
    return steps
  }

  // 插入排序：维护左侧有序区间，并把当前值向左交换到合适位置。
  private static createInsertionSteps(values: SortItem[]) {
    const arr = [...values]
    const steps: SortStep[] = []
    const sorted = [0]
    SortingAlgorithms.pushStep(steps, arr, [0], sorted, '第 1 个元素默认构成有序区间。')

    for (let index = 1; index < arr.length; index++) {
      let cursor = index
      SortingAlgorithms.pushStep(steps, arr, [index], sorted, `取出第 ${index + 1} 个元素，准备插入左侧有序区。`)

      while (cursor > 0 && arr[cursor - 1].value > arr[cursor].value) {
        SortingAlgorithms.swapItems(arr, cursor - 1, cursor)
        SortingAlgorithms.pushStep(steps, arr, [cursor - 1, cursor], sorted, '左侧元素更大，当前元素与它交换位置。')
        cursor--
      }

      sorted.push(index)
      SortingAlgorithms.pushStep(steps, arr, [cursor], sorted, '当前元素已插入到正确位置。')
    }

    SortingAlgorithms.pushStep(steps, arr, [], arr.map((_, index) => index), '所有元素已按升序排列。')
    return steps
  }

  // 快速排序：用右端点作基准分区，再递归处理左右区间。
  private static createQuickSteps(values: SortItem[]) {
    const arr = [...values]
    const steps: SortStep[] = []
    const sorted = new Set<number>()

    const partition = (left: number, right: number) => {
      const pivot = arr[right]
      let boundary = left
      SortingAlgorithms.pushStep(steps, arr, [right], Array.from(sorted), `选择第 ${right + 1} 个元素 ${pivot.value} 作为基准。`)

      for (let index = left; index < right; index++) {
        SortingAlgorithms.pushStep(steps, arr, [index, right], Array.from(sorted), '比较当前元素与基准值。')
        if (arr[index].value < pivot.value) {
          SortingAlgorithms.swapItems(arr, boundary, index)
          SortingAlgorithms.pushStep(steps, arr, [boundary, index], Array.from(sorted), '小于基准的元素移动到左侧分区。')
          boundary++
        }
      }

      SortingAlgorithms.swapItems(arr, boundary, right)
      sorted.add(boundary)
      SortingAlgorithms.pushStep(steps, arr, [boundary], Array.from(sorted), '基准值归位，左右分区继续排序。')
      return boundary
    }

    const sort = (left: number, right: number) => {
      if (left > right) return
      if (left === right) {
        sorted.add(left)
        SortingAlgorithms.pushStep(steps, arr, [left], Array.from(sorted), `第 ${left + 1} 个位置已确定。`)
        return
      }

      const pivotIndex = partition(left, right)
      sort(left, pivotIndex - 1)
      sort(pivotIndex + 1, right)
    }

    sort(0, arr.length - 1)
    SortingAlgorithms.pushStep(steps, arr, [], arr.map((_, index) => index), '所有元素已按升序排列。')
    return steps
  }

  private static createMergeSteps(values: SortItem[]) {
    const arr = [...values]
    const steps: SortStep[] = []

    const merge = (left: number, middle: number, right: number) => {
      const leftPart = arr.slice(left, middle + 1)
      const rightPart = arr.slice(middle + 1, right + 1)
      let leftIndex = 0
      let rightIndex = 0
      let writeIndex = left

      SortingAlgorithms.pushStep(steps, arr, SortingAlgorithms.range(left, right), [], `合并第 ${left + 1} 到第 ${right + 1} 个元素。`)

      while (leftIndex < leftPart.length && rightIndex < rightPart.length) {
        if (leftPart[leftIndex].value <= rightPart[rightIndex].value) {
          arr[writeIndex] = leftPart[leftIndex]
          leftIndex++
        } else {
          arr[writeIndex] = rightPart[rightIndex]
          rightIndex++
        }
        SortingAlgorithms.pushStep(steps, arr, [writeIndex], [], '写入当前较小的元素。')
        writeIndex++
      }

      while (leftIndex < leftPart.length) {
        arr[writeIndex] = leftPart[leftIndex]
        SortingAlgorithms.pushStep(steps, arr, [writeIndex], [], '写入左侧剩余元素。')
        leftIndex++
        writeIndex++
      }

      while (rightIndex < rightPart.length) {
        arr[writeIndex] = rightPart[rightIndex]
        SortingAlgorithms.pushStep(steps, arr, [writeIndex], [], '写入右侧剩余元素。')
        rightIndex++
        writeIndex++
      }
    }

    const sort = (left: number, right: number) => {
      if (left >= right) return
      const middle = Math.floor((left + right) / 2)
      sort(left, middle)
      sort(middle + 1, right)
      merge(left, middle, right)
    }

    sort(0, arr.length - 1)
    SortingAlgorithms.pushStep(steps, arr, [], arr.map((_, index) => index), '所有元素已按升序排列。')
    return steps
  }

  private static range(start: number, end: number) {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  }
}
