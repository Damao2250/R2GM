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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* #endif */

view,
scroll-view,
swiper,
swiper-item,
cover-view {
  background-color: $bg-primary;
}

page {
  background-color: $bg-primary;
}

text,
label {
  color: $text-primary;
}

button {
  font-size: $font-size-base;
  border-radius: $border-radius-md;
  transition: all 0.3s ease;

  &::after {
    border: none;
  }

  &[type='primary'] {
    background-color: $primary-color;
    color: #ffffff;

    &:active {
      background-color: $primary-dark;
    }
  }

  &[type='default'] {
    background-color: $bg-secondary;
    color: $text-primary;
    border: 1px solid $border-color;

    &:active {
      background-color: $divider-color;
    }
  }

  &:disabled {
    opacity: 0.6;
  }
}

input,
textarea {
  color: $text-primary;

  &::placeholder {
    color: $text-tertiary;
  }
}

/* 滚动条样式 - 仅 H5 支持 */
/* #ifndef MP */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;

  &:hover {
    background-color: #999;
  }
}
/* #endif */
</style>
