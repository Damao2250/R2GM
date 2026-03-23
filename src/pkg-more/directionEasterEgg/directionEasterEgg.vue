<template>
  <view class="container">
    <PageHeader title="🧭 方向彩蛋" subtitle="朝向不同方向会解锁不同房间，放平还能开小游戏" />

    <view class="page-content">
      <view class="card status-card">
        <view class="status-main">
          <text class="status-direction">{{ currentDirection }}</text>
          <text class="status-angle">{{ Math.round(directionAngle) }}°</text>
        </view>
        <view class="status-meta">
          <text>{{ sensorReady ? '罗盘在线' : '设备未提供罗盘，使用默认方向' }}</text>
          <text>{{ isLevel ? '已放平，彩蛋小游戏已解锁' : '把设备放平试试' }}</text>
        </view>
      </view>

      <view class="card">
        <view class="card-title">当前房间</view>
        <view class="room-card">
          <text class="room-icon">{{ currentRoom.icon }}</text>
          <view class="room-meta">
            <text class="room-title">{{ currentRoom.title }}</text>
            <text class="room-desc">{{ currentRoom.description }}</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">已解锁方向</view>
        <view class="unlock-list">
          <view v-for="roomId in unlockedRooms" :key="roomId" class="unlock-chip">
            {{ rooms[roomId].icon }} {{ rooms[roomId].title }}
          </view>
        </view>
      </view>

      <view class="card" v-if="isLevel">
        <view class="card-title">放平彩蛋小游戏</view>
        <view class="mini-game-text">我藏了一个 1-6 的数字，猜中就算你今天的方向感及格。</view>
        <view class="guess-grid">
          <view v-for="value in 6" :key="value" class="guess-btn" @click="guessNumber(value)">
            {{ value }}
          </view>
        </view>
        <view class="guess-result">{{ guessResult || '开始猜吧。' }}</view>
      </view>
    </view>
  </view>
</template>

<route lang="json5">
{
  style: {
    navigationBarTitleText: '方向彩蛋',
    enablePullDownRefresh: false
  }
}
</route>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '方向彩蛋 - DM工具箱',
    path: '/pkg-more/directionEasterEgg/directionEasterEgg'
  })
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { createSensorApi, getDirectionName, getTiltFromAxes, registerAccelerometerListener, registerCompassListener, startAccelerometerSensor, startCompassSensor, stopAccelerometerSensor, stopCompassSensor, type SensorAxes } from '@/utils/motionSensor'
import { recordPersonaSignal } from '@/utils/toolUsage'

type RoomId = 'north' | 'east' | 'south' | 'west'

const sensorApi = createSensorApi()
const LEVEL_THRESHOLD = 5

const rooms: Record<RoomId, { title: string; icon: string; description: string }> = {
  north: {
    title: '北向档案室',
    icon: '📚',
    description: '今天适合整理思路，北边的房间总会催你把散乱信息归档。'
  },
  east: {
    title: '东向实验台',
    icon: '🧪',
    description: '朝东时会想折腾点新东西，适合小步快跑地试错。'
  },
  south: {
    title: '南向热启动室',
    icon: '🔥',
    description: '南边的房间专门负责鼓动你立刻开干，不要等完美时机。'
  },
  west: {
    title: '西向回声廊',
    icon: '🌇',
    description: '朝西的时候适合复盘，把今天做过的事重新咀嚼一遍。'
  }
}

const currentDirection = ref('北')
const directionAngle = ref(0)
const currentRoomId = ref<RoomId>('north')
const unlockedRooms = ref<RoomId[]>(['north'])
const isLevel = ref(false)
const sensorReady = ref(false)
const guessResult = ref('')
const secretNumber = ref(Math.floor(Math.random() * 6) + 1)

const currentRoom = computed(() => rooms[currentRoomId.value])

const resolveRoomId = (direction: string): RoomId => {
  if (direction.includes('东')) {
    return 'east'
  }

  if (direction.includes('西')) {
    return 'west'
  }

  if (direction.includes('南')) {
    return 'south'
  }

  return 'north'
}

const unlockRoom = (roomId: RoomId) => {
  if (unlockedRooms.value.includes(roomId)) {
    return
  }

  unlockedRooms.value = [...unlockedRooms.value, roomId]
  recordPersonaSignal('direction-room-unlocked', roomId)
}

const updateDirection = (angle: number) => {
  const direction = getDirectionName(angle)
  const roomId = resolveRoomId(direction)

  directionAngle.value = angle
  currentDirection.value = direction
  currentRoomId.value = roomId
  unlockRoom(roomId)
}

const updateLevelState = (axes: SensorAxes) => {
  const { pitch, roll } = getTiltFromAxes(axes)
  isLevel.value = Math.abs(pitch) < LEVEL_THRESHOLD && Math.abs(roll) < LEVEL_THRESHOLD
}

const guessNumber = (value: number) => {
  if (!isLevel.value) {
    return
  }

  if (value === secretNumber.value) {
    guessResult.value = `猜中了，就是 ${value}。今天的彩蛋判定你方向感合格。`
    secretNumber.value = Math.floor(Math.random() * 6) + 1
    recordPersonaSignal('direction-game-win')
    return
  }

  guessResult.value = `这次不是 ${value}，再试一次。`
}

onMounted(async () => {
  if (registerCompassListener(sensorApi, updateDirection)) {
    sensorReady.value = await startCompassSensor(sensorApi)
  } else {
    updateDirection(0)
  }

  if (registerAccelerometerListener(sensorApi, updateLevelState)) {
    await startAccelerometerSensor(sensorApi)
  }
})

onBeforeUnmount(() => {
  stopCompassSensor(sensorApi)
  stopAccelerometerSensor(sensorApi)
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-content {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
}

.status-card {
  background: linear-gradient(135deg, #0f766e 0%, #0ea5e9 100%);
  color: #fff;
}

.status-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.status-direction {
  font-size: 60rpx;
  font-weight: 700;
}

.status-angle {
  font-size: 30rpx;
}

.status-meta {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  font-size: 24rpx;
  line-height: 1.7;
  margin-top: 20rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20rpx;
}

.room-card {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  background: #f8fafc;
  border-radius: 20rpx;
  padding: 22rpx;
}

.room-icon {
  font-size: 58rpx;
}

.room-meta {
  flex: 1;
}

.room-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.room-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: #475569;
}

.unlock-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.unlock-chip {
  padding: 14rpx 18rpx;
  border-radius: 999rpx;
  background: #dcfce7;
  color: #166534;
  font-size: 24rpx;
}

.mini-game-text {
  font-size: 24rpx;
  line-height: 1.8;
  color: #475569;
}

.guess-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin: 24rpx 0;
}

.guess-btn {
  text-align: center;
  padding: 24rpx 0;
  border-radius: 18rpx;
  background: #ede9fe;
  color: #6d28d9;
  font-size: 30rpx;
  font-weight: 600;
}

.guess-result {
  font-size: 24rpx;
  color: #334155;
}
</style>
