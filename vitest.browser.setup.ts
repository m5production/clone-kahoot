import { afterEach, beforeEach } from 'vitest'
// Direct import, not '@/shared/api': the barrel pulls in react-toastify, which specs mock
import { queryClient } from '@/shared/api/query-client'
import '@/app/styles/index.css'

beforeEach(() => {
  // Seeded query data is used as is: no background refetch hits the network
  queryClient.setDefaultOptions({ queries: { staleTime: Infinity, retry: false } })
})

afterEach(() => {
  queryClient.clear()
  localStorage.clear()
})
