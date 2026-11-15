<template>
  <view class="login-container">
    <view class="header">
      <view class="title">欢迎来到宝贝星球</view>
      <view class="subtitle">登录探索更多母婴好物</view>
    </view>

    <view class="form-box">
     <view class="input-group">
             <text class="label">手机号</text>
             <!-- ✨ 修改了这里：v-model="form.dian_hua" -->
             <input class="input" v-model="form.dian_hua" type="number" placeholder="请输入手机号" maxlength="11" />
           </view>
           
           <view class="input-group">
             <text class="label">密码</text>
             <!-- ✨ 修改了这里：v-model="form.mi_ma" -->
             <input class="input" v-model="form.mi_ma" password placeholder="请输入密码" />
           </view>

      <view class="btn-login" @click="handleLogin">登 录</view>
      
      <view class="action-row">
        <text class="link" @click="goToRegister">没有账号？立即注册</text>
        <text class="link text-gray">忘记密码</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'
import request from '@/utils/request.js'

// ✨ 变量名与数据库字段严格对齐 ✨
const form = reactive({ dian_hua: '', mi_ma: '' })

const handleLogin = async () => {
  if (!form.dian_hua || !form.mi_ma) {
    return uni.showToast({ title: '请填写完整', icon: 'none' })
  }

  try {
    const res = await request.post('/ke_hu/login', form)
	console.log('登录原始响应:', res)
	console.log('响应数据:', res?.data)
    const body = res?.data && res.code === undefined ? res.data : res

    if (Number(body?.code) !== 200 || !body?.data?.id) {
      return uni.showToast({
        title: body?.message || '登录失败，请检查账号和密码',
        icon: 'none'
      })
    }

    uni.setStorageSync('customerId', body.data.id)
    uni.setStorageSync('customerInfo', body.data)
    uni.showToast({ title: '登录成功', icon: 'success' })

    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index',
        fail: (err) => {
          console.error('首页跳转失败', err)
          uni.showToast({ title: '登录成功，但首页跳转失败', icon: 'none' })
        }
      })
    }, 500)
  } catch (error) {
    console.error('登录请求失败', error)
    uni.showToast({ title: error?.message || '网络请求失败，请稍后重试', icon: 'none' })
  }
}

const goToRegister = () => { uni.navigateTo({ url: '/pages/register/register' }) }
</script>

<style scoped>
.login-container { padding: 40px 30px; background: #fff; height: 100vh; }
.header { margin-bottom: 50px; }
.title { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 10px; }
.subtitle { font-size: 14px; color: #999; }

.input-group { margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.label { font-size: 12px; color: #333; font-weight: bold; margin-bottom: 10px; display: block; }
.input { font-size: 16px; height: 40px; }

.btn-login { background: linear-gradient(90deg, #ff6034, #ee0a24); color: #fff; text-align: center; height: 46px; line-height: 46px; border-radius: 23px; font-size: 16px; font-weight: bold; margin-top: 40px; box-shadow: 0 4px 10px rgba(238,10,36,0.3); }

.action-row { display: flex; justify-content: space-between; margin-top: 20px; font-size: 13px; }
.link { color: #ff4d4f; }
.text-gray { color: #999; }
</style>