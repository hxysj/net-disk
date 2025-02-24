<template>
  <div class="file-list">
    <div
      class="file-item"
      v-if="fileList.length"
      v-for="item in fileList"
      :key="item.uid"
    >
      <div class="upload-panel">
        <div class="filename">
          {{ item.fileName }}
        </div>
        <!-- 进度条 -->
        <div
          class="item-progress"
          v-if="
            item.status === STATUS.uploading.value ||
            item.status === STATUS.upload_seconds.value ||
            item.status === STATUS.upload_finish.value
          "
        >
          <div
            class="progress"
            role="progressbar"
            aria-label="Basic example"
            :aria-valuenow="item.uploadProgress * 100"
            aria-valuemin="0"
            aria-valuemax="100"
            style="height: 8px"
          >
            <div
              class="progress-bar"
              :class="[item.pause ? 'bg-warning' : '']"
              :style="{ width: item.uploadProgress * 100 + '%' }"
            ></div>
          </div>
          <div>{{ Math.floor(item.uploadProgress * 100) }}%</div>
        </div>
        <div class="upload-status">
          <!-- 图标 -->
          <span
            :class="['iconfont', 'icon-' + STATUS[item.status].icon]"
            :style="{ color: STATUS[item.status].color }"
          ></span>
          <!-- 状态描述 -->
          <span class="status" :style="{ color: STATUS[item.status].color }">
            {{
              item.status == "fail" ? item.errorMsg : STATUS[item.status].desc
            }}
          </span>
          <!-- 上传中时显示大小进度 -->
          <span
            class="upload-info"
            v-if="item.status === STATUS.uploading.value"
          >
            {{ formatFileSize(item.uploadSize) }}/{{
              formatFileSize(item.totalSize)
            }}
          </span>
        </div>
      </div>
      <div class="op">
        <div
          class="spinner-border text-warning"
          role="status"
          v-if="item.status == STATUS.init.value"
        >
          <span class="visually-hidden">Loading...</span>
        </div>
        <div class="op-btn">
          <template v-if="item.status === STATUS.uploading.value">
            <!-- 上传按钮 -->
            <span
              class="iconfont icon-jixuxiazai"
              v-if="item.pause"
              @click="continue_uploader(item.uid, item.fileId, item.chunkIndex)"
            ></span>
            <!-- 暂停按钮 -->
            <span
              class="iconfont icon-pause"
              v-else
              @click="pause_uploader(item.fileId)"
            ></span>
            <!-- 取消按钮 -->
            <span
              class="iconfont icon-close"
              v-if="
                item.status !== STATUS.init.value &&
                item.status !== STATUS.upload_finish.value &&
                item.status !== STATUS.upload_seconds.value
              "
              @click="cancel_uploader(item.uid, item.fileId)"
            ></span>
          </template>
          <template v-else>
            <!-- 删除按钮,已经上传完成了 -->
            <span
              class="iconfont icon-del"
              v-if="
                item.status === STATUS.upload_finish.value ||
                item.status === STATUS.upload_seconds.value
              "
              @click="delete_file_history(item.uid)"
            ></span>
          </template>
        </div>
      </div>
    </div>
    <div class="not-data" v-else>
      <NotData>
        <template #msg> 暂无上传任务 </template>
      </NotData>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from "vue";
import { formatFileSize } from "@/utils/utils";
import { STATUS } from "@/utils/data";
import NotData from "@/components/NotData.vue";
import SparkMD5 from "spark-md5";
import request from "@/utils/request";
import { nanoid } from "nanoid";
import { addDataToIDB, getDataFromIDB, deleteDataFromIDB } from "@/utils/db";
import { FileItemType } from "./types";
import CryptoJS from "crypto-js";

const api = {
  uploadFile: "file/uploadFile",
  cancelUpload: "file/cancelUpload",
  pauseUploader: "file/pauseUploader",
};
const websocketUrl =
  getCurrentInstance()?.appContext.config.globalProperties.websocketUrl;

const encryptionKey =
  getCurrentInstance()?.appContext.config.globalProperties.$encryptionKey;
const ivKey = getCurrentInstance()?.appContext.config.globalProperties.$iv;

//文件列表
const fileList = ref<FileItemType[]>([]);

