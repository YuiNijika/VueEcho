<script setup lang="ts">
import { useArticleDetail } from '@/composables/useArticleDetail'
import { formatDate } from '@/utils/date'

const route = useRoute()
const { loading, error, articleData, renderedContent, loadArticle } = useArticleDetail()

// 获取当前 slug
const getCurrentSlug = () => {
  const pathMatch = route.params.pathMatch
  return Array.isArray(pathMatch) ? pathMatch.join('/') : (pathMatch as string)
}

// 重试加载文章
const handleRetry = () => {
  const slug = getCurrentSlug()
  if (slug) {
    loadArticle(slug)
  }
}

// 监听路由变化，重新加载文章
watch(() => route.params.pathMatch, () => {
  const slug = getCurrentSlug()
  if (slug) {
    loadArticle(slug)
  }
}, { immediate: true })

</script>

<template>
  <UPage>
    <UPageBody>
      <UContainer>
        <Error v-if="error" :title="'文章加载失败'" :description="error" />
        <UCard v-else>
          <template v-if="loading">
            <div class="p-6 space-y-4">
              <div class="space-y-2">
                <USkeleton class="h-8 w-3/4" />
                <USkeleton class="h-4 w-1/2" />
              </div>
              <div class="space-y-2 pt-4">
                <USkeleton class="h-4 w-full" />
                <USkeleton class="h-4 w-full" />
                <USkeleton class="h-4 w-5/6" />
                <USkeleton class="h-4 w-full" />
                <USkeleton class="h-4 w-4/5" />
              </div>
              <div class="space-y-2 pt-4">
                <USkeleton class="h-4 w-full" />
                <USkeleton class="h-4 w-full" />
                <USkeleton class="h-4 w-3/4" />
              </div>
            </div>
          </template>
          <template v-else>
            <UPageHeader :title="articleData.title" :description="articleData.tags.join(', ') || '无标签'"
              :headline="formatDate(articleData.date)" :links="[
                {
                  label: '返回首页',
                  to: '/',
                  icon: 'i-lucide-home',
                  color: 'neutral'
                }
              ]" />
            <div class="markdown-body" v-html="renderedContent"></div>
          </template>
        </UCard>
      </UContainer>
    </UPageBody>
  </UPage>
</template>

<style scoped>
.markdown-body {
  margin-top: 1rem;
  background-color: transparent;
  color: inherit;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  color: inherit;
  border-bottom: 1px solid var(--ui-border);
}

.markdown-body :deep(p),
.markdown-body :deep(li),
.markdown-body :deep(span) {
  color: inherit;
}
</style>
