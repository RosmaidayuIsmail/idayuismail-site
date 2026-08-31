import { useCallback, useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

export function useConfirm() {
  const [pending, setPending] = useState(null)

  const confirm = useCallback((message) => {
    return new Promise((resolve) => setPending({ message, resolve }))
  }, [])

  const settle = (result) => {
    pending?.resolve(result)
    setPending(null)
  }

  const dialog = pending ? (
    <ConfirmDialog
      message={pending.message}
      onCancel={() => settle(false)}
      onConfirm={() => settle(true)}
    />
  ) : null

  return { confirm, dialog }
}
