<template>
  <div class="form-group">
    <div class="input-group">
      <div class="input-group-prepend" v-if="item.icon">
        <span class="input-group-text" id="addon-wrapping">
          <i :class="'iconfont ' + item.icon"></i>
        </span>
      </div>
      <input
        ref="inputRef"
        :type="item.key.includes('password') ? 'password' : 'text'"
        :placeholder="item.placeholder"
        class="form-control"
        v-model.trim="inputValue"
        :class="{ 'is-invalid': errors[item.errorKey as keyof typeof errors] }"
      />
      <div class="input-group-prepend" v-if="item.key === 'code'">
        <div
          class="input-group-text code-text"
          id="addon-wrapping"
          @click="() => emits('refreshCode')"
        >
          <img :src="`data:image/png;base64,${identifyImage}`" alt="" />
        </div>
      </div>
      <div class="input-group-prepend" v-if="item.key === 'emailCode'">
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
        {{ errors[item.errorKey as keyof typeof errors] || "错误信息" }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import request from "@/utils/request";
const props = defineProps({
  item: {
    type: Object,
    default: () => {
      return {
        key: "",
        placeholder: "",
        icon: "",
        errorKey: "",
      };
    },
  },
  identifyImage: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
});

const emits = defineEmits(["message", "validateValue", "refreshCode"]);
const inputRef = ref();
const errors: any = defineModel("errors");
const inputValue = defineModel("inputValue");
const email_code_btn = ref("获取验证码");
const is_disable_email_code = ref(false);
const api = {
  sendEmailCode: "/sendEmailCode",
};

const get_email_code = async () => {
  emits("validateValue", "email");
  if (errors.value.email) {
    return;
  }
  let result;
  try {
    result = await request({
      url: api.sendEmailCode,
      method: "POST",
      data: {
        email: props.email,
      },
    });
  } catch (error) {
    emits("message", {
      type: "error",
      message: "发送失败，请检查邮箱是否正确!",
    });
    return;
  }
  if (!result) {
    return;
  }
  emits("message", { type: "success", message: "发送成功，请注意查收！" });
  let wait_time = 60;
  let getCode = setInterval(() => {
    if (wait_time == 0) {
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

onMounted(() => {
  inputRef.value.onblur = () => {
    emits("validateValue", props.item.errorKey);
  };
});
</script>

<style scoped lang="scss">
.code-text {
  padding: 0;
  height: 100%;
  img {
    width: 100px;
    height: 100%;
  }
}
</style>
