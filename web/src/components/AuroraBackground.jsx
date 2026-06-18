import './AuroraBackground.css'

// 灵感来自 reactbits 的 Aurora / 渐变光晕背景
export default function AuroraBackground() {
  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora__blob aurora__blob--1" />
      <div className="aurora__blob aurora__blob--2" />
      <div className="aurora__blob aurora__blob--3" />
      <div className="aurora__grid" />
      <div className="aurora__noise" />
    </div>
  )
}
