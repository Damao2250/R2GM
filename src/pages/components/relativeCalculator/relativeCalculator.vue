<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <PageHeader title="👨‍👩‍👧‍👦 亲戚计算器" subtitle="快速查询家庭称谓关系" />

    <!-- 说明卡片 -->
    <view class="guide-card">
      <text class="guide-text">💡 支持输入文字或点击按钮快速构建关系链，轻松查询家庭称谓关系</text>
    </view>

    <!-- 文字输入模式 -->
    <view class="card">
      <view class="card-title">方式一：文字输入</view>
      <view class="input-section">
        <input class="relation-input" v-model="inputText" placeholder="例如：爸爸的妈妈、妈妈的哥哥的女儿" @input="onInputChange" />
        <view class="input-actions">
          <view class="input-tip">支持多种叫法：爸/爹/老爸、妈/娘/老妈等</view>
          <button class="clear-btn" @tap="clearInput" v-if="inputText">清空</button>
        </view>
      </view>
      <view class="result-box" v-if="inputResult">
        <view class="result-label">计算结果：</view>
        <view class="result-text">{{ inputResult }}</view>
      </view>
    </view>

    <!-- 快捷按钮模式 -->
    <view class="card">
      <view class="card-title">方式二：快捷按钮</view>
      <view class="result-section">
        <view class="result-info">
          <view class="result-label">当前称呼</view>
          <view class="result-value">{{ buttonResult || '待查询' }}</view>
        </view>
        <view class="step-display" v-if="relationChain.length > 0">
          <view class="step-item" v-for="(item, index) in relationChain" :key="index">
            <view class="step-number">{{ index + 1 }}</view>
            <view class="step-name">{{ item }}</view>
            <view class="step-close" @tap="removeStep(index)">✕</view>
          </view>
          <view class="reset-btn-inline" @tap="resetRelations">🔄 重置</view>
        </view>
        <view v-else class="empty-state">
          👇 点击下方按钮构建关系
        </view>
      </view>

      <view class="button-section">
        <view class="card-title">{{ relationChain.length === 0 ? '选择对方是你的' : `然后${relationChain[relationChain.length -
          1]}的` }}</view>
        <view class="button-grid">
          <view class="btn" @tap="addRelation('爸爸')">👨 爸爸</view>
          <view class="btn" @tap="addRelation('妈妈')">👩 妈妈</view>
          <view class="btn" @tap="addRelation('哥哥')">🧔 哥哥</view>
          <view class="btn" @tap="addRelation('姐姐')">👧 姐姐</view>
          <view class="btn" @tap="addRelation('弟弟')">👦 弟弟</view>
          <view class="btn" @tap="addRelation('妹妹')">👧 妹妹</view>
          <view class="btn" @tap="addRelation('儿子')" v-if="relationChain.length > 0">👶 儿子</view>
          <view class="btn" @tap="addRelation('女儿')" v-if="relationChain.length > 0">👶 女儿</view>
          <view class="btn" @tap="addRelation('丈夫')" v-if="relationChain.length > 0">💍 丈夫</view>
          <view class="btn" @tap="addRelation('妻子')" v-if="relationChain.length > 0">💍 妻子</view>
        </view>
      </view>
    </view>

    <!-- 快速示例 -->
    <view class="card">
      <view class="card-title">快速示例</view>
      <view class="example-grid">
        <view class="example-btn" @tap="loadExample('爸爸的爸爸')">爷爷</view>
        <view class="example-btn" @tap="loadExample('妈妈的妈妈')">外婆</view>
        <view class="example-btn" @tap="loadExample('爸爸的哥哥')">伯父</view>
        <view class="example-btn" @tap="loadExample('妈妈的哥哥')">舅舅</view>
        <view class="example-btn" @tap="loadExample('哥哥的儿子')">侄子</view>
        <view class="example-btn" @tap="loadExample('儿子的儿子')">孙子</view>
        <view class="example-btn" @tap="loadExample('爸爸的姐姐的儿子')">表哥/表弟</view>
        <view class="example-btn" @tap="loadExample('丈夫的爸爸')">公公</view>
      </view>
    </view>


  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '亲戚计算器 - DM工具箱',
    path: '/pages/components/relativeCalculator/relativeCalculator'
  })
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
// @ts-ignore
import relationship from 'relationship.js'

// 文字输入模式
const inputText = ref<string>('')
const inputResult = ref<string>('')

// 快捷按钮模式
const relationChain = ref<string[]>([])
const buttonResult = ref<string>('')

/**
 * 文字输入变化时计算结果
 */
function onInputChange() {
  if (!inputText.value.trim()) {
    inputResult.value = ''
    return
  }

  try {
    const result = relationship({ text: inputText.value.trim() })
    if (result && result.length > 0) {
      // 如果有多个结果，显示所有可能的称呼
      inputResult.value = result.join('、')
    } else {
      inputResult.value = '未找到匹配的称呼'
    }
  } catch (error) {
    inputResult.value = '输入格式有误，请检查后重试'
    console.error('计算错误:', error)
  }
}

