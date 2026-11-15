<template>
  <view class="review-page">
    
    <!-- 顶部过滤栏 (好评 / 差评) -->
    <view class="filter-tabs">
      <view class="tab" :class="{ active: currentTab === 'all' }" @click="currentTab = 'all'">全部</view>
      <view class="tab" :class="{ active: currentTab === 'good' }" @click="currentTab = 'good'">好评</view>
      <view class="tab" :class="{ active: currentTab === 'bad' }" @click="currentTab = 'bad'">差评</view>
    </view>

    <!-- 评价大列表 -->
    <scroll-view scroll-y class="review-list">
      
      <!-- ✨ B站同款：动态排序切换头 ✨ -->
      <view class="sort-header" v-if="allReviews.length > 0">
        <text class="sort-title">{{ sortBy === 'hot' ? '热门评论' : '最新评论' }}</text>
        <view class="sort-btn" @click="toggleSort">
          <text class="sort-icon">≡</text>
          <text>按{{ sortBy === 'hot' ? '时间' : '热度' }}</text>
        </view>
      </view>

      <view class="review-card" v-for="item in sortedReviews" :key="item.id">
        <!-- 楼主头部 -->
        <view class="user-header">
          <image class="avatar" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" mode="aspectFill"></image>
          <view class="user-info">
            <view class="name">{{ item.customer_name }}</view>
            <view class="stars"><text v-for="s in item.star" :key="s" class="star-icon">⭐</text></view>
          </view>
        </view>

        <!-- 评价正文 -->
        <view class="content">{{ item.content }}</view>
        
        <!-- 外漏的回复框 -->
        <view class="reply-box-mini" v-if="item.replies && item.replies.length > 0" @click="openDetailPopup(item)">
          <view class="reply-item-mini" v-for="(reply, idx) in item.replies.slice(0, 2)" :key="idx">
            <text class="reply-name">{{ reply.customer_name }}：</text>
            <text class="reply-text">{{ reply.content }}</text>
          </view>
          <view class="open-popup-btn" v-if="item.replies.length > 2">
            查看全部 {{ item.replies.length }} 条回复 <text class="arrow-right">></text>
          </view>
        </view>

        <!-- 楼主底部操作栏 -->
        <view class="bilibili-action-bar">
          <text class="time">{{ formatDate(item.time) }}</text>
          <view class="actions-right">
            <view class="action-btn" @click="handleLike(item, 'review')">
              <text :class="{ 'liked': item.isLiked }">👍 {{ item.likeCount || 0 }}</text>
            </view>
            <view class="action-btn" @click="openDetailPopup(item)">💬 回复</view>
            <view class="action-btn report" @click="handleReport">举报</view>
          </view>
        </view>
      </view> 

      <view class="safe-bottom-space"></view>
    </scroll-view>

    <!-- ================= 沉浸式半屏评论详情弹窗 ================= -->
    <view class="popup-mask" v-if="showDetailPopup" @click="closeDetailPopup">
      <view class="popup-content" @click.stop>
        
        <!-- 弹窗头部 -->
        <view class="popup-header">
          <text class="popup-title">评论详情</text>
          <text class="popup-close" @click="closeDetailPopup">×</text>
        </view>

        <!-- 弹窗滚动区 -->
        <scroll-view scroll-y class="popup-scroll">
          
          <!-- 楼主的评论 -->
          <view class="master-review">
            <image class="avatar" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" @click="setReplyTarget(null)"></image>
            <view class="master-info">
              <view class="name" @click="setReplyTarget(null)">{{ currentReview.customer_name }} <text class="louzhu-tag">楼主</text></view>
              <view class="content" @click="setReplyTarget(null)">{{ currentReview.content }}</view>
              
              <view class="bilibili-action-bar">
                <text class="time">{{ formatDate(currentReview.time) }}</text>
                <view class="actions-right">
                  <view class="action-btn" @click="handleLike(currentReview, 'review')">
                    <text :class="{ 'liked': currentReview.isLiked }">👍 {{ currentReview.likeCount || 0 }}</text>
                  </view>
                  <view class="action-btn" @click="setReplyTarget(null)">回复</view>
                  <view class="action-btn report" @click="handleReport">举报</view>
                </view>
              </view>
            </view>
          </view>

          <view class="divider">相关回复共 {{ currentReview.replies?.length || 0 }} 条</view>

          <!-- 所有的回复列表 (楼中楼) -->
          <view class="reply-list">
            <view class="reply-item-full" v-for="reply in currentReview.replies" :key="reply.id">
              <image class="avatar-small" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" @click="setReplyTarget(reply)"></image>
              
              <view class="reply-info">
                <view class="name" @click="setReplyTarget(reply)">{{ reply.customer_name }}</view>
                
                <view class="content" @click="setReplyTarget(reply)">
                  <text v-if="reply.reply_to_name">回复 <text class="at-name">@{{ reply.reply_to_name }}</text>：</text>
                  <text>{{ reply.content }}</text>
                </view>

                <view class="bilibili-action-bar">
                  <text class="time">{{ formatDate(reply.time) }}</text>
                  <view class="actions-right">
                    <view class="action-btn" @click="handleLike(reply, 'reply')">
                      <text :class="{ 'liked': reply.isLiked }">👍 {{ reply.likeCount || 0 }}</text>
                    </view>
                    <view class="action-btn" @click="setReplyTarget(reply)">回复</view>
                    <view class="action-btn report" @click="handleReport">举报</view>
                  </view>
                </view>
              </view>
            </view>
            
            <view v-if="!currentReview.replies || currentReview.replies.length === 0" class="empty-reply">快来抢占沙发吧~</view>
            <view class="bottom-space-mini"></view>
          </view>
        </scroll-view>

        <!-- 吸底输入框 -->
        <view class="bottom-input-bar">
          <input 
            class="reply-input" 
            v-model="replyContent" 
            :placeholder="inputPlaceholder" 
            :focus="isInputFocus"
            cursor-spacing="20"
            @blur="isInputFocus = false"
          />
          <view class="send-btn" :class="{ 'active': replyContent.length > 0 }" @click="submitReply">发送</view>
        </view>

      </view>
    </view>


    <!-- ================= 悬浮写评价 ================= -->
    <view class="float-btn" v-if="!showDetailPopup" @click="showReviewModal = true">
      <text class="edit-icon">✏️</text> 写评价
    </view>
    
    <view class="modal-mask" v-if="showReviewModal">
      <view class="modal-content">
        <view class="modal-header">
          <text class="title">发表评价</text>
          <text class="close" @click="showReviewModal = false">×</text>
        </view>
        <view class="rate-box">
          <text class="rate-label">商品评分：</text>
          <view class="stars-select">
            <text v-for="i in 5" :key="i" class="star" :class="{ active: i <= newReview.star }" @click="newReview.star = i">{{ i <= newReview.star ? '⭐' : '☆' }}</text>
          </view>
        </view>
        <textarea v-model="newReview.content" class="textarea" placeholder="分享一下购买体验吧~"></textarea>
        <view class="submit-btn" @click="submitReview">发布评价</view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import request from '@/utils/request.js'

