## 需求描述

实现一个思维导图生成器。
页面首先有一个选择项，可以选择“文章内容”或者“文章链接”，如果选择了文章内容，则展示的是一个大的 Textarea，否则展示的是一个 Input，当点击按钮“生成”开始工作，如果是一个链接 URL，如 [https://zhuanlan.zhihu.com/p/601650206],你需要获取里面的文本内容，然后通过调取 DeepSeek，通过 AI 总结，最后输出一个思维导图展示出来。如果是文章内容，你需要通过 调取 DeepSeek 生成思维导图所需要的数据格式，然后展示出来。

## DeepSeek

API 调用文档: [https://api-docs.deepseek.com/zh-cn/]
Nodejs 调用示例
`// Please install OpenAI SDK first: `npm install openai`

import OpenAI from "openai";

const openai = new OpenAI({
baseURL: 'https://api.deepseek.com',
apiKey: '<DeepSeek API Key>'
});

async function main() {
const completion = await openai.chat.completions.create({
messages: [{ role: "system", content: "You are a helpful assistant." }],
model: "deepseek-chat",
});

console.log(completion.choices[0].message.content);
}

main();`

## 技术要求

1.Next.js
2.TypeScript
3.markmap-lib

## 其他要求

~ 1.页面风格呈现赛博朋克风格
~ 2. 展示的内容顺序是： 文章内容 -> DeesSeek 转义的思维导图数据内容 -> 思维导图
~ 3. 注意组件和逻辑的抽离，如 DeepSeek 的调用需要封装好
~ 4. 需要补充调试日志
