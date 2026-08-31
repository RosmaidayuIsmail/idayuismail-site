import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import './ChatWidget.css'

const GREETING = "Hi, I'm here to answer questions about Idayu — her background, skills, and projects. Ask me anything."

function TypewriterText({ text, onProgress }) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    setShown('')
    let i = 0
    const step = Math.max(1, Math.round(text.length / 120))
    const id = setInterval(() => {
      i += step
      setShown(text.slice(0, i))
      onProgress?.()
      if (i >= text.length) clearInterval(id)
    }, 14)
    return () => clearInterval(id)
  }, [text])

  return <>{shown}</>
}

function TypingDots() {
  return (
    <div className="chat-bubble assistant chat-typing-dots">
      <span /><span /><span />
    </div>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typingIndex, setTypingIndex] = useState(null)
  const [error, setError] = useState('')
  const listRef = useRef(null)

  const scrollToBottom = () => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }
  useEffect(scrollToBottom, [messages, loading, open])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/portfolio/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setLoading(false)
      setMessages((m) => {
        const withReply = [...m, { role: 'assistant', content: data.reply }]
        setTypingIndex(withReply.length - 1)
        return withReply
      })
    } catch (err) {
      setLoading(false)
      setError(err.message)
    }
  }

  return (
    <>
      {open && (
        <div className="chat-panel">
          <div className="chat-panel-head">
            <span>Ask about Idayu</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
          </div>

          <div className="chat-panel-body" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role}`}>
                {m.role === 'assistant' && i === typingIndex ? (
                  <TypewriterText
                    text={m.content}
                    onProgress={scrollToBottom}
                  />
                ) : (
                  m.content
                )}
              </div>
            ))}
            {loading && <TypingDots />}
            {error && <div className="chat-error">{error}</div>}
          </div>

          <form className="chat-panel-input" onSubmit={send}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button className={`chat-fab ${open ? 'open' : ''}`} onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close chat' : 'Ask about Idayu'}>
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  )
}
