<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="🛠️ 工具管理" subtitle="调整菜单显示顺序" />

    <!-- 操作栏 -->
    <view class="operation-bar">
      <view class="mode-toggle">
        <view class="toggle-item" :class="{ active: editMode === 'order' }" @click="editMode = 'order'">
          <text class="toggle-icon">↕️</text>
          <text class="toggle-label">调整顺序</text>
        </view>
        <view class="toggle-item" :class="{ active: editMode === 'visible' }" @click="editMode = 'visible'">
          <text class="toggle-icon">👁️</text>
          <text class="toggle-label">显示/隐藏</text>
        </view>
      </view>

      <view class="quick-actions">
        <button class="action-btn reset-btn" @click="handleResetOrder">
          <text class="btn-text">恢复默认</text>
        </button>
        <button class="action-btn save-btn" @click="handleSaveOrder" :loading="isSaving">
          <text class="btn-text">{{ isSaving ? '保存中...' : '保存' }}</text>
        </button>
      </view>
    </view>

    <!-- 工具列表 -->
    <view class="tools-list">
      <!-- 调整顺序模式 -->
      <view v-if="editMode === 'order'" class="order-mode">
        <view v-for="(tool, index) in tempTools" :key="tool.url" class="tool-card">
          <view class="tool-content">
            <text class="tool-icon">{{ tool.icon }}</text>
            <view class="tool-info">
              <text class="tool-title">{{ tool.title }}</text>
            </view>
          </view>

          <view class="tool-actions">
            <button
              class="move-btn up-btn"
              @click="moveToolUp(index)"
              :disabled="index === 0"
              :class="{ disabled: index === 0 }"
            >
              <text>⬆️</text>
            </button>
            <button
              class="move-btn down-btn"
              @click="moveToolDown(index)"
              :disabled="index === tempTools.length - 1"
              :class="{ disabled: index === tempTools.length - 1 }"
            >
              <text>⬇️</text>
            </button>
          </view>
        </view>
      </view>

      <!-- 显示/隐藏模式 -->
      <view v-else class="visible-mode">
        <view v-for="(tool, index) in tempTools" :key="tool.url" class="tool-card">
          <view class="tool-content">
            <text class="tool-icon">{{ tool.icon }}</text>
            <view class="tool-info">
              <text class="tool-title">{{ tool.title }}</text>
            </view>
          </view>

          <view class="toggle-switch" @click="toggleToolVisibility(index)">
            <view class="switch-bg" :class="{ active: tool.visible !== false }">
              <view class="switch-dot"></view>
            </view>
            <text class="switch-label">{{ tool.visible !== false ? '显示' : '隐藏' }}</text>
          </view>
        </view>

        <view class="visible-info">
          <text class="info-text">当前显示工具数：{{ visibleCount }}/{{ tempTools.length }}</text>
        </view>
      </view>
    </view>

    <!-- 提示信息 -->
    <view class="info-section">
      <view class="info-card">
        <view class="info-header">
          <text class="info-icon">💡</text>
          <text class="info-title">使用说明</text>
        </view>
        <view class="info-content">
          <text class="info-item">调整顺序模式：使用上下按钮改变工具在菜单中的显示位置</text>
          <text class="info-item">显示/隐藏模式：点击切换开关来显示或隐藏工具</text>
          <text class="info-item">点击"保存"按钮后，更改将应用到首页菜单</text>
          <text class="info-item">点击"恢复默认"可将菜单恢复为初始状态</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  getDefaultToolsList,
  getToolsList,
  saveToolsOrder,
  resetToolsOrder,
  moveToolItem,
  toggleToolVisibility as toggleToolVisibilityUtil,
  type ToolItem
} from '@/utils/toolsManager'

const editMode = ref<'order' | 'visible'>('order')
const tempTools = ref<ToolItem[]>([])
const isSaving = ref(false)

const visibleCount = computed(() => {
  return tempTools.value.filter((tool) => tool.visible !== false).length
})

onMounted(async () => {
  await loadTools()
})

/**
 * 加载工具列表
 */
