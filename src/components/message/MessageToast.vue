<template>
    <div ref="toastContainer"  class="toast-container position-fixed top-0 end-0 p-3">
        
    </div>
</template>

<script setup lang="ts">
    import * as bootstrap from 'bootstrap'
    import { ref } from 'vue'
     // -------------------------------------------------------------------------
    // 消息弹窗
    const toastContainer = ref()
    // 展示消息弹窗 
    const showToast = (obj:{type:string,message:string}) =>{
        const toastEl = document.createElement('div');
        toastEl.className = 'toast';
        toastEl.role = 'alert';
        toastEl.ariaLive = 'assertive';
        toastEl.ariaAtomic = 'true';
        if(obj.type === 'success'){
            toastEl.classList.add('bg-primary')
        }else if(obj.type === 'error'){
            toastEl.classList.add('bg-danger')
        }else{
            toastEl.classList.add('bg-waring')
        }
        toastEl.classList.add('text-white')
        // Create Toast content
        toastEl.innerHTML = `
            <div class="toast-body">
            ${obj.message}
            </div>
        `;
        toastContainer.value.appendChild(toastEl)
        const toast = new bootstrap.Toast(toastEl);
        toast.show();

        // Automatically hide the Toast after 3 seconds
        setTimeout(() => {
            toast.hide();
            // Remove the Toast element from the DOM
            toastEl.remove();
        }, 3000);
    }
    defineExpose({showToast})
</script>

<style>

</style>