import Vue from 'vue'
import store from './store'
import http from './http'

// 自定义指令
/**
 * 校验是否包含指定角色之一，接受 String类型和Array类型
 */
Vue.directive('any-role', (el, {value}) => {
  el.style.display = 'none'
  const roles = store.state.userDetail.roles
  if (roles == null || roles.length == 0) {
    el.remove()
    return
  }
  if (value == null || value.length == 0) {
    el.remove()
    return
  }
  // 如果值是字符串
  if ((typeof value == 'string') && value.constructor == String) {
    if (value.trim().length == 0) el.remove()
    if (roles.indexOf(value) < 0) el.remove()
    else el.style.display = 'inline-block'
  }
  // 如果是数组
  if ((typeof value == 'object') && value.constructor == Array) {
    if (value.length == 0) el.remove()
    let has = false
    for (const r of value) {
      for (const item of roles) {
        if (r === item) {
          has = true
          break
        }
      }
      if (has) break
    }
    if (!has) el.remove()
    else el.style.display = 'inline-block'
  }
  // 其他情况全部不通过
  else {
    el.remove()
  }
})


/**
 * 校验是否包含指定的所有角色，接受 String类型和Array类型
 */
Vue.directive('all-roles', (el, {value}) => {
  el.style.display = 'none'
  const roles = store.state.userDetail.roles
  if (roles == null || roles.length == 0) {
    el.remove()
    return
  }
  if (value == null || value.length == 0) {
    el.remove()
    return
  }
  // 如果值是字符串
  if ((typeof value == 'string') && value.constructor == String) {
    if (value.trim().length == 0) el.remove()
    if (roles.indexOf(value) < 0) el.remove()
    else el.style.display = 'inline-block'
  }
  // 如果是数组
  if ((typeof value == 'object') && value.constructor == Array) {
    if (value.length == 0) el.remove()
    let has = true
    for (const r of value) {
      let eq = false;
      for (const item of roles) {
        if (r === item) {
          eq = true
          break
        }
      }
      if (!eq) {
        has = false
        break
      }
    }
    if (!has) el.remove()
    else el.style.display = 'inline-block'
  }
  // 其他情况全部不通过
  else {
    el.remove()
  }
})

/**
 * 验证用户是否可以操作该功能点
 */
Vue.directive('fn', (el, {value}) => {
  el.style.display = 'none'
  if ((typeof value == 'string') && value.constructor == String) {
    http.get('/api/role/rel/fn/has/' + value).then(resp => {
      if (resp.success) {
        if (resp.data) {
          el.style.display = 'inline-block'
        } else {
          el.remove()
        }
      } else {
        el.remove()
        console.error('功能点验证失败')
      }
    }).catch(reason => {
      el.remove()
      console.error('功能点验证失败')
    })
  }
  // 其他情况全部不通过
  else {
    el.remove()
  }
})

/**
 * 验证用户是否可以操作该功能点
 */
Vue.directive('fn-block', (el, {value}) => {
  el.style.display = 'none'
  if ((typeof value == 'string') && value.constructor == String) {
    http.get('/api/role/rel/fn/has/' + value).then(resp => {
      if (resp.success) {
        if (resp.data) {
          el.style.display = 'block'
        } else {
          el.remove()
        }
      } else {
        el.remove()
        console.error('功能点验证失败')
      }
    }).catch(reason => {
      el.remove()
      console.error('功能点验证失败')
    })
  }
  // 其他情况全部不通过
  else {
    el.remove()
  }
})

