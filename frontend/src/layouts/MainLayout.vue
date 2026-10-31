<template>
  <div class="flex h-screen bg-gray-50">
    
    <!-- 左侧菜单 -->
    <el-menu
      :default-active="activeMenu"
      class="!border-r !h-full bg-white shadow-sm transition-all duration-300"
      :class="[tabsStore.menuCollapsed ? '!w-16' : '!w-64']"
      :collapse="tabsStore.menuCollapsed"
      :collapse-transition="false"
      @select="handleMenuSelect"
    >
      <!-- Logo区域 - 折叠时只显示图标，展开时显示图标+文字 -->
      <div class="h-16 flex items-center border-b" :class="[tabsStore.menuCollapsed ? 'justify-center px-0' : 'px-4']">
        <div class="flex items-center" :class="[tabsStore.menuCollapsed ? 'flex-col' : '']">
          <el-icon :size="24" class="text-blue-600">
            <ShoppingTrolley />
          </el-icon>
          <span v-if="!tabsStore.menuCollapsed" class="ml-2 text-xl font-bold text-blue-600 truncate">商城后台</span>
        </div>
      </div>

      <!-- 菜单项 -->
      <el-menu-item index="/main/dashboard">
        <el-icon><Odometer/></el-icon>
        <template #title>
          <span class="ml-2">仪表盘</span>
        </template>
      </el-menu-item>
      
      <el-sub-menu index="/main/product">
        <template #title>
          <el-icon><Goods /></el-icon>
          <span class="ml-2">商品管理</span>
        </template>
        <el-menu-item index="/main/product/list">商品列表</el-menu-item>
        <el-menu-item index="/main/product/category">商品分类</el-menu-item>
      </el-sub-menu>
      
      <el-menu-item index="/main/order">
        <el-icon><List /></el-icon>
        <template #title>
          <span class="ml-2">订单管理</span>
        </template>
      </el-menu-item>
      
      <el-menu-item index="/main/customer">
        <el-icon><User /></el-icon>
        <template #title>
          <span class="ml-2">用户宝宝统计</span>
        </template>
      </el-menu-item>
    </el-menu>

    <!-- 右侧内容区-->
    <div 
      class="flex-1 flex flex-col overflow-hidden transition-all duration-300"      
    >
      <!-- 顶部导航 - 标题和折叠按钮放在一起 -->
      <header class="h-16 bg-white border-b flex items-center justify-between px-4">
        <div class="flex items-center space-x-3">
          <!-- 折叠按钮 - 放在标题旁边 -->
          <el-button 
            :icon="tabsStore.menuCollapsed ? Expand : Fold" 
            @click="toggleCollapse"
            circle
            size="default"
          />
          <h2 class="text-lg font-medium text-gray-700">{{ currentTitle }}</h2>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- <el-badge :value="3" class="item">
            <el-icon class="text-xl cursor-pointer"><Bell /></el-icon>
          </el-badge> -->
          <el-dropdown>
            <span class="flex items-center cursor-pointer">
              <el-avatar :size="32" src="/images/user.png" />
              <span class="ml-2 hidden sm:inline">管理员</span>
              <el-icon class="ml-1"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleMenuSelect('/main/profile')">个人中心</el-dropdown-item>
                <el-dropdown-item @click="dialogVisible = true">修改密码</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

        </div>
      </header>

      <!-- Tab 标签页区域 -->
      <div class="flex-1 overflow-hidden flex flex-col p-4">
        <el-tabs
          v-model="tabsStore.activeTab"
          type="card"
          class="flex-1 flex flex-col"
          closable
          @tab-remove="removeTab"
          @tab-click="handleTabClick"
        >
          <el-tab-pane
            v-for="item in tabsStore.tabList"
            :key="item.path"
            :label="item.title"
            :name="item.path"
            :closable="item.closable"
            lazy
          >
            <template #label>
              <span class="flex items-center">
                <el-icon :size="14" class="mr-1">
                  <component :is="getRouteIcon(item.path)" />
                </el-icon>
                {{ item.title }}
              </span>
            </template>
            
            <!-- 内容区域  这是第2层路由 也就是 main的子菜单 -->
            <div class="h-full bg-white rounded-lg p-4 overflow-auto">           
              <router-view>               
              </router-view> 
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

     <el-dialog v-model="dialogVisible" title="修改密码" width="400px" @close="resetForm">
      <!-- :rules 绑定校验规则，ref 用于提交时触发校验 -->
      <el-form 
        ref="pwdFormRef" 
        :model="pwdForm" 
        :rules="rules" 
        label-width="90px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入当前密码" />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="请输入新密码(不少于6位)" />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">确认修改</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed, reactive  } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { 
  ArrowDown, 
  Bell, 
  Fold, 
  Expand,
  Odometer,
  Goods,
  Collection,
  List,
  User,
  Document,
  ShoppingTrolley
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import UserAPI from '@/api/user' // 引入刚写的接口