// 实现文件上传
const addFile: (file: File, filePid: string) => void = async (
  file,
  filePid
) => {
  const fileItem: FileItemType = {
    file: file,
    uid: nanoid(),
    md5: null,
    md5Progress: 0,
    fileName: file.name,
    status: "init",
    uploadSize: 0,
    totalSize: file.size,
    uploadProgress: 0,
    pause: false,
    chunkIndex: 0,
    filePid: filePid,
    errorMsg: null,
    fileId: nanoid(),
  };
  fileList.value.unshift(fileItem);
  // 如果上传的文件大小为空
  if (fileItem.totalSize === 0) {
    fileItem.status = "emptyfile";
    return;
  }

  // 获取计算好的文件md5值
  let md5FileUid = await computedMd5(fileItem);
  if (md5FileUid === null) {
    return;
  }
  localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
  addDataToIDB(fileItem.fileId, file);
  // 进行文件上传
  uploadFile(md5FileUid, fileItem.fileId);
};

// ----------
// 每一个分片的大小
const chunkSize = 1024 * 1024 * 1;
// 计算文件的MD5
const computedMd5: (fileItem: FileItemType) => Promise<string | null> = (
  fileItem
) => {
  let file = fileItem.file;
  // 根据不同浏览器的处理方式不同
  // let blogSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
  let blogSlice = File.prototype.slice;
  // 分片的数量,向上取整
  let chunks = Math.ceil(file.size / chunkSize);
  let currentChunk = 0;
  let spark = new SparkMD5.ArrayBuffer();
  let fileReader = new FileReader();

  let loadNext = () => {
    let start = currentChunk * chunkSize;
    let end = start + chunkSize >= file.size ? file.size : start + chunkSize;
    fileReader.readAsArrayBuffer(blogSlice.call(file, start, end));
  };
  loadNext();
  return new Promise<string | null>((resolve) => {
    let resultFile = getFileByUid(fileItem.uid);
    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      spark.append((e.target as FileReader).result as ArrayBuffer);
      if (currentChunk < chunks) {
        // console.log(`第${file.name},${currentChunk}分片解析完成`)
        let percent = Math.floor((currentChunk / chunks) * 100);
        resultFile.md5Progress = percent;
        loadNext();
      } else {
        let md5 = spark.end();
        spark.destroy();
        resultFile.md5Progress = 1;
        resultFile.status = "uploading";
        resultFile.md5 = md5;
        resolve(fileItem.uid as string);
      }
      currentChunk++;
    };
    fileReader.onerror = () => {
      resultFile.md5Progress = -1;
      resultFile.status = "fail";
      resolve(fileItem.uid as string);
    };
  }).catch((error) => {
    console.log(error);
    return null;
  });
};

// 获取文件
const getFileByUid: (uid: string) => FileItemType = (uid) => {
  let file = fileList.value.find((item) => {
    return item.uid === uid;
  }) as FileItemType;
  return file;
};
// 要删除的文件（上传一半进行删除操作）
const delList = ref<string[]>([]);

const emit = defineEmits(["uploadCallback"]);

