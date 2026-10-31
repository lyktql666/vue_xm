<template>
  <div>
    <!-- 顶部标题 -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">订单管理</h1>
    </div>

    <el-card>
      <!-- 订单主表格 -->
       <div class="mb-5 border-b pb-4">
        <!-- 监听单选框组的改变事件 -->
        <el-radio-group v-model="currentStatus" @change="handleStatusChange" size="large">
          
          <!-- value 对应数据库里真实的 zhuang_tai 数字 -->
          <el-radio-button :value="0">待付款</el-radio-button>
          <el-radio-button :value="1">待发货</el-radio-button>
          <el-radio-button :value="2">已发货</el-radio-button>
          <el-radio-button :value="3">已完成</el-radio-button>
          <el-radio-button :value="-1">已关闭/拒单</el-radio-button>
        </el-radio-group>
      </div>
      <el-table :data="orderList" stripe style="width: 100%" v-loading="isLoading">
        
        <!--  展开行 (显示该订单买的所有商品)  -->
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-container px-12 py-4 bg-gray-50/50">
              <div class="expand-content bg-white p-5 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
               <h3 class="text-sm font-bold text-gray-700 mb-4 flex items-center">
                  <el-icon class="mr-2 text-blue-500 text-lg"><ShoppingCart /></el-icon> 
                  订单商品明细
                </h3>
              <!-- 嵌套一个小表格展示商品清单 -->
              <el-table :data="row.goods_list" border size="small" style="width: 80%">
                 <el-table-column label="商品图片" width="180" align="center"  header-align="center">
                   <template #default="{ row }">
            <!-- 只要有图片数组，就把数组直接丢给咱们的新组件！ -->
                   <Image3DStack 
                       v-if="row.pic_urls && row.pic_urls.length > 0" 
                       :images="row.pic_urls" 
                    />
                   <div v-else class="text-gray-400 text-xs bg-gray-100 w-[60px] h-[60px] flex items-center justify-center rounded">
                     暂无
                   </div>
                   </template>
                </el-table-column>
                <el-table-column prop="shang_pin_name" label="商品名称" />
                <el-table-column prop="buy_price" label="购买时单价" width="120">
                  <template #default="scope">¥ {{ scope.row.buy_price }}</template>
                </el-table-column>
                <el-table-column prop="buy_count" label="购买数量" width="100">
                  <template #default="scope">{{ scope.row.buy_count }} 件</template>
                </el-table-column>
                <el-table-column label="小计" width="120">
                  <template #default="scope">
                    <span class="text-blue-600 font-bold">¥ {{ scope.row.buy_price * scope.row.buy_count }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            </div>
          </template>
        </el-table-column>

        <!-- 主表列 -->
        <el-table-column prop="ding_dan_hao" label="订单号" width="140" />
        <el-table-column prop="ke_hu_name" label="所属客户" width="100" />
        <el-table-column prop="fu_kuan_jing_e" label="付款金额" width="90">
          <template #default="{ row }">¥{{ row.fu_kuan_jing_e }}</template>
        </el-table-column>
        <el-table-column prop="shou_jian_ren" label="收件人" width="100" />
        <el-table-column prop="shou_huo_dian_hua" label="联系电话" width="120" />
        
        <!-- 订单状态显示 (带颜色标签) -->
         <el-table-column label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.zhuang_tai === 0" type="warning">待付款</el-tag>
            <el-tag v-else-if="row.zhuang_tai === 1" type="danger">待发货</el-tag>
            <el-tag v-else-if="row.zhuang_tai === 2" type="primary">已发货</el-tag>
            <el-tag v-else-if="row.zhuang_tai === 3" type="success">已完成</el-tag>
            <el-tag v-else-if="row.zhuang_tai === -1" type="info">已拒单</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="shou_huo_di_zhi" label="地址" width="120" />


        <el-table-column prop="createdAt" label="下单时间" width="160">
          <!-- 简单格式化一下时间 -->
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>

        <!-- 业务操作按钮 -->
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <!-- 只有待发货状态，才显示发货按钮 -->
            <template v-if="row.zhuang_tai === 1">
              <el-button size="small" type="primary" @click="handleShip(row)">发货</el-button>
              <el-button size="small" type="danger" plain @click="handleReject(row)">拒单</el-button>
            </template>

            <!-- 无论什么状态，都可以联系客户 -->
            <el-button size="small" type="info" link @click="handleContact(row)">联系客户</el-button>
            
          </template>

        </el-table-column>

      </el-table>

      <!-- 高配版分页组件 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ShoppingCart } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import DDAPI from '@/api/ding_dan' 
