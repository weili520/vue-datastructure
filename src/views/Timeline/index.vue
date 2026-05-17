<template>
    <div style="padding: 32px;">
        <div>
            <el-date-picker v-model="curTimeRange" type="datetimerange" range-separator="To"
                start-placeholder="Start date" end-placeholder="End date" @change="handleTimeChange" />
        </div>
        <div>
            <p>start: {{ curTimeRange?.[0] ? dayjs(curTimeRange[0]).format('YYYY-MM-DD HH:mm:ss') : '--' }}</p>
            <p>end: {{ curTimeRange?.[1] ? dayjs(curTimeRange[1]).format('YYYY-MM-DD HH:mm:ss') : '--' }}</p>
        </div>
        <div class="container">
            <div ref="containerRef" style="width: 100%;">
                <canvas ref="canvasRef"></canvas>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue';
import Timeline from '../../class/timeline'
import dayjs from 'dayjs';

const canvasRef = ref()
const containerRef = ref()
const timelineInstance = ref()
const curTimeRange = ref()

const handleTimeChange = (time: any) => {
    if (time instanceof Array) {
        timelineInstance.value.setRange(time)
    }
}

onMounted(() => {
    timelineInstance.value = new Timeline(containerRef.value, canvasRef.value, curTimeRange.value, { onSelectedTimeChange: handleTimeChange })
})
</script>

<style lang='scss' scoped>
.container {
    height: 100px;
    background-color: #15619b;
    margin-top: 120px 64px;
    padding-top: 40px;

    canvas {
        width: 100%;
        height: 72px;
    }
}
</style>