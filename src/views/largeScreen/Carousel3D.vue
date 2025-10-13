<template>
  <div class="carousel-3d-container">
    <div
      class="carousel-3d-wrapper"
      :style="{
        perspective: `${perspective}px`,
        transform: `rotateX(${baseTiltAngle}deg)`,
      }"
      @mousedown="startDrag"
      @mousemove="handleDrag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
    >
      <div class="carousel-3d-list" ref="carouselList" :style="carouselListStyle">
        <div
          v-for="(item, renderIndex) in fullCarouselItems"
          :key="`carousel-item-${renderIndex}`"
          class="carousel-3d-item"
          :style="getItemStyle(renderIndex)"
          @click="handleCardClick(renderIndex, item)"
        >
          <img
            :src="item.imgUrl"
            :alt="item.alt || `轮播图${getOriginalIndex(renderIndex) + 1}`"
            class="carousel-3d-img"
            loading="lazy"
            @error="(e) => handleImgError(e, item)"
            @click.stop="switchToCard(renderIndex)"
          />
          <template v-if="item.title">
            <div
              class="carousel-3d-title"
              :style="{ backgroundColor: item.bColor }"
              @click.stop="showTitleAlert(item)"
            >
              {{ item.title }}
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 控制按钮和指示器 -->
    <template v-if="showControls && !isSingleItem">
      <button class="carousel-3d-btn prev-btn" @click="prevCard" aria-label="上一张">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 12H5M5 12l7 7M5 12l7-7" />
        </svg>
      </button>
      <button class="carousel-3d-btn next-btn" @click="nextCard" aria-label="下一张">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M5 12h14M19 12l-7 7M19 12l-7-7" />
        </svg>
      </button>
    </template>

    <template v-if="showIndicators && !isSingleItem">
      <div class="carousel-3d-indicators">
        <span
          v-for="(item, originalIndex) in safeCarouselItems"
          :key="`indicator-${originalIndex}`"
          class="indicator-dot"
          :class="{ active: getOriginalIndex(currentIndex) === originalIndex }"
          @click="switchToOriginalIndex(originalIndex)"
        ></span>
      </div>
    </template>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, computed, watch } from 'vue';

  // Props定义
  const props = defineProps({
    items: {
      type: Array,
      required: true,
      validator: (val) => Array.isArray(val) && val.every((item) => item?.imgUrl),
    },
    //轮询时间
    autoPlayTime: {
      type: Number,
      default: 3000,
      validator: (val) => val >= 0,
    },
    //图圈的大小
    perspective: {
      type: Number,
      default: 1000,
      validator: (val) => val > 0,
    },
    //一个动作完成时间
    duration: {
      type: Number,
      default: 800,
    },
    //是否显示控制器
    showControls: {
      type: Boolean,
      default: true,
    },
    showIndicators: {
      type: Boolean,
      default: true,
    },
    //图片加载失败的替代图片
    fallbackImg: {
      type: String,
      default: 'https://picsum.photos/300/200',
    },
    //图片大小比例
    cardWidthRatio: {
      // 修改为比例而非固定像素
      type: Number,
      default: 0.2, // 卡片宽度为父容器宽度的20%
      validator: (val) => val > 0 && val < 0.5,
    },
    //卡片计数比率
    cardCountRatio: {
      type: Number,
      default: 1,
    },
    //基线倾斜角度
    baseTiltAngle: {
      type: Number,
      default: 15,
    },
    //轮播内容倾斜幅度
    tiltAmplitude: {
      type: Number,
      default: 8,
    },
  });

  // 核心状态管理
  const currentIndex = ref(0);
  const carouselList = ref(null);
  const autoPlayTimer = ref(null);
  const isTransitioning = ref(false);
  const isDragging = ref(false);
  const startMouseX = ref(0);
  const totalDragDistance = ref(0);
  const dragThreshold = ref(10);
  const parentSize = ref({ width: 0, height: 0 }); // 父容器尺寸

  // 计算属性
  const safeCarouselItems = computed(() => {
    return props.items.filter((item) => item && item.imgUrl) || [];
  });
  const originalCount = computed(() => safeCarouselItems.value.length);
  const isSingleItem = computed(() => originalCount.value <= 1);
  const fullCarouselItems = computed(() => {
    if (isSingleItem.value) return safeCarouselItems.value;
    const copyCount = Math.ceil((originalCount.value * props.cardCountRatio) / 2);
    const backCopies = safeCarouselItems.value.slice(-copyCount);
    const frontCopies = safeCarouselItems.value.slice(0, copyCount);
    return [...backCopies, ...safeCarouselItems.value, ...frontCopies];
  });
  const fullCount = computed(() => fullCarouselItems.value.length);
  const angle = computed(() => {
    return isSingleItem.value ? 0 : 360 / fullCount.value;
  });

  // 基于父容器宽度计算卡片尺寸
  const cardWidth = computed(() => {
    return parentSize.value.width * props.cardWidthRatio;
  });

  const translateZ = computed(() => {
    if (isSingleItem.value || parentSize.value.width === 0) return 0;
    return Math.round(cardWidth.value / (2 * Math.tan(Math.PI / fullCount.value)));
  });

  // 索引映射
  const getOriginalIndex = (renderIndex) => {
    if (isSingleItem.value) return 0;
    const backCopyCount = Math.ceil((originalCount.value * props.cardCountRatio) / 2);
    const normalizedIndex = ((renderIndex % fullCount.value) + fullCount.value) % fullCount.value;

    if (normalizedIndex < backCopyCount) {
      return originalCount.value - backCopyCount + normalizedIndex;
    }
    if (normalizedIndex >= backCopyCount + originalCount.value) {
      return normalizedIndex - (backCopyCount + originalCount.value);
    }
    return normalizedIndex - backCopyCount;
  };
  const getRenderIndex = (originalIndex) => {
    if (isSingleItem.value || originalIndex < 0 || originalIndex >= originalCount.value) return 0;
    const backCopyCount = Math.ceil((originalCount.value * props.cardCountRatio) / 2);
    return backCopyCount + originalIndex;
  };

  // 样式计算
  const carouselListStyle = computed(() => {
    if (isSingleItem.value) return { transform: 'none' };
    return {
      transform: `translateZ(-${translateZ.value}px) rotateY(${-currentIndex.value * angle.value}deg)`,
      transition: isTransitioning.value
        ? `transform ${props.duration}ms cubic-bezier(0.25, 1, 0.5, 1)`
        : 'none',
      transformStyle: 'preserve-3d',
      width: '100%',
      height: '100%',
    };
  });

  const getItemStyle = (renderIndex) => {
    // 卡片高度为宽度的70%保持比例
    const cardHeight = cardWidth.value * 0.7;

    if (isSingleItem.value) {
      return {
        opacity: 1,
        scale: 1.1,
        zIndex: 10,
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: `${cardWidth.value}px`,
        height: `${cardHeight}px`,
        margin: `-${cardHeight / 2}px 0 0 -${cardWidth.value / 2}px`,
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        background: '#fff',
        overflow: 'hidden',
        cursor: 'pointer',
      };
    }

    const indexDiff = renderIndex - currentIndex.value;
    const normalizedDiff = ((indexDiff % fullCount.value) + fullCount.value) % fullCount.value;
    const angleDiff = normalizedDiff * angle.value;
    const isFront = angleDiff >= 0 && angleDiff <= 180;

    const itemTiltAngle = isFront
      ? props.baseTiltAngle + props.tiltAmplitude
      : -props.baseTiltAngle - props.tiltAmplitude;

    const isBackFace = Math.abs(indexDiff) > fullCount.value / 4;

    return {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: `${cardWidth.value}px`,
      height: `${cardHeight}px`,
      margin: `-${cardHeight / 2}px 0 0 -${cardWidth.value / 2}px`,
      transform: `rotateY(${renderIndex * angle.value}deg) translateZ(${translateZ.value}px) rotateX(${itemTiltAngle}deg)`,
      opacity: isBackFace ? 0.45 : 0.75,
      scale: 0.95,
      zIndex: isFront
        ? fullCount.value + (fullCount.value - Math.abs(indexDiff))
        : Math.abs(indexDiff),
      transition: `opacity ${props.duration}ms ease, scale ${props.duration}ms ease, transform ${props.duration}ms cubic-bezier(0.25, 1, 0.5, 1)`,
      transformStyle: 'preserve-3d',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
      background: '#fff',
      overflow: 'hidden',
      cursor: 'pointer',
    };
  };

  // 轮播控制方法
  const switchToCard = (targetRenderIndex) => {
    if (isSingleItem.value || isTransitioning.value) return;
    isTransitioning.value = true;
    currentIndex.value = targetRenderIndex;

    setTimeout(() => {
      const backCopyCount = Math.ceil((originalCount.value * props.cardCountRatio) / 2);
      const frontCopyStart = backCopyCount + originalCount.value;
      if (currentIndex.value < backCopyCount) {
        currentIndex.value = currentIndex.value + originalCount.value;
      } else if (currentIndex.value >= frontCopyStart) {
        currentIndex.value = currentIndex.value - originalCount.value;
      }
      isTransitioning.value = false;
      resetAutoPlay();
    }, props.duration);
  };

  const switchToOriginalIndex = (originalIndex) => {
    if (originalIndex < 0 || originalIndex >= originalCount.value) return;
    switchToCard(getRenderIndex(originalIndex));
  };

  const prevCard = () => switchToCard(currentIndex.value - 1);
  const nextCard = () => switchToCard(currentIndex.value + 1);

  // 拖拽事件处理
  const startDrag = (e) => {
    if (isSingleItem.value || e.button !== 0) return;

    isDragging.value = true;
    startMouseX.value = e.clientX;
    totalDragDistance.value = 0;
    clearInterval(autoPlayTimer.value);
  };

  const handleDrag = (e) => {
    if (!isDragging.value) return;

    const deltaX = e.clientX - startMouseX.value;
    totalDragDistance.value += Math.abs(deltaX);

    if (totalDragDistance.value > dragThreshold.value) {
      const direction = deltaX > 0 ? -1 : 1;
      switchToCard(currentIndex.value + direction);
      startMouseX.value = e.clientX;
    }
  };

  const endDrag = () => {
    if (isDragging.value) {
      isDragging.value = false;
      resetAutoPlay();
    }
  };

  // 尺寸监听与更新
  const updateParentSize = () => {
    if (carouselList.value && carouselList.value.parentElement) {
      const parent = carouselList.value.parentElement.parentElement; // 获取最外层容器
      const rect = parent.getBoundingClientRect();
      parentSize.value = {
        width: rect.width,
        height: rect.height,
      };
      console.log('父容器尺寸更新', parentSize.value);
    }
  };

  // 其他辅助方法
  const handleImgError = (e, item) => {
    e.target.src = props.fallbackImg;
    item.imgUrl = props.fallbackImg;
  };

  const showTitleAlert = (item) => {
    const originalIdx = getOriginalIndex(currentIndex.value);
    alert(`标题：${item.title || '无标题'}\n序号：${originalIdx + 1}/${originalCount.value}`);
  };

  const startAutoPlay = () => {
    if (props.autoPlayTime <= 0 || isSingleItem.value || isDragging.value) return;
    if (autoPlayTimer.value) clearInterval(autoPlayTimer.value);
    autoPlayTimer.value = setInterval(() => {
      if (!isTransitioning.value) nextCard();
    }, props.autoPlayTime);
  };

  const resetAutoPlay = () => startAutoPlay();

  // 点击事件处理
  const handleCardClick = (renderIndex, item) => {
    if (!isDragging.value) {
      console.log('卡片点击事件触发', {
        渲染索引: renderIndex,
        原始索引: getOriginalIndex(renderIndex),
        卡片数据: item,
      });
      alert(`点击了${item.title || '轮播卡片'}（索引：${getOriginalIndex(renderIndex) + 1}）`);
    }
  };

  // 生命周期
  onMounted(() => {
    // 初始化父容器尺寸
    updateParentSize();
    // 监听窗口大小变化以更新尺寸
    window.addEventListener('resize', updateParentSize);

    if (!isSingleItem.value) {
      currentIndex.value = getRenderIndex(Math.floor(originalCount.value / 2));
    }
    startAutoPlay();
  });

  onUnmounted(() => {
    if (autoPlayTimer.value) clearInterval(autoPlayTimer.value);
    window.removeEventListener('resize', updateParentSize);
  });

  watch(
    safeCarouselItems,
    () => {
      if (!isSingleItem.value) {
        currentIndex.value = getRenderIndex(Math.floor(originalCount.value / 2));
      }
      resetAutoPlay();
    },
    { deep: true },
  );

  // 监听父容器尺寸变化，更新轮播样式
  watch(parentSize, () => {
    // 尺寸变化时重新计算布局
    if (carouselList.value) {
      carouselList.value.style.transition = 'none';
      // 触发重绘
      carouselList.value.offsetHeight;
      carouselList.value.style.transition = isTransitioning.value
        ? `transform ${props.duration}ms cubic-bezier(0.25, 1, 0.5, 1)`
        : 'none';
    }
  });
