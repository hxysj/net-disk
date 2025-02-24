<template>
  <div class="framework">
    <nav class="header navbar">
      <div class="container-fluid">
        <a class="navbar-brand logo text-primary" href="/">
          <i class="iconfont icon-pan"></i>
          个人网盘
        </a>
        <div class="header-right">
          <div class="collapse-all">
            <i class="iconfont icon-transfer" @click="showCollapseCilck"></i>
            <!-- 任务列表 -->
            <div class="collapse-body container">
              <div
                class="collapse multi-collapse"
                :class="[showCollpase ? 'showCollpase' : '']"
                id="collapseWidthExample"
              >
                <div class="card">
                  <div class="card-header">
                    <span>上传任务</span>
                    <span class="card-header-small-title"
                      >（仅展示本次上传任务）</span
                    >
                    <span
                      class="iconfont icon-del header-del"
                      @click="clearHistory"
                      >删除所有历史记录</span
                    >
                  </div>
                  <div class="card-body">
                    <Uploader
                      ref="upLoaderRef"
                      @uploadCallback="uploadCallbackHandler"
                    ></Uploader>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="isLogin">
            <button class="btn btn-primary">登陆</button>
          </div>
          <div v-else class="dropdown">
            <div
              class="right-dropdown dropdown-toggle"
              data-bs-toggle="dropdown"
              id="dropdownMenuButton"
              aria-expanded="false"
            >
              <div class="right-img">
                <img
                  :src="
                    baseurl +
                    'media/' +
                    userInfo.avatar +
                    '?timeStamp=' +
                    timeStamp
                  "
                  alt=""
                />
              </div>
              <div class="right-name text-primary">
                {{ userInfo.username }}
              </div>
            </div>
            <!-- 用户下拉菜单 -->
            <ul
              class="dropdown-menu dropdown-menu-end"
              aria-labelledby="dropdownMenuButton"
            >
              <li>
                <a class="dropdown-item" href="#" @click.prevent="showAvatar"
                  >修改头像</a
                >
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="showPwd"
                  >修改密码</a
                >
              </li>
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModal"
                  >退出登陆</a
                >
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
    <div class="body">
      <div class="left-side" :class="[ishide ? 'showSide' : '']">
        <div class="menu-list">
          <template v-for="item in MENUS">
            <div
              @click="jump(item)"
              :class="[
                'menu-item',
                item.menuCode === currentMenu.menuCode ? 'active' : '',
              ]"
              v-if="item.allShow || userInfo.identity"
            >
              <div :class="['iconfont', 'icon-' + item.icon]"></div>
              <div class="text">{{ item.name }}</div>
            </div>
          </template>
        </div>
        <div class="menu-sub-list">
          <div
            :class="[
              'item-item-sub',
              currentPath === sub.path ? 'active' : '',
              currentPath === sub.path ? 'item-sub-active' : '',
            ]"
            v-for="sub in currentMenu.children"
            @click="jump(sub)"
          >
            <span
              :class="['iconfont', 'icon-' + sub.icon]"
              v-if="sub.icon"
            ></span>
            <span class="text">{{ sub.name }}</span>
          </div>
          <div class="tips" v-if="currentMenu.tips">{{ currentMenu.tips }}</div>
          <div class="space-info">
            <div class="space-title">空间使用</div>
            <div class="percent row m-0 d-flex flex-nowrap">
              <div class="col-8 m-0 p-0">
                <div
                  class="progress"
                  role="progressbar"
                  aria-label="BExample 5px high"
                  aria-valuenow="25"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style="height: 10px"
                >
                  <div
                    class="progress-bar"
                    :style="{
                      width: spaceUsagePercent + '%',
                    }"
                  ></div>
                </div>
              </div>
              <div class="col p-1 m-0">{{ spaceUsagePercent }}%</div>
            </div>
            <div class="space-refresh">
              <div>
                {{ formatFileSize(useSpaceInfo.useSpace) }} /
                {{ formatFileSize(useSpaceInfo.totalSpace) }}
              </div>
              <div class="iconfont icon-refresh" @click="getUseSpace"></div>
            </div>
          </div>
        </div>
        <div class="close-menu-list">
          <div>&lt</div>
          <input type="checkbox" v-model="ishide" name="" id="" />
        </div>
      </div>
      <div class="body-content">
        <router-view v-slot="{ Component }">
          <component
            :is="Component"
            ref="routeViewRef"
            @addFile="addFile"
          ></component>
        </router-view>
      </div>
      <div class="open-menu" v-show="!ishide">
        <div class="open-menu-item">
          <input v-model="ishide" class="open-menu-input" type="checkbox" />
          <div class="iconfont icon-right"></div>
        </div>
      </div>
    </div>
    <!-- 模态框组件 -->
    <UpdateAvatar
      ref="updataAvatar"
      @updateAvatar="refreshAvatar"
    ></UpdateAvatar>
    <UpdatePassword ref="updatePassword"></UpdatePassword>
    <!-- 退出登录 -->
    <div
      class="modal fade"
      id="exampleModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">温馨提示</h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">是否要退出登录？</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">
              取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="outLogin"
              data-bs-dismiss="modal"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
    <Loadding ref="loadding"></Loadding>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import UpdateAvatar from "@/views/UpdateAvatar.vue";