import Image3DStack from '@/views/Image3DStack.vue'

const isLoading = ref(false)
const orderList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentStatus = ref('') 

// ================= 数据加载 =================
const loadOrders = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    // 把 currentStatus 一起作为参数发给后端
    const params = { 
      currentPage: currentPage.value, 
      pageSize: pageSize.value,
      status: currentStatus.value 
    }
    const data = await DDAPI.getDDList(params)
    
    if (data) {
      orderList.value = data.lists || []
      total.value = data.total || 0
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 分页事件
const handleSizeChange = (val) => { pageSize.value = val; currentPage.value = 1; loadOrders() }
const handleCurrentChange = (val) => { currentPage.value = val; loadOrders() }

// ================= 1. 发货操作 (改变状态为 2) =================
const handleShip = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要对订单 [${row.ding_dan_hao}] 进行发货处理吗？`, '发货确认', {
      confirmButtonText: '确认发货',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    // 把状态改为 2 (已发货) 传给后端
    const result = await DDAPI.updateDD({ id: row.id, zhuang_tai: 2 })
    if (result) {
      ElMessage.success('发货成功！')
      loadOrders() // 刷新列表
    }
  } catch (error) {}
}

// ================= 2. 拒单操作 (改变状态为 -1) =================
const handleReject = async (row) => {
  try {
    // 拒单是一件严重的事情，弹窗警告需要更严厉一点
    await ElMessageBox.confirm(`确定要拒绝订单 [${row.ding_dan_hao}] 吗？拒单后款项将退回给客户！`, '高危操作', {
      confirmButtonText: '狠心拒单',
      cancelButtonText: '再想想',
      type: 'error'
    })
    
    // 把状态改为 -1 (已拒单) 传给后端
    const result = await DDAPI.updateDD({ id: row.id, zhuang_tai: -1 })
    if (result) {
      ElMessage.success('已拒单，订单已关闭！')
      // 在真实的业务里，这里后端应该要去商品表里把库存加回去！
      loadOrders() 
    }
  } catch (error) {}
}

// ================= 3. 联系客户 (弹窗显示电话或直接拨打) =================
const handleContact = (row) => {
  // 提取客户的电话和姓名，弹出一个优雅的提示框
  const phone = row.shou_huo_dian_hua || '未留电话'
  const name = row.shou_jian_ren || '未知客户'
  
  ElMessageBox.alert(
    `<div style="font-size: 16px; margin-bottom: 10px;">收件人：<strong>${name}</strong></div>
     <div style="font-size: 18px; color: #409EFF;">电话：<strong>${phone}</strong></div>`,
    '联系客户',
    {
      dangerouslyUseHTMLString: true, // 允许解析 HTML 标签让字体变好看
      confirmButtonText: '我知道了',
      type: 'success'
    }
  )
}

const handleStatusChange = () => {
  currentPage.value = 1
  loadOrders()
}
</script>
<style scoped>
/* 1. 覆盖 el-table 默认展开行的无聊 padding，让我们自己的容器接管间距 */
:deep(.el-table__expanded-cell) {
  padding: 0 !important;
  background-color: transparent !important;
}

/* 2. 画卷展开核心动画！ */
/* 我们利用 CSS 的 animation，从 0px 缓缓拉伸到 500px，然后停留在 auto 高度 */
.expand-container {
  animation: scrollDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  overflow: hidden; 
  transform-origin: top;  /* 确保是从上面往下展开，而不是从中间炸开 */
}

@keyframes scrollDown {
  0% {
    max-height: 0;
    opacity: 0;
    transform: translateY(-10px) scaleY(0.95);
  }
  100% {
    max-height: 800px; /* 给一个足够大的高度即可 */
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
}

/* 3. 美化内嵌的商品小表格，去掉难看的内部边框，让它看起来更像一个高档清单 */
:deep(.custom-inner-table) {
  --el-table-border-color: transparent !important;
  --el-table-header-bg-color: #f9fafc;
}
:deep(.custom-inner-table th.el-table__cell) {
  color: #909399;
  font-weight: normal;
  border-bottom: 1px solid #ebeef5 !important;
}
:deep(.custom-inner-table td.el-table__cell) {
  border-bottom: 1px dashed #f0f2f5 !important;
}
/* 最后一行不要虚线 */
:deep(.custom-inner-table .el-table__row:last-child td.el-table__cell) {
  border-bottom: none !important;
}
</style>