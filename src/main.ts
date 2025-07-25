import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "@/assets/icon/iconfont.css";
import VueCookie from "vue3-cookies";
import router from "./router";

// 导入代码高亮
import HljsVuePlugin from "@highlightjs/vue-plugin";
import "highlight.js/styles/atom-one-light.css";
import "highlight.js/lib/common";

const app = createApp(App);

// 使用环境变量设置请求的基本连接
app.config.globalProperties.$baseurl = import.meta.env.VITE_APP_BASEURL;
app.config.globalProperties.websocketUrl =
  import.meta.env.VITE_APP_WEBSOCKET_URL;

app.config.globalProperties.$encryptionKey = "secret-key123456";
app.config.globalProperties.$iv = "1234567890123456";

app.use(router);
app.use(HljsVuePlugin);
app.use(VueCookie);
app.mount("#app");
