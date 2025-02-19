<template>
  <div class="share">
    <div class="header">
      <div class="header-content">
        <div class="logo" @click="jump">
          <span class="iconfont icon-pan"></span>
          <span class="name">个人网盘</span>
        </div>
      </div>
    </div>
    <div class="share-body" v-show="isCheckCode">
      <div class="body-content">
        <template v-if="Object.keys(shareInfo).length === 0">
          <div class="loading text-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">加载中...</span>
            </div>
            <span>加载中...</span>
          </div>
        </template>
        <template v-else>
          <div class="shareUser">
            <div class="userInfo">
              <div class="info-img">
                <img
                  :src="
                    baseurl +
                    (shareInfo.avatar
                      ? shareInfo.avatar
                      : 'media/avatar/default.png')
                  "
                  alt=""
                />
              </div>
              <div class="info-value">
                <div class="info-item">
                  <div class="name">{{ shareInfo.nickName }}</div>
                  <div class="info-time">
                    分享于
                    {{ shareInfo.shareTime.split(".")[0].replace("T", " ") }}
                  </div>
                </div>
                <div class="info-text">分享文件 {{ shareInfo.fileName }}</div>
              </div>
            </div>
            <div class="">
              <button
                v-if="shareInfo.currentUser"
                class="btn btn-primary"
                style="
                  --bs-btn-padding-y: 0.25rem;
                  --bs-btn-padding-x: 0.5rem;
                  --bs-btn-font-size: 0.75rem;
                "
                @click="cancelShare()"
              >
                <span class="iconfont icon-cancel"></span>
                取消分享
              </button>
              <button
                class="btn btn-primary"
                :class="[selectIdList.length != 0 ? '' : 'disabled']"
                v-else
                style="
                  --bs-btn-padding-y: 0.25rem;
                  --bs-btn-padding-x: 0.5rem;
                  --bs-btn-font-size: 0.75rem;
                "
                @click="saveAllFolder"
              >
                <span class="iconfont icon-import"></span>
                保存到我的网盘
              </button>
            </div>
          </div>
        </template>
        <Navigation
          ref="navigationRef"
          @navChange="navChange"
          :shareId="shareId"
          :rootPid="filePid"
        ></Navigation>
        <div class="file-list">
          <Table
            ref="dataTableRef"
            :columns="columns"
            :tableData="tableData"
            :fetch="getShareInfo"
            :initFecth="false"
            :createNewFolder="false"
            @selectDataList="setSelectList"
            @changePageSize="changeSize"
          >
            <template #tableBody>
              <tr
                class="table-file"
                v-for="data in tableData.list"
                :key="data.fileId"
                @mouseenter="showOp(data)"
                @mouseleave="noShowOp(data)"
              >
                <td>
                  <input type="checkbox" v-model="data.isCheck" name="" id="" />
                </td>
                <td class="filename" @click="changeFolder($event, data)">
                  <div class="filename-left">
                    <!-- 如果是视频类型，则有封面，不使用图标 -->
                    <template
                      v-if="
                        (data.fileType === 3 || data.fileType === 1) &&
                        data.status === 2
                      "
                    >
                      <FileIcon
                        :cover="data.fileCover"
                        :width="32"
                        :fileType="data.fileType"
                      ></FileIcon>
                    </template>
                    <template v-else>
                      <!-- 如果是文件类型 -->
                      <FileIcon
                        v-if="data.folderType === 0"
                        :fileType="data.fileType"
                      ></FileIcon>
                      <!-- 如果是目录类型 -->
                      <FileIcon
                        v-if="data.folderType === 1"
                        :fileType="0"
                      ></FileIcon>
                    </template>
                    <div class="name">
                      {{ data.fileName }}
                    </div>
                  </div>
                  <div v-show="data.showOp" class="filename-right">
                    <span
                      class="iconfont icon-download right-item"
                      v-if="data.folderType === 0"
                      @click="download(data)"
                      >下载</span
                    >
                    <span
                      class="iconfont icon-import right-item"
                      v-if="data.showOp && !shareInfo.currentUser"
                      @click="saveToMyPan(data)"
                      >保存到我的网盘</span
                    >
                  </div>
                </td>
                <td>
                  {{ data.lastUpdateTime.split(".")[0].replace("T", " ") }}
                </td>
                <td>{{ data.fileSize && formatFileSize(data.fileSize) }}</td>
              </tr>
            </template>
          </Table>
        </div>
      </div>
    </div>
    <!-- 文件移动 -->
    <FolderSelect ref="moveSelectModal" @selectFolder="moveFolderDone">
      <template #title> 保存到 </template>
      <template #saveBtnText> 保存到此 </template>
    </FolderSelect>
    <Loadding ref="loadding"></Loadding>
    <MessageToast ref="messageToast"></MessageToast>
    <!-- 文件预览 -->
    <Preview ref="previewRef"></Preview>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navigation from "@/components/Navigation.vue";
