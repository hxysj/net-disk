<template>
  <div v-show="!isLoading">
    <slot></slot>
  </div>
  <template v-if="isLoading">
    <div class="loading-body" :style="{ height: height + 'px' }">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="loading-text">加载中……</div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref } from "vue";
defineProps({
  height: {
    type: Number,
    default: 500,
  },
});
const isLoading = ref(true);
const changeLoading = (val: boolean) => {
  isLoading.value = val;
};

defineExpose({
  changeLoading,
});
</script>

<style scoped lang="scss">
.loading-body {
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
</style>
