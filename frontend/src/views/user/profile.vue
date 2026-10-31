<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">个人中心</h1>
    
    <el-card class="mb-6">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>
      <div class="space-y-4">
        <div class="flex items-center">
          <label class="w-20">用户名：</label>
          <span>{{ userInfo.yong_hu_ming }}</span>
        </div>
        <div class="flex items-center">
          <label class="w-20">账号：</label>
          <span>{{ userInfo.zhang_hao }}</span>
        </div>
        <div class="flex items-center">
          <label class="w-20">邮箱：</label>
          <span>{{ userInfo.you_xiang  }}</span>
        </div>
        <div class="flex items-center">
          <label class="w-20">注册时间：</label>
          <span>{{ userInfo.createdAt  }}</span>
        </div>
      </div>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作</span>
        </div>
      </template>
      <div class="space-y-4">
        <el-button type="primary" @click="changePassword">注销账号</el-button>
        <el-button type="info" @click="editProfile">编辑信息</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import UserAPI from '@/api/user'

const userInfo = ref({})

// 获取用户信息
const getUserInfo = async () => {
  try {
    const id = localStorage.getItem('userId')
    const data = await UserAPI.getUser(id)
    
    if (data) {
      userInfo.value = data
    }
    
  } catch (error) {
    console.log("获取出错", error)
  }
}

// 修改密码
const changePassword = () => {
  // 这里可以打开修改密码对话框，或跳转到修改密码页面
  ElMessage.info('修改密码功能')
}

// 编辑信息
const editProfile = () => {
  ElMessage.info('编辑信息功能')
}

onMounted(() => {
  getUserInfo()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>