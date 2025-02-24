<template>
  <div
    class="modal"
    id="exampleModal"
    tabindex="-1"
    v-if="modalMsg.isShow"
    style="display: block"
  >
    <div class="modal-dialog" ref="modalRef">
      <div class="modal-content">
        <div
          class="modal-header"
          @mousedown="startDrag"
          :style="{ cursor: 'move' }"
        >
          <h1 class="modal-title fs-5" id="exampleModalLabel">
            {{ modalMsg.title }}
          </h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="closeModalMsg"
          ></button>
        </div>
        <div class="modal-body">
          {{ modalMsg.msg }}
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
            @click="closeModalMsg"
          >
            取消
          </button>
          <button type="button" class="btn btn-primary" @click="submit">
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

// 提示框信息
const modalMsg = ref({
  isShow: false,
  msg: "",
  title: "温馨提示！",
  type: "",
});

const openMessage = (obj: { message: string; title: string }) => {
  (modalMsg.value.isShow = true),
    (modalMsg.value.msg = obj.message),
    (modalMsg.value.title = obj.title);
};

defineExpose({ openMessage });

// 取消模态框
const closeModalMsg = () => {
  modalMsg.value = {
    isShow: false,
    msg: "",
    title: "温馨提示！",
    type: "",
  };
};

const emit = defineEmits(["submit"]);

// 模态框内的确定
const submit = () => {
  emit("submit");
  closeModalMsg();
};

const modalRef = ref<HTMLElement>();
let isDragging = false;
let currentX = 0;
let currentY = 0;
let initialX = 0;
let initialY = 0;

const startDrag = (e: MouseEvent) => {
  if (!modalRef.value) return;

  isDragging = true;
  initialX = e.clientX - currentX;
  initialY = e.clientY - currentY;

  modalRef.value.style.cursor = "move";
};

const doDrag = (e: MouseEvent) => {
  if (!isDragging || !modalRef.value) return;

  e.preventDefault();
  currentX = e.clientX - initialX;
  currentY = e.clientY - initialY;

  modalRef.value.style.transform = `translate(${currentX}px, ${currentY}px)`;
};

const stopDrag = () => {
  if (!modalRef.value) return;

  isDragging = false;
  modalRef.value.style.cursor = "default";
};

onMounted(() => {
  document.addEventListener("mousemove", doDrag);
  document.addEventListener("mouseup", stopDrag);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", doDrag);
  document.removeEventListener("mouseup", stopDrag);
});
</script>

<style scoped lang="scss">
.modal-dialog {
  transition: none; // 移除过渡效果使拖动更流畅
  user-select: none; // 防止拖动时选中文本
}
</style>
