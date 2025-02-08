<template>
  <div class="">
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
        @click="addNewFolder"
        v-if="category === 'all'"
      >
        <span class="iconfont icon-folder-add"></span>
        新建文件夹
      </div>
      <div
        class="btn btn-danger"
        :class="[!haveSelect ? 'disabled' : '']"
        @click="delAllCheck"
      >
        <span class="iconfont icon-del"></span>
        批量删除
      </div>
      <div
        class="btn btn-warning"
        :class="[!haveSelect ? 'disabled' : '']"
        @click="moveFolderPath"
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
      <div class="iconfont icon-refresh refresh" @click="getAllFolder"></div>
    </div>
    <!-- 位置导航 -->
    <Navigation ref="navigationRef" @navChange="navChange"> </Navigation>
    <!-- 文件列表 -->
    <div class="file-list">
      <Table
        :columns="columns"
        :tableData="tableData"
        :fetch="getAllFolder"
        :initFecth="true"
        :createNewFolder="newFolder.newEdit"
        ref="dataTable"
        @selectDataList="setSelectList"
        @changePageSize="changeSize"
      >
        <template #tableBody>
          <tr class="table-file" v-if="newFolder.newEdit">
            <td>
              <input type="checkbox" disabled />
            </td>
            <td class="edit container d-flex flex-nowarp">
              <div class="col-7">
                <input
                  type="text"
                  ref="editIpt"
                  v-model="newFolder.fileName"
                  class="form-control"
                />
              </div>
              <span
                :class="[
                  'iconfont',
                  'icon-right',
                  'col-1',
                  'btn',
                  'btn-primary',
                  newFolder.fileName ? '' : 'disabled',
                ]"
                @click="submitEditName(true)"
              ></span>
              <span
                class="iconfont icon-close2 col-1 btn btn-light"
                @click="closeEditName(true)"
              ></span>
            </td>
            <td></td>
            <td></td>
          </tr>
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
                  <FileIcon :cover="data.fileCover" :width="32"></FileIcon>
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
                <div v-if="!data.showEdit">
                  {{ data.fileName }}
                </div>
                <div class="edit container flex-nowarp" v-else>
                  <div class="col-10 input-group">
                    <input
                      type="text"
                      maxlength="190"
                      ref="editIpt"
                      :value="currentData.fileNameReal"
                      class="form-control"
                      @keyup.enter="submitEditName(false, data)"
                    />
                    <span
                      class="input-group-text"
                      v-if="currentData.fileSuffix"
                      >{{ currentData.fileSuffix }}</span
                    >
                  </div>
                  <span
                    :class="[
                      'iconfont',
                      'icon-right',
                      'col-1',
                      'btn',
                      'btn-primary',
                      data.fileName ? '' : 'disabled',
                    ]"
                    @click="submitEditName(false, data)"
                  ></span>
                  <span
                    class="iconfont icon-close2 col-1 btn btn-light"
                    @click="closeEditName(false, data)"
                  ></span>
                </div>

                <span v-if="data.status === 0" class="transfer transfer-status"
                  >转码中</span
                >
                <span v-if="data.status === 1" class="transfer transfer-fail"
                  >转码失败</span
                >
              </div>
              <div v-show="data.showOp" class="filename-right">
                <!-- {{ data.status }} -->
                <span
                  class="iconfont icon-share1 right-item"
                  @click="showShareFile(data)"
                  v-if="data.status == 2"
                  >分享</span
                >
                <span
                  class="iconfont icon-download right-item"
                  v-if="data.folderType === 0"
                  @click="download(data)"
                  v-show="data.status == 2"
                  >下载</span
                >
                <span
                  class="iconfont icon-del right-item"
                  @click="deleteFile(data)"
                  >删除</span
                >
                <span
                  class="iconfont icon-edit right-item"
                  @click="editName(data)"
                  >重命名</span
                >
                <span
                  class="iconfont icon-move right-item"
                  @click="moveOneFile(data)"
                  >移动</span
                >
              </div>
            </td>
            <td>{{ data.lastUpdateTime.split(".")[0].replace("T", " ") }}</td>
            <td>{{ data.fileSize && formatFileSize(data.fileSize) }}</td>
          </tr>
        </template>
        <template #notData>
          <div class="not-data">
            <div class="not-data-img">
              <img src="/src/assets/icon-image/no_data.png" alt="" />
              <div class="tips">当前目录为空，上传你的第一个文件吧</div>
            </div>
            <div class="op-tip">
              <div class="op-tip-item" @click="clickAddFile">
                <div><img src="/src/assets/icon-image/file.png" alt="" /></div>
                <div>上传文件</div>
              </div>
              <div class="op-tip-item" @click="addNewFolder">
                <div>
                  <img src="/src/assets/icon-image/folder.png" alt="" />
                </div>
                <div>新建目录</div>
              </div>
            </div>
          </div>
        </template>
      </Table>
    </div>
    <!-- 确认框的Modal -->
    <MessageModal ref="messageModal" @submit="delFolderFile"></MessageModal>
    <!-- 文件移动 -->
    <FolderSelect ref="moveSelectModal" @selectFolder="moveFolderDone">
      <template #title> 移动到 </template>
      <template #saveBtnText> 移动到此 </template>
    </FolderSelect>
    <!-- 消息弹窗 -->
    <MessageToast ref="messageToast"></MessageToast>
    <!-- 文件预览 -->
    <Preview ref="previewRef"></Preview>
    <!-- 分享组件 -->
    <ShareFile ref="shareFile"></ShareFile>
    <!-- 加载中 -->
    <Loadding ref="loadding"></Loadding>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, getCurrentInstance } from "vue";
