# 软技能生存指南 · 机器猫漫画版 — 在线阅读 Web App

一个用 **React + Vite + Framer Motion** 打造的在线漫画阅读器，适配手机端与 PC 端，
视觉与动效灵感来自 [reactbits.dev](https://reactbits.dev/)（Aurora 渐变背景、GradientText 流光标题、SpotlightCard 光标高光卡片）。

## ✨ 功能

- **封面首页**：流光标题、统计数据、一键「继续阅读 / 开始阅读」
- **章节目录**：71 章封面网格、标题/序号搜索、每章阅读进度
- **漫画阅读器**：
  - 翻页动画过渡；预加载相邻页
  - 多种操作：← → / 空格 / PageUp·Down 翻页，点击左右区域翻页，移动端左右滑动
  - 点击页面中部 显隐 操作栏（沉浸阅读），`F` 全屏，`Esc` 返回目录
  - 跨章节自动衔接（章末 → 下一章），底部章节切换
  - 右侧抽屉式章节列表，含进度标记
- **进度记忆**：阅读进度存于 `localStorage`，下次自动续读
- **可分享链接**：`#/chapter/3/5` 直达第 3 章第 5 页

## 🛠 本地开发

```bash
cd web
npm install
npm run dev      # http://localhost:5173
```

> 漫画图片位于仓库根目录（`web/` 的上一级）的 `chapter_N/page_X.png`。
> 开发服务器通过 Vite 中间件（见 `vite.config.js`）直接代理这些图片，无需复制。

## 📦 构建与部署

```bash
npm run build    # 产物输出到仓库根目录：index.html + assets/
```

构建产物（`index.html` 与 `assets/`）会输出到**仓库根目录**，与 `chapter_*` 图片同级，
因此**无需复制数百兆图片**即可部署。

### 部署到 GitHub Pages

1. `npm run build`，提交根目录新增的 `index.html`、`assets/`、`.nojekyll`
2. GitHub 仓库 → **Settings → Pages**
3. **Source** 选择 `Deploy from a branch`，分支选 `main`，目录选 `/ (root)`
4. 保存后等待几分钟，即可通过 `https://<用户名>.github.io/<仓库名>/` 访问

> 由于使用了相对路径（`base: './'`），部署到任意子路径都能正常工作。

## 📁 目录结构

```
web/
├── index.html
├── vite.config.js          # 含开发期图片代理中间件 + 构建输出到根目录
├── src/
│   ├── main.jsx
│   ├── App.jsx             # 哈希路由：首页 / 阅读器
│   ├── data/manifest.json  # 71 章标题与页数（由脚本生成）
│   ├── lib/util.js         # 图片地址、进度存取
│   ├── components/
│   │   ├── AuroraBackground.jsx
│   │   ├── GradientText.jsx
│   │   ├── SpotlightCard.jsx
│   │   ├── Home.jsx        # 封面 + 章节目录
│   │   ├── Reader.jsx      # 漫画阅读器
│   │   └── ChapterDrawer.jsx
│   └── styles/global.css
```
