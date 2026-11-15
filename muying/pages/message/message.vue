<template>
  <view class="message-page">
    
    <!-- 自定义导航栏标题 -->
    <view class="nav-header">消息</view>

    <!-- ================= 1. 顶部三大核心互动区 ================= -->
    <view class="top-action-bar">
      <!-- 回复与@ -->
      <view class="action-item" @click="goTo('reply')">
        <view class="icon-box bg-green">
          <text class="emoji">💬</text>
          <!-- 红点提示 -->
          <view class="badge" v-if="unread.reply > 0">{{ unread.reply }}</view>
        </view>
        <text class="action-name">回复与@</text>
      </view>

      <!-- 收到喜欢 -->
      <view class="action-item" @click="goTo('like')">
        <view class="icon-box bg-pink">
          <text class="emoji">👍</text>
          <view class="badge" v-if="unread.like > 0">{{ unread.like }}</view>
        </view>
        <text class="action-name">收到喜欢</text>
      </view>

      <!-- 私聊客服 -->
      <view class="action-item" @click="goTo('chat')">
        <view class="icon-box bg-blue">
          <text class="emoji">🎧</text>
          <view class="badge" v-if="unread.chat > 0">{{ unread.chat }}</view>
        </view>
        <text class="action-name">联系客服</text>
      </view>
    </view>

    <!-- 灰色分割条 -->
    <view class="divider"></view>

    <!-- ================= 2. 系统消息列表区 ================= -->
    <scroll-view scroll-y class="msg-list">
      
      <!-- 固定的：物流通知 -->
      <view class="msg-card" @click="goTo('logistics')">
        <view class="avatar-box logi-bg">
          <text class="emoji">🚚</text>
        </view>
        <view class="msg-info">
          <view class="title-row">
            <text class="title">交易物流通知</text>
            <text class="time">刚刚</text>
          </view>
          <view class="desc">您的订单【飞鹤奶粉】已发货，正飞奔向您！</view>
        </view>
      </view>

      <!-- 固定的：系统通知 -->
      <view class="msg-card">
        <view class="avatar-box sys-bg">
          <text class="emoji">📢</text>
        </view>
        <view class="msg-info">
          <view class="title-row">
            <text class="title">系统通知</text>
            <text class="time">昨天 14:30</text>
          </view>
          <view class="desc">《宝贝星球隐私保护指引》更新提醒</view>
        </view>
      </view>

      <!-- 动态的：店铺私信/活动推送 -->
      <view class="msg-card" v-for="item in shopMessages" :key="item.id">
        <image class="avatar-img" :src="item.shop_logo" mode="aspectFill"></image>
        <view class="msg-info">
          <view class="title-row">
            <text class="title">{{ item.shop_name }}</text>
            <text class="time">{{ item.time }}</text>
          </view>
          <view class="desc">{{ item.content }}</view>
        </view>
      </view>

      <!-- 底部留白 -->
      <view class="bottom-tips">- 没有更多消息了 -</view>
    </scroll-view>

  </view>
</template>

<script setup>
import { ref } from 'vue'

// 未读消息红点数据 (后续从后端查)
const unread = ref({
  reply: 3,
  like: 12,
  chat: 0
})

// 模拟店铺发来的私信 (后续从后端查)
const shopMessages = ref([
  {
    id: 1,
    shop_name: "全棉时代官方旗舰店",
    shop_logo: "https://img.alicdn.com/imgextra/i3/O1CN01Lp1m9z1vH3w8yB8YJ_!!6000000006146-0-tps-1000-450.jpg",
    content: "[自动回复] 亲，双十一大促全场满300减50哦！",
    time: "4月30日"
  },
  {
    id: 2,
    shop_name: "好孩子母婴专营店",
    shop_logo: "https://img.alicdn.com/imgextra/i4/O1CN015i7Xo31jIq2N6i1p4_!!6000000004526-0-tps-1000-450.jpg",
    content: "您咨询的尺码目前有货的，可以放心拍下~",
    time: "3月15日"
  }
])

// 页面跳转统一处理
const goTo = (type) => {
  if (type === 'reply') {
    uni.showToast({ title: '去往回复我的列表', icon: 'none' })
  } else if (type === 'like') {
    uni.showToast({ title: '去往收到点赞列表', icon: 'none' })
  } else if (type === 'chat') {
    uni.showToast({ title: '打开客服聊天窗口', icon: 'none' })
  } else if (type === 'logistics') {
    uni.showToast({ title: '打开物流详情', icon: 'none' })
  }
}
</script>

<style scoped>
.message-page { height: 100vh; display: flex; flex-direction: column; background-color: #fff; }

.nav-header { padding: 50px 0 15px; text-align: center; font-size: 18px; font-weight: bold; color: #333; border-bottom: 1px solid #f9f9f9;}

/* 顶部三大金刚区 */
.top-action-bar { display: flex; justify-content: space-around; padding: 25px 20px; }
.action-item { display: flex; flex-direction: column; align-items: center; }

/* B站同款纯色大圆底座 */
.icon-box { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 10px; }
.bg-green { background-color: #00d28a; } /* 回复绿 */
.bg-pink { background-color: #ff6699; }  /* 点赞粉 */
.bg-blue { background-color: #00a1d6; }  /* 客服蓝 */
.emoji { font-size: 26px; }

.badge { position: absolute; top: 0; right: -5px; background: #ff4d4f; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 10px; font-weight: bold; border: 2px solid #fff;}

.action-name { font-size: 13px; color: #333; }

.divider { height: 10px; background-color: #f5f5f5; }

/* 消息列表区 */
.msg-list { flex: 1; padding: 0 15px; }

.msg-card { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #f5f5f5; }
.msg-card:active { background-color: #fafafa; }

/* 头像和系统通知的图标 */
.avatar-box { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;}
.logi-bg { background-color: #ff9900; }
.sys-bg { background-color: #1890ff; }
.avatar-img { width: 46px; height: 46px; border-radius: 50%; margin-right: 15px; flex-shrink: 0; border: 1px solid #eee;}

.msg-info { flex: 1; overflow: hidden; }
.title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.title { font-size: 16px; font-weight: bold; color: #333; }
.time { font-size: 12px; color: #aaa; }

.desc { font-size: 13px; color: #999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.bottom-tips { text-align: center; color: #ccc; font-size: 12px; padding: 30px 0; }
</style>