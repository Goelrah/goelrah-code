import { ref, onMounted, onUnmounted } from 'vue';

const open = ref(false);

export function useCommandPalette() {
  function toggle() {
    open.value = !open.value;
  }

  function close() {
    open.value = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      toggle();
    }
    if (e.key === 'Escape' && open.value) {
      close();
    }
  }

  onMounted(() => document.addEventListener('keydown', handleKeydown));
  onUnmounted(() => document.removeEventListener('keydown', handleKeydown));

  return { open, toggle, close };
}
