import http from './http'

/**
 * 跳转错误页面
 * @param _this Vue对象（this）
 */
const error = (_this) => {
  _this.$router.replace({
    path: '/error'
  })
}

/**
 * 数据字典相关API
 */
const dictionary = {
  /**
   * 根据字典KEY，获取该字典的子级字典数据，只获取直接下一级的数据字典
   * @param key 字典KEY
   * @param callback  回调，参数为 子级数据列表
   */
  getList(key = null, callback = null) {
    http.get('/api/dic/getChildren/' + key).then(resp => {
      if (resp.success) {
        if (callback) callback(resp.data)
      } else {
        this.$message.error('字典数据获取失败')
      }
    }).catch(() => {
      this.$message.error('字典数据获取失败')
    })
  },
}

export default {
  dictionary,
  error,
}
