<template>
  <div>
    <Window
      v-if="windowShow"
      @close="closeWindow"
      :width="fileInfo?.fileType == 1 ? 1500 : 900"
      :title="fileInfo?.fileName"
    >
      <PreviewVideo v-if="fileInfo?.fileType === 1" :url="url"></PreviewVideo>
      <PreviewDoc v-if="fileInfo?.fileType === 5" :url="url"></PreviewDoc>
      <PreviewExcel v-if="fileInfo?.fileType === 6" :url="url"></PreviewExcel>
      <PreviewPdf v-if="fileInfo?.fileType === 4" :url="url"></PreviewPdf>
      <PreviewTxt
        v-if="fileInfo?.fileType === 7 || fileInfo?.fileType == 8"
        :url="url"
      ></PreviewTxt>
      <PreviewMusic
        v-if="fileInfo?.fileType === 2"
        :url="url"
        :fileName="fileInfo?.fileName"
      ></PreviewMusic>
      <PreviewDownload
        :createDownloadUrl="createDownloadUrl"
        :downloadUrl="downloadUrl"
        :fileInfo="fileInfo"
        v-if="fileInfo?.fileCategory === 5 && fileInfo.fileType !== 8"
      >
      </PreviewDownload>
    </Window>
  </div>
</template>

<script setup lang="ts">
import { dataListItem, fileListItem } from "../../common/common";
import { ref, getCurrentInstance } from "vue";
import Window from "@/components/Window.vue";
import PreviewVideo from "@/components/preview/PreviewVideo.vue";
import PreviewDoc from "@/components/preview/PreviewDoc.vue";
import PreviewExcel from "@/components/preview/PreviewExcel.vue";
import PreviewPdf from "@/components/preview/PreviewPdf.vue";
import PreviewTxt from "@/components/preview/PreviewTxt.vue";
import PreviewMusic from "@/components/preview/PreviewMusic.vue";
import PreviewDownload from "@/components/preview/PreviewDownload.vue";

const baseurl =
  getCurrentInstance()?.appContext.config.globalProperties.$baseurl;
// 对应的接口
const FILE_URL_MAP = {
  0: {
    fileUrl: "/file/getFile",
    videoUrl: "/file/getVideoInfo",
    createDownloadUrl: "/file/createDownloadUrl",
    downloadUrl: "/api/file/download",
  },
  1: {
    fileUrl: "/admin/getFile",
    videoUrl: "/admin/getVideoInfo",
    createDownloadUrl: "/admin/createDownloadUrl",
    downloadUrl: "/api/admin/download",
  },
  2: {
    fileUrl: "/showShare/getFile",
    videoUrl: "/showShare/getVideoInfo",
    createDownloadUrl: "/showShare/createDownloadUrl",
    downloadUrl: "/api/showShare/download",
  },
};
type file_url_map_key = 0 | 1 | 2;
// ------------------------------------------------------------------------
// 要展示的图片的链接
// imageUrl是全局定义的基本地址 + fileCove是图片在服务器中的地址 = 图片的完整地址
// _. 的链接是缩略图   直接 .的是大图
// const imageUrl = computed(() => {
//   return (
//     baseurl +
//     fileInfo?.value?.fileCover?.replace("_.", ".").replace("cover", "file")
//   );
// });
// ----------------------------------------------------------------------------
//文件信息
const fileInfo = ref<dataListItem>();
// 打开对应的预览框
const openPreview = (data: dataListItem | fileListItem, showPort: number) => {
  fileInfo.value = data;
  // console.log(data)
  // 等于图片
  if (data.fileCategory === 3) {
    return;
  } else {
    windowShow.value = true;
    // console.log(data)
    // let _url = ''
    let _url = FILE_URL_MAP[showPort as file_url_map_key].fileUrl;
    if (fileInfo.value.fileCategory === 1) {
      _url = FILE_URL_MAP[showPort as file_url_map_key].videoUrl;
    }
    let _createDownloadUrl =
      FILE_URL_MAP[showPort as file_url_map_key].createDownloadUrl;
    let _downloadUrl = FILE_URL_MAP[showPort as file_url_map_key].downloadUrl;
    if (showPort == 0) {
      _url = _url + "/" + data.fileId;
      _createDownloadUrl = _createDownloadUrl + "/" + data.fileId;
      // 临时
      // _url = '/public/vedio.mp4'
    } else if (showPort == 1) {
      _url = _url + "/" + data.fileId + "*usid*" + data.userId;
      _createDownloadUrl =
        _createDownloadUrl + "/" + data.fileId + "/" + data.userId;
      // 临时
      // _url = '/public/vedio.mp4'
    } else if (showPort == 2) {
      _url = _url + "/" + data.fileId;
      _createDownloadUrl = _createDownloadUrl + "/" + data.fileId;
    }
    url.value = baseurl + "api" + _url;
    createDownloadUrl.value = _createDownloadUrl;
    // console.log(createDownloadUrl.value)
    downloadUrl.value = _downloadUrl;
  }
};
defineExpose({ openPreview });
// ----------------------------------------------------------------------------------
const windowShow = ref(false);
const closeWindow = () => {
  windowShow.value = false;
};
// -----------------------------------------------------------------
//文件的连接地址
const url = ref("");
// -----------------------------------------------------------------------------
// 下载的地址
const createDownloadUrl = ref();
const downloadUrl = ref();
</script>

<style lang="scss" scoped></style>
