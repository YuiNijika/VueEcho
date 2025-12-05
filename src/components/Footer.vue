<script setup lang="ts">
import { useConfig } from '@/composables/useConfig'

const { config } = useConfig()

const items = computed(() => {
    if (!config.value?.FooterMenuItem) {
        return []
    }
    return config.value.FooterMenuItem
})

const websiteName = computed(() => {
    return config.value?.WebSite?.name || 'VueEcho'
})

const icp = computed(() => {
    return config.value?.WebSite?.icp
})
</script>

<template>
    <USeparator :label="websiteName" />
    <UFooter>
        <template #left>
            <p class="text-muted text-sm">Copyright © {{ new Date().getFullYear() }}</p>
        </template>

        <UNavigationMenu v-if="items.length > 0" :items="items" variant="link" />

        <template v-if="icp" #right>
            <UButton color="neutral" variant="ghost" to="https://beiancx.miit.gov.cn/" target="_blank"
                aria-label="ICP备案">
                {{ icp }}
            </UButton>
        </template>
    </UFooter>
</template>