const router = useRouter()
const dialogVisible = ref(false)
const loading = ref(false)
const pwdFormRef = ref(null)
const route = useRoute()
const tabsStore = useTabsStore()

// 表单数据
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

//  自定义校验规则函数 
// 这个函数专门用来检查“确认密码”和“新密码”是不是一模一样
const validateConfirmPwd = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入的密码不一致！'))
  } else {
    callback() // 校验通过
  }
}

// Element Plus 的 rules 校验规则配置
const rules = reactive({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPwd, trigger: 'blur' } // 使用上面的自定义函数
  ]
})

// 提交表单
const submitForm = async () => {
  if (!pwdFormRef.value) return
  
  // 1. 先让 Element Plus 跑一遍前端格式校验
  await pwdFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      // 2. 获取当前登录用户的 ID 
      // (通常你登录成功后会把它存在 localStorage 里)
      const currentUserId = localStorage.getItem('userId') || 1 // 这里请换成你真实的获取 ID 的方式
      
      const payload = {
        userId: currentUserId,
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword
      }

      // 3. 发送给后端
      const isSuccess = await UserAPI.changePassword(payload)
      
      loading.value = false

      if (isSuccess) {
        dialogVisible.value = false
        // 修改密码成功后的标准动作：清空登录状态，强制跳转回登录页，要求用户用新密码重新登录！
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        router.push('/login')
      }
    }
  })
}

// 弹窗关闭时，重置表单（防止下次打开还有字）
const resetForm = () => {
  if (pwdFormRef.value) {
    pwdFormRef.value.resetFields()
  }
}


// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 当前页面标题
const currentTitle = computed(() => {
  const tab = tabsStore.tabList.find(t => t.path === route.path)
  return tab?.title || '商城后台'
})

// 切换折叠状态
const toggleCollapse = () => {
  tabsStore.toggleMenuCollapse()
}

// 获取路由图标
const getRouteIcon = (path) => {
  const routeMap = {
    '/main/dashboard': 'Odometer',
    '/main/product/list': 'Goods',
    '/main/product/category': 'Collection',
    '/main/order': 'List',
    '/main/user': 'User'
  }
  return routeMap[path] || 'Document'
}

// 菜单选择处理
const handleMenuSelect = async (index) => {
  // index 现在是 '/main/dashboard' 这样的完整路径
  const routeInfo = router.getRoutes().find(r => r.path === index)
  if (routeInfo) {
    tabsStore.addTab({
      path: index,
      title: routeInfo.meta.title,
      closable: index !== '/main/dashboard'  // 
    })
    await router.push(index)
  }
}
// 移除标签页
const removeTab = async (path) => {
  tabsStore.removeTab(path)
  if (tabsStore.activeTab) {
    await router.push(tabsStore.activeTab)
  } else {
    await router.push('/main/dashboard')
  }
}

// 点击标签页
const handleTabClick = async (tab) => {
  await router.push(tab.props.name)
}

// 退出登录
const logout = async () => {
  try {
    await UserAPI.logout()
    router.push('/login')
  } catch (error) {
    // 错误已在 UserAPI 中处理
  }
}
</script>

<style scoped>
/* 菜单过渡动画 */
.el-menu:not(.el-menu--collapse) {
  width: 256px;
}

.el-menu--collapse {
  width: 64px;
}

/* 确保菜单项在折叠时正确显示 */
:deep(.el-menu--collapse .el-sub-menu__title span) {
  display: none;
}

:deep(.el-menu--collapse .el-menu-item span) {
  display: none;
}

:deep(.el-menu--collapse .el-sub-menu__title .el-icon) {
  margin: 0;
}

:deep(.el-menu--collapse .el-menu-item .el-icon) {
  margin: 0;
}

/* 标签页样式 */
:deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
  padding: 0 !important;
}

:deep(.el-tabs--card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tab-pane) {
  height: 100%;
}
</style>