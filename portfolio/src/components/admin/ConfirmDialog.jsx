import { AlertTriangle } from 'lucide-react'
import './ConfirmDialog.css'

export default function ConfirmDialog({ message, confirmLabel = 'Delete', onCancel, onConfirm }) {
  return (
    <div className="confirm-backdrop" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true">
        <div className="confirm-icon"><AlertTriangle size={20} /></div>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel" onClick={onCancel}>Cancel</button>
          <button className="confirm-btn delete" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
