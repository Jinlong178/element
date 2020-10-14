import Vue from 'vue'
import Router from 'vue-router'
import adminRouters from '../system/router'
import businessRouters from '../views/router'
import store from "./store";
import app from "../app";
import Axios from 'axios'
// ElementUI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(Router)

const routerReplace = Router.prototype.replace
Router.prototype.replace = function replace(location) {
  return routerReplace.call(this, location)
}

const routerPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return routerPush.call(this, location)
}

const routes = [{
  path: '*',
  component: () => import('../errors/404')  // 404页面
},{
  path: '/error',
  component: () => import('../errors/Error')  // error页面
},{
  path: '/freeze',
  component: () => import('../errors/Freeze')  // error页面
}].concat([
  {
    path: '/',
    redirect: {
      name: 'Login',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../system/Login'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/weChat/Register'),
  },
  {
    path: '/wxIndex',
    name: 'WxIndex',
    component: () => import('../views/weChat/WxIndex'),
  },
  {
    path: '/manage',
    name: 'Manage',
    component: () => import('../views/weChat/Manage'),
  },
  {
    path: '/parentAdd',
    name: 'ParentAdd',
    component: () => import('../views/weChat/ParentAdd'),
  },
  {
    path: '/campusIndex',
    name: 'CampusIndex',
    component: () => import('../views/campuswx/index'),
  },
  {
    path: '/campus/blank',
    name: 'CampusWxBlank',
    component: () => import('../views/campuswx/blank')
  },
  {
    path: '/parents',
    name: 'Parents',
    component: () => import('../views/campuswx/parents'),
  },
  {
    path: '/addParent',
    name: 'AddParent',
    component: () => import('../views/campuswx/addParent'),
  },
  {
    path: '/teacher',
    name: 'Teacher',
    component: () => import('../views/campuswx/teacher'),
  },
  {
    path: '/jsRecord',
    name: 'JsRecord',
    component: () => import('../views/campuswx/jsRecord'),
  },
])

const mainRoutes = [].concat(n1(adminRouters, true), n1(businessRouters, true))
for (const mainRoute of mainRoutes) {
  routes.push(mainRoute)
}

// 默认，所有未明确注明 parent 的值都是 Index
routes.push({
  path: '/index',
  name: 'Index',
  component: () => import('../system/Index'),
  redirect: {
    name: 'Home', // 设置默认页面
  },
  children: [].concat([{
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home'),
    meta: {
      requiresAuth: true
    },
  }], n1(adminRouters), n1(businessRouters))
})

function n1(arr = [], scope = false) {
  const result = []
  if (arr.length > 0) {
    for (const item of arr) {
      if (item.scope == true || (scope == false && item.scope == null)) {
        result.push(item)
      }
    }
  }
  return result
}

const router = new Router({
  mode: 'history',
  routes: routes,
  base: app.env.global.projectName == null ? null : app.env.global.projectName
})

router.beforeEach((to, from, next) => {
  // 如果需要权限验证
  if (to.meta.requiresAuth) {
    const token = store.state.userDetail.token
    // 没有授权，要求登录
    if (token == null || token.length == 0) {
      router.replace('/')
    } else {
      // 校验授权是否失效
      isTokenDue(token, resp => {
        // 未失效，跳转页面
        if (resp.success) {
          // 如果即将过期，后端返回新的授权令牌
          if (resp.data != null) {
            store.dispatch('setToken', resp.data)
          }
          next()
        } else {
          ElementUI.Notification({
            title: '错误',
            message: resp.message,
            type: 'error',
            duration: 2000
          })
          router.replace('/')
        }
      })
    }
  }
  // 不需要验证授权
  else {
    next()
  }
})

/**
 * 校验授权令牌是否失效或即将过期
 * @param token
 * @param callback
 */
const isTokenDue = (token, callback) => {
  Axios.get(app.env.baseURL + '/api/security/validateToken', {
    headers: {
      Authorization: token
    }
  }).then(response => {
    callback(response.data)
  }).catch(() => {
    ElementUI.Message.error("令牌过期校验失败，请重新登录")
    router.replace('/')
  })
}


export default router
