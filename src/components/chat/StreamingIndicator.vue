<template>
  <div class="flex items-center gap-3 py-4">
    <div class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
      :style="{ background: 'hsla(18,65%,58%,0.12)', color: 'var(--accent-brand)' }">G</div>
    <div class="flex items-center gap-2">
      <span class="inline-flex gap-1">
        <span class="h-1.5 w-1.5 animate-pulse rounded-full" :style="{ background: 'var(--accent-brand)' }" />
        <span class="h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" :style="{ background: 'var(--accent-brand)' }" />
        <span class="h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" :style="{ background: 'var(--accent-brand)' }" />
      </span>
      <span class="text-sm" :style="{ color: 'var(--text-400)' }">Thinking...</span>
    </div>
  </div>
</template>
