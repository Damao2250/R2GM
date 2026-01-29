<template>
  <view class="content">
    <view class="content-input">
      <textarea
        class="uni-input"
        cursor-spacing="100"
        v-model="currencyValue"
        auto-height
        placeholder="请输入内容"
      />
    </view>
    <view class="content-input">
      <button type="primary" @click="convertData(currencyValue)">base64转换</button>
    </view>
    <view class="content-input">
      <text class="text-content" selectable user-select>{{ convertValue }}</text>
    </view>
    <button type="primary" :disabled="!isCopy" @click="clipboardData">点击复制</button>

    <div class="line"></div>

    <view class="content-input">
      <textarea
        class="uni-input"
        cursor-spacing="100"
        v-model="currencyValue1"
        auto-height
        placeholder="请输入内容"
      />
    </view>
    <view class="content-input">
      <button type="primary" @click="convertData1(currencyValue1)">base64解码</button>
    </view>
    <view class="content-input">
      <text class="text-content" selectable user-select>{{ convertValue1 }}</text>
    </view>
    <button type="primary" :disabled="!isCopy1" @click="clipboardData1">点击复制</button>

    <div class="line"></div>

    <view class="content-input">
      <textarea
        class="uni-input"
        cursor-spacing="100"
        v-model="currencyValue3"
        auto-height
        placeholder="请输入内容"
      />
    </view>
    <view class="content-input">
      <button type="primary" @click="convertData3(currencyValue3)">MD5计算</button>
    </view>
    <view class="content-input">
      <text class="text-content" selectable user-select>{{ convertValue3 }}</text>
    </view>
    <button type="primary" :disabled="!isCopy3" @click="clipboardData3">点击复制</button>

    <div class="line"></div>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EncodeUtils from './endecode-lib.js'

const currencyValue = ref('')
const convertValue = ref('')
const isCopy = ref(false)

const currencyValue1 = ref('')
const convertValue1 = ref('')
const isCopy1 = ref(false)

const currencyValue3 = ref('')
const convertValue3 = ref('')
const isCopy3 = ref(false)

// Base64 编码
const convertData = (value: string) => {
  console.log(value)
  if (value === '') {
    uni.showToast({
      icon: 'none',
      title: '输入框不能为空',
      duration: 1000
    })
    return false
  }
  convertValue.value = convertCurrency(value)
}

const convertCurrency = (value: string): string => {
  isCopy.value = false
  console.log(value)
  const encodeString = EncodeUtils.base64Encode(EncodeUtils.utf8Encode(value))
  console.log(encodeString)
  convertValue.value = encodeString
  isCopy.value = true
  return encodeString
}

const clipboardData = () => {
  if (!isCopy.value) {
    return
  }
  uni.setClipboardData({
    data: convertValue.value,
    success: function () {
      console.log('success')
      uni.showToast({
        title: '复制成功',
        duration: 1000
      })
    }
  })
}

// Base64 解码
const convertData1 = (value: string) => {
  console.log(value)
  if (value === '') {
    uni.showToast({
      icon: 'none',
      title: '输入框不能为空',
      duration: 1000
    })
    return false
  }
  const result = convertCurrency1(value)
  if (result) {
    convertValue1.value = result
  }
}

const convertCurrency1 = (value: string): string | undefined => {
  isCopy1.value = false
  console.log(value)
  const decodeString = EncodeUtils.utf8Decode(EncodeUtils.base64Decode(value))
  console.log(decodeString)
  if (decodeString) {
    convertValue1.value = decodeString
    isCopy1.value = true
    return decodeString
  } else {
    uni.showToast({
      icon: 'error',
      title: '无法解码',
      duration: 1000
    })
  }
}

const clipboardData1 = () => {
  if (!isCopy1.value) {
    return
  }
  uni.setClipboardData({
    data: convertValue1.value,
    success: function () {
      console.log('success')
      uni.showToast({
        title: '复制成功',
        duration: 1000
      })
    }
  })
}

// MD5 计算
const convertData3 = (value: string) => {
  console.log(value)
  const result = convertCurrency3(value)
  if (result) {
    convertValue3.value = result
  }
}

const convertCurrency3 = (value: string): string | undefined => {
  isCopy3.value = false
  console.log(value)
  const decodeString = EncodeUtils.md5(value)
  console.log(decodeString)
  if (decodeString) {
    convertValue3.value = decodeString
    isCopy3.value = true
    return decodeString
  } else {
    uni.showToast({
      icon: 'error',
      title: '无法解码',
      duration: 1000
    })
  }
}

const clipboardData3 = () => {
  if (!isCopy3.value) {
    return
  }
  uni.setClipboardData({
    data: convertValue3.value,
    success: function () {
      console.log('success')
      uni.showToast({
        title: '复制成功',
        duration: 1000
      })
    }
  })
}
</script>

<style lang="less">
.content {
  padding: 20px;

  .uni-input {
    border: 1px solid #ccc;
    border-radius: 5px;
    min-height: 25px;
    width: 93.333%;
    padding: 10px;
  }

  .content-input {
    margin-bottom: 20px;
  }

  .text-content {
    word-break: break-all;
  }

  .line {
    border-bottom: 1px solid #000;
    width: 100%;
    margin: 50px 0;
  }
}
</style>
