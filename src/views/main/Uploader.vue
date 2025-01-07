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
import { ref, onMounted } from "vue";
import { formatFileSize } from "@/utils/utils";
import { STATUS } from "@/utils/data";
import NotData from "@/components/NotData.vue";
import SparkMD5 from "spark-md5";
import request from "@/utils/request";
import { nanoid } from "nanoid";
import { addDataToIDB, getDataFromIDB, deleteDataFromIDB } from "@/utils/db";
import CryptoJS from "crypto-js";

const api = {
  uploadFile: "file/uploadFile",
  cancelUpload: "file/cancelUpload",
  pauseUploader: "file/pauseUploader",
};

//文件列表
const fileList = ref<fileItemType[]>([]);
// 控制文件请求是否被取消
// const signalList = ref<
//   [{ fileId: string; signal: AbortController; status: boolean }]
// >([{ fileId: "", signal: new AbortController(), status: true }]);

interface fileItemType {
  // 文件：文件大小，文件流，文件名...
  file: File;
  // 文件的Uid
  uid: string;
  // md5值
  md5: null | string;
  // md5进度
  md5Progress: number;
  //文件名
  fileName: string;
  // 上传状态
  status: keyof typeof STATUS;
  // 已上传大小
  uploadSize: number;
  // 文件总大小
  totalSize: number;
  // 上传进度
  uploadProgress: number;
  // 暂停
  pause: boolean;
  //当前分片
  chunkIndex: number;
  //文件父级ID
  filePid: string;
  // 文件id
  fileId: string;
  // 错误信息
  errorMsg: null | string;
}
// 实现文件上传
const addFile: (file: File, filePid: string) => void = async (
  file,
  filePid
) => {
  const fileItem: fileItemType = {
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
  // signalList.value.push({
  //   fileId: fileItem.fileId,
  //   signal: new AbortController(),
  //   status: true,
  // });
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
const computedMd5: (fileItem: fileItemType) => Promise<string | null> = (
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
const getFileByUid: (uid: string) => fileItemType = (uid) => {
  let file = fileList.value.find((item) => {
    return item.uid === uid;
  }) as fileItemType;
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
  const ws = new WebSocket(`ws://127.0.0.1:8001/ws/file/?${params.toString()}`);

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
      // 密钥和初始化向量（IV）
      const encryptionKey = "secret-key123456"; // 16 字节
      const iv = CryptoJS.enc.Utf8.parse("1234567890123456"); // 16 字节的 IV
      // 使用 AES 加密
      const encrypted = CryptoJS.AES.encrypt(
        wordArray,
        CryptoJS.enc.Utf8.parse(encryptionKey),
        {
          iv: iv,
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

// 发送多请求的文件分块上传
// 分片上传
// const uploadFile: (uid: string, chunkIndex?: number) => void = async (
//   uid,
//   chunkIndex
// ) => {
//   chunkIndex = chunkIndex ? chunkIndex : 0;
//   let currentFile = getFileByUid(uid);
//   let file = currentFile.file;
//   // 文件大小
//   const fileSize = currentFile.totalSize;
//   // 总切片数
//   const chunks = Math.ceil(fileSize / chunkSize);

//   // console.log('总分片数：',chunks)
//   // 文件块上传任务
//   async function uploadChunk(
//     formData: any,
//     chunkIndex: number,
//     status: keyof typeof STATUS,
//     fileId: string
//   ): Promise<void> {
//     // 如果文件已经上传完成，则退出
//     if (
//       status === STATUS.upload_seconds.value ||
//       status === STATUS.upload_finish.value
//     )
//       return;
//     let signalItem = signalList.value.find((item) => item.fileId === fileId);
//     if (!signalItem) {
//       return;
//     }
//     try {
//       // 进行分片的上传
//       let updateResult = await request({
//         method: "POST",
//         url: api.uploadFile,
//         data: formData,
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//         signal: signalItem.signal.signal,
//         //上传后的回调信息
//         onUploadProgress: (event: any) => {
//           //获取之前上传的文件的大小
//           let loaded = event.loaded;
//           if (loaded > fileSize) {
//             loaded = fileSize;
//           }
//           //现在上传的文件的大小
//           currentFile.uploadSize = chunkIndex * chunkSize + loaded;
//           currentFile.uploadProgress = parseFloat(
//             (currentFile.uploadSize / fileSize).toFixed(2)
//           );
//         },
//       });
//       //如果上传后，放回的值为 null则退出
//       if (updateResult.data.code != 200 || updateResult.code != 200) {
//         currentFile.status = STATUS.fail.value as keyof typeof STATUS;
//         currentFile.errorMsg = updateResult.data.error;
//         localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
//       }
//       currentFile.fileId = updateResult.data.data.fileId;
//       //设置状态
//       currentFile.status = STATUS[
//         updateResult.data.data.status as keyof typeof STATUS
//       ].value as keyof typeof STATUS;
//       currentFile.chunkIndex = chunkIndex;
//       localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
//       // console.log(updateResult.data)
//       if (
//         updateResult.data.data.status === STATUS.upload_seconds.value ||
//         updateResult.data.data.status === STATUS.upload_finish.value
//       ) {
//         currentFile.uploadProgress = 1;
//         deleteDataFromIDB(currentFile.fileId);
//         localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
//         // 上传文件结束后，刷新一下列表
//         // console.log('上传成功')
//         emit("uploadCallback");
//       }
//     } catch (error: any) {
//       // 取消上传
//       if (error.message === "canceled") {
//         return;
//       }
//       console.log(error.message);
//       console.log("出现错误");
//       currentFile.status = STATUS.fail.value as keyof typeof STATUS;
//       if (error.response) {
//         currentFile.errorMsg = error.errorMsg;
//       } else {
//         currentFile.errorMsg = "未知错误！";
//       }
//       localStorage.setItem("uploadFileList", JSON.stringify(fileList.value));
//     }
//   }
//   const batchSize = 1; // 每次并发请求的数量
//   const uploadPromises: Promise<any>[] = [];

//   for (let i = chunkIndex; i < chunks; i++) {
//     let delIndex = delList.value.indexOf(uid);
//     if (delIndex != -1) {
//       delList.value.splice(delIndex, 1);
//       break;
//     }
//     // 每次操作的时候，file的状态可能会变
//     currentFile = getFileByUid(uid);
//     // console.log(currentFile)
//     if (!currentFile) {
//       return;
//     }

//     if (
//       signalList.value.find((item) => item.fileId === currentFile.fileId)
//         ?.status === false
//     ) {
//       return;
//     }
//     if (currentFile.pause) {
//       // console.log('暂停了')
//       break;
//     }
//     let start = i * chunkSize;
//     let end = start + chunkSize >= fileSize ? fileSize : start + chunkSize;
//     // 对文件进行切片
//     let chunkFile: Blob;
//     try {
//       chunkFile = file.slice(start, end);
//     } catch {
//       let file_data = await getDataFromIDB(currentFile.fileId);
//       file = file_data;
//       chunkFile = file_data.slice(start, end);
//     }
//     // console.log(chunkFile);
//     // 将 文件块Blob 转换为 ArrayBuffer
//     const chunkFileArrayBuffer = await chunkFile.arrayBuffer();
//     // 将 ArrayBuffer 转换为 WordArray
//     const wordArray = CryptoJS.lib.WordArray.create(chunkFileArrayBuffer);
//     // 密钥和初始化向量（IV）
//     const encryptionKey = "secret-key123456"; // 16 字节
//     const iv = CryptoJS.enc.Utf8.parse("1234567890123456"); // 16 字节的 IV
//     // 使用 AES 加密
//     const encrypted = CryptoJS.AES.encrypt(
//       wordArray,
//       CryptoJS.enc.Utf8.parse(encryptionKey),
//       {
//         iv: iv,
//         padding: CryptoJS.pad.Pkcs7,
//         mode: CryptoJS.mode.CBC,
//       }
//     );
//     // 将加密数据转成 Base64 字符串
//     const encryptedBase64 = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
//     // 将base64的数据转为文件
//     const encryptedChunk = new Blob([encryptedBase64], {
//       type: "application/octet-stream",
//     });
//     // console.log('开始分片上传！',end)
//     const formData = new FormData();
//     formData.append("file", encryptedChunk);
//     formData.append("fileName", file.name);
//     formData.append("fileMd5", currentFile.md5 as string);
//     formData.append("chunkIndex", i + "");
//     formData.append("chunks", chunks + "");
//     formData.append("fileId", currentFile.fileId);
//     formData.append("filePid", currentFile.filePid);
//     formData.append("fileSize", currentFile.totalSize + "");
//     formData.append("fileType", file.type);

//     uploadPromises.push(
//       uploadChunk(formData, i, currentFile.status, currentFile.fileId)
//     ); // 每个分片上传任务

//     // 每当上传队列中的任务达到 batchSize，就执行这些任务并等待它们完成
//     if (uploadPromises.length === batchSize || i === chunks - 1) {
//       // 执行当前批次的请求，并等待它们完成
//       await Promise.all(uploadPromises);
//       uploadPromises.length = 0; // 清空队列，准备下一批请求
//     }
//   }

//   // console.log("所有文件分片上传完成");
//   // 判断是否暂停上传了
//   if (currentFile.pause) {
//     return;
//   }
//   emit("uploadCallback");
// };
//--------------------------------------------------------------------------
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
  // let signalItem = signalList.value.find((item) => item.fileId === fileId);
  // if (signalItem) {
  //   signalItem.signal.abort();
  //   signalItem.status = false;
  // }
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
    // fileList.value.forEach((item) => {
    // signalList.value.push({
    //   fileId: item.fileId,
    //   status: true,
    //   signal: new AbortController(),
    // });
    // });
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
  }
}
</style>
