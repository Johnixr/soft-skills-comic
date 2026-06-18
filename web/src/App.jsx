import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import AuroraBackground from './components/AuroraBackground.jsx'
import Home from './components/Home.jsx'
import Reader from './components/Reader.jsx'
import manifest from './data/manifest.json'
import { loadProgress, saveProgress } from './lib/util.js'
import './App.css'

function parseHash() {
  const h = window.location.hash.replace(/^#/, '')
  const m = h.match(/^\/chapter\/(\d+)(?:\/(\d+))?/)
  if (m) {
    const chapter = Math.min(Math.max(parseInt(m[1], 10), 1), manifest.chapters.length)
    const page = m[2] ? parseInt(m[2], 10) : null
    return { view: 'reader', chapter, page }
  }
  return { view: 'home', chapter: null, page: null }
}

export default function App() {
  const [route, setRoute] = useState(parseHash)
  const [progress, setProgress] = useState(loadProgress)

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const updateProgress = useCallback((next) => {
    setProgress(next)
    saveProgress(next)
  }, [])

  const goReader = useCallback((chapter, page) => {
    window.location.hash = page ? `/chapter/${chapter}/${page}` : `/chapter/${chapter}`
    // 滚到顶部，避免移动端残留滚动位置
    window.scrollTo({ top: 0 })
  }, [])

  const goHome = useCallback(() => { window.location.hash = '/' }, [])

  return (
    <>
      <AuroraBackground />
      <div className="app-shell">
        <AnimatePresence mode="wait">
          {route.view === 'home' ? (
            <Home
              key="home"
              manifest={manifest}
              progress={progress}
              onOpen={goReader}
            />
          ) : (
            <Reader
              key={`reader-${route.chapter}`}
              manifest={manifest}
              chapterNumber={route.chapter}
              startPage={route.page}
              progress={progress}
              onProgress={updateProgress}
              onHome={goHome}
              onNavigate={goReader}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
