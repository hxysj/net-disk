<template>
    <div class="table-body">
        <table class="table contrainer table-hover"  v-if="(newList && newList.length > 0) || createNewFolder">
            <thead>
                <tr>
                    <th style="width: 15px;">
                        <input type="checkbox" :checked="allCheck" @click="changeCheckAll">
                    </th>
                    <th v-for="col,index in columns" :key="index" :style="{'width':col.width?col.width+'px':''}">
                        {{ col.label }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <slot name="tableBody"></slot>    
            </tbody>
        </table>
        <slot name="notData" v-else>
            
        </slot>
        <div class="page-navigation" v-if="newList && newList.length > 0">
            <!-- :pageTotal="tableData.pageTotal" -->
            <!-- :pageNo="tableData.pageNo" -->
            <Pagination 
                :pageTotal="tableData?.pageTotal" 
                :pageNo="tableData?.pageNo"
                @changeNum="paginationChange"
                v-if="tableData && tableData.pageTotal > 1"
            ></Pagination>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, PropType } from 'vue'
    import { dataListItem, mianResponseData,userItem, recycleItem, recycleResponseData, shareListItem, shareResponseData, userResponseData,fileListItem } from '../common/common';
    import Pagination from '@/components/Pagination.vue';
    interface columnItem{
        label:string,
        prop:string,
        scopedSlots?:string,
        width?:number
    }

    // const props = defineProps<{
    //     // 表格的列
    //     columns:columnItem[],
    //     // 获得的数据，有pageNo是否展示页码，pageSize第几页，list要展示的数据
    //     tableData:mianResponseData | recycleResponseData | shareResponseData | userResponseData,
    //     // 初始化数据用的
    //     fetch:Function,
    //     // 是否初始化数据
    //     initFecth:Boolean,
    //     // 是否新建文件夹
    //     createNewFolder:Boolean,
    //     // 是否为管理员
    //     admin:Boolean
    // }>({
    //     columns:{
    //         default:()=>[]
    //     },
    //     admin:{
    //         default:()=>false
    //     }
    // })

    const props = defineProps({
        columns: {
            type: Array as PropType<columnItem[]>,
            default:()=>[]
        },
        tableData: {
            type: Object as PropType<mianResponseData | recycleResponseData | shareResponseData | userResponseData>,
            default:()=>{}
        },
        fetch: {
            type: Function as PropType<() => void>,
            default: () => () => {} // 默认为空函数
        },
        initFecth: {
            type: Boolean,
            default:()=>false
        },
        createNewFolder: {
            type: Boolean,
            default: () => false // 默认为 false
        },
        admin:{
            type:Boolean,
            default:()=>false
        },
        share:{
            type:Boolean,
            default:()=>false
        }
    });

    // const newList = ref<dataListItem[]>([])
    // 隐患： 当newList改变的时候 props。dataList不会改变 dataList改变的时候 newList也不会改变
    // newList.value = props.dataList
    // 使用computed计算属性，让newList自动获取props.dataList的值
    const newList = computed<dataListItem[] | shareListItem[] | recycleItem[] | fileListItem[] | userItem[]>(()=>props.tableData.list)
    // console.log(newList.value)
    // console.log(props.initFecth)
    // 判断是否需要初始化数据
    if(props.initFecth){
        props.fetch()
    }

    // -------------------------------------------------------
    // 确定修改文件名,默认不是新建的目录
    // 通过isnewDir确定是否为新建目录，如果是新建目录则发送新建目录的请求，并要求父组件刷新数据，否则修改data.fileId对于的name
    const emit = defineEmits([
        'selectDataList','changePageSize'
    ])
    // -------------------------------------------table------------------------------------------
    // ---------------------------------------------------------------
    // 全选或者全不选,将选中的数据回传给父组件
    const allCheck = computed(()=>{
        let selectList
        if(props.admin){
            selectList = newList.value.filter((item):item is fileListItem=>item.isCheck as boolean).map(item=>{return {file_id:item.fileId,user_id:item.userId}})
        }else if(props.share){
            selectList = newList.value.filter((item):item is shareListItem=>item.isCheck as boolean).map(item=>item.shareId)
        }else{
            selectList = newList.value.filter((item):item is dataListItem | shareListItem | recycleItem | fileListItem=>item.isCheck as boolean).map(item=>item.fileId)
        }
        // 传回整个list
        // console.log(selectList)
        emit('selectDataList',selectList)
        return newList.value.every(item=>item.isCheck) && newList.value.length > 0
    })
    const changeCheckAll:()=>void = () =>{
        if(allCheck.value){
            newList.value.map(item=>item.isCheck = false)
        }else{
            newList.value.map(item=>item.isCheck = true)
        }
    }
    // ------------------------------------------------------------------------------
    // 页码发生变化
    const paginationChange = (num:number) =>{
        // console.log(num)
        emit('changePageSize',num)
    }
    
</script>

<style scoped lang="scss">
    .table-body{
        padding: 10px;
        font-size: 14px;
        height: 100%;
        width: 100%;
        td,th{
            // text-align: center;
            vertical-align: middle;
        }
        .page-navigation{
            width: 100%;
            display: flex;
            justify-content: flex-end;
            padding: 0 20px;
        }
    }
</style>