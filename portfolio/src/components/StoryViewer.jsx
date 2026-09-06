import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import './StoryViewer.css'

const IMAGE_DURATION_MS = 5000
const SEEN_KEY = (id) => `seen-story-${id}`

export default function StoryViewer({ stories, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex)
  const [progress, setProgress] = useState(0) // 0-1 for the current story
  const videoRef = useRef(null)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  const story = stories[index]

  const goNext = () => (index < stories.length - 1 ? setIndex(index + 1) : onClose())
  const goPrev = () => setIndex(Math.max(0, index - 1))

  // Mark seen + reset progress whenever the active story changes.
  useEffect(() => {
    if (!story) return
    sessionStorage.setItem(SEEN_KEY(story.id), '1')
    setProgress(0)
    startRef.current = null
  }, [story?.id])

  // Auto-advance: images use a fixed timer; video advances on its own
  // 'ended' event instead (driven below), so this effect no-ops for video.
  useEffect(() => {
    if (!story || story.mediaType === 'video') return
    const tick = (t) => {
      if (startRef.current === null) startRef.current = t
      const elapsed = t - startRef.current
      const pct = Math.min(1, elapsed / IMAGE_DURATION_MS)
      setProgress(pct)
      if (pct >= 1) { goNext(); return }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  if (!story) return null

  return (
    <div className="story-viewer-backdrop">
      <div className="story-viewer">
        <div className="story-viewer-bars">
          {stories.map((s, i) => (
            <div key={s.id} className="story-viewer-bar">
              <div
                className="story-viewer-bar-fill"
                style={{ width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        <button className="story-viewer-close" onClick={onClose} aria-label="Close"><X size={20} /></button>

        <div className="story-viewer-media">
          {story.mediaType === 'video'
            ? (
              <video
                ref={videoRef}
                src={story.mediaUrl}
                autoPlay
                playsInline
                onTimeUpdate={(e) => setProgress(e.target.duration ? e.target.currentTime / e.target.duration : 0)}
                onEnded={goNext}
              />
            )
            : <img src={story.mediaUrl} alt="" />}
        </div>

        {story.caption && <p className="story-viewer-caption">{story.caption}</p>}

        <button className="story-viewer-tap story-viewer-tap-prev" onClick={goPrev} aria-label="Previous story" />
        <button className="story-viewer-tap story-viewer-tap-next" onClick={goNext} aria-label="Next story" />
      </div>
    </div>
  )
}
