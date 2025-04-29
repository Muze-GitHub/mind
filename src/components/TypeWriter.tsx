import React, { useEffect, useState } from 'react'

interface TypeWriterProps {
  text: string
  speed?: number // 打字速度（毫秒/字符）
  immediate?: boolean // 是否立即显示全部内容
}

const TypeWriter: React.FC<TypeWriterProps> = ({
  text = '',
  speed = 50,
  immediate = false
}) => {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    if (!text) {
      setDisplayText('')
      return
    }

    // 如果设置了 immediate，直接显示全部文本
    if (immediate) {
      setDisplayText(text)
      return
    }

    // 正常打字效果
    if (typeof text === 'string') {
      let currentLength = displayText.length
      const newText = text.slice(currentLength)

      if (newText.length === 0) {
        return
      }

      let index = 0
      const timer = setInterval(() => {
        if (index < newText.length) {
          setDisplayText((prev) => prev + newText[index])
          index++
        } else {
          clearInterval(timer)
        }
      }, speed)

      return () => clearInterval(timer)
    }
  }, [text, speed, immediate])

  // 如果text不是字符串，返回空内容
  if (typeof text !== 'string') {
    return null
  }

  return (
    <div className="text-gray-600 whitespace-pre-wrap">
      {displayText}
      {!immediate && displayText !== text && (
        <span className="inline-block w-[2px] h-[1em] bg-gray-400 animate-blink ml-[2px] align-middle" />
      )}
    </div>
  )
}

export default TypeWriter
