const global = {
  projectName: null,  // 项目名称
}
// 开发环境
const development = {
  baseURL: 'http://localhost:9201', // API接口基本路径
  name: '智慧校园管理系统', // 系统名称
  global,
}
// 生产环境
const production = {
  baseURL: 'http://www.proem.cn:9219',
  name: '智慧校园管理系统',
  global,
}

// 切换环境配置
export default {
  env: process.env.NODE_ENV === 'production' ? production : development
}
