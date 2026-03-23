export interface MoreToolIdeaItem {
  id: string
  title: string
  icon: string
  description: string
  url: string
}

export const moreToolIdeas: MoreToolIdeaItem[] = [
  {
    id: 'tool-blind-box',
    title: '工具盲盒',
    icon: '🎁',
    description: '摇一摇设备或长按首页 Logo 随机开出一个工具，再附赠一句今日怪工具推荐。',
    url: '/pkg-more/toolBlindBox/toolBlindBox'
  },
  {
    id: 'result-card-factory',
    title: '结果卡片工厂',
    icon: '🖼️',
    description: '把倒数日、生日、随机决策、折扣结果等内容一键生成可分享的视觉卡片图。',
    url: '/pkg-more/resultCardFactory/resultCardFactory'
  },
  {
    id: 'daily-destiny-dashboard',
    title: '今日命运面板',
    icon: '🔮',
    description: '把生日、当前时间、随机数和罗盘方向拼成一本正经但不太靠谱的每日运势面板。',
    url: '/pkg-more/destinyPanel/destinyPanel'
  },
  {
    id: 'time-capsule',
    title: '时间胶囊',
    icon: '🕰️',
    description: '保存今天的时间、设备、网络状态和短句，等到未来指定日期再打开这份本地快照。',
    url: '/pkg-more/timeCapsule/timeCapsule'
  },
  {
    id: 'direction-easter-egg',
    title: '方向彩蛋',
    icon: '🧭',
    description: '根据设备朝向触发不同隐藏页面，或者在设备放平时解锁额外小游戏和特殊动画。',
    url: '/pkg-more/directionEasterEgg/directionEasterEgg'
  },
  {
    id: 'reverse-decider',
    title: '反向决策器',
    icon: '🪓',
    description: '不直接替你选答案，而是一轮轮淘汰候选项，让你在最后时刻看清自己真正偏向谁。',
    url: '/pkg-more/reverseDecider/reverseDecider'
  },
  {
    id: 'procrastination-starter',
    title: '拖延启动器',
    icon: '⏳',
    description: '进入目标工具前先过 10 秒倒计时、1 道口算和 1 个随机动作，用仪式感打断拖延。',
    url: '/pkg-more/procrastinationStarter/procrastinationStarter'
  },
  {
    id: 'local-persona-report',
    title: '本地人格画像',
    icon: '🧠',
    description: '根据常用工具、使用时段和决策偏好，在本地生成一份你是哪种工具人的画像报告。',
    url: '/pkg-more/localPersona/localPersona'
  },
  {
    id: 'emergency-show-mode',
    title: '紧急演出模式',
    icon: '🚨',
    description: '提供超大字板、临时二维码、闪屏 SOS 和简易摩斯电码，适合临时展示和快速求助。',
    url: '/pkg-more/emergencyShow/emergencyShow'
  }
]
