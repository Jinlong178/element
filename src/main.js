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
//微信js-sdk
import wx from 'weixin-js-sdk'

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

// 引入echarts
import echarts from 'echarts'
Vue.prototype.$echarts = echarts

// 引入插件和语言包
import VueI18n from 'vue-i18n'
import zh from './locale/zh'
import en from './locale/en'
Vue.use(VueI18n)

//实例化vue-i18n
const i18n = new VueI18n({

  // 从本地存储中取，如果没有默认为中文，
  // 这样可以解决切换语言后，没记住选择的语言，刷新页面后还是默认的语言
  locale: localStorage.getItem('lang') || 'zh',

  messages: {
    'zh': zh, // 中文语言包
    'en': en // 英文语言包
  }
})

//Mint UI
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
Vue.use(MintUI)

// document title
window.document.title = app.env.name

// 引入微信jssdk
Vue.prototype.$wx = wx

new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
