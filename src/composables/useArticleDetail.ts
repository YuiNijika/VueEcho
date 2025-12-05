// 文章详情

import MarkdownIt from 'markdown-it'
import 'github-markdown-css';
import hljs from 'highlight.js'
import { parseFrontmatter } from '@/utils/markdown'

export interface ArticleData {
  title: string
  date: string
  tags: string[]
}

// 初始化 markdown-it
const md = new MarkdownIt({
  html: true, // 支持HTML标签
  linkify: true, // 自动识别链接
  typographer: true, // 启用智能排版
  highlight: function(code: string, lang?: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error(err)
      }
    }
    return hljs.highlightAuto(code).value
  }
})

export function useArticleDetail() {
  const loading = ref(false)
  const error = ref('')
  const articleData = ref<ArticleData>({
    title: '',
    date: '',
    tags: []
  })
  const renderedContent = ref('')

  const loadArticle = async (slug: string) => {
    // 重置状态
    error.value = ''
    loading.value = true
    articleData.value = {
      title: '',
      date: '',
      tags: []
    }
    renderedContent.value = ''

    try {
      // 验证 slug 是否有效
      if (!slug || slug.trim() === '' || slug === 'null' || slug === 'undefined') {
        throw new Error('文章路径无效')
      }

      // 验证 slug 格式
      if (slug.includes('..') || slug.includes('//') || slug.startsWith('/')) {
        throw new Error('文章路径无效')
      }

      // 构建文件路径
      const filePath = `/content/${slug}.md`

      let response: Response
      try {
        response = await fetch(filePath)
      } catch (fetchError) {
        // 网络错误或其他 fetch 错误
        throw new Error('网络错误：无法连接到服务器')
      }

      // 检查响应状态
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('文章不存在')
        } else if (response.status >= 500) {
          throw new Error('服务器错误，请稍后重试')
        } else {
          throw new Error(`加载失败 (${response.status})`)
        }
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type') || ''

      // 如果返回的是 HTML，说明文件不存在
      // Vite 可能返回 index.html
      if (contentType.includes('text/html')) {
        throw new Error('文章不存在')
      }

      // 检查内容类型是否支持
      if (contentType && !contentType.includes('text/') && !contentType.includes('application/octet-stream') && !contentType.includes('markdown')) {
        throw new Error('文件格式不正确')
      }

      const text = await response.text()

      // 检查文件是否为空
      if (!text || text.trim().length === 0) {
        throw new Error('文章内容为空')
      }

      // 检查返回的是否是 HTML
      // Vite 开发服务器可能会返回 index.html
      const trimmedText = text.trim()
      if (trimmedText.startsWith('<!DOCTYPE html>') ||
        trimmedText.startsWith('<html') ||
        trimmedText.startsWith('<!html') ||
        (trimmedText.includes('<html') && trimmedText.includes('</html>'))) {
        throw new Error('文章不存在')
      }

      // 检查是否包含 HTML 标签可能是错误页面
      if (trimmedText.includes('<body') || trimmedText.includes('<head') || trimmedText.includes('<script')) {
        throw new Error('文章不存在')
      }

      // 解析 frontmatter 和内容
      const { data, content } = parseFrontmatter(text)

      // 检查内容是否有效
      if (!content || content.trim().length === 0) {
        throw new Error('文章内容无效')
      }

      articleData.value = {
        title: data.title || '无标题',
        date: data.date || new Date().toISOString(),
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : [])
      }

      // markdown-it 渲染 markdown
      renderedContent.value = md.render(content)
    } catch (err) {
      // 设置错误信息
      if (err instanceof Error) {
        error.value = err.message
      } else if (typeof err === 'string') {
        error.value = err
      } else {
        error.value = '加载文章失败，请稍后重试'
      }
      console.error('加载文章失败:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    articleData,
    renderedContent,
    loadArticle
  }
}

