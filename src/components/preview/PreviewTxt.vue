<template>
    <div class="code" ref="text_code">
        <div class="top">
            <div class="top-op">
                <div class="encode-select">
                    <!-- 选中文件编码 -->
                    <div class="dropdown">
                        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                            {{ encode }}
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <li><a class="dropdown-item" href="#" @click.prevent="changeEncode('utf8')">utf8</a></li>
                            <li><a class="dropdown-item" href="#" @click.prevent="changeEncode('gpk')">gpk</a></li>
                        </ul>
                        </div>
                </div>
                <div class="tips">乱码了?切换编码</div>
            </div>
            <div class="copy-btn">
                <button @click="copy" class="btn btn-primary">复制</button>
            </div>
        </div>
        <highlightjs autodetect :code="txtContent"></highlightjs>
        <!-- {{txtContent}} -->
        <MessageToast ref="messageToast"></MessageToast>
        <Loadding ref="loadding"></Loadding>
    </div>
</template>

<script setup lang="ts">
    import { ref,onMounted,nextTick } from 'vue'
    import useClipboard from 'vue-clipboard3'
    import MessageToast from '@/components/message/MessageToast.vue'
    import axios from 'axios';
    import Loadding from '@/components/Loadding.vue';
    // 父组件传递过来的文件链接
    const props = defineProps({
        url:{
            type:String
        }
    })

    const { toClipboard } = useClipboard()

    // const codeRef = ref()
    const txtContent = ref('加载中......')
    // 文件的编码   utf8  , gpk
    const encode = ref('utf8')
    // 文件的数据流
    const blobResult = ref()
    // console.log(props.url)
    const loadding = ref()
    // 请求后端接口，获取对应的文件的数据
    const readTxt = async () =>{
        let result = await axios({
            method:'get',
            url:props.url,
            responseType:"blob"
        })
        if(!result.data){
            return
        }
        blobResult.value = result.data
        // console.log(blobResult.value)
        splitFile(blobResult.value)
        // console.log(chunks)
        showTxt()
    }

    // 改变编码
    const changeEncode = (e:string) =>{
        encode.value = e
        currentChunk = 0
        text.value = ''
        showTxt()
    }
    
    const text = ref('')
    const text_code = ref()
    // 展示页面数据
    const showTxt = () =>{
        if(currentChunk >= chunks.length){
            return
        }
        // 大文件加载时会卡死
        nextTick(()=>{
            loadding.value.showLoadding()
        })
        const reader = new FileReader()
        reader.onload = ()=>{
            // 读取成功后，将内容复制给txtContent
            let txt = reader.result
            text.value += txt
            txtContent.value = text.value
            nextTick(()=>{
                loadding.value.closeLoadding()
            })
        }
        // console.log(blobResult.value.size)
        // File读取txt，输入blob文件流，编码
        reader.readAsText(chunks[currentChunk],encode.value)
        // console.log(text_code.value)
    }
    
    // 切割数据，按照阅读的地址加载下一个数据
    const chunksize = 4000
    let chunks:Blob[] = []  //存放分块
    let currentChunk = 0;  //当前读取到的分块索引
    function splitFile(file:Blob){
        chunks = []
        let count = Math.ceil(file.size/chunksize)
        for(let i=0;i<count;i++){
            let start = i * chunksize
            let end = Math.min(file.size,start+chunksize)
            chunks.push(file.slice(start,end))
        }
    }

    onMounted(()=>{
        readTxt()
        const mask = text_code.value.parentElement.parentElement.parentElement.parentElement
        mask.addEventListener('scroll',()=>{
            const scrollTop = mask.scrollTop;
            const scrollHeight = mask.scrollHeight;
            const clientHeight = mask.clientHeight;
            if (scrollTop + clientHeight >= scrollHeight) {
                currentChunk += 1
                showTxt()
            }
        })
    })

    // 对页面内容进行复制
    const messageToast = ref()
    const copy = async ()=>{
        await toClipboard(txtContent.value)
        // 可以提示复制成功
        messageToast.value.showToast({
            type:'success',
            message:'复制成功！'
        })
    }
</script>

<style scoped lang="scss">
    .top{
        display: flex;
        justify-content: space-between;
        padding: 10px 10px 0 10px;
    }
    .top-op{
        display: flex;
        padding:5px 10px;
        align-items: center;
        gap: 15px;
    }
    .copy-btn{
        display: flex;
        justify-content: flex-end;
        padding: 0 20px;
    }
    .code{
        pre{
            white-space:break-spaces;
        }
    }
</style>