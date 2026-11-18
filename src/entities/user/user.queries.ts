import { queryOptions, skipToken } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { getApiErrorMessage, isNotFoundError } from '@/shared/api'
import { fetchUserById } from './user.api'

const fetchUserOrNull = async (userId: string) => {
  try {
    return await fetchUserById(userId)
  } catch (error) {
    if (isNotFoundError(error)) toast(getApiErrorMessage(error))

    return null
  }
}

export const USER_QUERY = {
  queryKey: (userId: string | null) => ['user', userId] as const,
  queryOptions: (userId: string | null) =>
    queryOptions({
      queryKey: USER_QUERY.queryKey(userId),
      queryFn: userId ? () => fetchUserOrNull(userId) : skipToken,
      staleTime: Infinity,
    }),
}
