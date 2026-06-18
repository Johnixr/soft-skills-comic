import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageUrl, markRead, clamp, fallbackToPng } from '../lib/util.js'
import ChapterDrawer from './ChapterDrawer.jsx'
import './Reader.css'

export default function Reader({
  manifest, chapterNumber, startPage, progress, onProgress, onHome, onNavigate,
}) {
  const chapters = manifest.chapters
  const chapter = chapters.find((c) => c.number === chapterNumber) || chapters[0]
  const total = chapter.pages
  const idx = chapters.indexOf(chapter)
  const prevChapter = idx > 0 ? chapters[idx - 1] : null
  const nextChapter = idx < chapters.length - 1 ? chapters[idx + 1] : null

  // 初始页：URL 指定 > 已存进度 > 第 1 页
  const initial = clamp(
    startPage || progress.chapters?.[chapterNumber]?.page || 1, 1, total,
  )
  const [page, setPage] = useState(initial)
  const [dir, setDir] = useState(0) // 翻页方向：1 下一页 / -1 上一页
  const [chrome, setChrome] = useState(true) // 顶部/底部 UI 是否可见
  const [drawer, setDrawer] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const wrapRef = useRef(null)

  // 章节切换时重置页码
  useEffect(() => {
    setPage(clamp(startPage || progress.chapters?.[chapterNumber]?.page || 1, 1, total))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterNumber])

  // 记录进度
  useEffect(() => {
    onProgress(markRead(progress, chapterNumber, page, total))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterNumber, page])

  // 预加载相邻页
  useEffect(() => {
    setLoaded(false)
    ;[page + 1, page + 2, page - 1].forEach((p) => {
      if (p >= 1 && p <= total) { const img = new Image(); img.src = pageUrl(chapterNumber, p) }
    })
  }, [page, chapterNumber, total])

  const goPage = useCallback((next, direction) => {
    setDir(direction)
    setPage(next)
  }, [])

  const next = useCallback(() => {
    if (page < total) goPage(page + 1, 1)
    else if (nextChapter) onNavigate(nextChapter.number, 1)
  }, [page, total, nextChapter, goPage, onNavigate])

  const prev = useCallback(() => {
    if (page > 1) goPage(page - 1, -1)
    else if (prevChapter) onNavigate(prevChapter.number, prevChapter.pages)
  }, [page, prevChapter, goPage, onNavigate])

  // 键盘
  useEffect(() => {
    const onKey = (e) => {
      if (drawer) return
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); next() }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); prev() }
      else if (e.key === 'Escape') onHome()
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, onHome, drawer])

  // 触摸滑动
  const touch = useRef({ x: 0, y: 0, t: 0 })
  const onTouchStart = (e) => {
    const t = e.touches[0]
    touch.current = { x: t.clientX, y: t.clientY, t: Date.now() }
  }
  const onTouchEnd = (e) => {
    const t = e.changedTouches[0]
    const dx = t.clientX - touch.current.x
    const dy = t.clientY - touch.current.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev()
    }
  }

  // 点击分区：左 35% 上一页 / 右 35% 下一页 / 中间切换 UI
  const onZoneClick = (e) => {
    const rect = wrapRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    if (x < 0.35) prev()
    else if (x > 0.65) next()
    else setChrome((v) => !v)
  }

  const toggleFullscreen = () => {
    const el = document.documentElement
    if (!document.fullscreenElement) el.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  const globalPercent = useMemo(() => Math.round((page / total) * 100), [page, total])

  const variants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 60 : -60, scale: 0.98 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -60 : 60, scale: 0.98 }),
  }

  return (
    <motion.div
      className="reader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 顶栏 */}
      <AnimatePresence>
        {chrome && (
          <motion.header
            className="reader__top"
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -70, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button className="icon-btn" onClick={onHome} title="返回首页">‹ 目录</button>
            <div className="reader__title">
              <span className="reader__no">第 {chapter.number} 章</span>
              <span className="reader__name">{chapter.title}</span>
            </div>
            <button className="icon-btn" onClick={() => setDrawer(true)} title="章节列表">☰</button>
          </motion.header>
        )}
      </AnimatePresence>

      {/* 漫画页 */}
      <div
        className="reader__stage"
        ref={wrapRef}
        onClick={onZoneClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.img
            key={`${chapterNumber}-${page}`}
            className="reader__page"
            src={pageUrl(chapterNumber, page)}
            alt={`第 ${chapter.number} 章 第 ${page} 页`}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            draggable={false}
            onLoad={() => setLoaded(true)}
            onError={(e) => fallbackToPng(e, chapterNumber, page)}
          />
        </AnimatePresence>
        {!loaded && <div className="reader__spinner" aria-hidden="true" />}
      </div>

      {/* 底栏 */}
      <AnimatePresence>
        {chrome && (
          <motion.footer
            className="reader__bottom"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="reader__progress">
              <div className="bar"><div className="bar__fill" style={{ width: `${globalPercent}%` }} /></div>
            </div>
            <div className="reader__controls">
              <button className="nav-btn" onClick={prev} disabled={page === 1 && !prevChapter}>
                ‹ 上一页
              </button>
              <div className="reader__pageinfo">
                <b>{page}</b> / {total}
              </div>
              <button className="nav-btn" onClick={next} disabled={page === total && !nextChapter}>
                下一页 ›
              </button>
            </div>
            <div className="reader__chapnav">
              {prevChapter ? (
                <button className="chap-link" onClick={() => onNavigate(prevChapter.number, 1)}>
                  ‹ 第 {prevChapter.number} 章
                </button>
              ) : <span />}
              {nextChapter ? (
                <button className="chap-link" onClick={() => onNavigate(nextChapter.number, 1)}>
                  第 {nextChapter.number} 章 ›
                </button>
              ) : <span className="chap-link end">已是最后一章 🎉</span>}
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      <ChapterDrawer
        open={drawer}
        chapters={chapters}
        current={chapterNumber}
        progress={progress}
        onClose={() => setDrawer(false)}
        onPick={(n) => { setDrawer(false); onNavigate(n, 1) }}
      />
    </motion.div>
  )
}