const productId = ref(null)
const allReviews = ref([])
const currentTab = ref('all')
const sortBy = ref('hot') // 默认排序模式为热度

const showReviewModal = ref(false)
const showDetailPopup = ref(false)
const currentReview = ref({})
const replyTarget = ref(null)
const replyContent = ref('')
const isInputFocus = ref(false)
const newReview = ref({ star: 5, content: '' })

onLoad(() => {
  loadLocalData()
})

onShow(() => {
  fetchLatestData()
})

// === 获取数据 ===
const loadLocalData = () => {
  const data = uni.getStorageSync('currentProduct')
  if (data) {
    productId.value = data.id
    allReviews.value = data.reviews || []
  }
}

const fetchLatestData = async () => {
  if (!productId.value) return;
  const currentCustomerId = uni.getStorageSync('customerId') || ''; 
  try {
    const res = await request.get('/sp_lie_biao', { currentPage: 1, pageSize: 100, ke_hu_id: currentCustomerId })
    if (res.code === 200) {
      const latestProduct = res.data.lists.find(item => item.id === productId.value)
      if (latestProduct) {
        allReviews.value = latestProduct.reviews || []
        uni.setStorageSync('currentProduct', latestProduct)
      }
    }
  } catch (error) { console.error(error) }
}

const syncCache = () => {
  const data = uni.getStorageSync('currentProduct')
  if (data) {
    data.reviews = allReviews.value
    uni.setStorageSync('currentProduct', data)
  }
}

