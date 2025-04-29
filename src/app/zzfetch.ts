export const BASE_URL = 'https://zzdifyapi.zhuanspirit.com/v1'

interface RequestOptions {
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string>
  isStream?: boolean
  onStream?: (data: any) => void
}

interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

export const zzFetch = async <T = any>(
  type: 'get' | 'post',
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T> | void> => {
  const { headers = {}, body, params, isStream = false, onStream } = options

  let fullUrl = `${BASE_URL}${url}`
  if (params) {
    const searchParams = new URLSearchParams(params)
    fullUrl += `?${searchParams.toString()}`
  }

  try {
    const response = await fetch(fullUrl, {
      method: type.toUpperCase(),
      // credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_DIFY_API_KEY}`,
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 处理流式响应
    if (isStream && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = '' // 用于存储不完整的数据

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // 将新的数据添加到缓冲区
        buffer += decoder.decode(value, { stream: true })

        // 查找完整的事件
        let boundary = buffer.indexOf('\n\n')
        while (boundary !== -1) {
          const event = buffer.slice(0, boundary)
          buffer = buffer.slice(boundary + 2)

          if (event.startsWith('data: ')) {
            try {
              // 清理数据字符串
              const jsonStr = event.slice(6).trim()
              if (jsonStr) {
                const jsonData = JSON.parse(jsonStr)
                onStream?.(jsonData)
              }
            } catch (e) {
              console.error('解析SSE数据失败:', e)
              console.log('原始数据:', event)
            }
          }

          boundary = buffer.indexOf('\n\n')
        }
      }

      // 处理最后可能剩余的数据
      if (buffer.trim() && buffer.startsWith('data: ')) {
        try {
          const jsonStr = buffer.slice(6).trim()
          if (jsonStr) {
            const jsonData = JSON.parse(jsonStr)
            onStream?.(jsonData)
          }
        } catch (e) {
          console.error('解析最后的SSE数据失败:', e)
          console.log('剩余数据:', buffer)
        }
      }

      return
    }

    // 处理普通JSON响应
    const data: ApiResponse<T> = await response.json()
    return data
  } catch (error) {
    console.error('请求出错:', error)
    throw error
  }
}
