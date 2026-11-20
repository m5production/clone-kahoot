import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { buildJoinUrl, useActiveGame } from '@/entities/active-game'
import { Button } from '@/shared/ui'

const COPY_CONFIRMATION_MS = 3000

/** FR-62/FR-63: the invitation link for players, as text, copy button and QR */
export function InviteLink() {
  const { session } = useActiveGame()
  const [isCopyConfirmationShown, setIsCopyConfirmationShown] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const joinUrl = session ? buildJoinUrl(session.sessionId) : null

  useEffect(() => {
    let cancelled = false
    if (joinUrl) {
      QRCode.toDataURL(joinUrl, { margin: 1, width: 160 }).then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
    }
    return () => {
      cancelled = true
    }
  }, [joinUrl])

  if (!joinUrl) return null

  const handleCopyClick = () => {
    navigator.clipboard.writeText(joinUrl)
    setIsCopyConfirmationShown(true)
    setTimeout(() => setIsCopyConfirmationShown(false), COPY_CONFIRMATION_MS)
  }

  return (
    <div data-testid="invite-link" className="flex flex-col gap-3 items-center">
      {qrDataUrl && (
        <img
          data-testid="invite-link-qr"
          src={qrDataUrl}
          alt={`QR code of the invitation link ${joinUrl}`}
          className="rounded-lg"
        />
      )}
      <Button
        data-testid="copy-game-link-button"
        className="whitespace-normal h-auto w-full"
        onClick={handleCopyClick}
      >
        Copy the invitation link
      </Button>
      {isCopyConfirmationShown && (
        <p className="text-sm text-muted-foreground">
          The invitation link has been copied to your clipboard
        </p>
      )}
    </div>
  )
}
