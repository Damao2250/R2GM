<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="💰 金额转大写" subtitle="数字金额秒变大写" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 主转换区域 -->
      <view class="main-card">
        <view class="section-title">💰 金额输入</view>
        <view class="input-wrapper">
          <input class="amount-input" v-model="currencyValue" type="digit" placeholder="输入金额" @input="validateInput" />
          <view v-if="errorMessage" class="error-tip">{{ errorMessage }}</view>
        </view>

        <!-- 快速金额按钮 -->
        <view class="quick-amounts">
          <view class="quick-title">快速选择</view>
          <view class="quick-buttons">
            <view class="quick-btn" @tap="quickConvert('100')">100</view>
            <view class="quick-btn" @tap="quickConvert('1000')">1千</view>
            <view class="quick-btn" @tap="quickConvert('10000')">1万</view>
            <view class="quick-btn" @tap="quickConvert('100000')">10万</view>
            <view class="quick-btn" @tap="quickConvert('1000000')">百万</view>
            <view class="quick-btn" @tap="quickConvert('10000000')">千万</view>
          </view>
        </view>

        <!-- 转换按钮 -->
        <view class="convert-btn" @tap="convertData(currencyValue)"> 🔄 立即转换 </view>
      </view>

      <!-- 结果显示卡片 -->
      <view class="result-card" v-if="convertValue">
        <view class="section-title">✨ 转换结果</view>
        <view class="result-display">
          <text class="result-text">{{ convertValue }}</text>
        </view>
        <view class="result-actions">
          <view class="action-btn copy-btn" @tap="clipboardData"> 📋 复制 </view>
          <view class="action-btn reverse-btn" @tap="convertFromChinese"> ↩️ 反向转换 </view>
        </view>
      </view>

      <!-- 批量转换卡片 -->
      <view class="batch-card">
        <view class="section-title">📊 批量转换</view>
        <textarea class="batch-textarea" v-model="batchInput" placeholder="每行输入一个金额，如：\n123.45\n1000\n50000" />
        <view class="batch-actions">
          <view class="batch-btn" @tap="batchConvert">🔄 批量转换</view>
          <view class="batch-btn copy-all-btn" :class="{ disabled: !batchResults.length }" @tap="copyBatchResults">
            📋 复制全部
          </view>
        </view>

        <!-- 批量结果 -->
        <view v-if="batchResults.length" class="batch-results">
          <view v-for="(result, index) in batchResults" :key="index" class="batch-result-item">
            <text class="batch-input-text">{{ result.input }}</text>
            <text class="batch-arrow">→</text>
            <text class="batch-output-text">{{ result.output }}</text>
          </view>
        </view>
      </view>

      <!-- 转换历史 -->
      <view class="history-card" v-if="history.length">
        <view class="history-header">
          <view class="section-title">📜 转换历史</view>
          <view class="clear-btn" @tap="clearHistory">清空</view>
        </view>
        <view class="history-list">
          <view v-for="(item, index) in history" :key="index" class="history-item" @tap="useHistory(item)">
            <view class="history-main">
              <text class="history-number">{{ item.numeric }}</text>
              <text class="history-arrow">→</text>
              <text class="history-chinese">{{ item.chinese }}</text>
            </view>
            <text class="history-time">{{ formatTime(item.timestamp) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '金额转大写 - DM工具箱',
    path: '/pages/components/convertCurrency/convertCurrency'
  })
}
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import dayjs from '@/utils/dayjs'

const currencyValue = ref('')
const convertValue = ref('')
const isCopy = ref(false)
const isNumericCopyable = ref(false)
const errorMessage = ref('')
const batchInput = ref('')
const batchResults = ref<Array<{ input: string; output: string }>>([])
const history = ref<Array<{ numeric: string; chinese: string; timestamp: number }>>([])

// 初始化：加载历史记录
onMounted(() => {
  loadHistory()
})

