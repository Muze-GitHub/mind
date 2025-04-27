import { useEffect, useRef } from 'react'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'
import type { IMarkmapOptions } from 'markmap-view'

interface MindMapProps {
  markdown: string
}

const transformer = new Transformer()

const markmapOptions: Partial<IMarkmapOptions> = {
  // color: (node: any) => {
  //   const level = node.depth
  //   const colors = ['#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#0d9488']
  //   return colors[level % colors.length]
  // },
  // paddingX: 16,
  // duration: 500,
  // maxWidth: 300,
  // nodeMinHeight: 16,
  // spacingVertical: 5,
  // spacingHorizontal: 80,
  // autoFit: true,
  // initialExpandLevel: 999, // 设置一个很大的值，确保所有节点都展开
  // zoom: true,
  // pan: true
}
export default function MindMap({ markdown }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const markmapRef = useRef<Markmap | null>(null)

  useEffect(() => {
    if (!svgRef.current || !markdown) return

    try {
      console.log('原始 Markdown:', markdown)

      // 确保 markdown 是字符串格式
      const markdownStr =
        typeof markdown === 'string' ? markdown : String(markdown)

      // 转换 Markdown 为思维导图数据
      const { root } = transformer.transform(markdownStr)
      console.log('转换后的数据结构:', root)

      // 创建或更新思维导图
      if (!markmapRef.current) {
        console.log('创建新的思维导图实例')
        const mm = Markmap.create(svgRef.current, markmapOptions)

        // 添加点击事件处理
        svgRef.current.addEventListener('click', (e) => {
          const target = e.target as SVGElement
          if (target.closest('.markmap-node')) {
            setTimeout(() => {
              mm.fit() // 调整视图以显示所有可见节点
            }, 300)
          }
        })

        markmapRef.current = mm
      }

      // 设置数据并自动调整大小
      console.log('更新思维导图数据')
      markmapRef.current.setData(root)
    } catch (error) {
      console.error('思维导图渲染错误:', error)
    }
  }, [markdown])

  return (
    <div className="relative w-full h-full bg-white rounded-lg">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          background: 'transparent'
        }}
      />
    </div>
  )
}
