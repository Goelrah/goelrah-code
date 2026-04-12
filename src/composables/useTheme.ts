import { watch } from 'vue';
import { useSettings } from './useSettings';

export function useTheme() {
  const { settings } = useSettings();

  function apply() {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  function toggle() {
    settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
  }

  watch(() => settings.theme, apply, { immediate: true });

  return { toggle };
}