// === 核心算法：重力热度模型计算 ===
const calculateHotScore = (review) => {
  const LIKE_WEIGHT = 2;   
  const REPLY_WEIGHT = 5;  
  const GRAVITY = 1.5;     

  const likes = review.likeCount || 0;
  const replies = (review.replies && review.replies.length) || 0;
  
  const baseScore = (likes * LIKE_WEIGHT) + (replies * REPLY_WEIGHT) + 1;
  const hoursElapsed = (new Date().getTime() - new Date(review.time).getTime()) / (1000 * 60 * 60);

  return baseScore / Math.pow(hoursElapsed + 2, GRAVITY);
}

// === 双重过滤与排序计算属性 ===
const sortedReviews = computed(() => {
  let list = allReviews.value.filter(item => {
    if (currentTab.value === 'good') return item.star >= 3;
    if (currentTab.value === 'bad') return item.star <= 2;
    return true;
  })

  list.sort((a, b) => {
    if (sortBy.value === 'time') {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    } else {
      return calculateHotScore(b) - calculateHotScore(a);
    }
  })

  return list;
})

const toggleSort = () => {
  sortBy.value = sortBy.value === 'hot' ? 'time' : 'hot'
}

const inputPlaceholder = computed(() => {
  if (replyTarget.value) {
    return `回复 @${replyTarget.value.customer_name}：`
  }
  return '勇敢滴少年啊快去创造热评~'
})

// === UI 交互 ===
const openDetailPopup = (reviewItem) => {
  currentReview.value = reviewItem
  replyTarget.value = null 
  replyContent.value = ''
  showDetailPopup.value = true
}

const closeDetailPopup = () => {
  showDetailPopup.value = false
  isInputFocus.value = false
}

const setReplyTarget = (replyItem) => {
  replyTarget.value = replyItem 
  isInputFocus.value = true     
}

// === 接口操作 (带防越界保护) ===
const handleLike = async (item, type) => {
  // 🚨 核心修复：如果是临时造的假数据（ID过大），拦截点赞！防止数据库崩掉！
  if (item.id > 100000000000) {
    return uni.showToast({ title: '刚发布的内容，刷新后再赞哦~', icon: 'none' })
  }

  const currentCustomerId = uni.getStorageSync('customerId');
  if (!currentCustomerId) return uni.showToast({ title: '请先登录', icon: 'none' });

  item.isLiked = !item.isLiked
  item.likeCount = (item.likeCount || 0) + (item.isLiked ? 1 : -1)

  try {
    const res = await request.post('/hu_dong/toggle_like', {
      target_type: type,
      target_id: item.id,
      ke_hu_id: currentCustomerId
    });

    if (res.code === 200) {
      syncCache(); 
    } else {
      item.isLiked = !item.isLiked
      item.likeCount += item.isLiked ? 1 : -1
      uni.showToast({ title: '操作失败', icon: 'none' })
    }
  } catch (error) {
    item.isLiked = !item.isLiked
    item.likeCount += item.isLiked ? 1 : -1
  }
}

const handleReport = () => {
  uni.showToast({ title: '已收到举报，我们将尽快核实', icon: 'none' })
}

