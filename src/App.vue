<script setup lang="ts">
import markdownLight from 'github-markdown-css/github-markdown-light.css?url'
import markdownDark from 'github-markdown-css/github-markdown-dark.css?url'

onMounted(() => {
  let markdownLink: HTMLLinkElement | null = null

  const loadThemes = () => {
    // 移除旧样式
    if (markdownLink) markdownLink.remove()

    const isDark = document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches

    // 加载 GitHub Markdown CSS
    markdownLink = document.createElement('link')
    markdownLink.rel = 'stylesheet'
    markdownLink.href = isDark ? markdownDark : markdownLight
    document.head.appendChild(markdownLink)
  }

  loadThemes()

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', loadThemes)

  const observer = new MutationObserver(loadThemes)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme']
  })

  onUnmounted(() => {
    mediaQuery.removeEventListener('change', loadThemes)
    observer.disconnect()
    if (markdownLink) markdownLink.remove()
  })
})
</script>

<template>
  <UApp>
    <Header />
    <UMain>
      <RouterView />
    </UMain>
    <Footer />
  </UApp>
</template>

<style></style>
