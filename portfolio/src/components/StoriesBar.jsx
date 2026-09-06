import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import StoryViewer from './StoryViewer'
import './StoriesBar.css'

const SEEN_KEY = (id) => `seen-story-${id}`

export default function StoriesBar() {
  const { data: stories } = useApi('stories')
  const [startIndex, setStartIndex] = useState(null)
  // Re-render after closing the viewer so seen-state rings update.
  const [, forceUpdate] = useState(0)

  if (!stories || stories.length === 0) return null

  return (
    <div className="stories-bar">
      <div className="stories-bar-scroll">
        {stories.map((s, i) => {
          const seen = typeof window !== 'undefined' && sessionStorage.getItem(SEEN_KEY(s.id)) === '1'
          return (
            <button key={s.id} className={`stories-bar-item ${seen ? 'seen' : ''}`} onClick={() => setStartIndex(i)} aria-label="View story">
              <span className="stories-bar-ring">
                {s.mediaType === 'video'
                  ? <video src={s.mediaUrl} muted playsInline preload="metadata" />
                  : <img src={s.mediaUrl} alt="" loading="lazy" />}
              </span>
            </button>
          )
        })}
      </div>

      {startIndex !== null && (
        <StoryViewer
          stories={stories}
          startIndex={startIndex}
          onClose={() => { setStartIndex(null); forceUpdate((n) => n + 1) }}
        />
      )}
    </div>
  )
}
