// 配置管理

export interface WebSite {
  name: string
  description?: string
  logo?: string | null
  icp?: string | null
}

export interface FooterMenuItem {
  label: string
  icon?: string
  to?: string
  target?: string
  badge?: string
  children?: FooterMenuItem[]
  active?: boolean
}

export interface Config {
  WebSite?: WebSite
  HeaderMenuItem: HeaderMenuItem[]
  FooterMenuItem?: FooterMenuItem[]
}

export interface HeaderMenuItem {
  label: string
  icon?: string
  to?: string
  target?: string
  badge?: string
  children?: HeaderMenuItem[]
  active?: boolean
}

export function useConfig() {
  const config = ref<Config | null>(null)
  const loading = ref(false)
  const error = ref('')

  const loadConfig = async () => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await fetch('/config.json')
      
      if (!response.ok) {
        throw new Error(`加载配置失败 (${response.status})`)
      }
      
      const data = await response.json()
      config.value = data
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = '加载配置失败，请稍后重试'
      }
      console.error('加载配置失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 组件挂载时加载配置
  onMounted(() => {
    loadConfig()
  })

  return {
    config,
    loading,
    error,
    loadConfig
  }
}

