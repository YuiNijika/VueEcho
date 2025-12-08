import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const contentDir = path.join(__dirname, '../public/content')
const outputFile = path.join(__dirname, '../public/index.json')

// 摘要最大字符数（按显示宽度计算，中文占2，英文占1）
const EXCERPT_MAX_LENGTH = 150

// 计算字符串的显示宽度（中文字符占2，英文字符占1）
function getDisplayWidth(str) {
  let width = 0
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    // 判断是否为中文字符（包括中文标点）
    if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
      width += 2
    } else {
      width += 1
    }
  }
  return width
}

// 按显示宽度截取字符串
function truncateByDisplayWidth(str, maxWidth) {
  let width = 0
  let result = ''
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    const charWidth = /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char) ? 2 : 1
    
    if (width + charWidth > maxWidth) {
      break
    }
    
    result += char
    width += charWidth
  }
  return result
}

// 去除 markdown 标签，转换为纯文本
function stripMarkdown(markdown) {
  let text = markdown
  
  // 移除代码块
  text = text.replace(/```[\s\S]*?```/g, '')
  
  // 移除行内代码
  text = text.replace(/`[^`]*`/g, '')
  
  // 移除链接
  text = text.replace(/\[([^\]]*)\]\([^\)]*\)/g, '$1')
  text = text.replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
  
  // 移除图片
  text = text.replace(/!\[([^\]]*)\]\([^\)]*\)/g, '$1')
  
  // 移除标题标记
  text = text.replace(/^#{1,6}\s+/gm, '')
  
  // 移除粗体和斜体标记
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  text = text.replace(/\*([^*]+)\*/g, '$1')
  text = text.replace(/__([^_]+)__/g, '$1')
  text = text.replace(/_([^_]+)_/g, '$1')
  
  // 移除删除线
  text = text.replace(/~~([^~]+)~~/g, '$1')
  
  // 移除引用标记
  text = text.replace(/^>\s+/gm, '')
  
  // 移除列表标记
  text = text.replace(/^[\s]*[-*+]\s+/gm, '')
  text = text.replace(/^[\s]*\d+\.\s+/gm, '')
  
  // 移除水平线
  text = text.replace(/^[-*]{3,}$/gm, '')
  
  // 移除表格标记
  text = text.replace(/\|/g, ' ')
  
  // 移除多余的空白字符
  text = text.replace(/\n+/g, ' ')
  text = text.replace(/\s+/g, ' ')
  
  return text.trim()
}

// 确保 content 目录存在
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true })
  console.log('已创建 content 目录')
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

// 读取现有的 index.json（如果存在）
let existingArticles = []
if (fs.existsSync(outputFile)) {
  try {
    const existingContent = fs.readFileSync(outputFile, 'utf-8')
    existingArticles = JSON.parse(existingContent)
  } catch (error) {
    console.warn('读取现有 index.json 时出错，将重新生成:', error.message)
  }
}

// 创建一个以 slug 为键的映射，方便查找
const existingArticlesMap = new Map()
existingArticles.forEach(article => {
  existingArticlesMap.set(article.slug, article)
})

const markdownFiles = getAllMarkdownFiles(contentDir)
const articles = []

if (markdownFiles.length > 0) {
  // 处理每个文件
  markdownFiles.forEach(({ filePath, slug }) => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)
      
      // 去除 markdown 标签，获取纯文本
      const plainText = stripMarkdown(content).trim()
      const displayWidth = getDisplayWidth(plainText)
      const excerpt = truncateByDisplayWidth(plainText, EXCERPT_MAX_LENGTH) + (displayWidth > EXCERPT_MAX_LENGTH ? '...' : '')
      
      // 检查现有文章中是否已有该 slug 的文章
      const existingArticle = existingArticlesMap.get(slug)
      let date = data.date || new Date().toISOString()
      
      // 如果现有文章已有 date，则保留现有的 date
      if (existingArticle && existingArticle.date) {
        date = existingArticle.date
      }
      
      articles.push({
        slug: slug,
        title: data.title || '无标题',
        date: date,
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
        excerpt: excerpt
      })
    } catch (error) {
      console.error(`处理文件 ${filePath} 时出错:`, error.message)
    }
  })

  // 按日期排序
  articles.sort((a, b) => new Date(b.date) - new Date(a.date))
}

// 写入 index.json
fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2), 'utf-8')
console.log(`已生成 index.json，包含 ${articles.length} 篇文章`)

