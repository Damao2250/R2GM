<template>
  <view class="container">
    <!-- 页面头部 -->
    <PageHeader title="⚙️ 系统设置" subtitle="应用管理与维护" />

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 存储信息卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="header-icon">💾</text>
          <text class="header-title">缓存信息</text>
        </view>
        <view class="info-item">
          <text class="info-label">当前缓存大小</text>
          <text class="info-value">{{ storageSize }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">应用版本</text>
          <text class="info-value">{{ appVersion }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">最近备份</text>
          <text class="info-value">{{ lastBackupTime }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="operation-section">
        <view class="section-title">操作</view>

        <!-- 清除缓存 -->
        <view class="option-card">
          <view class="option-header">
            <view class="option-info">
              <text class="option-icon">🗑️</text>
              <view class="option-text">
                <text class="option-title">清除缓存</text>
                <text class="option-desc">清除所有本地缓存数据</text>
              </view>
            </view>
            <button class="action-btn danger-btn" @click="clearCache">
              <text class="btn-text">清除</text>
            </button>
          </view>
        </view>

        <!-- 重启应用 -->
        <view class="option-card">
          <view class="option-header">
            <view class="option-info">
              <text class="option-icon">🔄</text>
              <view class="option-text">
                <text class="option-title">重启应用</text>
                <text class="option-desc">重新加载应用并返回首页</text>
              </view>
            </view>
            <button class="action-btn primary-btn" @click="restartApp">
              <text class="btn-text">重启</text>
            </button>
          </view>
        </view>

        <!-- 检查更新 -->
        <view class="option-card">
          <view class="option-header">
            <view class="option-info">
              <text class="option-icon">✨</text>
              <view class="option-text">
                <text class="option-title">检查更新</text>
                <text class="option-desc">检查新版本并更新</text>
              </view>
            </view>
            <button class="action-btn primary-btn" @click="checkUpdate" :disabled="isCheckingUpdate">
              <text class="btn-text">{{ isCheckingUpdate ? '检查中...' : '检查' }}</text>
            </button>
          </view>
        </view>

        <!-- 工具管理 -->
        <view class="option-card">
          <view class="option-header">
            <view class="option-info">
              <text class="option-icon">🛠️</text>
              <view class="option-text">
                <text class="option-title">工具管理</text>
                <text class="option-desc">调整菜单显示顺序和显示状态</text>
              </view>
            </view>
            <button class="action-btn primary-btn" @click="goToToolsManager">
              <text class="btn-text">打开</text>
            </button>
          </view>
        </view>

        <!-- 数据导出 -->
        <view class="option-card">
          <view class="option-header option-header-multi">
            <view class="option-info">
              <text class="option-icon">📤</text>
              <view class="option-text">
                <text class="option-title">导出备份</text>
                <text class="option-desc">步骤：先点击“文件导出”，再点“发送备份文件”；剪切板导出后可直接粘贴保存</text>
              </view>
            </view>
            <view class="action-grid">
              <button class="action-btn backup-btn" @click="exportToFile">
                <text class="btn-text">文件导出</text>
              </button>
              <button class="action-btn backup-btn" @click="exportToClipboard">
                <text class="btn-text">剪切板导出</text>
              </button>
              <button v-if="canShareLastBackupFile" class="action-btn backup-btn" @click="shareLastBackupFile">
                <text class="btn-text">发送备份文件</text>
              </button>
            </view>
          </view>
        </view>

        <!-- 数据导入 -->
        <view class="option-card">
          <view class="option-header option-header-multi">
            <view class="option-info">
              <text class="option-icon">📥</text>
              <view class="option-text">
                <text class="option-title">导入备份</text>
                <text class="option-desc">支持微信聊天记录里的文件与剪切板导入，导入后会覆盖当前本地数据</text>
              </view>
            </view>
            <view class="action-grid">
              <button class="action-btn backup-btn" @click="importFromFile">
                <text class="btn-text">导入文件</text>
              </button>
              <button class="action-btn backup-btn" @click="importFromClipboard">
                <text class="btn-text">导入剪切板</text>
              </button>
            </view>
          </view>
        </view>

        <!-- 备份提醒 -->
        <view class="option-card">
          <view class="option-header option-header-multi">
            <view class="option-info">
              <text class="option-icon">⏰</text>
              <view class="option-text">
                <text class="option-title">备份提醒</text>
                <text class="option-desc">当前每 {{ backupReminderDays }} 天提醒一次，建议定期导出备份</text>
              </view>
            </view>
            <view class="action-grid">
              <button class="action-btn backup-btn" @click="changeBackupReminderDays">
                <text class="btn-text">提醒频率</text>
              </button>
              <button class="action-btn backup-btn" @click="checkBackupReminder(true)">
                <text class="btn-text">立即检查</text>
              </button>
            </view>
          </view>
        </view>
      </view>

      <!-- 系统信息 -->
      <view class="system-info-section">
        <view class="section-title">系统信息</view>
        <view class="info-grid">
          <view class="info-box">
            <text class="label">平台</text>
            <text class="value">{{ systemInfo.platform }}</text>
          </view>
          <view class="info-box">
            <text class="label">系统版本</text>
            <text class="value">{{ systemInfo.osVersion }}</text>
          </view>
          <view class="info-box">
            <text class="label">机型</text>
            <text class="value">{{ systemInfo.model }}</text>
          </view>
          <view class="info-box">
            <text class="label">屏幕高度</text>
            <text class="value">{{ systemInfo.screenHeight }}px</text>
          </view>
        </view>
      </view>

      <!-- 功能说明 -->
      <view class="tips-section">
        <view class="tips-title">💡 功能说明</view>
        <view class="tips-content">
          <text class="tip-item">• <text class="tip-label">清除缓存</text> - 删除应用所有本地存储数据，可能包括用户设置等，请谨慎使用</text>
          <text class="tip-item">• <text class="tip-label">重启应用</text> - 重新加载应用，可以解决应用卡顿或状态异常等问题</text>
          <text class="tip-item">• <text class="tip-label">检查更新</text> - 检查微信服务器是否有新版本，有新版本时会自动下载安装</text>
          <text class="tip-item">• <text class="tip-label">导出备份</text> - 导出后请立即发给微信文件传输助手，避免聊天清理或误删导致数据丢失</text>
          <text class="tip-item">• <text class="tip-label">导入备份</text> - 支持从微信聊天记录、文件、剪切板恢复，恢复后将覆盖当前本地数据</text>
        </view>
      </view>

      <!-- 关于本应用 -->
      <view class="about-section">
        <view class="about-title">📱 关于 DM工具箱</view>
        <view class="about-content">
          <text class="about-text">集成多种不实用功能的离线工具，专为日常生活和工作提供阻碍。</text>
          <text class="about-version">版本：{{ appVersion }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { getShareConfig } from '@/utils/useShare'

export default {
  ...getShareConfig({
    title: '系统设置 - DM工具箱',
    path: '/pages/components/systemSettings/systemSettings'
  })
}
</script>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'

interface SystemInfo {
  platform: string
  osVersion: string
  model: string
  screenHeight: number
}

const storageSize = ref('计算中...')
const appVersion = ref('0.1.9')
const isCheckingUpdate = ref(false)
const lastBackupTime = ref('从未备份')
const backupReminderDays = ref(30)
const lastBackupFilePath = ref('')
const lastBackupFileName = ref('')
const systemInfo = ref<SystemInfo>({
  platform: '',
  osVersion: '',
  model: '',
  screenHeight: 0
})

const BACKUP_START_MARKER = 'DM_TOOLBOX_BACKUP_START'
const BACKUP_END_MARKER = 'DM_TOOLBOX_BACKUP_END'
const BACKUP_LAST_EXPORT_AT_KEY = 'dm_backup_last_export_at'
const BACKUP_LAST_REMINDER_AT_KEY = 'dm_backup_last_reminder_at'
const BACKUP_REMINDER_DAYS_KEY = 'dm_backup_reminder_days'

interface BackupPayload {
  schemaVersion: number
  appVersion: string
  createdAt: string
  storage: Record<string, unknown>
}

const canShareLastBackupFile = computed(() => !!lastBackupFilePath.value)

onMounted(() => {
  getSystemInfo()
  calculateStorageSize()
  loadBackupStatus()
  checkBackupReminder()
})

const formatDateTime = (value: string | number) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '未知时间'
  }

  const yyyy = date.getFullYear()
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  const hh = `${date.getHours()}`.padStart(2, '0')
  const mi = `${date.getMinutes()}`.padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

const buildBackupText = (payload: BackupPayload) => {
  const jsonText = JSON.stringify(payload)
  return [
    '【DM工具箱备份】',
    '请完整复制下方内容，不要修改。',
    BACKUP_START_MARKER,
    jsonText,
    BACKUP_END_MARKER
  ].join('\n')
}

const parseBackupText = (rawText: string): BackupPayload => {
  const text = (rawText || '').trim()
  if (!text) {
    throw new Error('备份内容为空')
  }

  let jsonText = text
  const startIndex = text.indexOf(BACKUP_START_MARKER)
  const endIndex = text.indexOf(BACKUP_END_MARKER)
  if (startIndex >= 0 && endIndex > startIndex) {
    jsonText = text.slice(startIndex + BACKUP_START_MARKER.length, endIndex).trim()
  }

  const parsed = JSON.parse(jsonText) as BackupPayload
  if (!parsed || typeof parsed !== 'object' || !parsed.storage || typeof parsed.storage !== 'object') {
    throw new Error('备份格式无效')
  }

  return parsed
}

const getAllStorageData = async () => {
  const info = await uni.getStorageInfo()
  const data: Record<string, unknown> = {}

  if (!info.keys || info.keys.length === 0) {
    return data
  }

  for (const key of info.keys) {
    try {
      const res = await uni.getStorage({ key })
      data[key] = res.data
    } catch (e) {
      // 跳过读取失败的缓存项，避免中断整包导出
    }
  }

  return data
}

const loadBackupStatus = () => {
  const lastExportAt = uni.getStorageSync(BACKUP_LAST_EXPORT_AT_KEY) as string
  const reminderDays = Number(uni.getStorageSync(BACKUP_REMINDER_DAYS_KEY) || 30)

  backupReminderDays.value = Number.isFinite(reminderDays) && reminderDays > 0 ? reminderDays : 30
  lastBackupTime.value = lastExportAt ? formatDateTime(lastExportAt) : '从未备份'
}

const saveBackupExportTime = () => {
  const now = new Date().toISOString()
  uni.setStorageSync(BACKUP_LAST_EXPORT_AT_KEY, now)
  lastBackupTime.value = formatDateTime(now)
}

const afterExportReminder = () => {
  uni.showModal({
    title: '备份导出成功',
    content: '建议马上把备份内容发到微信文件传输助手，避免误删或换机后丢失。',
    confirmText: '知道了',
    showCancel: false
  })
}

const afterClipboardExportReminder = () => {
  uni.showModal({
    title: '剪切板导出成功',
    content: '备份内容已复制到剪切板，请尽快粘贴并保存到你常用的安全位置。',
    confirmText: '知道了',
    showCancel: false
  })
}

const exportToClipboard = async () => {
  try {
    const storage = await getAllStorageData()
    const payload: BackupPayload = {
      schemaVersion: 1,
      appVersion: appVersion.value,
      createdAt: new Date().toISOString(),
      storage
    }
    await uni.setClipboardData({
      data: buildBackupText(payload)
    })
    saveBackupExportTime()
    afterClipboardExportReminder()
  } catch (e) {
    uni.showToast({
      title: '导出失败，请稍后再试',
      icon: 'none'
    })
  }
}

const exportToFile = async () => {
  try {
    const storage = await getAllStorageData()
    const payload: BackupPayload = {
      schemaVersion: 1,
      appVersion: appVersion.value,
      createdAt: new Date().toISOString(),
      storage
    }
    const backupText = buildBackupText(payload)
    const timestamp = Date.now()
    const fileName = `dm_toolbox_backup_${timestamp}.txt`

    let exported = false
    let hasShownExportGuide = false

    // #ifdef MP-WEIXIN
    const wxApi = (globalThis as any).wx
    if (wxApi?.getFileSystemManager && wxApi?.env?.USER_DATA_PATH) {
      const fs = wxApi.getFileSystemManager()
      const filePath = `${wxApi.env.USER_DATA_PATH}/${fileName}`
      let verifiedSize = 0
      let shareFailReason = ''

      const isDevtools = (() => {
        try {
          if (!wxApi?.getSystemInfoSync) {
            return false
          }
          const info = wxApi.getSystemInfoSync()
          return info?.platform === 'devtools'
        } catch (e) {
          return false
        }
      })()

      await new Promise<void>((resolve, reject) => {
        fs.writeFile({
          filePath,
          data: backupText,
          encoding: 'utf8',
          success: () => resolve(),
          fail: (err: unknown) => reject(err)
        })
      })

      const verifyResult = await new Promise<{ ok: boolean; size: number }>((resolve) => {
        fs.readFile({
          filePath,
          encoding: 'utf8',
          success: (res: { data?: string }) => {
            const content = String(res.data || '')
            resolve({ ok: content.includes(BACKUP_START_MARKER) && content.includes(BACKUP_END_MARKER), size: content.length })
          },
          fail: () => resolve({ ok: false, size: 0 })
        })
      })

      if (!verifyResult.ok) {
        throw new Error('备份文件写入校验失败')
      }

      verifiedSize = verifyResult.size
      lastBackupFilePath.value = filePath
      lastBackupFileName.value = fileName

      if (wxApi?.shareFileMessage) {
        try {
          await shareLastBackupFile()
          uni.showModal({
            title: '文件已就绪',
            content: `备份已写入并校验成功\n大小：${Math.max(1, Math.round(verifiedSize / 1024))}KB\n已拉起分享面板，请选择微信文件传输助手完成发送。`,
            showCancel: false,
            confirmText: '知道了'
          })
          hasShownExportGuide = true
        } catch (shareError: any) {
          shareFailReason = shareError?.errMsg || 'shareFileMessage 调用失败'
          // 分享失败时继续尝试其他方式
        }
      }

      if (!hasShownExportGuide) {
        await uni.setClipboardData({
          data: `备份文件：${fileName}\n路径：${filePath}`
        })
        uni.showModal({
          title: '备份文件已生成',
          content: `备份已写入并校验成功\n文件名：${fileName}\n大小：${Math.max(1, Math.round(verifiedSize / 1024))}KB\n分享失败：${shareFailReason || '当前环境不支持'}${isDevtools ? '\n当前为微信开发者工具，通常无法直接调起分享。' : ''}\n请点击“发送备份文件”按钮再次触发分享（必须手动点击）。`,
          showCancel: false,
          confirmText: '知道了'
        })
        hasShownExportGuide = true
      }

      exported = true
    }
    // #endif

    // #ifdef H5
    if (!exported) {
      const blob = new Blob([backupText], { type: 'text/plain;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)
      exported = true
    }
    // #endif

    if (!exported) {
      await uni.setClipboardData({ data: backupText })
      uni.showToast({
        title: '当前环境已降级到剪切板导出',
        icon: 'none',
        duration: 1800
      })
    }

    saveBackupExportTime()
    if (!hasShownExportGuide) {
      afterExportReminder()
    }
  } catch (e) {
    uni.showToast({
      title: '文件导出失败',
      icon: 'none'
    })
  }
}

const shareLastBackupFile = async () => {
  const wxApi = (globalThis as any).wx
  if (!lastBackupFilePath.value || !lastBackupFileName.value) {
    uni.showToast({
      title: '请先执行文件导出',
      icon: 'none'
    })
    throw new Error('没有可分享的备份文件')
  }

  if (!wxApi?.shareFileMessage) {
    uni.showToast({
      title: '当前环境不支持文件分享',
      icon: 'none'
    })
    throw new Error('环境不支持 shareFileMessage')
  }

  await new Promise<void>((resolve, reject) => {
    wxApi.shareFileMessage({
      filePath: lastBackupFilePath.value,
      fileName: lastBackupFileName.value,
      success: () => resolve(),
      fail: (err: unknown) => reject(err)
    })
  })
}

const confirmAndRestoreBackup = async (rawText: string) => {
  const payload = parseBackupText(rawText)
  const keys = Object.keys(payload.storage)

  if (keys.length === 0) {
    throw new Error('备份中没有可恢复的数据')
  }

  const confirmed = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '确认导入备份',
      content: `将恢复 ${keys.length} 项本地数据，并覆盖当前内容，是否继续？`,
      confirmText: '继续导入',
      confirmColor: '#d32f2f',
      success: (res) => resolve(!!res.confirm),
      fail: () => resolve(false)
    })
  })

  if (!confirmed) {
    return
  }

  await uni.clearStorage()
  for (const key of keys) {
    await uni.setStorage({
      key,
      data: payload.storage[key]
    })
  }

  loadBackupStatus()
  calculateStorageSize()

  uni.showModal({
    title: '导入完成',
    content: '本地数据已恢复，建议重启应用以确保所有模块读取到最新状态。',
    confirmText: '立即重启',
    cancelText: '稍后',
    success: (res) => {
      if (res.confirm) {
        restartApp()
      }
    }
  })
}

const readWechatMessageFile = async () => {
  const wxApi = (globalThis as any).wx
  if (!wxApi?.chooseMessageFile || !wxApi?.getFileSystemManager) {
    throw new Error('当前环境不支持微信聊天文件导入')
  }

  const chooseResult = await new Promise<any>((resolve, reject) => {
    wxApi.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['txt', 'json'],
      success: (res: any) => resolve(res),
      fail: (err: unknown) => reject(err)
    })
  })

  const file = chooseResult?.tempFiles?.[0]
  const path = file?.path || file?.tempFilePath
  if (!path) {
    throw new Error('未选择到有效文件')
  }

  const fs = wxApi.getFileSystemManager()
  const content = await new Promise<string>((resolve, reject) => {
    fs.readFile({
      filePath: path,
      encoding: 'utf8',
      success: (res: any) => resolve(res.data || ''),
      fail: (err: unknown) => reject(err)
    })
  })

  return content
}

