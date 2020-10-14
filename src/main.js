// Vue
import Vue from 'vue'
// 状态管理
import store from './config/store'
// 路由配置
import router from './config/router'
// 自定义指令
import './config/directives'
// App组件
import App from './App.vue'

// ElementUI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

// 登录滑块验证
import SliderVerificationCode from 'slider-verification-code'
import 'slider-verification-code/lib/slider-verification-code.css'
Vue.use(SliderVerificationCode)

// 工具类
import util from './config/util'
Vue.prototype.$validate = util.validate // 校验工具
Vue.prototype.$util = util

// 请求工具
import http from './config/http'
Vue.prototype.$http = http

import layer from 'vue-layer'
import 'vue-layer/lib/vue-layer.css';
Vue.prototype.$layer = layer(Vue);

// 基本样式
import './assets/base-style.less'

// 应用信息
import app from './app'

// proem framework api
import api from './config/api'
Vue.prototype.$api = api

// 自定义组件
import PmLayout from './components/PmLayout'  // 布局组件
import PmUpload from './components/PmUpload'  // 上传组件
import PmBpm from './system/bpm/components/PmBpm' // 流程布局组件

Vue.component('pm-layout', PmLayout);
Vue.component('pm-upload', PmUpload);
Vue.component('pm-bpm', PmBpm);

Vue.config.productionTip = false

// document title
window.document.title = app.env.name

//Mint UI
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
Vue.use(MintUI)

// WeUI基础样式库
import weui from 'weui.js'
import 'weui'
Vue.prototype.$weui = weui

//微信js-sdk
import wx from 'weixin-js-sdk'
Vue.prototype.$wx = wx

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
