import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useInView } from '../hooks/useInView'
import Loading from './Loading'
import Roman from './Roman'
import './Work.css'

function TiltCard({ children, style, className, to }) {
  const ref = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: py * -8, y: px * 8 })
  }
  const reset = () => setTilt({ x: 0, y: 0 })

  return (
    <Link
      to={to}
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={className}
      style={{ ...style, transform: `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
    >
      {children}
    </Link>
  )
}

export default function Work({ ui, projects }) {
  const [ref, inView] = useInView()

  return (
    <section id="work" ref={ref} className="work">
      <div className="wrap">
        <div className={`section-head fade-up ${inView ? 'in' : ''}`}>
          <h2>{ui.t.workLabel}</h2>
          <span>{ui.t.workSub}</span>
        </div>

        {!projects ? (
          <Loading label={ui.t.loading} />
        ) : (
          <div className="work-grid">
            {projects.map((item, i) => (
              <TiltCard
                key={item.slug}
                to={`/work/${item.slug}`}
                className={`work-card card-hover fade-up ${inView ? 'in' : ''}`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="work-card-top">
                  <span className="work-num">{['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][i] || i + 1}</span>
                  {item.link && <ArrowUpRight size={16} className="work-link-icon" />}
                </div>
                {item.images?.[0] && (
                  <div className="work-thumb">
                    <img src={item.images[0]} alt="" loading="lazy" />
                  </div>
                )}
                <div>
                  <Roman as="h3" text={item.title[ui.lang] || item.title.en} lang={ui.lang} show={ui.showRoman} />
                  <p className="work-body">{item.body[ui.lang] || item.body.en}</p>
                  <div className="work-tags">
                    {item.tags.map((tag) => <span key={tag} className="work-tag">{tag}</span>)}
                  </div>
                  <span className="work-expand">
                    {ui.t.workExpand} <ArrowUpRight size={13} />
                  </span>
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
