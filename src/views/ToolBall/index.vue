<template>
  <div
    class="tool-ball"
    ref="toolBallRef"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
      position: 'fixed',
    }"
    :class="{
      'is-collapsed': isCollapsed,
      'is-left': isLeft,
    }"
    @mousedown="startDrag"
    @click="toggleCollapse"
  >
    <div class="ball-content">
      <div class="ball-icon" :style="{ background: ballBackground }">
        <div class="usage-text" v-if="!isCollapsed">
          {{ Math.round(spaceUsagePercent) }}%
        </div>
      </div>
      <div
        class="tool-options"
        v-show="!isCollapsed"
        :style="{
          top: menuPosition.top,
          transform: menuPosition.transform,
        }"
      >
        <template v-if="!isUpload">
          <div class="tool-item" @click.stop="showUpload">
            <span>上传文件</span>
          </div>
          <div class="tool-item" @click.stop="handleAIChat">
            <span>AI问答</span>
          </div>
        </template>
        <div
          class="upload-container"
          v-if="isUpload"
          @dragover.prevent
          @dragenter="isDrag = true"
          @dragleave="isDrag = false"
          @drop="handleUpload"
          @click.stop
        >
          <img src="/src/assets/icon-image/no_data.png" class="upload-img" />
          <span v-if="!isDrag">将文件拖拽到此处可进行上传</span>
          <span v-else>释放可上传文件</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  userSpace: {
    type: Number,
    default: 0,
  },
  totalSpace: {
    type: Number,
    default: 1,
  },
});
console.log(props);
const router = useRouter();
const emit = defineEmits(["addFile"]);

const toolBallRef = ref<HTMLElement>();
const isCollapsed = ref(true); // 控制是否折叠
const isUpload = ref(false); // 控制是否显示上传组件
const isDrag = ref(false);
// 修改初始位置到右边
const position = ref({
  x: window.innerWidth - 35, // 初始位置只露出一半
  y: 20,
});

let isDragging = false;
let startPos = { x: 0, y: 0 };

// 开始拖拽
const startDrag = (e: MouseEvent) => {
  isDragging = true;
  startPos = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y,
  };

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
};

// 拖拽中
const onDrag = (e: MouseEvent) => {
  if (!isDragging) return;

  let newX = e.clientX - startPos.x;
  let newY = e.clientY - startPos.y;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const ballWidth = toolBallRef.value?.offsetWidth || 0;
  const ballHeight = toolBallRef.value?.offsetHeight || 0;

  // 限制边界
  newX = Math.max(0, Math.min(newX, viewportWidth - ballWidth));
  newY = Math.max(0, Math.min(newY, viewportHeight - ballHeight));

  position.value = { x: newX, y: newY };
};

// 切换折叠状态
const toggleCollapse = () => {
  if (!isDragging) {
    // 只有非拖拽状态才触发折叠
    isCollapsed.value = !isCollapsed.value;
    const ballWidth = toolBallRef.value?.offsetWidth || 0;

    // 更新位置
    if (position.value.x > window.innerWidth / 2) {
      // 在右边时
      position.value.x = isCollapsed.value
        ? window.innerWidth - ballWidth / 2 // 折叠时露出一半
        : window.innerWidth - ballWidth - 20; // 展开时完全显示
    } else {
      // 在左边时
      position.value.x = isCollapsed.value ? -ballWidth / 2 : 20;
    }
  }
  isUpload.value = false;
};

// 停止拖拽时自动贴边
const stopDrag = () => {
  isDragging = false;

  const viewportWidth = window.innerWidth;
  const ballWidth = toolBallRef.value?.offsetWidth || 0;

  // 根据距离判断贴哪边
  if (viewportWidth - (position.value.x + ballWidth) < position.value.x) {
    // 贴右边
    position.value.x = isCollapsed.value
      ? viewportWidth - ballWidth / 2
      : viewportWidth - ballWidth - 20;
  } else {
    // 贴左边
    position.value.x = isCollapsed.value ? -ballWidth / 2 : 20;
  }

  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
};

// 监听窗口大小变化，确保球始终在可视区域内
const handleResize = () => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const ballWidth = toolBallRef.value?.offsetWidth || 0;
  const ballHeight = toolBallRef.value?.offsetHeight || 0;

  position.value = {
    x: Math.min(position.value.x, viewportWidth - ballWidth),
    y: Math.min(position.value.y, viewportHeight - ballHeight),
  };
};

// 处理上传文件
const showUpload = () => {
  isUpload.value = true;
};

const handleUpload = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDrag.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    emit("addFile", { file: files[0], filePid: 0 });
    isUpload.value = false;
  }
};

// 处理AI对话
const handleAIChat = (e: MouseEvent) => {
  router.push("/message/session");
};

// 添加一个计算属性判断是否在左边
const isLeft = computed(() => {
  return position.value.x < window.innerWidth / 2;
});

