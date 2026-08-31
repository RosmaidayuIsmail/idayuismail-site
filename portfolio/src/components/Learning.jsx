import { Link } from 'react-router-dom'
import { useInView } from '../hooks/useInView'
import Loading from './Loading'
import Roman from './Roman'
import './Learning.css'

export default function Learning({ ui, learning }) {
  const [ref, inView] = useInView()

  return (
    <section id="learning" ref={ref} className="learning">
      <div className="wrap">
        <div className={`section-head fade-up ${inView ? 'in' : ''}`}>
          <h2>{ui.t.learningLabel}</h2>
          <span>{ui.t.learningSub}</span>
        </div>

        {!learning ? (
          <Loading label={ui.t.loading} />
        ) : (
          <div className="learning-grid">
            {learning.map((item, i) => (
              <Link
                key={item.slug}
                to={`/learning/${item.slug}`}
                className={`learning-card fade-up ${inView ? 'in' : ''}`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <Roman as="h3" text={item.title[ui.lang] || item.title.en} lang={ui.lang} show={ui.showRoman} />
                <p>{item.body[ui.lang] || item.body.en}</p>
              </Link>
            ))}
          </div>
        )}

        <div className={`cert-row fade-up ${inView ? 'in' : ''}`}>
          <span className="cert-label">{ui.t.certLabel}</span>
          <div className="cert-pills">
            {ui.t.certifications.map((c) => (
              <Roman key={c} as="span" text={c} lang={ui.lang} show={ui.showRoman} className="cert-pill" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