// 验证输入（实时错误提示）
const validateInput = () => {
  errorMessage.value = ''
  if (currencyValue.value === '') {
    return
  }

  if (currencyValue.value.match(/[^,.\d]/)) {
    errorMessage.value = '输入字符串中的字符无效！只允许数字、逗号和小数点'
    return
  }

  const cleanValue = currencyValue.value.replace(/,/g, '')
  if (Number(cleanValue) > 99999999999.99) {
    errorMessage.value = '金额过大！请输入不超过999亿9999万9999.99的金额'
    return
  }

  if (!cleanValue.match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/)) {
    errorMessage.value = '金额格式不正确！如：123.45 或 1,234.56'
    return
  }
}

// 快速转换模板
const quickConvert = (amount: string) => {
  currencyValue.value = amount
  errorMessage.value = ''
  convertData(amount)
}

const convertData = (value: string) => {
  isNumericCopyable.value = false
  errorMessage.value = ''
  convertValue.value = convertCurrency(value)

  // 检查返回结果是否包含中文大写数字（成功转换的标志）
  if (
    /[\u96f6\u4e00\u58f9\u8d30\u53c1\u8086\u4f0d\u9686\u67d2\u634c\u7396]/.test(convertValue.value)
  ) {
    isNumericCopyable.value = true
    // 添加到历史记录
    addToHistory(value, convertValue.value)
  }
}

// 添加到历史记录
const addToHistory = (numeric: string, chinese: string) => {
  const newRecord = {
    numeric: numeric.replace(/,/g, ''),
    chinese: chinese,
    timestamp: dayjs().valueOf()
  }

  // 避免重复添加
  if (
    history.value.length > 0 &&
    history.value[0].numeric === newRecord.numeric &&
    history.value[0].chinese === newRecord.chinese
  ) {
    return
  }

  history.value.unshift(newRecord)

  // 只保留最近20条记录
  if (history.value.length > 20) {
    history.value.pop()
  }

  saveHistory()
}

// 使用历史记录
const useHistory = (item: any) => {
  currencyValue.value = item.numeric
  convertValue.value = item.chinese
  isCopy.value = true
  isNumericCopyable.value = true
  errorMessage.value = ''
}

// 清空历史记录
const clearHistory = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有历史记录吗？',
    success(res) {
      if (res.confirm) {
        history.value = []
        saveHistory()
        uni.showToast({
          title: '已清空',
          duration: 1000
        })
      }
    }
  })
}

// 最大历史记录数
const MAX_HISTORY_COUNT = 100

// 保存历史记录到本地存储
const saveHistory = () => {
  try {
    // 限制历史记录数量，保留最新的 50 条
    if (history.value.length > MAX_HISTORY_COUNT) {
      history.value = history.value.slice(0, MAX_HISTORY_COUNT)
    }
    uni.setStorageSync('convertHistory', JSON.stringify(history.value))
  } catch (e) {
    console.error('保存历史记录失败:', e)
  }
}

// 从本地存储加载历史记录
const loadHistory = () => {
  try {
    const saved = uni.getStorageSync('convertHistory')
    if (saved) {
      history.value = JSON.parse(saved)
    }
  } catch (e) {
    console.log('加载历史记录失败:', e)
  }
}

