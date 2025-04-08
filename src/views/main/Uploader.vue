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
          <span
            :class="['iconfont', 'icon-' + STATUS[item.status].icon]"
            :style="{ color: STATUS[item.status].color }"
          ></span>
          <span class="status" :style="{ color: STATUS[item.status].color }">
            {{
              item.status == "fail" ? item.errorMsg : STATUS[item.status].desc
            }}
          </span>
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
            <span
              class="iconfont icon-jixuxiazai"
              v-if="item.pause"
              @click="continue_uploader(item.uid, item.chunkIndex)"
            ></span>
            <span
              class="iconfont icon-pause"
              v-else
              @click="pause_uploader(item.fileId)"
            ></span>
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
import { formatFileSize, getChunkSize } from "@/utils/utils";
import { STATUS } from "@/utils/data";
import NotData from "@/components/NotData.vue";
import SparkMD5 from "spark-md5";
import request from "@/utils/request";
import { nanoid } from "nanoid";
import { addDataToIDB, getDataFromIDB, deleteDataFromIDB } from "@/utils/db";
import { FileItemType } from "./types";
import pako from "pako";
import CryptoJS from "crypto-js";

const api = {
  uploadFile: "file/uploadFile",
  cancelUpload: "file/cancelUpload",
  pauseUploader: "file/pauseUploader",
};

const encryptionKey =
  getCurrentInstance()?.appContext.config.globalProperties.$encryptionKey;
const ivKey = getCurrentInstance()?.appContext.config.globalProperties.$iv;

//文件列表
const fileList = ref<FileItemType[]>([]);
// 控制文件请求是否被取消
const signalList = ref<
  [{ fileId: string; signal: AbortController; status: boolean }]
>([{ fileId: "", signal: new AbortController(), status: true }]);

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
  signalList.value.push({
    fileId: fileItem.fileId,
    signal: new AbortController(),
    status: true,
  });
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
  uploadFile(md5FileUid);
};

