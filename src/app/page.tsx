'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { zzFetch } from './zzfetch'
import DynamicForm from '@/components/DynamicForm'
import TypeWriter from '@/components/TypeWriter'
import { Spin } from 'antd'
import { getWorkFlowParamsApi } from './api'

const MindMap = dynamic(() => import('@/components/MindMap'), { ssr: false })

interface StreamingResponse {
  type: string
  content: string
  taskId: string
  workflowRunId: string
  fromVariable: [string, string]
}

export default function Home() {
  const [input, setInput] = useState('')
  const [markdownContent, setMarkdownContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formInputType, setFormInputType] = useState([])
  const [streamContent, setStreamContent] = useState('')
  const [isGeneratingMindmap, setIsGeneratingMindmap] = useState(false)
  const [taskStatus, setTaskStatus] = useState<{
    taskId?: string
    status?: string
  }>({})

  // 处理流式响应
  const handleStreamingResponse = (data: StreamingResponse) => {
    if (data.type === 'text' && data.content) {
      setStreamContent((prev) => prev + data.content)
    }
  }

  // 处理任务状态变化
  const handleTaskStatusChange = (status: {
    taskId?: string
    status?: 'running' | 'succeeded' | 'failed' | 'stopped'
  }) => {
    setTaskStatus(status)
    if (status.status === 'succeeded') {
      // 任务成功完成，可以在这里处理
      console.log('任务完成')
    } else if (status.status === 'failed') {
      setError('任务执行失败')
    }
  }

  // 获取工作流参数
  const getWorkFlowParams = async () => {
    try {
      setLoading(true)
      const res: any = await getWorkFlowParamsApi()
      console.log(res)
      const { user_input_form } = res
      setFormInputType(user_input_form || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 重置状态
  const handleReset = () => {
    setStreamContent('')
    setError('')
    setTaskStatus({})
  }

  // 生成思维导图
  const handleGenerateMindmap = async () => {
    try {
      setIsGeneratingMindmap(true)
      const response = await fetch('/api/generate-mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: streamContent })
      })

      if (!response.ok) {
        throw new Error('生成思维导图失败')
      }

      const data = await response.json()
      setMarkdownContent(data.markdown)
    } catch (error) {
      setError('生成思维导图时发生错误')
      console.error('Error:', error)
    } finally {
      setIsGeneratingMindmap(false)
    }
  }

  useEffect(() => {
    getWorkFlowParams()
  }, [])

  return (
    <Spin spinning={loading}>
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
              小说生成器
            </h1>
            {/* <p className="text-center text-gray-500 text-sm md:text-base">
              powered by DeepSeek AI
            </p> */}
          </div>

          {/* 主要内容区域 */}
          <div className="space-y-6 relative z-10">
            {/* 输入区域 */}
            <div className="relative group">
              <div className="w-full p-6 rounded-lg bg-white/80 border border-gray-200 shadow-lg backdrop-blur-sm">
                <DynamicForm
                  fields={formInputType}
                  onStreamingResponse={handleStreamingResponse}
                  onTaskStatusChange={handleTaskStatusChange}
                />
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="text-red-500 text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* 流式输出内容 */}
            {streamContent && (
              <div className="p-6 rounded-lg bg-white/80 border border-gray-200 shadow-lg backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">生成内容:</h2>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm ${
                        taskStatus.status === 'running'
                          ? 'text-blue-500'
                          : taskStatus.status === 'succeeded'
                          ? 'text-green-500'
                          : taskStatus.status === 'failed'
                          ? 'text-red-500'
                          : 'text-gray-500'
                      }`}
                    >
                      {taskStatus.status === 'running'
                        ? '生成中...'
                        : taskStatus.status === 'succeeded'
                        ? '生成完成'
                        : taskStatus.status === 'failed'
                        ? '生成失败'
                        : '等待中'}
                    </span>
                    <button
                      onClick={handleReset}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      清除
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <TypeWriter
                    text={streamContent}
                    speed={30}
                    immediate={
                      taskStatus.status === 'succeeded' &&
                      streamContent.length > 0
                    }
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleGenerateMindmap}
                    disabled={
                      taskStatus.status === 'running' || isGeneratingMindmap
                    }
                    className={`px-4 py-2 rounded-md text-white ${
                      taskStatus.status === 'running' || isGeneratingMindmap
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isGeneratingMindmap ? '生成思维导图中...' : '生成思维导图'}
                  </button>
                </div>
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
    </Spin>
  )
}