import Table from "@/components/Table.vue";
import FileIcon from "@/components/FileIcon.vue";
import Preview from "@/components/preview/Preview.vue";
import { formatFileSize, parseToken } from "@/utils/utils";
import { dataListItem, mainResponseData } from "../../common/common";
import request from "../../utils/request";
import Loadding from "@/components/Loadding.vue";
import MessageToast from "@/components/message/MessageToast.vue";
import FolderSelect from "@/components/FolderSelect.vue";
const route = useRoute();
const router = useRouter();
// -------------------------------------------------------------------------------------
const api = {
  getShareLoginInfo: "/showShare/getShareLogininfo",
  getShareInfo: "/showShare/getShareInfo",
  loadFileList: "/showShare/loadFileList",
  createDownloadUrl: "/showShare/createDownloadUrl",
  download: "api/showShare/download",
  cancelShare: "/share/cancelShare",
  saveShare: "/showShare/saveShare",
  checkLogin: "/showShare/checkLogin",
};
// 是否提取验证码
const isCheckCode = ref(false);
// 请求的基本连接
const baseurl =
  getCurrentInstance()?.appContext.config.globalProperties.$baseurl;
// 分享的id
const shareId = route.params.shareId;
const shareInit = ref(false);

// ------------------------------------------------------
// 当前目录的位置
interface currentFolder {
  fileId: string;
  fileName: string;
}
// 初始化，默认在根目录
const currentFolder = ref<currentFolder>({
  fileId: "0",
  fileName: "根目录",
});
// -------------------------------------------------------------------------------
const shareInfo = ref<{
  nickName: string;
  avatar: string;
  currentUser: boolean;
  shareTime: string;
  fileName: string;
  userId: string;
}>({
  nickName: "",
  avatar: "",
  shareTime: "",
  fileName: "",
  userId: "",
  currentUser: false,
});
// 获取分享的文件信息
const getShareInfo = async () => {
  let result = await request({
    method: "GET",
    url: api.getShareInfo + "/" + shareId,
  });
  if (!result) {
    return;
  }
  // 如果没有输入提取码就直接获取，就返回输入提取码的页面
  if (result.data.code === 403) {
    router.push(`/shareCheck/${shareId}`);
    return;
  }
  shareInfo.value = result.data;
  // console.log(result.data);
  currentFolder.value.fileId = result.data.filePid;
  filePid.value = result.data.filePid;
  if (localStorage.getItem("token")) {
    if (
      parseToken(localStorage.getItem("token") as string).uid ===
      shareInfo.value.userId
    ) {
      shareInfo.value.currentUser = true;
    } else {
      shareInfo.value.currentUser = false;
    }
  } else {
    shareInfo.value.currentUser = false;
  }
  loadDataList();
  shareInit.value = true;
};
getShareInfo();

// -----------------------------------------------------------------------
const columns = [
  {
    label: "文件名",
    prop: "fileName",
  },
  {
    label: "修改时间",
    prop: "lastUpdateTime",
    width: 200,
  },
  {
    label: "大小",
    prop: "fileSize",
    width: 100,
  },
];

const tableData = ref<mainResponseData>({
  pageNo: 1,
  list: [],
  pageSize: 13,
  pageTotal: 1,
});
// 分享文件的根目录的pid - 从getShareInfo中获得
const filePid = ref("0");
//----------------------------------------------------------------------------
const loadding = ref();
const messageToast = ref();
// 获取分享的文件列表
const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageTotal: tableData.value.pageTotal,
    pageSize: tableData.value.pageSize,
    shareId: shareId,
    pid: currentFolder.value.fileId,
  };
  // console.log(params)
  let result;
  try {
    nextTick(() => {
      loadding.value.showLoadding();
    });
    result = await request({
      method: "GET",
      url: api.loadFileList,
      params: params,
    });
    isCheckCode.value = true;
  } catch (error: any) {
    if (error.status == 403) {
      messageToast.value.showToast({
        type: "error",
        message: "请先输入提取码获取文件！！",
      });
      setTimeout(() => {
        if (route.query.code) {
          router.push(`/shareCheck/${shareId}?code=${route.query.code}`);
        } else {
          router.push(`/shareCheck/${shareId}`);
        }
      }, 500);
    }
  } finally {
    nextTick(() => {
      loadding.value.closeLoadding();
    });
  }
  if (!result) {
    return;
  }
  tableData.value = result.data;
};
// ----------------------------------------------------------------------
// 选中的数据的id的列表
const selectIdList = ref<string[]>([]);
// 设置选中的列表数据
const setSelectList: (list: string[]) => void = (list) => {
  // console.log(list)
  selectIdList.value = list;
};
// ----------------------------------------------------------------------
// 点击进入目录
const navigationRef = ref();

