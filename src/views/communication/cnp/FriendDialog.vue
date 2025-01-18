<template>
  <div class="friend-dialog" v-if="visible">
    <div class="friend-dialog-content">
      <div class="friend-dialog-header">
        添加好友
        <span class="close iconfont icon-close2" @click="closeDialog"></span>
      </div>
      <div class="friend-dialog-body d-flex flex-column">
        <div class="title">请输入用户账号/用户邮箱</div>
        <div class="input-group">
          <span class="iconfont icon-search" id="basic-addon1"> </span>
          <input
            type="text"
            class="input-group-ipt"
            placeholder="用户账号/用户邮箱"
            v-model="search"
            @keydown="handleKeyDown"
          />
          <div class="input-group-btn" @click="searchUser">搜索</div>
        </div>
      </div>
      <div class="user-item d-flex align-items-center" v-if="searchInfo">
        <img :src="baseUrl + searchInfo.avatar" alt="" class="avatar" />
        <div class="info">
          <div class="name">{{ searchInfo.nick_name }}</div>
          <div class="email">邮箱：{{ searchInfo.email }}</div>
        </div>
        <button class="user-btn">添加好友</button>
      </div>
    </div>
  </div>
  <MessageToast ref="messageToast"></MessageToast>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from "vue";
import request from "@/utils/request";
import MessageToast from "@/components/message/MessageToast.vue";

const api = {
  searchUser: "searchUser",
};

const baseUrl =
  getCurrentInstance()?.appContext.config.globalProperties.$baseurl;

const visible = defineModel("visible");
const search = ref("");
const searchInfo = ref();
const messageToast = ref();
const closeDialog = () => {
  searchInfo.value = null;
  visible.value = false;
  search.value = "";
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    searchUser();
  }
};
const searchUser = async () => {
  if (!search.value) return;
  // console.log("搜索用户");
  // console.log(search.value);
  let res = await request.get(api.searchUser, {
    params: { search: search.value },
  });
  searchInfo.value = null;
  if (res.data.code !== 1000) {
    messageToast.value.showToast({
      type: "error",
      message: "暂未找到搜索的好友!",
    });
  } else {
    searchInfo.value = res.data.data;
  }
};
</script>

<style lang="scss" scoped>
.friend-dialog {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: center;
  .friend-dialog-content {
    font-size: 14px;
    width: 500px;
    background-color: white;
    padding: 20px;
    border-radius: 15px;
    .friend-dialog-header {
      display: flex;
      font-weight: bold;
      justify-content: space-between;
      align-items: center;
      .close {
        cursor: pointer;
        &:hover {
          color: rgb(46, 175, 255);
        }
      }
      &:first-child {
        padding: 0px 10px;
      }
    }
    .friend-dialog-body {
      padding: 30px 10px;
      gap: 20px;
      .title {
        font-weight: bold;
      }
      .input-group {
        padding: 5px 10px;
        border-radius: 40px;
        position: relative;
        height: 32px;
        width: 100%;
        gap: 10px;
        align-items: center;
        &:hover {
          outline: 1px solid rgb(46, 175, 255);
        }
        .input-group-ipt {
          flex: 1;
          border: none;
        }
        .input-group-ipt:focus {
          outline: none;
        }
        .input-group-btn {
          cursor: pointer;
        }
      }
      .input-group::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 30px;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .input-group:focus-within {
        border: 1px solid rgb(46, 175, 255);
        .icon-search {
          color: rgb(46, 175, 255);
        }
        .input-group-btn {
          color: rgb(46, 175, 255);
        }
      }
      .input-group:focus-within::before {
        background-color: rgba(0, 0, 0, 0);
      }
    }

    .user-item {
      padding: 0 10px;
      gap: 5px;
      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }
      .user-btn {
        font-size: 14px;
        border-radius: 20px;
        padding: 5px 10px;
        border: none;
        background-color: rgb(6, 167, 255);
        color: white;
        height: 35px;
      }
      .info {
        flex: 1;
        .name {
          font-weight: bold;
        }
        .email {
          color: rgba(0, 0, 0, 0.5);
        }
      }
    }
  }
}
</style>