const importFromFile = async () => {
  try {
    let importedText = ''

    // #ifdef MP-WEIXIN
    importedText = await readWechatMessageFile()
    // #endif

    // #ifdef H5
    if (!importedText) {
      importedText = await new Promise<string>((resolve, reject) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.txt,.json'
        input.onchange = () => {
          const file = input.files?.[0]
          if (!file) {
            reject(new Error('未选择文件'))
            return
          }

          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result || ''))
          reader.onerror = () => reject(new Error('文件读取失败'))
          reader.readAsText(file, 'utf-8')
        }
        input.click()
      })
    }
    // #endif

    if (!importedText) {
      throw new Error('当前环境不支持文件导入')
    }

    await confirmAndRestoreBackup(importedText)
  } catch (e) {
    uni.showToast({
      title: '文件导入失败',
      icon: 'none'
    })
  }
}

const importFromClipboard = async () => {
  try {
    const res = await uni.getClipboardData()
    await confirmAndRestoreBackup(String(res.data || ''))
  } catch (e) {
    uni.showToast({
      title: '剪切板导入失败',
      icon: 'none'
    })
  }
}

const changeBackupReminderDays = () => {
  uni.showActionSheet({
    itemList: ['每3天提醒', '每7天提醒', '每14天提醒', '每30天提醒'],
    success: (res) => {
      const daysMap = [3, 7, 14, 30]
      const days = daysMap[res.tapIndex] || 7
      backupReminderDays.value = days
      uni.setStorageSync(BACKUP_REMINDER_DAYS_KEY, days)
      uni.showToast({
        title: `已设置为每${days}天提醒`,
        icon: 'none'
      })
    }
  })
}

