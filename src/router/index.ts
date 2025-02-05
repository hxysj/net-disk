import { createRouter, createWebHistory } from "vue-router";
import { parseToken } from "@/utils/utils";

const routes = [
  {
    path: "/login",
    component: () => import("@/views/Login.vue"),
  },
  {
    path: "/",
    component: () => import("@/views/Framework.vue"),
    children: [
      {
        path: "/",
        redirect: "/main/all",
      },
      {
        path: "/main/:category",
        name: "首页",
        meta: {
          needLogin: true,
          menuCode: "main",
        },
        component: () => import("@/views/main/Main.vue"),
      },
      {
        path: "/myshare",
        name: "我的分享",
        meta: {
          needLogin: true,
          menuCode: "share",
        },
        component: () => import("@/views/share/share.vue"),
      },
      {
        path: "/recycle",
        name: "回收站",
        meta: {
          needLogin: true,
          menuCode: "recycle",
        },
        component: () => import("@/views/recycle/Recycle.vue"),
      },
      {
        path: "/settings/sysSetting",
        name: "系统设置",
        meta: {
          needLogin: true,
          menuCode: "settings",
        },
        component: () => import("@/views/admin/SysSettings.vue"),
      },
      {
        path: "/settings/userList",
        name: "用户管理",
        meta: {
          needLogin: true,
          menuCode: "settings",
        },
        component: () => import("@/views/admin/UserList.vue"),
      },
      {
        path: "/settings/fileList",
        name: "用户文件",
        meta: {
          needLogin: true,
          menuCode: "settings",
        },
        component: () => import("@/views/admin/Filelist.vue"),
      },
      {
        path: "/message",
        name: "消息",
        meta: {
          needLogin: true,
          menuCode: "communication",
        },
        children: [
          {
            path: "session",
            name: "会话",
            meta: {
              needLogin: true,
              menuCode: "communication",
            },
            component: () => import("@/views/communication/Session.vue"),
          },
          {
            path: "friend",
            name: "好友",
            meta: {
              needLogin: true,
              menuCode: "communication",
            },
            component: () => import("@/views/communication/Friends.vue"),
          },
        ],
      },
    ],
  },
  {
    path: "/shareCheck/:shareId",
    name: "分享校验",
    component: () => import("@/views/webshare/ShareCheck.vue"),
  },
  {
    path: "/share/:shareId",
    name: "分享",
    component: () => import("@/views/webshare/Share.vue"),
  },
  {
    path: "/:pathMatch(.*)",
    name: "页面不存在",
    component: () => import("@/views/notFound/404.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _form, next) => {
  // console.log(to.path)
  const token = localStorage.getItem("token");

  if (to.meta.needLogin && (!token || token == undefined)) {
    next("/login");
  }
  const userInfo = parseToken(token as string);
  // console.log(to.path)
  // console.log(userInfo)
  // 如果不是管理则不让访问设置页面，跳转到404页面
  if (to.path.includes("/settings/")) {
    if (userInfo.identity) {
      next();
    } else {
      next("/notFound");
    }
  }
  next();
});

export default router;
