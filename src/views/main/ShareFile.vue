<template>
    <div class="modal" style="display: block;" tabindex="-1" v-if="isShow">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">分享</div>
                    <button class="btn btn-close" @click="closeShareFile"></button>
                </div>
                <div class="modal-body">
                    <div class="body-item">
                        <div class="item-label">
                            文件
                        </div>
                        <div class="item-right">
                            {{ fileInfo.fileName }}
                        </div>
                    </div>
                    <template v-if="!isShareSuccess">
                         <div class="body-item">
                            <div class="item-label">
                                有效期
                            </div>
                            <div class="item-right">
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="inlineRadioTime"  v-model="form.shareTime" value="0">
                                    <label class="form-check-label" for="inlineRadio1">1天</label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="inlineRadioTime"  v-model="form.shareTime" value="1">
                                    <label class="form-check-label" for="inlineRadio2">7天</label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="inlineRadioTime"  v-model="form.shareTime" value="2">
                                    <label class="form-check-label" for="inlineRadio2">30天</label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="inlineRadioTime"  v-model="form.shareTime" value="3">
                                    <label class="form-check-label" for="inlineRadio3">永久有效</label>
                                </div>
                            </div>
                        </div>
                        <div class="body-item">
                            <div class="item-label">提取码</div>
                            <div class="item-right">
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="inlineRadioType"  v-model="form.codeType" value="myself">
                                    <label class="form-check-label" for="inlineRadio1">自定义</label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="inlineRadioType"  v-model="form.codeType" value="random">
                                    <label class="form-check-label" for="inlineRadio2">系统生成</label>
                                </div>
                            </div>
                        </div>
                        <div class="body-item" v-if="form.codeType === 'myself'">
                            <input type="text" minlength="5" placeholder="请输入5位提取码" :class="[errorMessage ? 'is-invalid':'']" v-model="form.code" class="item-input form-control">
                            <div class="invalid-feedback">
                                {{ errorMessage }}
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="body-item">
                            <div class="item-label">
                                分享链接
                            </div>
                            <div class="item-right">{{ shareUrl }}{{ resultInfo.shareId }}</div>
                        </div>
                        <div class="body-item">
                            <div class="item-label">
                                提取码
                            </div>
                            <div class="item-right">{{ resultInfo.code }}</div>
                        </div>
                        <div class="body-item">
                            <button class="copy btn btn-primary" @click="copy">复制链接及提取码</button>
                        </div>
                    </template>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn" :class="[isShareSuccess ? 'btn-primary':'btn-secondary']" @click="closeShareFile">{{ isShareSuccess ? '确定':'取消'}}</button>
                    <button type="button" class="btn btn-primary" @click="submitShare" v-if="!isShareSuccess">确定</button>
                </div>
            </div>
        </div>
        <MessageToast ref="messageToast"></MessageToast>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { dataListItem } from '../../common/common';
    import request from '../../utils/request';
    import useClipboard from 'vue-clipboard3'
    import MessageToast from '@/components/message/MessageToast.vue'
    const { toClipboard } = useClipboard()
    // 是否显示弹窗
    const isShow = ref(false)
    // 分享的文件的信息
    const fileInfo = ref()
    // 是否分享成功了
    const isShareSuccess = ref(false)    
    // 打开弹窗
    const openShareFile = (file:dataListItem) =>{
        isShow.value = true
        // resultInfo.value = {}
        fileInfo.value = file
        isShareSuccess.value = false
        // console.log(fileInfo.value)
    }
    const errorMessage = ref()
    // 分享的数据
    const form = ref<{
        shareTime:number,
        codeType:string,
        code?:string
    }>({
        shareTime:1,
        codeType:'myself'
    })

    defineExpose({openShareFile})
    // ---------------------------------------------------------
    // 关闭弹窗
    const closeShareFile = () =>{
        isShow.value = false
    }

    const api = {
        shareFile:'/share/shareFile'
    }
    // -----------------------------------------------------
    // 分享成功后返回的链接数据
    const resultInfo = ref({
        shareId:'2132',
        code:'sdawq'
    })
    // -------------------------------------------------------
    // 提交分享的请求
    const submitShare =async ()=>{
        // console.log(form.value)
        let params:{
            fileId:string,
            validType:number,
            code?:string
        } = {
            fileId:fileInfo.value.fileId,
            validType:form.value.shareTime
        }
        if(form.value.codeType === 'myself'){
            if(!form.value.code || form.value.code.length != 5){
                errorMessage.value = '请输入五位提取码!'
                return
            }
        }
        if(form.value.code && form.value.codeType === 'myself'){
            params.code = form.value.code
        }
        Object.assign(params,form.value)
        let result = await request({
            method:'GET',
            url:api.shareFile,
            params:params
        })
        if(!result.data){
            return
        }
        isShareSuccess.value = true
        resultInfo.value = result.data
        // isShareSuccess.value = true
    }
    // ----------------------------------------------------------
    // 复制链接及提取码
     // 获取分享的基本链接
    const messageToast = ref()
     const shareUrl = ref(document.location.origin + '/share/')
    const copy = async () =>{
        await toClipboard(`链接:${shareUrl.value}${resultInfo.value.shareId} 提取码:${resultInfo.value.code}`)
        messageToast.value.showToast({
            type:'success',
            message:'复制成功'
        })
    }
</script>

<style scoped lang="scss">
    .modal-body{
        display: flex;
        flex-direction: column;
        font-size: 14px;
        gap: 10px;
        .body-item{
            display: flex;
            gap: 25px;
            .item-label{
                width: 15%;
                text-align: right;
            }
            .item-input{
                margin-left: 20%;
                width: 50% !important;
            }
            .copy{
                margin-left:20% ;
            }
        }
    }
</style>