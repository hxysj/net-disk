import axios from 'axios'
import { useCookies } from 'vue3-cookies';

const { cookies } = useCookies()

// console.log(import.meta.env.VITE_API_BASE_URL)

const request = axios.create({
    baseURL:import.meta.env.VITE_API_BASE_URL,
    timeout:10000,
    withCredentials: true
})

// 请求拦截器
// 判断请求是否为登陆或注册，不是则需要携带token进行请求
request.interceptors.request.use(async (config)=>{
    const { method } = config;
    if (method === 'post' || method === 'put' || method === 'delete') {
        const csrfToken = cookies.get('csrftoken');
        // console.log(cookies.get('csrftoken'))
        config.headers['X-CSRFToken'] = csrfToken
    }
    if(config.url?.includes('/login') || config.url?.includes('/register')){
        return config
    }else{
        const token = localStorage.getItem('token')
        if(token){
            config.headers['Authorization'] = token
        }
        return config
    }
},error=>{
    return Promise.reject(error)
})

request.interceptors.response.use((response)=>{
    return response
},function(error){
    // console.log(error)
    if(error.response && error.response.status === 401){
        alert('登陆失效，请重新登陆！')
        localStorage.removeItem('token')
        setTimeout(()=>{
            location.href = '/login'
        },1500)
    }
    return Promise.reject(error)
})


export default request