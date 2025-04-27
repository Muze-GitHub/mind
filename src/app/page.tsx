'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const MindMap = dynamic(() => import('@/components/MindMap'), { ssr: false })

export default function Home() {
  const [inputType, setInputType] = useState<'content' | 'url'>('content')
  const [input, setInput] = useState('')
  const [markdownContent, setMarkdownContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      let content = input

      if (inputType === 'url') {
        const response = await fetch('/api/fetch-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: input })
        })
        const data = await response.json()
        content = data.content
      }

      const response = await fetch('/api/generate-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      const data = await response.json()
      setMarkdownContent(data.markdown)
    } catch (err) {
      setError('生成思维导图时发生错误')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-gray-800 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 relative">
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-500/5 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-cyan-500/5 blur-3xl rounded-full"></div>
        </div>

        {/* 主标题 */}
        <div className="relative">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-transparent bg-clip-text">
            思维导图生成器
          </h1>
          <p className="text-center text-gray-500 text-sm md:text-base">
            powered by DeepSeek AI
          </p>
        </div>

        {/* 主要内容区域 */}
        <div className="space-y-6 relative z-10">
          {/* 切换按钮 */}
          <div className="flex justify-center gap-4 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
            <button
              className={`px-6 py-3 rounded-md transition-all duration-300 ${
                inputType === 'content'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
              }`}
              onClick={() => setInputType('content')}
            >
              文章内容
            </button>
            <button
              disabled
              className={`px-6 py-3 rounded-md transition-all cursor-not-allowed duration-300 ${
                inputType === 'url'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
              }`}
              onClick={() => setInputType('url')}
            >
              文章链接
            </button>
          </div>

          {/* 输入区域 */}
          <div className="relative group">
            {inputType === 'content' ? (
              <textarea
                className="w-full h-48 p-6 rounded-lg bg-white/80 text-gray-700 border border-gray-200
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300
                          backdrop-blur-sm placeholder:text-gray-400 resize-none shadow-lg"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="请输入文章内容..."
              />
            ) : (
              <input
                type="url"
                className="w-full p-6 rounded-lg bg-white/80 text-gray-700 border border-gray-200
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300
                          backdrop-blur-sm placeholder:text-gray-400 shadow-lg"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="请输入文章链接..."
              />
            )}
          </div>

          {/* 提交按钮 */}
          <button
            className={`w-full py-4 rounded-lg transition-all duration-300 relative overflow-hidden shadow-lg
                      ${
                        loading
                          ? 'bg-gray-400'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-xl hover:from-blue-600 hover:to-cyan-600'
                      }
                      text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={handleSubmit}
            disabled={loading || !input}
          >
            <span className="relative z-10">
              {loading ? '生成中...' : '生成思维导图'}
            </span>
          </button>

          {/* 错误提示 */}
          {error && (
            <div className="text-red-500 text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* 结果展示区域 */}
        {markdownContent && (
          <div className="space-y-8 relative z-10">
            {/* 思维导图 */}
            <div className="p-6 rounded-lg bg-white/80 border border-gray-200 shadow-lg backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                思维导图:
              </h2>
              <div className="h-[600px] w-full rounded-lg bg-white border border-gray-100">
                <MindMap markdown={markdownContent} />
              </div>
            </div>
            {/* Markdown预览 */}
            <div className="p-6 rounded-lg bg-white/80 border border-gray-200 shadow-lg backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                DeepSeek 生成的 Markdown:
              </h2>
              <pre className="whitespace-pre-wrap text-gray-600 font-mono text-sm bg-gray-50 p-4 rounded-lg">
                {markdownContent}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
