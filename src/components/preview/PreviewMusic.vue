<template>
  <div class="music">
    <div class="body-content">
      <div class="cover">
        <img src="@/assets/music_cover.jpg" alt="" />
      </div>
      <div ref="playerRef" class="music-player"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import APlayer from "aplayer";
import "aplayer/dist/APlayer.min.css";
import { parseBlob } from "music-metadata";
import axios from "axios";

// 父组件传递过来的文件链接
const props = defineProps({
  url: {
    type: String,
  },
  fileName: {
    type: String,
  },
});

const playerRef = ref();
const player = ref();
let audioUrl = "";
onMounted(async () => {
  let { data: music_blob } = await axios.get(props.url as string, {
    responseType: "blob",
  });
  let {
    common: { album, artist },
  } = await parseBlob(music_blob);
  // 创建临时链接，不对服务器重复发送请求
  audioUrl = URL.createObjectURL(music_blob);
  player.value = new APlayer({
    container: playerRef.value,
    audio: [
      {
        url: audioUrl,
        name: album,
        cover: new URL("@/assets/music_cover.jpg", import.meta.url).href,
        artist: artist,
      },
    ],
  });
});

onUnmounted(() => {
  URL.revokeObjectURL(audioUrl);
  player.value.destroy();
});
</script>

<style scoped lang="scss">
.music {
  display: flex;
  justify-content: center;
  width: 100%;
  .body-content {
    // height: calc(100vh - 80px);
    .cover {
      display: flex;
      img {
        width: 50%;
        height: auto;
        margin: auto;
      }
    }
  }
}
</style>
