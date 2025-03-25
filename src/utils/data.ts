// 状态
export const STATUS = {
  emptyfile: {
    value: "emptyfile",
    desc: "文件为空",
    color: "#F75000",
    icon: "close",
  },
  fail: {
    value: "fail",
    desc: "上传失败",
    color: "#F75000",
    icon: "close",
  },
  init: {
    value: "init",
    desc: "解析中",
    color: "#e6a23c",
    icon: "clock",
  },
  uploading: {
    value: "uploading",
    desc: "上传中",
    color: "#409eff",
    icon: "upload",
  },
  upload_finish: {
    value: "upload_finish",
    desc: "上传完成",
    color: "#67c23a",
    icon: "ok",
  },
  upload_seconds: {
    value: "upload_seconds",
    desc: "秒传",
    color: "#67c23a",
    icon: "ok",
  },
};

export const MENUS = [
  {
    icon: "cloude",
    name: "首页",
    menuCode: "main",
    path: "/main/all",
    allShow: true,
    children: [
      {
        icon: "all",
        name: "全部",
        category: "all",
        path: "/main/all",
      },
      {
        icon: "video",
        name: "视频",
        category: "video",
        path: "/main/video",
      },
      {
        icon: "music",
        name: "音乐",
        category: "music",
        path: "/main/music",
      },
      {
        icon: "image",
        name: "图片",
        category: "image",
        path: "/main/image",
      },
      {
        icon: "doc",
        name: "文档",
        category: "doc",
        path: "/main/doc",
      },
      {
        icon: "more",
        name: "其他",
        category: "others",
        path: "/main/others",
      },
    ],
  },
  {
    path: "/myshare",
    icon: "share",
    name: "分享",
    menuCode: "share",
    allShow: true,
    children: [
      {
        name: "分享记录",
        path: "/myshare",
      },
    ],
  },
  {
    path: "/recycle",
    icon: "del",
    name: "回收站",
    menuCode: "recycle",
    allShow: true,
    tips: "",
    children: [
      {
        name: "删除的文件",
        path: "/recycle",
      },
    ],
  },
  {
    path: "/message/session",
    icon: "xiaoxi",
    name: "消息",
    menuCode: "communication",
    allShow: true,
    tips: "",
    children: [
      {
        name: "会话",
        path: "/message/session",
      },
      {
        name: "好友",
        path: "/message/friend",
      },
    ],
  },
  {
    path: "/settings/fileList",
    icon: "settings",
    name: "设置",
    menuCode: "settings",
    allShow: false,
    children: [
      {
        name: "用户文件",
        path: "/settings/fileList",
      },
      {
        name: "用户管理",
        path: "/settings/userList",
      },
      {
        name: "系统设置",
        path: "/settings/sysSetting",
      },
    ],
  },
];

export enum ApplyStatus {
  PENDING = 0,
  REJECTED = 1,
  APPROVED = 2,
  EXPIRED = 3,
}

// status 状态： 0待通过 1拒接 2通过
export const APPLY_STATUS = {
  [ApplyStatus.PENDING]: "待通过",
  [ApplyStatus.REJECTED]: "已拒绝",
  [ApplyStatus.APPROVED]: "已通过",
  [ApplyStatus.EXPIRED]: "已失效",
};

export const APPLY_STATUS_COLOR = {
  [ApplyStatus.PENDING]: "#409eff",
  [ApplyStatus.REJECTED]: "#F75000",
  [ApplyStatus.APPROVED]: "#67c23a",
  [ApplyStatus.EXPIRED]: "#909399",
};

export const BREAK_POINTS = [
  { max: 697, file: 8, user: 6 },
  { max: 743, file: 9, user: 6 },
  { max: 745, file: 10, user: 6 },
  { max: 798, file: 10, user: 7 },
  { max: 817, file: 11, user: 7 },
  { max: 849, file: 11, user: 8 },
  { max: 910, file: 12, user: 8 },
  { max: Infinity, file: 13, user: 9 },
];

// 文件分片配置
export const CHUNK_CONFIG = {
  // 基础分片大小 1MB
  BASE_SIZE: 1024 * 1024,

  // 分片大小配置 [文件大小上限(MB), 分片大小(MB), 期望分片数]
  SLICE_CONFIG: [
    { maxSize: 10, chunkSize: 1, expectedChunks: 10 }, // 10MB以下
    { maxSize: 100, chunkSize: 4, expectedChunks: 25 }, // 10-100MB
    { maxSize: 500, chunkSize: 8, expectedChunks: 63 }, // 100-500MB
    { maxSize: 2048, chunkSize: 16, expectedChunks: 128 }, // 500MB-2GB
    { maxSize: 10240, chunkSize: 32, expectedChunks: 320 }, // 2GB-10GB
    { maxSize: null, chunkSize: 64, expectedChunks: 640 }, // 10GB以上
  ],
} as const;
