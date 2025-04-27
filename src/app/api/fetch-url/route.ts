import { NextResponse } from 'next/server'
import { fetchUrlContent } from '@/services/deepseek'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL不能为空' }, { status: 400 })
    }

    const content = await fetchUrlContent(url)
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error in fetch-url API:', error)
    return NextResponse.json(
      { error: '获取URL内容时发生错误' },
      { status: 500 }
    )
  }
}
