<!-- SeamlessScrollList.vue -->
<template>
  <div
    class="seamless-scroll-container"
    :style="{ height: containerHeight }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    ref="container"
  >
    <div class="scroll-wrapper">
      <div
        class="scroll-content"
        :class="{ paused: isPaused || (pauseOnHover && isHovering) }"
        :style="scrollContentStyle"
        ref="scrollContent"
      >
        <!-- 使用两个相同的列表实现无缝循环 -->
        <div class="scroll-section" v-for="section in 2" :key="section">
          <div
            v-for="(item, index) in props.list"
            :key="getItemKey(item, index, section)"
            class="scroll-item"
          >
            <slot :item="item" :index="index">
              <!-- 默认插槽内容 -->
              <div class="default-item">
                {{ item }}
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch, nextTick, CSSProperties } from 'vue';

  // 定义组件属性
  interface Props {
    // 数据列表
    list: any[];
    // 容器高度
    containerHeight?: string;
    // 滚动速度（像素/秒）
    speed?: number;
    // 是否自动开始
    autoStart?: boolean;
    // 是否暂停
    paused?: boolean;
    // 鼠标悬停时是否暂停
    pauseOnHover?: boolean;
    // 数据项的唯一键字段名
    itemKey?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    containerHeight: '300px',
    speed: 30, // 默认30像素/秒
    autoStart: true,
    paused: false,
    pauseOnHover: true,
    itemKey: 'id',
  });

  // 定义事件
  const emit = defineEmits<{
    itemClick: [item: any, index: number];
  }>();

  // 响应式数据
  const container = ref<HTMLElement | null>(null);
  const scrollContent = ref<HTMLElement | null>(null);
  const isPaused = ref(!props.autoStart || props.paused);
  const isHovering = ref(false);
  const currentOffset = ref(0);
  const contentHeight = ref(0);
  const containerHeightPx = ref(0);

  // 内存管理相关变量
  const isMounted = ref(false);
  let memoryLeakCheck = 0;
  const MAX_MEMORY_CHECKS = 1000;
  let resizeObserver: ResizeObserver | null = null;

  // 计算属性
  const scrollContentStyle = computed<CSSProperties>(() => {
    return {
      transform: `translateY(${currentOffset.value}px)`,
      transition: 'none', // 禁用过渡，防止抖动
    };
  });

  // 方法
  const getItemKey = (item: any, index: number, section: number): string => {
    if (props.itemKey && item[props.itemKey]) {
      return `${item[props.itemKey]}-section-${section}`;
    }
    return `item-${index}-section-${section}`;
  };

  const handleMouseEnter = () => {
    isHovering.value = true;
  };

  const handleMouseLeave = () => {
    isHovering.value = false;
  };

  // 计算尺寸
  const calculateSizes = () => {
    if (!isMounted.value || !container.value || !scrollContent.value) return;

    try {
      // 获取容器高度
      containerHeightPx.value = container.value.clientHeight;

      // 计算内容高度（一个section的高度）
      const sections = scrollContent.value.querySelectorAll('.scroll-section');
      if (sections.length > 0) {
        const firstSection = sections[0] as HTMLElement;
        contentHeight.value = firstSection.offsetHeight || 0;
      }
    } catch (error) {
      console.warn('计算尺寸时发生错误:', error);
    }
  };

  // 优化的防抖函数
  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number,
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // 防抖的计算尺寸函数
  const debouncedCalculateSizes = debounce(calculateSizes, 100);

  // 滚动控制
  let animationFrameId: number | null = null;
  let lastTimestamp: number | null = null;

  const animateScroll = (timestamp: number) => {
    if (!isMounted.value) {
      return;
    }

    if (!lastTimestamp) lastTimestamp = timestamp;

    const elapsed = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // 内存保护：定期重置计数器
    memoryLeakCheck++;
    if (memoryLeakCheck > MAX_MEMORY_CHECKS) {
      memoryLeakCheck = 0;
      // 强制重置滚动位置，防止长时间运行导致的精度问题
      if (Math.abs(currentOffset.value) >= contentHeight.value) {
        currentOffset.value = 0;
      }
    }

    if (!isPaused.value && !(props.pauseOnHover && isHovering.value) && contentHeight.value > 0) {
      // 计算滚动速度（像素/毫秒）- 固定速度
      const scrollSpeed = props.speed / 1000; // 转换为像素/毫秒

      // 更新偏移量
      currentOffset.value -= scrollSpeed * elapsed;

      // 当滚动超过一个section高度时，重置位置
      if (Math.abs(currentOffset.value) >= contentHeight.value) {
        currentOffset.value = 0;
      }
    }

    if (isMounted.value) {
      animationFrameId = requestAnimationFrame(animateScroll);
    }
  };

  // 控制方法
  const play = () => {
    isPaused.value = false;
  };

  const pause = () => {
    isPaused.value = true;
  };

  const toggle = () => {
    isPaused.value = !isPaused.value;
  };

  // 重置滚动位置
  const resetScroll = () => {
    currentOffset.value = 0;
  };

  // 强制清理方法 - 用于内存管理
  const forceCleanup = () => {
    currentOffset.value = 0;
    memoryLeakCheck = 0;

    // 取消当前动画帧
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // 重新启动动画
    if (isMounted.value && !isPaused.value) {
      lastTimestamp = null;
      animationFrameId = requestAnimationFrame(animateScroll);
    }
  };

  // 暴露方法给父组件
  defineExpose({
    play,
    pause,
    toggle,
    resetScroll,
    forceCleanup, // 新增内存清理方法
  });

  // 监听属性变化
  watch(
    () => props.paused,
    (newVal) => {
      isPaused.value = newVal;
    },
  );

  // 优化列表监听 - 使用浅监听和性能优化
  watch(
    () => props.list,
    async (newList, oldList) => {
      if (!isMounted.value) return;

      // 只有当列表实际发生变化时才重新计算
      const isSameLength = newList.length === oldList.length;
      const isSameContent =
        isSameLength &&
        newList.every((item, index) => {
          const oldItem = oldList[index];
          return oldItem && item[props.itemKey || 'id'] === oldItem[props.itemKey || 'id'];
        });

      if (!isSameLength || !isSameContent) {
        await nextTick();
        if (isMounted.value) {
          calculateSizes();
        }
      }
    },
    { deep: false }, // 改为浅监听，提高性能
  );

  // 监听容器高度变化
  watch(
    () => props.containerHeight,
    () => {
      if (!isMounted.value) return;

      nextTick(() => {
        if (isMounted.value) {
          debouncedCalculateSizes();
        }
      });
    },
  );

  // 监听速度变化
  watch(
    () => props.speed,
    () => {
      // 速度变化时不需要特殊处理，因为速度是实时计算的
    },
  );

  // 初始化 ResizeObserver 监听容器尺寸变化
  const initResizeObserver = () => {
    if (!container.value) return;

    try {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === container.value) {
            debouncedCalculateSizes();
          }
        }
      });

      resizeObserver.observe(container.value);
    } catch (error) {
      console.warn('ResizeObserver 初始化失败，回退到窗口 resize 监听:', error);
      // 回退到窗口 resize 监听
      window.addEventListener('resize', debouncedCalculateSizes);
    }
  };

  // 生命周期
  onMounted(() => {
    isMounted.value = true;

    // 初始计算尺寸
    nextTick(() => {
      calculateSizes();
    });

    // 初始化尺寸变化监听
    initResizeObserver();

    // 开始动画
    if (props.autoStart && !props.paused) {
      isPaused.value = false;
    }

    // 启动动画循环
    animationFrameId = requestAnimationFrame(animateScroll);
  });

  // 完整的清理函数
  const completeCleanup = () => {
    isMounted.value = false;

    // 清理动画帧
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // 清理 ResizeObserver
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    // 移除事件监听器
    window.removeEventListener('resize', debouncedCalculateSizes);

    // 清理响应式引用
    container.value = null;
    scrollContent.value = null;

    // 重置状态
    currentOffset.value = 0;
    memoryLeakCheck = 0;
    lastTimestamp = null;
  };

  onUnmounted(() => {
    completeCleanup();
  });
</script>

<style scoped>
  .seamless-scroll-container {
    position: relative;
    overflow: hidden;
  }

  .scroll-wrapper {
    position: relative;
    height: 100%;
    overflow: hidden;
  }

  .scroll-content {
    position: absolute;
    width: 100%;
    will-change: transform; /* 优化性能 */
  }

  .scroll-section {
    width: 100%;
  }

  .scroll-item {
    width: 100%;
  }

  .default-item {
    padding: 10px;
    border-bottom: 1px solid #eee;
  }
</style>
