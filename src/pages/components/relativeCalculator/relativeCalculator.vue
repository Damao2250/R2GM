<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <PageHeader title="👨‍👩‍👧‍👦 亲戚计算器" subtitle="三姑六婆称呼不再愁" />

    <!-- 结果显示区 -->
    <view class="result-card">
      <view class="result-label">称呼结果</view>
      <view class="result-value">{{ result || '请选择关系' }}</view>
      <view v-if="relationChain.length > 0" class="chain-display">
        <text class="chain-text">我的</text>
        <text v-for="(item, index) in relationChain" :key="index" class="chain-item">
          {{ item }}{{ index < relationChain.length - 1 ? '的' : '' }} </text>
      </view>

      <!-- 操作按钮（移到结果卡片内） -->
      <view class="action-buttons-inline">
        <view class="action-btn undo-btn" @tap="undoRelation"> ↶ 撤销 </view>
        <view class="action-btn reset-btn" @tap="resetRelations"> 🔄 重置 </view>
      </view>
    </view>

    <!-- 性别选择 -->
    <view class="gender-section">
      <view class="section-title">目标性别</view>
      <view class="gender-buttons">
        <view class="gender-btn" :class="{ active: targetGender === 'male' }" @tap="setTargetGender('male')">
          👨 男性
        </view>
        <view class="gender-btn" :class="{ active: targetGender === 'female' }" @tap="setTargetGender('female')">
          👩 女性
        </view>
        <view class="gender-btn" :class="{ active: targetGender === '' }" @tap="setTargetGender('')">
          ❓ 不确定
        </view>
      </view>
    </view>

    <!-- 关系选择按钮 -->
    <view class="relations-section">
      <view class="section-title">选择关系</view>

      <!-- 父母辈 -->
      <view class="relation-group">
        <view class="group-title">父母辈</view>
        <view class="relation-buttons">
          <view class="relation-btn" @tap="addRelation('f')">爸爸</view>
          <view class="relation-btn" @tap="addRelation('m')">妈妈</view>
        </view>
      </view>

      <!-- 兄弟姐妹 -->
      <view class="relation-group">
        <view class="group-title">兄弟姐妹</view>
        <view class="relation-buttons">
          <view class="relation-btn" @tap="addRelation('ob')">哥哥</view>
          <view class="relation-btn" @tap="addRelation('os')">姐姐</view>
          <view class="relation-btn" @tap="addRelation('lb')">弟弟</view>
          <view class="relation-btn" @tap="addRelation('ls')">妹妹</view>
        </view>
      </view>

      <!-- 配偶 -->
      <view class="relation-group">
        <view class="group-title">配偶</view>
        <view class="relation-buttons">
          <view class="relation-btn" @tap="addRelation('h')">丈夫</view>
          <view class="relation-btn" @tap="addRelation('w')">妻子</view>
        </view>
      </view>

      <!-- 子女 -->
      <view class="relation-group">
        <view class="group-title">子女</view>
        <view class="relation-buttons">
          <view class="relation-btn" @tap="addRelation('s')">儿子</view>
          <view class="relation-btn" @tap="addRelation('d')">女儿</view>
        </view>
      </view>
    </view>

    <!-- 常用示例 -->
    <view class="examples-section">
      <view class="section-title">常用示例</view>
      <view class="example-buttons">
        <view class="example-btn" @tap="loadExample('f,f')"> 爸爸的爸爸 </view>
        <view class="example-btn" @tap="loadExample('f,m')"> 爸爸的妈妈 </view>
        <view class="example-btn" @tap="loadExample('m,f')"> 妈妈的爸爸 </view>
        <view class="example-btn" @tap="loadExample('m,m')"> 妈妈的妈妈 </view>
        <view class="example-btn" @tap="loadExample('f,ob')"> 爸爸的哥哥 </view>
        <view class="example-btn" @tap="loadExample('m,ob')"> 妈妈的哥哥 </view>
        <view class="example-btn" @tap="loadExample('f,f,f')"> 爷爷的爸爸 </view>
        <view class="example-btn" @tap="loadExample('ob,s')"> 哥哥的儿子 </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'

// 关系链编码
const relationCode = ref<string>('')
// 关系链显示
const relationChain = ref<string[]>([])
// 目标性别
const targetGender = ref<string>('')