</script>

<style scoped>
  /* 核心修改：使用100%宽高，移除固定尺寸 */
  .carousel-3d-container {
    /* 确保父级元素有定位上下文 */
    position: relative;
    width: 100% !important;
    height: 100% !important;
    overflow: visible;
    user-select: none;
  }

  .carousel-3d-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    perspective-origin: center 25%;
    cursor: grab;
  }

  .carousel-3d-wrapper:active {
    cursor: grabbing;
  }

  .carousel-3d-list {
    position: relative;
    height: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .carousel-3d-item {
    transform-style: preserve-3d;
    pointer-events: auto;
  }

  .carousel-3d-img {
    display: block;
    width: 100%;
    height: 65%;
    object-fit: cover;
    cursor: pointer;
  }

  .carousel-3d-title {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 35%;
    padding: 0 12px;
    overflow: hidden;
    background: #f8f9fa;
    color: #333;
    font-size: 16px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }

  /* 控制按钮使用相对定位，适应父容器大小 */
  .carousel-3d-btn {
    position: absolute;
    z-index: 20;
    top: 50%;
    width: 60px;

    /* 按钮大小随父容器变化 */
    width: clamp(40px, 5vw, 60px);
    height: 60px;
    height: clamp(40px, 5vw, 60px);
    transform: translateY(-50%);
    border: none;
    border-radius: 50%;
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 4px 16px rgb(0 0 0 / 15%);
    color: #333;
    cursor: pointer;
  }

  .prev-btn {
    left: 2%;
  }

  .next-btn {
    right: 2%;
  }

  /* 指示器位置调整为相对底部 */
  .carousel-3d-indicators {
    display: flex;
    position: absolute;
    z-index: 20;
    bottom: 3%;
    left: 50%;
    transform: translateX(-50%);
    gap: 12px;
  }

  .indicator-dot {
    width: 12px;
    height: 12px;
    transition: all 0.3s ease;
    border-radius: 50%;
    background: rgb(255 255 255 / 60%);
    box-shadow: 0 2px 8px rgb(0 0 0 / 20%);
    cursor: pointer;
  }

  .indicator-dot.active {
    width: 40px;
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 2px 8px rgb(0 123 255 / 40%);
  }

  /* 移除移动端适配，专注PC端 */
</style>
