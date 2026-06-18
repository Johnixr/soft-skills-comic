import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { chapterStatus } from '../lib/util.js'
import './ChapterDrawer.css'

export default function ChapterDrawer({ open, chapters, current, progress, onClose, onPick }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="drawer__scrim"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="drawer__head">
              <h3>章节目录</h3>
              <button className="icon-btn" onClick={onClose}>✕</button>
            </div>
            <div className="drawer__list">
              {chapters.map((c) => {
                const st = chapterStatus(progress, c.number, c.pages)
                const active = c.number === current
                return (
                  <button
                    key={c.number}
                    className={`drawer__item ${active ? 'active' : ''}`}
                    onClick={() => onPick(c.number)}
                  >
                    <span className="drawer__no">{c.number}</span>
                    <span className="drawer__text">{c.title}</span>
                    {st.done
                      ? <span className="drawer__tag done">✓</span>
                      : st.started
                        ? <span className="drawer__tag">{st.percent}%</span>
                        : <span className="drawer__tag dim">{c.pages}页</span>}
                  </button>
                )
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
