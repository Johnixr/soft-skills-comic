// 漫画图片地址：开发环境由 vite 中间件代理上一级目录，生产环境为相对路径
const BASE = import.meta.env.BASE_URL || '/'

// 默认提供 WebP（体积更小、质量无损）；个别缺失时由 <img onError> 回退到 PNG
export function pageUrl(chapter, page) {
  return `${BASE}chapter_${chapter}/page_${page}.webp`
}

export function pageUrlPng(chapter, page) {
  return `${BASE}chapter_${chapter}/page_${page}.png`
}

// 给 <img onError> 用：webp 加载失败时回退到 png，且只回退一次避免死循环
export function fallbackToPng(e, chapter, page) {
  const img = e.currentTarget
  if (img.dataset.fellBack) return
  img.dataset.fellBack = '1'
  img.src = pageUrlPng(chapter, page)
}

// ---- 阅读进度（localStorage） ----
const KEY = 'ssc:progress:v1'

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { chapters: {}, last: null }
  } catch {
    return { chapters: {}, last: null }
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch { /* 忽略隐私模式等写入失败 */ }
}

// 记录某章读到第几页 + 全局最后位置
export function markRead(progress, chapter, page, totalPages) {
  const next = { ...progress, chapters: { ...progress.chapters } }
  const done = page >= totalPages
  next.chapters[chapter] = { page, total: totalPages, done }
  next.last = { chapter, page }
  return next
}

export function chapterStatus(progress, chapter, totalPages) {
  const rec = progress.chapters?.[chapter]
  if (!rec) return { started: false, done: false, page: 0, percent: 0 }
  const percent = Math.round((rec.page / totalPages) * 100)
  return { started: true, done: rec.done || rec.page >= totalPages, page: rec.page, percent }
}

export function overallPercent(progress, chapters) {
  const totalPages = chapters.reduce((s, c) => s + c.pages, 0)
  const read = chapters.reduce((s, c) => {
    const rec = progress.chapters?.[c.number]
    return s + (rec ? Math.min(rec.page, c.pages) : 0)
  }, 0)
  return totalPages ? Math.round((read / totalPages) * 100) : 0
}

export const clamp = (n, min, max) => Math.max(min, Math.min(max, n))
