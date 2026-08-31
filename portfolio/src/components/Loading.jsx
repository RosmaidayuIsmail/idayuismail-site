import './Loading.css'

export default function Loading({ label }) {
  return (
    <div className="site-loading">
      <svg className="site-loading-spinner" viewBox="0 0 50 50" width="36" height="36">
        <circle
          className="site-loading-track"
          cx="25" cy="25" r="19"
          fill="none" stroke="currentColor" strokeWidth="3" opacity="0.18"
        />
        <circle
          className="site-loading-arc"
          cx="25" cy="25" r="19"
          fill="none" stroke="currentColor" strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="86 119"
        />
        <text x="25" y="30" textAnchor="middle" className="site-loading-glyph">印</text>
      </svg>
      {label && <span className="site-loading-label">{label}</span>}
    </div>
  )
}
