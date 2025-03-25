/// <reference types="vite/client" />
// 这段代码告诉 TypeScript，所有以 .vue 结尾的文件都是 Vue 组件，可以通过 import 语句进行导入。这样做通常可以解决无法识别模块的问题。
declare module "*.vue" {
  import { Component } from "vue";
  const component: Component;
  export default component;
}

// vite-env.d.ts 或者其他类型声明文件
declare module "@highlightjs/vue-plugin" {
  import { Plugin } from "vue";
  const plugin: Plugin;
  export default plugin;
}

// 声明bootstrap
declare module "bootstrap";

declare module "aplayer";

declare module "echarts";

declare module "pako";

declare class Hls {
  constructor(config?: HlsConfig);
  loadSource(src: string): void;
  attachMedia(video: HTMLVideoElement): void;
  destroy(): void;
  // 其他你需要的方法和属性声明...
}

// 手动声明 utils文件
declare module "@/utils/utils" {
  export function formatFileSize(fileSizeInB: number): string;
  export function getCurrentFormattedTime(): string;
  export function parseToken(token: string): any;
  export function formatTime(
    targetTime: string | Date,
    language: "zh" | "en" = "zh"
  ): string;
  export function generateUniqueId(): string;
  export function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay?: number
  ): (...args: Parameters<T>) => void;
}

declare module "@/utils/request" {
  export default request as AxiosInstance;
}

declare module "@/ts/cateGoryInfo" {
  export default {
    all: {
      accept: string,
    },
    video: {
      accept: string,
    },
    music: {
      accept: string,
    },
    image: {
      accept: string,
    },
    doc: {
      accept: string,
    },
    others: {
      accept: string,
    },
  };
}

// src/utils/data.d.ts
declare module "@/utils/data" {
  export const STATUS: {
    [key: string]: {
      value: string;
      icon: string;
      desc: string;
      color?: string;
    };
  };
  export const APPLY_STATUS: {
    [key: string]: string;
  };
  export const APPLY_STATUS_COLOR: {
    [key: string]: string;
  };
}

// src/utils/db.d.ts
declare module "@/utils/db" {
  export function addDataToIDB(key: string, data: any): Promise<void>;
  export function getDataFromIDB(key: string): Promise<any>;
  export function deleteDataFromIDB(key: string): Promise<void>;
}
