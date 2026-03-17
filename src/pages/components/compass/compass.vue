<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="🧭 灵感罗盘" subtitle="陀螺仪·水平仪·方向指南" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 罗盘主卡片 -->
      <view class="compass-card">
        <!-- 罗盘圆形容器 -->
        <view class="compass-circle-wrapper" :style="{ transform: `rotate(${-compassAngle}deg)` }">
          <!-- 罗盘背景 -->
          <view class="compass-background">
            <!-- 外圆 -->
            <view class="compass-outer-circle"></view>
            <!-- 刻度 -->
            <view class="compass-marks">
              <view class="compass-mark" v-for="i in 36" :key="i" :style="{ transform: `rotate(${(i - 1) * 10}deg)` }"></view>
            </view>
            <!-- 方向标签 -->
            <view class="compass-labels">
              <view class="compass-label north">N</view>
              <view class="compass-label east">E</view>
              <view class="compass-label south">S</view>
              <view class="compass-label west">W</view>
            </view>
          </view>
          <!-- 中心十字准星 -->
          <view class="center-crosshair">
            <view class="cross-h"></view>
            <view class="cross-v"></view>
          </view>
          <!-- 中心圆点 -->
          <view class="center-dot"></view>
          <!-- 顶部指针 -->
          <view class="compass-pointer"></view>
        </view>

        <!-- 角度和方向信息 -->
        <view class="angle-info">
          <view class="angle-value">{{ Math.round(compassAngle) }}°</view>
          <view class="direction-text">{{ currentDirection }}</view>
          <view class="coordinates">{{ location }}</view>
        </view>
      </view>

      <!-- 水平仪卡片 -->
      <view class="level-card">
        <view class="card-title">📐 水平仪</view>
        <view class="level-indicator">
          <!-- 水平仪背景 -->
          <view class="level-bg">
            <!-- X 轴水平刻度 -->
            <view class="level-scale-x">
              <view class="scale-mark" v-for="i in 7" :key="'x' + i">{{ (i - 4) * 30 }}</view>
            </view>
            <!-- Y 轴纵向刻度 -->
            <view class="level-scale-y">
              <view class="scale-mark" v-for="i in 7" :key="'y' + i">{{ (i - 4) * 30 }}</view>
            </view>
          </view>
          <!-- 水平仪指示器球 -->
          <view
            class="level-bubble"
            :class="[isLevel ? 'level-ok' : 'level-warning']"
            :style="{ left: `calc(50% + ${levelOffsetX}px)`, top: `calc(50% + ${levelOffsetY}px)` }"
          ></view>
          <!-- 水平仪中心线 -->
          <view class="level-center-line-x"></view>
          <view class="level-center-line-y"></view>
        </view>
        <view class="level-status" :class="[isLevel ? 'ok' : 'warning']">
          <text class="status-icon">{{ isLevel ? '✓' : '!' }}</text>
          <text class="status-text">{{ isLevel ? '已水平' : '请调整设备水平' }} X:{{ Math.round(accelerometer.y * 10) / 10 }}° Y:{{ Math.round(accelerometer.x * 10) / 10 }}° Z:{{ Math.round(accelerometer.z * 10) / 10 }}°</text>
        </view>
      </view>

      <!-- 详细数据卡片 -->
      <view class="data-card">
        <view class="card-title">📊 传感器数据</view>
        <view class="data-grid">
          <view class="data-item">
            <text class="data-label">前后倾斜 (Y轴)</text>
            <text class="data-value">{{ Math.round(accelerometer.x * 10) / 10 }}°</text>
          </view>
          <view class="data-item">
            <text class="data-label">左右倾斜 (X轴)</text>
            <text class="data-value">{{ Math.round(accelerometer.y * 10) / 10 }}°</text>
          </view>
          <view class="data-item">
            <text class="data-label">旋转角 (Z轴)</text>
            <text class="data-value">{{ Math.round(accelerometer.z * 10) / 10 }}°</text>
          </view>
          <view class="data-item">
            <text class="data-label">磁力方位</text>
            <text class="data-value">{{ Math.round(magnetic) }}°</text>
          </view>
        </view>
      </view>

      <!-- 功能说明 -->
      <view class="tips-section">
        <view class="tips-title">💡 功能说明</view>
        <view class="tips-content">
          <text class="tip-item">• 罗盘显示当前设备指向方向（相对于地磁北极）</text>
          <text class="tip-item">• 水平仪判识设备是否保持水平状态（±5°范围内）</text>
          <text class="tip-item">• 前后倾斜：设备围绕Y轴的倾斜角度</text>
          <text class="tip-item">• 左右倾斜：设备围绕X轴的倾斜角度</text>
          <text class="tip-item">• 需要设备支持陀螺仪和磁力传感器</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '灵感罗盘 - DM工具箱',
    path: '/pages/components/compass/compass'
  })
}
</script>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import PageHeader from '@/components/PageHeader.vue'

