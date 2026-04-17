<template>
    <view class="container">
        <!-- 页面头部 -->
        <PageHeader title="📏 单位转换" subtitle="6大类别·34种单位" />

        <!-- 页面内容 -->
        <view class="page-content">
            <!-- 类别选择 -->
            <view class="category-tabs">
                <view v-for="cat in categories" :key="cat.id" class="tab-item"
                    :class="{ active: currentCategory === cat.id }" @click="switchCategory(cat.id)">
                    <text class="tab-icon">{{ cat.icon }}</text>
                    <text class="tab-name">{{ cat.name }}</text>
                </view>
            </view>

            <!-- 转换卡片 -->
            <view class="convert-card">
                <!-- 输入区域 -->
                <view class="input-section">
                    <text class="section-label">从</text>
                    <view class="input-row">
                        <input class="value-input" type="digit" v-model="inputValue" placeholder="输入数值"
                            @input="handleConvert" />
                        <picker mode="selector" :range="currentUnits" range-key="name" :value="fromUnitIndex"
                            @change="onFromUnitChange">
                            <view class="unit-picker">
                                {{ currentUnits[fromUnitIndex]?.name || '选择单位' }}
                                <text class="picker-arrow">▼</text>
                            </view>
                        </picker>
                    </view>
                </view>

                <!-- 交换按钮 -->
                <view class="swap-container">
                    <button class="swap-btn" @click="swapUnits">⇅</button>
                </view>

                <!-- 结果区域 -->
                <view class="result-section">
                    <text class="section-label">到</text>
                    <view class="result-row">
                        <text class="result-value">{{ resultValue }}</text>
                        <picker mode="selector" :range="currentUnits" range-key="name" :value="toUnitIndex"
                            @change="onToUnitChange">
                            <view class="unit-picker">
                                {{ currentUnits[toUnitIndex]?.name || '选择单位' }}
                                <text class="picker-arrow">▼</text>
                            </view>
                        </picker>
                    </view>
                </view>

                <!-- 复制按钮 -->
                <button class="copy-btn" @click="copyResult" v-if="resultValue">📋 复制结果</button>
            </view>

            <!-- 常用转换 -->
            <view class="quick-convert" v-if="quickConversions.length">
                <text class="quick-title">💡 常用转换</text>
                <view class="quick-list">
                    <view v-for="(item, index) in quickConversions" :key="index" class="quick-item"
                        @click="applyQuickConvert(item)">
                        <text class="quick-text">{{ item.label }}</text>
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
    title: '单位转换 - DM工具箱',
    path: '/pages/components/unitConvert/unitConvert'
  })
}
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageHeader from '@/components/PageHeader.vue'

interface Unit {
    name: string
    symbol: string
    toBase: number // 转换到基础单位的系数
}

interface Category {
    id: string
    name: string
    icon: string
    units: Unit[]
}

interface QuickConvert {
    label: string
    from: string
    to: string
    value: string
}

const currentCategory = ref('length')
const inputValue = ref('')
const fromUnitIndex = ref(0)
const toUnitIndex = ref(1)

// 单位定义
const categories: Category[] = [
    {
        id: 'length',
        name: '长度',
        icon: '📏',
        units: [
            { name: '米 (m)', symbol: 'm', toBase: 1 },
            { name: '千米 (km)', symbol: 'km', toBase: 1000 },
            { name: '厘米 (cm)', symbol: 'cm', toBase: 0.01 },
            { name: '毫米 (mm)', symbol: 'mm', toBase: 0.001 },
            { name: '英寸 (in)', symbol: 'in', toBase: 0.0254 },
            { name: '英尺 (ft)', symbol: 'ft', toBase: 0.3048 },
            { name: '码 (yd)', symbol: 'yd', toBase: 0.9144 },
            { name: '英里 (mi)', symbol: 'mi', toBase: 1609.344 }
        ]
    },
    {
        id: 'weight',
        name: '重量',
        icon: '⚖️',
        units: [
            { name: '千克 (kg)', symbol: 'kg', toBase: 1 },
            { name: '克 (g)', symbol: 'g', toBase: 0.001 },
            { name: '毫克 (mg)', symbol: 'mg', toBase: 0.000001 },
            { name: '吨 (t)', symbol: 't', toBase: 1000 },
            { name: '磅 (lb)', symbol: 'lb', toBase: 0.453592 },
            { name: '盎司 (oz)', symbol: 'oz', toBase: 0.0283495 }
        ]
    },
    {
        id: 'temperature',
        name: '温度',
        icon: '🌡️',
        units: [
            { name: '摄氏度 (°C)', symbol: '°C', toBase: 1 },
            { name: '华氏度 (°F)', symbol: '°F', toBase: 1 },
            { name: '开尔文 (K)', symbol: 'K', toBase: 1 }
        ]
    },
    {
        id: 'area',
        name: '面积',
        icon: '📐',
        units: [
            { name: '平方米 (m²)', symbol: 'm²', toBase: 1 },
            { name: '平方千米 (km²)', symbol: 'km²', toBase: 1000000 },
            { name: '平方厘米 (cm²)', symbol: 'cm²', toBase: 0.0001 },
            { name: '公顷 (ha)', symbol: 'ha', toBase: 10000 },
            { name: '亩', symbol: '亩', toBase: 666.67 },
            { name: '平方英尺 (ft²)', symbol: 'ft²', toBase: 0.092903 }
        ]
    },
    {
        id: 'volume',
        name: '体积',
        icon: '🧪',
        units: [
            { name: '立方米 (m³)', symbol: 'm³', toBase: 1 },
            { name: '升 (L)', symbol: 'L', toBase: 0.001 },
            { name: '毫升 (mL)', symbol: 'mL', toBase: 0.000001 },
            { name: '加仑 (gal)', symbol: 'gal', toBase: 0.00378541 }
        ]
    },
    {
        id: 'storage',
        name: '存储',
        icon: '💾',
        units: [
            { name: '字节 (B)', symbol: 'B', toBase: 1 },
            { name: '千字节 (KB)', symbol: 'KB', toBase: 1024 },
            { name: '兆字节 (MB)', symbol: 'MB', toBase: 1048576 },
            { name: '吉字节 (GB)', symbol: 'GB', toBase: 1073741824 },
            { name: '太字节 (TB)', symbol: 'TB', toBase: 1099511627776 },
            { name: '拍字节 (PB)', symbol: 'PB', toBase: 1125899906842624 }
        ]
    }
]

