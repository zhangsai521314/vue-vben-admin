<template>
  <div
    class="seamless-scroll-container"
    :style="{ height: containerHeight + 'px' }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 滚动包装器 -->
    <div class="scroll-wrapper" :style="{ height: wrapperHeight + 'px' }">
      <!-- 滚动内容 -->
      <div
        ref="scrollContentRef"
        class="scroll-content"
        :style="{
          transform: `translateY(${-scrollOffset}px)`,
        }"
      >
        <!-- 虚拟渲染的可见项 -->
        <div
          v-for="item in visibleItems"
          :key="item.uniqueKey"
          class="scroll-item"
          :style="{
            height: itemHeight + 'px',
            top: item.actualTop + 'px',
          }"
        >
          <slot :item="item.data" :index="item.originalIndex"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';

  interface Props {
    // 数据列表
    data: any[];
    // 每项高度
    itemHeight?: number;
    // 容器高度
    containerHeight?: number;
    // 滚动速度（像素/秒）
    speed?: number;
    // 是否鼠标悬停暂停
    hoverPause?: boolean;
    // 缓冲项数量
    bufferSize?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    itemHeight: 60,
    containerHeight: 400,
    speed: 30,
    hoverPause: true,
    bufferSize: 3,
  });

  const emit = defineEmits<{
    itemClick: [item: any, index: number];
  }>();

  // 响应式数据
  const scrollContentRef = ref<HTMLDivElement>();
  const scrollOffset = ref(0);
  const isHovering = ref(false);
  const animationFrameId = ref<number>();
  const lastTimestamp = ref<number>(0);
  const itemCounter = ref(0);

  // 计算包装器高度（足够大以支持无缝滚动）
  const wrapperHeight = computed(() => {
    return props.data.length * props.itemHeight * 3; // 三倍高度确保无缝
  });

  // 计算可见项目数量
  const visibleItemCount = computed(() => {
    return Math.ceil(props.containerHeight / props.itemHeight) + props.bufferSize * 2;
  });

  // 获取循环数据 - 关键：生成足够的数据来填充滚动空间
  const cyclingData = computed(() => {
    if (props.data.length === 0) return [];

    const result = [];
    const neededItems = Math.ceil(wrapperHeight.value / props.itemHeight) + visibleItemCount.value;

    for (let i = 0; i < neededItems; i++) {
      const originalIndex = i % props.data.length;
      result.push({
        data: props.data[originalIndex],
        originalIndex,
        uniqueKey: `${originalIndex}-${i}`,
        position: i * props.itemHeight,
      });
    }

    return result;
  });

  // 计算可见项 - 修复循环逻辑
  const visibleItems = computed(() => {
    if (cyclingData.value.length === 0) return [];

    const startIndex = Math.floor(scrollOffset.value / props.itemHeight);
    const endIndex = Math.min(cyclingData.value.length, startIndex + visibleItemCount.value);

    return cyclingData.value.slice(startIndex, endIndex).map((item) => ({
      ...item,
      actualTop: item.position,
    }));
  });

  // 处理鼠标进入
  const handleMouseEnter = () => {
    if (props.hoverPause) {
      isHovering.value = true;
    }
  };

  // 处理鼠标离开
  const handleMouseLeave = () => {
    if (props.hoverPause) {
      isHovering.value = false;
    }
  };

  // 滚动动画 - 实现真正的无缝循环
  const scrollAnimation = (timestamp: number) => {
    if (!lastTimestamp.value) {
      lastTimestamp.value = timestamp;
    }

    const deltaTime = timestamp - lastTimestamp.value;
    lastTimestamp.value = timestamp;

    if (!isHovering.value && props.data.length > 0) {
      // 计算滚动距离
      const deltaScroll = (props.speed * deltaTime) / 1000;
      let newOffset = scrollOffset.value + deltaScroll;

      // 实现真正的无缝循环
      // 当滚动超过一个循环时，回到开始位置继续滚动
      const cycleHeight = props.data.length * props.itemHeight;
      if (newOffset >= cycleHeight) {
        newOffset = newOffset % cycleHeight;
      }

      scrollOffset.value = newOffset;
    }

    animationFrameId.value = requestAnimationFrame(scrollAnimation);
  };

  // 开始滚动
  const startScrolling = () => {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
    }
    lastTimestamp.value = 0;
    animationFrameId.value = requestAnimationFrame(scrollAnimation);
  };

  // 停止滚动
  const stopScrolling = () => {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = undefined;
    }
  };

  // 重置滚动位置
  const resetScroll = () => {
    scrollOffset.value = 0;
  };

  // 监听数据变化
  watch(
    () => props.data,
    (newData, oldData) => {
      if (newData.length === 0) {
        resetScroll();
        return;
      }

      // 数据更新时保持滚动连续性
      nextTick(() => {
        // 如果数据长度变化，调整滚动位置以保持连续性
        if (oldData.length > 0 && newData.length !== oldData.length) {
          const progress = scrollOffset.value / (oldData.length * props.itemHeight);
          scrollOffset.value = progress * (newData.length * props.itemHeight);
        }
        startScrolling();
      });
    },
    { deep: true },
  );

  // 监听其他属性变化
  watch(
    () => [props.containerHeight, props.speed],
    () => {
      startScrolling();
    },
  );

  // 生命周期
  onMounted(() => {
    startScrolling();
  });

  onUnmounted(() => {
    stopScrolling();
  });

  // 暴露给父组件的方法
  defineExpose({
    resetScroll,
    startScrolling,
    stopScrolling,
    getScrollOffset: () => scrollOffset.value,
  });
</script>

<style scoped>
  .seamless-scroll-container {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
  }

  .scroll-wrapper {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
  }

  .scroll-content {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    will-change: transform;
  }

  .scroll-item {
    position: absolute;
    left: 0;
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
  }
</style>
