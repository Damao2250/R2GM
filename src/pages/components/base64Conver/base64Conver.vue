<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="🔐 编码/转换" subtitle="Base64·Hex·MD5" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- Base64 编码 -->
      <conversion-card title="Base64 编码" desc="将文本转换为 Base64 编码格式" icon="📝" card-class="encode-card"
        :input-value="conversions.base64Encode.input" :output-value="conversions.base64Encode.output"
        @update:input="conversions.base64Encode.input = $event" @convert="handleConvert('base64Encode')"
        @copy="handleCopy('base64Encode')" @clear="handleClear('base64Encode')" />

      <!-- Base64 解码 -->
      <conversion-card title="Base64 解码" desc="将 Base64 编码解码为原始文本" icon="🔓" card-class="decode-card"
        :input-value="conversions.base64Decode.input" :output-value="conversions.base64Decode.output"
        @update:input="conversions.base64Decode.input = $event" @convert="handleConvert('base64Decode')"
        @copy="handleCopy('base64Decode')" @clear="handleClear('base64Decode')" />

      <!-- Hex 编码 -->
      <conversion-card title="Hex 编码" desc="将文本转换为十六进制编码" icon="🔠" card-class="hex-card"
        :input-value="conversions.hexEncode.input" :output-value="conversions.hexEncode.output"
        @update:input="conversions.hexEncode.input = $event" @convert="handleConvert('hexEncode')"
        @copy="handleCopy('hexEncode')" @clear="handleClear('hexEncode')" />

      <!-- Hex 解码 -->
      <conversion-card title="Hex 解码" desc="将十六进制解码为原始文本" icon="🔡" card-class="hex-decode-card"
        :input-value="conversions.hexDecode.input" :output-value="conversions.hexDecode.output"
        @update:input="conversions.hexDecode.input = $event" @convert="handleConvert('hexDecode')"
        @copy="handleCopy('hexDecode')" @clear="handleClear('hexDecode')" />

      <!-- URL 编码 -->
      <conversion-card title="URL 编码" desc="将文本转换为 URL 编码格式" icon="🔗" card-class="url-card"
        :input-value="conversions.urlEncode.input" :output-value="conversions.urlEncode.output"
        @update:input="conversions.urlEncode.input = $event" @convert="handleConvert('urlEncode')"
        @copy="handleCopy('urlEncode')" @clear="handleClear('urlEncode')" />

      <!-- URL 解码 -->
      <conversion-card title="URL 解码" desc="将 URL 编码解码为原始文本" icon="📍" card-class="url-decode-card"
        :input-value="conversions.urlDecode.input" :output-value="conversions.urlDecode.output"
        @update:input="conversions.urlDecode.input = $event" @convert="handleConvert('urlDecode')"
        @copy="handleCopy('urlDecode')" @clear="handleClear('urlDecode')" />

      <!-- MD5 计算 -->
      <conversion-card title="MD5 计算" desc="计算文本的 MD5 哈希值" icon="🔐" card-class="md5-card"
        :input-value="conversions.md5.input" :output-value="conversions.md5.output"
        @update:input="conversions.md5.input = $event" @convert="handleConvert('md5')" @copy="handleCopy('md5')"
        @clear="handleClear('md5')" />
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '编码/转换 - DM工具箱',
    path: '/pages/components/base64Conver/base64Conver'
  })
}
</script>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import EncodeUtils from './endecode-lib.js'
import ConversionCard from './ConversionCard.vue'
import PageHeader from '@/components/PageHeader.vue'

// 统一管理所有转换类型的状态
const conversions = reactive({
  base64Encode: { input: '', output: '', canCopy: false },
  base64Decode: { input: '', output: '', canCopy: false },
  hexEncode: { input: '', output: '', canCopy: false },
  hexDecode: { input: '', output: '', canCopy: false },
  urlEncode: { input: '', output: '', canCopy: false },
  urlDecode: { input: '', output: '', canCopy: false },
  md5: { input: '', output: '', canCopy: false }
})

// 编码函数映射
const encodeFunctions: Record<string, (input: string) => string | undefined> = {
  base64Encode: (value: string) => {
    const encoded = EncodeUtils.base64Encode(EncodeUtils.utf8Encode(value))
    return encoded
  },
  base64Decode: (value: string) => {
    try {
      const decoded = EncodeUtils.utf8Decode(EncodeUtils.base64Decode(value))
      return decoded
    } catch (e) {
      throw new Error('无法解码')
    }
  },
  hexEncode: (value: string) => {
    return EncodeUtils.hexEncode(value)
  },
  hexDecode: (value: string) => {
    try {
      const decoded = EncodeUtils.hexDecode(value)
      return decoded
    } catch (e) {
      throw new Error('无法解码')
    }
  },
  urlEncode: (value: string) => {
    return encodeURIComponent(value)
  },
  urlDecode: (value: string) => {
    try {
      return decodeURIComponent(value)
    } catch (e) {
      throw new Error('无法解码')
    }
  },
  md5: (value: string) => {
    return EncodeUtils.md5(value)
  }
}

// 处理转换
const handleConvert = (type: string) => {
  const conversion = conversions[type as keyof typeof conversions]

  if (!conversion.input) {
    uni.showToast({
      icon: 'none',
      title: '输入框不能为空',
      duration: 1000
    })
    return
  }

  try {
    const result = encodeFunctions[type](conversion.input)
    conversion.output = result || ''
    conversion.canCopy = true
  } catch (error) {
    uni.showToast({
      icon: 'error',
      title: (error as Error).message || '转换失败',
      duration: 1000
    })
    conversion.output = ''
    conversion.canCopy = false
  }
}

// 复制结果
const handleCopy = (type: string) => {
  const conversion = conversions[type as keyof typeof conversions]

  if (!conversion.canCopy) {
    return
  }

  uni.setClipboardData({
    data: conversion.output,
    success: () => {
      uni.showToast({
        title: '复制成功',
        duration: 1000
      })
    }
  })
}

// 清空输入输出
const handleClear = (type: string) => {
  const conversion = conversions[type as keyof typeof conversions]
  conversion.input = ''
  conversion.output = ''
  conversion.canCopy = false
}
</script>

<style lang="scss" scoped>
@use '../../../styles/theme.scss' as *;

.container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0 0 40rpx 0;
}

.page-content {
  padding: 30rpx;
}

/* 卡片样式 */
:deep(.card) {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  overflow: hidden;

  &:active {
    transform: scale(0.98);
  }
}

/* 动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
