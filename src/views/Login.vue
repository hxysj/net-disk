<template>
  <div class="login">
    <div class="container">
      <div class="row">
        <div class="col-7 left">
          <img src="/public/login-img.png" class="img-fluid" alt="" />
        </div>
        <div class="right">
          <form
            ref="submitForm"
            class="needs-validated"
            @submit.prevent="onSumbit"
          >
            <div class="form-group login-title">
              <h4>个人网盘</h4>
            </div>
            <template v-if="opType !== 2">
              <div class="form-group">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text" id="addon-wrapping">
                      <i class="iconfont icon-account"></i>
                      <!-- icon-checkcode -->
                    </span>
                  </div>
                  <input
                    ref="usernameIpt"
                    type="text"
                    placeholder="请输入账号"
                    class="form-control"
                    v-model.trim="userForm.userName"
                    :class="{ 'is-invalid': errors.name }"
                  />
                  <div class="invalid-feedback">
                    {{ errors.name || "错误信息" }}
                  </div>
                </div>
              </div>
              <div class="form-group" v-show="opType === 1">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text" id="addon-wrapping">
                      <i class="iconfont icon-account"></i>
                    </span>
                  </div>
                  <input
                    ref="emailIpt"
                    type="text"
                    placeholder="请输入邮箱账号"
                    class="form-control"
                    v-model.trim="userForm.email"
                    :class="{ 'is-invalid': errors.email }"
                  />
                  <div class="invalid-feedback">
                    {{ errors.email || "错误信息" }}
                  </div>
                </div>
              </div>
              <div class="form-group" v-show="opType === 1">
                <div class="input-group">
                  <input
                    ref="emailCodeIpt"
                    type="text"
                    placeholder="请输入邮箱验证码"
                    class="form-control"
                    v-model.trim="emailCode"
                    :class="{ 'is-invalid': errors.emailCode }"
                  />
                  <div class="input-group-prepend">
                    <span
                      class="btn btn-primary"
                      :class="[is_disable_email_code ? 'disabled' : '']"
                      id="addon-wrapping"
                      @click="get_email_code"
                    >
                      {{ email_code_btn }}
                    </span>
                  </div>
                  <div class="invalid-feedback">
                    {{ errors.emailCode || "错误信息" }}
                  </div>
                </div>
              </div>
              <div class="form-group">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text" id="addon-wrapping">
                      <i class="iconfont icon-checkcode"></i>
                    </span>
                  </div>
                  <input
                    ref="passwordIpt"
                    type="password"
                    placeholder="请输入密码"
                    class="form-control"
                    v-model.trim="userForm.password"
                    :class="{ 'is-invalid': errors.password }"
                  />
                  <div class="invalid-feedback">
                    {{ errors.password || "错误信息" }}
                  </div>
                </div>
              </div>
              <div class="form-group" v-show="opType === 1">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text" id="addon-wrapping">
                      <i class="iconfont icon-checkcode"></i>
                    </span>
                  </div>
                  <input
                    ref="passwordIpt2"
                    type="password"
                    placeholder="请再次输入密码"
                    class="form-control"
                    v-model.trim="userForm.password2"
                    :class="{ 'is-invalid': errors.password2 }"
                  />
                  <div class="invalid-feedback">
                    {{ errors.password2 || "错误信息" }}
                  </div>
                </div>
              </div>
              <div class="form-group">
                <div class="input-group">
                  <input
                    ref="codeIpt"
                    type="text"
                    placeholder="请输入验证码"
                    class="form-control"
                    v-model.trim="code"
                    :class="{ 'is-invalid': errors.code }"
                  />
                  <div class="input-group-prepend">
                    <div
                      class="input-group-text code-text"
                      id="addon-wrapping"
                      @click="refresh_code"
                    >
                      <img
                        :src="`data:image/png;base64,${identifyImage}`"
                        alt=""
                      />
                    </div>
                  </div>
                  <div class="invalid-feedback">
                    {{ errors.code || "错误信息" }}
                  </div>
                </div>
              </div>
              <div class="form-group" v-show="opType === 0">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="gridCheck"
                    v-model="rememberMe"
                  />
                  <label class="form-check-label" for="gridCheck">
                    记住我
                  </label>
                </div>
              </div>
              <div class="form-group" v-if="opType === 0">
                <div class="form-other">
                  <a href="#" class="btn-primary" @click="changeStatus(2)"
                    >忘记密码？</a
                  >
                  <a href="#" class="btn-primary" @click="changeStatus(1)"
                    >未有账号？</a
                  >
                </div>
              </div>
              <div class="form-group" v-else-if="opType === 1">
                <div class="form-other">
                  <a href="#" class="btn-primary" @click="changeStatus(0)"
                    >已有账号？</a
                  >
                </div>
              </div>
              <div class="form-group">
                <button
                  type="submit"
                  class="btn btn-primary login-btn"
                  v-if="opType === 0"
                >
                  登陆
                </button>
                <button
                  type="submit"
                  class="btn btn-primary login-btn"
                  v-else-if="opType === 1"
                >
                  注册
                </button>
              </div>
            </template>
            <template v-else>
              <!-- 找回密码 -->
              <div class="form-group">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text" id="addon-wrapping">
                      <i class="iconfont icon-account"></i>
                    </span>
                  </div>
                  <input
                    ref="emailIpt"
                    type="text"
                    placeholder="请输入邮箱账号"
                    class="form-control"
                    v-model.trim="userForm.email"
                    :class="{ 'is-invalid': errors.email }"
                  />
                  <div class="invalid-feedback">
                    {{ errors.email || "错误信息" }}
                  </div>
                </div>
              </div>
              <div class="form-group">
                <div class="input-group">
                  <input
                    ref="emailCodeIpt"
                    type="text"
                    placeholder="请输入邮箱验证码"
                    class="form-control"
                    v-model.trim="emailCode"
                    :class="{ 'is-invalid': errors.emailCode }"
                  />
                  <div class="input-group-prepend">
                    <span
                      class="btn btn-primary"
                      :class="[is_disable_email_code ? 'disabled' : '']"
                      id="addon-wrapping"
                      @click="get_email_code"
                    >
                      {{ email_code_btn }}
                    </span>
                  </div>
                  <div class="invalid-feedback">
                    {{ errors.emailCode || "错误信息" }}
                  </div>
                </div>
              </div>
              <div class="form-group">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text" id="addon-wrapping">
                      <i class="iconfont icon-checkcode"></i>
                    </span>
                  </div>
                  <input
                    ref="passwordIpt"
                    type="password"
                    placeholder="请输入新密码"
                    class="form-control"
                    v-model.trim="userForm.password"
                    :class="{ 'is-invalid': errors.password }"
                  />
                  <div class="invalid-feedback">
                    {{ errors.password || "错误信息" }}
                  </div>
                </div>
              </div>
              <div class="form-group">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text" id="addon-wrapping">
                      <i class="iconfont icon-checkcode"></i>
                    </span>
                  </div>
                  <input
                    ref="passwordIpt2"
                    type="password"
                    placeholder="请再次输入密码"
                    class="form-control"
                    v-model.trim="userForm.password2"
                    :class="{ 'is-invalid': errors.password2 }"
                  />
                  <div class="invalid-feedback">
                    {{ errors.password2 || "错误信息" }}
                  </div>
                </div>
              </div>
              <div class="form-group">
                <div class="input-group">
                  <input
                    ref="codeIpt"
                    type="text"
                    placeholder="请输入验证码"
                    class="form-control"
                    v-model.trim="code"
                    :class="{ 'is-invalid': errors.code }"
                  />
                  <div class="input-group-prepend">
                    <div
                      class="input-group-text code-text"
                      id="addon-wrapping"
                      @click="refresh_code"
                    >
                      <img
                        :src="`data:image/png;base64,${identifyImage}`"
                        alt=""
                      />
                    </div>
                  </div>
                  <div class="invalid-feedback">
                    {{ errors.code || "错误信息" }}
                  </div>
                </div>
              </div>
              <div class="form-group">
                <button type="submit" class="btn btn-primary login-btn">
                  确定修改
                </button>
              </div>
            </template>
          </form>
        </div>
      </div>
      <div
        ref="toastContainer"
        class="toast-container position-fixed top-0 end-0 p-3"
      ></div>
    </div>
    <MessageToast ref="messageToast"></MessageToast>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import MessageToast from "@/components/message/MessageToast.vue";
