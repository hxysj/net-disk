<template>
  <div class="message" :class="isSelf ? 'flex-end' : 'flex-start'">
    <div class="info">
      <img :src="avatar" alt="" class="avatar" />
      <div class="content">
        <div class="name">{{ userName }}</div>
        <div class="value">
          {{ content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
defineProps({
  avatar: {
    type: String,
  },
  userName: {
    type: String,
  },
  content: {
    type: String,
  },
  isSelf: {
    type: Boolean,
  },
});
</script>

<style lang="scss" scoped>
.message {
  width: 100%;
  padding: 10px 15px;
  display: flex;
  .info {
    display: flex;
    font-size: 14px;
    gap: 10px;
    .name {
      color: rgba(0, 0, 0, 0.5);
    }
    .content {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .value {
      padding: 10px;
      border-radius: 5px;
      background-color: #06a7ff;
      color: white;
      max-width: 300px;
      word-wrap: break-word;
    }
    .value::before {
      content: "";
      position: absolute;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
    }
  }
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
}
.flex-start {
  justify-content: flex-start;
  .info {
    .value::before {
      left: -5px;
      border-right: 5px solid #06a7ff;
    }
  }
}

.flex-end {
  justify-content: flex-end;
  .info {
    flex-direction: row-reverse;
    .content {
      text-align: right;
    }
    .value::before {
      right: -5px;
      border-left: 5px solid #06a7ff;
    }
  }
}
</style>
