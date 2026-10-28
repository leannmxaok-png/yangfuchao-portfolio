# 免费部署上线指南 · 杨富超个人网站

站点是纯静态 HTML + CSS + 原生 JS，没有构建步骤、没有后端，**整个 `site/` 目录原样上传就能跑**。

下面四个方案都是免费的，按推荐顺序排。

---

## 方案 A：Cloudflare Pages（最推荐）

**为什么推荐**：免费额度最宽松（无限带宽、无限次部署、单文件上限 25MB），自带全球 CDN 和 HTTPS，还能绑自己的域名。

1. 注册 <https://dash.cloudflare.com>（免费）
2. 左侧 **Workers & Pages** → **Create application** → **Pages** → **Upload assets**
3. 项目名填 `yangfuchao`，**直接拖 `site` 文件夹**上去（不用 git）
4. 部署完会拿到 `https://yangfuchao.pages.dev`，这就是你的网址
5. 想用自己的域名：**Custom domains → Set up a custom domain**，填域名后按提示加 CNAME 记录

已备好的物料：
- `_headers` —— 静态资源一年缓存、HTML 每次回源校验（Cloudflare Pages 和 Netlify 都认）
- `404.html` —— 走丢页，站内链接写错也能兜住
- `robots.txt` / `sitemap.xml` —— 上线后把 `sitemap.xml` 里的 `your-domain.example` 换成真实域名

---

## 方案 B：Vercel（最省事）

1. 注册 <https://vercel.com>（用 GitHub 登录最顺）
2. **Add New… → Project**，把 `site` 文件夹拖进去，或选 GitHub 仓库
3. 框架选 **Other**，构建命令留空，输出目录填 `site`（如果仓库根目录就是 site 就填 `.`）
4. 部署完得到 `https://xxx.vercel.app`

免费版（Hobby）个人项目够用：每月 100GB 带宽、超大函数额度上限会自动放宽。

---

## 方案 C：GitHub Pages（完全免费，适合简历里写）

1. 新建仓库 `yangfuchao.github.io`（仓库名必须带 `.github.io`）
2. 把 `site/` 里的内容上传到仓库根目录
3. 仓库 **Settings → Pages → Source** 选 `main` 分支、根目录 `/`
4. 网址是 `https://yangfuchao.github.io`

注意：国内访问偶尔很慢或打不开，投递简历时最好再备一个方案 A 的链接。

---

## 方案 D：腾讯云 COS / 阿里云 OSS（国内访问最快）

- 需要**备案过的域名**（ICP 备案，个人可备，通常 1–3 周）
- 开通对象存储 → 静态网站托管 → 上传 `site/` 里的文件 → 绑定加速域名
- 有免费流量额度，但不如 A/B 划算
- 适合「HR 一定在国内打开」的兜底方案

---

## 上线前必查清单

| 项目 | 怎么做 |
|---|---|
| 视频能不能播 | 逐个点开六段片子；Safari 对 H.264 + AAC 支持没问题 |
| 单文件大小 | Cloudflare Pages 单文件上限 25MB，当前最大的是 `picc-care.mp4`（15.1MB）✅ |
| 包体积 | 现在整站 57MB，视频占 48MB。建议把 `assets/video/` 挪到 CDN 或对象存储，页面只留链接 |
| 换成小视频 | 嫌下载慢可以再出一版 720p / crf 30，约 20MB；`ffmpeg -i in.mp4 -vf scale=1280:-2 -c:v libx264 -crf 28 -c:a aac -b:a 96k -movflags +faststart out.mp4` |
| sitemap | 把 `sitemap.xml` 里的域名换掉，再提交到百度 / Google Search Console |
| 联系方式 | 页面里的邮箱 `2072449014@qq.com` 和「邮件索取简历」按钮保持可点 |
| 手机端 | 每一页上下滑动一遍，导航汉堡、轮播、灯箱、照片墙都试一次 |
| 404 | 随便改个网址试一次，应跳到走丢页而不是白屏 |

---

## 更新上线后的内容

- 改了 HTML/CSS/JS → 重新拖一次 `site` 文件夹即可（Cloudflare Pages 会重新部署）
- 换了视频 → 覆盖 `assets/video/` 里的同名文件
- 改简历内容 → `about.html` / `experience.html` / `awards.html` 里直接改文字，数据口径和作品页要一致
