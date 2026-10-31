<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      <!-- 添加装饰元素 -->
      <div class="absolute top-20 right-20 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
      <div class="absolute bottom-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-1000"></div>
    </div>
    <div class="relative w-full max-w-md">
      <el-card class="border-0 shadow-2xl backdrop-blur-lg bg-white/95 rounded-3xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
        <h2 class="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">账号注册</h2>
        
        <el-form :model="formData" :rules="formRules" ref="formRef">
          <el-form-item prop="yong_hu_ming">
            用户名<el-input v-model="formData.yong_hu_ming" placeholder="请输入你的昵称" />
          </el-form-item>
          <el-form-item prop="email">
            邮箱<el-input v-model="formData.email" placeholder="请输入你的邮箱" />
          </el-form-item>

          <el-form-item prop="password">
            密码<el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            确认密码<el-input v-model="formData.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
          </el-form-item>

          <el-button 
            type="primary" 
            class="w-full mt-6 !bg-gradient-to-r !from-indigo-600 !to-cyan-600 border-0 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-xl font-semibold text-lg py-3"
            :loading="loading" 
            @click="handleRegister"
          >
            注 册
          </el-button>

          <div class="text-center mt-8">
            <span class="text-gray-600 text-sm">已有账号？</span>
            <el-link type="primary" underline="never" class="ml-2 text-indigo-600 hover:text-cyan-600 font-medium" @click="router.push('/login')">立即登录</el-link>
          </div>
        </el-form>
      </el-card>
    </div>

    <!-- 用户信息确认对话框 -->
    <el-dialog v-model="dialogVisible" title="注册成功" width="400px" :close-on-click-modal="false">
      <div class="text-center">
        <p class="mb-4">请确认您的注册信息：</p>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p><strong>昵称：</strong>{{ userInfo.yong_hu_ming }}</p>
          <p><strong>账号：</strong>{{ userInfo.account }}</p>
          <p><strong>邮箱：</strong>{{ userInfo.email }}</p>
          <p><strong>密码：</strong>{{ userInfo.password }}</p>
        </div>
        <p class="mt-4 text-sm text-gray-600">请记住您的账号和密码，用于登录。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmUserInfo" type="primary">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import UserAPI from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const dialogVisible = ref(false)
const userInfo = reactive({
  yong_hu_ming: '',
  account: '',
  email: '',
  password: ''
})

// 表单数据
const formData = reactive({
  yong_hu_ming: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const formRules = {
  yong_hu_ming: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== formData.password) {
          return new Error('两次输入的密码不一致')
        }
        return true
      },
      trigger: 'blur'
    }
  ]
}

// 提交注册
const handleRegister = async () => {
  // 1. 校验表单是否填写完整
  if (!formRef.value) return
  await formRef.value.validate()

  try {
    loading.value = true

    // 2. 自动生成账号（前端生成，后端保存）
    const generatedAccount = `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`

    // 3. 调用注册 API（同时传邮箱和账号）
    const payload = {
      yong_hu_ming: formData.yong_hu_ming,
      email: formData.email,
      username: generatedAccount,
      password: formData.password
    }
    let res = await UserAPI.register(payload)

    // 4. 判断结果
    if (res.code === 200) {
      // 设置用户信息
      userInfo.yong_hu_ming = formData.yong_hu_ming
      userInfo.account = generatedAccount
      userInfo.email = formData.email
      userInfo.password = formData.password
      dialogVisible.value = true
    } else {
      ElMessage.error(res.message || '注册失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 确认用户信息
const confirmUserInfo = () => {
  dialogVisible.value = false
  ElMessage.success('注册成功！请使用账号或邮箱登录。')
  router.push('/login')
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

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* 自定义输入框样式 */
:deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.el-input__inner) {
  height: 48px;
  font-size: 16px;
}

/* 自定义卡片样式 */
:deep(.el-card) {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.95);
  border: none;
}
</style>