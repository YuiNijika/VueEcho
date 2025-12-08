<script setup lang="ts">
import { useArticleDetail } from '@/composables/useArticleDetail'
import { formatDate } from '@/utils/date'
import VueEasyLightbox from 'vue-easy-lightbox'

const route = useRoute()
const { loading, error, articleData, renderedContent, loadArticle } = useArticleDetail()

const visible = ref(false)
const index = ref(0)
const imgs = ref<string[]>([])

const handleImageClick = (imgSrc: string) => {
  const markdownContainer = document.querySelector('.markdown-body')
  if (!markdownContainer) return

  const allImages = Array.from(markdownContainer.querySelectorAll('img')) as HTMLImageElement[]
  const imgList = allImages.map(img => img.src).filter(Boolean)
  const currentIndex = imgList.indexOf(imgSrc)

  if (currentIndex !== -1) {
    imgs.value = imgList
    index.value = currentIndex
    visible.value = true
  }
}

const processContent = () => {
  setTimeout(() => {
    const markdownContainer = document.querySelector('.markdown-body')
    if (!markdownContainer) return

    markdownContainer.querySelectorAll('img').forEach((img) => {
      if ((img as any).__lightboxAttached) return
        ; (img as any).__lightboxAttached = true
      img.style.cursor = 'pointer'
      img.addEventListener('click', () => handleImageClick(img.src))
    })
  })
}

const getCurrentSlug = () => {
  const pathMatch = route.params.pathMatch
  return Array.isArray(pathMatch) ? pathMatch.join('/') : (pathMatch as string)
}

watch(() => route.params.pathMatch, () => {
  const slug = getCurrentSlug()
  if (slug) loadArticle(slug)
}, { immediate: true })

watch([loading, renderedContent], ([isLoading, content]) => {
  if (!isLoading && content) processContent()
}, { flush: 'post' })

</script>

<template>
  <UPage>
    <UPageBody>
      <UContainer>
        <Error v-if="error" title="文章加载失败" :description="error" />
        <UCard v-else>
          <template v-if="loading">
            <div class="p-6 space-y-4" v-for="i in 3" :key="i">
              <div class="space-y-2">
                <USkeleton class="h-8 w-3/4" />
                <USkeleton class="h-4 w-1/2" />
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
  <VueEasyLightbox :visible="visible" :imgs="imgs" :index="index" @hide="visible = false" :loop="true" />
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

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  transition: transform 0.2s;
  margin: 0 auto;
}

.markdown-body :deep(img:hover) {
  transform: scale(1.02);
}

.markdown-body :deep(pre) {
  position: relative;
  margin: 1rem 0;
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>
