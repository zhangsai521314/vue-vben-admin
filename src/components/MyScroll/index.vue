<template>
  <div
    class="seamless-scroll-container"
    :style="{ height: containerHeight + 'px' }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="scroll-wrapper" :style="{ height: wrapperHeight + 'px' }">
      <div
        ref="scrollContentRef"
        class="scroll-content"
        :style="{
          transform: `translateY(${-scrollOffset}px)`,
        }"
      >
        <div
          v-for="item in visibleItems"
          :key="item.uniqueKey"
          class="scroll-item"
          :style="{
            height: itemHeight + 'px',
            top: item.position + 'px',
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
    data: any[];
    itemHeight?: number;
    containerHeight?: number;
    speed?: number;
    hoverPause?: boolean;
    bufferSize?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    itemHeight: 60,
    containerHeight: 400,
    speed: 30,
    hoverPause: true,
    bufferSize: 3,
  });

  // 响应式数据
  const scrollContentRef = ref<HTMLDivElement>();
  const scrollOffset = ref(0);
  const isHovering = ref(false);
  const animationFrameId = ref<number>();
  const lastTimestamp = ref<number>(0);

  // 计算包装器高度
  const wrapperHeight = computed(() => {
    return props.data.length * props.itemHeight * 3;
  });

  // 计算可见项目数量
  const visibleItemCount = computed(() => {
    return Math.ceil(props.containerHeight / props.itemHeight) + props.bufferSize * 2;
  });

  // 获取循环数据
  // 这里预先计算好 position，避免在滚动每一帧中重复计算
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
        position: i * props.itemHeight, // position 已经在数据源生成时计算好了
      });
    }

    return result;
  });

  // 【修改点】计算可见项
  // 移除了 .map() 操作，直接返回数组切片。
  // 这样返回的是对象的引用，不会每帧创建新对象，极大降低 GC 压力。
  const visibleItems = computed(() => {
    if (cyclingData.value.length === 0) return [];

    const startIndex = Math.floor(scrollOffset.value / props.itemHeight);
    const endIndex = Math.min(cyclingData.value.length, startIndex + visibleItemCount.value);

    // 直接切片返回，零内存分配
    return cyclingData.value.slice(startIndex, endIndex);
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

  // 滚动动画
  const scrollAnimation = (timestamp: number) => {
    if (!lastTimestamp.value) {
      lastTimestamp.value = timestamp;
    }

    const deltaTime = timestamp - lastTimestamp.value;
    lastTimestamp.value = timestamp;

    if (!isHovering.value && props.data.length > 0) {
      const deltaScroll = (props.speed * deltaTime) / 1000;
      let newOffset = scrollOffset.value + deltaScroll;

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
      nextTick(() => {
        if (oldData.length > 0 && newData.length !== oldData.length) {
          const progress = scrollOffset.value / (oldData.length * props.itemHeight);
          scrollOffset.value = progress * (newData.length * props.itemHeight);
        }
        startScrolling();
      });
    },
    { deep: true },
  );

  watch(
    () => [props.containerHeight, props.speed],
    () => {
      startScrolling();
    },
  );

  onMounted(() => {
    startScrolling();
  });

  onUnmounted(() => {
    stopScrolling();
  });

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
