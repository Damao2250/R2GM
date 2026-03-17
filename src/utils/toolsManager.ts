/**
 * 工具管理模块
 * 用于管理工具的显示顺序和状态
 * 工具列表定义在 defaultTools.ts，所有地方共享同一份编辑的列表
 */

import { getDefaultToolsList, type ToolItem } from './defaultTools'

export type { ToolItem } from './defaultTools'
export { getDefaultToolsList } from './defaultTools'

const TOOLS_CONFIG_KEY = 'tools_config'

/**
 * 获取工具列表（按用户配置顺序）
 */
export async function getToolsList(): Promise<ToolItem[]> {
  try {
    const config = await uni.getStorage({ key: TOOLS_CONFIG_KEY })
    if (config.data && config.data.tools) {
      return config.data.tools
    }
  } catch (e) {
    // 配置不存在，使用默认列表
  }

  return getDefaultToolsList()
}

/**
 * 保存工具顺序配置
 */
export async function saveToolsOrder(tools: ToolItem[]): Promise<void> {
  try {
    await uni.setStorage({
      key: TOOLS_CONFIG_KEY,
      data: {
        tools,
        timestamp: Date.now()
      }
    })
  } catch (e) {
    console.error('保存工具配置失败:', e)
    throw new Error('保存工具配置失败')
  }
}

/**
 * 重置为默认顺序
 */
export async function resetToolsOrder(): Promise<void> {
  try {
    await uni.removeStorage({ key: TOOLS_CONFIG_KEY })
  } catch (e) {
    console.error('重置工具配置失败:', e)
    throw new Error('重置工具配置失败')
  }
}

/**
 * 移动工具位置
 */
export function moveToolItem(
  tools: ToolItem[],
  fromIndex: number,
  toIndex: number
): ToolItem[] {
  if (fromIndex < 0 || fromIndex >= tools.length || toIndex < 0 || toIndex >= tools.length) {
    return tools
  }

  const newTools = [...tools]
  const [item] = newTools.splice(fromIndex, 1)
  newTools.splice(toIndex, 0, item)
  return newTools
}

/**
 * 切换工具可见性
 */
export function toggleToolVisibility(tools: ToolItem[], index: number): ToolItem[] {
  if (index < 0 || index >= tools.length) {
    return tools
  }

  const newTools = [...tools]
  newTools[index] = {
    ...newTools[index],
    visible: !newTools[index].visible
  }
  return newTools
}

/**
 * 获取可见的工具列表
 */
export function getVisibleTools(tools: ToolItem[]): ToolItem[] {
  return tools.filter((tool) => tool.visible !== false)
}
