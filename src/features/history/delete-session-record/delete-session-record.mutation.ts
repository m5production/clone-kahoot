import { useMutation } from '@tanstack/react-query'
import { deleteSessionRecord, HISTORY_QUERY } from '@/entities/history'
import { notifyApiError } from '@/shared/api'

export const useDeleteSessionRecordMutation = (onDeleted?: () => void) =>
  useMutation({
    mutationFn: deleteSessionRecord,
    onSuccess: () => {
      HISTORY_QUERY.invalidate()
      onDeleted?.()
    },
    onError: notifyApiError,
  })