// 罗盘角度
const compassAngle = ref(0)

// 加速度计数据
const accelerometer = reactive({
  x: 0,
  y: 0,
  z: 0
})

// 磁力计角度
const magnetic = ref(0)

// 水平状态
const isLevel = ref(false)
const levelOffsetX = ref(0)
const levelOffsetY = ref(0)

// 定位信息
const location = ref('--')

// 获取方向描述
const getDirectionName = (angle: number): string => {
  const directions = [
    { name: '北', min: 337.5, max: 360 },
    { name: '北', min: 0, max: 22.5 },
    { name: '东北', min: 22.5, max: 67.5 },
    { name: '东', min: 67.5, max: 112.5 },
    { name: '东南', min: 112.5, max: 157.5 },
    { name: '南', min: 157.5, max: 202.5 },
    { name: '西南', min: 202.5, max: 247.5 },
    { name: '西', min: 247.5, max: 292.5 },
    { name: '西北', min: 292.5, max: 337.5 }
  ]

  for (const dir of directions) {
    if (angle >= dir.min && angle <= dir.max) {
      return dir.name
    }
  }
  return '北'
}

const currentDirection = ref('北')

// 更新方向名称
const updateDirection = (angle: number) => {
  currentDirection.value = getDirectionName(angle)
}

// 初始化罗盘画布（不再使用Canvas，改用CSS）
const initCompassCanvas = () => {
  // 使用CSS绘制，不需要Canvas初始化
  console.log('罗盘已初始化')
}

// 监听罗盘事件
const startCompassListener = () => {
  const uniAny = uni as any
  // 使用 onCompassChange 替代 onCompass（微信小程序标准API）
  if (typeof uniAny.onCompassChange === 'function') {
    uniAny.onCompassChange((res: any) => {
      if (res && typeof res.direction === 'number') {
        compassAngle.value = res.direction
        magnetic.value = res.direction
        updateDirection(res.direction)
      }
    })
  } else if (typeof uniAny.onCompass === 'function') {
    // 备选方案
    uniAny.onCompass((res: any) => {
      if (res && typeof res.direction === 'number') {
        compassAngle.value = res.direction
        magnetic.value = res.direction
        updateDirection(res.direction)
      }
    })
  } else {
    console.warn('罗盘API不可用')
  }
}

