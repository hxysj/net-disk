<template>
  <div class="not-found">
    <img src="@/assets/icon-image/404.svg" class="not-found-img" alt="" />
    <div class="not-found-text">
      你访问的页面不存在！返回 <a href="/">首页</a> 体验其他功能吧！
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: rgba(212, 236, 249, 0.5);
  .not-found-img {
    width: 500px;
  }
  .not-found-text {
    font-size: 20px;
    margin: 10px;
  }
}
</style>
