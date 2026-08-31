export function useThemeToggle() {
  const colorMode = useColorMode()
  const isDark = computed(() => colorMode.value === 'dark')

  const toggle = () => {
    colorMode.preference = isDark.value ? 'light' : 'dark'
  }

  return { isDark, toggle }
}
