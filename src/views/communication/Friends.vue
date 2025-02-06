<template>
  <div class="friends d-flex">
    <div class="friends-left">
      <CommunicationSide>
        <div
          class="friends-item d-flex gap-3 align-items-center"
          :class="{ active: currentFriend?.f_id === item.f_id }"
          v-for="item in friendList"
          :key="item.f_id"
          @click="currentFriend = item"
        >
          <img
            :src="baseUrl + item.avatar"
            class="friends-item-avatar"
            alt=""
          />
          <div class="friends-item-info">
            <div class="friends-item-info-name">{{ item.nick_name }}</div>
          </div>
        </div>
      </CommunicationSide>
    </div>
    <div class="friends-right d-flex justify-content-center">
      <div
        v-if="currentFriend"
        class="friend-info-card d-flex flex-column gap-2 align-items-center"
      >
        <div class="friend-avatar">
          <img
            :src="baseUrl + currentFriend?.avatar"
            class="friend-avatar-img"
            alt=""
          />
        </div>
        <div class="name">{{ currentFriend?.nick_name }}</div>
        <div class="d-flex control gap-3">
          <div class="control-item" @click="createSession">打开会话</div>
          <div class="dropdown-center">
            <div
              class="control-item"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              更多
            </div>
            <ul class="dropdown-menu">
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  @click="deleteFriend(false, 'delete')"
                  >删除好友</a
                >
                <a
                  class="dropdown-item"
                  href="#"
                  @click="deleteFriend(false, 'clear')"
                  >清空聊天记录</a
                >
              </li>
            </ul>
          </div>
        </div>
        <div class="friend-name friend-info-other">
          <span class="label">账号</span>
          <span class="value">{{ currentFriend?.nick_name }}</span>
        </div>
        <div class="friend-email friend-info-other">
          <span class="label">邮箱</span>
          <span class="value">{{ currentFriend?.email }}</span>
        </div>
      </div>
      <div v-else class="no-friend">
        <NotData :imgWidth="100">
          <template #msg> 简单操作即可分享文件 </template>
        </NotData>
      </div>
    </div>
  </div>
  <MessageModal ref="messageModalRef" @submit="deleteFriend(true, '')" />
  <MessageToast ref="messageToastRef" />
</template>

<script setup lang="ts">
import { onMounted, getCurrentInstance, ref } from "vue";
import request from "@/utils/request";
import CommunicationSide from "./CommunicationSide.vue";
import { useRouter } from "vue-router";
import MessageModal from "@/components/message/MessageModal.vue";
import MessageToast from "@/components/message/MessageToast.vue";
import NotData from "@/components/NotData.vue";

// 添加 emits 声明
defineEmits(["addFile"]);

const router = useRouter();
const messageModalRef = ref<any>(null);
const messageToastRef = ref<any>(null);

const api = {
  getFriendList: "getFriendList",
  createSession: "chat/addNewSession",
  deleteFriend: "deleteFriend",
  clearChatRecord: "chat/clearChatRecord",
};

const baseUrl =
  getCurrentInstance()?.appContext.config.globalProperties.$baseurl;

interface Friend {
  f_id: number;
  avatar: string;
  nick_name: string;
  uid: string;
  email: string;
}
const friendList = ref<Friend[]>([]);
const currentFriend = ref<Friend | null>(null);
const deleteType = ref<string>("");
const createSession = async () => {
  const formData = new FormData();
  formData.append("user", currentFriend.value?.uid as string);
  request({
    url: api.createSession,
    method: "POST",
    data: formData,
  }).then((res: any) => {
    if (res.data.code === 10000) {
      router.push("/message/session?id=" + res.data.conversation_id);
    }
  });
};

const getFriendList = async () => {
  let result = await request({
    url: api.getFriendList,
    method: "GET",
  });
  if (result.data.code === 10000) {
    friendList.value = result.data.list;
  }
};

const deleteFriend = async (isDelete: boolean, type: string) => {
  if (!isDelete) {
    deleteType.value = type;
    type === "delete"
      ? messageModalRef.value.openMessage({
          title: "温馨提示！",
          message: "确定要删除该好友吗？同时也会将所有的聊天记录删除！",
          type: "warning",
        })
      : messageModalRef.value.openMessage({
          title: "温馨提示！",
          message: "确定要清空聊天记录吗？",
          type: "warning",
        });
    return;
  }
  if (deleteType.value === "delete") {
    let result = await request({
      url: api.deleteFriend,
      method: "POST",
      data: {
        f_id: currentFriend.value?.f_id,
      },
    });
    request({
      url: api.clearChatRecord,
      method: "POST",
      data: {
        uid: currentFriend.value?.uid,
      },
    });
    if (result.data.code === 10000) {
      messageToastRef.value.showToast({
        type: "success",
        message: "删除好友成功",
      });
      getFriendList();
      currentFriend.value = null;
    }
  }
  if (deleteType.value === "clear") {
    let result = await request({
      url: api.clearChatRecord,
      method: "POST",
      data: {
        uid: currentFriend.value?.uid,
      },
    });
    if (result.data.code === 10000) {
      messageToastRef.value.showToast({
        type: "success",
        message: "清空聊天记录成功",
      });
    }
  }
};

onMounted(() => {
  getFriendList();
});
</script>

<style lang="scss" scoped>
.friends {
  height: 100%;
  .friends-item {
    cursor: pointer;
    padding: 10px;
    .friends-item-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
    }
    &.active {
      background-color: rgba(240, 240, 240);
    }
    .friends-item-info {
      .friends-item-info-name {
        font-size: 14px;
        font-weight: bolder;
      }
    }
  }
  .friends-right {
    background-color: rgb(244, 244, 244);
    height: 100%;
    width: 100%;
    .friend-info-card {
      margin-top: 60px;
      width: 360px;
      height: 60%;
      background-color: white;
      padding: 20px;
      border-radius: 10px;
      .friend-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        margin: 10px;
        .friend-avatar-img {
          width: 100%;
          height: 100%;
        }
      }
      .name {
        font-size: 18px;
        font-weight: bolder;
      }
      .control {
        margin-bottom: 20px;
        .control-item {
          cursor: pointer;
          font-size: 12px;
        }
        .dropdown-menu {
          padding: 5px;
          min-width: 100px;
          max-width: 100px;
          transform: translate(-26px, 20px);
          .dropdown-item {
            cursor: pointer;
            padding: 5px;
            font-size: 12px;
            text-align: center;
          }
        }
      }
      .friend-info-other {
        padding: 0 10px;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 20px;
        .label {
          font-size: 14px;
          color: rgb(150, 150, 150);
        }
      }
    }
    .no-friend {
      width: 100%;
      background-color: white;
    }
  }
}
</style>