// 处理加速度数据
const handleAccelerometerData = (res: any) => {
  try {
    if (!res) {
      console.warn('⚠️ 收到空数据')
      return
    }
    
    let x = 0, y = 0, z = 0
    let dataSource = '未知'
    
    // 处理 onAccelerometerChange 或 onAccelerometer 的数据结构 - 直接包含 x,y,z
    if (typeof res.x === 'number' && typeof res.y === 'number' && typeof res.z === 'number') {
      x = parseFloat(res.x)
      y = parseFloat(res.y)
      z = parseFloat(res.z)
      dataSource = 'x,y,z直接结构'
    } 
    // 处理 onDeviceMotionChange 的数据结构 - 嵌套在 acceleration 中
    else if (res.acceleration && typeof res.acceleration === 'object') {
      x = parseFloat(res.acceleration.x) || 0
      y = parseFloat(res.acceleration.y) || 0
      z = parseFloat(res.acceleration.z) || 0
      dataSource = 'acceleration嵌套结构'
    }
    else {
      console.warn('⚠️ 无法识别的数据结构:', JSON.stringify(res).substring(0, 100))
      return
    }
    
    // 加速度计返回的z轴是相反的（向下为负），需要反转
    const roll = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI)    // 绕X轴: 左右倾斜
    const pitch = Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI)  // 绕Y轴: 前后倾斜
    const yaw = Math.atan2(z, Math.sqrt(x * x + y * y)) * (180 / Math.PI)     // 绕Z轴
    
    // 更新响应式数据
    accelerometer.x = Math.round(pitch * 10) / 10
    accelerometer.y = Math.round(roll * 10) / 10
    accelerometer.z = Math.round(yaw * 10) / 10
    
    // 判断是否水平：X轴和Y轴倾斜都很小
    isLevel.value = Math.abs(pitch) < 5 && Math.abs(roll) < 5
    
    // 水平仪偏移（二维）
    // X 轴偏移（左右）：基于 roll，范围 -90 到 90，映射到 -180 到 180px
    const newOffsetX = Math.max(-180, Math.min(180, roll * 2))
    levelOffsetX.value = newOffsetX
    
    // Y 轴偏移（上下）：基于 pitch，范围 -90 到 90，映射到 -180 到 180px
    const newOffsetY = Math.max(-180, Math.min(180, pitch * 2))
    levelOffsetY.value = newOffsetY
    
    // 每次都输出日志
    console.log(`📊 ${dataSource} | raw:(${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}) | pitch:${pitch.toFixed(1)}° roll:${roll.toFixed(1)}° | offsetX:${newOffsetX.toFixed(0)}px offsetY:${newOffsetY.toFixed(0)}px | level:${isLevel.value}`)
  } catch (e) {
    console.warn('❌ 处理加速度数据出错:', e)
  }
}

onMounted(() => {
  // 初始化罗盘
  initCompassCanvas()

  // 延迟启动传感器监听，确保页面加载完成
  setTimeout(() => {
    // 启动陀螺仪/罗盘
    uni.startCompass({
      success: () => {
        console.log('✓ 陀螺仪已启动')
        startCompassListener()
        uni.showToast({
          title: '罗盘已就绪',
          icon: 'success',
          duration: 1000
        })
      },
      fail: (err: any) => {
        console.warn('❌ 陀螺仪启动失败:', err)
        uni.showToast({
          title: '设备不支持罗盘',
          icon: 'none'
        })
      }
    })

    // 启动加速度计
    startAccelerometerWithRetry()
    
    // 定期检查加速度计数据状态（用于诊断） - 修复 window 问题
    const statusCheckInterval = setInterval(() => {
      console.log(`⏱️ 加速度计状态检查 | x:${accelerometer.x}° y:${accelerometer.y}° z:${accelerometer.z}°`)
    }, 3000)
    
    // 保存到对象而不是 window
    const globalState = { statusCheckInterval }
    ;(globalThis as any).__compassStatusCheckInterval = globalState
  }, 500)
})

