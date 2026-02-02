<template>
  <view class="page-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">金额转大写</text>
    </view>

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 单项转换卡片 -->
      <view class="card">
        <view class="card-title">单项转换</view>
        <view class="input-group">
          <view class="input-label">请输入金额：</view>
          <wd-input v-model="currencyValue" placeholder="请输入金额，如：123.45" @input="validateInput" clearable />
          <!-- 实时错误提示 -->
          <view v-if="errorMessage" class="error-message">{{ errorMessage }}</view>
        </view>

        <!-- 快速转换模板 -->
        <view class="template-section">
          <view class="template-label">快速转换：</view>
          <view class="template-buttons">
            <wd-button size="small" type="info" @click="quickConvert('100')">100</wd-button>
            <wd-button size="small" type="info" @click="quickConvert('1000')">1000</wd-button>
            <wd-button size="small" type="info" @click="quickConvert('10000')">1万</wd-button>
            <wd-button size="small" type="info" @click="quickConvert('100000')">10万</wd-button>
            <wd-button size="small" type="info" @click="quickConvert('1000000')">100万</wd-button>
            <wd-button size="small" type="info" @click="quickConvert('10000000')">1000万</wd-button>
          </view>
        </view>

        <view class="button-group">
          <wd-button block @click="convertData(currencyValue)">
            转换
          </wd-button>
          <wd-button block type="success" :disabled="!isNumericCopyable" @click="copyNumericValue">
            {{ isNumericCopyable ? '复制' : '无法复制' }}
          </wd-button>
        </view>
      </view>

      <!-- 结果显示卡片 -->
      <view class="card">
        <view class="card-title">转换结果</view>
        <view class="result-label">大写金额：</view>
        <wd-input v-model="convertValue" placeholder="大写金额" clearable />
        <view class="button-group">
          <wd-button type="success" :disabled="!isCopy" block @click="clipboardData">
            {{ isCopy ? '复制' : '无法复制' }}
          </wd-button>
          <wd-button block @click="convertFromChinese">
            反向转换
          </wd-button>
        </view>
      </view>

      <!-- 批量转换卡片 -->
      <view class="card">
        <view class="card-title">批量转换</view>
        <view class="input-group">
          <view class="input-label">输入金额（每行一个）：</view>
          <textarea v-model="batchInput" placeholder="如：123.45, 1000, 50000" class="batch-textarea" />
        </view>
        <view class="button-group">
          <wd-button block @click="batchConvert">
            批量转换
          </wd-button>
          <wd-button block type="success" :disabled="!batchResults.length" @click="copyBatchResults">
            {{ batchResults.length ? '复制结果' : '暂无结果' }}
          </wd-button>
        </view>
        <!-- 批量结果显示 -->
        <view v-if="batchResults.length" class="batch-results">
          <view class="batch-title">转换结果：</view>
          <view v-for="(result, index) in batchResults" :key="index" class="batch-item">
            <view class="batch-input">{{ result.input }}</view>
            <view class="batch-arrow">→</view>
            <view class="batch-output">{{ result.output }}</view>
          </view>
        </view>
      </view>

      <!-- 转换历史卡片 -->
      <view class="card">
        <view class="card-title-with-action">
          <view class="card-title">转换历史</view>
          <wd-button v-if="history.length" size="small" type="error" @click="clearHistory">清空</wd-button>
        </view>
        <view v-if="history.length === 0" class="empty-message">暂无历史记录</view>
        <view v-else class="history-list">
          <view v-for="(item, index) in history" :key="index" class="history-item">
            <view class="history-content" @click="useHistory(item)">
              <view class="history-numeric">{{ item.numeric }}</view>
              <view class="history-arrow">→</view>
              <view class="history-chinese">{{ item.chinese }}</view>
            </view>
            <view class="history-time">{{ formatTime(item.timestamp) }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

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
  if (/[\u96f6\u4e00\u58f9\u8d30\u53c1\u8086\u4f0d\u9686\u67d2\u634c\u7396]/.test(convertValue.value)) {
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
    timestamp: Date.now()
  }

  // 避免重复添加
  if (history.value.length > 0 &&
    history.value[0].numeric === newRecord.numeric &&
    history.value[0].chinese === newRecord.chinese) {
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
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`

  return `${date.getMonth() + 1}月${date.getDate()}日`
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

  const lines = batchInput.value.trim().split('\n').filter(line => line.trim())
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
  const text = batchResults.value
    .map(item => `${item.input} → ${item.output}`)
    .join('\n')

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

const copyNumericValue = () => {
  if (currencyValue.value === '') {
    uni.showToast({
      title: '输入框不能为空',
      duration: 1000
    })
    return
  }
  uni.setClipboardData({
    data: currencyValue.value,
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
  const validChars = /^[\u96f6\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u58f9\u8d30\u53c1\u8086\u4f0d\u9686\u67d2\u634c\u7396\u62fe\u767e\u4f70\u5343\u4edf\u4e07\u4ebf\u5143\u6574\u89d2\u5206\u3007]+$/.test(chineseStr)

  if (!validChars) {
    return ''
  }

  // 验证格式：必须包含"元"
  if (!chineseStr.includes('元')) {
    return ''
  }

  const chineseNum: { [key: string]: number } = {
    '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
    '壹': 1, '贰': 2, '叁': 3, '肆': 4, '伍': 5, '陆': 6, '柒': 7, '捌': 8, '玖': 9
  }

  const chineseUnit: { [key: string]: number } = {
    '拾': 10, '佰': 100, '仟': 1000, '万': 10000, '亿': 100000000
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
  let hasWan = false

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
        hasWan = true
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
    const validDecimal = /^[\u89d2\u5206\u96f6\u58f9\u8d30\u53c1\u8086\u4f0d\u9686\u67d2\u634c\u7396]*$/.test(decimalStr)
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

.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding-bottom: 20px;
}

.page-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  .page-title {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: #ffffff;
    margin: 0;
  }
}

.page-content {
  padding: 16px;
}

.card {
  background-color: $app-bg-secondary;
  border-radius: $app-border-radius-md;
  padding: $app-spacing-lg;
  margin-bottom: $app-spacing-lg;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: $app-font-size-base;
  font-weight: 600;
  color: $app-text-primary;
  margin-bottom: $app-spacing-md;
  padding-bottom: $app-spacing-sm;
  border-bottom: 2px solid #4a63d2;
}

.card-title-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .card-title {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
    flex: 1;
  }
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

// 实时错误提示
.error-message {
  color: #d32f2f;
  font-size: $app-font-size-xs;
  margin-top: $app-spacing-xs;
  padding: $app-spacing-sm;
  background-color: rgba(211, 47, 47, 0.1);
  border-radius: $app-border-radius-sm;
}

// 快速转换模板
.template-section {
  margin-bottom: $app-spacing-lg;

  .template-label {
    font-size: $app-font-size-sm;
    color: $app-text-primary;
    margin-bottom: $app-spacing-sm;
    font-weight: 500;
  }

  .template-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $app-spacing-sm;
  }
}

.button-group {
  display: flex;
  gap: $app-spacing-md;
  margin-top: $app-spacing-lg;
  justify-content: center;
}

.result-label {
  font-size: $app-font-size-sm;
  color: $app-text-primary;
  font-weight: 500;
  margin-bottom: $app-spacing-md;
}

// 批量转换样式
.batch-textarea {
  width: 100%;
  padding: $app-spacing-md;
  border: 1px solid #e0e0e0;
  border-radius: $app-border-radius-md;
  font-size: $app-font-size-base;
  color: $app-text-primary;
  background-color: $app-bg-primary;
  min-height: 100px;
  resize: vertical;
  margin-bottom: $app-spacing-lg;
}

.batch-results {
  margin-top: $app-spacing-lg;
  padding-top: $app-spacing-lg;
  border-top: 1px solid #e0e0e0;

  .batch-title {
    font-size: $app-font-size-sm;
    color: $app-text-primary;
    font-weight: 500;
    margin-bottom: $app-spacing-md;
  }

  .batch-item {
    display: flex;
    align-items: center;
    padding: $app-spacing-sm;
    background-color: $app-bg-primary;
    border-radius: $app-border-radius-sm;
    margin-bottom: $app-spacing-sm;
    gap: $app-spacing-sm;

    .batch-input {
      flex: 0 0 auto;
      min-width: 80px;
      padding: $app-spacing-xs $app-spacing-sm;
      background-color: #f0f0f0;
      border-radius: $app-border-radius-sm;
      font-size: $app-font-size-sm;
      text-align: center;
    }

    .batch-arrow {
      flex: 0 0 auto;
      color: #999;
      font-size: $app-font-size-sm;
    }

    .batch-output {
      flex: 1;
      padding: $app-spacing-xs $app-spacing-sm;
      color: $app-text-primary;
      font-size: $app-font-size-sm;
      word-break: break-word;
    }
  }
}

// 转换历史样式
.empty-message {
  text-align: center;
  color: #999;
  padding: $app-spacing-lg;
  font-size: $app-font-size-sm;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: $app-spacing-sm;
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $app-spacing-md;
  background-color: $app-bg-primary;
  border-radius: $app-border-radius-md;
  border-left: 4px solid #4a63d2;

  .history-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: $app-spacing-sm;
    cursor: pointer;

    .history-numeric {
      padding: $app-spacing-xs $app-spacing-sm;
      background-color: #f0f0f0;
      border-radius: $app-border-radius-sm;
      font-size: $app-font-size-sm;
      min-width: 60px;
      text-align: center;
    }

    .history-arrow {
      color: #999;
    }

    .history-chinese {
      flex: 1;
      color: $app-text-primary;
      font-size: $app-font-size-sm;
      word-break: break-word;
    }
  }

  .history-time {
    flex: 0 0 auto;
    color: #999;
    font-size: $app-font-size-xs;
    margin-left: $app-spacing-sm;
  }
}
</style>
