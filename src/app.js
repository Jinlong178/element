const global = {

}
// 开发环境
const development = {
  baseURL: 'http://localhost:9201/hd', // API接口基本路径
  name: '货代客户管理平台', // 系统名称
  global,
}
// 生产环境
const production = {
  baseURL: 'http://116.228.144.178:9211/hd',
  name: '货代客户管理平台',
  global,
}

// 切换环境配置
export default {
  env: process.env.NODE_ENV === 'production' ? production : development
}
