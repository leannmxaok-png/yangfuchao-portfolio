# 改字后台怎么用

网站是纯静态的，没有服务器，所以「后台」用的是 **Git-based CMS** 的思路：
把要改的文字抽到 `content/site.json`，用 **Pages CMS** 登录 GitHub 去改，保存后自动提交回仓库，GitHub Pages 一分钟内重新发布。

**好处**：不用买服务器、不用数据库、改错了能一键回滚。

---

## 一、第一次配置（只做一次，5 分钟）

1. 打开 **https://app.pagescms.org**
2. 点 **Sign in with GitHub**，授权登录
3. 点 **Add project** / **Install GitHub App**，选择你的仓库 `yangfuchao-portfolio`
4. 回到 Pages CMS，左侧会出现「网站文案」，点进去就能看到「首页首屏」「关于我 · 自述四段」两组字段

> 如果提示读不到配置，检查仓库根目录有没有 `.pages.yml`（已经放好了）。

---

## 二、日常改字

1. 进 Pages CMS → 左侧「网站文案」
2. 改文本框里的字
3. 点右上角 **Save**（等于 git commit）
4. 等 30–60 秒，刷新网站就看到了

**能写什么标签**

| 想做的效果 | 写法 |
|---|---|
| 换行 | `<br>`
| 某个词变红（毛笔字风格） | `<em>内容</em>` |
| 某个词变白加粗 | `<b>云南中医药大学护理学</b>` |

> 这些标签只对已经用了对应样式的元素生效（比如主标题里的 `<em>` 才是红色）。

---

## 三、目前能改的东西

| 位置 | 字段 |
|---|---|
| 首页首屏大标题 | `hero.title` |
| 首页首屏三行介绍 | `hero.sub` |
| 首页右下角那句话 | `hero.quote` |
| 关于我 · 自述标题 | `about.h2` |
| 关于我 · 自述三段 | `about.p1` / `p2` / `p3` |

**其余文字（作品、经历、荣誉、技能）暂时还要改 HTML** —— 那些内容和图片、链接、动画绑定得比较紧，抽成后台字段容易改坏结构。需要的话可以逐个页面加，告诉我优先哪页。

---

## 四、想加一个新的可编辑字段

三步，都在仓库里改：

1. `content/site.json` 里加一个 key，例如
   ```json
   "contact": { "note": "简历与作品集可邮件索取，通常一天内回复。" }
   ```
2. `contact.html` 里给那个元素加标记
   ```html
   <p class="contact-block__note" data-t="contact.note">简历与作品集可邮件索取……</p>
   ```
3. `.pages.yml` 里加字段定义
   ```yaml
   - name: contact
     label: 联系页
     type: object
     fields:
       - name: note
         label: 备注那行
         type: text
   ```

保存后，Pages CMS 里就会出现这个新字段。

> **注意**：HTML 里保留原来那段文字，它是"兜底值" —— 万一 JSON 没加载出来（比如你在本地双击打开 html），页面照样正常显示。

---

## 五、出问题怎么办

| 情况 | 处理 |
|---|---|
| 改完网站没变 | 等 1 分钟（Pages 构建），再强制刷新 Ctrl+F5 |
| 改坏了想回退 | GitHub 仓库 → Commits → 找到那次提交 → Revert |
| CMS 提示权限不足 | 重新在 Pages CMS 里授权仓库（GitHub App 权限） |
| JSON 格式写错了 | 页面会自动回退到 HTML 里的原文，不会白屏 |

---

## 备用方案：直接改 HTML

不想用 CMS 也可以直接改仓库里的 `index.html` / `about.html`，效果一样 —— 只是要小心别删到标签。
