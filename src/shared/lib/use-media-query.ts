import { useCallback, useSyncExternalStore } from 'react'

/** Reactive `window.matchMedia` — used instead of CSS breakpoints where the two
    layouts must not be mounted at the same time (doc 11) */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQueryList = window.matchMedia(query)
      mediaQueryList.addEventListener('change', onChange)
      return () => mediaQueryList.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}
