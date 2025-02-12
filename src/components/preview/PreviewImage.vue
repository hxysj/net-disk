<template>
  <div class="image-riewer" v-if="isModalVisible">
    <div
      class="modal"
      tabindex="-1"
      style="display: block"
      @click.self="closeModal"
    >
      <div
        class="modal-dialog modal-dialog-centered"
        :style="{ transform: 'rotate( ' + rotation + 'deg)' }"
      >
        <div class="modal-content">
          <div class="modal-body">
            <img :src="imageUrl" class="img-fluid" alt="Image Preview" />
          </div>
        </div>
      </div>
    </div>
    <div class="body-close">
      <button class="btn btn-close" @click="closeModal"></button>
    </div>
    <div class="changeImg">
      <span class="iconfont icon-revert" @click="rotateImage"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isModalVisible = ref(false);
defineProps(["imageUrl"]);
const closeModal = () => {
  isModalVisible.value = false;
};

const rotateImage = () => {
  rotation.value += 90; // 每次点击旋转90度
};

const show = () => {
  isModalVisible.value = true;
};

defineExpose({ show });
const rotation = ref(0);
</script>

<style lang="scss" scoped>
.image-riewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  .body-close {
    position: absolute;
    right: 40px;
    top: 30px;
    display: block;
    z-index: 10000;
    background-color: rgba(0, 0, 0, 0.2);
    padding: 5px;
    border-radius: 50%;
  }
}
.changeImg:hover {
  cursor: pointer;
}
.body-close:hover {
  cursor: pointer;
}
.modal {
  transition: transform 0.5s; /* 平滑过渡效果 */
}
.changeImg {
  position: absolute;
  // background-color: rgba(0,0,0,0.1);
  // transform: translate(-50%, -50%);
  width: 100%;
  bottom: 50px;
  display: flex;
  justify-content: center;
  z-index: 10000;
  .iconfont {
    font-size: 20px;
    background-color: rgba(0, 0, 0, 0.04);
    padding: 5px 30px;
    color: rgb(212, 212, 212);
    border-radius: 20px;
  }
}
.modal-body {
  padding: 0;
}
</style>
