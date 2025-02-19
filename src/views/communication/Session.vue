<template>
  <div class="session">
    <div class="session-left">
      <CommunicationSide>
        <template #default>
          <div
            class="session-left-content-list-item"
            :class="sessionType === 'ai' ? 'active' : ''"
            @click="changeCurrentSession('-1')"
          >
            <img src="@/assets/deepSeek.png" alt="" class="session-item-img" />
            <div class="session-item-info">
              <div class="info-header">
                <div>deepSeek</div>
              </div>
              <div class="info-o">
                欢迎使用deepSeek，你可以与AI进行对话，让AI助力生活！
              </div>
            </div>
          </div>
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
                {{ emojify(item.last_message_content) }}
              </div>
            </div>
          </div>
          <div
            class="friend-apply session-left-content-list-item"
            v-if="friendApplyList.length > 0"
            @click="changeCurrentSession('0')"
            :class="'0' === currentSessionId ? 'active' : ''"
          >
            <span
              class="icon iconfont icon-haoyoushenqing session-item-icon"
            ></span>
            <div class="session-item-info">
              <div class="info-header">好友申请</div>
            </div>
          </div>
        </template>
      </CommunicationSide>
    </div>
    <div class="session-right">
      <ChatBox
        v-if="
          (currentSessionId && sessionType === 'session') ||
          sessionType === 'ai'
        "
        :message-list="sessionMessage[currentSessionId]"
        :currentUser="currentUser"
        :friend="
          sessionType === 'ai'
            ? 'deepSeek'
            : sessionList.find(
                (item) => item.conversation_id === currentSessionId
              )?.nick_name
        "
        v-model:showMore="isLoadingMore"
        @submit="sendMessage"
        @showMore="getMessageList"
      >
        <template #headerOther>
          <span
            class="iconfont icon-del header-del"
            @click="clearMessage()"
          ></span>
        </template>
      </ChatBox>
      <div
        v-else-if="sessionType === 'friendApply'"
        class="friend-apply-box d-flex flex-column gap-2"
      >
        <div
          class="friend-apply-box-item d-flex align-items-center"
          v-for="item in friendApplyList"
        >
          <img
            class="friend-apply-box-item-img"
            :src="
              imgBaseurl +
              (currentUser.uid === item.userId1
                ? item.userAvatar2.replace('media/', '')
                : item.userAvatar1.replace('media/', ''))
            "
            alt=""
          />
          <div class="friend-apply-box-item-info flex-grow-1">
            <div class="friend-apply-box-item-info-header">
              {{
                currentUser.uid === item.userId1
                  ? item.userName2
                  : item.userName1
              }}
            </div>
            <div class="friend-apply-box-item-info-content">
              {{
                currentUser.uid === item.userId1
                  ? "你已发送好友申请"
                  : "申请添加你为好友"
              }}
            </div>
          </div>
          <div class="friend-apply-box-item-info-status d-flex gap-2">
            <template v-if="item.status === 2">
              <button
                class="btn btn-primary"
                @click="
                  createSession(
                    currentUser.uid === item.userId2
                      ? item.userId1
                      : item.userId2
                  )
                "
              >
                发送消息
              </button>
            </template>
            <template
              v-else-if="currentUser.uid === item.userId2 && item.status === 0"
            >
              <button
                class="btn btn-primary"
                @click="handleChangeFriend(item.f_id, 2)"
              >
                同意
              </button>
              <button
                class="btn btn-danger"
                @click="handleChangeFriend(item.f_id, 1)"
              >
                拒绝
              </button>
            </template>
            <template v-else>
              <div
                class="status"
                :style="{ color: APPLY_STATUS_COLOR[item.status] }"
              >
                {{ APPLY_STATUS[item.status] }}
              </div>
            </template>
          </div>
        </div>
      </div>
      <div v-else class="no-friend">
        <NotData :imgWidth="100">
          <template #msg>与好友分享你的文件吧</template>
        </NotData>
      </div>
    </div>
  </div>
  <MessageToast ref="messageToast" />
  <MessageModal ref="messageModal" @submit="clearMessage(true)"></MessageModal>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, watch } from "vue";
