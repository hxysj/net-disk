<template>
    <div class="music">
        <div class="body-content">
            <div class="cover">
                <img src="@/assets/music_cover.jpg" alt="" >
            </div>
            <div ref="playerRef" class="music-player"></div>
        </div>
    </div>
</template>

<script setup lang="ts">

    import { ref,onMounted,onUnmounted } from 'vue'
    import APlayer from 'APlayer'
    import "Aplayer/dist/Aplayer.min.css"

    // 父组件传递过来的文件链接
    const props = defineProps({
        url:{
            type:String
        },
        fileName:{
            type:String
        }
    })

    const playerRef = ref()
    const player = ref()

    onMounted(()=>{
        player.value = new APlayer({
            container:playerRef.value,
            audio:{
                // 链接
                url:props.url,
                // 名称
                name:props.fileName,
                // 封面
                cover:new URL('@/assets/music_cover.jpg',import.meta.url).href,
                //作者
                artist:''
            }
        })
    })

    onUnmounted(()=>{
        player.value.destroy()
    })
</script>

<style scoped lang="scss">
   .music{
        display: flex;
        justify-content: center;
        width: 100%;
        .body-content{
            // height: calc(100vh - 80px);
            .cover{
                display: flex;
                img{
                    width: 50%;
                    height: auto;
                    margin: auto;
                }
            }
        }
   }
</style>