<template>
  <div class="keyword-list">
    <p v-if="!keywords?.length" class="text-sm page-subtitle">尚無關鍵字資料</p>
    <div v-else class="flex flex-wrap gap-2 items-baseline">
      <span
        v-for="item in keywords"
        :key="item.keyword"
        class="keyword-tag"
        :style="tagStyle(item)"
      >
        {{ item.keyword }}
        <span class="keyword-count">{{ item.count }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface KeywordItem {
  keyword: string
  count: number
}

interface Props {
  keywords?: KeywordItem[]
  /** 最小字級 (rem) */
  minFontSize?: number
  /** 最大字級 (rem) */
  maxFontSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  keywords: () => [],
  minFontSize: 0.75,
  maxFontSize: 1.5
})

const maxCount = computed(() => {
  if (!props.keywords?.length) return 0
  return Math.max(...props.keywords.map(k => k.count))
})

function tagStyle(item: KeywordItem) {
  const max = maxCount.value || 1
  const ratio = max > 0 ? item.count / max : 0
  const fontSize = props.minFontSize + ratio * (props.maxFontSize - props.minFontSize)
  return {
    fontSize: `${fontSize}rem`,
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-bg-elevated)',
    borderColor: 'var(--color-border)'
  }
}
</script>

<style scoped>
.keyword-list {
  color: var(--color-text);
}
.page-subtitle {
  color: var(--color-text-muted);
}
.keyword-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid;
  line-height: 1.3;
}
.keyword-count {
  font-size: 0.7em;
  opacity: 0.85;
  color: var(--color-text-muted);
}
</style>
