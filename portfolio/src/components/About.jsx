import { useInView } from '../hooks/useInView'
import SkillsMarquee from './SkillsMarquee'
import Loading from './Loading'
import { BilingualBlock } from './Roman'
import './About.css'

export default function About({ ui, profile }) {
  const [ref, inView] = useInView()
  const showRoman = ui.showRoman && ui.lang !== 'en'

  return (
    <section id="about" ref={ref} className="about">
      {!profile ? (
        <div className="wrap"><Loading label={ui.t.loading} /></div>
      ) : (
        <>
          <div className={`wrap about-inner fade-up ${inView ? 'in' : ''}`}>
            <div className="about-glyph">印</div>
            <div>
              <h2>{ui.t.aboutLabel}</h2>
              <BilingualBlock
                text={profile[`bio_${ui.lang}`] || profile.bio_en}
                lang={ui.lang}
                show={showRoman}
                plainClassName="about-p1"
                className="about-bilingual"
              />
              <p className="about-p2">{profile.location}</p>
            </div>
          </div>
          <div className={`about-skills fade-up ${inView ? 'in' : ''}`} style={{ transitionDelay: '150ms' }}>
            <SkillsMarquee skills={profile.skills} label={ui.t.skillsLabel} />
          </div>
        </>
      )}
    </section>
  )
}
