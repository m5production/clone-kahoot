import { useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '@/shared/ui'
import { useDeleteSessionRecordMutation } from './delete-session-record.mutation'

/** FR-82/BR-82: deleting a history record asks for a confirmation step */
type Props = {
  sessionId: string
  onDeleted?: () => void
}

export function DeleteSessionRecordButton({ sessionId, onDeleted }: Props) {
  const [confirming, setConfirming] = useState(false)
  const { mutate: deleteRecord, isPending } = useDeleteSessionRecordMutation(
    () => {
      toast.success('Session record deleted')
      onDeleted?.()
    },
  )

  if (confirming) {
    return (
      <span className="flex gap-2">
        <Button
          data-testid="confirm-delete-session-button"
          variant="destructive"
          disabled={isPending}
          onClick={() => deleteRecord(sessionId)}
        >
          Delete
        </Button>
        <Button
          data-testid="cancel-delete-session-button"
          variant="ghost"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
      </span>
    )
  }

  return (
    <Button
      data-testid="delete-session-button"
      variant="ghost"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={() => setConfirming(true)}
    >
      Delete record
    </Button>
  )
}