// 计算文件的MD5
const computedMd5: (fileItem: FileItemType) => Promise<string | null> = (
  fileItem
) => {
  let chunkSize = getChunkSize(fileItem.totalSize);
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

// 发送多请求的文件分块上传
// 分片上传
const uploadFile: (uid: string, chunkIndex?: number) => void = async (
  uid,
  chunkIndex = 0
) => {
  let currentFile = getFileByUid(uid);
  let chunkSize = getChunkSize(currentFile.totalSize);
  let file = currentFile.file;
  // 文件大小
  const fileSize = currentFile.totalSize;
  // 总切片数
  const chunks = Math.ceil(fileSize / chunkSize);
  // 文件块上传任务
  async function uploadChunk(
    formData: any,
    chunkIndex: number,
    status: keyof typeof STATUS,
    fileId: string,
    currentFile: FileItemType
  ): Promise<void> {
    // 如果文件已经上传完成，则退出
    if (
      status === STATUS.upload_seconds.value ||
      status === STATUS.upload_finish.value
    ) {
      currentFile.uploadSize = currentFile.totalSize;
      currentFile.uploadProgress = 1;
      return;
    }
    let signalItem = signalList.value.find((item) => item.fileId === fileId);
    if (!signalItem) {
      return;
    }
    try {
      // 进行分片的上传
      let updateResult = await request({
        method: "POST",
        url: api.uploadFile,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal: signalItem.signal.signal,
        //上传后的回调信息
        onUploadProgress: (event: any) => {
          // 获取当前分块的上传进度
          let loaded = event.loaded;
          // 限制当前分块的最大值
          if (loaded > chunkSize) {
            loaded = chunkSize;
          }

          // 计算总体进度
          const previousChunksSize = chunkIndex * chunkSize; // 之前分块的总大小
          const totalLoaded = previousChunksSize + loaded; // 已上传的总大小

          // 使用requestAnimationFrame实现平滑过渡
          const smoothProgress = (
            startValue: number,
            endValue: number,
            duration: number = 300
          ) => {
            const startTime = performance.now();
            const update = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              if (currentFile.uploadProgress === 1) return;
              // 使用easeOut函数使动画更自然
              const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
              const currentValue =
                startValue + (endValue - startValue) * easeOut(progress);

              // 更新上传大小和进度
              currentFile.uploadSize = Math.min(
                Math.round(currentValue),
                fileSize
              );
              currentFile.uploadProgress = parseFloat(
                (currentFile.uploadSize / fileSize).toFixed(4)
              );

              if (progress < 1) {
                requestAnimationFrame(update);
              }
            };

            requestAnimationFrame(update);
          };

          // 计算目标进度值
          const targetLoaded = Math.min(totalLoaded, fileSize);

          // 从当前进度平滑过渡到目标进度
          smoothProgress(currentFile.uploadSize, targetLoaded);
        },
      });
      //如果上传后，放回的值为 null则退出
      if (updateResult.data.code != 200 || updateResult.code != 200) {
        currentFile.status = STATUS.fail.value as keyof typeof STATUS;
        currentFile.errorMsg = updateResult.data.error;
        localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
      }
      currentFile.fileId = updateResult.data.data.fileId;
      //设置状态
      currentFile.status = STATUS[
        updateResult.data.data.status as keyof typeof STATUS
      ].value as keyof typeof STATUS;
      currentFile.chunkIndex = chunkIndex;
      localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
      if (
        updateResult.data.data.status === STATUS.upload_seconds.value ||
        updateResult.data.data.status === STATUS.upload_finish.value
      ) {
        currentFile.uploadProgress = 1;
        currentFile.uploadSize = currentFile.totalSize;
        deleteDataFromIDB(currentFile.fileId);
        localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
        // 上传文件结束后，刷新一下列表
        emit("uploadCallback");
      }
    } catch (error: any) {
      // 取消上传
      // if (error.message === "canceled") {
      //   return;
      // }
      // 停止promise
      signalItem.signal.abort();
      signalItem.status = false;
      currentFile.status = STATUS.fail.value as keyof typeof STATUS;
      if (error.response) {
        currentFile.errorMsg = error.errorMsg;
      } else {
        currentFile.errorMsg = "未知错误！";
      }
      localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
    }
  }
  const batchSize = 1; // 每次并发请求的数量
  const uploadPromises: Promise<any>[] = [];

  for (let i = chunkIndex; i < chunks; i++) {
    let delIndex = delList.value.indexOf(uid);
    if (delIndex != -1) {
      delList.value.splice(delIndex, 1);
      break;
    }
    // 每次操作的时候，file的状态可能会变
    currentFile = getFileByUid(uid);
    if (!currentFile) {
      return;
    }

    if (
      signalList.value.find((item) => item.fileId === currentFile.fileId)
        ?.status === false
    ) {
      return;
    }
    if (currentFile.pause) {
      break;
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
    const compressedData = pako.gzip(
      new Uint8Array(await chunkFile.arrayBuffer())
    );
    // 将压缩后的文件转换为Blob
    const compressedBlob = new Blob([compressedData], {
      type: "application/octet-stream",
    });

    // 将 文件块Blob 转换为 ArrayBuffer
    const chunkFileArrayBuffer = await compressedBlob.arrayBuffer();
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
    const encryptedBase64 = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);

    const formData = new FormData();
    formData.append("fileBase64", encryptedBase64);
    formData.append("fileName", file.name);
    formData.append("fileMd5", currentFile.md5 as string);
    formData.append("chunkIndex", i + "");
    formData.append("chunks", chunks + "");
    formData.append("fileId", currentFile.fileId);
    formData.append("filePid", currentFile.filePid);
    formData.append("fileSize", currentFile.totalSize + "");
    formData.append("fileType", file.type);

    uploadPromises.push(
      uploadChunk(
        formData,
        i,
        currentFile.status,
        currentFile.fileId,
        currentFile
      )
    ); // 每个分片上传任务
    if (uploadPromises.length === batchSize || i === chunks - 1) {
      await Promise.all(uploadPromises);
      uploadPromises.length = 0;
    }
  }

  // 判断是否暂停上传了
  if (currentFile.pause) {
    return;
  }
  emit("uploadCallback");
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

// 恢复上传
const continue_uploader = (uid: string, chunkIndex: number) => {
  fileList.value.map((item) => {
    if (item.uid === uid) {
      item.pause = false;
    }
  });
  uploadFile(uid, chunkIndex);
};

// 取消上传
const cancel_uploader = async (uid: string, fileId: string) => {
  let signalItem = signalList.value.find((item) => item.fileId === fileId);
  if (signalItem) {
    signalItem.signal.abort();
    signalItem.status = false;
  }
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
  deleteDataFromIDB(fileId);
  localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
};

// 删除文件的上传记录
const delete_file_history = (uid: string) => {
  fileList.value = fileList.value.filter((item) => item.uid != uid);
  localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
};

// 删除所有上传记录
const clearHistory = () => {
  fileList.value = [];
  localStorage.removeItem("uploadFileList");
};

onMounted(() => {
  if (localStorage.getItem("uploadFileList")) {
    let local_fileList = JSON.parse(
      localStorage.getItem("uploadFileList") as string
    );
    fileList.value = local_fileList;
    fileList.value.forEach((item) => {
      signalList.value.push({
        fileId: item.fileId,
        status: true,
        signal: new AbortController(),
      });
    });
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
