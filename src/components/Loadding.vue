<template>
    <div>
        <div class="modal loadding-all" v-if="isShow" style="display: block;" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered loadding">
                <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span class="loadding-text">加载中...</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    
    import { ref } from 'vue'
    const isShow = ref(false)
    const showLoadding = () =>{
        isShow.value = true
    }

    const closeLoadding = ()=>{
        isShow.value = false
    }

    defineExpose({showLoadding, closeLoadding})
</script>

<style scoped lang="scss">
    .loadding-all{
        background-color: rgba(0,0,0,0.5);
    }
    .loadding{
        width: 100%;
        display: flex;
        justify-content: center;
        gap: 15px;
        .loadding-text{
            color: white;
        }
    }
</style>