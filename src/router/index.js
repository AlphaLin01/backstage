import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/home',
    name: 'Home',
    redirect: '/welcome',
    component: () => import('../views/Home.vue'),
    children: [
      { path: '/welcome', name: 'Welcome', component: () => import('../views/Welcome.vue') },
      { path: '/users', name: 'User', component: () => import('../Component/User/User.vue') },
      { path: '/roles', name: 'Roles', component: () => import('../Component/Powers/Roles.vue') },
      { path: '/rights', name: 'Rights', component: () => import('../Component/Powers/Rights.vue') }
    ]
  }
]

const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  // to:到那个路由
  // from:到那个路由
  // next 是一个函数 ,表示放行
  // next() 放行  next('/login') : 强制跳转login
  if (to.path === '/login') return next()

  // 获取token并判断是否有token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err)
}

export default router