const submitReply = async () => {
  if (!replyContent.value) return;
  const currentCustomerId = uni.getStorageSync('customerId');
  if (!currentCustomerId) return uni.showToast({ title: '请先登录', icon: 'none' });

  try {
    const res = await request.post('/hu_dong/add_reply', {
      ping_jia_id: currentReview.value.id,
      ke_hu_id: currentCustomerId,
      content: replyContent.value,
      reply_to_name: replyTarget.value ? replyTarget.value.customer_name : null 
    })
    
    if (res.code === 200) {
      uni.showToast({ title: '发送成功' })
      if (!currentReview.value.replies) currentReview.value.replies = []
      
      // 注意：这里为了前端秒出，用了一个极大的时间戳做临时ID。
      // 它不能被点赞（上面 handleLike 已做拦截）。刷新后后端会给它真正的真实ID。
      currentReview.value.replies.push({ 
        id: Date.now(), 
        customer_name: uni.getStorageSync('customerInfo').xing_ming || "我", 
        content: replyContent.value,
        reply_to_name: replyTarget.value ? replyTarget.value.customer_name : null,
        time: new Date(),
        isLiked: false,
        likeCount: 0
      })
      
      syncCache() 
      replyContent.value = ''
      isInputFocus.value = false
    }
  } catch (error) {}
}

const submitReview = async () => {
  if (!newReview.value.content) return uni.showToast({ title: '写点什么吧', icon: 'none' });
  const currentCustomerId = uni.getStorageSync('customerId'); 
  if (!currentCustomerId) return uni.showToast({ title: '请先登录', icon: 'none' });
  
  try {
    const res = await request.post('/hu_dong/add_review', {
      shang_pin_id: productId.value, ke_hu_id: currentCustomerId,
      star: newReview.value.star, content: newReview.value.content
    })
    if (res.code === 200) {
      uni.showToast({ title: '评价成功' })
      showReviewModal.value = false
      
      // 注意：这里临时使用时间戳ID，点赞已被拦截保护，刷新后即变为真实ID
      allReviews.value.unshift({ 
        id: Date.now(), 
        customer_name: uni.getStorageSync('customerInfo').xing_ming || "我", 
        star: newReview.value.star, 
        content: newReview.value.content, 
        replies: [], 
        isLiked: false, 
        likeCount: 0 
      })
      syncCache() 
    } else {
      uni.showToast({ title: res.message, icon: 'none', duration: 3000 })
    }
  } catch (error) {}
}

