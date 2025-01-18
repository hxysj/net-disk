<template>
  <div class="session">
    <div class="session-left">
      <CommunicationSide>
        <template #default>
          <div
            @click="changeCurrentSession(item.conversation_id)"
            class="session-left-content-list-item"
            v-for="item in sessionList"
            :class="item.conversation_id === currentSessionId ? 'active' : ''"
            :key="item.conversation_id"
          >
            <div class="count" v-if="item.new_message">
              {{ item.new_message }}
            </div>
            <img
              :src="imgBaseurl + item.avatar"
              alt=""
              class="session-item-img"
            />
            <div class="session-item-info">
              <div class="info-header">
                <div>{{ item.nick_name }}</div>
                <div class="info-o">
                  {{
                    item.last_message_time && formatTime(item.last_message_time)
                  }}
                </div>
              </div>
              <div class="info-o">
                {{ item.last_message_content }}
              </div>
            </div>
          </div>
        </template>
      </CommunicationSide>
    </div>
    <div class="session-right">
      <ChatBox
        v-if="currentSessionId"
        :message-list="sessionMessage[currentSessionId]"
        :currentUser="currentUser"
        @submit="sendMessage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, watch } from "vue";
import CommunicationSide from "./CommunicationSide.vue";
import ChatBox from "@/components/chat-component/ChatBox.vue";
import request from "@/utils/request";
import { parseToken, formatTime } from "@/utils/utils";
const currentUser = parseToken(localStorage.getItem("token") as string);
const imgBaseurl =
  getCurrentInstance()?.appContext.config.globalProperties.$baseurl + "media/";
const api = {
  getSessionList: "chat/getSession",
  getMessageList: "chat/getMessage",
  createSession: "chat/addNewSession",
  setMessageRead: "chat/setMessageRead",
};

interface sessionType {
  conversation_id: string;
  nick_name: string;
  new_message: number;
  last_message_content: string;
  last_message_time: string;
  user_id: string;
  avatar: string;
}
const sessionList = ref<sessionType[]>([]);
const currentSessionId = ref("");

const changeCurrentSession = (id: string) => {
  currentSessionId.value = id;
  getMessageList();
};

interface messageType {
  content: string;
  create_time: string;
}
const sessionMessage = ref<{
  [key: string]: messageType[];
}>({});

const wsPool: any = {};
const sendMessage = (message: string) => {
  if (wsPool[currentSessionId.value]) {
    wsPool[currentSessionId.value].send(message);
  } else {
    let params = new URLSearchParams({
      file_id: "",
      token: localStorage.getItem("token") as string,
    });
    const socket = new WebSocket(
      `ws://127.0.0.1:8001/ws/message/${
        currentSessionId.value
      }/?${params.toString()}`
    );
    wsPool[currentSessionId.value] = socket;

    socket.onopen = function () {
      // console.log("连接成功");
      socket.send(message);
    };

    socket.onmessage = function (event) {
      let messageObj = JSON.parse(event.data);
      messageObj.avatar = messageObj.avatar.replace("media/", "");

      let receive = sessionList.value.find(
        (item) => item.conversation_id === messageObj.conversation_id
      ) as sessionType;
      receive.last_message_content = messageObj.content;
      receive.last_message_time = messageObj.create_time;
      sessionMessage.value[messageObj.conversation_id]?.push(messageObj);
      if (messageObj.user_id !== currentUser.uid) {
        receive.new_message = messageObj.new_message;
      }
    };

    socket.onclose = function () {
      console.log("连接关闭");
      wsPool[currentSessionId.value] = null;
    };

    socket.onerror = function () {
      console.log("连接错误");
    };
  }
};

const getMessageList = async () => {
  let result = await request({
    url: api.getMessageList,
    method: "GET",
    params: {
      session_id: currentSessionId.value,
    },
  });
  sessionMessage.value[currentSessionId.value] = result.data.list;
};

const clearMessageCount = () => {
  currentSessionId.value &&
    ((
      sessionList.value.find(
        (item) => item.conversation_id === currentSessionId.value
      ) as sessionType
    ).new_message = 0);
};

onMounted(async () => {
  // const formData = new FormData();
  // formData.append("user", "12esd9ujmdis1aDSDHUSIDN218njA__!!SAJ");
  // request({
  //   url: api.createSession,
  //   method: "POST",
  //   data: formData,
  // }).then((res) => {
  //   console.log(res);
  // });

  let res: { data: { code: string; list: sessionType[] } } = await request({
    url: api.getSessionList,
    method: "GET",
  });
  sessionList.value = res.data.list;
  // 进入页面则与所有会话建立连接，保证能够及时收到消息
  sessionList.value.forEach((item) => {
    let params = new URLSearchParams({
      file_id: "",
      token: localStorage.getItem("token") as string,
    });
    const socket = new WebSocket(
      `ws://127.0.0.1:8001/ws/message/${
        item.conversation_id
      }/?${params.toString()}`
    );
    wsPool[item.conversation_id] = socket;

    socket.onmessage = function (event) {
      let messageObj = JSON.parse(event.data);
      messageObj.avatar = messageObj.avatar.replace("media/", "");
      let receive = sessionList.value.find(
        (item) => item.conversation_id === messageObj.conversation_id
      ) as sessionType;
      receive.last_message_content = messageObj.content;
      receive.last_message_time = messageObj.create_time;
      sessionMessage.value[messageObj.conversation_id]?.push(messageObj);
      if (messageObj.user_id !== currentUser.uid) {
        receive.new_message = messageObj.new_message;
      }
    };

    socket.onclose = function () {
      console.log("连接关闭");
      wsPool[currentSessionId.value] = null;
    };

    socket.onerror = function () {
      console.log("连接错误");
    };
  });
});

watch(
  () => sessionMessage.value,
  async () => {
    clearMessageCount();
    await request({
      url: api.setMessageRead,
      method: "POST",
      data: {
        session_id: currentSessionId.value,
      },
    });
  },
  {
    deep: true,
  }
);
</script>

<style lang="scss" scoped>
.session {
  height: 100%;
  display: flex;
  .session-right {
    flex: 1;
    height: 100%;
  }
}
.session-left {
  .active {
    background-color: rgba(242, 242, 242);
  }
  .session-left-content-list-item {
    position: relative;
    padding: 10px;
    display: flex;
    justify-content: center;
    gap: 10px;
    align-items: center;
    &:hover {
      cursor: pointer;
    }
    .count {
      position: absolute;
      right: 2px;
      top: 0;
      font-size: 8px;
      background-color: rgb(235, 56, 56);
      padding: 2px 5px;
      color: white;
      border-radius: 100%;
    }
    .session-item-img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }
    .session-item-info {
      font-size: 14px;
      width: 200px;
      .info-header {
        display: flex;
        justify-content: space-between;
        margin: 4px 0;
        & > :first-child {
          font-weight: bolder;
        }
      }
      .info-o {
        color: rgba(0, 0, 0, 0.5);
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
