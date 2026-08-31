export default function ImagePreview({ urls }) {
  const list = urls.split('\n').map((u) => u.trim()).filter(Boolean)
  if (list.length === 0) return null
  return (
    <div className="admin-image-preview">
      {list.map((src, i) => <img key={i} src={src} alt="" onError={(e) => { e.target.style.opacity = 0.25 }} />)}
    </div>
  )
}
