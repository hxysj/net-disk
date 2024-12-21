<template>
    <div class="share">
        <div class="share-body">
            <div class="logo">
                <span class="iconfont icon-pan"></span>
                个人网盘
            </div>
            <div class="card">
                <div class="card-header">
                    <div class="header-img">
                        <img :src="baseurl+(shareInfo.avatar ? shareInfo.avatar : 'media/avatar/default.png') " alt="">
                    </div>
                    <div class="header-right">
                        <div class="right-item">
                            <div class="nickName">{{shareInfo.nickName}}</div>
                            <div class="sharetime">分享于 {{ shareInfo.shareTime.split('.')[0].replace('T',' ') }}</div>
                        </div>
                        <div class="sharefile">分享文件：{{ shareInfo.fileName }}</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="">
                        请输入提取码：
                    </div>
                    <div class="input-group">
                        <input type="text" class="form-control" :class="[errorMessage ? 'is-invalid':'']" v-model.trim="code" @keyup.enter="checkShare">
                        <div class="invalid-feedback">
                            {{ errorMessage }}
                        </div>
                        <button class="btn btn-primary" @click="checkShare">提取文件</button>
                    </div>
                    <messageToast ref="messageToast"></messageToast>
                </div> 
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref,getCurrentInstance } from 'vue'
    import { useRouter,useRoute } from 'vue-router'
    import request from '../../utils/request';
    import MessageToast from '@/components/message/MessageToast.vue';
    // 请求的基本连接
    const baseurl = getCurrentInstance()?.appContext.config.globalProperties.$baseurl
    const router = useRouter()
    const route = useRoute()
    
    const api = {
        getShareInfo:'/showShare/getShareInfo',
        checkShareCode:'/showShare/checkShareCode'
    }

    const shareInfo = ref({
        shareId:'',
        nickName:'',
        shareTime:'',
        avatar:'',
        fileName:''
    })

    const shareId = route.params.shareId
    const messageToast = ref()
    // 获取分享的数据
    const getShareInfo = async ()=>{
        let result
        try{
            result = await request({
                method:'GET',
                url:api.getShareInfo+'/'+shareId,
            })
        }catch(error){
            // console.log(error)
            messageToast.value.showToast({
                type:'error',
                message:'来晚啦，此分享失效了！'
            })
            setTimeout(()=>{
                router.push('/')
            },1500)
        }
        if(!result){
            return
        }
        // console.log(result.data)
        shareInfo.value =result.data
    }
    getShareInfo()

    // 绑定表单输入的提取码
    const code = ref('')

    const errorMessage = ref()
    const checkShare =async () =>{
        errorMessage.value = ''
        if(!code.value){
            errorMessage.value = '请输入提取码！'
            return
        }
        
        try{
            await request({
                method:'GET',
                url:api.checkShareCode,
                params:{
                    shareId,
                    code:code.value
                }
            })
        }catch(error){
            errorMessage.value = '提取码错误！'
            return
        }
        // const { cookies } = useCookies()
        // cookies.set('code_token',result.data.code_check,'10m')
        // console.log(result)
        messageToast.value.showToast({
            type:'success',
            message:'提取成功！'
        })
        setTimeout(()=>{
            router.push(`/share/${shareId}`)
        },1500)
    }
</script>

<style scoped lang="scss">
    .share{
        height: calc(100vh);
        width: 100%;
        background: url("../../assets/share_bg.jpg");
        display: flex;
        justify-content: center;
        align-items: center;
        .share-body{
            width: 400px;
            .logo{
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                color: rgba(64, 158, 254,1);
                font-size: 25px;
                margin-bottom: 10px;
                font-weight: bolder;
                .iconfont{
                    font-size: 32px;
                }
            }
            .card{
                .card-header{
                    background-color:rgba(64, 158, 254,1);
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    .header-img{
                        img{    
                            width: 60px;
                            height: 60px;
                            border-radius: 50%;   
                        }
                    }
                    .header-right{
                        color: white;
                        .nickName{
                            font-weight: bolder;
                        }
                        .right-item{
                            display: flex;
                            gap: 20px;
                            align-items: center;
                        }
                        .sharetime,.sharefile{
                            font-size: 12px;
                        }
                    }
                }
                .card-body{
                    padding: 30px 20px;
                }
            }
        }
    }
    .input-group{
        position: relative;
        .invalid-feedback{
            position: absolute;
            bottom: -24px;
            left: 0;
        }
    }
</style>