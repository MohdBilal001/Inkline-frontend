import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - doc.clientHeight
      const ratio = scrollable > 0 ? doc.scrollTop / scrollable : 0
      setPercent(Math.min(100, Math.max(0, ratio * 100)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="ink-progress-track" aria-hidden="true">
      <div className="ink-progress-fill" style={{ height: `${percent}%` }} />
    </div>
  )
}
