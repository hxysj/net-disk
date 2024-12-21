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
        <form class="modal-content needs-validated">
          <div class="modal-header">
            <h5 class="modal-title">修改密码</h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="modal-body-item">
                <div class="text">新密码</div>
                <div class="input-group flex-nowrap">
                    <span class="input-group-text iconfont icon-password" id="addon-wrapping"></span>
                    <input 
                        type="password" 
                        v-model="form.password" 
                        class="form-control" 
                        placeholder="请输入密码" 
                        aria-describedby="addon-wrapping"
                        :class="{ 'is-invalid':errors.pwd }" 
                    >
                    <div class="invalid-feedback errors-info">
                        {{ errors.pwd || '错误信息'}}
                    </div>
                </div>
            </div>
            <div class="modal-body-item">
                <div class="text">确认密码</div>
                <div class="input-group flex-nowrap">
                    <span class="input-group-text iconfont icon-password" id="addon-wrapping"></span>
                    <input 
                        v-model.trim="form.password2" 
                        type="password" 
                        class="form-control" 
                        placeholder="请再次输入密码" 
                        aria-describedby="addon-wrapping"
                        :class="{ 'is-invalid':errors.pwd2 }"    
                    >
                    <div class="invalid-feedback errors-info">
                        {{ errors.pwd2 || '错误信息'}}
                    </div>
                </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" @click="closeModal">取消</button>
            <button type="button" class="btn btn-primary" @click="submit">确定</button>
          </div>
        </form>
        <MessageToast ref="messageToast"></MessageToast>
      </div>
    </div>
  </template>
  
<script lang="ts" setup>
    import { ref } from 'vue';
    import request from '../utils/request';
    import MessageToast from '@/components/message/MessageToast.vue'
    import { useRouter } from 'vue-router'

    const router = useRouter()
    // 控制是否显示
    const visible = ref(false)

    // 打开模态框
    const showModal:()=>void = ()=>{
        visible.value = true
    }
    // 关闭模块框
    const closeModal = () =>{
        errors.value = {}
        form.value = {}
        visible.value = false
    }

    // 密码规则
    let regPassword = /^[a-zA-Z0-9|!|?|.|@|%|]{6,9}$/;
    // 绑定两个input的数据
    interface pwdForm{
        password?:string,
        password2?:string
    }
    const form = ref<pwdForm>({})
    // 进行校验
    interface errors{
        pwd?:string,
        pwd2?:string
    }
    const errors = ref<errors>({})
    const validateFrom = ()=>{
        if(!form.value.password){
            errors.value.pwd = '新密码不能为空'
        }else if(!regPassword.test(form.value.password)){
            errors.value.pwd = '密码的长度为6-9位！'
        }else{
            delete errors.value.pwd
            
        }
        if(!form.value.password2){
            errors.value.pwd2 = '请确认密码'
        }else if(form.value.password !== form.value.password2){
            errors.value.pwd2 = '两次输入的密码不一致!'
        }else{
            delete errors.value.pwd2
        }
        return Object.values(errors.value).length === 0
    }

    // 绑定消息框
    const messageToast = ref()
    // 提交修改
    const submit = async ()=>{
        if(!validateFrom()){
            return
        }
        let result = await request({
            url:'/updatePassword',
            method:'POST',
            data:{
                password:form.value.password
            }
        })
        // console.log(result.data)
        if(result.data.code == 200){
            messageToast.value.showToast({
                type:'success',
                message:'修改成功！请重新登陆'
            })
            localStorage.removeItem('token')
            setTimeout(()=>{
                closeModal()
                router.push('/login')
            },1000)
        }else{
            messageToast.value.showToast({
                type:'error',
                message:'修改失败！'
            })
        }

    }
    // 向外暴露方法
    defineExpose({
        showModal
    })

   
</script>
  
<style scoped lang="scss">
    .modal-body{
        display: flex;
        flex-direction: column;
        gap: 25px;
        padding: 30px;
        .modal-body-item{
            display: flex;
            gap:10px;
            // flex-wrap: wrap;
            align-items: center;
            .text{
                font-size: 14px;
                width: 80px;
                text-align: right;
            }
            .input-group{
                flex: 1;
                position: relative;
                .errors-info{
                    position: absolute;
                    top:35px;
                    right: 0;
                    text-align: right;
                    padding: 2px;
                }
            }
        }
    }
</style>