import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'
import 'github-markdown-css'
import { parseFrontmatter } from '@/utils/markdown'

export interface ArticleData {
  title: string
  date: string
  tags: string[]
}

const langMap: Record<string, string> = {
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'sh': 'bash',
  'shell': 'bash',
  'yml': 'yaml',
  'md': 'markdown',
  'html': 'markup',
  'xml': 'markup',
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(code: string, lang?: string): string {
    if (!lang) return code

    const mappedLang = langMap[lang.toLowerCase()] || lang.toLowerCase()
    const prismLang = Prism.languages[mappedLang]

    if (prismLang) {
      try {
        return Prism.highlight(code, prismLang, mappedLang)
      } catch {
        return code
      }
    }

    return code
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
    error.value = ''
    loading.value = true
    articleData.value = { title: '', date: '', tags: [] }
    renderedContent.value = ''

    try {
      if (!slug?.trim() || ['null', 'undefined'].includes(slug) ||
        slug.includes('..') || slug.includes('//') || slug.startsWith('/')) {
        throw new Error('文章路径无效')
      }

      const filePath = `/content/${slug}.md`

      const response = await fetch(filePath).catch(() => {
        throw new Error('网络错误：无法连接到服务器')
      })

      if (!response.ok) {
        throw new Error(response.status === 404 ? '文章不存在' :
          response.status >= 500 ? '服务器错误，请稍后重试' :
            `加载失败 (${response.status})`)
      }

      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('text/html')) {
        throw new Error('文章不存在')
      }

      const text = await response.text()
      if (!text?.trim()) {
        throw new Error('文章内容为空')
      }

      const trimmedText = text.trim()
      if (trimmedText.startsWith('<!DOCTYPE html>') || trimmedText.startsWith('<html') ||
        trimmedText.includes('<body') || trimmedText.includes('<head') || trimmedText.includes('<script')) {
        throw new Error('文章不存在')
      }

      const { data, content } = parseFrontmatter(text)
      if (!content?.trim()) {
        throw new Error('文章内容无效')
      }

      articleData.value = {
        title: data.title || '无标题',
        date: data.date || new Date().toISOString(),
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : [])
      }

      renderedContent.value = md.render(content)
    } catch (err) {
      error.value = err instanceof Error ? err.message :
        typeof err === 'string' ? err :
          '加载文章失败，请稍后重试'
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