import Table from "@/components/Table.vue";
import { formatFileSize } from "@/utils/utils";
import FolderSelect from "@/components/FolderSelect.vue";
import Navigation from "@/components/Navigation.vue";
import { dataListItem, mianResponseData } from "../../common/common";
import cateGoryInfo from "@/ts/cateGoryInfo";
import Preview from "@/components/preview/Preview.vue";
import ShareFile from "@/views/main/ShareFile.vue";
import FileIcon from "@/components/FileIcon.vue";
import MessageModal from "@/components/message/MessageModal.vue";
import MessageToast from "@/components/message/MessageToast.vue";
import request from "../../utils/request";
import Loadding from "@/components/Loadding.vue";
const columns = ref([
  {
    label: "文件名",
    prop: "fileName",
    scopedSlots: "fileName",
  },
  {
    label: "修改时间",
    prop: "lastUpdateTime",
    width: 200,
  },
  {
    label: "大小",
    prop: "fileSize",
    scopedSlots: "fileSize",
    width: 100,
  },
]);

const api = {
  loadDataList: "file/loadDataList",
  newFoloder: "file/newFoloder",
  rename: "file/rename",
  moveFile: "file/moveFile",
  delFile: "file/delFile",
  createDownloadUrl: "file/createDownloadUrl",
  download: "api/file/download",
};

// 请求的基本连接
const baseurl =
  getCurrentInstance()?.appContext.config.globalProperties.$baseurl;
// 页面展示的数据
const tableData = ref<mianResponseData>({
  pageSize: 9,
  pageNo: 1,
  pageTotal: 10,
  list: [],
});
const filePid = ref("0");

const loadding = ref();
// 进入时，子组件路由监听，调用getAllfFolder 进行接口请求，获取展示的数据
const getAllFolder = async () => {
  // 请求时用的参数
  let params: {
    pageNo: number;
    pageSize: number;
    fileNameFuzzy?: string | null;
    filePid?: string;
    category: string;
  } = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
    fileNameFuzzy: fileNameFuzzy.value,
    filePid: currentFolder.value.fileId,
    category: category.value,
  };
  if (params.category !== "all") {
    delete params.filePid;
  }
  if (!fileNameFuzzy.value) {
    delete params.fileNameFuzzy;
  }
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
  if (result.data.code !== 200) {
    return;
  }
  let tempData = result.data.data;
  tempData.pageNo = parseInt(tempData.pageNo);
  tempData.pageSize = parseInt(tempData.pageSize);
  tableData.value = tempData;
};
// ---------------------------------------------------------------------------------
// 页码发生改变时
const changeSize = (num: number) => {
  tableData.value.pageNo = num;
  getAllFolder();
};

// ----------------------------------------------
// 绑定Table
const dataTable = ref();
// 新建的目录
const newFolder = ref({
  fileName: "",
  newEdit: false,
});

