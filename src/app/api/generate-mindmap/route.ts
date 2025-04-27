import { NextResponse } from 'next/server'
import { generateMindmap } from '@/services/deepseek'

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }

    const markdown = await generateMindmap(content)
    return NextResponse.json({ markdown })
  } catch (error) {
    console.error('Error in generate-mindmap API:', error)
    return NextResponse.json(
      { error: '生成思维导图时发生错误' },
      { status: 500 }
    )
  }
}
