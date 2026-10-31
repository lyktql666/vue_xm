<template>
  <div>
    <!-- 顶部标题 -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">客户与宝宝信息</h1>
    </div>

    <el-card>
      <el-table :data="customerList" stripe style="width: 100%" v-loading="isLoading">
        
        <!-- 客户基础信息 -->
        <el-table-column prop="xing_ming" label="客户姓名" width="120" />
          <el-table-column label="收件历史足迹" width="160" align="center">
          <template #default="{ row }">
            
            <!-- 如果他留过任何一种信息，就显示按钮 -->
            <el-popover
              v-if="row.used_names.length || row.used_phones.length || row.used_addresses.length"
              placement="right"
              title="🔍 客户收件足迹提取"
              :width="350"
              trigger="hover"
            >
              <template #reference>
                <el-button size="small" type="primary" plain round>
                  查看足迹图谱
                </el-button>
              </template>
              
              <!-- 弹出框内部：打破常规，完全独立展示的三大区块 -->
              <div class="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                
                <!-- 区块 1：曾用收件人 (绿色标签) -->
                <div class="mb-4" v-if="row.used_names.length">
                  <div class="text-xs text-gray-500 mb-2 flex items-center"><el-icon class="mr-1"><User /></el-icon>曾用收件人</div>
                  <div class="flex flex-wrap gap-2">
                    <el-tag v-for="name in row.used_names" :key="name" size="small" type="success" effect="plain">
                      {{ name }}
                    </el-tag>
                  </div>
                </div>

                <!-- 区块 2：曾用联系电话 (橙色标签) -->
                <div class="mb-4" v-if="row.used_phones.length">
                  <div class="text-xs text-gray-500 mb-2 flex items-center"><el-icon class="mr-1"><Phone /></el-icon>曾用联系电话</div>
                  <div class="flex flex-wrap gap-2">
                    <el-tag v-for="phone in row.used_phones" :key="phone" size="small" type="warning" effect="plain">
                      {{ phone }}
                    </el-tag>
                  </div>
                </div>

                <!-- 区块 3：曾用详细地址 (灰色列表) -->
                <div v-if="row.used_addresses.length">
                  <div class="text-xs text-gray-500 mb-2 flex items-center"><el-icon class="mr-1"><Location /></el-icon>曾用配送地址</div>
                  <div class="flex flex-col gap-2">
                    <div 
                      v-for="addr in row.used_addresses" 
                      :key="addr" 
                      class="text-sm bg-gray-50 p-2 rounded text-gray-600 border border-gray-100 leading-relaxed"
                    >
                      {{ addr }}
                    </div>
                  </div>
                </div>

              </div>
            </el-popover>

            <!-- 如果这个客户从来没买过东西，也没有地址 -->
            <span v-else class="text-gray-400 text-xs italic">暂无足迹记录</span>
            
          </template>
        </el-table-column>
        
        <!-- 活跃度指标 -->
        <el-table-column prop="total_buy" label="历史购买总件数" width="140" align="center">
          <template #default="{ row }">
            <!-- 购买大于5件的标为高净值用户 -->
            <el-tag :type="row.total_buy > 5 ? 'danger' : 'info'" effect="dark" round>
              {{ row.total_buy }} 件
            </el-tag>
          </template>
        </el-table-column>

        <!--  核心亮点：AI 画像预测  -->
        <el-table-column label="系统推断宝宝阶段" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center">
              <!-- 根据不同阶段显示不同颜色的标签 -->
              <el-tag 
                v-if="row.predicted_stage !== '暂无数据'" 
                :type="getStageColor(row.predicted_stage)" 
                effect="plain"
                class="font-bold text-sm"
              >
                {{ row.predicted_stage }}
              </el-tag>
              <span v-else class="text-gray-400 text-xs italic">尚未产生购买行为</span>
            </div>
          </template>
        </el-table-column>

        <!--示购买习惯详情分布 -->
        <el-table-column type="expand" width="80">
          <template #default="{ row }">
            <div class="px-12 py-5 bg-blue-50/30">
              <h4 class="text-sm font-bold text-gray-700 mb-3"><el-icon><DataLine /></el-icon> 购买习惯分布分析</h4>
              
              <div v-if="Object.keys(row.stage_details).length > 0" class="flex flex-wrap gap-4">
                <!-- 遍历展示客户买过的各个阶段的商品数量统计 -->
                <div 
                  v-for="(count, tag) in row.stage_details" 
                  :key="tag" 
                  class="bg-white px-4 py-2 rounded-md shadow-sm border border-gray-100 flex items-center justify-between min-w-[200px]"
                >
                  <span class="text-gray-600 text-sm">{{ tag }}</span>
                  <span class="text-blue-500 font-bold ml-4">{{ count }} 笔</span>
                </div>
              </div>
              
              <el-empty v-else description="暂无购买数据分析" :image-size="60" />
            </div>
          </template>
        </el-table-column>

      </el-table>

      <!-- 分页组件 -->
      <div class="flex justify-end mt-4">
        <!-- 满血版分页组件，不仅警告消失，而且功能更全！ -->
<el-pagination
  v-model:current-page="currentPage"
  v-model:page-size="pageSize"
  :page-sizes="[5, 10, 20, 50]"
  :background="true"
  layout="total, sizes, prev, pager, next, jumper"
  :total="total"
  @size-change="loadCustomers"
  @current-change="loadCustomers"
/>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Download, DataLine } from '@element-plus/icons-vue'
// 假设你封装了客户管理的 API
import KeHuAPI from '@/api/ke_hu' 

const isLoading = ref(false)
const customerList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const loadCustomers = async () => {
  isLoading.value = true
  try {
    const data = await KeHuAPI.getKHList({ currentPage: currentPage.value, pageSize: pageSize.value })
    if (data) {
      customerList.value = data.lists
      total.value = data.total
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const getStageColor = (stage) => {
  // 1. 核心防御：如果传进来的是空的，直接返回普通颜色，阻止崩溃！
  if (!stage) return 'info' 
  
  // 2. 正常判断逻辑
  if (stage.includes('新生儿') || stage.includes('0-6')) return 'danger'
  if (stage.includes('辅食') || stage.includes('6-12')) return 'warning'
  if (stage.includes('幼儿') || stage.includes('1-3岁')) return 'success'
  return 'primary'
}

onMounted(() => loadCustomers())
</script>

<style scoped>
/* 同样套用之前的丝滑展开动画 */
:deep(.el-table__expanded-cell) { padding: 0 !important; background-color: transparent !important; }
.bg-blue-50\/30 {
  animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  overflow: hidden; transform-origin: top; 
}
@keyframes fadeInDown {
  0% { max-height: 0; opacity: 0; transform: translateY(-5px); }
  100% { max-height: 500px; opacity: 1; transform: translateY(0); }
}
</style>