import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, LogOut, User, Briefcase, Milestone, BookOpen, Camera, Plus } from 'lucide-react'
import { useAuth, api } from '../components/admin/adminApi'
import Login from '../components/admin/Login'
import ProfileForm from '../components/admin/ProfileForm'
import ProjectForm from '../components/admin/ProjectForm'
import JourneyForm from '../components/admin/JourneyForm'
import LearningForm from '../components/admin/LearningForm'
import { MomentComposer, MomentItem } from '../components/admin/MomentForm'
import './Admin.css'

const EMPTY_PROJECT = { slug: '', title: { en: '', ko: '', zh: '' }, body: { en: '', ko: '', zh: '' }, more: { en: '', ko: '', zh: '' }, tags: '', link: '', images: '', sortOrder: 0 }
const EMPTY_LEARNING = { slug: '', title: { en: '', ko: '', zh: '' }, body: { en: '', ko: '', zh: '' }, sortOrder: 0 }
const EMPTY_JOURNEY = { slug: '', date: '', title: { en: '', ko: '', zh: '' }, body: { en: '', ko: '', zh: '' }, sortOrder: 0 }

const TABS = [
  { key: 'profile', label: 'Profile', Icon: User },
  { key: 'projects', label: 'Work', Icon: Briefcase },
  { key: 'moments', label: 'Moments', Icon: Camera },
  { key: 'journey', label: 'Journey', Icon: Milestone },
  { key: 'learning', label: 'Learning', Icon: BookOpen },
]

function Dashboard({ apiKey, onLogout }) {
  const [tab, setTab] = useState('projects')
  const [projects, setProjects] = useState([])
  const [learning, setLearning] = useState([])
  const [journey, setJourney] = useState([])
  const [moments, setMoments] = useState([])
  const [newProject, setNewProject] = useState(false)
  const [newLearning, setNewLearning] = useState(false)
  const [newJourney, setNewJourney] = useState(false)

  const refresh = () => {
    api('projects').then(setProjects).catch(() => {})
    api('learning').then(setLearning).catch(() => {})
    api('journey').then(setJourney).catch(() => {})
    api('moments').then(setMoments).catch(() => {})
  }
  useEffect(refresh, [])

  const counts = { projects: projects.length, journey: journey.length, learning: learning.length, moments: moments.length }

  return (
    <div className="admin">
      <div className="wrap">
        <div className="admin-topbar">
          <Link to="/" className="detail-back"><ArrowLeft size={15} /> Back to site</Link>
          <button className="admin-logout" onClick={onLogout}><LogOut size={14} /> Log out</button>
        </div>

        <div className="admin-header">
          <h1 className="admin-title">Admin</h1>
          <p className="admin-subtitle">Manage everything shown on your site — changes go live immediately, no rebuild needed.</p>
        </div>

        <div className="admin-tabs">
          {TABS.map(({ key, label, Icon }) => (
            <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
              <Icon size={15} /> {label}
              {counts[key] !== undefined && <span className="admin-tab-count">{counts[key]}</span>}
            </button>
          ))}
        </div>

        {tab === 'profile' && <ProfileForm apiKey={apiKey} />}

        {tab === 'projects' && (
          <div className="admin-list">
            {projects.map((p) => <ProjectForm key={p.slug} initial={{ ...p, tags: p.tags.join(', '), images: (p.images || []).join('\n') }} onSaved={() => { refresh(); setNewProject(false) }} apiKey={apiKey} />)}
            {newProject
              ? <ProjectForm initial={EMPTY_PROJECT} onSaved={() => { refresh(); setNewProject(false) }} apiKey={apiKey} defaultOpen />
              : <button className="admin-btn primary admin-add-btn" onClick={() => setNewProject(true)}><Plus size={14} /> Add project</button>}
          </div>
        )}

        {tab === 'moments' && (
          <div className="admin-list">
            <MomentComposer onPosted={refresh} apiKey={apiKey} />
            {moments.map((m) => <MomentItem key={m.id} moment={m} onDeleted={refresh} apiKey={apiKey} />)}
          </div>
        )}

        {tab === 'journey' && (
          <div className="admin-list">
            {journey.map((j) => <JourneyForm key={j.slug} initial={j} onSaved={() => { refresh(); setNewJourney(false) }} apiKey={apiKey} />)}
            {newJourney
              ? <JourneyForm initial={EMPTY_JOURNEY} onSaved={() => { refresh(); setNewJourney(false) }} apiKey={apiKey} defaultOpen />
              : <button className="admin-btn primary admin-add-btn" onClick={() => setNewJourney(true)}><Plus size={14} /> Add update</button>}
          </div>
        )}

        {tab === 'learning' && (
          <div className="admin-list">
            {learning.map((l) => <LearningForm key={l.slug} initial={l} onSaved={() => { refresh(); setNewLearning(false) }} apiKey={apiKey} />)}
            {newLearning
              ? <LearningForm initial={EMPTY_LEARNING} onSaved={() => { refresh(); setNewLearning(false) }} apiKey={apiKey} defaultOpen />
              : <button className="admin-btn primary admin-add-btn" onClick={() => setNewLearning(true)}><Plus size={14} /> Add entry</button>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Admin() {
  const { key, isAuthed, login, logout } = useAuth()

  if (!isAuthed) return <Login onLogin={login} />
  return <Dashboard apiKey={key} onLogout={logout} />
}