import { useRouter } from "vue-router";
import * as bootstrap from "bootstrap";
import request from "@/utils/request";

// 请求需要的api接口
const api = {
  register: "/register",
  login: "/login",
  sendEmailCode: "/sendEmailCode",
  RetrievePwd: "/RetrievePassword",
  getVerificationCode: "/getVerificationCode",
  checkVerificationCode: "/checkVerificationCode",
};

const router = useRouter();
// 保存用户输入的信息
interface myForm {
  userName?: string;
  password?: string;
  password2?: string;
  email?: string;
}
const userForm = ref<myForm>({});
// 绑定表单
const submitForm = ref();

// ----------------------------------------------------------------
// 账号规则  密码规则
let regName = /^[a-zA-Z0-9]{3,9}$/;
let regPassword = /^[a-zA-Z0-9|!|?|.|@|%|]{6,9}$/;
let regEmail = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9]{2,6}$/;
const usernameIpt = ref();
const passwordIpt = ref();
const passwordIpt2 = ref();
const codeIpt = ref();
const emailIpt = ref();
const emailCodeIpt = ref();
// 给节点添加 失焦 事件
const regRun = () => {
  // 失焦调用方法 1.用户名
  usernameIpt.value.onblur = () => {
    validateFrom("name");
  };
  // 2.密码
  passwordIpt.value.onblur = () => {
    validateFrom("pwd");
  };
  // 3.再次输入密码
  passwordIpt2.value.onblur = () => {
    validateFrom("pwd2");
  };
  // 验证码
  codeIpt.value.onblur = () => {
    validateFrom("code");
  };
  // 邮箱
  emailIpt.value.onblur = () => {
    validateFrom("email");
  };
  // 邮箱验证码
  emailCodeIpt.value.onblur = () => {
    validateFrom("emailCode");
  };
};

