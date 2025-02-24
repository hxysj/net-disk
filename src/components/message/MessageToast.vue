<template>
  <div
    ref="toastContainer"
    class="toast-container position-fixed p-3"
    style="z-index: 9999"
  ></div>
</template>

<script setup lang="ts">
import * as bootstrap from "bootstrap";
import { ref } from "vue";
// -------------------------------------------------------------------------
// 消息弹窗
const toastContainer = ref();

// 添加拖拽功能
const addDragEvent = (element: HTMLElement) => {
  let isDragging = false;
  let currentX = 0;
  let currentY = 0;
  let initialX = 0;
  let initialY = 0;

  const startDrag = (e: MouseEvent) => {
    isDragging = true;
    initialX = e.clientX - currentX;
    initialY = e.clientY - currentY;
  };

  const doDrag = (e: MouseEvent) => {
    if (!isDragging) return;

    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;

    element.style.transform = `translate(${currentX}px, ${currentY}px)`;
  };

  const stopDrag = () => {
    isDragging = false;
  };

  element.style.cursor = "move";
  element.addEventListener("mousedown", startDrag);
  document.addEventListener("mousemove", doDrag);
  document.addEventListener("mouseup", stopDrag);

  // 清理事件监听
  const cleanup = () => {
    element.removeEventListener("mousedown", startDrag);
    document.removeEventListener("mousemove", doDrag);
    document.removeEventListener("mouseup", stopDrag);
  };

  return cleanup;
};

// 展示消息弹窗，默认自动关闭
const showToast = (
  obj: {
    type: string;
    message: string;
    duration: number;
  } = { type: "error", message: "错误信息", duration: 0 }
) => {
  const toastEl = document.createElement("div");
  toastEl.className = "toast";
  toastEl.role = "alert";
  toastEl.ariaLive = "assertive";
  toastEl.ariaAtomic = "true";
  if (obj.type === "success") {
    toastEl.classList.add("bg-primary");
  } else if (obj.type === "error") {
    toastEl.classList.add("bg-danger");
  } else {
    toastEl.classList.add("bg-warning");
  }
  toastEl.classList.add("text-white");
  // Create Toast content
  toastEl.innerHTML = `
            <div class="toast-body">
            ${obj.message}
            </div>
        `;
  toastContainer.value.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl);
  toast.show();

  // 添加拖拽功能
  const cleanup = addDragEvent(toastEl);

  // Automatically hide the Toast after 3 seconds
  if (obj.duration > 0) {
    setTimeout(() => {
      toast.hide();
      // 清理事件监听
      cleanup();
      // 移除元素
      setTimeout(() => {
        toastEl.remove();
      }, 500); // 等待隐藏动画完成
    }, obj.duration);
  }
};
defineExpose({ showToast });
</script>

<style scoped lang="scss">
.toast-container {
  right: 0;
  top: 0;

  .toast {
    user-select: none;
    position: relative;
    transition: none;
    margin-bottom: 0.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
