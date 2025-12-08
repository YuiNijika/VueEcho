export interface Article {
  slug: string
  title: string
  date: string
  tags: string[]
  excerpt: string
}

export function useArticleList() {
  const articles = ref<Article[]>([])
  const loading = ref(false)
  const error = ref('')

  const loadArticles = async () => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await fetch('/index.json')
      
      if (!response.ok) {
        throw new Error('加载文章列表失败')
      }
      
      articles.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载文章列表失败'
      console.error('加载文章列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    articles,
    loading,
    error,
    loadArticles
  }
}

