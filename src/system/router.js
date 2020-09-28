export default [
  {
    path: '/system/dic',
    name: 'Dictionary',
    component: () => import('./dic/Dictionary'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/system/org/dept',
    name: 'Dept',
    component: () => import('./org/Dept'),
    meta: {
      requiresAuth: true
    },
  },
  {
    path: '/system/org/dept/rel/user',
    name: 'DeptRelUser',
    component: () => import('./org/DeptRelUser'),
    meta: {
      requiresAuth: true
    },
  },
  {
    path: '/system/org/user',
    name: 'User',
    component: () => import('./org/User'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/system/perm/role',
    name: 'Role',
    component: () => import('./sec/Role'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/system/perm/menu',
    name: 'Menu',
    component: () => import('./sec/Menu'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/system/perm/fn',
    name: 'Fn',
    component: () => import('./sec/Fn'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/system/perm/auth',
    name: 'Auth',
    component: () => import('./sec/Auth'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/system/bpm/process',
    name: 'ProcessList',
    component: () => import('./bpm/ProcessList'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/system/bpm/model',
    name: 'ModelList',
    component: () => import('./bpm/ModelList'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/system/bpm/todo',
    name: 'TodoList',
    component: () => import('./bpm/TodoList'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/system/bpm/ended',
    name: 'EndedlList',
    component: () => import('./bpm/EndedlList'),
    meta: {
      requiresAuth: true
    }
  },
  // 流程编辑页面
  {
    path: '/system/bpm/model/editor',
    name: 'BpmnEditor',
    component: () => import('./bpm/BpmnEditor')
  },
  {
    path: '/system/bpm/model/viewer',
    name: 'BpmnViewer',
    component: () => import('./bpm/BpmnViewer')
  },
  // 流程代理设置页面
  {
    path: '/system/bpm/proxy',
    name: 'ProcessProxy',
    component: () => import('./bpm/proxy/ProcessProxy')
  },

  // 用户信息页面
  {
    path: '/user-profile',
    name: 'UserProfile',
    component: () => import('./UserProfile')
  },
]
