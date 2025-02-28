<template>
  <div class="pdf">
    <Preloading ref="preloadingRef">
      <vue-pdf-embed
        ref="pdfRef"
        :source="state.url"
        class="vue-pdf-embed"
        :width="850"
        :page="state.pageNum"
        @loaded="loaded"
      ></vue-pdf-embed>
    </Preloading>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import VuePdfEmbed from "vue-pdf-embed";
import Preloading from "../Preloading.vue";

const props = defineProps({
  url: {
    type: String,
  },
});

const pdfRef = ref();
const preloadingRef = ref();
const state = ref({
  url: "",
  pageNum: 0,
  numPages: 0,
});

const initPdf = async () => {
  state.value.url = props.url as string;
  // state.value.url = '/public/test.pdf'
};

const loaded = () => {
  preloadingRef.value.changeLoading(false);
};
onMounted(() => {
  initPdf();
});
</script>

<style scoped lang="scss">
.pdf {
  width: 100%;
}
:deep .vue-pdf-embed__page {
  canvas {
    width: 100% !important;
    height: auto !important;
  }
}
</style>
