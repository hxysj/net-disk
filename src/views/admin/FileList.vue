<template>
  <div class="top">
    <div
      class="btn btn-danger"
      :class="[selectIdList.length > 0 ? '' : 'disabled']"
      @click="delAllCheck"
    >
      <span class="iconfont icon-del"></span>
      批量删除
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
    <div class="iconfont icon-refresh refresh" @click="loadDataList"></div>
  </div>
  <!-- 位置导航 -->
  <Navigation ref="navigationRef" @navChange="navChange"> </Navigation>
  <!-- 文件列表 -->
  <div class="file-list">
    <Table
      :columns="columns"
      :tableData="tableData"
      :fetch="loadDataList"
      :initFecth="false"
      :createNewFolder="false"
      ref="dataTableRef"
      @selectDataList="setSelectList"
      :admin="true"
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
                <FileIcon v-if="data.folderType === 1" :fileType="0"></FileIcon>
              </template>
              <div>
                {{ data.fileName }}
              </div>
              <span v-if="data.status === 0" class="transfer transfer-status"
                >转码中</span
              >
              <span v-if="data.status === 1" class="transfer transfer-fail"
                >转码失败</span
              >
            </div>
            <div v-show="data.showOp" class="filename-right">
              <span
                class="iconfont icon-download right-item"
                v-if="data.folderType === 0"
                @click="download(data)"
                >下载</span
              >
              <span
                class="iconfont icon-del right-item"
                @click="deleteFile(data)"
                >删除</span
              >
            </div>
          </td>
          <td>{{ data.nickName }}</td>
          <td>{{ data.lastUpdateTime.split(".")[0].replace("T", " ") }}</td>
          <td>{{ data.fileSize && formatFileSize(data.fileSize) }}</td>
        </tr>
      </template>
    </Table>
    <!-- 确认框的Modal -->
    <MessageModal ref="messageModal" @submit="delFolderFile"></MessageModal>
    <!-- 消息弹窗 -->
    <MessageToast ref="messageToast"></MessageToast>
    <!-- 文件预览 -->
    <Preview ref="previewRef"></Preview>
    <!-- 分享组件 -->
    <Loadding ref="loadding"></Loadding>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, getCurrentInstance } from "vue";
import Navigation from "@/components/Navigation.vue";
import Table from "@/components/Table.vue";
import { fileListResponseData, fileListItem } from "../../common/common";
import { formatFileSize } from "@/utils/utils";
import FileIcon from "@/components/FileIcon.vue";
import MessageModal from "@/components/message/MessageModal.vue";
import MessageToast from "@/components/message/MessageToast.vue";
import Preview from "@/components/preview/Preview.vue";
import Loadding from "@/components/Loadding.vue";
import request from "../../utils/request";

const baseurl =
  getCurrentInstance()?.appContext.config.globalProperties.$baseurl;
// 为了不让浏览器报错
const emit = defineEmits(["addFile"]);

