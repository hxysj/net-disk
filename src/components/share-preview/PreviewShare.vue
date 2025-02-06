<template>
  <div class="preview-share d-flex gap-2" @click="goToShare">
    <div><i class="iconfont icon-pan"></i></div>
    <div
      class="preview-share-content d-flex flex-column gap-1 align-items-start justify-content-center"
    >
      <div class="preview-share-title">点击查看分享文件内容</div>
      <div class="preview-share-desc">{{ link }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  link: {
    type: String,
    default: "",
  },
  code: {
    type: String,
    default: "",
  },
});

const goToShare = () => {
  window.open(`${props.link}?code=${props.code}`);
};
</script>

<style lang="scss" scoped>
.preview-share {
  width: 280px;
  background-color: rgba(6, 167, 255, 0.8);
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  .iconfont {
    font-size: 45px;
    color: rgb(247, 247, 247);
  }
  .preview-share-content {
    padding: 5px;
    .preview-share-desc {
      width: 205px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: rgba(0, 0, 0, 0.4);
    }
    .preview-share-title {
      font-size: 16px;
      font-weight: bolder;
      color: white;
    }
  }
}
</style>
