<template>
  <div class="share-body">
    <div class="top">
      <button
        class="btn btn-primary"
        :class="[selectIdList.length > 0 ? '' : 'disabled']"
        @click="cancelShare"
      >
        <span class="iconfont icon-cancel"></span>
        取消分享
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
        :share="true"
        @changePageSize="changeSize"
      >
        <template #tableBody>
          <tr
            class="table-file"
            v-for="data in tableData.list"
            :key="data.shareId"
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
                <div class="name">
                  {{ data.fileName }}
                </div>
              </div>
              <div v-show="data.showOp" class="filename-right">
                <span class="iconfont icon-link right-item" @click="copy(data)"
                  >复制链接</span
                >
                <span
                  class="iconfont icon-cancel right-item"
                  @click="cancelShareItem(data.shareId)"
                  >取消分享</span
                >
              </div>
            </td>
            <td>{{ data.shareTime.split(".")[0].replace("T", " ") }}</td>
            <td>{{ data.expireTime.split(".")[0].replace("T", " ") }}</td>
            <td>{{ data.showCount }}</td>
          </tr>
        </template>
        <template #notData>
          <NotData :imgWidth="200">
            <template #msg>
              <div>分享列表为空</div>
            </template>
          </NotData>
        </template>
      </Table>
    </div>
    <!-- 消息弹窗 -->
    <MessageToast ref="messageToast"></MessageToast>

    <Loadding ref="loadding"></Loadding>
  </div>
</template>

<script setup lang="ts">
import Table from "@/components/Table.vue";
import FileIcon from "@/components/FileIcon.vue";
import MessageToast from "@/components/message/MessageToast.vue";
import Loadding from "@/components/Loadding.vue";
import { shareListItem, shareResponseData } from "../../common/common.ts";
import request from "../../utils/request.ts";
import { ref, nextTick, inject, watch } from "vue";
import useClipboard from "vue-clipboard3";
import NotData from "@/components/NotData.vue";
const { toClipboard } = useClipboard();

// 请求时用的接口
const api = {
  loadDataList: "/share/loadShareList",
  cancelShare: "/share/cancelShare",
};
// ---------------------------------------------------------------------
const tableDataRef = ref();
const columns = [
  {
    label: "文件名",
    prop: "fileName",
    scopedSlots: "fileName",
  },
  {
    label: "分享时间",
    prop: "shareTime",
    width: 200,
  },
  {
    label: "失效时间",
    prop: "expireTime",
    width: 200,
  },
  {
    label: "浏览次数",
    prop: "showCount",
    width: 100,
  },
];
const page_show_count_obj = inject<{ file: number; user: number }>(
  "page_show_count_obj"
);
const tableData = ref<shareResponseData>({
  pageSize: page_show_count_obj!.file,
  pageNo: 1,
  pageTotal: 1,
  list: [],
});
// -----------------------------------------------------------
// 当前选中的list
const selectIdList = ref<string[]>([]);
const setSelectList = (rows: string[]) => {
  selectIdList.value = [];
  // console.log(rows)
  rows.forEach((item) => {
    selectIdList.value.push(item);
  });
};
// ---------------------------------------------------------
const loadding = ref();
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
      method: "GET",
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
// --------------------------------------------------------
// 悬停在data上时
const showOp = (data: shareListItem) => {
  tableData.value.list.forEach((item) => {
    item.showOp = false;
  });
  data.showOp = true;
};

const noShowOp = (data: shareListItem) => {
  data.showOp = false;
};
// --------------------------------------------------------------------------------
const messageToast = ref();
// 获取分享的基本链接
const shareUrl = ref(document.location.origin + "/share/");
// 复制链接
const copy = async (data: shareListItem) => {
  await toClipboard(
    `链接:${shareUrl.value}${data.shareId} 提取码:${data.code}`
  );
  console.log("复制成功");
  messageToast.value.showToast({
    type: "success",
    message: "复制成功",
  });
};
// ----------------------------------------------------------------------------
// 取消分享
// 取消单个分享
const cancelShareItem = (shareId: string) => {
  cancelShareDone([shareId]);
  // tableData.value.list = tableData.value.list.filter(item=>item.shareId !==shareId)
};
// 批量取消分享
const cancelShare = () => {
  // console.log(selectIdList.value)
  if (selectIdList.value.length === 0) {
    return;
  }
  cancelShareDone(selectIdList.value);
  // selectIdList.value.forEach(item=>cancelShareItem(item))
};
// 取消分享的接口
const cancelShareDone = async (list: string[]) => {
  let result;
  try {
    nextTick(() => {
      loadding.value.showLoadding();
    });
    result = await request({
      method: "POST",
      url: api.cancelShare,
      data: {
        shareIds: list,
      },
    });
  } finally {
    nextTick(() => {
      loadding.value.closeLoadding();
    });
  }
  if (!result) {
    return;
  }
  loadDataList();
};
// ---------------------------------------------------------------------------------
// 页码发生改变时
const changeSize = (num: number) => {
  tableData.value.pageNo = num;
  loadDataList();
};

watch(
  () => page_show_count_obj,
  (val) => {
    tableData.value.pageSize = val!.file;
    loadDataList();
  },
  {
    deep: true,
  }
);
</script>

<style scoped>
@import "@/assets/file.list.scss";
</style>
