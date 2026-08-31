import { useState } from 'react'
import { useInView } from '../hooks/useInView'
import Roman from './Roman'
import './SealCallout.css'

export default function SealCallout({ ui, profile }) {
  const [ref, inView] = useInView()
  const [pop, setPop] = useState(false)

  const stamp = () => { setPop(true); setTimeout(() => setPop(false), 350) }

  return (
    <section ref={ref} className="seal-section">
      <div className={`wrap fade-up ${inView ? 'in' : ''}`}>
        <button onClick={stamp} aria-label="Stamp" className={`seal-mark ${pop ? 'pop' : ''}`}>印</button>
        <Roman as="p" text={ui.t.sealQuote} lang={ui.lang} show={ui.showRoman} className="seal-quote" />
        {profile && <span className="seal-signed">{profile.name}</span>}
      </div>
    </section>
  )
}