import CommunicationSide from "./CommunicationSide.vue";
import ChatBox from "@/components/chat-component/ChatBox.vue";
import request from "@/utils/request";
import { parseToken, formatTime, generateUniqueId } from "@/utils/utils";
import { APPLY_STATUS, APPLY_STATUS_COLOR } from "@/utils/data";
import { useRoute, useRouter } from "vue-router";
import MessageToast from "@/components/message/MessageToast.vue";
import { emojify } from "node-emoji";
import NotData from "@/components/NotData.vue";
import OpenAI from "openai";
import MessageModal from "@/components/message/MessageModal.vue";

// 添加 emits 声明
defineEmits(["addFile"]);

const currentUser = parseToken(localStorage.getItem("token") as string);
const isLoadingMore = ref(true);
const imgBaseurl =
  getCurrentInstance()?.appContext.config.globalProperties.$baseurl + "media/";
const api = {
  getSessionList: "chat/getSession",
  getMessageList: "chat/getMessage",
  createSession: "chat/addNewSession",
  setMessageRead: "chat/setMessageRead",
  getFriendApply: "getFriendApply",
  changeFriend: "changeFriend",
  clearChatRecord: "chat/clearChatRecord",
};
const route = useRoute();
const router = useRouter();
const messageToast = ref();

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
const sessionType = ref("session");
const messageModal = ref();
const changeCurrentSession = (id: string) => {
  currentSessionId.value = id;
  if (id === "-1") {
    sessionType.value = "ai";
    getMessageList();
    return;
  }
  if (id === "0") {
    sessionType.value = "friendApply";
    return;
  }
  sessionType.value = "session";
  isLoadingMore.value = true;
  getMessageList(true);
};

interface messageType {
  content: string;
  create_time: string | Date;
  user_id?: string;
  nick_name?: string;
  avatar?: string;
  message_id?: string;
}
const sessionMessage = ref<{
  [key: string]: messageType[];
}>({});

interface FriendApplyType {
  f_id: string;
  userId1: string;
  userId2: string;
  userName1: string;
  userName2: string;
  userAvatar1: string;
  userAvatar2: string;
  status: number;
}
const friendApplyList = ref<FriendApplyType[]>([]);

const wsPool: any = {};
const websocketUrl =
  getCurrentInstance()?.appContext.config.globalProperties.websocketUrl;
