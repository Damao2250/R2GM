/**
 * 分享工具函数
 * 在页面 export default 中使用
 */

interface ShareConfig {
  title: string
  path: string
  imageUrl?: string
  query?: string
}

export const getShareConfig = (config: ShareConfig) => {
  return {
    onShareAppMessage() {
      return {
        title: config.title,
        path: config.path,
        imageUrl: config.imageUrl || '/static/dm-logo.png'
      }
    },
    onShareTimeline() {
      return {
        title: config.title,
        query: config.query || '',
        imageUrl: config.imageUrl || '/static/dm-logo.png'
      }
    }
  }
}
