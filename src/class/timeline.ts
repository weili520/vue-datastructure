import dayjs, { Dayjs } from 'dayjs';
import type { PlaybackRange } from '../types';

interface PlaybackTimelineTrackOptions {
  // 选中时间变化时通知外部组件。
  onSelectedTimeChange?: (time: number) => void;
}

// 时间单位换算，内部统一使用毫秒计算。
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

// 默认展示 24 小时，最小缩放到 3 分钟。
const MIN_VISIBLE_MS = 3 * MINUTE;
const DEFAULT_VISIBLE_MS = 24 * HOUR;

// 画布样式配置。
const BASELINE_OFFSET = 0;
const TICK_COLOR = 'rgba(200, 234, 245, 0.68)';
const TEXT_COLOR = 'rgba(200, 234, 245, 0.82)';
const BASELINE_COLOR = 'rgba(39, 196, 212, 0.72)';
const SELECTED_LINE_COLOR = '#ee0177';
const TIME_FORMATE = 'YYYY-MM-DD HH:mm:ss'

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// 选中时间只精确到秒。
const toSecond = (value: number) => Math.round(value / SECOND) * SECOND;

export default class Timeline {
  private canvas: HTMLCanvasElement;

  private container: HTMLDivElement;

  private ctx: CanvasRenderingContext2D;

  // 当前容器尺寸，用于坐标和时间互相换算。
  private height = 0;

  // 中间竖线代表的当前选中时间。
  private selectedTime: number;

  // 外部传入的可选时间范围，选中时间不会超出该范围。
  private timelineRange: PlaybackRange;

  // 当前画布可见的时间跨度，围绕 selectedTime 居中绘制。
  private visibleMs = DEFAULT_VISIBLE_MS;

  private width = 0;

  // 拖动状态缓存，用于把鼠标位移换算成时间变化。
  private dragging = false;

  private dragStartX = 0;

  private dragStartSelectedMs = 0;

  private onSelectedTimeChange?: (time: number) => void;

  private onMouseDown = (event: MouseEvent) => {
    this.dragging = true;
    this.dragStartX = event.clientX;
    this.dragStartSelectedMs = this.selectedTime.valueOf();
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!this.dragging || !this.width) {
      return;
    }

    const movedX = event.clientX - this.dragStartX;
    console.log('this.visibleMs', movedX, movedX / this.width, this.visibleMs);

    const movedMs = (movedX / this.width) * this.visibleMs;
    const [start, end] = this.timelineRange;
    const selectedMs = clamp(toSecond(this.dragStartSelectedMs - movedMs), start.valueOf(), end.valueOf());

