<template>
    <div v-html="excelContent" class="table-info">

    </div>
</template>

<script setup lang="ts">
    import { ref,onMounted } from 'vue'
    import * as XLSX from 'xlsx'
    import axios from 'axios';
    const props = defineProps({
        url:{
            type:String
        }
    })

    const excelContent = ref()
    const initExcel = async ()=>{
        const token = localStorage.getItem('token')
        let headers = {
            'Authorization':''
        }
        if(token){
            headers['Authorization'] = token
        }
        // 等有后端再进行测试
        let result = await axios({
            method:'GET',
            url:props.url,
            // 返回的数据的格式  - 文件流
            responseType:'blob',
            headers:headers
        })
        if(!result.data){
            return
        }
        // console.log(result)
        // let workbook = XLSX.read(new Uint8Array(result.data),{type:"array"})
        // console.log(workbook)
        // var worksheet = workbook.Sheets[workbook.SheetNames[0]]
        // console.log(worksheet)
        // excelContent.value = XLSX.utils.sheet_to_html(worksheet)
        // 使用 FileReader 将 Blob 转换为 ArrayBuffer
        const reader = new FileReader();
        reader.onload = (event) => {
            const arrayBuffer = event?.target?.result;
            let workbook = XLSX.read(arrayBuffer, { type: "array" });
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];
            excelContent.value = XLSX.utils.sheet_to_html(worksheet);
        };
        reader.readAsArrayBuffer(result.data);  // 读取 Blob 为 ArrayBuffer
    }

    onMounted(()=>{
        initExcel()
    })
</script>

<style scoped lang="scss">
    .table-info{
        width: 100%;
        padding: 10px;
        :deep table{
            width: 100%;
            border-collapse: collapse;
        }
    }
</style>