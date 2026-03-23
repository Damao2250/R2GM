/**
 * 默认工具列表定义
 * 所有工具信息统一定义在这里，首页和工具管理会自动同步
 */

export interface ToolItem {
  title: string
  url: string
  icon?: string
  visible?: boolean
}

/**
 * 获取默认工具列表
 * 每次添加新工具，只需在这里添加即可，所有地方都会自动同步
 */
export function getDefaultToolsList(): ToolItem[] {
  return [
    {
      title: '金额转大写',
      url: '/pages/components/convertCurrency/convertCurrency',
      icon: '💰',
      visible: true
    },
    {
      title: '倒数日',
      url: '/pages/components/countdown/countdown',
      icon: '📅',
      visible: true
    },
    {
      title: '网络信息',
      url: '/pages/components/networkInfo/networkInfo',
      icon: '🌐',
      visible: true
    },
    {
      title: 'base64/MD5',
      url: '/pages/components/base64Conver/base64Conver',
      icon: '🔐',
      visible: true
    },
    {
      title: '当前时间',
      url: '/pages/components/timeNow/timeNow',
      icon: '⏰',
      visible: true
    },
    {
      title: '设备信息',
      url: '/pages/components/deviceInfo/deviceInfo',
      icon: '📱',
      visible: true
    },
    {
      title: '二维码分享',
      url: '/pages/components/qrcodeShare/qrcodeShare',
      icon: '📲',
      visible: true
    },
    {
      title: '单位转换',
      url: '/pages/components/unitConvert/unitConvert',
      icon: '📏',
      visible: true
    },
    {
      title: '亲戚计算器',
      url: '/pages/components/relativeCalculator/relativeCalculator',
      icon: '👨‍👩‍👧‍👦',
      visible: true
    },
    {
      title: '随机数工具',
      url: '/pages/components/randomNumber/randomNumber',
      icon: '🎲',
      visible: true
    },
    {
      title: '口算练习',
      url: '/pages/components/numberMerge/numberMerge',
      icon: '📝',
      visible: true
    },
    {
      title: '折扣计算器',
      url: '/pages/components/discountCalculator/discountCalculator',
      icon: '💵',
      visible: true
    },
    {
      title: '配对缘分',
      url: '/pages/components/matchCalculator/matchCalculator',
      icon: '💑',
      visible: true
    },
    {
      title: '决策助手',
      url: '/pages/components/randomDecider/randomDecider',
      icon: '🎴',
      visible: true
    },
    {
      title: '生日/星座',
      url: '/pages/components/birthdayCalculator/birthdayCalculator',
      icon: '🎂',
      visible: true
    },
    {
      title: '灵感罗盘',
      url: '/pkg-device/compass/compass',
      icon: '🧭',
      visible: true
    },
    {
      title: 'BMI计算',
      url: '/pkg-health/bmiCalculator/bmiCalculator',
      icon: '⚖️',
      visible: true
    },
    {
      title: '更多工具',
      url: '/pkg-more/moreTools/moreTools',
      icon: '🪄',
      visible: true
    },
    {
      title: '系统设置',
      url: '/pages/components/systemSettings/systemSettings',
      icon: '⚙️',
      visible: true
    }
  ]
}
