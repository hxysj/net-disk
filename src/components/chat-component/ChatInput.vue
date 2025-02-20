<template>
  <div class="chat-input">
    <div class="input-gj">
      <button @click="toggleEmojiPicker" class="emoji-button">😊</button>
      <slot name="other-tool"></slot>
    </div>
    <div class="input-sr">
      <textarea
        type="text"
        v-model="message"
        :maxlength="200"
        @keydown="handleKeydown"
        class="text-input"
        placeholder="请输入文本内容,按下enter发送消息\enter+ctrl换行"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as EmojiButton from "@joeattardi/emoji-button";

const emit = defineEmits(["submit"]);
const picker = ref<EmojiButton.EmojiButton | null>(null);
const message = defineModel<string>("message");

const toggleEmojiPicker = () => {
  if (picker.value) {
    picker.value.togglePicker(document.querySelector(".emoji-button")!);
  }
};

onMounted(() => {
  picker.value = new EmojiButton.EmojiButton();

  picker.value.on("emoji", (emoji) => {
    // console.log("选中的表情", emoji);
    message.value += emoji.emoji;
  });
});

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.ctrlKey && message.value !== "") {
    e.preventDefault();
    emit("submit");
  } else if (e.key === "Enter" && e.ctrlKey) {
    message.value += "\n";
  } else if (e.key === "Enter" && !e.ctrlKey) {
    e.preventDefault();
  }
};
</script>

<style lang="scss" scoped>
.chat-input {
  height: 100%;
  padding: 5px;
  border-radius: 10px;
  padding-bottom: 15px;
  background-color: white;
  .input-gj {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px;
    .emoji-button {
      border: none;
      background-color: white;
    }
  }
  .input-sr {
    .text-input {
      border: none;
      width: 100%;
      padding: 0 5px;
      max-height: 60px;
      overflow-y: auto;
      outline: none;
      resize: none;
      font-size: 14px;
    }
    .text-input::-webkit-scrollbar {
      width: 4px;
    }
    .text-input::-webkit-scrollbar-track {
      background-color: white;
    }
    .text-input::-webkit-scrollbar-thumb {
      background-color: black;
      border-radius: 10px;
    }
  }
}
</style>

<style lang="scss">
.emoji-picker__wrapper {
  transform: translate(570px, -140px) !important;
}
@media (max-width: 930px) {
  .emoji-picker__wrapper {
    transform: translate(325px, -140px) !important;
  }
}
</style>
