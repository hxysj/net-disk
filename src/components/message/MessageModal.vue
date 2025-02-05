<template>
  <!-- 删除文件的Modal -->
  <div
    class="modal"
    id="exampleModal"
    tabindex="-1"
    v-if="modalMsg.isShow"
    style="display: block"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
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
import { ref } from "vue";

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
</script>

<style scoped lang="scss"></style>
