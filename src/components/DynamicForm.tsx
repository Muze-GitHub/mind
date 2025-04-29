import React, { useState } from 'react'
import { Form, Input, Select } from 'antd'
import { FormInputType } from '@/types/form'
import { runWorkFlowApi } from '@/app/api'

interface DynamicFormProps {
  fields: any
  onStreamingResponse?: (data: any) => void
  onTaskStatusChange?: (status: {
    taskId?: string
    workflowRunId?: string
    status?: 'running' | 'succeeded' | 'failed' | 'stopped'
  }) => void
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onStreamingResponse,
  onTaskStatusChange
}) => {
  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string>()

  // 处理工作流开始事件
  const handleWorkflowStarted = (data: any) => {
    setCurrentTaskId(data.task_id)
    onTaskStatusChange?.({
      taskId: data.task_id,
      workflowRunId: data.workflow_run_id,
      status: 'running'
    })
    console.log('工作流开始:', data)
  }

  // 处理工作流结束事件
  const handleWorkflowFinished = (data: any) => {
    onTaskStatusChange?.({
      taskId: data.task_id,
      workflowRunId: data.workflow_run_id,
      status: data.data.status
    })
    console.log('工作流结束:', data)
  }

  // 处理节点开始事件
  const handleNodeStarted = (data: any) => {
    console.log('节点开始执行:', data)
  }

  // 处理节点结束事件
  const handleNodeFinished = (data: any) => {
    console.log('节点执行结束:', data)
  }

  // 处理文本块事件
  const handleTextChunk = (data: any) => {
    if (data.data?.text) {
      onStreamingResponse?.({
        type: 'text',
        content: data.data.text,
        taskId: data.task_id,
        workflowRunId: data.workflow_run_id,
        fromVariable: data.data.from_variable_selector
      })
    }
  }

  //  渲染表单
  const renderFormItem = (field: FormInputType[0]) => {
    // 获取字段类型和配置
    const fieldType = Object.keys(field)[0] as keyof typeof field
    const config = field[fieldType]!

    switch (config.type) {
      case 'select':
        return (
          <Form.Item
            key={config.variable}
            name={config.variable}
            label={config.label}
            rules={[
              {
                required: config.required,
                message: `请选择${config.label}`
              }
            ]}
          >
            <Select
              placeholder={`请选择${config.label}`}
              style={{ width: '100%' }}
            >
              {config.options.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )

      case 'text-input':
        return (
          <Form.Item
            key={config.variable}
            name={config.variable}
            label={config.label}
            rules={[
              {
                required: config.required,
                message: `请输入${config.label}`
              },
              {
                max: config.max_length,
                message: `${config.label}不能超过${config.max_length}个字符`
              }
            ]}
          >
            <Input
              placeholder={`请输入${config.label}`}
              maxLength={config.max_length}
            />
          </Form.Item>
        )

      default:
        return null
    }
  }

  // 提交
  const handleSubmit = async (formData: any) => {
    try {
      setIsLoading(true)
      const data = {
        inputs: formData,
        response_mode: 'streaming',
        user: 'zz-xuzelong'
      }

      await runWorkFlowApi(data, (streamData) => {
        console.log('收到数据:', streamData) // 添加日志
        // 处理不同类型的事件
        if (!streamData || !streamData.event) return // 添加空值检查

        switch (streamData.event) {
          case 'workflow_started':
            handleWorkflowStarted(streamData)
            break
          case 'workflow_finished':
            handleWorkflowFinished(streamData)
            break
          case 'node_started':
            handleNodeStarted(streamData)
            break
          case 'node_finished':
            handleNodeFinished(streamData)
            break
          case 'text_chunk':
            handleTextChunk(streamData)
            break
          case 'message':
            if (streamData.answer) {
              // 只在有answer字段时处理
              onStreamingResponse?.({
                type: 'text',
                content: streamData.answer,
                taskId: streamData.task_id
              })
            }
            break
          case 'ping':
            // 忽略ping事件
            break
          default:
            console.log('未知事件:', streamData)
        }
      })
    } catch (error) {
      console.error('错误:', error)
      onTaskStatusChange?.({
        taskId: currentTaskId,
        status: 'failed'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
    >
      {fields?.map((field: any) => renderFormItem(field))}
      <Form.Item>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 
                     hover:shadow-xl hover:from-blue-600 hover:to-cyan-600
                     text-white font-medium transition-all duration-300
                     ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '生成中...' : '生成小说'}
        </button>
      </Form.Item>
    </Form>
  )
}

export default DynamicForm