const currentUnits = computed(() => {
    return categories.find(c => c.id === currentCategory.value)?.units || []
})

const quickConversions = computed((): QuickConvert[] => {
    switch (currentCategory.value) {
        case 'length':
            return [
                { label: '1米 = ? 英尺', from: '米 (m)', to: '英尺 (ft)', value: '1' },
                { label: '1公里 = ? 英里', from: '千米 (km)', to: '英里 (mi)', value: '1' },
                { label: '1英寸 = ? 厘米', from: '英寸 (in)', to: '厘米 (cm)', value: '1' }
            ]
        case 'weight':
            return [
                { label: '1千克 = ? 磅', from: '千克 (kg)', to: '磅 (lb)', value: '1' },
                { label: '1吨 = ? 千克', from: '吨 (t)', to: '千克 (kg)', value: '1' }
            ]
        case 'temperature':
            return [
                { label: '0°C = ? °F', from: '摄氏度 (°C)', to: '华氏度 (°F)', value: '0' },
                { label: '100°C = ? °F', from: '摄氏度 (°C)', to: '华氏度 (°F)', value: '100' }
            ]
        case 'storage':
            return [
                { label: '1MB = ? KB', from: '兆字节 (MB)', to: '千字节 (KB)', value: '1' },
                { label: '1GB = ? MB', from: '吉字节 (GB)', to: '兆字节 (MB)', value: '1' },
                { label: '1TB = ? GB', from: '太字节 (TB)', to: '吉字节 (GB)', value: '1' }
            ]
        default:
            return []
    }
})

const resultValue = computed(() => {
    const input = parseFloat(inputValue.value)
    if (isNaN(input) || !currentUnits.value.length) return ''

    const fromUnit = currentUnits.value[fromUnitIndex.value]
    const toUnit = currentUnits.value[toUnitIndex.value]

    if (!fromUnit || !toUnit) return ''

    let result: number

    // 温度特殊处理
    if (currentCategory.value === 'temperature') {
        result = convertTemperature(input, fromUnit.symbol, toUnit.symbol)
    } else {
        // 通用转换：先转到基础单位，再转到目标单位
        const baseValue = input * fromUnit.toBase
        result = baseValue / toUnit.toBase
    }

    return formatNumber(result)
})

onLoad(() => {
    console.log('单位转换页面加载')
})

/**
 * 温度转换
 */
const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius = value

    // 转到摄氏度
    if (from === '°F') {
        celsius = ((value - 32) * 5) / 9
    } else if (from === 'K') {
        celsius = value - 273.15
    }

    // 从摄氏度转到目标
    if (to === '°F') {
        return (celsius * 9) / 5 + 32
    } else if (to === 'K') {
        return celsius + 273.15
    }

    return celsius
}

/**
 * 格式化数字显示
 */
const formatNumber = (num: number): string => {
    if (Math.abs(num) < 0.0001 && num !== 0) {
        return num.toExponential(6)
    }
    if (Math.abs(num) > 1000000) {
        return num.toExponential(6)
    }
    return num.toFixed(6).replace(/\.?0+$/, '')
}

const switchCategory = (categoryId: string) => {
    currentCategory.value = categoryId
    inputValue.value = ''
    fromUnitIndex.value = 0
    toUnitIndex.value = 1
}

