<template>
  <section v-if="detail" class="sorting-internals" aria-label="高级排序内部过程">
    <div class="sorting-internals__head">
      <div>
        <p>Internal animation</p>
        <h3>{{ title }}</h3>
      </div>
      <span>{{ phaseLabel }}</span>
    </div>

    <div v-if="detail.type === 'shell'" class="sorting-internals__groups">
      <div
        v-for="(group, groupIndex) in detail.groups"
        :key="groupIndex"
        class="sorting-internals__group"
        :class="{ 'sorting-internals__group--active': isSameGroup(group, detail.currentGroup) }"
      >
        <strong>组 {{ groupIndex + 1 }} · gap {{ detail.gap }}</strong>
        <div class="sorting-internals__chips">
          <span
            v-for="index in group"
            :key="index"
            class="sorting-internals__chip"
            :class="{ 'sorting-internals__chip--active': detail.compare.includes(index) }"
          >
            {{ itemValue(index) }}
          </span>
        </div>
      </div>
    </div>

    <div v-else-if="detail.type === 'heap'" class="sorting-internals__heap">
      <span
        v-for="index in heapNodes"
        :key="index"
        class="sorting-internals__heap-node"
        :class="heapNodeClass(index)"
        :style="heapNodeStyle(index)"
      >
        {{ itemValue(index) }}
      </span>
    </div>

    <div v-else-if="detail.type === 'counting'" class="sorting-internals__counting">
      <div class="sorting-internals__table">
        <div
          v-for="(count, index) in detail.counts"
          :key="index"
          class="sorting-internals__cell"
          :class="{ 'sorting-internals__cell--active': detail.currentValue === detail.min + index }"
        >
          <small>{{ detail.min + index }}</small>
          <strong>{{ count }}</strong>
        </div>
      </div>
      <div class="sorting-internals__output">
        <span
          v-for="(item, index) in detail.output"
          :key="item.id"
          class="sorting-internals__chip"
          :class="{ 'sorting-internals__chip--active': detail.writeIndex === index }"
        >
          {{ item.value }}
        </span>
      </div>
    </div>

    <div v-else-if="detail.type === 'bucket'" class="sorting-internals__buckets">
      <div
        v-for="(bucket, index) in detail.buckets"
        :key="bucket.label"
        class="sorting-internals__bucket"
        :class="{ 'sorting-internals__bucket--active': detail.targetBucket === index || detail.activeBucket === index }"
      >
        <strong>桶 {{ bucket.label }}</strong>
        <small>{{ bucket.range }}</small>
        <div class="sorting-internals__chips">
          <span v-for="item in bucket.items" :key="item.id" class="sorting-internals__chip">{{ item.value }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="detail.type === 'radix'" class="sorting-internals__buckets sorting-internals__buckets--radix">
      <div
        v-for="(bucket, index) in detail.buckets"
        :key="bucket.label"
        class="sorting-internals__bucket"
        :class="{ 'sorting-internals__bucket--active': detail.targetBucket === index }"
      >
        <strong>{{ bucket.label }}</strong>
        <small>{{ placeLabel }}</small>
        <div class="sorting-internals__chips">
          <span v-for="item in bucket.items" :key="item.id" class="sorting-internals__chip">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdvancedSortStepDetail, SortItem, SortingAlgorithmKey } from '../class/SortingAlgorithms'

const props = defineProps<{
  algorithm: SortingAlgorithmKey
  values: SortItem[]
  detail?: AdvancedSortStepDetail | null
}>()

const detail = computed(() => props.detail ?? null)

const title = computed(() => {
  if (!detail.value) return ''
  return {
    shell: '希尔排序分组移动',
    heap: '堆结构调整',
    counting: '计数表统计与回写',
    bucket: '桶分配与收集',
    radix: '按位分桶',
  }[detail.value.type]
})

const phaseLabel = computed(() => {
  if (!detail.value) return ''
  return {
    group: '分组',
    compare: '比较',
    swap: '交换',
    count: '计数',
    bucket: '入桶',
    sort: '桶内排序',
    write: '回写',
    done: '完成',
  }[detail.value.phase]
})

const heapNodes = computed(() => {
  if (detail.value?.type !== 'heap') return []
  return props.values.map((_, index) => index)
})

const placeLabel = computed(() => {
  if (detail.value?.type !== 'radix') return ''
  if (detail.value.place === 1) return '个位'
  if (detail.value.place === 10) return '十位'
  if (detail.value.place === 100) return '百位'
  return `${detail.value.place} 位`
})

const isSameGroup = (first: number[], second: number[]) => {
  return first.length === second.length && first.every((value, index) => value === second[index])
}

const itemValue = (index: number) => props.values[index]?.value ?? index + 1

const heapNodeClass = (index: number) => {
  if (detail.value?.type !== 'heap') return {}
  return {
    'sorting-internals__heap-node--compare': detail.value.compare.includes(index),
    'sorting-internals__heap-node--swap': detail.value.swap.includes(index),
    'sorting-internals__heap-node--sorted': index >= detail.value.sortedStart,
  }
}

