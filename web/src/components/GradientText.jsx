import './GradientText.css'

// 灵感来自 reactbits 的 GradientText：流动渐变文字
export default function GradientText({ children, className = '' }) {
  return <span className={`gradient-text ${className}`}>{children}</span>
}