const editIpt = ref();
// 将newEdit更改成true，新建目录
const addNewFolder = () => {
  tableData.value.list.forEach((item) => (item.showEdit = false));
  newFolder.value.newEdit = true;
  nextTick(() => {
    // console.log(editIpt.value)
    editIpt.value.focus();
  });
};
// ----------------------------------------------------------------------
// 新建文件夹后刷新当前页面的数据
const updateDataList: () => void = () => {
  getAllFolder();
};
// -----------------------------------------------------------
// 更改文件名
let currentData: dataListItem;
const editName: (data: dataListItem) => void = (data) => {
  currentData = data;
  tableData.value.list.forEach((item) => (item.showEdit = false));
  newFolder.value.newEdit = false;
  newFolder.value.fileName = "";
  if (currentData.folderType === 0) {
    currentData.fileNameReal = currentData.fileName.substring(
      0,
      currentData.fileName.indexOf(".")
    );
    currentData.fileSuffix = currentData.fileName.substring(
      currentData.fileName.indexOf(".")
    );
  } else {
    currentData.fileNameReal = currentData.fileName;
    currentData.fileSuffix = "";
  }
  data.showEdit = true;
  nextTick(() => {
    // console.log(editIpt.value)
    editIpt.value[0].focus();
  });
};
const submitEditName: (isNewDir: boolean, data?: dataListItem) => void = async (
  isNewDir,
  data
) => {
  let name = "";
  // console.log(editIpt.value[0].value)
  // 判断是否为新建文件夹
  if (isNewDir) {
    // 新建目录的名称
    name = newFolder.value.fileName;
    let params = {
      filename: name,
      pid: currentFolder.value.fileId,
    };
    let result = await request({
      method: "POST",
      url: api.newFoloder,
      data: params,
    });
    if (result.data.code === 4000) {
      messageToast.value.showToast({
        type: "error",
        message: result.data.error,
      });
      return;
    }
    if (result.data.code != 200) {
      messageToast.value.showToast({
        type: "error",
        message: "新建文件夹失败！",
      });
    } else {
      // 重新获取当前页的数据
      updateDataList();
    }
  } else {
    // 修改后的文件的名称
    name = editIpt.value[0].value + currentData.fileSuffix;
    let result = await request({
      url: api.rename,
      method: "POST",
      data: {
        name: name,
        fileId: data?.fileId,
      },
    });
    // console.log(result)
    if (result.data.code === 4000) {
      messageToast.value.showToast({
        type: "error",
        message: result.data.error,
      });
      return;
    }
    if (result.data.code != 200) {
      return;
    }
    data ? (data.fileName = name) : "";
  }
  // 关闭修改框
  closeEditName(isNewDir, data);
  getAllFolder();
};
// 取消修改
const closeEditName: (isnewDir: boolean, data?: dataListItem) => void = (
  isnewDir = false,
  data
) => {
  if (isnewDir) {
    newFolder.value.newEdit = false;
    newFolder.value.fileName = "";
  } else {
    data ? (data.showEdit = false) : "";
  }
  editIpt.value.value = "";
};
// ----------------------------------------------------------
// 是否为全部不是分类
const category = ref("all");

// 绑定文件选择的input
const fileInput = ref();
const clickAddFile = () => {
  fileInput.value.click();
};
// -------------------------------------------------------
// 上传文件的限制,如到视频分类时，点击上传文件，则选中视频类
type categoryType = "all" | "video" | "music" | "image" | "doc" | "others";
const fileAccept = computed(() => {
  const categoryItem = cateGoryInfo[category.value as categoryType];
  return categoryItem ? categoryItem.accept : "*";
});
// -------------------------------------------------------
// 上传文件，调用父组件的方法来上传文件
const emit = defineEmits(["addFile"]);
const addFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const fileData = target.files && target.files[0];
  emit("addFile", { file: fileData, filePid: currentFolder.value.fileId });
  target.value = "";
};

