import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Article from '@/views/Article.vue'

const router = createRouter({
  // 使用 hash 模式
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/:pathMatch(.*)+',
      name: 'article',
      component: Article
    }
  ],
})

export default router
