# 图片素材 · 编号与用途

本目录下的图已全部接入页面，文件名即用途。换图时按同名替换即可，尺寸建议不变。

## 页头背景

| 文件 | 用在 | 建议尺寸 |
|---|---|---|
| `hero-home.jpg` | index.html 首页大图 | 1920×1081 |
| `hero-works.jpg` | works.html 页头 | 1920×1081 |
| `hero-awards.jpg` | awards.html 页头 | 1920×1081 |
| `hero-skills.jpg` | skills.html 页头 | 1920×1081 |
| `hero-about.jpg` | about.html 页头（右侧竖图） | 竖版 1200×1468 |
| `hero-exp.jpg` | experience.html 页头（右侧竖图） | 竖版 1200×1499 |
| `hero-contact.jpg` | contact.html 页头（右侧人像） | 竖版 1440×1920 |
| `hero-friends.jpg` | friends.html 页头（右侧红底海报） | 竖版 1000×1702 |

竖版那几张（`hero-about` / `hero-exp` / `hero-contact` / `hero-friends`）在页头里是**右侧整块竖着放**，不要再裁成横带——裁掉的部分回不来，换图时直接整张缩放保存即可。`hero-friends` 是红底孙悟空，块底色跟图里的红一致（`.hero--side--red`），所以换同色系的图时才不会露白边。原来那张「大学男篮横切一条」已被这张替换，源图在本地 `_media/build_life.py` 里，需要时可以随时再生成。

## 人像与现场

| 文件 | 用在 | 建议尺寸 |
|---|---|---|
| `portrait-studio.jpg` | about.html 影像记录 01 | 竖版 3:4 |
| `portrait-suit.jpg` | about.html 影像记录 02 | 竖版 3:4 |
| `portrait-sea.jpg` | about.html 影像记录 03 | 竖版 3:4 |
| `event-04.jpg` | about.html 影像记录 04 | 方图，会裁成 3:4 |
| `event-01/02/03.jpg` | about.html 现场 | 横版 3:2 |

## 界面截图

| 文件 | 用在 | 说明 |
|---|---|---|
| `ui-manju.jpg` | 首页精选 · AI 漫剧工作台、works 页、skills 页 | 深色，不用压暗 |
| `ui-studio-home.jpg` | works 页、skills 页 | 浅色，已做饱和度增强（1.45）+ 对比 1.14，卡片里再压到 0.84 |
| `ui-studio-publish.jpg` | 首页精选、works 页、skills 页 | 浅色，同上 |
| `sns-tiktok.jpg` | works 页 · 后台数据（手机样机） | 竖版，原图已做过水平翻转校正 |
| `sns-douyin.jpg` | works 页 · 后台数据（手机样机） | 竖版 |

## 视频封面

`video-01.jpg` — `video-04.jpg`，从 AIGC 片子里抽的帧，用在首页精选与 works 页的作品卡，16:9。

`video-05.jpg` — `PICC 居家护理动画`的画面帧，用作该片的封面与首页成片横条的海报（1280×714）。

`bench-demo.jpg` — AI 漫剧工作台演示视频的界面帧，用作技能页与作品页里那张卡的封面（1280×720）。

`film-01.jpg` 到 `film-04.jpg` — 四支 AI 短片的封面帧（各 1280 宽），与 `assets/video/short-film-0*.mp4` 一一对应，**换片时编号别错位**。

成片文件本体在 `assets/video/`：

| 文件 | 内容 | 时长 | 大小 |
|---|---|---|---|
| `picc-care.mp4` | PICC 置管后居家护理（3D 动画） | 1′38″ | 16MB |
| `workbench-demo.mp4` | AI 漫剧工作台界面演示 | 1′37″ | 5.3MB |
| `short-film-01.mp4` | 想回家的孩子 | 3′07″ | 13MB |
| `short-film-02.mp4` | 护眼科普短片 | 2′18″ | 7.6MB |
| `short-film-03.mp4` | 红围巾的孩子 | 55″ | 3.3MB |
| `short-film-04.mp4` | 云上的巨眼 | 29″ | 4.5MB |

原片是 HEVC 或 12Mbps 高码率，浏览器放不了，仓库里存的都是转码后的 H.264 版本（`+faststart`，可边下边播）。

`book.jpg` 例外：校园二手书回收的现场实拍（1215×678，405:226），works 页作品卡封面，卡片里会再压暗到 0.85。

## 证书

`cert-01-cpr.jpg` 到 `cert-09-nursing-1.jpg`，九张原件扫描，awards 页按时间排列。

## 死党页照片（`life/`）

`life/life-01.jpg` 到 `life-22.jpg`，22 张合照与球场照，长边统一压到 1400（合计约 3.2MB）。

- 顺序就是页面上的编号，**别改名**：文件名和 `life-card__n` 里的编号要对得上
- 原图有横有竖，页面不裁切，按原始比例排进瀑布流
- 每张的 `width`/`height` 写在 HTML 的 `<img>` 上，瀑布流靠它算高度，换图后要一起改
- `life-12` 到 `life-15` 是 AI 重绘版（原图太糊），页面上带「AI 重绘」角标；换回真实照片时记得把角标删掉
- 环形区那九张是同一批图的精选，改图号要同时改 `friends.html` 里的 `ring__card`

## 界面截图的调色

两张浅色后台截图（`ui-studio-home` / `ui-studio-publish`）原始状态是发灰的：平均 RGB 接近 228/224/221，饱和度很低，直接放进深色版面会像蒙了一层白。处理顺序：

```python
im = ImageEnhance.Color(im).enhance(1.45)      # 提饱和
im = ImageEnhance.Contrast(im).enhance(1.14)   # 拉开对比
im = ImageEnhance.Brightness(im).enhance(0.98) # 压一点白
im = im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=70, threshold=3))
```

原图备份在 `_media/raw/ui/`。CSS 那边也要跟上：`is-ui` 的 `saturate` 不能低于 1，否则压暗之后又灰回去了。

## 格式约定

- 全部 JPEG，单张 ≤ 450KB，全站合计约 4MB
- 整体偏暗、低饱和更贴这套黑红风格
- 证书与证件类图片对外发布前请自行确认是否需要对学号等信息做遮挡
