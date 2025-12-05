<script setup lang="ts">
import { useConfig } from '@/composables/useConfig'
import { useRoute } from 'vue-router'

const route = useRoute()
const { config, loading } = useConfig()

// 根据配置生成导航菜单项，并设置 active 状态
const items = computed(() => {
    if (!config.value?.HeaderMenuItem) {
        return []
    }

    return config.value.HeaderMenuItem.map(item => {
        const menuItem = { ...item }

        // 设置 active 状态
        if (item.to && item.to !== '/') {
            menuItem.active = route.path === item.to || route.path.startsWith(item.to + '/')
        } else if (item.to === '/') {
            menuItem.active = route.path === '/'
        }

        // 递归处理子菜单
        if (item.children) {
            menuItem.children = item.children.map(child => {
                const childItem = { ...child }
                if (child.to) {
                    childItem.active = route.path === child.to || route.path.startsWith(child.to + '/')
                }
                return childItem
            })
        }

        return menuItem
    })
})
</script>

<template>
    <UHeader>
        <template #title>
            <img v-if="config?.WebSite?.logo" :src="config.WebSite.logo" class="h-6 w-auto"
                :alt="config.WebSite.name" />
            <span v-else :title="config?.WebSite?.name || 'VueEcho'">{{ config?.WebSite?.name || 'VueEcho' }}</span>
        </template>

        <UNavigationMenu :items="items" />

        <template #right>
            <UColorModeButton />
        </template>
    </UHeader>
</template>
