<template>
    <div ref="docRef" class="doc-content">

    </div>
</template>

<script setup lang="ts">
    import { ref,onMounted } from 'vue'
    import { renderAsync } from 'docx-preview'
    import axios from 'axios';
    const props = defineProps({
        url:{
            type:String
        }
    })

    const docRef = ref()
    const initDoc = async ()=>{
        // 等有后端再进行测试
        let result = await axios({
            method:'GET',
            url:props.url,
            // 返回的数据的格式  - 文件流
            responseType:'blob'
        })
        if(!result.data){
            return
        }
        // console.log(result.data)
        // result 是一个文件流数据
        renderAsync(result.data,docRef.value)
    }

    onMounted(()=>{
        initDoc()
    })
</script>

<style scoped lang="scss">
    .doc-content{
        margin: 0 auot;
        :deep .docx-wrapper{
            background-color: #fff;
            padding: 10px 0;
        }
        :deep .docx-wrapper > section.docx {
            margin-bottom: 0px;
        }
    }
</style>