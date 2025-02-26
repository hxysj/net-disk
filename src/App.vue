<script setup lang="ts">
import axios from "axios";
import { useCookies } from "vue3-cookies";
import { reactive } from "vue";
import {
  onMounted,
  getCurrentInstance,
  ref,
  onUnmounted,
  watch,
  provide,
} from "vue";
import { BREAK_POINTS } from "./utils/data";

const { cookies } = useCookies();
const currentInstance = getCurrentInstance();
//获得服务器的请求基本地址
const server_base_url =
  currentInstance?.appContext.app.config.globalProperties.$baseurl;
const windowHeight = ref(document.documentElement.clientHeight);
const page_show_count_obj = reactive({
  file: 13,
  user: 9,
});

provide("page_show_count_obj", page_show_count_obj);
// // 获取 CSRF 令牌的函数
async function getCsrfToken() {
  try {
    const response = await axios.get(server_base_url + "api/csrf");
    // console.log('CSRF token:', response.data.csrfToken);
    cookies.set("csrftoken", response.data.csrfToken);
    return response.data.csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error;
  }
}

// 监听窗口大小变化
const updateHeight = () => {
  windowHeight.value = document.documentElement.clientHeight;
};

// 在组件挂载时添加事件监听
onMounted(() => {
  window.addEventListener("resize", updateHeight);
});

// 在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener("resize", updateHeight);
});

watch(
  () => windowHeight.value,
  (val) => {
    const config = BREAK_POINTS.find((breakpoint) => val <= breakpoint.max);
    page_show_count_obj.file = config!.file;
    page_show_count_obj.user = config!.user;
  },
  {
    immediate: true,
  }
);

onMounted(async () => {
  await getCsrfToken();
});
</script>

<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<style scoped lang="scss"></style>
