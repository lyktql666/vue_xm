<template>
  <view class="login-container">
    <view class="header">
      <view class="title">新用户注册</view>
    </view>

    <view class="form-box">
      <view class="input-group">
              <text class="label">手机号</text>
              <input class="input" v-model="form.dian_hua" type="number" placeholder="请输入手机号" maxlength="11" />
            </view>
      
            <view class="input-group">
              <text class="label">姓名/昵称</text>
              <input class="input" v-model="form.xing_ming" placeholder="大家怎么称呼您" />
            </view>
            
            <view class="input-group">
              <text class="label">设置密码</text>
              <input class="input" v-model="form.mi_ma" password placeholder="请输入密码(不少于6位)" />
            </view>

      <view class="btn-login" @click="handleRegister">注 册</view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'
import request from '@/utils/request.js'

// ✨ 变量名与数据库字段严格对齐 ✨
const form = reactive({ dian_hua: '', xing_ming: '', mi_ma: '' })

const handleRegister = async () => {
  if (!form.dian_hua || !form.xing_ming || !form.mi_ma) {
    return uni.showToast({ title: '请填写完整', icon: 'none' })
  }
  try {
    const res = await request.post('/ke_hu/register', form)
    if (res.code === 200) {
      uni.showToast({ title: '注册成功，请登录', icon: 'success' })
      setTimeout(() => { uni.navigateBack() }, 1000)
    }
  } catch (error) {}
}
</script>

<style scoped>
/* 样式和登录页一模一样，直接复用 */
.login-container { padding: 40px 30px; background: #fff; height: 100vh; }
.header { margin-bottom: 50px; }
.title { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 10px; }
.input-group { margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.label { font-size: 12px; color: #333; font-weight: bold; margin-bottom: 10px; display: block; }
.input { font-size: 16px; height: 40px; }
.btn-login { background: linear-gradient(90deg, #ff6034, #ee0a24); color: #fff; text-align: center; height: 46px; line-height: 46px; border-radius: 23px; font-size: 16px; font-weight: bold; margin-top: 40px; box-shadow: 0 4px 10px rgba(238,10,36,0.3); }
</style>