const onFromUnitChange = (e: any) => {
    fromUnitIndex.value = e.detail.value
    handleConvert()
}

const onToUnitChange = (e: any) => {
    toUnitIndex.value = e.detail.value
    handleConvert()
}

const handleConvert = () => {
    // 触发计算（通过 computed 自动完成）
}

const swapUnits = () => {
    const temp = fromUnitIndex.value
    fromUnitIndex.value = toUnitIndex.value
    toUnitIndex.value = temp
    handleConvert()
}

const copyResult = () => {
    if (!resultValue.value) return

    const text = `${inputValue.value} ${currentUnits.value[fromUnitIndex.value]?.name} = ${resultValue.value} ${currentUnits.value[toUnitIndex.value]?.name}`

    uni.setClipboardData({
        data: text,
        success: () => {
            uni.showToast({
                title: '已复制',
                icon: 'success',
                duration: 1500
            })
        }
    })
}

const applyQuickConvert = (item: QuickConvert) => {
    inputValue.value = item.value
    fromUnitIndex.value = currentUnits.value.findIndex(u => u.name === item.from)
    toUnitIndex.value = currentUnits.value.findIndex(u => u.name === item.to)
    handleConvert()
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

/* 类别选择 */
.category-tabs {
    display: flex;
    gap: 20rpx;
    margin-bottom: 30rpx;
    padding: 10rpx;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
        display: none;
    }

    .tab-item {
        flex-shrink: 0;
        padding: 20rpx 32rpx;
        background: #f8f9fa;
        border-radius: 20rpx;
        display: flex;
        align-items: center;
        gap: 12rpx;
        border: 2rpx solid #e8e9eb;
        transition: all 0.3s;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

        &.active {
            background: linear-gradient(135deg, #e8eeff 0%, #f0ebff 100%);
            border-color: #d0d5ff;
            transform: scale(1.05);
            box-shadow: 0 6rpx 16rpx rgba(102, 126, 234, 0.2);

            .tab-icon {
                filter: brightness(1.1);
            }

            .tab-name {
                color: #5a67d8;
                font-weight: 900;
            }
        }

        &:active:not(.active) {
            background: #eef0f2;
            transform: scale(0.98);
        }

        .tab-icon {
            font-size: 36rpx;
        }

        .tab-name {
            font-size: 28rpx;
            font-weight: bold;
            color: #333;
        }
    }
}

/* 转换卡片 */
.convert-card {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
    margin-bottom: 30rpx;
}

.input-section,
.result-section {
    margin-bottom: 32rpx;

    .section-label {
        display: block;
        font-size: 28rpx;
        font-weight: 600;
        color: #666;
        margin-bottom: 16rpx;
    }
}

.input-row,
.result-row {
    display: flex;
    gap: 24rpx;
    align-items: center;
}

.value-input {
    flex: 1;
    padding: 16rpx 24rpx;
    border: 2rpx solid #e0e0e0;
    border-radius: 12rpx;
    font-size: 32rpx;
    background: #fafafa;
    box-sizing: border-box;
    min-height: 88rpx;
    line-height: 56rpx;
    vertical-align: middle;
}

.result-value {
    flex: 1;
    padding: 24rpx;
    background: #f0f4ff;
    border: 2rpx solid #dfe8ff;
    border-radius: 12rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: #667eea;
    min-height: 88rpx;
    display: flex;
    align-items: center;
}

.unit-picker {
    padding: 24rpx 32rpx;
    background: #ffffff;
    border: 2rpx solid #e0e0e0;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #333;
    display: flex;
    align-items: center;
    gap: 16rpx;
    white-space: nowrap;

    .picker-arrow {
        font-size: 24rpx;
        color: #999;
    }
}

.swap-container {
    display: flex;
    justify-content: center;
    margin: 20rpx 0;

    .swap-btn {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;
        font-size: 40rpx;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
        transition: transform 0.3s;

        &:active {
            transform: rotate(180deg) scale(0.95);
        }
    }
}

.copy-btn {
    width: 100%;
    padding: 24rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    border: none;
    border-radius: 12rpx;
    font-size: 30rpx;
    font-weight: 600;
    margin-top: 32rpx;

    &:active {
        opacity: 0.8;
    }
}

/* 常用转换 */
.quick-convert {
    background: #ffffff;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);

    .quick-title {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 20rpx;
    }

    .quick-list {
        display: flex;
        flex-direction: column;
        gap: 16rpx;
    }

    .quick-item {
        padding: 20rpx 24rpx;
        background: #f9f9f9;
        border: 2rpx solid #e0e0e0;
        border-radius: 12rpx;
        font-size: 28rpx;
        color: #666;
        transition: all 0.3s;

        &:active {
            background: #f0f4ff;
            border-color: #667eea;
        }
    }
}
</style>
