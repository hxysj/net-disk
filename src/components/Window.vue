<template>
    <div class="window" v-if="show">
        <div class="window-mask modal" tabindex="-1" style="display: block;" @click="close($event)" v-if="show">        
            <div class="modal-dialog window-content"  :style="{'max-width':windowContentWidth + 'px',left:windowContentLeft + 'px'}">
                <div class="modal-content">
                    <div class="title">
                        {{title}}
                        <div class="close btn btn-close" @click="close($event)"></div>
                    </div>
                    <div class="content-body">
                        <slot></slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref,computed,onMounted,onUnmounted } from 'vue'

    const props = defineProps({
        show:{
            type:Boolean
        },
        width:{
            type:Number,
            default:1000
        },
        title:{
            type:String
        },
        align:{
            type:String,
            default:"top"
        }
    })
    // console.log(props.width)
    // 窗口宽度
    const windowWidth = ref(window.innerWidth)
    // 内容的宽度
    const windowContentWidth = computed(()=>{
        return props.width > windowWidth.value ? windowWidth.value : props.width
    })
    // 内容距离左边的位置，好像不用也行
    const windowContentLeft = computed(()=>{
        let left = windowWidth.value -( windowContentWidth.value as number)
        return left < 0 ? 0 : left /2
    })

    const emit = defineEmits(['close'])

    const close = (e:Event)=>{
        if(![...(e.target as HTMLElement).classList].includes('modal') && ![...(e.target as HTMLElement).classList].includes('close')){
            return
        }
        emit('close')
    }

    // 监听页面的宽度变化
    const resizeWindow = () =>{
        windowWidth.value = window.innerWidth
    }
    onMounted(()=>{
        window.addEventListener('resize',resizeWindow)
    })

    onUnmounted(()=>{
        window.removeEventListener('resize',resizeWindow)
    })
</script>

<style scoped lang="scss">
    .window-mask{
        background-color: rgba(0,0,0,0.4);
        z-index: 200;
        .close{
            position: absolute;
            right: 10px;
            top: 3px;
            background-color: rgba(137, 134, 134, 0.6);
            width: 15px;
            height: 15px;
            padding: 10px;
            border-radius: 50%;
            z-index: 999;
        }
        .close:hover{
            cursor: pointer;
        }
        .window-content{
            margin: 20px;
            background-color: white;
            border-radius: 5px;
            // height: calc(100vh - 50px);
            .title{
                padding: 0.5rem;
                width: 100%;
                text-align: center;
                font-size: 1rem;
                font-style: italic;
                border-bottom: 1px solid rgba(0,0,0,0.3);
                position: relative;
            }
        }
        .modal-content{
            height: 100%;
        }
    }
</style>