const changeSelectFolder: (data: dataListItem) => void = (data) => {
  // console.log('进入目录')
  currentFolder.value.fileId = data.fileId;
  navigationRef.value.openFolder(data);
};
// -------------------------------------------------------------------------------------
// 导航发生变化
interface navBackData {
  curFolder: currentFolder;
}
const navChange: (data: navBackData) => void = (data) => {
  const { curFolder } = data;
  currentFolder.value = curFolder;
  //获取当前目录下的文件
  shareInit.value && loadDataList();
};
// -----------------------------------------------------------------------
// -------------------------------------------------------------------
// 显示操作按钮
const showOp: (data: dataListItem) => void = (data) => {
  tableData.value.list.forEach((item) => {
    item.showOp = false;
  });
  data.showOp = true;
};
// 不显示操作按钮
const noShowOp: (data: dataListItem) => void = (data) => {
  data.showOp = false;
};
// ----------------------------------------------------------------------------------  // 下载文件
const download = async (file: dataListItem) => {
  let result;
  try {
    result = await request({
      method: "GET",
      url: api.createDownloadUrl + "/" + file.fileId,
      params: {
        shareId: shareId,
      },
    });
  } catch {
    messageToast.value.showToast({
      type: "error",
      message: "下载失败，请稍后再试！",
    });
    return;
  }

  if (!result) {
    return;
  }
  window.location.href =
    baseurl + api.download + "/" + result.data.data + "/" + file.fileName;
};
// ----------------------------------------------------------------------

// --------------------------------------------------------------------------------------
// 如果是目录，则点击进入目录
const changeFolder: (e: Event, data: dataListItem) => void = (e, data) => {
  // 点击的不是目录或文件
  if (
    e.target &&
    (e.target as HTMLElement).className &&
    (e.target as HTMLElement).className !== "filename"
  ) {
    return;
  }
  // 文件类型是目录
  if (data.folderType === 1) {
    changeSelectFolder(data);
    return;
  }
  // 预览文件
  showPreview(data);
};
// -------------------------------------------------------------------
// 预览的组件
const previewRef = ref();
const showPreview = (data: dataListItem) => {
  previewRef.value.openPreview(data, 2);
};
// -------------------------------------------------------------------------
// 保存到我的网盘
const moveSelectModal = ref();
// 移动单个文件
const saveToMyPan: (data: dataListItem) => void = async (data) => {
  let result = await request({
    method: "GET",
    url: api.checkLogin,
  });
  if (!result.data) {
    return;
  }
  // console.log(data.fileId)
  moveSelectModal.value.showSelectModal([data.fileId]);
};
// 移动多个文件
const saveAllFolder = async () => {
  let result = await request({
    method: "GET",
    url: api.checkLogin,
  });
  if (!result.data) {
    return;
  }
  moveSelectModal.value.showSelectModal(selectIdList.value);
};

// 确定移动文件到对应目录
const moveFolderDone: (obj: { pid: string; list: string[] }) => void = async (
  obj
) => {
  // console.log(obj.list)
  // 调用接口，进行修改选中的文件的filePid
  let result;
  try {
    result = await request({
      method: "POST",
      url: api.saveShare,
      params: {
        shareId: shareId,
      },
      data: {
        shareFileIds: obj.list,
        myFolderId: obj.pid,
      },
    });
  } catch (error) {
    console.log(error);
  }
  if (!result) {
    return;
  }
  if (result.data.code != 200) {
    messageToast.value.showToast({
      type: "error",
      message: result.data.message,
    });
    return;
  }
  messageToast.value.showToast({
    type: "success",
    message: result.data.message,
  });
  moveSelectModal.value.closeSelectModal();
  setTimeout(() => {
    router.push("/");
  }, 1000);
};
// ---------------------------------------------------------------------------------
// 页码发生改变时
const changeSize = (num: number) => {
  tableData.value.pageNo = num;
  loadDataList();
};
// ------------------------------------------------------------------------------------
// 取消分享
const cancelShare = async () => {
  try {
    nextTick(() => {
      loadding.value.showLoadding();
    });
    await request({
      method: "POST",
      url: api.cancelShare,
      data: {
        shareIds: [shareId],
      },
    });
  } finally {
    nextTick(() => {
      loadding.value.closeLoadding();
    });
  }
  loadDataList();
};
// 点击logo跳转到网盘主页
const jump = () => {
  router.push("/");
};
</script>

<style scoped lang="scss">
@import "@/assets/file.list.scss";
.share {
  width: 100%;
  height: calc(100vh);
  .header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(10, 127, 209);
    .header-content {
      display: flex;
      align-items: center;
      width: 800px;
      height: 60px;
      .logo {
        color: white;
        font-size: 28px;
        font-weight: bolder;
        display: flex;
        align-items: center;
      }
      .iconfont {
        font-size: 35px;
      }
    }
  }
  .share-body {
    width: 100%;
    display: flex;
    justify-content: center;
    .body-content {
      width: 967px;
      .shareUser {
        padding: 10px 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
        .userInfo {
          display: flex;
          align-items: center;
          gap: 15px;
          .info-img {
            img {
              width: 50px;
              height: 50px;
              border-radius: 50%;
            }
          }
          .info-value {
            display: flex;
            flex-direction: column;
            gap: 5px;
            .info-item {
              display: flex;
              align-items: center;
              gap: 15px;
              .name {
                font-size: 16px;
              }
            }
            .info-time,
            .info-text {
              font-size: 14px;
            }
          }
        }
      }
    }
  }
}
</style>
