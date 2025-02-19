<template>
  <div>
    <div class="top">
      <button
        class="btn btn-primary"
        :class="[selectIdList.length > 0 ? '' : 'disabled']"
        @click="recycle_select"
      >
        <span class="iconfont icon-revert"></span>
        还原
      </button>
      <button
        class="btn btn-danger"
        :class="[selectIdList.length > 0 ? '' : 'disabled']"
        @click="delFileSelect"
      >
        <span class="iconfont icon-del"></span>
        批量删除
      </button>
    </div>
    <div class="file-list">
      <Table
        ref="tableDataRef"
        @selectDataList="setSelectList"
        :tableData="tableData"
        :fetch="loadDataList"
        :columns="columns"
        :initFecth="true"
        :createNewFolder="false"
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
            <td class="filename">
              <div class="filename-left">
                <!-- 如果是视频类型，则有封面，不使用图标 -->
                <template v-if="data.fileType === 3 || data.fileType === 1">
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
                <div>
                  {{ data.fileName }}
                </div>
              </div>
              <div v-show="data.showOp" class="filename-right">
                <span
                  class="iconfont icon-revert right-item"
                  @click="revert(data.fileId)"
                  >还原</span
                >
                <span
                  class="iconfont icon-del right-item"
                  @click="delFile(data.fileId, data.fileName)"
                  >删除</span
                >
              </div>
            </td>
            <td>{{ data.recoveryTime.split(".")[0].replace("T", " ") }}</td>
            <td>{{ data.fileSize && formatFileSize(data.fileSize) }}</td>
          </tr>
        </template>
        <template #notData>
          <NotData :imgWidth="200">
            <template #msg>
              <div>回收站为空</div>
            </template>
          </NotData>
        </template>
      </Table>
    </div>
    <Loadding ref="loadding"></Loadding>
    <!-- 消息弹窗 -->
    <MessageToast ref="messageToast"></MessageToast>
    <MessageModal ref="messageModal" @submit="submitDelete"></MessageModal>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { recycleItem, recycleResponseData } from "../../common/common";
import FileIcon from "@/components/FileIcon.vue";
import Table from "@/components/Table.vue";
import { formatFileSize } from "@/utils/utils";
import NotData from "@/components/NotData.vue";
import request from "../../utils/request";
import Loadding from "@/components/Loadding.vue";
import MessageToast from "@/components/message/MessageToast.vue";
import MessageModal from "@/components/message/MessageModal.vue";
import { AxiosError } from "axios";
// -----------------------------------------------------------
// 当前选中的list
const selectIdList = ref<string[]>([]);
const setSelectList = (rows: string[]) => {
  selectIdList.value = [];
  rows.forEach((item) => {
    selectIdList.value.push(item);
  });
};
// ------------------------------------------------------------
const tableData = ref<recycleResponseData>({
  list: [],
  pageSize: 13,
  pageNo: 1,
  pageTotal: 1,
});
// --------------------------------------------------------------
const columns = [
  {
    label: "文件名",
    prop: "fileName",
  },
  {
    label: "删除时间",
    prop: "recoveryTime",
    width: 200,
  },
  {
    label: "大小",
    prop: "fileSize",
    width: 200,
  },
];

// ------------------------------------------------------------
// 用到的api
const api = {
  loadDataList: "/recycle/loadRecycleList",
  delFile: "/recycle/delFile",
  recoverFile: "/recycle/recoverFile",
};

const loadding = ref();
const messageToast = ref();
// --------------------------------------------------------------
// 初始化数据,更新数据
const loadDataList = async () => {
  // console.log('调用了初始化数据！')
  // 请求时用的参数
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
  };
  let result;
  try {
    nextTick(() => {
      loadding.value.showLoadding();
    });
    result = await request({
      url: api.loadDataList,
      params,
    });
  } finally {
    nextTick(() => {
      loadding.value.closeLoadding();
    });
  }
  if (!result) {
    return;
  }
  // console.log(result.data)
  tableData.value = result.data;
};
// --------------------------------------------------------------------
const showOp = (data: recycleItem) => {
  tableData.value.list.forEach((item) => {
    item.showOp = false;
  });
  data.showOp = true;
};
const noShowOp = (data: recycleItem) => {
  data.showOp = false;
};
// -------------------------------------------------------------------------
// 还原操作
const revert = async (fileId: string) => {
  try {
    await request({
      method: "POST",
      url: api.recoverFile,
      data: { fileIds: [fileId] },
    });
    messageToast.value.showToast({
      type: "success",
      message: "还原成功！",
    });
    loadDataList();
  } catch (error: unknown) {
    if ((error as AxiosError).status == 403) {
      messageToast.value.showToast({
        type: "error",
        message: "空间不足，请拓展空间或删除其他文件再继续!",
      });
    }
  }
  // console.log(result.data)
};
// 批量还原
const recycle_select = async () => {
  // console.log(selectIdList.value)
  try {
    await request({
      method: "POST",
      url: api.recoverFile,
      data: { fileIds: selectIdList.value },
    });
    messageToast.value.showToast({
      type: "success",
      message: "还原成功！",
    });
    loadDataList();
  } catch (error) {
    if ((error as AxiosError).status == 403) {
      messageToast.value.showToast({
        type: "error",
        message: "空间不足，请拓展空间或删除其他文件再继续!",
      });
    }
  }
};
// ----------------------------------------------------------------------
// 删除操作
let delList: string[] = [];
const messageModal = ref();
const delFile = async (fileId: string, fileName: string) => {
  delList = [fileId];
  messageModal.value.openMessage({
    message: `你确定要彻底删除 ${fileName} 吗？删除后的文件不可还原！！！`,
    title: "温馨提示！",
  });
};
// 删除多个文件
const delFileSelect = () => {
  delList = selectIdList.value;
  messageModal.value.openMessage({
    message: `你确定要彻底删除选中的文件吗？删除后的文件不可还原！！！`,
    title: "温馨提示！",
  });
};
// 确定删除
const submitDelete = async () => {
  try {
    await request({
      method: "POST",
      url: api.delFile,
      data: { fileIds: delList },
    });
    messageToast.value.showToast({
      type: "success",
      message: "删除成功！",
    });
    loadDataList();
  } catch (error) {
    messageToast.value.showToast({
      type: "error",
      message: "删除失败，请稍后再试！",
    });
  }
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
