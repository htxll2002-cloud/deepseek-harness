import { useEffect, useState } from 'react'
import type { ISession } from '@deepseek-ai/dsh-client-runtime/client'

/**
 * Load one session attachment through the official session.attachment RPC.
 * @param readAttachment - official session attachment reader.
 * @param attachmentId - durable attachment id from the tool result.
 * @returns an object URL and optional load error.
 */
export function useAttachmentUrl(
  readAttachment: ISession['readAttachment'] | undefined,
  attachmentId: string | undefined,
): { url?: string; error?: string } {
  const [url, setUrl] = useState<string>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (readAttachment === undefined || attachmentId === undefined) return
    let objectUrl: string | undefined
    let cancelled = false
    void readAttachment(attachmentId as Parameters<ISession['readAttachment']>[0]).then((result) => {
      if (cancelled) return
      if (!result.ok) {
        setError('Failed to load image')
        return
      }
      const blob = new Blob([result.value.data as BlobPart], { type: result.value.attachment.mediaType })
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    }).catch((cause: unknown) => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause))
    })
    return () => {
      cancelled = true
      if (objectUrl !== undefined) URL.revokeObjectURL(objectUrl)
    }
  }, [readAttachment, attachmentId])

  return { ...url === undefined ? {} : { url }, ...error === undefined ? {} : { error } }
}