const checkBackupReminder = (manual = false) => {
  const intervalDays = Number(uni.getStorageSync(BACKUP_REMINDER_DAYS_KEY) || backupReminderDays.value || 7)
  const lastExportAt = uni.getStorageSync(BACKUP_LAST_EXPORT_AT_KEY) as string
  const lastReminderAt = uni.getStorageSync(BACKUP_LAST_REMINDER_AT_KEY) as string
  const now = Date.now()

  if (manual && !lastExportAt) {
    uni.showModal({
      title: '建议立即备份',
      content: '你还没有导出过备份，建议现在导出并发送到微信文件传输助手。',
      confirmText: '去导出',
      success: (res) => {
        if (res.confirm) {
          exportToClipboard()
        }
      }
    })
    return
  }

  if (!lastExportAt) {
    return
  }

  const exportGap = now - new Date(lastExportAt).getTime()
  const reminderGap = lastReminderAt ? now - new Date(lastReminderAt).getTime() : Number.POSITIVE_INFINITY
  const intervalMs = Math.max(1, intervalDays) * 24 * 60 * 60 * 1000
  const oneDayMs = 24 * 60 * 60 * 1000

  if (manual || (exportGap >= intervalMs && reminderGap >= oneDayMs)) {
    uni.setStorageSync(BACKUP_LAST_REMINDER_AT_KEY, new Date(now).toISOString())
    uni.showModal({
      title: '备份提醒',
      content: '距离上次备份已超过设定周期，是否现在导出并发给微信文件传输助手？',
      confirmText: '立即导出',
      cancelText: '稍后再说',
      success: (res) => {
        if (res.confirm) {
          exportToClipboard()
        }
      }
    })
  } else if (manual) {
    uni.showToast({
      title: '暂时无需备份提醒',
      icon: 'none'
    })
  }
}