/**
 * 清空文字输入
 */
function clearInput() {
  inputText.value = ''
  inputResult.value = ''
}

/**
 * 添加关系（按钮模式）
 */
function addRelation(relationName: string) {
  relationChain.value.push(relationName)
  calculateButtonResult()
}

/**
 * 移除某一步
 */
function removeStep(index: number) {
  relationChain.value.splice(index, 1)
  calculateButtonResult()
}

/**
 * 重置按钮模式
 */
function resetRelations() {
  relationChain.value = []
  buttonResult.value = ''
}

/**
 * 计算按钮模式的结果
 */
function calculateButtonResult() {
  if (relationChain.value.length === 0) {
    buttonResult.value = ''
    return
  }

  try {
    // 将关系链用"的"连接
    const text = relationChain.value.join('的')
    const result = relationship({ text })

    if (result && result.length > 0) {
      // 如果有多个结果，显示所有可能的称呼
      buttonResult.value = result.join('、')
    } else {
      buttonResult.value = '未找到匹配的称呼'
    }
  } catch (error) {
    buttonResult.value = '计算出错'
    console.error('计算错误:', error)
  }
}

/**
 * 加载示例
 */
function loadExample(example: string) {
  inputText.value = example
  onInputChange()
}

// 监听关系链变化
watch(relationChain, () => {
  calculateButtonResult()
}, { deep: true })
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0 0 40rpx 0;
}

/* 说明卡片 */
.guide-card {
  margin: 20rpx 30rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);

  .guide-text {
    font-size: 26rpx;
    color: white;
    line-height: 1.8;
  }
}

/* 卡片 */
.card {
  margin: 20rpx 30rpx;
  padding: 24rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  padding-bottom: 12rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

/* 文字输入区域 */
.input-section {
  .relation-input {
    width: 100%;
    min-height: 80rpx;
    padding: 20rpx 24rpx;
    font-size: 32rpx;
    line-height: 1.5;
    border: 2rpx solid #e0e0e0;
    border-radius: 12rpx;
    box-sizing: border-box;

    &:focus {
      border-color: #667eea;
    }
  }

  .input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16rpx;
  }

  .input-tip {
    font-size: 22rpx;
    color: #999;
    flex: 1;
  }

  .clear-btn {
    padding: 8rpx 24rpx;
    background: #f5576c;
    color: white;
    border-radius: 8rpx;
    font-size: 24rpx;
    border: none;

    &:active {
      opacity: 0.8;
    }
  }
}

.result-box {
  margin-top: 24rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 12rpx;

  .result-label {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 8rpx;
  }

  .result-text {
    font-size: 36rpx;
    font-weight: bold;
    color: white;
    line-height: 1.4;
  }
}

/* 结果展示区（按钮模式） */
.result-section {
  padding: 20rpx 0;
}

.result-info {
  text-align: center;
  margin-bottom: 20rpx;
}

.result-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.result-value {
  font-size: 48rpx;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  min-height: 60rpx;
  line-height: 60rpx;
}

/* 步骤显示 */
.step-display {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f0f0f0;
}

.step-item {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 8rpx;
  padding: 10rpx 16rpx;
  gap: 8rpx;
  font-size: 24rpx;
}

.step-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: bold;
}

.step-name {
  color: #333;
  font-weight: 500;
}

.step-close {
  color: #999;
  font-size: 20rpx;
  padding: 0 6rpx;
  margin-left: 4rpx;

  &:active {
    color: #f5576c;
  }
}

.reset-btn-inline {
  margin-left: auto;
  padding: 10rpx 20rpx;
  background: linear-gradient(135deg, #f5576c 0%, #ff6b6b 100%);
  color: white;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;

  &:active {
    opacity: 0.8;
  }
}

.empty-state {
  text-align: center;
  padding: 20rpx 0;
  color: #999;
  font-size: 26rpx;
}

/* 按钮区域 */
.button-section {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #f0f0f0;
}

/* 按钮网格 */
.button-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.btn {
  padding: 16rpx 8rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.25);

  &:active {
    transform: scale(0.96);
    box-shadow: 0 1rpx 4rpx rgba(102, 126, 234, 0.2);
  }
}

/* 示例按钮 */
.example-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.example-btn {
  padding: 16rpx 8rpx;
  background: #f5f7fa;
  color: #333;
  border-radius: 12rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 500;
  border: 2rpx solid #e0e0e0;
  transition: all 0.2s;

  &:active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;
    transform: scale(0.96);
  }
}

/* 信息卡片 */
.info-card {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);

  .info-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #2d3436;
    margin-bottom: 16rpx;
  }

  .info-content {
    font-size: 24rpx;
    color: #2d3436;
    line-height: 1.8;

    .highlight {
      font-weight: bold;
      color: #d63031;
    }

    .info-item {
      display: block;
      margin-top: 8rpx;
      padding-left: 8rpx;
    }
  }
}
</style>