const sendMessage = (message: string) => {
  if (sessionType.value === "ai") {
    sendMessageAi(message);
    return;
  }
  if (wsPool[currentSessionId.value]) {
    wsPool[currentSessionId.value].send(message);
  } else {
    let params = new URLSearchParams({
      file_id: "",
      token: localStorage.getItem("token") as string,
    });
    const socket = new WebSocket(
      `${websocketUrl}/message/${currentSessionId.value}/?${params.toString()}`
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

    socket.onclose = function (event) {
      if (event.code === 4001) {
        messageToast.value.showToast({
          type: "error",
          message: "你和对方还不是好友，请先添加好友再发送消息!",
        });
      }
      wsPool[currentSessionId.value] = null;
    };

    socket.onerror = function () {
      console.log("连接错误");
    };
  }
};

const openai = new OpenAI({
  apiKey: "******",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  dangerouslyAllowBrowser: true,
});

const sendMessageAi = async (message: string) => {
  sessionMessage.value["-1"].push({
    content: message,
    create_time: new Date(),
    user_id: currentUser.uid,
    avatar: currentUser.avatar,
    nick_name: currentUser.username,
    message_id: generateUniqueId(),
  });
  localStorage.setItem(
    `ai_message_${currentUser.uid}`,
    JSON.stringify(sessionMessage.value["-1"])
  );
  let reasoningContent = ""; // 定义完整思考过程
  let answerContent = ""; // 定义完整回复
  let isAnswering = false; // 判断是否结束思考过程并开始回复
  const completion = await openai.chat.completions.create({
    model: "deepseek-r1",
    messages: sessionMessage.value["-1"]?.map((item) => {
      return {
        role: item.user_id === currentUser.uid ? "user" : "assistant",
        content: item.content,
      };
    }),
    stream: true,
  });
  const ai_message_id = generateUniqueId();
  let messageObj = {
    content: ">>正在思考问题: ",
    create_time: new Date(),
    user_id: "deepSeek-ss-r1-0-openAPI-2-myTest-18",
    avatar: "deepSeek.png",
    nick_name: "deepSeek",
    message_id: ai_message_id,
  };
  sessionMessage.value["-1"].push(messageObj);
  localStorage.setItem(
    `ai_message_${currentUser.uid}`,
    JSON.stringify(sessionMessage.value["-1"])
  );

  for await (const chunk of completion) {
    const delta = chunk.choices[0].delta;
    // 检查是否有reasoning_content属性
    if (!("reasoning_content" in delta)) {
      continue;
    }

    // 处理空内容情况
    if (!delta.reasoning_content && !delta.content) {
      continue;
    }
    // 处理开始回答的情况
    if (!delta.reasoning_content && !isAnswering) {
      (
        sessionMessage.value["-1"].find(
          (item) => item.message_id === ai_message_id
        ) as messageType
      ).content = "思考完成，开始回答内容！";
      isAnswering = true;
    }

    // 处理思考过程
    if (delta.reasoning_content) {
      reasoningContent += delta.reasoning_content;
      (
        sessionMessage.value["-1"].find(
          (item) => item.message_id === ai_message_id
        ) as messageType
      ).content = reasoningContent;
    }
    // 处理回复内容
    else if (delta.content) {
      answerContent += delta.content;
      (
        sessionMessage.value["-1"].find(
          (item) => item.message_id === ai_message_id
        ) as messageType
      ).content = answerContent;
    }
  }
  localStorage.setItem(
    `ai_message_${currentUser.uid}`,
    JSON.stringify(sessionMessage.value["-1"])
  );
};

// 获取会话消息
const getMessageList = async (init = false) => {
  if (sessionType.value === "ai") {
    sessionMessage.value["-1"] =
      JSON.parse(
        localStorage.getItem(`ai_message_${currentUser.uid}`) as string
      ) || [];
    return;
  }

  // 已经加载的聊天记录在初始化的时候不需要重新发送请求，直接显示
  if (init && sessionMessage.value[currentSessionId.value]?.length) {
    return;
  }
  let result = await request({
    url: api.getMessageList,
    method: "GET",
    params: {
      session_id: currentSessionId.value,
      num:
        sessionMessage.value[currentSessionId.value]?.length && !init
          ? sessionMessage.value[currentSessionId.value].length
          : 0,
    },
  });
  if (result.data.list.length === 0) {
    isLoadingMore.value = false;
  }
  if (init) {
    sessionMessage.value[currentSessionId.value] = result.data.list;
  } else {
    sessionMessage.value[currentSessionId.value] = [
      ...result.data.list,
      ...(sessionMessage.value[currentSessionId.value] || []),
    ];
  }
};

// 处理好友申请
const handleChangeFriend = async (f_id: string, status: number) => {
  let result = await request({
    url: api.changeFriend,
    method: "POST",
    data: {
      id: f_id,
      status,
    },
  });
  if (result.data.code !== 10000) {
    messageToast.value.showToast({
      type: "error",
      message: "操作失败，请稍后再试！",
    });
  } else {
    messageToast.value.showToast({
      type: "success",
      message: "操作成功！",
    });
  }
  getFriendApplyList();
};

// 清除会话消息计数
const clearMessageCount = () => {
  currentSessionId.value != "-1" &&
    currentSessionId.value &&
    ((
      sessionList.value.find(
        (item) => item.conversation_id === currentSessionId.value
      ) as sessionType
    ).new_message = 0);
};

// 获取用户的好友申请信息
const getFriendApplyList = async () => {
  // 获取用户的好友申请信息
  let result = await request({
    url: api.getFriendApply,
    method: "GET",
  });
  if (result.data.code !== 10000) {
    messageToast.value.showToast({
      type: "error",
      message: "获取好友申请信息失败!",
    });
  } else {
    friendApplyList.value = result.data.list;
  }
};

// 对已经添加的好友发送消息
const createSession = async (user_id: string) => {
  const formData = new FormData();
  formData.append("user", user_id);
  request({
    url: api.createSession,
    method: "POST",
    data: formData,
  }).then((res: any) => {
    if (res.data.code === 10000) {
      router.push("/message/session?id=" + res.data.conversation_id);
      // 如果路由参数不变的时候，路由不会重新渲染，所以需要手动触发路由更新
      if (route.query.id === res.data.conversation_id) {
        changeCurrentSession(res.data.conversation_id);
      }
    }
  });
};

// 清除历史记录
const clearMessage = async (del = false) => {
  if (!del) {
    messageModal.value.openMessage({
      message: `你确定要删除该会话下的聊天记录吗？`,
      title: "温馨提示！",
    });
    return;
  }
  if (sessionType.value === "ai") {
    sessionMessage.value["-1"] = [];
    localStorage.removeItem(`ai_message_${currentUser.uid}`);
    messageToast.value.showToast({
      type: "success",
      message: "清空聊天记录成功",
    });
  } else {
    let result = await request({
      url: api.clearChatRecord,
      method: "POST",
      data: {
        uid: sessionList.value.find(
          (item) => item.conversation_id === currentSessionId.value
        )?.user_id,
      },
    });
    if (result.data.code === 10000) {
      messageToast.value.showToast({
        type: "success",
        message: "清空聊天记录成功",
      });
      sessionMessage.value[currentSessionId.value] = [];
      sessionList.value = sessionList.value.filter(
        (item) => item.conversation_id != currentSessionId.value
      );
      currentSessionId.value = "";
    }
  }
};

onMounted(async () => {
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
      `${websocketUrl}/message/${item.conversation_id}/?${params.toString()}`
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

    socket.onclose = function (event) {
      if (event.code === 4001) {
        messageToast.value.showToast({
          type: "error",
          message: "你和对方还不是好友，请先添加好友再发送消息!",
        });
      }
      wsPool[currentSessionId.value] = null;
    };

    socket.onerror = function () {
      console.log("连接错误");
    };
  });

  getFriendApplyList();
  // 如果是其他页面跳转过来的，则会携带id（会话的id）
  if (route.query.id) {
    currentSessionId.value = route.query.id as string;
    sessionType.value = "session";
    getMessageList();
  }
});

