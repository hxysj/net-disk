import { STATUS } from "@/utils/data";

export interface FileItemType {
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
