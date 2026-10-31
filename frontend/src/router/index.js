import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login',    
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/login.vue'),
    meta: { title: '登录', icon: 'user', requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/user/register.vue'),
    meta: { title: '注册', icon: 'user', requiresAuth: false },
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/main/dashboard', // 默认重定向到仪表盘
    children: [ 
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer', requiresAuth: true },
      },  
      {
        path: 'product/list',
        name: 'ProductList',
        component: () => import('@/views/product/index.vue'),
        meta: { title: '商品列表', icon: 'Goods', requiresAuth: true }
      },
      {
        path: 'product/category',
        name: 'ProductCategory',
        component: () => import('@/views/product/category.vue'),
        meta: { title: '商品分类', icon: 'Collection', requiresAuth: true  }
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/order/index.vue'),
        meta: { title: '订单管理', icon: 'List' , requiresAuth: true }
      },
      {
        path: 'customer',
        name: 'CustomerAnalysis',
        component: () => import('@/views/customer/analysis.vue'), 
        meta: { title: '客户画像分析', icon: 'DataAnalysis', requiresAuth: true }
      },

      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/user/profile.vue'),
        meta: { title: '个人中心', icon: 'UserFilled', requiresAuth: true }
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ================== 全局路由守卫 ==================
router.beforeEach((to, from) => {
  const isLoggedIn = !!localStorage.getItem('userId')
  
  // 1. 如果你去的是登录/注册页，且你已经登录了，直接踢回主页仪表盘 (防止重复登录)
  if ((to.path === '/login' || to.path === '/register') && isLoggedIn) {
    // 以前写 next('/main')，现在直接 return 字符串！
    return '/main'
  }

  // 2. 如果页面不需要登录，直接放行
  if (!to.meta.requiresAuth) {    
    // 以前写 next()，现在直接 return true（或者不写 return，默认就是放行）
    return true
  }  

  // 3. 如果你去的是必须登录的页面，但你没登录
  if (!isLoggedIn) {    
    // 踢回登录页
    return '/login' 
  }  

  // 4. 其他正常情况，直接放行
  return true
})

export default router