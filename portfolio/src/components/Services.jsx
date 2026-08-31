import { useInView } from '../hooks/useInView'
import Roman from './Roman'
import './Services.css'

export default function Services({ ui }) {
  const [ref, inView] = useInView()

  return (
    <section id="services" ref={ref} className="services">
      <div className="wrap">
        <div className={`section-head fade-up ${inView ? 'in' : ''}`}>
          <h2>{ui.t.servicesLabel}</h2>
          <span>{ui.t.servicesSub}</span>
        </div>

        <div className="services-grid">
          {ui.t.services.map((s, i) => (
            <div key={i} className={`service-card fade-up ${inView ? 'in' : ''}`} style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="service-glyph">{s.glyph}</span>
              <Roman as="h3" text={s.title} lang={ui.lang} show={ui.showRoman} />
              <p>{s.body}</p>
            </div>
          ))}
        </div>

        <div className={`services-cta fade-up ${inView ? 'in' : ''}`}>
          <a href="#contact" className="cta-btn">{ui.t.cta}</a>
        </div>
      </div>
    </section>
  )
}
