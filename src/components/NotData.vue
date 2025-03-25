<template>
  <div class="not-data">
    <div
      class="not-data-img"
      :style="{ width: imgWidth + 'px', height: imgWidth + 'px' }"
    >
      <img src="/src/assets/icon-image/no_data.png" alt="" />
    </div>
    <div class="not-data-msg">
      <slot name="msg"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  imgWidth: {
    type: Number,
    default: () => 70,
  },
});
</script>

<style scoped lang="scss">
.not-data {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  // background-color: rgba(0,0,0,0.04);
  .not-data-img {
    width: 50px;
    height: 50px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .not-data-msg {
    font-size: 14px;
  }
}
</style>
