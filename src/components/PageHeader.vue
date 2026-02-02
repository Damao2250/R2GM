<template>
  <view class="page-header">
    <view class="header-title">{{ title }}</view>
    <view class="header-subtitle" v-if="subtitle">{{ subtitle }}</view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.page-header {
  background: linear-gradient(135deg, #8b9ef7 0%, #9d87c3 100%);
  padding: 40rpx 30rpx 40rpx;
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;

  .header-title {
    font-size: 48rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
  }

  .header-subtitle {
    font-size: 28rpx;
    opacity: 0.9;
  }
}
</style>
