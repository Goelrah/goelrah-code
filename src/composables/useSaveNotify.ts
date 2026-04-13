import { ref } from 'vue';

const saved = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

export function useSaveNotify() {
  function flash() {
    saved.value = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { saved.value = false; }, 1500);
  }

  return { saved, flash };
}
