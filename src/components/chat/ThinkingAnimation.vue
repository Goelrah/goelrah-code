<script setup lang="ts">
defineProps<{ thinking?: string }>();
</script>

<template>
  <div class="thinking-wrap">
    <div class="thinking-header">
      <div class="brain-anim">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="brain-icon">
          <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 21h4M12 2v1M8 17h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <div class="spark s1"></div>
        <div class="spark s2"></div>
        <div class="spark s3"></div>
      </div>
      <span class="thinking-label">Thinking</span>
      <div class="thinking-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
    <div v-if="thinking" class="thinking-text">{{ thinking }}</div>
  </div>
</template>

<style scoped>
.thinking-wrap {
  margin: 8px 0 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-300);
  background: linear-gradient(135deg, hsla(18,65%,58%,0.04), hsla(48,14%,89%,0.3));
  overflow: hidden;
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brain-anim {
  position: relative;
  width: 20px;
  height: 20px;
  color: var(--accent-brand);
  animation: brain-pulse 2s ease-in-out infinite;
}

@keyframes brain-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.brain-icon { display: block; }

.spark {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent-brand);
  opacity: 0;
}

.s1 { top: -2px; right: -2px; animation: spark-fly 1.5s ease-out infinite; }
.s2 { top: -4px; left: 50%; animation: spark-fly 1.5s ease-out 0.5s infinite; }
.s3 { top: 0; left: -2px; animation: spark-fly 1.5s ease-out 1s infinite; }

@keyframes spark-fly {
  0% { opacity: 0; transform: translate(0, 0) scale(0); }
  30% { opacity: 1; transform: translate(-2px, -6px) scale(1); }
  100% { opacity: 0; transform: translate(-4px, -14px) scale(0); }
}

.thinking-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-brand);
}

.thinking-dots {
  display: flex;
  gap: 3px;
  align-items: center;
}

.thinking-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent-brand);
  animation: dot-bounce 1.4s ease-in-out infinite;
}

.thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
.thinking-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-bounce {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.2); }
}

.thinking-text {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-400);
  max-height: 80px;
  overflow-y: auto;
  font-style: italic;
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
}
</style>
