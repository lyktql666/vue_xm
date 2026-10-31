<template>
  <!-- 绑定滚轮事件：@wheel.prevent 阻止页面上下滚动，实现滚轮切图 -->
  <div class="slider-wrapper" @wheel.prevent="handleWheel">
    
    <div
      v-for="(url, index) in images"
      :key="url"
      class="slider-card"
      :style="getCardStyle(index)"
    >
      <!-- 依然保留 Element Plus 的点击放大功能 -->
      <el-image 
        class="img-inner" 
        :src="url" 
        fit="cover"
        :preview-src-list="images"
        :initial-index="index"
        preview-teleported
      />
      <!-- 这是一个透明的遮罩层，盖在左右两边的图片上。点击两边的图片时，用来把它们切到中间来 -->
      <div 
        v-if="currentIndex !== index" 
        class="click-mask" 
        @click.stop="currentIndex = index"
      ></div>
    </div>

    <!-- 左右悬浮箭头 -->
    <div v-if="images.length > 1" class="arrow left" @click.stop="prev">
      <el-icon><ArrowLeft /></el-icon>
    </div>
    <div v-if="images.length > 1" class="arrow right" @click.stop="next">
      <el-icon><ArrowRight /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  images: { type: Array, default: () => [] }
})

const currentIndex = ref(0)
const total = computed(() => props.images.length)

// 滚轮控制 (向下滚=下一张，向上滚=上一张)
const handleWheel = (e) => {
  if (total.value <= 1) return
  if (e.deltaY > 0) next()
  else prev()
}

// 无限循环：(当前+1) % 总数
const next = () => { currentIndex.value = (currentIndex.value + 1) % total.value }
const prev = () => { currentIndex.value = (currentIndex.value - 1 + total.value) % total.value }

// ✨ 核心算法：计算左右无限循环的位置 ✨
const getCardStyle = (index) => {
  if (total.value === 1) {
    return { transform: 'translateX(0) scale(1)', zIndex: 10, opacity: 1 }
  }

  // 1. 计算这算图片距离“当前图片”的距离
  let offset = index - currentIndex.value

  // 2. 闭环修正：让最后一张图自动补到第一张图的左边
  if (offset < -Math.floor(total.value / 2)) offset += total.value
  if (offset > Math.floor(total.value / 2)) offset -= total.value

  // 3. 针对只有 2 张图的特殊情况，强制一左一右
  if (total.value === 2) {
    offset = index - currentIndex.value 
  }

  // 4. 根据偏移量，分配样式
  if (offset === 0) {
    // 正中间的主图
    return { 
      transform: 'translateX(0) scale(1)', 
      zIndex: 10, 
      opacity: 1 
    }
  } else if (offset === -1 || (total.value === 2 && offset === -1)) {
    // 左边的图 (往左平移 40px，缩小到 80%)
    return { 
      transform: 'translateX(-40px) scale(0.8)', 
      zIndex: 5, 
      opacity: 0.6 
    }
  } else if (offset === 1 || (total.value === 2 && offset === 1)) {
    // 右边的图 (往右平移 40px，缩小到 80%)
    return { 
      transform: 'translateX(40px) scale(0.8)', 
      zIndex: 5, 
      opacity: 0.6 
    }
  } else {
    // 其他多余的图，藏在正中间的后面
    return { 
      transform: 'translateX(0) scale(0.5)', 
      zIndex: 1, 
      opacity: 0, 
      pointerEvents: 'none' 
    }
  }
}
</script>

<style scoped>
/* 整个画廊的容器，留出足够的左右空间 */
.slider-wrapper {
  position: relative;
  width: 120px;   /* 容器宽度 */
  height: 60px;   /* 容器高度 */
  margin: 0 auto;
}

/* 每一张卡片的绝对定位（全部默认在正中间堆叠） */
.slider-card {
  position: absolute;
  top: 0;
  left: 50%;
  width: 60px;         /* 图片真实大小 60x60 */
  height: 60px;
  margin-left: -30px;  /* 让 left: 50% 完美居中 */
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  /* 0.4s 阻尼动画，左右切换极其丝滑 */
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.img-inner {
  width: 100%;
  height: 100%;
  display: block;
  background-color: #fff;
}

/* 拦截左右两边图片的点击事件，让它们变成“切换器”而不是“放大器” */
.click-mask {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  cursor: pointer;
  z-index: 20;
}

/* 箭头样式 */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s, background 0.3s;
}

.arrow:hover {
  background: rgba(0, 0, 0, 0.8);
}

/* 鼠标悬停在画廊上时，才显示箭头 */
.slider-wrapper:hover .arrow {
  opacity: 1; 
}

/* 箭头位置刚好在 120px 容器的最外侧 */
.arrow.left { left: 0px; }
.arrow.right { right: 0px; }
</style>