const loadTools = async () => {
  try {
    const tools = await getToolsList()
    tempTools.value = JSON.parse(JSON.stringify(tools))
  } catch (e) {
    console.error('加载工具列表失败:', e)
    tempTools.value = getDefaultToolsList()
  }
}

/**
 * 上移工具
 */
const moveToolUp = (index: number) => {
  if (index > 0) {
    tempTools.value = moveToolItem(tempTools.value, index, index - 1)
  }
}

/**
 * 下移工具
 */
const moveToolDown = (index: number) => {
  if (index < tempTools.value.length - 1) {
    tempTools.value = moveToolItem(tempTools.value, index, index + 1)
  }
}

/**
 * 切换工具可见性
 */
const toggleToolVisibility = (index: number) => {
  tempTools.value = toggleToolVisibilityUtil(tempTools.value, index)
}

/**
 * 保存工具顺序
 */
const handleSaveOrder = async () => {
  isSaving.value = true
  try {
    await saveToolsOrder(tempTools.value)
    uni.showToast({
      title: '保存成功',
      duration: 1500,
      icon: 'success'
    })

    // 延迟后返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (e) {
    uni.showToast({
      title: '保存失败',
      icon: 'none',
      duration: 1500
    })
  } finally {
    isSaving.value = false
  }
}

/**
 * 恢复默认顺序
 */
const handleResetOrder = () => {
  uni.showModal({
    title: '恢复默认',
    content: '确定要恢复默认菜单顺序吗？',
    confirmText: '恢复',
    confirmColor: '#d32f2f',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          await resetToolsOrder()
          await loadTools()
          uni.showToast({
            title: '已恢复默认顺序',
            duration: 1500,
            icon: 'success'
          })
        } catch (e) {
          uni.showToast({
            title: '恢复失败',
            icon: 'none',
            duration: 1500
          })
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0 0 40rpx 0;
}

.operation-bar {
  padding: 20rpx 30rpx;
  background: white;
  border-bottom: 1rpx solid #e5e5e5;
  margin: 20rpx 0;
}

.mode-toggle {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
  background: #f0f2f5;
  border-radius: 12rpx;
  padding: 6rpx;
}

.toggle-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 12rpx;
  border-radius: 8rpx;
  background: transparent;
  transition: all 0.3s ease;
  cursor: pointer;

  &.active {
    background: white;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }
}

.toggle-icon {
  font-size: 28rpx;
}

.toggle-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.quick-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  padding: 16rpx 24rpx;
  border-radius: 10rpx;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
  color: white;
  transition: all 0.3s ease;

  &.reset-btn {
    background: #666;

    &:active {
      background: #555;
    }
  }

  &.save-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    &:active {
      opacity: 0.9;
    }
  }

  .btn-text {
    font-size: 26rpx;
    font-weight: 600;
  }
}

.tools-list {
  padding: 20rpx 20rpx;
}

.tool-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:active {
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  }
}

.tool-content {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 16rpx;
}

.tool-icon {
  font-size: 44rpx;
  flex-shrink: 0;
}

.tool-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  flex: 1;
}

.tool-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.tool-actions {
  display: flex;
  gap: 8rpx;
}

.move-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 8rpx;
  border: none;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  transition: all 0.3s ease;

  &:active:not(.disabled) {
    background: #e0e2e5;
    transform: scale(0.95);
  }

  &.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 12rpx;
  cursor: pointer;
}

.switch-bg {
  width: 56rpx;
  height: 32rpx;
  border-radius: 16rpx;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 2rpx;
  transition: all 0.3s ease;

  &.active {
    background: #667eea;
    justify-content: flex-end;
  }
}

.switch-dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: white;
  transition: all 0.3s ease;
}

.switch-label {
  font-size: 24rpx;
  color: #666;
  min-width: 40rpx;
}

.visible-info {
  text-align: center;
  padding: 20rpx;
  margin-top: 20rpx;
}

.info-text {
  font-size: 24rpx;
  color: #666;
}

.info-section {
  padding: 20rpx;
}

.info-card {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  padding-bottom: 12rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.info-icon {
  font-size: 28rpx;
}

.info-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.info-item {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}
</style>
