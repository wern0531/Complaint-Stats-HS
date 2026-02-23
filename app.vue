<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// 在根組件初始化主題（設定 html data-theme、localStorage）
useTheme()
</script>
