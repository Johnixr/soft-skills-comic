import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// 漫画图片存放在仓库根目录（web/ 的上一级），按 chapter_N/page_X.png 组织
const comicRoot = path.resolve(__dirname, '..')

// 开发服务器：把上一级目录里的 chapter_* 图片当作静态资源提供
function serveComicImages() {
  return {
    name: 'serve-comic-images',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        try {
          const url = decodeURIComponent((req.url || '').split('?')[0])
          const m = url.match(/^\/chapter_\d+\/page_\d+\.(png|webp)$/)
          if (m) {
            const filePath = path.join(comicRoot, url)
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', m[1] === 'webp' ? 'image/webp' : 'image/png')
              // 开发期不缓存，便于反复调整压缩参数后即时预览
              res.setHeader('Cache-Control', 'no-store')
              fs.createReadStream(filePath).pipe(res)
              return
            }
          }
        } catch (e) { /* fall through */ }
        next()
      })
    },
  }
}

export default defineConfig({
  // 使用相对路径，便于部署到 GitHub Pages 仓库根目录或任意子路径
  base: './',
  plugins: [react(), serveComicImages()],
  build: {
    // 构建产物输出到仓库根目录，与 chapter_* 图片同级，部署时无需复制图片
    outDir: comicRoot,
    emptyOutDir: false,
    assetsDir: 'assets',
  },
})
