import { useRef } from 'react'
import './SpotlightCard.css'

// 灵感来自 reactbits 的 SpotlightCard：跟随光标的高光卡片
export default function SpotlightCard({ children, className = '', ...rest }) {
  const ref = useRef(null)

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <div ref={ref} className={`spotlight-card ${className}`} onMouseMove={handleMove} {...rest}>
      <div className="spotlight-card__glow" />
      <div className="spotlight-card__content">{children}</div>
    </div>
  )
}
