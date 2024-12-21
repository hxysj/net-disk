<template>
    <div :style="{'width':width+'px','height':width+'px'}" class="icon-img">
        <img :src="getImage()" :stlye="{'object-fit':fit}" alt="">
    </div>
</template>

<script setup lang="ts">
    import { defineProps,getCurrentInstance } from 'vue'

    const baseurl = getCurrentInstance()?.appContext.config.globalProperties.$baseurl
    
    type FileType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    const props = defineProps({
        fileType:{
            type:Number,
            default:0
        },
        iconName:{
            type:String
        },
        cover:{
            type:String
        },
        width:{
            type:Number,
            default:32
        },
        fit:{
            type:String,
            default:"cover"
        }
    })
    const fileTypeMap={
        0:{desc:"目录",icon:"folder"},
        1:{desc:"视频",icon:"video"},
        2:{desc:"音频",icon:"music"},
        3:{desc:"图片",icon:"image"},
        4:{desc:"exe",icon:"pdf"},
        5:{desc:"word",icon:"word"},
        6:{desc:"excel",icon:"excel"},
        7:{desc:"纯文本",icon:"txt"},
        8:{desc:"程序",icon:"code"},
        9:{desc:"压缩包",icon:"zip"},
        10:{desc:"其他文件",icon:"others"},
    }

    const getImage = () =>{
        if(props.cover){
            return baseurl+ props.cover
        }
        let icon = "unkonw_icon"
        // 上传文件的时候没有文件类型
        if(props.iconName){
            icon = props.iconName
        }else{
            // 得知文件类型的图标
            const iconMap = fileTypeMap[props.fileType as FileType]
            if(iconMap !== undefined){
                icon = iconMap['icon']
            }
        }
        return new URL(`/src/assets/icon-image/${icon}.png`,import.meta.url).href
    }
</script>

<style scoped lang="scss">
    .icon-img{
        img{
            width: 100%;
            height: 100%;
        }
    }
</style>