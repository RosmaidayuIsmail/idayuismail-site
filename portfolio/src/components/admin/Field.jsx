export default function Field({ label, value, onChange, textarea, hint }) {
  const Comp = textarea ? 'textarea' : 'input'
  return (
    <label className="admin-field">
      <span>{label}</span>
      <Comp value={value} onChange={(e) => onChange(e.target.value)} rows={textarea ? 3 : undefined} />
      {hint && <small className="admin-hint">{hint}</small>}
    </label>
  )
}