/**
 * 获取系统信息
 * 思考：获取系统信息对于调试和用户了解设备状态很重要
 */
const getSystemInfo = async () => {
  try {
    const info = await uni.getSystemInfo()
    systemInfo.value = {
      platform: info.platform === 'android' ? 'Android' : 'iOS',
      osVersion: info.system,
      model: info.model,
      screenHeight: info.screenHeight
    }
    // 获取应用版本号（改为手动更新）
    // const appInfo = await uni.getAppBaseInfo()
    // if (appInfo.appVersion) {
    //   appVersion.value = appInfo.appVersion
    // }
  } catch (e) {
    console.error('获取系统信息失败:', e)
  }
}

/**
 * 计算存储大小
 * 思考：遍历所有缓存项获取总大小，给用户直观的缓存占用信息
 */
const calculateStorageSize = async () => {
  try {
    const allKeys = await uni.getStorageInfo()
    let totalSize = 0

    if (allKeys.keys && allKeys.keys.length > 0) {
      for (const key of allKeys.keys) {
        try {
          const res = await uni.getStorage({ key })
          const itemSize = JSON.stringify(res.data).length
          totalSize += itemSize
        } catch (e) {
          // 跳过无法读取的项
        }
      }
    }

    if (totalSize === 0) {
      storageSize.value = '无缓存'
    } else if (totalSize < 1024) {
      storageSize.value = `${totalSize}B`
    } else if (totalSize < 1024 * 1024) {
      storageSize.value = `${(totalSize / 1024).toFixed(2)}KB`
    } else {
      storageSize.value = `${(totalSize / (1024 * 1024)).toFixed(2)}MB`
    }
  } catch (e) {
    storageSize.value = '无法计算'
  }
}

