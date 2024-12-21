<template>
    <div class="others">
       <div>
            <div class="other-img">
                <img src="@/assets/icon-image/others.png" v-if="fileInfo?.fileType !== 0" alt="">
                <img src="@/assets/icon-image/zip.png" v-else alt="">
            </div>
            <div class="file-name">{{ fileInfo?.fileName }}</div>
            <div class="tips">该类型的文件暂不支持预览，请下载后查看！</div>
            <div class="download-btn">
                <button class="btn btn-primary" @click="download">点击下载 {{ formatFileSize(fileInfo?.fileSize) }}</button>
            </div>
       </div>
       <MessageToast ref="messageToast"></MessageToast>
    </div>
</template>

<script setup lang="ts">
    import { ref,getCurrentInstance } from 'vue'
    import { formatFileSize } from '@/utils/utils'
    import MessageToast from '@/components/message/MessageToast.vue';
    import request from '../../utils/request';
    // 父组件传递过来的文件链接
    const props = defineProps({
        createDownloadUrl:{
            type:String
        },
        downloadUrl:{
            type:String
        },
        fileInfo:{
            type:Object
        }
    }) 
    // 请求的基本连接
    const baseurl = getCurrentInstance()?.appContext.config.globalProperties.$baseurl
    const messageToast = ref()
    const download = async () =>{
        // console.log(props.createDownloadUrl,props.downloadUrl)
        let result
        try{
            result = await request({
                method:'GET',
                url:props.createDownloadUrl
            })
        }catch{
            messageToast.value.showToast({
                type:'error',
                message:'下载失败，请稍后再试！'
            })
        }
        console.log(result)
        if(!result){
            return
        }
        // console.log(result.data)
        // console.log(baseurl)
        window.location.href = baseurl + props.downloadUrl + '/' + result.data.data + '/' + result.data.fileName
    }
    
</script>

<style scoped lang="scss">
   .others{
        display: flex;
        margin: 10px;
        align-items: center;
        justify-content: center;
        padding: 30px;
   }
   .others>div{
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
   }
</style>