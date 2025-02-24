<template>
  <div class="top">
    <div class="btn btn-primary" @click="clickAddFile">
      <span class="iconfont icon-upload"></span>
      上传
      <input
        type="file"
        ref="fileInput"
        :accept="fileAccept"
        style="display: none"
        @change="addFile"
      />
    </div>
    <div
      class="btn btn-success"
      @click="() => emits('addNewFolder')"
      v-if="category === 'all'"
    >
      <span class="iconfont icon-folder-add"></span>
      新建文件夹
    </div>
    <div
      class="btn btn-danger"
      :class="[!haveSelect ? 'disabled' : '']"
      @click="() => emits('delAllCheck')"
    >
      <span class="iconfont icon-del"></span>
      批量删除
    </div>
    <div
      class="btn btn-warning"
      :class="[!haveSelect ? 'disabled' : '']"
      @click="() => emits('moveFolderPath')"
    >
      <span class="iconfont icon-right"></span>
      批量移动
    </div>
    <div class="input-group">
      <span class="input-group-text iconfont icon-search" id="basic-addon1">
      </span>
      <input
        type="text"
        class="form-control"
        aria-describedby="basic-addon1"
        placeholder="请输入文件名搜索"
        v-model="fileNameFuzzy"
        @keyup.enter="search"
      />
      <button
        class="btn btn-outline-secondary"
        :class="[fileNameFuzzy ? '' : 'disabled']"
        type="button"
        id="button-addon2"
        @click="search"
      >
        搜索
      </button>
    </div>
    <div
      class="iconfont icon-refresh refresh"
      @click="() => getAllFolder()"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import cateGoryInfo from "@/ts/cateGoryInfo";

const props = defineProps({
  haveSelect: {
    type: Boolean,
    default: false,
  },
  currentFolder: {
    type: Object,
    default: () => {
      return {
        fileId: "",
        filePid: "",
      };
    },
  },
  category: {
    type: String,
    default: "all",
  },
  getAllFolder: {
    type: Function,
    default: () => {},
  },
});
const emits = defineEmits([
  "addNewFolder",
  "delAllCheck",
  "moveFolderPath",
  "addFile",
]);

const fileNameFuzzy = defineModel("fuzzy");
const fileInput = ref();
const clickAddFile = () => {
  fileInput.value.click();
};
// -------------------------------------------------------
// 上传文件的限制,如到视频分类时，点击上传文件，则选中视频类
type categoryType = "all" | "video" | "music" | "image" | "doc" | "others";
const fileAccept = computed(() => {
  const categoryItem = cateGoryInfo[props.category as categoryType];
  return categoryItem ? categoryItem.accept : "*";
});

const addFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const fileData = target.files && target.files[0];
  emits("addFile", { file: fileData, filePid: props.currentFolder.fileId });
  target.value = "";
};

// 按文件名进行搜索
const search = () => {
  props.getAllFolder();
};

defineExpose({
  clickAddFile,
});
</script>

<style scoped lang="scss">
@import "@/assets/file.list.scss";
</style>