// 启动加速度计,带重试机制
const startAccelerometerWithRetry = () => {
  console.log('>> 启动加速度计流程开始')
  const uniAny = uni as any
  
  // 先注册监听器
  try {
    // 尝试方式1: onAccelerometerChange (WeChat mini program)
    if (typeof uniAny.onAccelerometerChange === 'function') {
      console.log('>> 注册 onAccelerometerChange 监听')
      uniAny.onAccelerometerChange((res: any) => {
        console.log('📱 onAccelerometerChange 触发:', res)
        handleAccelerometerData(res)
      })
    } 
    // 尝试方式2: onAccelerometer
    else if (typeof uniAny.onAccelerometer === 'function') {
      console.log('>> 注册 onAccelerometer 监听')
      uniAny.onAccelerometer((res: any) => {
        console.log('📱 onAccelerometer 触发:', res)
        handleAccelerometerData(res)
      })
    }
    // 尝试方式3: onDeviceMotionChange
    else if (typeof uniAny.onDeviceMotionChange === 'function') {
      console.log('>> 注册 onDeviceMotionChange 监听')
      uniAny.onDeviceMotionChange((res: any) => {
        console.log('📱 onDeviceMotionChange 触发:', res)
        handleAccelerometerData(res)
      })
    }
    else {
      console.warn('⚠️ 没有找到任何加速度计监听API')
    }
  } catch (e) {
    console.warn('注册监听时出错:', e)
  }
  
  // 然后启动加速度计
  console.log('>> 调用 startAccelerometer')
  uni.startAccelerometer({
    interval: 'normal',
    success: () => {
      console.log('✅ 加速度计启动成功 (normal)')
    },
    fail: (err: any) => {
      console.warn('❌ normal interval 失败，尝试无参数:', err)
      
      uni.startAccelerometer({
        success: () => {
          console.log('✅ 加速度计启动成功 (无参数)')
        },
        fail: (err2: any) => {
          console.warn('❌ 加速度计启动完全失败:', err2)
          uni.showToast({
            title: '设备不支持加速度计',
            icon: 'none'
          })
        }
      })
    }
  })
}


onBeforeUnmount(() => {
  // 停止监听 - 使用微信小程序标准API
  console.log('>> 清理传感器监听')
  try {
    const uniAny = uni as any
    
    // 关闭罗盘监听
    if (typeof uniAny.offCompassChange === 'function') {
      uniAny.offCompassChange()
      console.log('>> 已关闭 offCompassChange')
    } else if (typeof uniAny.offCompass === 'function') {
      uniAny.offCompass()
      console.log('>> 已关闭 offCompass')
    }
    
    // 关闭加速度计监听
    if (typeof uniAny.offAccelerometerChange === 'function') {
      uniAny.offAccelerometerChange()
      console.log('>> 已关闭 offAccelerometerChange')
    } else if (typeof uniAny.offAccelerometer === 'function') {
      uniAny.offAccelerometer()
      console.log('>> 已关闭 offAccelerometer')
    } else if (typeof uniAny.offDeviceMotionChange === 'function') {
      uniAny.offDeviceMotionChange()
      console.log('>> 已关闭 offDeviceMotionChange')
    }
    
    // 停止传感器
    if (typeof uniAny.stopCompass === 'function') {
      uniAny.stopCompass()
      console.log('>> 已停止陀螺仪')
    }
    if (typeof uniAny.stopAccelerometer === 'function') {
      uniAny.stopAccelerometer()
      console.log('>> 已停止加速度计')
    }
    
    // 清理状态检查定时器
    const globalState = (globalThis as any).__compassStatusCheckInterval
    if (globalState && globalState.statusCheckInterval) {
      clearInterval(globalState.statusCheckInterval)
      console.log('>> 已清理状态检查定时器')
    }
  } catch (e) {
    console.warn('清理传感器监听时出错:', e)
  }
})
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

/* ===== 罗盘卡片 ===== */
.compass-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.compass-circle-wrapper {
  position: relative;
  width: 240rpx;
  height: 240rpx;
  margin: 0 auto 30rpx;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.1s ease;
}

.compass-background {
  position: relative;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 50%;
}

.compass-outer-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2rpx solid #e0e0e0;
  border-radius: 50%;
  box-sizing: border-box;
}