import UpdatePassword from "@/views/UpdatePassword.vue";
import Uploader from "@/views/main/Uploader.vue";
import { formatFileSize, parseToken } from "@/utils/utils";
import { MENUS } from "../utils/data";
import { getCurrentInstance } from "vue";
import request from "../utils/request";
import Loadding from "@/components/Loadding.vue";
// 请求的基本连接
const baseurl =
  getCurrentInstance()?.appContext.config.globalProperties.$baseurl;
const router = useRouter();
const route = useRoute();
// 是否登录
const isLogin = ref(false);

const api = {
  getUserSpace: "getUserSpace",
};

// 存放用户信息
const token = localStorage.getItem("token");
const userInfo = ref({
  ...parseToken(token as string),
});

// 当前激活状态的类型
interface chooseMenu {
  icon?: string;
  name: string;
  menuCode?: string;
  tips?: string;
  path: string;
  allShow?: boolean;
  children?: {
    icon?: string;
    name: string;
    category?: string;
    path: string;
  }[];
}
// 当前选择的一级菜单
const currentMenu = ref<chooseMenu>({
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
});
// 当前选中的二级菜单
const currentPath = ref();
// 点击切换
const jump: (item: chooseMenu) => void = (item) => {
  if (!item.path || item.menuCode === currentMenu.value.menuCode) {
    return;
  }
  router.push(item.path);
  // currentMenu.value = item
};
// -------------------------------------------------------
// 监听路由变化
const setMenu: (menuCode: string, path: string) => void = (menuCode, path) => {
  const menu = MENUS.find((item) => {
    return item.menuCode === menuCode;
  }) as chooseMenu;
  currentMenu.value = menu;
  currentPath.value = path;
};
watch(
  () => route.meta.menuCode,
  (menuCode) => {
    if (menuCode) {
      setMenu(menuCode as string, route.path);
    }
  },
  { immediate: true }
);
// -----------------------------------------------------------
// 绑定修改头像的模态框
const updataAvatar = ref();
const showAvatar = () => {
  updataAvatar.value.showModal({
    nickName: userInfo.value.username,
    imageUrl: baseurl + "media/" + userInfo.value.avatar,
  });
};
// 在图片链接添加？timeStamp=1321不影响图片的显示，刷新参数可以清除浏览器的缓存重新加载图像
const timeStamp = ref(0);
const refreshAvatar = () => {
  userInfo.value = { ...parseToken(localStorage.getItem("token") as string) };
  // 刷新时间，避免浏览器有缓存
  timeStamp.value = new Date().getTime();
};
// -----------------------------------------------------
// 绑定修改密码的模态框
const updatePassword = ref();
const showPwd = () => {
  updatePassword.value.showModal();
};
// -------------------------------------------------------
// 退出登录
const outLogin = () => {
  // 删除localstorage中的token
  // 返回登录页面
  localStorage.removeItem("token");
  router.push("/login");
};

// ---------------------------------------------------------
// 用于控制小屏幕是left-side的显示隐藏
const ishide = ref(false);

interface fileData {
  file: File;
  filePid: number;
}
// ---------------------------------------------------------
// 任务列表的显示
const showCollpase = ref(false);
// 点击是否显示任务列表
const showCollapseCilck = () => {
  showCollpase.value = !showCollpase.value;
};

// 绑定任务列表的组件
const upLoaderRef = ref();

// 添加文件时显示上传任务的列表,获取子组件传递过来的文件信息和fileData
const addFile = (data: fileData) => {
  const { file, filePid } = data;
  showCollpase.value = true;
  // 将文件信息，目录id传递给任务
  upLoaderRef.value.addFile(file, filePid);
};
// -----------------------------------------------------------------
// 删除所有历史记录
const clearHistory = () => {
  upLoaderRef.value.clearHistory();
};

// ----------------------------------------------------------
// 绑定route-view的ref
const routeViewRef = ref();

// 上传文件回调,上传完成后更新用户使用空间
const uploadCallbackHandler = () => {
  nextTick(() => {
    // 刷新页面
    routeViewRef.value.reload();
    // 刷新用户空间情况
    getUseSpace();
  });
};
// ---------------------------------------------------------
// 使用空间
const useSpaceInfo = ref({
  useSpace: 0,
  totalSpace: 100000000000,
});
const loadding = ref();
// 后端获取用户空间和使用空间
const getUseSpace = async () => {
  // console.log('刷新空间情况！')
  let result;
  try {
    nextTick(() => {
      loadding.value.showLoadding();
    });
    result = await request({
      method: "GET",
      url: api.getUserSpace,
    });
  } finally {
    nextTick(() => {
      loadding.value.closeLoadding();
    });
  }

  if (result.data.code !== 200) {
    return;
  }
  useSpaceInfo.value = result.data.data;
};
// 页面初始化的时候
getUseSpace();

const spaceUsagePercent = computed(() => {
  return (
    Math.floor(
      (useSpaceInfo.value.useSpace / useSpaceInfo.value.totalSpace) * 10000
    ) / 100
  );
});
</script>