// 关系映射表
const relationMap: Record<string, string> = {
  f: '爸爸',
  m: '妈妈',
  h: '丈夫',
  w: '妻子',
  s: '儿子',
  d: '女儿',
  ob: '哥哥',
  lb: '弟弟',
  os: '姐姐',
  ls: '妹妹'
}

// 亲戚关系数据库
const relativeDatabase: Record<string, string | Record<string, string>> = {
  // 父母
  f: '爸爸',
  m: '妈妈',

  // 祖父母
  'f,f': '爷爷',
  'f,m': '奶奶',
  'm,f': '外公',
  'm,m': '外婆',

  // 曾祖父母
  'f,f,f': '曾祖父',
  'f,f,m': '曾祖母',
  'm,f,f': '外曾祖父',
  'm,f,m': '外曾祖母',

  // 伯叔姑
  'f,ob': '伯父',
  'f,ob,w': '伯母',
  'f,lb': '叔叔',
  'f,lb,w': '婶婶',
  'f,os': '姑妈',
  'f,os,h': '姑父',
  'f,ls': '姑妈',
  'f,ls,h': '姑父',

  // 舅姨
  'm,ob': '舅舅',
  'm,ob,w': '舅妈',
  'm,lb': '舅舅',
  'm,lb,w': '舅妈',
  'm,os': '姨妈',
  'm,os,h': '姨父',
  'm,ls': '姨妈',
  'm,ls,h': '姨父',

  // 兄弟姐妹
  ob: '哥哥',
  os: '姐姐',
  lb: '弟弟',
  ls: '妹妹',

  // 嫂子弟媳等
  'ob,w': '嫂子',
  'lb,w': '弟媳',
  'os,h': '姐夫',
  'ls,h': '妹夫',

  // 侄子侄女
  'ob,s': '侄子',
  'ob,d': '侄女',
  'lb,s': '侄子',
  'lb,d': '侄女',
  'os,s': '外甥',
  'os,d': '外甥女',
  'ls,s': '外甥',
  'ls,d': '外甥女',

  // 堂兄弟姐妹
  'f,ob,s': '堂哥',
  'f,ob,d': '堂姐',
  'f,lb,s': '堂弟',
  'f,lb,d': '堂妹',

  // 表兄弟姐妹
  'f,os,s': '表哥',
  'f,os,d': '表姐',
  'f,ls,s': '表弟',
  'f,ls,d': '表妹',
  'm,ob,s': '表哥',
  'm,ob,d': '表姐',
  'm,lb,s': '表弟',
  'm,lb,d': '表妹',
  'm,os,s': '表哥',
  'm,os,d': '表姐',
  'm,ls,s': '表弟',
  'm,ls,d': '表妹',

  // 子女
  s: '儿子',
  d: '女儿',
  's,w': '儿媳',
  'd,h': '女婿',

  // 孙子孙女
  's,s': '孙子',
  's,d': '孙女',
  'd,s': '外孙',
  'd,d': '外孙女',

  // 配偶
  h: '丈夫',
  w: '妻子',

  // 公婆岳父母
  'h,f': '公公',
  'h,m': '婆婆',
  'w,f': '岳父',
  'w,m': '岳母',

  // 连襟姑嫂
  'w,os,h': '连襟',
  'w,ls,h': '连襟',
  'h,ob,w': '妯娌',
  'h,lb,w': '妯娌',

  // 大伯小姑
  'h,ob': '大伯子',
  'h,lb': '小叔子',
  'h,os': '大姑子',
  'h,ls': '小姑子',

  // 内兄内弟
  'w,ob': '大舅子',
  'w,lb': '小舅子',
  'w,os': '大姨姐',
  'w,ls': '小姨妹'
}

/**
 * 计算亲戚称呼
 */
const result = computed(() => {
  if (!relationCode.value) {
    return ''
  }

  const code = relationCode.value

  // 直接查找
  if (relativeDatabase[code]) {
    const dbResult = relativeDatabase[code]
    if (typeof dbResult === 'string') {
      return dbResult
    }
  }

  // 尝试根据性别调整
  if (targetGender.value) {
    const result = calculateByGender(code, targetGender.value)
    if (result) return result
  }

  // 如果找不到，返回关系链描述
  if (relationChain.value.length > 0) {
    return '未找到对应称呼'
  }

  return ''
})

