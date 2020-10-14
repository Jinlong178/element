import Vue from 'vue'
import Vuex from 'vuex'
// 持久化
import createPersistedState from 'vuex-persistedstate'

// 使用Vuex
Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState({
    storage: window.localStorage,
  })],
  state: {
    userDetail: {
      id: null,
      name: null,
      authorized: false,
      roles: null,
      token: null,
    },
    wxInfo:{
      openid:null
    },
    rememberPassword: {
      remember: false,
      username: null,
      password: null,
    },
    mainHeight: 'calc(100vh - 60px)'
  },
  // 类似于Vue的computed
  getters: {
    getUserInfo (state) {
      return state
    },
  },
  mutations: {
    setUserDetail (state, data) {
      state.userDetail = {
        id: data.id,
        name: data.name,
        authorized: data.authorized,
        roles: data.roles,
        token: data.token,
      }
    },
    setRememberPassword (state, data) {
      if (data.remember) {
        state.rememberPassword = data
      } else {
        state.rememberPassword = {
          remember: false,
          username: null,
          password: null,
        }
      }
    },
    setToken (state, data) {
      state.userDetail.token = data
    },
    cleanUserDetail (state) {
      state.userDetail = {
        id: null,
        name: null,
        authorized: false,
        roles: null,
        token: null,
      }
    },
    setMainHeight (state, data) {
      state.mainHeight = data
    },
    setOpenId (state, data) {
      state.wxInfo.openid = data
    },
  },
  // 类似于Vue的methods
  actions: {
    setUserDetail (context, data) {
      context.commit('setUserDetail', data)
    },
    setRememberPassword (context, data) {
      context.commit('setRememberPassword', data)
    },
    setToken (context, data) {
      context.commit('setToken', data)
    },
    cleanUserDetail (context) {
      context.commit('cleanUserDetail')
    },
    setMainHeight (context, data) {
      context.commit('setMainHeight', data)
    },
    setOpenId (context, data) {
      context.commit('setOpenId', data)
    },
  }
})
