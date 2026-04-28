<template>
    <div>Test Page</div>
</template>

<script setup lang='ts'>
import { onMounted } from 'vue';
import { fn as TestFn } from '../algorithms/tree.test'

onMounted(() => {
    TestFn()
})
</script>

<style lang='less' scoped></style>