// --------------------------------------------------------
// 上传完文件后进行回调，刷新页面
const reload = () => {
  getAllFolder();
};
defineExpose({ reload });
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
// --------------------------------------------------------
// 选中的数据的id的列表
const selectIdList = ref<string[]>([]);
// 设置选中的列表数据
const setSelectList: (list: string[]) => void = (list) => {
  // console.log(list)
  selectIdList.value = list;
};
// 是否有选中文件或目录
const haveSelect = computed(() => {
  return selectIdList.value.length > 0;
});
// -------------------------------------------------------------
// 提示框信息
const messageModal = ref();
// 存放要删除的文件id
let delList: string[] = [];
// 删除单个文件
const deleteFile: (data: dataListItem) => void = (data) => {
  delList = [data.fileId];
  messageModal.value.openMessage({
    message: `你确定要删除 ${data.fileName} 吗？删除的文件可在10天内通过回收站还原！`,
    title: "温馨提示！",
  });
};
// 删除选中的所有文件
const delAllCheck = () => {
  delList = selectIdList.value;
  messageModal.value.openMessage({
    message: `你确定要删除选中的文件吗？删除的文件可在10天内通过回收站还原！`,
    title: "温馨提示！",
  });
};

// 确定删除
const delFolderFile = async () => {
  let result = await request({
    method: "POST",
    url: api.delFile,
    data: {
      idList: delList,
    },
  });
  if (result.data.code !== 200) {
    messageToast.value.showToast({
      type: "error",
      message: "删除失败，请稍后再试",
    });
    return;
  }
  messageToast.value.showToast({
    type: "success",
    message: "删除成功！",
  });
  getAllFolder();
};

// ---------------------------------------------------------------
// 移动选中的文件
const moveSelectModal = ref();
// 移动单个文件
const moveOneFile: (data: dataListItem) => void = (data) => {
  moveSelectModal.value.showSelectModal([data.fileId]);
};
// 移动多个文件
const moveFolderPath = () => {
  moveSelectModal.value.showSelectModal(selectIdList.value);
};

// 确定移动文件到对应目录
const moveFolderDone: (obj: {
  pid: string;
  list: string[];
}) => Promise<void> = async (obj) => {
  // console.log(obj.list)
  // 调用接口，进行修改选中的文件的filePid
  let result = await request({
    method: "POST",
    url: api.moveFile,
    data: {
      idList: obj.list,
      pid: obj.pid,
    },
  });
  // console.log(result)
  if (result.data.code !== 200) {
    messageToast.value.showToast({
      type: "error",
      message: "移动失败，请稍后再试！",
    });
    return;
  }
  messageToast.value.showToast({
    type: "success",
    message: "移动成功！",
  });
  getAllFolder();

  moveSelectModal.value.closeSelectModal();
};
// -----------------------------------------------------------------
// 绑定消息弹窗
const messageToast = ref();
// 如果是目录，则点击进入目录,如果不是则预览
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
// ------------------------------------------------------------------
// 点击进入目录
const navigationRef = ref();

const changeSelectFolder: (data: dataListItem) => void = (data) => {
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
  // console.log(data)
  const { categoryId, curFolder } = data;
  currentFolder.value = curFolder;
  category.value = categoryId;
  // console.log(category.value)
  // 获取当前目录下的文件
  getAllFolder();
};
// ----------------------------------------------------------------------
// 下载文件
const download = async (file: dataListItem) => {
  // console.log('点击下载文件',file.fileName)
  let result;
  try {
    result = await request({
      method: "GET",
      url: api.createDownloadUrl + "/" + file.fileId,
    });
  } catch {
    messageToast.value.showToast({
      type: "error",
      message: "下载失败，请稍后再试！",
    });
  }
  if (!result) {
    return;
  }
  // console.log(result.data)
  window.location.href =
    baseurl +
    api.download +
    "/" +
    result.data.data +
    "/" +
    result.data.fileName;
};
// ----------------------------------------------------------------------
// 搜索绑定的值
const fileNameFuzzy = ref();
// 按文件名进行搜索
const search = () => {
  // console.log(fileNameFuzzy.value)
  getAllFolder();
};

// -------------------------------------------------------------------
// 预览的组件
const previewRef = ref();
const showPreview = (data: dataListItem) => {
  previewRef.value.openPreview(data, 0);
};
// ------------------------------------------------------------------------
// 点击分享文件
const shareFile = ref();
const showShareFile = (file: dataListItem) => {
  shareFile.value.openShareFile(file);
};
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
// ---------------------------------------------------------------------------
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
</style>
