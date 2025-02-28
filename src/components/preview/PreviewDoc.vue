<template>
  <Preloading ref="preloadingRef">
    <div ref="docRef" class="doc-content"></div>
  </Preloading>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { renderAsync } from "docx-preview";
import Preloading from "../Preloading.vue";
import axios from "axios";
const props = defineProps({
  url: {
    type: String,
  },
});

const preloadingRef = ref();
const docRef = ref();
const initDoc = async () => {
  let result = await axios({
    method: "GET",
    url: props.url,
    // 返回的数据的格式  - 文件流
    responseType: "blob",
  });
  if (!result.data) {
    return;
  }
  // result 是一个文件流数据
  await renderAsync(result.data, docRef.value);
  preloadingRef.value.changeLoading(false);
};

onMounted(() => {
  initDoc();
});
</script>

<style scoped lang="scss">
.doc-content {
  margin: 0 auot;
  :deep .docx-wrapper {
    background-color: #fff;
    padding: 10px 0;
  }
  :deep .docx-wrapper > section.docx {
    margin-bottom: 0px;
  }
}
</style>
