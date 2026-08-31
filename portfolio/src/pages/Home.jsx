import { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import About from '../components/About'
import Work from '../components/Work'
import Learning from '../components/Learning'
import Services from '../components/Services'
import SealCallout from '../components/SealCallout'
import Footer from '../components/Footer'
import { useApi } from '../hooks/useApi'

export default function Home({ ui, setActive }) {
  const { data: profile } = useApi('profile')
  const { data: projects } = useApi('projects')
  const { data: learning } = useApi('learning')

  useEffect(() => {
    const sectionIds = ['top', 'about', 'work', 'learning', 'services', 'contact']
    const ratios = {}

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { ratios[entry.target.id] = entry.intersectionRatio })
      const [bestId] = Object.entries(ratios).sort((a, b) => b[1] - a[1])[0] || []
      if (bestId) setActive(bestId)
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] })

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [setActive])

  return (
    <>
      <Hero ui={ui} profile={profile} />
      <About ui={ui} profile={profile} />
      <Work ui={ui} projects={projects} />
      <Learning ui={ui} learning={learning} />
      <Services ui={ui} />
      <SealCallout ui={ui} profile={profile} />
      <Footer ui={ui} profile={profile} />
    </>
  )
}
