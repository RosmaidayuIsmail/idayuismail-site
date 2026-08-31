import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import Loading from '../components/Loading'
import Roman from '../components/Roman'
import './WorkDetail.css'

export default function WorkDetail({ ui }) {
  const { slug } = useParams()
  const { data: project, loading, error } = useApi(`projects/${slug}`, [slug])

  if (loading) return <Loading label={ui.t.loading} />
  if (error || !project) return <div className="detail-status">{ui.t.notFound}</div>

  const title = project.title[ui.lang] || project.title.en
  const body = project.body[ui.lang] || project.body.en
  const more = project.more[ui.lang] || project.more.en

  return (
    <article className="detail">
      <div className="wrap">
        <Link to="/#work" className="detail-back"><ArrowLeft size={15} /> {ui.t.backToWork}</Link>

        <Roman as="h1" text={title} lang={ui.lang} show={ui.showRoman} className="detail-title" />

        <div className="detail-tags">
          {project.tags.map((tag) => <span key={tag} className="work-tag">{tag}</span>)}
        </div>

        {project.images?.length > 0 && (
          <div className="detail-gallery">
            {project.images.map((src, i) => (
              <div key={i} className="detail-gallery-frame">
                <img src={src} alt={`${title} — ${i + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        )}

        <p className="detail-body">{body}</p>
        {more && <p className="detail-more">{more}</p>}

        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="detail-visit">
            {ui.t.workVisit} <ArrowUpRight size={16} />
          </a>
        )}
      </div>
    </article>
  )
}
