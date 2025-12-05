<script setup lang="ts">
import markdownLight from 'github-markdown-css/github-markdown-light.css?url'
import markdownDark from 'github-markdown-css/github-markdown-dark.css?url'
import hljsLight from 'highlight.js/styles/github.css?url'
import hljsDark from 'highlight.js/styles/github-dark.css?url'

onMounted(() => {
  let markdownLink: HTMLLinkElement | null = null
  let hljsLink: HTMLLinkElement | null = null

  const loadThemes = () => {
    // 移除旧样式
    if (markdownLink) markdownLink.remove()
    if (hljsLink) hljsLink.remove()

    const isDark = document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches

    // 加载 GitHub Markdown CSS
    markdownLink = document.createElement('link')
    markdownLink.rel = 'stylesheet'
    markdownLink.href = isDark ? markdownDark : markdownLight
    document.head.appendChild(markdownLink)

    // 加载 highlight.js 主题 CSS
    hljsLink = document.createElement('link')
    hljsLink.rel = 'stylesheet'
    hljsLink.href = isDark ? hljsDark : hljsLight
    document.head.appendChild(hljsLink)
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
    if (hljsLink) hljsLink.remove()
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