    this.selectedTime = dayjs(selectedMs).valueOf();
    console.log('----===', dayjs(this.selectedTime).format(TIME_FORMATE));
    this.render();
  };

  private onMouseUp = () => {
    this.dragging = false;
  };

  private onMouseLeave = () => {
    this.dragging = false;
  };

  // 鼠标滚轮控制时间轴缩放，向下放大可见跨度，向上缩小可见跨度。
  private currentZoomIndex = 6;
  private onWheel = (event: any) => {
    event.preventDefault();
    const delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
    const _ratioIndex = this.ZOOM_TOTAL_HOUR.map(_item => _item * 100)

    let _countRatio = 1;
    if (delta < 0) {
      // 缩小。即放大时间范围
      if (this.currentZoomIndex + 1 > _ratioIndex.length - 1) {
        _countRatio = 1;
        this.currentZoomIndex = _ratioIndex.length - 1;
      } else {
        _countRatio =
          _ratioIndex[this.currentZoomIndex + 1] /
          _ratioIndex[this.currentZoomIndex];
        this.currentZoomIndex++;
      }
    } else {
      if (this.currentZoomIndex - 1 < 0) {
        _countRatio = 1;
        this.currentZoomIndex = 0;
      } else {
        _countRatio =
          _ratioIndex[this.currentZoomIndex - 1] /
          _ratioIndex[this.currentZoomIndex];
        this.currentZoomIndex--;
      }
    }

    // 计算，应该 放大/缩小 时间窗口(visibleMs)的倍数
    const nextVisibleMs = clamp(
      this.visibleMs * _countRatio,
      MIN_VISIBLE_MS,
      DEFAULT_VISIBLE_MS,
    );

    this.visibleMs = nextVisibleMs;
    this.render();
  };

  constructor(
    container: HTMLDivElement,
    canvas: HTMLCanvasElement,
    timelineRange: PlaybackRange,
    options?: PlaybackTimelineTrackOptions,
  ) {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context is unavailable.');
    }

    this.canvas = canvas;
    this.container = container;
    this.ctx = ctx;
    this.timelineRange = timelineRange;
    this.selectedTime = timelineRange?.[1] ?? '';
    this.onSelectedTimeChange = options?.onSelectedTimeChange;
    this.bindEvents();
  }

  clear() {
    const ratio = window.devicePixelRatio || 1;
    this.ctx.clearRect(0, 0, this.width * ratio, this.height * ratio);
  }

  // 组件卸载时解绑事件，避免重复绑定和内存泄漏。
  destroy() {
    this.container.removeEventListener('mousedown', this.onMouseDown);
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('mouseup', this.onMouseUp);
    this.container.removeEventListener('mouseleave', this.onMouseLeave);
    this.container.removeEventListener('wheel', this.onWheel);
  }

  // 同步容器尺寸和 canvas 像素尺寸，兼容高分屏显示。
  resize() {
    const { width, height } = this.container.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    console.log('width, height--<----', this.container, width, height);

    this.width = width;
    this.height = height;
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.render();
  }

  // 外部范围变化时重置时间轴，默认选中结束时间。
  setRange(timelineRange: PlaybackRange) {
    this.timelineRange = timelineRange;
    this.visibleMs = DEFAULT_VISIBLE_MS;
    this.setSelectedTime(timelineRange[1].valueOf(), false);
  }

  private bindEvents() {
    this.container.addEventListener('mousedown', this.onMouseDown);
    this.container.addEventListener('mousemove', this.onMouseMove);
    this.container.addEventListener('mouseup', this.onMouseUp);
    this.container.addEventListener('mouseleave', this.onMouseLeave);
    this.container.addEventListener('wheel', this.onWheel, { passive: false });
  }

  private drawLine(
    point1: number[],
    point2: number[],
    color: string,
    lineWidth = 1,
  ) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.moveTo(point1[0], point1[1]);
    this.ctx.lineTo(point2[0], point2[1]);
    this.ctx.stroke();
  }

  // 中间竖线固定在画布中心，它对应 selectedTime。
  private drawSelectedLine() {
    const centerX = this.width / 2;

    this.drawLine([centerX, 0], [centerX, this.height], SELECTED_LINE_COLOR, 2);
  }

  private drawXAxis() {
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = '12px sans-serif';

    const baselineY = this.height - BASELINE_OFFSET;
    this.drawLine([0, baselineY], [this.width, baselineY], BASELINE_COLOR);
  }

  // 零点显示日期，小范围缩放显示秒，其余情况显示时分。
  private formatTickLabel(time: number) {
    const date = dayjs(time);

    if (date.hour() === 0 && date.minute() === 0 && date.second() === 0) {
      return date.format('MM-DD');
    }

    if (this.visibleMs <= 10 * MINUTE) {
      return date.format('HH:mm:ss');
    }

    return date.format('HH:mm');
  }

  ZOOM_DATE_SHOW_RULE = [
    (date: Dayjs) => date.second() % 10 === 0, // 秒级别显示 10 的倍数
    () => true, // 全部显示
    (date: Dayjs) => date.minute() % 5 === 0, // 显示 5 的倍数
    (date: Dayjs) => date.minute() % 10 === 0, // 显示 10 的倍数
    (date: Dayjs) => date.minute() === 0 || date.minute() === 30, // 显示整点和半小时
    (date: Dayjs) => date.minute() === 0, // 显示整点时间
    () => true, // 显示 2、4、6 整点时间
  ];

  // 不同缩放比例下，时间轴的总时间范围（单位：小时）
  private ZOOM_TOTAL_HOUR = [0.05, 0.5, 1, 2, 6, 12, 24];
  // 每小格代表多少个小时（单位：小时）
  private ZOOM_GRID_HOUR = [1 / 3600, 1 / 60, 1 / 60, 1 / 30, 1 / 6, 0.25, 0.5];
  // private ZOOM_GRID_MAP = [180, 30, 60, 60, 36, 48, 48]; // 不同分辨率应该画多少个格子

  // 根据 selectedTime 和 visibleMs 计算可见窗口并绘制刻度。
  private drawTicks() {
    // 时间轴应该画多少格
    const gridNum = this.ZOOM_TOTAL_HOUR[this.currentZoomIndex] / this.ZOOM_GRID_HOUR[this.currentZoomIndex];

    // 每一格应该多宽
    const pxPerGrid = this.width / gridNum;
    console.log('pxPerGrid', pxPerGrid);

    // 每一小格代表多少毫秒
    const msPerGird =
      this.ZOOM_GRID_HOUR[this.currentZoomIndex] * 60 * 60 * 1000;
    console.log('msPerGird--1222', msPerGird);

    const startTime = this.selectedTime.valueOf() - ((gridNum / 2) * msPerGird);
    console.log('-----');
    console.log('gridNum', gridNum, dayjs(startTime).format(TIME_FORMATE));

    let _step = 0;
    while (_step < gridNum) {
      let _offset = _step * pxPerGrid;
      let _curTime = startTime + msPerGird * _step;

      let height = 0;
      const date = dayjs(_curTime);
      // 绘制刻度
      console.log('this.currentZoomIndex', this.currentZoomIndex);
      const baselineY = this.height - BASELINE_OFFSET;
      console.log('xxxx', date.format(TIME_FORMATE));

      if (date.hour() === 0 && date.minute() === 0 && date.second() === 0) {
        // 整小时
        height = this.height * 0.3;

        const title = this.formatTickLabel(_curTime);
        this.ctx.fillStyle = 'rgba(151,158,167,1)';
        this.ctx.fillText(title, _offset, baselineY - height - 10);
      } else if (this.ZOOM_DATE_SHOW_RULE[this.currentZoomIndex](date)) {
        height = this.height * 0.2;

        const title = this.formatTickLabel(_curTime);
        this.ctx.fillStyle = 'rgba(151,158,167,1)';
        this.ctx.fillText(title, _offset, baselineY - height - 10);
      } else {
        // 其他时间不显示时间
        height = this.height * 0.15;
      }


      this.drawLine(
        [_offset, baselineY],
        [_offset, baselineY - height],
        '#fff',
        1,
      );

      _step++;
    }
  }

  private render() {
    this.clear();
    this.drawXAxis();
    this.drawTicks();
    this.drawSelectedLine();
  }

  // 更新选中时间时限制在 timelineRange 内，并按秒取整。
  private setSelectedTime(time: number, emitChange = true) {
    const [start, end] = this.timelineRange;
    const selectedMs = clamp(toSecond(time), start.valueOf(), end.valueOf());

    this.selectedTime = dayjs(selectedMs).valueOf();
    this.resize();

    if (emitChange) {
      this.onSelectedTimeChange?.(this.selectedTime);
    }
  }
}
