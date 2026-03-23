interface UniErrorLike {
  errMsg?: string
  message?: string
}

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null) {
    const { errMsg, message } = error as UniErrorLike

    if (typeof errMsg === 'string' && errMsg.trim()) {
      return errMsg
    }

    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallback
}

export const exportCanvasImage = async (
  canvasId: string,
  width: number,
  height: number,
  retryDelays: number[] = [0, 80, 160, 320]
) => {
  let lastError: unknown

  for (const delay of retryDelays) {
    if (delay > 0) {
      await wait(delay)
    }

    try {
      const tempFilePath = await new Promise<string>((resolve, reject) => {
        uni.canvasToTempFilePath({
          canvasId,
          destWidth: width,
          destHeight: height,
          success: res => {
            resolve(res.tempFilePath)
          },
          fail: reject
        })
      })

      return tempFilePath
    } catch (error) {
      lastError = error
    }
  }

  throw lastError ?? new Error('导出图片失败')
}

export const flushCanvasDraw = (ctx: any) =>
  new Promise<void>(resolve => {
    if (typeof ctx.draw !== 'function') {
      resolve()
      return
    }

    ctx.draw(false, () => {
      resolve()
    })
  })

export const drawRoundedRect = (
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2)

  ctx.beginPath()
  ctx.moveTo(x + safeRadius, y)
  ctx.lineTo(x + width - safeRadius, y)
  ctx.arcTo(x + width, y, x + width, y + safeRadius, safeRadius)
  ctx.lineTo(x + width, y + height - safeRadius)
  ctx.arcTo(x + width, y + height, x + width - safeRadius, y + height, safeRadius)
  ctx.lineTo(x + safeRadius, y + height)
  ctx.arcTo(x, y + height, x, y + height - safeRadius, safeRadius)
  ctx.lineTo(x, y + safeRadius)
  ctx.arcTo(x, y, x + safeRadius, y, safeRadius)
  ctx.closePath()
}

export const wrapCanvasText = (ctx: any, text: string, maxWidth: number) => {
  const lines: string[] = []
  let currentLine = ''

  for (const char of text) {
    const nextLine = currentLine + char
    const measured = ctx.measureText(nextLine)
    const width = typeof measured?.width === 'number' ? measured.width : nextLine.length * 14

    if (width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = nextLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}
