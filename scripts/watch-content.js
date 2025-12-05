import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chokidar from 'chokidar'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const contentDir = path.join(__dirname, '../public/content')
const outputFile = path.join(__dirname, '../public/index.json')

// 去除 markdown 标签，转换为纯文本
function stripMarkdown(markdown) {
  let text = markdown
  
  // 移除代码块 (```...```)
  text = text.replace(/```[\s\S]*?```/g, '')
  
  // 移除行内代码 (`...`)
  text = text.replace(/`[^`]*`/g, '')
  
  // 移除链接 [text](url) 或 [text][ref]
  text = text.replace(/\[([^\]]*)\]\([^\)]*\)/g, '$1')
  text = text.replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
  
  // 移除图片 ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^\)]*\)/g, '$1')
  
  // 移除标题标记 (#, ##, ###, etc.)
  text = text.replace(/^#{1,6}\s+/gm, '')
  
  // 移除粗体和斜体标记 (**text**, *text*, __text__, _text_)
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  text = text.replace(/\*([^*]+)\*/g, '$1')
  text = text.replace(/__([^_]+)__/g, '$1')
  text = text.replace(/_([^_]+)_/g, '$1')
  
  // 移除删除线 (~~text~~)
  text = text.replace(/~~([^~]+)~~/g, '$1')
  
  // 移除引用标记 (>)
  text = text.replace(/^>\s+/gm, '')
  
  // 移除列表标记 (-, *, +, 1., etc.)
  text = text.replace(/^[\s]*[-*+]\s+/gm, '')
  text = text.replace(/^[\s]*\d+\.\s+/gm, '')
  
  // 移除水平线 (---, ***)
  text = text.replace(/^[-*]{3,}$/gm, '')
  
  // 移除表格标记 (|)
  text = text.replace(/\|/g, ' ')
  
  // 移除多余的空白字符
  text = text.replace(/\n+/g, ' ')
  text = text.replace(/\s+/g, ' ')
  
  return text.trim()
}

// 防抖定时器
let debounceTimer = null

// 生成 index.json 的函数
function generateIndex() {
  try {
    // 确保 content 目录存在
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true })
      console.log('已创建 content 目录')
      // 即使目录不存在，也要写入空数组
      fs.writeFileSync(outputFile, JSON.stringify([], null, 2), 'utf-8')
      return
    }

    // 递归读取所有 markdown 文件
    function getAllMarkdownFiles(dir, basePath = '') {
      const files = []
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          // 递归读取子目录
          const subFiles = getAllMarkdownFiles(fullPath, path.join(basePath, item))
          files.push(...subFiles)
        } else if (item.endsWith('.md')) {
          // 计算相对于 content 目录的路径作为 slug
          const relativePath = basePath ? path.join(basePath, item) : item
          files.push({
            filePath: fullPath,
            slug: relativePath.replace(/\.md$/, '').replace(/\\/g, '/') // 统一使用 / 作为路径分隔符
          })
        }
      }
      
      return files
    }

    const markdownFiles = getAllMarkdownFiles(contentDir)
    const articles = []

    if (markdownFiles.length > 0) {
      // 处理每个文件
      markdownFiles.forEach(({ filePath, slug }) => {
        try {
          const fileContent = fs.readFileSync(filePath, 'utf-8')
          const { data, content } = matter(fileContent)
          
          // 去除 markdown 标签，获取纯文本
          const plainText = stripMarkdown(content)
          const excerpt = plainText.substring(0, 200).trim() + (plainText.length > 200 ? '...' : '')
          
          articles.push({
            slug: slug,
            title: data.title || '无标题',
            date: data.date || new Date().toISOString(),
            tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
            excerpt: excerpt
          })
        } catch (error) {
          console.error(`处理文件 ${filePath} 时出错:`, error.message)
        }
      })

      // 按日期排序（最新的在前）
      articles.sort((a, b) => new Date(b.date) - new Date(a.date))
    }

    // 写入 index.json（即使没有文件也写入空数组）
    fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2), 'utf-8')
    console.log(`[${new Date().toLocaleTimeString()}] 已更新 index.json，包含 ${articles.length} 篇文章`)
  } catch (error) {
    console.error('生成 index.json 时出错:', error)
  }
}

// 带防抖的生成函数
function debouncedGenerateIndex() {
  // 清除之前的定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  // 设置新的定时器，300ms 后执行
  debounceTimer = setTimeout(() => {
    generateIndex()
  }, 300)
}

// 初始生成一次
generateIndex()

// 监听文件变化（递归监听子目录）
const watcher = chokidar.watch(contentDir, {
  ignored: /(^|[\/\\])\../, // 忽略隐藏文件
  persistent: true,
  ignoreInitial: false,
  depth: 99 // 递归监听所有子目录
})

watcher
  .on('add', (filePath) => {
    if (filePath.endsWith('.md')) {
      console.log(`📄 检测到新文件: ${path.basename(filePath)}`)
      debouncedGenerateIndex()
    }
  })
  .on('change', (filePath) => {
    if (filePath.endsWith('.md')) {
      console.log(`✏️  检测到文件修改: ${path.basename(filePath)}`)
      debouncedGenerateIndex()
    }
  })
  .on('unlink', (filePath) => {
    if (filePath.endsWith('.md')) {
      console.log(`🗑️  检测到文件删除: ${path.basename(filePath)}`)
      debouncedGenerateIndex()
    }
  })
  .on('error', (error) => {
    console.error('❌ 监听文件时出错:', error)
  })

console.log(`正在监听 ${contentDir} 目录...`)
console.log('按 Ctrl+C 停止监听')

