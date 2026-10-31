<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- 增强背景装饰 -->
    <div class="absolute inset-0">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      <!-- 添加星星装饰 -->
      <div class="absolute top-20 left-20 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
      <div class="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-1000"></div>
      <div class="absolute bottom-32 left-16 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse animation-delay-2000"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="relative w-full max-w-md">
      <!-- Logo和标题 -->
      <div class="text-center mb-8 animate-fade-in">
        <div class="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white mb-6 shadow-xl hover:scale-105 transition-transform duration-300">
          <el-icon :size="48" class="animate-bounce"><Lock /></el-icon>
        </div>
        <h2 class="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">欢迎回来</h2>
        <p class="text-gray-600 text-lg">请输入您的账号或邮箱登录系统</p>
      </div>

      <!-- 登录表单卡片 -->
      <el-card class="border-0 shadow-2xl backdrop-blur-lg bg-white/95 rounded-3xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-cyan-50/50 pointer-events-none"></div>
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-position="top"
          class="p-8 relative z-10"
          @keyup.enter="handleSubmit"
        >
          <!-- 账号输入 -->
          <el-form-item label="账号或邮箱" prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入账号/邮箱"
              :prefix-icon="User"
              size="large"
              class="custom-input"
            >
              <template #prefix>
                <el-icon class="text-gray-400"><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 密码输入 -->
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              size="large"
              show-password
              class="custom-input"
            >
              <template #prefix>
                <el-icon class="text-gray-400"><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        

          <!-- 记住密码和忘记密码 -->
          <div class="flex items-center justify-between mb-6">
            <el-checkbox v-model="rememberPassword" size="large">记住密码</el-checkbox>
            <el-link type="primary" underline="never" class="text-sm">忘记密码？</el-link>
          </div>

          <!-- 登录按钮 -->
          <el-button
            type="primary"
            size="large"
            class="w-full !bg-gradient-to-r !from-indigo-600 !to-cyan-600 border-0 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-xl font-semibold text-lg py-3"
            :loading="loading"
            @click="handleSubmit"
          >
            登 录
          </el-button>       

          <!-- 注册链接 -->
          <div class="text-center mt-8">
            <span class="text-gray-600 text-sm">还没有账号？</span>
            <el-link type="primary" underline="never" class="ml-2 text-indigo-600 hover:text-cyan-600 font-medium" @click="router.push('/register')">立即注册</el-link>
          </div>
        </el-form>
      </el-card>

      <!-- 底部信息 -->
      <div class="text-center mt-10 text-sm text-gray-500">
        © 2024 公司名称. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
// 路由实例
const router = useRouter()
import UserAPI  from '@/api/user'
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock, ChatDotRound, Platform, Message } from '@element-plus/icons-vue'

// 表单数据
const formData = reactive({
  username: '',
  password: ''
})

// 表单引用
const formRef = ref(null)
const loading = ref(false)
const rememberPassword = ref(false)

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 处理登录
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    console.log('test',formData)
    // 模拟登录请求
    //await new Promise(resolve => setTimeout(resolve, 1500))
    const payload = {
      account: formData.username,
      password: formData.password
    }
    let rtn= await UserAPI.login(payload)
    console.log('rtn',rtn)
    if (rtn.code==200){
       ElMessage.success('登录成功！')
       // 这里可以跳转到首页
        router.push('/main')
        //ElMessage.success('跳转到首页')
    } 
    
  } catch (error) {
    if (error.message) {
      ElMessage.error('登录失败：' + error.message)
    }
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
/* 自定义动画 */
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

/* 自定义输入框样式 */
:deep(.custom-input .el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

:deep(.custom-input .el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.custom-input .el-input__inner) {
  height: 48px;
  font-size: 16px;
}

/* 自定义卡片样式 */
:deep(.el-card) {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.95);
  border: none;
}

/* 自定义按钮样式 */
:deep(.el-button--primary) {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 640px) {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>