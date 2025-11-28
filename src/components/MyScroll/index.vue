<template>
  <div
    class="seamless-scroll-container"
    :style="{ height: containerHeight + 'px' }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="scroll-wrapper" ref="wrapperRef">
      <div class="scroll-content" ref="scrollContentRef">
        <div
          v-for="item in renderList"
          :key="item.uniqueKey"
          class="scroll-item"
          :style="{
            height: itemHeight + 'px',
            top: item.top + 'px',
          }"
        >
          <slot :item="item.data" :index="item.originalIndex"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted, shallowRef, nextTick } from 'vue';

  interface Props {
    data: any[];
    itemHeight?: number;
    containerHeight?: number;
    speed?: number; // 滚动速度 (px/s)
    hoverPause?: boolean; // 悬停暂停
    bufferSize?: number; // 缓冲区大小
    keyField?: string; // 【新增】指定作为主键的字段名，默认为 'id'
  }

  const props = withDefaults(defineProps<Props>(), {
    itemHeight: 60,
    containerHeight: 400,
    speed: 30,
    hoverPause: true,
    bufferSize: 5,
    keyField: 'id', // 默认使用 id 字段
  });

  // --- Refs ---
  const scrollContentRef = ref<HTMLDivElement>();

  // 使用 shallowRef 存储渲染列表，避免对列表项内部属性进行深层响应式代理，提升性能
  const renderList = shallowRef<any[]>([]);
  const isHovering = ref(false);

  // --- 内部状态变量 (非响应式，用于动画循环) ---
  let animationFrameId: number | null = null;
  let lastTimestamp = 0;
  let currentScrollOffset = 0;
  let lastStartIndex = -1; // 用于缓存上一帧的起始索引，避免重复计算

  // --- 计算属性 ---
  const visibleCount = computed(() => {
    return Math.ceil(props.containerHeight / props.itemHeight);
  });

  // --- 核心方法：更新渲染列表 ---
  const updateRenderList = (offset: number, forceUpdate = false) => {
    if (props.data.length === 0) {
      if (renderList.value.length > 0) renderList.value = [];
      return;
    }

    // 计算当前视口顶部的条目索引
    const startIndex = Math.floor(offset / props.itemHeight);

    // 性能优化：只有当滚动经过了一个完整的 item 高度，或者强制更新时，才重新生成列表
    if (startIndex !== lastStartIndex || forceUpdate) {
      lastStartIndex = startIndex;

      const buffer = props.bufferSize;
      // 渲染范围：当前位置 - 缓冲区 ~ 当前位置 + 可视数 + 缓冲区
      const start = startIndex - buffer;
      const end = startIndex + visibleCount.value + buffer;

      const newList = [];
      const dataLen = props.data.length;

      for (let i = start; i < end; i++) {
        // 处理无限循环索引（支持负数索引）
        let originalIndex = i % dataLen;
        if (originalIndex < 0) originalIndex += dataLen;

        const itemData = props.data[originalIndex];

        if (itemData) {
          // 【核心逻辑】使用外部传入的 keyField (id) 生成唯一键
          // 格式：Item的主键_在虚拟列表中的绝对索引
          const primaryKey = itemData[props.keyField] ?? originalIndex;

          newList.push({
            data: itemData,
            originalIndex: originalIndex,
            // 这里的 uniqueKey 决定了 Vue 的 diff 策略：
            // 如果 id 相同，Vue 会复用 DOM；如果 id 不同，Vue 会销毁重建。
            uniqueKey: `${primaryKey}_${i}`,
            top: i * props.itemHeight, // 绝对定位，脱离文档流
          });
        }
      }

      renderList.value = newList;
      console.log('列表数量', renderList.value.length);
    }
  };

  // --- 动画循环 ---
  const scrollAnimation = (timestamp: number) => {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (!isHovering.value && props.data.length > 0) {
      // 计算位移
      const deltaScroll = (props.speed * deltaTime) / 1000;
      currentScrollOffset += deltaScroll;

      // 防止数值无限增大导致精度丢失（可选优化）
      // 当偏移量极大时，减去一个周期的整数倍
      const oneCycleHeight = props.data.length * props.itemHeight;
      if (currentScrollOffset > oneCycleHeight * 100 && oneCycleHeight > 0) {
        // 保持 offset % oneCycleHeight 不变，但减小绝对值
        // 注意：这可能会导致短暂的渲染列表 key 变化，但在高速滚动中通常不可感知
        // currentScrollOffset %= oneCycleHeight;
        // 暂不开启重置，因为重置会改变 i 的值，导致 uniqueKey 变化，可能引起 DOM 闪烁
      }
    }

    // 直接操作 DOM transform，不经过 Vue 响应式，极大提升 FPS
    if (scrollContentRef.value) {
      scrollContentRef.value.style.transform = `translate3d(0, -${currentScrollOffset}px, 0)`;
    }

    // 根据新的 offset 计算是否需要更新 v-for 列表
    updateRenderList(currentScrollOffset);

    animationFrameId = requestAnimationFrame(scrollAnimation);
  };

  // --- 交互控制 ---
  const startScrolling = () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    lastTimestamp = 0;
    animationFrameId = requestAnimationFrame(scrollAnimation);
  };

  const stopScrolling = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  const handleMouseEnter = () => {
    if (props.hoverPause) isHovering.value = true;
  };

  const handleMouseLeave = () => {
    if (props.hoverPause) isHovering.value = false;
  };

  const resetScroll = () => {
    currentScrollOffset = 0;
    lastStartIndex = -1;
    if (scrollContentRef.value) {
      scrollContentRef.value.style.transform = 'translate3d(0, 0, 0)';
    }
    updateRenderList(0, true);
  };

  // --- 监听数据变化 ---
  watch(
    () => props.data,
    (newData, oldData) => {
      // 1. 如果数据变为空，重置
      if (newData.length === 0) {
        resetScroll();
        return;
      }

      // 2. 如果之前是空的，现在有了数据，重置并开始
      if (oldData.length === 0) {
        resetScroll();
        startScrolling();
        return;
      }

      // 3. 【关键优化】数据更新（增/删/改）
      // 不重置滚动位置，而是强制重新计算 renderList。
      // 由于使用了 id 作为 key 的一部分：
      // - 如果 item.id 在当前可视区域没变，DOM 不会闪烁，仅更新内容。
      // - 如果 item.id 变了（新增或删除导致位移），DOM 会正确替换。
      updateRenderList(currentScrollOffset, true);

      // 确保动画在运行
      if (!animationFrameId) startScrolling();
    },
    { deep: false }, // 只需要监听数组引用的变化
  );

  // --- 生命周期 ---
  watch(
    () => [props.containerHeight, props.itemHeight],
    () => {
      updateRenderList(currentScrollOffset, true);
    },
  );

  onMounted(() => {
    nextTick(() => {
      startScrolling();
    });
  });

  onUnmounted(() => {
    stopScrolling();
  });

  defineExpose({
    resetScroll,
    startScrolling,
    stopScrolling,
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
    height: 100%;
    overflow: hidden;
  }

  .scroll-content {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    will-change: transform; /* 开启 GPU 硬件加速 */
  }

  .scroll-item {
    position: absolute; /* 绝对定位，实现虚拟列表 */
    left: 0;
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
  }
</style>
