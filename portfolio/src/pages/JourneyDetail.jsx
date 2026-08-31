import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import Loading from '../components/Loading'
import Roman from '../components/Roman'
import './WorkDetail.css'

export default function JourneyDetail({ ui }) {
  const { slug } = useParams()
  const { data: entry, loading, error } = useApi(`journey/${slug}`, [slug])

  if (loading) return <Loading label={ui.t.loading} />
  if (error || !entry) return <div className="detail-status">{ui.t.notFound}</div>

  return (
    <article className="detail">
      <div className="wrap">
        <Link to="/journey" className="detail-back"><ArrowLeft size={15} /> {ui.t.journeyLabel}</Link>
        {entry.date && <p className="detail-date">{entry.date}</p>}
        <Roman as="h1" text={entry.title[ui.lang] || entry.title.en} lang={ui.lang} show={ui.showRoman} className="detail-title" />
        <p className="detail-body">{entry.body[ui.lang] || entry.body.en}</p>
      </div>
    </article>
  )
}
