# 杨富超 · 个人作品集

护理学本科，做短视频、海外账号与 AIGC 内容。站点是纯静态的 HTML + CSS + 原生 JS，没有构建步骤、没有后端。

**在线预览**：https://yangfuchao-portfolio.app.workbuddy.host/?sharecode=QUETOGWFJZ

---

## 站点结构

```
index.html         首页：大图页头 · 战绩数字 · 数据跑马灯 · 精选作品（两段可播放）· 最新成片 · 能力
about.html         关于我：右侧竖版人像页头 · 影像记录
experience.html    经历与项目：竖向时光轴，滚动时红线生长
skills.html        技能工具：工具矩阵 · 自建工作台（含 97 秒界面演示）
works.html         作品展示：精选大屏轮播 · 10 件作品 · AI 短片四支 · 后台数据
awards.html        荣誉证书：九张证书 3D 环绕
friends.html       死党们：九张精选环绕 + 22 张照片墙 + 大图翻页
contact.html       联系我：右侧人像页头 · 求职与合作方向
404.html           走丢页
```

```
assets/
├─ css/style.css     全站样式（设计变量在 :root）
├─ js/main.js        菜单 / 筛选 / 轮播 / 证书环绕 / 照片墙 / 视频播放
├─ img/              页头图、封面帧、证书、22 张照片
└─ video/            六段成片 mp4（48MB）
```

`_headers` 是静态资源长缓存配置（Cloudflare Pages / Netlify 通用）；`SITE-README.md` 是站点内部的开发说明。

## 本地预览

```bash
cd gh-site
python -m http.server 8080
# 打开 http://localhost:8080
```

直接双击 `index.html` 也能看（`file://` 下所有交互都可用）。

## 部署（三选一，都是免费）

**GitHub Pages**（最省事）
仓库 Settings → Pages → Source 选 `main` 分支、根目录 `/`，得到 `https://<用户名>.github.io/<仓库名>/`

**Cloudflare Pages**（推荐，国内速度一般但可用）
Workers & Pages → Create → Pages → Connect to Git → 选本仓库；Framework preset 选 None，构建命令留空，输出目录填 `/`

**Vercel**
Add New → Project → 选本仓库 → Framework 选 Other，构建命令留空，输出目录 `/`

## 关于数据

站内所有数字（播放量、涨粉、业绩排名、荣誉数量）均来自本人后台截图，口径统一为「单条 / 最高」，不写账号总量；后台截图页标注了原始来源。三段抖音与 TikTok 数据口径说明见 `works.html` 的「同样是单条内容，海外那条跑了 15 倍」一节。

视频为本人原创 AIGC 成片，其中四支短片为生成式作品，页面已标注「AI 重绘 / AI 短片」。