.compass-marks {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.compass-mark {
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: 12rpx;
  background: #ccc;
  transform-origin: 50% 120rpx;
  margin-left: -0.5px;
}

.compass-labels {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compass-label {
  position: absolute;
  width: 30rpx;
  height: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: bold;
  border-radius: 50%;

  &.north {
    top: 12rpx;
    left: 50%;
    transform: translateX(-50%);
    color: #FF6B6B;
    background: rgba(255, 107, 107, 0.1);
  }

  &.east {
    right: 12rpx;
    top: 50%;
    transform: translateY(-50%);
    color: #333;
  }

  &.south {
    bottom: 12rpx;
    left: 50%;
    transform: translateX(-50%);
    color: #333;
  }

  &.west {
    left: 12rpx;
    top: 50%;
    transform: translateY(-50%);
    color: #333;
  }
}

.compass-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.center-crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60rpx;
  height: 60rpx;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.cross-h,
.cross-v {
  position: absolute;
  background: rgba(0, 0, 0, 0.2);
}

.cross-h {
  width: 60rpx;
  height: 1px;
  top: 30rpx;
  left: 0;
}

.cross-v {
  width: 1px;
  height: 60rpx;
  top: 0;
  left: 30rpx;
}

.center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8rpx;
  height: 8rpx;
  background: #667eea;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8rpx rgba(102, 126, 234, 0.5);
}

.compass-pointer {
  position: absolute;
  top: 10rpx;
  left: 50%;
  width: 4rpx;
  height: 50rpx;
  background: linear-gradient(180deg, #ff6b6b 0%, transparent 100%);
  transform: translateX(-50%);
  border-radius: 2rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3);
}

.angle-info {
  text-align: center;
  width: 100%;
}

.angle-value {
  font-size: 56rpx;
  font-weight: bold;
  color: $app-primary-color;
  line-height: 1.2;
}

.direction-text {
  font-size: 32rpx;
  color: $app-text-secondary;
  margin-top: 8rpx;
}

.coordinates {
  font-size: 24rpx;
  color: $app-text-tertiary;
  margin-top: 12rpx;
  word-break: break-all;
}

/* ===== 水平仪卡片 ===== */
.level-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.level-indicator {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: linear-gradient(90deg, #f0f0f0 0%, #ffffff 50%, #f0f0f0 100%),
              linear-gradient(180deg, #f0f0f0 0%, #ffffff 50%, #f0f0f0 100%);
  background-size: 100% 50%, 50% 100%;
  background-position: 0 0, 0 0;
  background-repeat: no-repeat;
  border-radius: 12rpx;
  border: 2rpx solid #e0e0e0;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.level-bg {
  width: 100%;
  height: 100%;
  position: relative;
}

.level-scale-x {
  position: absolute;
  width: 100%;
  height: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-around;
  align-items: center;
  opacity: 0.8;
}

.level-scale-y {
  position: absolute;
  width: 50rpx;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  opacity: 0.8;
}

.scale-mark {
  font-size: 12rpx;
  color: #555;
  font-weight: 600;
  white-space: nowrap;
}

.level-bubble {
  position: absolute;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: #ffb800;
  box-shadow: 0 2rpx 8rpx rgba(255, 184, 0, 0.3);
  transition: all 0.05s ease;
  will-change: left, top;

  &.level-ok {
    background: #5dbc4c;
    box-shadow: 0 2rpx 8rpx rgba(93, 188, 76, 0.3);
  }

  &.level-warning {
    background: #ffb800;
    box-shadow: 0 2rpx 8rpx rgba(255, 184, 0, 0.3);
  }
}

.level-center-line-x {
  position: absolute;
  height: 2rpx;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.15);
}

.level-center-line-y {
  position: absolute;
  width: 2rpx;
  height: 100%;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.15);
}

.level-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #ffb800;

  &.ok {
    color: #5dbc4c;
  }

  &.warning {
    color: #ffb800;
  }

  .status-icon {
    font-size: 32rpx;
    font-weight: bold;
  }
}

/* ===== 数据卡片 ===== */
.data-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.data-item {
  background: #f8f9ff;
  border-radius: 12rpx;
  padding: 24rpx;
  border: 1px solid #e0e5ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.data-label {
  font-size: 26rpx;
  color: $app-text-secondary;
}

.data-value {
  font-size: 32rpx;
  font-weight: bold;
  color: $app-primary-color;
}

/* ===== 功能说明 ===== */
.tips-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  border-left: 4rpx solid $app-primary-color;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.tips-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tip-item {
  font-size: 24rpx;
  line-height: 1.6;
  color: #666;
}
</style>