/**
 * 根据性别推测称呼
 */
function calculateByGender(code: string, gender: string): string {
  const parts = code.split(',')
  const lastPart = parts[parts.length - 1]

  // 如果最后一个关系是兄弟姐妹，根据性别判断
  if (['ob', 'lb', 'os', 'ls'].includes(lastPart)) {
    return ''
  }

  return ''
}

/**
 * 添加关系
 */
function addRelation(relation: string) {
  if (relationCode.value) {
    relationCode.value += ',' + relation
  } else {
    relationCode.value = relation
  }
  relationChain.value.push(relationMap[relation] || relation)
}

/**
 * 撤销上一步
 */
function undoRelation() {
  if (relationChain.value.length === 0) {
    uni.showToast({
      title: '已经没有可撤销的了',
      icon: 'none'
    })
    return
  }

  const parts = relationCode.value.split(',')
  parts.pop()
  relationCode.value = parts.join(',')
  relationChain.value.pop()
}

/**
 * 重置
 */
function resetRelations() {
  relationCode.value = ''
  relationChain.value = []
  targetGender.value = ''
}

/**
 * 设置目标性别
 */
function setTargetGender(gender: string) {
  targetGender.value = gender
}

/**
 * 加载示例
 */
function loadExample(example: string) {
  resetRelations()
  const parts = example.split(',')
  parts.forEach(part => {
    addRelation(part)
  })
}

// 页面加载
// onLoad(() => {
//   console.log('亲戚计算器页面加载')
// })
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0 0 40rpx 0;
}

.result-card {
  margin: 30rpx;
  padding: 40rpx;
  background: white;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);

  .result-label {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 20rpx;
  }

  .result-value {
    font-size: 64rpx;
    font-weight: bold;
    color: #667eea;
    min-height: 80rpx;
    line-height: 80rpx;
  }

  .chain-display {
    margin-top: 30rpx;
    padding-top: 30rpx;
    border-top: 1px dashed #eee;
    font-size: 28rpx;
    color: #666;
    line-height: 48rpx;

    .chain-text {
      color: #333;
    }

    .chain-item {
      color: #667eea;
      font-weight: 500;
    }
  }

  .action-buttons-inline {
    display: flex;
    gap: 20rpx;
    margin-top: 30rpx;
    padding-top: 30rpx;
    border-top: 1px dashed #eee;

    .action-btn {
      flex: 1;
      padding: 24rpx;
      border-radius: 12rpx;
      text-align: center;
      font-size: 28rpx;
      font-weight: bold;
      transition: all 0.3s;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

      &:active {
        transform: scale(0.95);
      }

      &.undo-btn {
        background: white;
        color: #667eea;
        border: 2rpx solid #667eea;
      }

      &.reset-btn {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }
    }
  }
}

.gender-section {
  margin: 30rpx;
  padding: 30rpx;
  background: white;
  border-radius: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .gender-buttons {
    display: flex;
    gap: 20rpx;

    .gender-btn {
      flex: 1;
      padding: 24rpx;
      background: #f5f5f5;
      border-radius: 12rpx;
      text-align: center;
      font-size: 28rpx;
      color: #666;
      transition: all 0.3s;

      &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        transform: scale(1.05);
      }
    }
  }
}

.relations-section {
  margin: 30rpx;
  padding: 30rpx;
  background: white;
  border-radius: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .relation-group {
    margin-bottom: 30rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .group-title {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 15rpx;
    }

    .relation-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;

      .relation-btn {
        padding: 20rpx 32rpx;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12rpx;
        font-size: 28rpx;
        transition: all 0.3s;
        box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);

        &:active {
          transform: scale(0.95);
          box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
        }
      }
    }
  }
}

.examples-section {
  margin: 30rpx;
  padding: 30rpx;
  background: white;
  border-radius: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .example-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;

    .example-btn {
      padding: 20rpx 28rpx;
      background: #f5f5f5;
      color: #666;
      border-radius: 12rpx;
      font-size: 26rpx;
      border: 2rpx solid #eee;
      transition: all 0.3s;

      &:active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }
    }
  }
}
</style>
