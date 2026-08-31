import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import Loading from '../components/Loading'
import Roman from '../components/Roman'
import MomentsFeed from '../components/MomentsFeed'
import './Journey.css'

export default function Journey({ ui }) {
  const { data: journey, loading } = useApi('journey')

  return (
    <div className="journey-page">
      <div className="wrap">
        <Link to="/" className="detail-back"><ArrowLeft size={15} /> {ui.t.nav.about}</Link>

        <div className="journey-page-head">
          <h1>{ui.t.journeyLabel}</h1>
          <p>{ui.t.journeySub}</p>
        </div>

        <MomentsFeed ui={ui} />

        {loading && <Loading label={ui.t.loading} />}

        <div className="journey-page-list">
          {journey?.map((item) => (
            <Link key={item.slug} to={`/journey/${item.slug}`} className="journey-page-item">
              <span className="journey-page-date">{item.date}</span>
              <div className="journey-page-body">
                <Roman as="h2" text={item.title[ui.lang] || item.title.en} lang={ui.lang} show={ui.showRoman} />
                <p>{item.body[ui.lang] || item.body.en}</p>
              </div>
              <ArrowUpRight size={18} className="journey-page-arrow" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