const formatDate = (dateStr) => {
  if (!dateStr) return '刚刚';
  const d = new Date(dateStr)
  return `${d.getMonth()+1}-${d.getDate()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}
</script>

<style scoped>
.review-page { background: #f8f8f8; height: 100vh; display: flex; flex-direction: column; position: relative; }
.filter-tabs { display: flex; background: #fff; padding: 12px 15px; border-bottom: 1px solid #f0f0f0; }
.tab { padding: 6px 18px; border-radius: 20px; background: #f5f5f5; font-size: 13px; color: #333; margin-right: 12px; transition: all 0.2s;}
.tab.active { background: #ffe4e6; color: #ff4d4f; font-weight: bold; }

.review-list { flex: 1; padding: 0 15px; }
.review-card { background: #fff; margin-bottom: 10px; padding: 20px 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);}

.sort-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 5px 10px; }
.sort-title { font-size: 15px; color: #333; font-weight: bold;}
.sort-btn { display: flex; align-items: center; font-size: 13px; color: #666; cursor: pointer; transition: opacity 0.2s; background: #f5f5f5; padding: 4px 10px; border-radius: 12px;}
.sort-btn:active { opacity: 0.6; }
.sort-icon { font-size: 12px; margin-right: 4px; font-weight: bold; }

.user-header { display: flex; align-items: center; margin-bottom: 12px; }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: #eee; margin-right: 12px; }
.name { font-size: 14px; font-weight: bold; color: #333; }
.stars { margin-left: auto; font-size: 12px;}
.star-icon { font-size: 10px; margin-left: 2px;}

.content { font-size: 15px; color: #222; line-height: 1.6; margin-bottom: 12px; word-break: break-all;}

.reply-box-mini { background: #f7f7f7; padding: 10px 12px; border-radius: 8px; margin-top: 10px; cursor: pointer; }
.reply-item-mini { font-size: 13px; color: #444; line-height: 1.5; margin-bottom: 6px;}
.reply-item-mini:last-child { margin-bottom: 0; }
.reply-name { color: #576b95; font-weight: 500; }
.open-popup-btn { font-size: 13px; color: #576b95; margin-top: 8px; font-weight: bold; display: flex; align-items: center; }
.arrow-right { font-family: consolas; margin-left: 4px; font-weight: normal; font-size: 12px;}

.bilibili-action-bar { display: flex; align-items: center; justify-content: space-between; margin-top: 15px; }
.time { font-size: 12px; color: #999; }
.actions-right { display: flex; align-items: center; }
.action-btn { font-size: 13px; color: #666; margin-left: 22px; display: flex; align-items: center; cursor: pointer;}
.action-btn .liked { color: #ff4d4f; }
.report { color: #999; }

.safe-bottom-space { height: 100px; } 

.popup-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: flex-end; }
.popup-content { background: #fff; width: 100%; height: 85vh; border-radius: 16px 16px 0 0; display: flex; flex-direction: column; animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

.popup-header { display: flex; justify-content: center; align-items: center; height: 50px; position: relative; border-bottom: 1px solid #f5f5f5; }
.popup-title { font-size: 15px; font-weight: bold; }
.popup-close { position: absolute; right: 15px; font-size: 24px; color: #999; padding: 0 10px; cursor: pointer; }

.popup-scroll { flex: 1; padding: 15px; background: #fff; }

.master-review { display: flex; padding-bottom: 15px; }
.master-info { flex: 1; }
.louzhu-tag { background: #ff4d4f; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 4px; margin-left: 5px; vertical-align: middle;}

.divider { font-size: 13px; font-weight: bold; color: #333; padding: 15px 0 10px; border-top: 1px solid #f5f5f5;}

.reply-item-full { display: flex; padding: 15px 0; border-bottom: 1px solid #f9f9f9;}
.avatar-small { width: 32px; height: 32px; border-radius: 50%; background: #eee; margin-right: 10px; cursor: pointer; }
.reply-info { flex: 1; }
.at-name { color: #0082c6; font-weight: 500; margin-right: 4px;}
.empty-reply { text-align: center; color: #999; font-size: 13px; padding: 40px 0; }

.bottom-input-bar { background: #fff; padding: 10px 15px; padding-bottom: env(safe-area-inset-bottom); display: flex; align-items: center; border-top: 1px solid #eee; }
.reply-input { flex: 1; background: #f5f5f5; height: 36px; border-radius: 18px; padding: 0 15px; font-size: 14px; }
.send-btn { margin-left: 15px; font-size: 15px; color: #999; font-weight: bold; transition: color 0.3s; cursor: pointer; }
.send-btn.active { color: #ff4d4f; }

.float-btn { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #ff4d4f; color: #fff; padding: 10px 24px; border-radius: 25px; font-size: 15px; font-weight: bold; box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4); z-index: 90; cursor: pointer; display: flex; align-items: center;}
.edit-icon { margin-right: 6px; font-size: 16px; }

.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 100; display: flex; align-items: flex-end; }
.modal-content { background: #fff; width: 100%; border-radius: 16px 16px 0 0; padding: 20px; box-sizing: border-box; }
.modal-header { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-bottom: 20px; }
.close { font-size: 24px; color: #999; line-height: 16px; padding: 0 10px; cursor: pointer;}
.rate-box { display: flex; align-items: center; margin-bottom: 15px; }
.star { font-size: 24px; margin-right: 5px; color: #ccc; cursor: pointer; }
.star.active { color: #ff9900; }
.textarea { width: 100%; height: 100px; background: #f9f9f9; padding: 10px; border-radius: 8px; font-size: 14px; box-sizing: border-box; margin-bottom: 20px; }
.submit-btn { background: #ff4d4f; color: #fff; text-align: center; padding: 12px; border-radius: 20px; font-size: 16px; cursor: pointer; }
</style>