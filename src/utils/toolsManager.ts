/**
 * 工具管理模块
 * 用于管理工具的显示顺序和状态
 * 工具列表定义在 defaultTools.ts，所有地方共享同一份编辑的列表
 */

import { getDefaultToolsList, type ToolItem } from './defaultTools'
import dayjs from './dayjs'

export type { ToolItem } from './defaultTools'
export { getDefaultToolsList } from './defaultTools'

const TOOLS_CONFIG_KEY = 'tools_config'

const mergeToolsWithDefaults = (savedTools: ToolItem[], defaultTools: ToolItem[]): ToolItem[] => {
  const defaultToolMap = new Map(defaultTools.map((tool) => [tool.url, tool]))
  const mergedTools: ToolItem[] = []
  const existingUrls = new Set<string>()

  for (const savedTool of savedTools) {
    const defaultTool = defaultToolMap.get(savedTool.url)

    if (!defaultTool || existingUrls.has(savedTool.url)) {
      continue
    }

    mergedTools.push({
      ...defaultTool,
      visible: savedTool.visible
    })
    existingUrls.add(savedTool.url)
  }

  for (const defaultTool of defaultTools) {
    if (existingUrls.has(defaultTool.url)) {
      continue
    }

    mergedTools.push(defaultTool)
  }

  return mergedTools
}

/**
 * 获取工具列表（按用户配置顺序）
 */
export async function getToolsList(): Promise<ToolItem[]> {
  const defaultTools = getDefaultToolsList()

  try {
    const config = await uni.getStorage({ key: TOOLS_CONFIG_KEY })
    if (config.data && Array.isArray(config.data.tools)) {
      return mergeToolsWithDefaults(config.data.tools, defaultTools)
    }
  } catch (e) {
    // 配置不存在，使用默认列表
  }

  return defaultTools
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
        timestamp: dayjs().valueOf()
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
