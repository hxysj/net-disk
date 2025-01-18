<template>
  <div class="chat-box">
    <div class="header">
      <div class="title">{{ friend }}</div>
    </div>
    <div class="content" ref="contentRef">
      <ChatMessage
        v-for="(item, index) in messageList"
        :key="index"
        :content="item.content"
        :is-self="item.user_id === currentUser.uid"
        :avatar="baseUrl + 'media/' + item.avatar"
        :user-name="item.nick_name"
      />
    </div>
    <div class="box-input">
      <ChatInput v-model:message="message" @submit="submitMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatInput from "./ChatInput.vue";
import { ref, nextTick, getCurrentInstance, PropType, watch } from "vue";
import ChatMessage from "./ChatMessage.vue";

const props = defineProps({
  friend: {
    type: String,
    default: "Chat Box",
  },
  messageList: {
    type: Array as PropType<
      Array<{
        content: string;
        user_id: string;
        avatar: string;
        nick_name: string;
        create_time: string;
      }>
    >,
    default: [],
  },
  currentUser: {
    type: Object as PropType<{ uid: string; avatar: string }>,
    required: true,
  },
});
const emits = defineEmits(["submit"]);
const contentRef = ref<HTMLElement | null>(null);
const baseUrl =
  getCurrentInstance()?.appContext.config.globalProperties.$baseurl;

const scrollContent = () => {
  nextTick(() => {
    const element = contentRef.value as HTMLElement;
    element.scrollTop = element.scrollHeight;
  });
};

const message = ref("");

const submitMessage = () => {
  emits("submit", message.value);
  message.value = "";
};

watch(
  () => props.messageList,
  () => {
    scrollContent();
  },
  {
    deep: true,
    immediate: true,
  }
);
</script>

<style scoped lang="scss">
.chat-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgba(237, 242, 243, 0.4);
  .header {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10px 15px;
    border-bottom: 1px solid rgb(233, 233, 233);
    .title {
      cursor: pointer;
    }
  }
  .content {
    flex: 1;
    overflow: auto;
  }
  .content::-webkit-scrollbar {
    width: 4px;
    height: 5px;
  }
  .content::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
  }
  .box-input {
    padding: 20px;
  }
}
</style>