// 请求所有的api
const api = {
  loadDataList: "admin/loadFileList",
  delFile: "admin/delFile",
  createDownloadUrl: "admin/createDownloadUrl",
  download: "/api/admin/download",
};
// -----------------------------------------------------
const columns = [
  {
    label: "文件名",
    prop: "fileName",
  },
  {
    label: "发布人",
    prop: "nickName",
    width: 200,
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

// ----------------------------------------------------
// 搜索
const fileNameFuzzy = ref();
const search = () => {
  loadDataList();
};
const loadding = ref();
// 初始化数据
const loadDataList = async () => {
  // console.log(currentFolder.value)
  let result;
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
    fileNameFuzzy: fileNameFuzzy.value,
    pid: currentFolder.value.fileId,
  };
  if (!fileNameFuzzy.value) {
    delete params.fileNameFuzzy;
  }
  try {
    nextTick(() => {
      loadding.value.showLoadding();
    });
    result = await request({
      url: api.loadDataList,
      method: "POST",
      data: params,
    });
    // console.log(result.data)
  } finally {
    nextTick(() => {
      loadding.value.closeLoadding();
    });
  }
  if (!result) {
    return;
  }
  tableData.value = result.data;
  // tableData.value.list = dataLists.filter(item=>item.filePid === currentFolder.value.fileId)
};

// 表格数据
const tableData = ref<fileListResponseData>({
  pageNo: 1,
  pageSize: 13,
  list: [],
  pageTotal: 1,
});
// ----------------------------------------------------
// 当前所在的位置的id
const filePid = ref("0");
// 当前所在目录的信息

interface currentFolder {
  fileId: string;
  fileName: string;
}
const currentFolder = ref<currentFolder>({
  fileId: "0",
  fileName: "根目录",
});
// -------------------------------------------------------------------
// 预览的组件
const previewRef = ref();
const showPreview = (data: fileListItem) => {
  previewRef.value.openPreview(data, 1);
};
// ---------------------------------------------------
// 选中的数据的列表
const selectIdList = ref<del_obj[]>([]);

// 设置选中的列表数据
const setSelectList: (list: del_obj[]) => void = (list) => {
  // console.log(list)
  selectIdList.value = list;
};
// ------------------------------------------------------------
// 绑定消息弹窗
const messageToast = ref();
// 如果是目录，则点击进入目录,如果不是则预览
const changeFolder: (e: Event, data: fileListItem) => void = (e, data) => {
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
  // 文件未转码成功
  if (data.status != 2) {
    // 文件正在转码中
    messageToast.value.showToast({
      type: "error",
      message: "预览失败，文件正在转码中！",
    });
    return;
  }
  // 预览文件
  showPreview(data);
};

// -----------------------------------------------------------
// 点击进入目录
const navigationRef = ref();

const changeSelectFolder: (data: fileListItem) => void = (data) => {
  // console.log('进入目录')
  filePid.value = data.fileId;
  navigationRef.value.openFolder(data);
};

// 导航发生变化
interface navBackData {
  categoryId: string;
  curFolder: currentFolder;
}
const navChange: (data: navBackData) => void = (data) => {
  const { curFolder } = data;

  // console.log(1111)
  currentFolder.value = curFolder;
  // 获取当前目录下的文件
  loadDataList();
};
// --------------------------------------------------------------
// 提示框信息
// 要删除的文件列表
interface del_obj {
  file_id: string;
  user_id: string;
}
let delList: del_obj[] = [];
const messageModal = ref();
// 删除单个文件
const deleteFile: (data: fileListItem) => void = (data) => {
  // selectIdList.value = [obj.id]
  delList = [
    {
      file_id: data.fileId,
      user_id: data.userId,
    },
  ];
  // console.log(data)
  messageModal.value.openMessage({
    message: `你确定要删除 < ${data.fileName}> 吗？`,
    title: "温馨提示！",
  });
};
// 删除选中的所有文件
const delAllCheck = () => {
  // console.log(dataList.value)
  delList = selectIdList.value;
  // console.log(delList)
  messageModal.value.openMessage({
    message: `你确定要删除选中的文件吗？`,
    title: "温馨提示！",
  });
};

// 确定删除
const delFolderFile = async () => {
  let result;
  try {
    nextTick(() => {
      loadding.value.showLoadding();
    });
    result = await request({
      url: api.delFile,
      method: "POST",
      data: {
        delList: delList,
      },
    });
  } catch (error) {
    messageToast.value.showToast({
      type: "error",
      message: "删除失败！",
    });
    return;
  } finally {
    nextTick(() => {
      loadding.value.closeLoadding();
    });
  }
  if (!result) {
    return;
  }
  messageToast.value.showToast({
    type: "success",
    message: "删除成功！",
  });
  loadDataList();
};
// -------------------------------------------------------------------
// 显示操作按钮
const showOp: (data: fileListItem) => void = (data) => {
  tableData.value.list.forEach((item) => {
    item.showOp = false;
  });
  data.showOp = true;
};
// 不显示操作按钮
const noShowOp: (data: fileListItem) => void = (data) => {
  data.showOp = false;
};
// ----------------------------------------------------------------------
// 下载文件
const download = async (file: fileListItem) => {
  // console.log('点击下载文件',file.fileName)
  let result;
  try {
    result = await request({
      method: "GET",
      url: api.createDownloadUrl + "/" + file.fileId + "/" + file.userId,
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
    baseurl +
    api.download +
    "/" +
    result.data.data +
    "/" +
    result.data.fileName;
};
// ---------------------------------------------------------------------------------
// 页码发生改变时
const changeSize = (num: number) => {
  tableData.value.pageNo = num;
  loadDataList();
};
</script>

<style scoped>
@import "@/assets/file.list.scss";
</style>