watch(
  () => sessionMessage.value,
  async () => {
    if (currentSessionId.value === "-1" || !currentSessionId.value) return;
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
watch(
  () => route.query.id,
  (newVal) => {
    if (newVal) {
      currentSessionId.value = newVal as string;
      sessionType.value = "session";
      getMessageList();
    }
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
    .header-del {
      cursor: pointer;
      &:hover {
        color: rgb(37, 161, 239);
      }
    }

    .friend-apply-box {
      padding: 15px;
      background-color: rgba(0, 0, 0, 0.05);
      height: 100%;
      overflow-y: auto;
      .friend-apply-box-item {
        background-color: white;
        border-radius: 10px;
        gap: 20px;
        padding: 15px;
        .friend-apply-box-item-img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }
        .status {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.5);
        }
        .friend-apply-box-item-info-content {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.5);
        }
        .friend-apply-box-item-info-header {
          font-size: 14px;
          font-weight: bolder;
        }
        .friend-apply-box-item-info-status {
          cursor: pointer;
          .btn {
            height: 30px;
            font-size: 12px;
          }
        }
      }
    }
    .friend-apply-box::-webkit-scrollbar {
      width: 4px;
    }
    .friend-apply-box::-webkit-scrollbar-thumb {
      background-color: rgb(185, 185, 185);
    }
    .no-friend {
      height: 100%;
    }
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
    .session-item-icon {
      font-size: 58px;
      line-height: 50px;
      color: rgb(37, 161, 239);
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
        white-space: nowrap;
      }
    }
  }
  .friend-apply {
    gap: 5px;
    .info-header {
      font-weight: bolder;
    }
  }
}
@media (max-width: 768px) {
  .session-left {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    background-color: white;
    height: 100%;
    z-index: 1;
  }
}
</style>