// 格式化时间显示
const formatTime = (timestamp: number): string => {
  const date = dayjs(timestamp)
  const now = dayjs()
  const diffMins = now.diff(date, 'minute')
  const diffHours = now.diff(date, 'hour')
  const diffDays = now.diff(date, 'day')

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`

  return date.format('M月D日')
}

// 批量转换
const batchConvert = () => {
  if (batchInput.value.trim() === '') {
    uni.showToast({
      title: '请输入金额',
      duration: 1000
    })
    return
  }

  const lines = batchInput.value
    .trim()
    .split('\n')
    .filter(line => line.trim())
  batchResults.value = []

  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed) {
      const result = convertCurrency(trimmed)
      batchResults.value.push({
        input: trimmed,
        output: result
      })
    }
  })

  if (batchResults.value.length === 0) {
    uni.showToast({
      title: '没有有效的金额',
      duration: 1000
    })
  } else {
    uni.showToast({
      title: `成功转换${batchResults.value.length}项`,
      duration: 1000
    })
  }
}

// 复制批量结果
const copyBatchResults = () => {
  const text = batchResults.value.map(item => `${item.input} → ${item.output}`).join('\n')

  uni.setClipboardData({
    data: text,
    success: function () {
      uni.showToast({
        title: '已复制批量结果',
        duration: 1000
      })
    }
  })
}

const clipboardData = () => {
  if (currencyValue.value === '') {
    uni.showToast({
      type: 'error',
      title: '输入框不能为空',
      duration: 1000
    })
    return
  }
  if (!isCopy.value) {
    return
  }
  uni.setClipboardData({
    data: convertValue.value,
    success: function () {
      uni.showToast({
        title: '复制成功',
        duration: 1000
      })
    }
  })
}

const convertFromChinese = () => {
  if (convertValue.value === '') {
    uni.showToast({
      icon: 'error',
      title: '输入框不能为空',
      duration: 1000
    })
    return
  }
  const result = chineseToNumeric(convertValue.value)
  if (result === '') {
    uni.showToast({
      icon: 'none',
      title: '转换失败，请输入正确的大写金额',
      duration: 1000
    })
    return
  }
  currencyValue.value = result
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

const chineseToNumeric = (chineseStr: string): string => {
  // 验证是否包含有效字符
  const validChars =
    /^[\u96f6\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u58f9\u8d30\u53c1\u8086\u4f0d\u9686\u67d2\u634c\u7396\u62fe\u767e\u4f70\u5343\u4edf\u4e07\u4ebf\u5143\u6574\u89d2\u5206\u3007]+$/.test(
      chineseStr
    )

  if (!validChars) {
    return ''
  }

  // 验证格式：必须包含"元"
  if (!chineseStr.includes('元')) {
    return ''
  }

  const chineseNum: { [key: string]: number } = {
    零: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    壹: 1,
    贰: 2,
    叁: 3,
    肆: 4,
    伍: 5,
    陆: 6,
    柒: 7,
    捌: 8,
    玖: 9
  }

  const chineseUnit: { [key: string]: number } = {
    拾: 10,
    佰: 100,
    仟: 1000,
    万: 10000,
    亿: 100000000
  }

  // 分离整数部分和小数部分
  const parts = chineseStr.split('元')
  if (parts.length !== 2) {
    return ''
  }

  const integerStr = parts[0]
  const decimalStr = parts[1]

  // 处理整数部分
  let integerResult = ''
  let current = 0
  let hasYi = false

  for (let i = 0; i < integerStr.length; i++) {
    const char = integerStr[i]

    if (chineseNum[char] !== undefined) {
      current = chineseNum[char]
    } else if (chineseUnit[char] !== undefined) {
      const unit = chineseUnit[char]
      if (unit === 100000000) {
        // 亿位
        integerResult += (current > 0 ? current : 1) * unit
        current = 0
        hasYi = true
      } else if (unit === 10000) {
        // 万位
        if (hasYi) {
          integerResult += (current > 0 ? current : 0) * unit
        } else {
          integerResult += (current > 0 ? current : 1) * unit
        }
        current = 0
      } else {
        // 千、百、十位
        current *= unit
      }
    } else {
      return ''
    }
  }

  // 加上剩余的数字
  integerResult += current

  // 处理小数部分
  let decimalResult = ''
  if (decimalStr && decimalStr !== '整') {
    // 验证小数部分格式
    const validDecimal =
      /^[\u89d2\u5206\u96f6\u58f9\u8d30\u53c1\u8086\u4f0d\u9686\u67d2\u634c\u7396]*$/.test(
        decimalStr
      )
    if (!validDecimal) {
      return ''
    }

    for (let i = 0; i < decimalStr.length; i++) {
      const char = decimalStr[i]
      if (char === '角') {
        if (chineseNum[decimalStr[i - 1]] !== undefined) {
          decimalResult += chineseNum[decimalStr[i - 1]]
        } else if (decimalStr[i - 1] === '零') {
          decimalResult += '0'
        }
      } else if (char === '分') {
        if (chineseNum[decimalStr[i - 1]] !== undefined) {
          decimalResult += chineseNum[decimalStr[i - 1]]
        }
      } else if (chineseNum[char] !== undefined) {
        // 数字处理
        continue
      }
    }
  }

  // 组合结果
  let result = String(integerResult)
  if (decimalResult) {
    result += '.' + decimalResult.substring(0, 2)
  }

  return result
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

/* 主转换卡片 */
.main-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.input-wrapper {
  margin-bottom: 30rpx;
}

.amount-input {
  width: 100%;
  height: 100rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 0 30rpx;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  border: 3rpx solid transparent;
  transition: all 0.3s;
  box-sizing: border-box;
  display: block;

  &:focus {
    background: white;
    border-color: #667eea;
  }
}

.error-tip {
  margin-top: 16rpx;
  padding: 16rpx 24rpx;
  background: rgba(255, 76, 76, 0.1);
  border-radius: 12rpx;
  color: #ff4c4c;
  font-size: 24rpx;
}

/* 快速金额 */
.quick-amounts {
  margin-bottom: 30rpx;
}

.quick-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.quick-btn {
  flex: 1;
  min-width: 140rpx;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
  transition: all 0.3s;

  &:active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: scale(0.95);
  }
}

.convert-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
  }
}

/* 结果卡片 */
.result-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.result-display {
  padding: 40rpx;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 30%);
  border-radius: 16rpx;
  margin-bottom: 30rpx;
}

.result-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.6;
  word-break: break-all;
}

.result-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  transition: all 0.3s;

  &.copy-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  }

  &.reverse-btn {
    background: white;
    color: #667eea;
    border: 2rpx solid #667eea;
  }

  &:active {
    transform: scale(0.95);
  }
}

/* 批量转换卡片 */
.batch-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.batch-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 30rpx;
  border: none;
  box-sizing: border-box;
  display: block;
}

.batch-actions {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.batch-btn {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s;

  &.copy-all-btn {
    background: white;
    color: #667eea;
    border: 2rpx solid #667eea;
    box-shadow: none;
  }

  &.disabled {
    opacity: 0.5;
  }

  &:active:not(.disabled) {
    transform: scale(0.95);
  }
}

.batch-results {
  border-top: 2rpx dashed #eee;
  padding-top: 30rpx;
}

.batch-result-item {
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.batch-input-text {
  font-size: 28rpx;
  color: #666;
  flex-shrink: 0;
}

.batch-arrow {
  color: #667eea;
  font-size: 28rpx;
  flex-shrink: 0;
}

.batch-output-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  flex: 1;
  word-break: break-all;
}

/* 历史记录卡片 */
.history-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  border-top: 3px solid #667eea;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;

  .section-title {
    margin-bottom: 0;
  }
}

.clear-btn {
  padding: 12rpx 28rpx;
  background: #ff4c4c;
  color: white;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: bold;
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
  }
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 16rpx;
  margin-bottom: 8rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  border-left: 4rpx solid #667eea;
  cursor: pointer;
  transition: all 0.2s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
}

.history-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.history-number {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

.history-arrow {
  display: none;
}

.history-chinese {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
  word-break: break-all;
  line-height: 1.3;
}

.history-time {
  font-size: 20rpx;
  color: #999;
  flex-shrink: 0;
}

// 美化滚动条
.history-list::-webkit-scrollbar {
  width: 3px;
}

.history-list::-webkit-scrollbar-track {
  background: transparent;
}

.history-list::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 2px;

  &:hover {
    background: #b0b0b0;
  }
}
</style>
