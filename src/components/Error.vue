<script setup lang="ts">
interface Props {
    title?: string
    description?: string
}

const props = withDefaults(defineProps<Props>(), {
    title: '出错了',
    description: '加载失败，请稍后重试'
})
</script>

<template>
    <UPageSection :title="title" :description="description" :links="[
        {
            label: '返回首页',
            to: '/',
            icon: 'i-lucide-home',
            color: 'neutral'
        }
    ]" />
</template>