// 使用websocket进行文件分块上传
// 进行文件上传
const uploadFile: (
  uid: string,
  fileId: string,
  chunkIndex?: number
) => void = async (uid, fileId, chunkIndex = 0) => {
  let currentFile = getFileByUid(uid);
  let file = currentFile.file;
  // 文件大小
  const fileSize = currentFile.totalSize;
  // 总切片数
  const chunks = Math.ceil(fileSize / chunkSize);

  let isCLose = false;
  let params = new URLSearchParams({
    file_id: fileId,
    token: localStorage.getItem("token") as string,
  });
  const ws = new WebSocket(`${websocketUrl}/file/?${params.toString()}`);

  ws.onopen = async () => {
    for (let i = chunkIndex; i < chunks; i++) {
      if (isCLose) {
        return;
      }
      let delIndex = delList.value.indexOf(uid);
      if (delIndex != -1) {
        delList.value.splice(delIndex, 1);
        break;
      }
      // 每次操作的时候，file的状态可能会变
      currentFile = getFileByUid(uid);
      if (
        !currentFile ||
        currentFile.uploadProgress === 1 ||
        currentFile.pause
      ) {
        ws.close();
        return;
      }

      let start = i * chunkSize;
      let end = start + chunkSize >= fileSize ? fileSize : start + chunkSize;
      // 对文件进行切片
      let chunkFile: Blob;
      try {
        chunkFile = file.slice(start, end);
      } catch {
        let file_data = await getDataFromIDB(currentFile.fileId);
        file = file_data;
        chunkFile = file_data.slice(start, end);
      }
      // 将 文件块Blob 转换为 ArrayBuffer
      const chunkFileArrayBuffer = await chunkFile.arrayBuffer();
      // 将 ArrayBuffer 转换为 WordArray
      const wordArray = CryptoJS.lib.WordArray.create(chunkFileArrayBuffer);

      // 使用 AES 加密
      const encrypted = CryptoJS.AES.encrypt(
        wordArray,
        CryptoJS.enc.Utf8.parse(encryptionKey),
        {
          iv: CryptoJS.enc.Utf8.parse(ivKey),
          padding: CryptoJS.pad.Pkcs7,
          mode: CryptoJS.mode.CBC,
        }
      );
      // 将加密数据转成 Base64 字符串
      const encryptedBase64 = CryptoJS.enc.Base64.stringify(
        encrypted.ciphertext
      );
      const formData = {
        fileBase64: encryptedBase64,
        fileName: file.name,
        fileMd5: currentFile.md5 as string,
        chunkIndex: i + "",
        chunks: chunks + "",
        fileId: currentFile.fileId,
        filePid: currentFile.filePid,
        fileSize: currentFile.totalSize + "",
        contentType: file.type,
      };
      ws.send(JSON.stringify(formData));
    }
  };
  ws.onmessage = (e) => {
    let result = JSON.parse(e.data);
    if (result.code != 10000) {
      currentFile.status = STATUS.fail.value as keyof typeof STATUS;
      currentFile.errorMsg = result.error;
      localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
      ws.close();
      return;
    }
    currentFile.status = result.status as keyof typeof STATUS;
    currentFile.fileName = result.fileName;
    currentFile.uploadSize = parseInt(result.index) * chunkSize;
    currentFile.uploadProgress = parseFloat(
      (currentFile.uploadSize / fileSize).toFixed(2)
    );
    currentFile.chunkIndex = result.index;
    if (
      result.status === STATUS.upload_seconds.value ||
      result.status === STATUS.upload_finish.value
    ) {
      currentFile.uploadProgress = 1;
      deleteDataFromIDB(currentFile.fileId);
      localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
      // 上传文件结束后，刷新一下列表
      emit("uploadCallback");
      ws.close();
    }
  };
  ws.onerror = (e) => {
    console.log(e);
    console.log("连接错误");
  };
  ws.onclose = () => {
    console.log("连接断开");
    isCLose = true;
  };
};
// 暂停上传
const pause_uploader = async (file_id: string) => {
  fileList.value.map((item) => {
    if (item.fileId == file_id) {
      item.pause = true;
    }
  });
  localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
  await request({
    method: "get",
    url: api.pauseUploader,
    params: {
      file_id: file_id,
    },
  });
};
// --------------------------------------------------------------------------
// 恢复上传
const continue_uploader = (uid: string, fileId: string, chunkIndex: number) => {
  fileList.value.map((item) => {
    if (item.uid === uid) {
      item.pause = false;
    }
  });
  uploadFile(uid, fileId, chunkIndex);
};
// ------------------------------------------------------------------------------
// 取消上传
const cancel_uploader = async (uid: string, fileId: string) => {
  fileList.value.map((item) => {
    if (item.uid === uid) {
      item.pause = false;
    }
  });
  let result;
  try {
    result = await request({
      method: "POST",
      url: api.cancelUpload,
      data: {
        fileId: fileId,
      },
    });
  } catch (error) {
    return;
  }
  if (!result) {
    return;
  }
  fileList.value = fileList.value.filter((item) => item.uid != uid);
  localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
};
// ------------------------------------------------------------------------------------------------
// 删除文件的上传记录
const delete_file_history = (uid: string) => {
  fileList.value = fileList.value.filter((item) => item.uid != uid);
  localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
};
// ---------------------------------------------------------------------------
// 删除所有上传记录
const clearHistory = () => {
  fileList.value = [];
  localStorage.removeItem("uploadFileList");
};
// ----------------------------------------------------------------------------------------------
onMounted(() => {
  if (localStorage.getItem("uploadFileList")) {
    let local_fileList = JSON.parse(
      localStorage.getItem("uploadFileList") as string
    );
    fileList.value = local_fileList;
  }
});
// 将实现文件上传的方法和删除历史记录共享出去
defineExpose({ addFile, clearHistory });
</script>

<style scoped lang="scss">
.file-list {
  display: flex;
  min-height: 300px;
  flex-direction: column;
  align-items: center;
  .upload-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .file-item {
    width: 100%;
    padding: 5px 10px;
    font-size: 12px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    .progress {
      width: 85%;
    }
    .item-progress {
      display: flex;
      gap: 5px;
      align-items: center;
    }
    .upload-status {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .op {
      .spinner-border {
        width: 20px;
        height: 20px;
      }
      .op-btn {
        display: flex;
        gap: 10px;
        span {
          display: inline-block;
        }
        span:hover {
          cursor: pointer;
        }
      }
    }
  }
  .file-item:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
  .not-data {
    width: 100%;
    height: 100%;
    margin: auto;
  }
}
</style>
