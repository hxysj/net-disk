<template>
  <div class="login">
    <div class="container">
      <div class="row">
        <div class="col-7 left">
          <img src="/public/login-img.png" class="img-fluid" alt="" />
        </div>
        <div class="right">
          <LoginForm @message="showToast"></LoginForm>
        </div>
      </div>
    </div>
    <MessageToast ref="messageToast"></MessageToast>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MessageToast from "@/components/message/MessageToast.vue";
import LoginForm from "./LoginForm.vue";

const messageToast = ref();

const showToast = (obj: { type: string; message: string }) => {
  messageToast.value.showToast(obj);
};
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
