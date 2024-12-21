<template>
    <div class="modal" tabindex="-1" v-if="isShow"  style="display: block;">
        <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <slot name="title"></slot>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="navigation-panel">
                    <Navigation 
                        ref="navigationRef"
                        @navChange="navChange"
                        :watchPath="false"
                        ></Navigation>
                </div>
                <div class="folder-list" v-if="folderList.length > 0">
                    <div class="folder-item" v-for="item in folderList" :key="item.fileId" @click="changeFolder(item)">
                        <div class="file-img">
                            <img src="/src/assets/icon-image/folder.png" alt="">
                        </div>
                        <div class="filename">{{ item.fileName }}</div>
                    </div>
                </div>
                <div class="notOtherFolder" v-else>
                    移动到 <span class="text-primary">{{ filePid === '0'? '根目录' :( currentFolder && currentFolder.fileName) }}</span> 文件夹
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeSelectModal">取消</button>
                <button type="button" class="btn btn-primary" @click="selectFolder">
                    <slot name="saveBtnText"></slot>
                </button>
            </div>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { dataListItem } from '../common/common';
    import Navigation from '@/components/Navigation.vue';
    import request from '../utils/request';
    const api = {
        getCurrentList:'file/getCurrentList'
    }
    // 获取所有目录，临时使用固定数据代替
    // 当前所处的位置 父级id
    const filePid = ref('0')
    // 当前选择的文件
    const currentFileIds = ref<string[]>([])
    // 当前目录的信息
    const currentFolder = ref<currentFolder>() 
    
    // 存放页面展示数据
    const folderList = ref<dataListItem[]>([])
    const loadAllFolder = async ()=>{
        let result = await request({
            method:'POST',
            url:api.getCurrentList,
            data:{
                filePid:filePid.value,
                currentFileIds:currentFileIds.value
            }
        })
        if(result.data.code !== 200){
            return
        }
        folderList.value = result.data.data
    }

    const isShow = ref(false)

    // 显示选中目录的弹窗
    // curfileIds 当前选中的文件的id
    const showSelectModal:(curfileIds:string[])=>void = (curfileIds)=>{
        // console.log(curfileIds)
        filePid.value = '0'
        isShow.value = true
        currentFileIds.value = curfileIds
        // 获取数据
        loadAllFolder()
    }

    // 关闭弹窗
    const closeSelectModal = ()=>{
        // console.log(111)
        isShow.value = false
    }
    // 将显示弹窗的方法暴露出去
    defineExpose({showSelectModal,closeSelectModal})
    // -----------------------------------------------
    
    const navigationRef = ref()
    // 切换目录
    const changeFolder:(file:dataListItem)=>void = (file)=>{
       navigationRef.value.openFolder(file)
    }

    // ---------------------------------------------------
    interface currentFolder{
        fileId:string,
        fileName:string
    }
    // 导航发生变化,导航改变回调
    interface navBackData{
        categoryId:string,
        curFolder:currentFolder
    }
    const navChange:(data:navBackData)=>void = (data)=>{
        const { curFolder } = data
        currentFolder.value = curFolder
        filePid.value = curFolder.fileId
        loadAllFolder()
    }
    // --------------------------------------------------
    const emit = defineEmits(['selectFolder'])
    // 确定选中目录
    const selectFolder = () =>{
        // 告诉父组件选择完毕，进行确定更改
        emit('selectFolder',{
            pid:filePid.value,
            list:currentFileIds.value
        })
    }

</script>

<style scoped lang="scss">
    .modal-body{
        padding: 10px;
        .navigation-panel{
            background-color: rgba(0,0,0,0.1);
            padding: 10px;
            font-size: 14px;
        }
        .notOtherFolder{
            min-height: 200px;
            display: flex;
            gap:10px;
            align-items: center;
            justify-content: center;
        }
        .folder-list{
            width: 100%;
            height: 200px;
            overflow-y:scroll;
            .folder-item{
                padding: 5px;
                display: flex;
                gap: 10px;
                align-items: center;
                .file-img{
                    width: 40px;
                    height: 40px;
                    img{
                        width: 100%;
                        height: 100%;
                    }
                }
            }
            .folder-item:hover{
                background-color: rgba(0,0,0,0.05);
                cursor: pointer;
            }
        }
    }
</style>