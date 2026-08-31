import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import Loading from '../components/Loading'
import Roman from '../components/Roman'
import './WorkDetail.css'

export default function LearningDetail({ ui }) {
  const { slug } = useParams()
  const { data: entry, loading, error } = useApi(`learning/${slug}`, [slug])

  if (loading) return <Loading label={ui.t.loading} />
  if (error || !entry) return <div className="detail-status">{ui.t.notFound}</div>

  return (
    <article className="detail">
      <div className="wrap">
        <Link to="/#learning" className="detail-back"><ArrowLeft size={15} /> {ui.t.learningLabel}</Link>
        <Roman as="h1" text={entry.title[ui.lang] || entry.title.en} lang={ui.lang} show={ui.showRoman} className="detail-title" />
        <p className="detail-body">{entry.body[ui.lang] || entry.body.en}</p>
      </div>
    </article>
  )
}
