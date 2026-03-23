<template>
  <view class="tools-grid">
    <view
      v-for="(item, index) in items"
      :key="item.key ?? `${item.title}-${index}`"
      class="tool-item"
      :class="{ disabled: item.disabled }"
      @click="handleSelect(item)"
    >
      <view class="tool-icon">{{ item.icon || '🧰' }}</view>
      <text class="tool-name">{{ item.title }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
export interface ToolGridItem {
  title: string
  icon?: string
  key?: string
  disabled?: boolean
}

defineProps<{
  items: ToolGridItem[]
}>()

const emit = defineEmits<{
  select: [item: any]
}>()

const handleSelect = (item: ToolGridItem) => {
  if (item.disabled) {
    return
  }

  emit('select', item)
}
</script>

<style lang="scss" scoped>
.tools-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 30rpx;
  margin-top: 20rpx;
}

.tool-item {
  width: calc((100% - 30rpx) / 2);
  min-height: 180rpx;
  box-sizing: border-box;
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx 24rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #e0e0e0;
  /* #ifndef MP */
  transition: all 0.3s ease;
  /* #endif */

  &:active {
    /* #ifdef H5 */
    transform: scale(0.95);
    /* #endif */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.disabled {
    opacity: 0.7;
  }
}

.tool-icon {
  font-size: 56rpx;
  margin-bottom: 12rpx;
}

.tool-name {
  font-size: 28rpx;
  line-height: 1.45;
  color: #333;
  font-weight: 500;
  word-break: break-word;
}
</style>
