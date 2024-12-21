<template>
    <div
      class="modal"
      :style="{'display':visible?'block':'none'}"
      tabindex="-1"
      aria-modal="true"
      role="dialog"
      @click.self="closeModal"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">修改头像</h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="modal-body-item">
                <div class="text">昵称</div>
                <div>{{formData.nickName}}</div>
            </div>
            <div class="modal-body-item">
                <div class="text">头像</div>
                <div>
                    <img :src="formData.imageUrl" class="img-thumbnail" alt="...">
                </div>
                <div class="custom-image-upload">
                    <button class="btn btn-primary">选择图片</button>
                    <input type="file" id="imageInput" @change="handleFileChange" accept="image/*" >
                </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" @click="closeModal">取消</button>
            <button type="button" class="btn btn-primary" @click="submit">确定</button>
          </div>
        </div>
      </div>
      <MessageToast ref="messageToast"></MessageToast>
    </div>
  </template>
  
<script lang="ts" setup>
    import { ref } from 'vue';
    import request from '../utils/request'
    import MessageToast from '@/components/message/MessageToast.vue';
    // 控制是否显示
    const visible = ref(false)
    
    interface formDataType{
        nickName?:string,
        imageUrl?:string
    }
    const formData = ref<formDataType>({})

    // 打开模态框
    const showModal:(data:formDataType)=>void = (data)=>{
        // console.log(data)
        formData.value = data
        visible.value = true
    }
    // 关闭模块框
    const closeModal = () =>{
        imgData = null
        formData.value = {}
        visible.value = false
    }
    // 存放要上传的图片的信息
    let imgData:(File | null) = null


    // 绑定消息框
    const messageToast = ref()

    const emit = defineEmits(['updateAvatar'])
    // 提交修改
    const submit = async ()=>{
        if(imgData){
            // 提交修改后的图片到服务器
            const formData = new FormData();
            formData.append('image', imgData);
            let result
            try {
                result = await request.post('/updateAvatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
                });
                // console.log('Upload successful:', response.data);
            } catch (error) {
                console.error('Upload failed:', error);
                return
            }
            // 上传成功后，获取新的token
            localStorage.setItem('token',result?.data.data.token)
            // 上传成功后删除原来的cookie，重新设置
            // 通知父组件cookie发生变化
            emit('updateAvatar')
            messageToast.value.showToast({
                type:'success',
                message:'修改成功！'
            })
        }
        setTimeout(()=>{
            closeModal()
        },1000)
    }
    // 向外暴露方法
    defineExpose({
        showModal
    })

    // 选择图片
    const handleFileChange:(event:Event)=>void = (event) =>{
        const target = event.target as HTMLInputElement
        const file = (target.files && target.files[0])
        // console.log(file)
        imgData = file
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string
                formData.value.imageUrl = result;
            }
            reader.readAsDataURL(file);
        }
    }
</script>
  
<style scoped lang="scss">
    .modal-body{
        display: flex;
        flex-direction: column;
        gap: 20px;
        .modal-body-item{
            display: flex;
            gap:10px;
            flex-wrap: wrap;
            align-items: center;
            img{
                width: 150px;
                height: 150px;
            }
            .text{
                font-size: 14px;
                color:#06a7ff;
            }
            .custom-image-upload{
                position: relative;
                width: 90px;
                height: 40px;
                .btn{
                    width: 100%;
                    height: 100%;
                }
                #imageInput{
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                }

            }
        }
    }
    .modal-body :first-child{
        padding-right: 10px;

    }
</style>