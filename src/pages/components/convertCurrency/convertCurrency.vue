<template>
  <view class="content">
    <view class="content-input">
      <input
        class="uni-input"
        v-model="currencyValue"
        type="digit"
        :maxlength="15"
        focus
        placeholder="请输入金额数字"
      />
    </view>
    <view class="content-input">
      <button type="primary" @click="convertData(currencyValue)">转换</button>
    </view>
    <view class="content-input">
      <text class="text-content" selectable user-select>{{ convertValue }}</text>
    </view>
    <button type="primary" :disabled="!isCopy" @click="clipboardData">点击复制</button>
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

<style lang="less">
.content {
  padding: 20px;

  .uni-input {
    border: 1px solid #ccc;
    border-radius: 5px;
    height: 45px;
    padding: 0 10px;
  }

  .content-input {
    margin-bottom: 20px;
  }

  .text-content {
    word-break: break-all;
  }
}
</style>
