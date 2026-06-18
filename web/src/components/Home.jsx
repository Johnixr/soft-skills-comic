import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import GradientText from './GradientText.jsx'
import SpotlightCard from './SpotlightCard.jsx'
import { pageUrl, chapterStatus, overallPercent } from '../lib/util.js'
import './Home.css'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.04 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Home({ manifest, progress, onOpen }) {
  const { chapters, title, subtitle, totalPages } = manifest
  const [query, setQuery] = useState('')

  const percent = useMemo(() => overallPercent(progress, chapters), [progress, chapters])
  const last = progress.last

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return chapters
    return chapters.filter(
      (c) => c.title.includes(q) || String(c.number) === q,
    )
  }, [query, chapters])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      className="home"
    >
      {/* ===== Hero ===== */}
      <header className="hero container">
        <motion.div className="hero__badge" variants={fadeUp} initial="hidden" animate="show">
          <span className="dot" /> 机器猫漫画版 · AI 演绎
        </motion.div>

        <motion.h1 className="hero__title" variants={fadeUp} custom={1} initial="hidden" animate="show">
          <GradientText>软技能生存指南</GradientText>
        </motion.h1>

        <motion.p className="hero__subtitle" variants={fadeUp} custom={2} initial="hidden" animate="show">
          {subtitle}
        </motion.p>

        <motion.div className="hero__stats" variants={fadeUp} custom={3} initial="hidden" animate="show">
          <div className="stat"><b>{chapters.length}</b><span>章节</span></div>
          <div className="stat__divider" />
          <div className="stat"><b>{totalPages}</b><span>漫画页</span></div>
          <div className="stat__divider" />
          <div className="stat"><b>{percent}%</b><span>已读</span></div>
        </motion.div>

        <motion.div className="hero__actions" variants={fadeUp} custom={4} initial="hidden" animate="show">
          {last ? (
            <button className="btn" onClick={() => onOpen(last.chapter, last.page)}>
              ▶ 继续阅读 · 第 {last.chapter} 章
            </button>
          ) : (
            <button className="btn" onClick={() => onOpen(1, 1)}>▶ 开始阅读</button>
          )}
          <a className="btn ghost" href="#chapters">浏览章节 ↓</a>
        </motion.div>

        {percent > 0 && (
          <motion.div className="hero__progress" variants={fadeUp} custom={5} initial="hidden" animate="show">
            <div className="bar"><div className="bar__fill" style={{ width: `${percent}%` }} /></div>
          </motion.div>
        )}
      </header>

      {/* ===== 章节目录 ===== */}
      <section className="chapters container" id="chapters">
        <div className="chapters__head">
          <h2>章节目录</h2>
          <input
            className="search"
            type="search"
            placeholder="搜索章节标题或序号…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="grid">
          {filtered.map((c, i) => {
            const st = chapterStatus(progress, c.number, c.pages)
            return (
              <motion.div
                key={c.number}
                variants={fadeUp}
                custom={Math.min(i, 12)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
              >
                <SpotlightCard className="chapter-card" onClick={() => onOpen(c.number, st.page || 1)}>
                  <div className="chapter-card__thumb">
                    <img
                      src={pageUrl(c.number, 1)}
                      alt={`第 ${c.number} 章封面`}
                      loading="lazy"
                    />
                    <span className="chapter-card__no">{c.number}</span>
                    {st.done && <span className="chapter-card__done">✓ 已读完</span>}
                  </div>
                  <div className="chapter-card__body">
                    <h3 className="chapter-card__title">{c.title}</h3>
                    <div className="chapter-card__meta">
                      <span>{c.pages} 页</span>
                      {st.started && !st.done && <span className="reading">读至 {st.page}/{c.pages}</span>}
                    </div>
                    {st.started && (
                      <div className="bar mini"><div className="bar__fill" style={{ width: `${st.percent}%` }} /></div>
                    )}
                  </div>
                </SpotlightCard>
              </motion.div>
            )
          })}
        </div>

        {filtered.length === 0 && <p className="empty">没有找到匹配的章节～</p>}
      </section>

      {/* ===== 页脚 ===== */}
      <footer className="footer container">
        <p className="footer__main">
          本作品为基于 John Sonmez 原著{' '}
          <a href="https://www.amazon.com/Soft-Skills-Software-Developers-Manual/dp/1617292397" target="_blank" rel="noreferrer">
            <i>Soft Skills: The Software Developer's Life Manual</i>
          </a>{' '}
          的 <b>AI 改编 / 二次创作</b>，并非原著本身。原著版权归 John Sonmez 及其出版方所有，本项目不拥有、不主张任何原著版权。
        </p>
        <p className="footer__sub">
          仅供个人学习与研究交流，请支持正版原著 · 如涉及版权问题，请联系微信公众号
          <b>「AGI Hunt」</b>，我们将第一时间删除或作相应调整处理。
        </p>
      </footer>
    </motion.div>
  )
}
