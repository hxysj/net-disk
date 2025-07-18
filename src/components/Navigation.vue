<template>
  <div class="top-navigation">
    <template v-if="folderList.length > 0">
      <span class="back link" @click="backParent">返回上一级</span>
    </template>
    <span v-if="folderList.length === 0" class="all-file">全部文件</span>
    <span
      v-if="folderList.length > 0"
      class="link"
      @click="setCurrentFolder(-1)"
      >全部文件</span
    >
    <template v-for="(item, index) in folderList">
      <span
        class="iconfont icon-right"
        :class="[index < folderList.length - 1 ? 'link' : '']"
      ></span>
      <span
        class="link"
        v-if="index < folderList.length - 1"
        @click="setCurrentFolder(index)"
      >
        {{ item.fileName }}
      </span>
      <span v-if="index === folderList.length - 1" class="text">
        {{ item.fileName }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import request from "../utils/request";
const router = useRouter();
const route = useRoute();

const props = defineProps({
  watchPath: {
    type: Boolean,
    default: true,
  },
  shareId: {
    type: String,
  },
  adminShow: {
    type: Boolean,
    default: false,
  },
  rootPid: {
    type: String,
    default: "0",
  },
});

// 目录集合，进入了多少层
interface folderNameID {
  fileName?: string;
  fileId: string;
}
const folderList = ref<folderNameID[]>([]);
// 当前目录
const currentFile = ref<folderNameID>({
  fileId: "0",
  fileName: "全部文件",
});

// 当前的分类
const category = ref();

const api = {
  getFolderInfo: "file/getFolderInfo",
};
// 进入目录后要向进入的层数添加新的目录进去
const openFolder: (data: any) => void = (data) => {
  folderList.value.push({ fileName: data.fileName, fileId: data.fileId });
  currentFile.value = { fileId: data.fileId, fileName: data.fileName };
  setPath();
};
// 进入目录的时候需要更改位置
const setPath = () => {
  if (!props.watchPath) {
    // 设置不监听路由时回调方法
    doCallBack();
    return;
  }
  let pathArray: string[] = [];
  folderList.value.forEach((item) => {
    pathArray.push(item.fileId);
  });
  router.push({
    path: route.path,
    query: pathArray.length === 0 ? {} : { path: pathArray.join("/") },
  });
};

// 获取当前路径的目录
const getNavigationFolder: (path: string) => void = async (path) => {
  let url = api.getFolderInfo;
  let result = await request({
    method: "POST",
    url: url,
    params: {
      path: path,
      shareId: props.shareId,
    },
  });
  if (result.data.code === 404) {
    return;
  }
  folderList.value = result.data.data;
};

// 当目录发生变化的时候,通知父组件页面可以发生变化
const emit = defineEmits(["navChange"]);
const doCallBack = () => {
  emit("navChange", {
    categoryId: category.value,
    curFolder: currentFile.value,
  });
};

// 页面初始化
const init = () => {
  folderList.value = [];
  currentFile.value = {
    fileId: props.rootPid,
  };
  doCallBack();
};

watch(
  () => route,
  (newVal) => {
    if (!props.watchPath) {
      return;
    }
    if (
      newVal.path.indexOf("/main") === -1 &&
      newVal.path.indexOf("/settings/fileList") === -1 &&
      newVal.path.indexOf("/share/") === -1
    ) {
      return;
    }
    const path = newVal.query.path as string | undefined;
    const categoryId = newVal.params.category;
    category.value = categoryId;
    if (path === undefined) {
      // 默认在根目录的时候会走这个位置，要进行初始化
      init();
    } else {
      // 调用后端接口
      getNavigationFolder(path);
      let pathArray = path.split("/");
      currentFile.value = {
        fileId: pathArray[pathArray.length - 1],
      };
      doCallBack();
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

// 返回上一级
const backParent = () => {
  // console.log(folderList.value)
  folderList.value.pop();
  currentFile.value =
    folderList.value.length > 0
      ? folderList.value[folderList.value.length - 1]
      : {
          fileId: props.rootPid,
        };
  setPath();
};

// 点击跳转到其他位置,-1时为全部文件
const setCurrentFolder: (index: number) => void = (index) => {
  if (index === -1) {
    folderList.value = [];
    currentFile.value.fileId = props.rootPid;
  } else {
    currentFile.value = folderList.value[index];
    folderList.value = folderList.value.slice(0, index + 1);
  }
  setPath();
};

defineExpose({ openFolder });
</script>

<style lang="scss" scoped>
.top-navigation {
  display: flex;
  gap: 5px;
  align-items: center;
  font-size: 13px;
  padding: 0 15px;
  .link {
    color: #06a7ff;
  }
  .link:hover {
    cursor: pointer;
  }
  .iconfont {
    font-size: 13px;
  }
}
</style>
