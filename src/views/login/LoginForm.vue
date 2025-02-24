<template>
  <form ref="submitForm" class="needs-validated" @submit.prevent="onSubmit">
    <div class="form-group login-title">
      <h4>个人网盘</h4>
    </div>
    <template v-for="item in formColumn" :key="item.key">
      <template
        v-if="item.showType === -1 || (item.showType as number[]).includes(opType)"
      >
        <LoginInput
          v-model:errors="errors"
          v-model:inputValue="userForm[item.key as keyof typeof userForm]"
          :item="item"
          :email="userForm.email"
          :identifyImage="identifyImage"
          @validateValue="validateFrom"
          @refreshCode="refresh_code"
          @message="touchMessage"
        ></LoginInput>
      </template>
    </template>

    <div class="form-group" v-show="opType === 0">
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          id="gridCheck"
          v-model="rememberMe"
        />
        <label class="form-check-label" for="gridCheck"> 记住我 </label>
      </div>
    </div>
    <div class="form-group" v-if="opType === 0">
      <div class="form-other">
        <a href="#" @click="changeStatus(2)">忘记密码？</a>
        <a href="#" @click="changeStatus(1)">未有账号？</a>
      </div>
    </div>
    <div class="form-group" v-else-if="opType === 1">
      <div class="form-other">
        <a href="#" class="btn-primary" @click="changeStatus(0)">已有账号？</a>
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
      <button v-else type="submit" class="btn btn-primary login-btn">
        确定修改
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import request from "@/utils/request";
import LoginInput from "./LoginInput.vue";
import { MyError, MyForm } from "./types";
import { debounce } from "@/utils/utils";

const emits = defineEmits(["message"]);
const formColumn = [
  {
    label: "账号",
    key: "userName",
    showType: [0, 1],
    placeholder: "请输入账号",
    icon: "icon-account",
    errorKey: "name",
  },
  {
    label: "密码",
    key: "password",
    showType: -1,
    placeholder: "请输入密码",
    icon: "icon-checkcode",
    errorKey: "pwd",
  },
  {
    label: "确认密码",
    key: "password2",
    showType: [1, 2],
    placeholder: "请再次输入密码",
    icon: "icon-checkcode",
    errorKey: "pwd2",
  },
  {
    label: "邮箱",
    key: "email",
    showType: [1, 2],
    placeholder: "请输入邮箱",
    icon: "icon-account",
    errorKey: "email",
  },
  {
    label: "邮箱验证码",
    key: "emailCode",
    showType: [1, 2],
    placeholder: "请输入邮箱验证码",
    errorKey: "emailCode",
  },
  {
    label: "验证码",
    key: "code",
    showType: -1,
    placeholder: "请输入验证码",
    errorKey: "code",
  },
];

// 请求需要的api接口
const api = {
  register: "/register",
  login: "/login",
  RetrievePwd: "/RetrievePassword",
  getVerificationCode: "/getVerificationCode",
  checkVerificationCode: "/checkVerificationCode",
};

const router = useRouter();

const userForm = ref<MyForm>({});

// 账号规则  密码规则
let regName = /^[a-zA-Z0-9]{3,9}$/;
let regPassword = /^[a-zA-Z0-9!@#$%^&*]{6,9}$/;
let regEmail = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9]{2,6}$/;

// // 验证码模块
const identifyImage = ref("");
const identifyId = ref("");

// 登录时是否记住用户
const rememberMe = ref(false);
// ----------------------------------------------------
// 操作类型 0：登陆，1：注册，2：重置密码
let opType = ref(0);
// 更改登陆，注册状态
const changeStatus: (type: number) => void = (type) => {
  opType.value = type;
  errors.value = {};
  // 将表数据清空
  userForm.value = {};
  refresh_code();
};

