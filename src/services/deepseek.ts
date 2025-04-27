import OpenAI from 'openai'

// https://platform.deepseek.com/usage 获取 APIKEY
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY,
  timeout: 30000
})

export async function generateMindmap(content: string) {
  console.log('生成思维导图，输入内容:', content)

  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY 环境变量未设置')
  }

  try {
    console.log('开始调用 DeepSeek API...')
    console.log(['===', content])
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `你是一个思维导图生成助手。请将输入的文本内容转换为思维导图格式的markdown文本。
            要求：
            1. 使用markdown标题语法 (#) 来表示层级关系
            2. 一级标题使用单个#，二级标题使用##，以此类推
            3. 确保层级结构清晰，最多使用4级标题
            4. 内容要有逻辑性和层次感
            5. 不要添加额外的解释或说明文字
            6. 思维导图尽量详细，不要遗漏任何重要信息
            `
        },
        {
          role: 'user',
          content: content
        }
      ],
      model: 'deepseek-chat',
      temperature: 0.7,
      max_tokens: 2000
    })
    const markdown = completion.choices[0].message.content
    console.log('DeepSeek 生成的 Markdown:', markdown)
    return markdown
  } catch (error) {
    console.error('调用 DeepSeek API 错误:', error)
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('API 请求超时，请稍后重试')
      }
      if (error.message.includes('apiKey')) {
        throw new Error('API 密钥无效或未正确配置')
      }
    }
    throw error
  }
}

export async function fetchUrlContent(url: string) {
  console.log('获取URL内容:', url)

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const text = await response.text()
    console.log('成功获取URL内容')
    return text
  } catch (error) {
    console.error('获取URL内容错误:', error)
    throw error
  }
}
