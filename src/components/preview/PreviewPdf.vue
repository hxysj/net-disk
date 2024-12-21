<template>
    <div class="pdf">
        <vue-pdf-embed 
            ref="pdfRef" 
            :source="state.url" 
            class="vue-pdf-embed" 
            :width="850"
            :page="state.pageNum"
        ></vue-pdf-embed>
    </div>
</template>

<script setup lang="ts">
    import { ref,onMounted } from 'vue'
    import VuePdfEmbed from 'vue-pdf-embed';
    const props = defineProps({
        url:{
            type:String
        }
    })

    const pdfRef = ref()

    const state = ref({
        url:'',
        pageNum:0,
        numPages:0
    })

    const initPdf = async ()=>{
        state.value.url = props.url as string
        // state.value.url = '/public/test.pdf'
    }

    onMounted(()=>{
        initPdf()
    })
</script>

<style scoped lang="scss">
   .pdf{
        width: 100%;
   }
   :deep .vue-pdf-embed__page{
        canvas{
            width: 100% !important;
            height: auto !important;
        }
   }
</style>