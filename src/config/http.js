// Ajax请求工具
import Axios from 'axios'
// 引入qs模块，用来序列化post类型的数据
import QS from 'qs'
// 状态管理
import store from './store'
// 路由配置
import router from './router'
// 自定义配置信息
import app from '../app'
// ElementUI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 创建axios实例
const http = Axios.create({
  baseURL: app.env.baseURL,  // 请求地址前缀
  timeout: 60000, // 超时限制
})

// 请求拦截器
http.interceptors.request.use(
  config => {
    // 发送请求前加入token
    const token = store.state.userDetail.token
    token && (config.headers.Authorization = token)
    return config
  },
  error => {
    return Promise.error(error)
  })

// 响应拦截器
http.interceptors.response.use(
  response => {
    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
    // 否则的话抛出错误
    if (response.status === 200) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(response)
    }
  },
  error => {
    if (error.response.status) {
      console.error(error.response)
      return Promise.reject(error.response)
    }
  })

// 响应体信息处理
const responseResolve = (res, resolve) => {
  const resp = res.data
  // 需要刷新令牌，授权令牌从响应体中取出
  if (resp.token != null) {
    store.dispatch('setToken', resp.token)
  }
  delete resp.token
  if (resp.success) {
    resolve(resp) // 响应体信息
  } else {
    switch (res.data.status) {
      // 未登录
      case -401:
        ElementUI.Notification({
          title: '警告',
          message: '用户未登录，请先登录',
          type: 'warn',
          duration: 2000
        })
        router.push('/')
        break
      // 无权限
      case -402:
        ElementUI.Notification({
          title: '错误',
          message: '用户无权限',
          type: 'warn',
          duration: 2000
        })
        break
      // 认证令牌失效
      case -403:
        ElementUI.Notification({
          title: '错误',
          message: '授权令牌已经失效，请重新登录',
          type: 'error',
          duration: 2000
        })
        router.replace('/')
        break
      // 账号被冻结
      case -405:
        router.replace('/freeze')
        break
      // 接口已被禁用
      case -406:
        ElementUI.Notification({
          title: '错误',
          message: '接口已被禁用',
          type: 'error',
          duration: 2000
        })
        router.replace('/error')
        break
      // 服务端认证令牌构建时发生错误
      case -407:
        ElementUI.Notification({
          title: '错误',
          message: '服务器构建授权令牌时发生错误，请重新登录',
          type: 'error',
          duration: 2000
        })
        router.replace('/')
        break
      default:
        console.error(res.data.message)
        resolve(resp)
        break
    }
  }
}

export default {
  get(url, params) {
    return new Promise((resolve, reject) => {
      http.get(url, {
        params: params,
      }).then(res => {
        responseResolve(res, resolve)
      }).catch(err => {
        reject(err.data)
      })
    })
  },
  post(url, params) {
    return new Promise((resolve, reject) => {
      http.post(url, QS.stringify(params), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
      }).then(res => {
        responseResolve(res, resolve)
      }).catch(err => {
        reject(err.data)
      })
    })
  },
  postJson(url, params) {
    return new Promise((resolve, reject) => {
      http.post(url, params, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => {
        responseResolve(res, resolve)
      }).catch(err => {
        reject(err.data)
      })
    })
  },
}
