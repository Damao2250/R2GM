<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<template>
  <!-- uni-app 路由系统会自动注入页面内容 -->
</template>

<style lang="scss">
@use './styles/theme.scss' as *;

/* 全局样式 */
/* 注：微信小程序 WXSS 不支持通用选择器 * */
/* #ifndef MP */
</style>
