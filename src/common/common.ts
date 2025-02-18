export interface dataListItem {
  fileCategory: number | null;
  fileCover: string | null;
  fileId: string;
  fileName: string;
  filePid: string;
  fileSize: number | null;
  fileType: number | null;
  folderType: number;
  lastUpdateTime: string;
  status: number | null;
  isCheck?: boolean;
  showOp?: boolean;
  showEdit?: boolean;
  fileNameReal?: string;
  fileSuffix?: string;
  userId?: string;
}

export interface shareListItem {
  fileId: string;
  fileName: string;
  shareId: string;
  fileCover: string | null;
  fileCategory: number | null;
  fileType: number | null;
  folderType: number;
  shareTime: string;
  expireTime: string;
  showCount: number;
  code: string;
  isCheck?: boolean;
  showOp?: boolean;
}

export interface recycleItem {
  fileCategory: number | null;
  fileCover: string | null;
  fileId: string;
  fileName: string;
  fileSize: number | null;
  fileType: number | null;
  folderType: number;
  recoveryTime: string;
  isCheck?: boolean;
  showOp?: boolean;
}

export interface fileListItem {
  fileCategory: number | null;
  fileCover: string | null;
  fileId: string;
  fileName: string;
  filePid: string;
  nickName: string;
  userId: string;
  fileSize: number | null;
  fileType: number | null;
  folderType: number;
  lastUpdateTime: string;
  status: number | null;
  isCheck?: boolean;
  showOp?: boolean;
}

export interface userItem {
  userId: string;
  nickName: string;
  useSpace: number;
  totalSpace: number;
  joinTime: string;
  lastLoginTime: string;
  status: boolean;
  isCheck?: boolean;
  avatar: string;
}

export interface mainResponseData {
  list: dataListItem[];
  pageSize: number;
  pageNo: number;
  pageTotal: number;
}

export interface shareResponseData {
  list: shareListItem[];
  pageSize: number;
  pageNo: number;
  pageTotal: number;
}

export interface recycleResponseData {
  list: recycleItem[];
  pageSize: number;
  pageNo: number;
  pageTotal: number;
}

export interface fileListResponseData {
  list: fileListItem[];
  pageSize: number;
  pageNo: number;
  pageTotal: number;
}

export interface userResponseData {
  list: userItem[];
  pageSize: number;
  pageNo: number;
  pageTotal: number;
}
