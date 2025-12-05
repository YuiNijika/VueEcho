<script setup lang="ts">
import { useArticleList } from '@/composables/useArticleList'
import { formatDate } from '@/utils/date'

const router = useRouter()
const { articles, loading, error, loadArticles } = useArticleList()

const goToArticle = (slug: string) => {
  router.push(`/${slug}`)
}

onMounted(() => {
  loadArticles()
})
</script>

<template>
  <UPage>
    <UPageBody>
      <UContainer>
        <Error v-if="error" :title="'加载失败'" :description="error" />
        <template v-else>
          <UBlogPosts>
            <template v-if="loading">
              <UCard v-for="i in 3" :key="i" class="mb-4">
                <div class="p-6 space-y-4">
                  <USkeleton class="h-6 w-3/4" />
                  <USkeleton class="h-4 w-full" />
                  <USkeleton class="h-4 w-5/6" />
                  <USkeleton class="h-4 w-1/4" />
                </div>
              </UCard>
            </template>
            <template v-else>
              <UBlogPost v-for="article in articles" :key="article.slug" :title="article.title"
                :description="article.excerpt" :date="article.date" :to="article.slug" />
              <UEmpty v-if="articles.length === 0" variant="naked" icon="i-lucide-file-text" title="暂无文章"
                description="还没有任何文章，请稍后再来查看" />
            </template>
          </UBlogPosts>
        </template>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