const heapNodeStyle = (index: number) => {
  const level = Math.floor(Math.log2(index + 1))
  const firstIndex = 2 ** level - 1
  const position = index - firstIndex
  const slots = 2 ** level

  return {
    gridColumn: `${position * 2 + 1} / span 2`,
    gridRow: `${level + 1}`,
    justifySelf: 'center',
    marginInline: `${Math.max(0, 28 - level * 6)}px`,
    '--heap-level': level,
    '--heap-left': `${((position + 0.5) / slots) * 100}%`,
  }
}
</script>

<style scoped lang="scss">
.sorting-internals {
  margin: 0 32px 32px;
  border: 1px solid var(--ps-divider);
  border-radius: 22px;
  background: linear-gradient(180deg, var(--ps-white), var(--ps-mist));
  padding: 22px;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;

    p {
      margin: 0 0 4px;
      color: var(--ps-blue-dark);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.12px;
      text-transform: uppercase;
    }

    h3 {
      margin: 0;
      color: var(--ps-charcoal);
      font-size: 22px;
    }

    span {
      border-radius: 999px;
      background: var(--ps-blue);
      color: var(--ps-white);
      padding: 7px 12px;
      font-size: 13px;
      font-weight: 800;
    }
  }

  &__groups,
  &__buckets,
  &__counting {
    display: grid;
    gap: 12px;
  }

  &__groups {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  &__group,
  &__bucket {
    min-width: 0;
    border: 1px solid var(--ps-divider);
    border-radius: 18px;
    background: var(--ps-white);
    padding: 14px;
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;

    strong,
    small {
      display: block;
    }

    strong {
      color: var(--ps-charcoal);
      font-size: 15px;
    }

    small {
      margin-top: 4px;
      color: var(--ps-gray);
      font-size: 12px;
      font-weight: 700;
    }

    &--active {
      border-color: var(--ps-blue);
      box-shadow: var(--ps-ring);
      transform: translateY(-2px);
    }
  }

  &__buckets {
    grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));

    &--radix {
      grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
    }
  }

  &__chips,
  &__output {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  &__chip {
    display: inline-flex;
    min-width: 34px;
    min-height: 30px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: rgba(0, 112, 204, 0.1);
    color: var(--ps-blue-dark);
    padding: 0 10px;
    font-size: 13px;
    font-weight: 800;
    transition:
      background 180ms ease,
      color 180ms ease,
      transform 180ms ease;

    &--active {
      background: var(--ps-cyan);
      color: var(--ps-white);
      transform: translateY(-2px);
    }
  }

  &__heap {
    display: grid;
    grid-template-columns: repeat(16, minmax(20px, 1fr));
    gap: 18px 8px;
    min-height: 250px;
    align-items: center;
    overflow-x: auto;
    border-radius: 18px;
    background:
      linear-gradient(rgba(0, 112, 204, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 112, 204, 0.05) 1px, transparent 1px),
      var(--ps-white);
    background-size: 24px 24px;
    padding: 24px;
  }

  &__heap-node {
    display: inline-flex;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(0, 112, 204, 0.2);
    border-radius: 50%;
    background: var(--ps-white);
    color: var(--ps-charcoal);
    font-size: 14px;
    font-weight: 800;
    box-shadow: var(--ps-shadow-06);
    transition:
      background 180ms ease,
      border-color 180ms ease,
      color 180ms ease,
      transform 180ms ease;

    &--compare {
      border-color: var(--ps-blue);
      color: var(--ps-blue-dark);
      transform: translateY(-4px);
    }

    &--swap {
      background: var(--ps-cyan);
      color: var(--ps-white);
    }

    &--sorted {
      background: linear-gradient(180deg, #20b77a, #0c8050);
      color: var(--ps-white);
    }
  }

  &__table {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(58px, 1fr));
    gap: 10px;
  }

  &__cell {
    border: 1px solid var(--ps-divider);
    border-radius: 16px;
    background: var(--ps-white);
    padding: 10px;
    text-align: center;
    transition:
      border-color 180ms ease,
      transform 180ms ease;

    small,
    strong {
      display: block;
    }

    small {
      color: var(--ps-gray);
      font-size: 12px;
      font-weight: 800;
    }

    strong {
      margin-top: 6px;
      color: var(--ps-charcoal);
      font-size: 20px;
    }

    &--active {
      border-color: var(--ps-cyan);
      transform: translateY(-3px);
    }
  }

  &__output {
    min-height: 34px;
    border-top: 1px solid var(--ps-divider);
    padding-top: 14px;
  }

  @media (max-width: 767px) {
    margin: 0 18px 24px;
    padding: 18px;

    &__head {
      display: grid;
    }

    &__heap {
      grid-template-columns: repeat(8, minmax(34px, 1fr));
    }
  }
}
</style>
