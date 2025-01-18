<template>
  <div class="communication-side">
    <div class="header">
      <div class="add-friend" @click="addFriend">添加好友</div>
    </div>
    <div class="list">
      <slot></slot>
    </div>
    <div>
      <FriendDialog v-model:visible="dialogVisible" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FriendDialog from "./cnp/FriendDialog.vue";

const dialogVisible = ref(false);
const addFriend = () => {
  dialogVisible.value = true;
};
</script>

<style lang="scss" scoped>
.communication-side {
  width: 300px;
  height: 100%;
  border-right: 1px solid rgba(233, 233, 233);
  .header {
    padding: 10px;
  }
  .add-friend {
    padding: 5px;
    color: rgb(46, 175, 255);
    font-size: 14px;
    &:hover {
      cursor: pointer;
    }
  }
  .list {
    height: 92%;
    overflow-y: auto;
  }
  .list::-webkit-scrollbar {
    width: 0px;
    height: 4px;
  }
}
</style>
