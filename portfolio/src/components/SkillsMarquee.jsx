import './SkillsMarquee.css'

export default function SkillsMarquee({ skills = [], label }) {
  const items = [...skills, ...skills]
  return (
    <div className="marquee" role="list" aria-label={label}>
      <div className="marquee-track">
        {items.map((skill, i) => (
          <span className="marquee-item" key={i} role="listitem">{skill}</span>
        ))}
      </div>
    </div>
  )
}
