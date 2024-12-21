<script setup lang="ts">
    import axios from 'axios'
    import { useCookies } from 'vue3-cookies';
    import { onMounted,getCurrentInstance } from 'vue'

    const { cookies } = useCookies()
    const currentInstance = getCurrentInstance()
    //获得服务器的请求基本地址
    const server_base_url = currentInstance?.appContext.app.config.globalProperties.$baseurl
    // // 获取 CSRF 令牌的函数
    async function getCsrfToken() {
        try {
            const response = await axios.get(server_base_url+'api/csrf');
            // console.log('CSRF token:', response.data.csrfToken);
            cookies.set('csrftoken',response.data.csrfToken)
            return response.data.csrfToken;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            throw error;
        }
    }

    onMounted(async ()=>{
      // console.log('这里使app.vue 的mount')
      await getCsrfToken()
    })
</script>

<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<style scoped lang="scss">

</style>
