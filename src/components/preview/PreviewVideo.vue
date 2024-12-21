<template>
    <div ref="player" id="player">

    </div>
</template>

<script setup lang="ts">
    import { ref,onMounted } from 'vue'
    import DPlayer from 'dplayer'

    const props = defineProps({
        url:{
            type:String
        }
    })

    // console.log(props.url)
    interface videoInfo{
        src:string
    }
    const player = ref()
    const initPlayer = () =>{
        new DPlayer({
            container:player.value,
            theme:"#b7daff",
            screenshot:true,
            video:{
                url:props.url as string,
                type:"customHls",
                customType:{
                    customHls:function(video:videoInfo){
                        const hls = new Hls()
                        hls.loadSource(video.src)
                        hls.attachMedia(video as HTMLVideoElement)
                    }
                }
            }
        })
    }

    onMounted(()=>{
        initPlayer()
    })
</script>

<style lang="scss" scoped>
    #player{
        width: 100%;
        :deep .dplayer-video-wrap{
            text-align: center;
            .dplayer-video{
                margin: 0px auot;
                max-height: calc(100vh - 90px);
            }
        }
    }
</style>