// 添加计算属性计算空间使用率和背景色
const spaceUsagePercent = computed(() => {
  return props.totalSpace ? (props.userSpace / props.totalSpace) * 100 : 0;
});

// 计算背景色
const ballBackground = computed(() => {
  const percent = spaceUsagePercent.value;
  const blueColor = `rgba(59, 130, 246, ${percent / 100})`; // 蓝色的透明度根据使用率变化
  return `linear-gradient(135deg, 
    white 0%, 
    ${blueColor} ${percent}%, 
    white 100%
  )`;
});

// 计算菜单位置
const menuPosition = computed(() => {
  const ballHeight = toolBallRef.value?.offsetHeight || 0;
  const menuHeight = 250; // 菜单最大高度
  let top = "50%";
  let transform = "translateY(-50%)";

  // 如果球体太靠近顶部
  if (position.value.y < menuHeight / 2) {
    top = "0";
    transform = "translateY(0)";
  }
  // 如果球体太靠近底部
  else if (position.value.y > window.innerHeight - menuHeight / 2) {
    top = "auto";
    transform = "translateY(-100%)";
  }

  return { top, transform };
});

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
  window.removeEventListener("resize", handleResize);
});
</script>

<style lang="scss" scoped>
.tool-ball {
  position: fixed;
  z-index: 1000;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.is-collapsed {
    .ball-content {
      opacity: 0.85;
      transform: scale(0.95);

      .tool-options {
        opacity: 0;
        visibility: hidden;
        transform: translateX(10px);
      }

      &:hover {
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  .ball-content {
    width: 48px;
    height: 48px;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    .ball-icon {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      position: relative;
      background-color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08),
        inset 0 0 0 1.5px rgba(59, 130, 246, 0.15),
        inset 0 2px 4px rgba(255, 255, 255, 0.9);
      overflow: hidden;
      transition: all 0.3s ease;
      backdrop-filter: blur(8px);

      &::before {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(
          circle at 30% 30%,
          rgba(255, 255, 255, 0.9) 0%,
          rgba(255, 255, 255, 0.4) 30%,
          transparent 70%
        );
        opacity: 0.9;
      }

      &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.5) 0%,
          transparent 40%,
          rgba(255, 255, 255, 0.3) 100%
        );
        border-radius: 50%;
        filter: blur(1px);
      }

      .usage-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 13px;
        color: #3b82f6;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.95);
        z-index: 2;
      }

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1),
          inset 0 0 0 1.5px rgba(59, 130, 246, 0.25),
          inset 0 2px 4px rgba(255, 255, 255, 0.95);
      }
    }

    .tool-options {
      position: absolute;
      right: 60px;
      background: rgba(255, 255, 255, 0.98);
      border-radius: 14px;
      padding: 10px;
      min-width: 150px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08),
        inset 0 0 0 1px rgba(255, 255, 255, 0.5);
      opacity: 1;
      visibility: visible;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &::before {
        content: "";
        position: absolute;
        right: -8px;
        top: 50%;
        transform: translateY(-50%);
        border: 8px solid transparent;
        border-left-color: rgba(255, 255, 255, 0.98);
        filter: drop-shadow(2px 0 2px rgba(0, 0, 0, 0.02));
      }

      .tool-item {
        padding: 12px 16px;
        margin: 4px 0;
        display: flex;
        align-items: center;
        gap: 12px;
        border-radius: 10px;
        transition: all 0.2s ease;
        color: #374151;

        &:hover {
          background-color: rgba(59, 130, 246, 0.08);
          transform: translateX(2px);
          color: #3b82f6;
        }

        span {
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s ease;
        }
      }

      .upload-container {
        width: 250px;
        height: 250px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 13px;
        color: #6b7280;
        border-radius: 12px;
        border: 2px dashed rgba(59, 130, 246, 0.2);
        transition: all 0.2s ease;

        &:hover {
          border-color: rgba(59, 130, 246, 0.4);
          background-color: rgba(59, 130, 246, 0.02);
        }

        .upload-img {
          width: 120px;
          height: 120px;
          margin-bottom: 12px;
          opacity: 0.8;
        }
      }
    }
  }

  &.is-left {
    .ball-content {
      .tool-options {
        right: auto;
        left: 60px;

        &::before {
          right: auto;
          left: -8px;
          border-color: transparent rgba(255, 255, 255, 0.98) transparent
            transparent;
        }
      }
    }
  }
}

@keyframes shine {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(90deg);
  }
  50% {
    transform: rotate(180deg);
  }
  75% {
    transform: rotate(270deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 暗色主题支持
@media (prefers-color-scheme: dark) {
  .tool-ball {
    .ball-content {
      .ball-icon {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);

        &:hover {
          background: linear-gradient(135deg, #3b82f6 20%, #1d4ed8 80%);
        }
      }
    }
  }
}
</style>