onMounted(() => {
  // 挂载完成后，绑定上事件
  regRun();
  // 挂载完成后刷新验证码
  refresh_code();
});
// -----------------------------------------------------
const email_code_btn = ref("获取验证码");
const is_disable_email_code = ref(false);
const get_email_code = async () => {
  validateFrom("email");
  if (errors.value.email) {
    return;
  }
  let result;
  try {
    result = await request({
      url: api.sendEmailCode,
      method: "POST",
      data: {
        email: userForm.value.email,
      },
    });
  } catch (error) {
    messageToast.value.showToast({
      type: "error",
      message: "发送失败，请检查邮箱是否正确!",
    });
    return;
  }
  if (!result) {
    return;
  }
  messageToast.value.showToast({
    type: "success",
    message: "发送成功，请注意查收！",
  });
  let wait_time = 60;
  let getCode = setInterval(() => {
    if (wait_time == 0) {
      // console.log(11111)
      email_code_btn.value = `重新获取`;
      is_disable_email_code.value = false;
      clearInterval(getCode);
      return;
    }
    email_code_btn.value = `重新获取(${wait_time}s)`;
    wait_time -= 1;
    is_disable_email_code.value = true;
  }, 1000);
};
// ------------------------------------------------
// 验证码模块
const identifyImage = ref("");
const identifyId = ref("");
const refresh_code = async () => {
  let result;
  try {
    result = await request.get(api.getVerificationCode);
  } catch (error) {
    messageToast.value.showToast({
      type: "error",
      message: "获取验证码失败，请检测网络情况！",
    });
    return;
  }
  console.log(result);
  identifyId.value = result.data.captcha_id;
  identifyImage.value = result.data.captcha_image;
};
// ---------------------------------------------------
// 绑定表单中的验证码
const code = ref("");
// 绑定表单中的邮箱验证码
const emailCode = ref("");
// 登录时是否记住用户
const rememberMe = ref(false);
// ----------------------------------------------------
// 操作类型 0：登陆，1：注册，2：重置密码
let opType = ref(0);
// 更改登陆，注册状态
const changeStatus: (type: number) => void = (type) => {
  opType.value = type;
  // 将表数据清空
  userForm.value = {};
  // 重新刷新验证码
  code.value = "";
  refresh_code();
};
// ---------------------------------------------------
// 表单错误信息
interface myError {
  name?: string;
  password?: string;
  password2?: string;
  code?: string;
  email?: string;
  emailCode?: string;
}
const errors = ref<myError>({});
// 表单验证
const validateFrom: (type: string) => boolean = (type) => {
  if (type === "all") {
    errors.value = {};
  }
  // errors.value = {}
  if ((type === "name" || type === "all") && opType.value != 2) {
    if (!userForm.value.userName) {
      errors.value.name = "账号不能为空！";
    } else if (!regName.test(userForm.value.userName)) {
      errors.value.name = "用户名由3-9位字母、数字组成！";
    } else {
      delete errors.value.name;
    }
  }
  if (type === "pwd" || type === "all") {
    if (!userForm.value.password) {
      errors.value.password = "密码不能为空！";
    } else if (!regPassword.test(userForm.value.password)) {
      errors.value.password = "密码的长度为6-9位！";
    } else {
      delete errors.value.password;
    }
  }
  if (
    (type === "pwd2" || type === "all") &&
    (opType.value === 1 || opType.value === 2)
  ) {
    if (userForm.value.password !== userForm.value.password2) {
      errors.value.password2 = "两次输入的密码不一致！";
    } else {
      delete errors.value.password2;
    }
  }
  if (type === "code" || type === "all") {
    // console.log(code.value,identifyCode.value)
    if (!code.value) {
      errors.value.code = "验证码不能为空！";
    } else {
      delete errors.value.code;
    }
  }
  if (
    (type === "email" || type === "all") &&
    (opType.value === 1 || opType.value === 2)
  ) {
    if (!userForm.value.email) {
      errors.value.email = "邮箱不能为空！";
    } else if (!regEmail.test(userForm.value.email)) {
      errors.value.email = "请输入正确的邮箱！";
    } else {
      delete errors.value.email;
    }
  }
  if (
    (type === "emailCode" || type === "all") &&
    (opType.value === 1 || opType.value === 2)
  ) {
    if (!emailCode.value) {
      errors.value.emailCode = "验证码不能为空！";
    } else {
      delete errors.value.emailCode;
    }
  }
  // console.log(Object.values(errors.value))
  return Object.values(errors.value).length === 0;
};
// --------------------------------------------------------------
const messageToast = ref();
// 消息弹窗
const toastContainer = ref();
// type: true 成功   false失败
const showToast: (type: boolean, message: string) => void = (type, message) => {
  const toastEl = document.createElement("div");
  toastEl.className = "toast";
  toastEl.role = "alert";
  toastEl.ariaLive = "assertive";
  toastEl.ariaAtomic = "true";
  if (type) {
    toastEl.classList.add("bg-primary");
  } else {
    toastEl.classList.add("bg-danger");
  }
  toastEl.classList.add("text-white");
  // Create Toast content
  toastEl.innerHTML = `
            <div class="toast-body">
            ${message}
            </div>
        `;
  toastContainer.value.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl);
  toast.show();

  // Automatically hide the Toast after 3 seconds
  setTimeout(() => {
    toast.hide();
    // Remove the Toast element from the DOM
    toastEl.remove();
  }, 3000);
};
// --------------------------------------------------------------
// 点击进行登陆 / 注册
async function onSumbit() {
  if (!validateFrom("all")) {
    return;
  }

  // 验证码校验
  try {
    await request({
      url: api.checkVerificationCode,
      method: "POST",
      data: {
        captcha_id: identifyId.value,
        captcha_code: code.value,
      },
    });
  } catch (error) {
    showToast(false, "验证码错误！");
    return;
  }

  if (opType.value === 1) {
    let params = {
      email: userForm.value.email,
      userName: userForm.value.userName,
      password: userForm.value.password,
      code: emailCode.value,
    };
    let result;
    try {
      result = await request({
        url: api.register,
        method: "POST",
        data: params,
      });
    } catch (error: any) {
      messageToast.value.showToast({
        type: "error",
        message: error.response.data.error,
      });
    }
    if (!result) {
      return;
    }
    showToast(true, "注册成功，请登陆！");
    changeStatus(0);
  } else if (opType.value === 0) {
    let params: {
      userName: string;
      password: string;
      remember?: boolean;
    } = {
      userName: userForm.value.userName as string,
      password: userForm.value.password as string,
    };
    if (rememberMe.value) {
      params.remember = true;
    }
    let response = await request({
      url: api.login,
      method: "GET",
      params: userForm.value,
    });
    if (response.data.code === 200) {
      showToast(true, "登陆成功！");
      // console.log(response.data.data)
      localStorage.setItem("token", response.data.data.token);
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } else {
      showToast(false, "登陆失败，用户或密码错误！");
    }
  } else if (opType.value === 2) {
    let params = {
      email: userForm.value.email,
      code: emailCode.value,
      password: userForm.value.password,
    };
    let result;
    // console.log(111111)
    try {
      result = await request({
        method: "POST",
        url: api.RetrievePwd,
        data: params,
      });
    } catch (error) {
      messageToast.value.showToast({
        type: "error",
        message: "修改失败，请再次进行尝试！",
      });
    }
    if (!result) {
      return;
    }
    messageToast.value.showToast({
      type: "success",
      message: "修改成功！",
    });
    changeStatus(0);
  }
}
</script>

<style lang="scss" scoped>
.login {
  background-image: url("/public/login-bg.png");
  height: 100vh;
  display: flex;
  margin: auto;
  align-items: center;
}
.left {
  img {
    width: 750px;
    height: 650px;
  }
}
.right {
  display: flex;
  margin: auto;
  background-color: white;
  width: 350px;
  min-height: 350px;
  form {
    width: 100%;
    height: 100%;
    padding: 10px;
    .login-title {
      font-style: italic;
      color: rgba(80, 138, 255);
      font-weight: bolder;
    }
    .form-group {
      margin: 20px 10px;
    }
    .login-btn {
      width: 100%;
    }
    .form-other {
      display: flex;
      justify-content: space-between;
      a {
        display: inline-block;
        text-decoration: none;
      }
    }
    .code-text {
      padding: 0;
      height: 100%;
      img {
        width: 100px;
        height: 100%;
      }
    }
  }
}
@media (max-width: 990px) {
  .left {
    display: none;
  }
}
@media (max-width: 540px) {
  .right {
    width: 100%;
    height: 100vh;
    opacity: 0.9;
  }
}
</style>