const errors = ref<MyError>({});
const refresh_code = debounce(async () => {
  let result;
  try {
    result = await request.get(api.getVerificationCode);
  } catch (error) {
    emits("message", {
      type: "error",
      message: "获取验证码失败，请检测网络情况！",
    });
    return;
  }
  identifyId.value = result.data.captcha_id;
  identifyImage.value = result.data.captcha_image;
});

const touchMessage = (obj: { type: string; message: string }) => {
  emits("message", obj);
};
// 表单验证
const validateFrom: (type: string) => boolean = (type) => {
  if (type === "all") {
    errors.value = {};
  }

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
      errors.value.pwd = "密码不能为空！";
    } else if (
      userForm.value.password.length < 6 ||
      userForm.value.password.length > 9
    ) {
      errors.value.pwd = "密码的长度为6-9位";
    } else if (!regPassword.test(userForm.value.password)) {
      errors.value.pwd = "密码应该由字母、数字、!@#$%^&*组成！";
    } else {
      delete errors.value.pwd;
    }
  }
  if (
    (type === "pwd2" || type === "all") &&
    (opType.value === 1 || opType.value === 2)
  ) {
    if (userForm.value.password !== userForm.value.password2) {
      errors.value.pwd2 = "两次输入的密码不一致！";
    } else {
      delete errors.value.pwd2;
    }
  }
  if (type === "code" || type === "all") {
    if (!userForm.value.code) {
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
    if (!userForm.value.emailCode) {
      errors.value.emailCode = "验证码不能为空！";
    } else {
      delete errors.value.emailCode;
    }
  }
  return Object.values(errors.value).length === 0;
};

// 点击进行登陆 / 注册
const onSubmit = debounce(async () => {
  if (!validateFrom("all")) {
    return;
  }

  // 验证码校验
  const validateCaptcha = async () => {
    try {
      await request({
        url: api.checkVerificationCode,
        method: "POST",
        data: {
          captcha_id: identifyId.value,
          captcha_code: userForm.value.code,
        },
      });
    } catch (error) {
      console.error(error);
      emits("message", {
        type: "error",
        message: "验证码错误！",
      });
      return false;
    }
    return true;
  };

  if (!(await validateCaptcha())) {
    return;
  }

  const handleRequest = async (url: string, method: string, data: object) => {
    try {
      const result = await request({ url, method, data });
      return result;
    } catch (error: any) {
      emits("message", {
        type: "error",
        message: error.response?.data?.error || "请求失败",
      });
      return null;
    }
  };

  // 注册
  if (opType.value === 1) {
    const result = await handleRequest(api.register, "POST", {
      email: userForm.value.email,
      userName: userForm.value.userName,
      password: userForm.value.password,
      code: userForm.value.emailCode,
    });
    if (!result) return;
    emits("message", { type: "success", message: "注册成功，请登陆！" });
    changeStatus(0);
  }

  // 登陆
  else if (opType.value === 0) {
    const params: { userName: string; password: string; remember?: boolean } = {
      userName: userForm.value.userName as string,
      password: userForm.value.password as string,
    };
    if (rememberMe.value) params.remember = true;

    const response = await request({
      url: api.login,
      method: "GET",
      params,
    });

    if (response.data.code === 200) {
      emits("message", { type: "success", message: "登陆成功！" });
      localStorage.setItem("token", response.data.data.token);
      setTimeout(() => router.push("/"), 1000);
    } else {
      emits("message", {
        type: "error",
        message: "登陆失败，用户或密码错误！",
      });
    }
  }

  // 找回密码
  else if (opType.value === 2) {
    const result = await handleRequest(api.RetrievePwd, "POST", {
      email: userForm.value.email,
      code: userForm.value.emailCode,
      password: userForm.value.password,
    });
    if (!result) return;
    emits("message", { type: "success", message: "修改成功！" });
    changeStatus(0);
  }
});

onMounted(() => {
  // 挂载完成后刷新验证码
  refresh_code();
});
</script>

<style scoped lang="scss">
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
}
</style>
