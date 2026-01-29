<template>
  <view class="page-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">金额转大写</text>
    </view>

    <!-- 页面内容 -->
    <view class="page-content">
      <view class="card">
        <view class="input-group">
          <view class="input-label">请输入数字金额</view>
          <wd-input
            v-model="currencyValue"
            placeholder="请输入数字金额，如：123.45"
          />
        </view>

        <view class="button-group">
          <button class="wd-button primary" @click="convertData(currencyValue)">
            转换123
          </button>
        </view>
      </view>

      <!-- 结果显示卡片 -->
      <view v-if="convertValue" class="card">
        <view class="result-label">转换结果：</view>
        <view class="text-display" selectable user-select>
          {{ convertValue }}
        </view>
        <button
          class="wd-button primary full-width"
          :disabled="!isCopy"
          @click="clipboardData"
        >
          {{ isCopy ? '点击复制' : '无法复制' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currencyValue = ref('')
const convertValue = ref('')
const isCopy = ref(false)

const convertData = (value: string) => {
  console.log(value)
  convertValue.value = convertCurrency(value)
}

const clipboardData = () => {
  if (currencyValue.value === '') {
    uni.showToast({
      title: '输入框不能为空',
      duration: 1000
    })
  }
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

const convertCurrency = (currencyDigits: string | number): string => {
  isCopy.value = false

  if (typeof currencyDigits === 'number') currencyDigits = String(currencyDigits)
  if ('' === currencyDigits) {
    return '不能为空 请输入数字金额!如：123.23'
  }
  if (null != currencyDigits.match(/[^,.\d]/)) {
    return '输入字符串中的字符无效!'
  }
  if (null == currencyDigits.match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/)) {
    return '请输入正确的数字金额!'
  }
  currencyDigits = currencyDigits.replace(/,/g, '').replace(/^0+/, '')
  if (Number(currencyDigits) > 99999999999.99) {
    return '数字太大啦'
  }

  const parts = currencyDigits.split('.')
  const integral = parts[0]
  const decimal = parts.length > 1 ? parts[1].substr(0, 2) : ''

  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const radices = ['', '拾', '佰', '仟']
  const bigRadices = ['', '万', '亿']
  const decimals = ['角', '分']
  let outputCharacters = ''

  if (Number(integral) > 0) {
    let zeroCount = 0
    for (let i = 0; i < integral.length; i++) {
      const p = integral.length - i - 1
      const quotient = Math.floor(p / 4)
      const modulus = p % 4
      const d = integral.substr(i, 1)
      if ('0' === d) {
        zeroCount++
      } else {
        if (zeroCount > 0) {
          outputCharacters += digits[0]
        }
        zeroCount = 0
        outputCharacters += digits[Number(d)] + radices[modulus]
      }
      if (0 === modulus && zeroCount < 4) {
        outputCharacters += bigRadices[quotient]
      }
    }
    outputCharacters += '元'
  }

  if ('' !== decimal) {
    for (let i = 0; i < decimal.length; i++) {
      const d = decimal.substr(i, 1)
      const ds = decimal.substr(-1, 1)
      if (d === '0') {
        if (ds !== '0') {
          outputCharacters += digits[Number(d)]
        }
      } else {
        outputCharacters += digits[Number(d)] + decimals[i]
      }
    }
  }

  isCopy.value = true
  if ('' === outputCharacters) {
    outputCharacters = '零元'
  }
  if ('' === decimal) {
    outputCharacters += '整'
  }
  return outputCharacters
}
</script>

<style lang="scss" scoped>
@use '../../../styles/theme.scss' as *;

.page-container {
  min-height: 100vh;
  background-color: $app-bg-primary;
}

.page-header {
  padding: $app-spacing-lg;
  background-color: #f5f6fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $app-text-primary;
  border-bottom: 1px solid #e5e5e5;
  position: relative;
  /* #ifdef H5 */
  background: linear-gradient(180deg, #ffffff 0%, #f5f6fa 100%);
  /* #endif */

  .page-title {
    font-size: $app-font-size-2xl;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: #4a63d2;
    margin: 0;
  }
}

.page-content {
  padding: $app-spacing-lg;
}

.card {
  background-color: $app-bg-secondary;
  border-radius: $app-border-radius-md;
  padding: $app-spacing-lg;
  margin-bottom: $app-spacing-lg;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: $app-spacing-lg;

  .input-label {
    font-size: $app-font-size-sm;
    color: $app-text-primary;
    margin-bottom: $app-spacing-sm;
    font-weight: 500;
  }

  :deep(.wd-input__input) {
    padding: 10px $app-spacing-md;
  }
}

.button-group {
  display: flex;
  gap: $app-spacing-md;
}


.result-label {
  font-size: $app-font-size-sm;
  color: $app-text-primary;
  font-weight: 500;
  margin-bottom: $app-spacing-md;
}

.text-display {
  background-color: $app-bg-primary;
  padding: $app-spacing-md;
  border-radius: $app-border-radius-md;
  margin-bottom: $app-spacing-lg;
  border-left: 4px solid $app-primary-color;
  word-break: break-all;
  min-height: 60px;
  display: flex;
  align-items: center;
  font-size: $app-font-size-base;
  color: $app-text-primary;
}
</style>
