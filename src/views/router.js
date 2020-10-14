export default [
  {
    path: '/views/schoolInfo/School',
    name: 'School',
    component: () => import('./schoolInfo/school/School'),
    meta: {
      requiresAuth: true
    }
  },
]