<style scoped lang="scss">
:root {
  --primary-color: #06a7ff;
  --text-gray: #969696;
  --shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.06);
}

.framework {
  width: 100%;
}
.header {
  width: 100%;
  box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.06);
  height: 56px;
  padding-left: 24px;
  position: relative;
  z-index: 200;
  .logo {
    &:hover {
      cursor: pointer;
    }
  }
  .header-right {
    display: flex;
    align-items: center;
    padding-right: 20px;
    gap: 20px;
    .right-dropdown {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .right-dropdown:hover {
      cursor: pointer;
    }
    .right-img {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .collapse-all {
      position: relative;
      .collapse-body {
        right: -140px;
        top: 40px;
        position: absolute;
        width: 570px;
        .showCollpase {
          display: block !important;
        }
        .card-header {
          font-size: 14px;
          display: flex;
          align-items: center;
          .card-header-small-title {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.5);
          }
          .header-del {
            font-size: 12px;
          }
        }
        .card-header > span {
          display: inline-block;
        }
        .card-header > span:nth-child(3) {
          margin-left: auto;
          color: #969696;
        }
        .card-header > span:nth-child(3):hover {
          cursor: pointer;
          color: #06a7ff;
        }
        .card-body {
          min-height: 300px;
          padding: 0px;
          max-height: 500px;
          overflow-y: auto;
        }
        .card-body::-webkit-scrollbar {
          width: 4px;
        }
        .card-body::-webkit-scrollbar-thumb {
          background-color: #e6e5e5;
        }
        .not-data {
          width: 100%;
          text-align: center;
          margin: auto;
        }
      }
    }
    .dropdown-menu {
      min-width: auto;
      li :hover {
        background: #06a7ff;
        color: white;
      }
    }
  }
}
@media (max-width: 557px) {
  .right-name {
    display: none;
  }
  .collapse-all {
    position: static !important;
    .collapse-body {
      width: 100% !important;
      top: 60px !important;
      right: 0 !important;
    }
  }
}
.body {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 5px 0;
  height: calc(100vh - 56px);
  display: flex;
  .left-side {
    display: flex;
    z-index: 2;
    height: 100%;
    gap: 5px;
    .menu-list {
      padding: 10px 0;
      display: flex;
      flex-direction: column;
      background-color: white;
      align-items: center;
      width: 70px;
      gap: 10px;
      .menu-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 5px;
      }
      .menu-item:hover {
        cursor: pointer;
      }
      .iconfont {
        font-size: 20px;
      }
      .text {
        font-size: 13px;
      }
    }
    .menu-sub-list {
      background-color: white;
      width: 160px;
      padding: 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      .item-item-sub {
        width: 100%;
        padding: 6px;
        height: 36px;
        display: flex;
        justify-content: center;
        gap: 10px;
        font-size: 12px;
        align-items: center;
      }
      .item-item-sub:hover {
        cursor: pointer;
      }
    }
    .space-info {
      margin-top: auto;
      width: 100%;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      .space-title {
        padding-left: 2px;
      }
      .percent {
        /* width: 100%; */
        display: flex;
        align-items: center;
      }
      .space-refresh {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 2px;
        font-size: 10px;
        .iconfont {
          font-size: 15px;
          color: #06a7ff;
        }
        .iconfont:hover {
          cursor: pointer;
        }
      }
    }
    .iconfont {
      color: #969696;
    }
    .text {
      color: #969696;
    }
    .active {
      .iconfont {
        color: #06a7ff;
      }
      .text {
        color: #06a7ff;
      }
    }
    .item-sub-active {
      background-color: #d4ecf9;
    }
    .close-menu-list {
      display: none;
      position: relative;
      width: 30px;
      text-align: center;
      align-items: center;
      justify-content: center;
      border-left: 2px solid rgb(226, 224, 224);
      input {
        position: absolute;
        opacity: 0;
      }
      input:hover {
        cursor: pointer;
      }
    }
  }
  .body-content {
    width: 100%;
    margin-left: 5px;
    border-radius: 5px;
    height: 100%;
    background-color: white;
  }
  .open-menu {
    position: absolute;
    display: none;
    top: calc(100vh - 56px - 50%);
    border: 1px solid rgb(214, 213, 213);
    border-radius: 100%;
    .open-menu-item {
      position: relative;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      input {
        position: absolute;
        opacity: 0;
        width: 100%;
        height: 100%;
        padding: 4px;
      }
      input:hover {
        cursor: pointer;
      }
    }
  }
}

@media (max-width: 930px) {
  .body {
    position: relative;
    .open-menu {
      display: flex;
    }
    .left-side {
      position: absolute;
      top: 0;
      display: none;
      box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.06);
      height: 99%;
      background-color: white;
      .close-menu-list {
        display: flex;
      }
      .menu-list {
        box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.06);
      }
    }
    .showSide {
      display: flex !important;
    }
  }
}

.header-right {
  .right-name {
    color: var(--primary-color);
  }
}

.active {
  .iconfont,
  .text {
    color: var(--primary-color);
  }
}
</style>