/**
 * 清除缓存
 * 思考：
 * 1. 使用确认对话框防止用户误操作
 * 2. 清除成功后显示提示，并重新计算存储大小
 * 3. 这是一个危险操作，应该有清晰的提示
 */
const clearCache = () => {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除所有缓存数据吗？此操作不可撤销！',
    confirmText: '清除',
    confirmColor: '#d32f2f',
    success: async (res) => {
      if (res.confirm) {
        try {
          await uni.clearStorage()
          uni.showToast({
            title: '缓存已清除',
            duration: 1000
          })
          // 重新计算存储大小
          calculateStorageSize()
        } catch (e) {
          uni.showToast({
            title: '清除失败',
            icon: 'none',
            duration: 1000
          })
        }
      }
    }
  })
}

/**
 * 重启应用
 * 思考：
 * 1. 使用 reLaunch 返回首页，确保应用状态重置
 * 2. 不需要确认，因为重启是可恢复的操作
 * 3. 可以解决异常状态、内存泄漏等问题
 */
const restartApp = () => {
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

/**
 * 检查更新
 * 思考：
 * 1. 仅在微信小程序环境中有效（使用 getUpdateManager）
 * 2. 显示检查中的状态，避免用户重复点击
 * 3. 处理三种情况：
 *    - 已是最新版本
 *    - 有新版本自动下载
 *    - 有新版本需要用户确认
 * 4. 更新完成后提示用户重启应用
 */
const checkUpdate = () => {
  isCheckingUpdate.value = true

  try {
    // 仅在微信小程序中可用
    const updateManager = uni.getUpdateManager()
    let checkCompleted = false

    updateManager.onCheckForUpdate((res) => {
      checkCompleted = true

      if (!res.hasUpdate) {
        isCheckingUpdate.value = false
        uni.showToast({
          title: '已是最新版本',
          duration: 1500
        })
        return
      }

      uni.showToast({
        title: '检测到新版本，下载中',
        icon: 'none',
        duration: 1500
      })
    })

    updateManager.onUpdateReady(() => {
      isCheckingUpdate.value = false

      // 新版本已下载完毕，可立即应用
      uni.showModal({
        title: '更新提示',
        content: '新版本已准备就绪，是否立即更新?',
        confirmText: '更新',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(() => {
      isCheckingUpdate.value = false
      uni.showToast({
        title: '更新失败，请稍后重试',
        icon: 'none',
        duration: 1500
      })
    })

    // 延迟后隐藏检查状态（防止频繁点击）
    setTimeout(() => {
      if (isCheckingUpdate.value) {
        isCheckingUpdate.value = false
      }

      if (!checkCompleted) {
        uni.showToast({
          title: '检查完成，请稍后再试',
          icon: 'none',
          duration: 1500
        })
      }
    }, 2000)
  } catch (e) {
    isCheckingUpdate.value = false
    uni.showToast({
      title: '当前环境不支持更新检查',
      icon: 'none',
      duration: 1500
    })
  }
}

/**
 * 打开工具管理页面
 */
const goToToolsManager = () => {
  uni.navigateTo({
    url: '/pages/components/toolsManager/toolsManager'
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0 0 40rpx 0;
}

.page-content {
  padding: 30rpx;
}

/* 信息卡片 */
.info-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.header-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

/* 操作区域 */
.operation-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  margin-left: 10rpx;
}

.option-card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.option-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.option-header-multi {
  align-items: flex-start;
  flex-direction: column;
}

.option-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.option-icon {
  font-size: 40rpx;
  min-width: 40rpx;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  flex: 1;
}

.option-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.option-desc {
  font-size: 24rpx;
  color: #999;
}

.action-btn {
  border: none;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  font-size: 26rpx;
  font-weight: 500;
  min-width: 100rpx;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;

  &.primary-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  &.danger-btn {
    background: #ff6b6b;
    color: white;
  }

  &.backup-btn {
    width: 100%;
    min-width: 0;
    background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%);
    color: white;
    border-radius: 14rpx;
    box-shadow: 0 6rpx 16rpx rgba(14, 165, 233, 0.22);
  }

  &:disabled {
    opacity: 0.6;
  }
}

.btn-text {
  font-size: 26rpx;
}

.action-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12rpx;
}

.action-grid-three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 750rpx) {
  .action-grid-three {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* 系统信息 */
.system-info-section {
  margin-bottom: 30rpx;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.info-box {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.label {
  font-size: 24rpx;
  color: #999;
}

.value {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  text-align: center;
  word-break: break-all;
}

/* 功能说明 */
.tips-section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  border-left: 4rpx solid #667eea;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 30rpx;
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

.tip-label {
  font-weight: 600;
  color: #667eea;
}

/* 关于本应用 */
.about-section {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 16rpx;
  padding: 24rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.1);
}

.about-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.about-content {
  padding-left: 8rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.about-text {
  font-size: 26rpx;
  line-height: 1.8;
  color: #666;
}

.about-version {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.tip-label {
  color: #667eea;
  font-weight: 500;
}
</style>
