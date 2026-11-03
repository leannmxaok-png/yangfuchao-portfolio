# 改内容怎么改

站点是纯静态的，没有服务器，「后台」用的是 GitHub 的 Contents API：
**在你自己的浏览器里编辑 → 直接提交到仓库 → GitHub Pages 一分钟内重新发布。**

---

## 一、项目详情后台（主要用这个）

**地址：https://me.yangfuchao.com/admin.html**

### 第一次：接上仓库

1. 生成一个 GitHub Token（只给这一个仓库的读写权限）
   - GitHub → 右上头像 → Settings → 左下 **Developer settings**
   - **Personal access tokens** → **Fine-grained tokens** → **Generate new token**
   - Token name 随便写（如 `my-site-admin`）
   - Expiration 选 90 天（到期再生成一个）
   - **Repository access** → Only select repositories → 勾 `yangfuchao-portfolio`
   - **Permissions** → Repository permissions → 找到 **Contents** → 改成 **Read and write**
   - 点 Generate token，复制那串 `github_pat_...`
2. 回到 admin 页面，粘进输入框 → 点「连接仓库」
3. Token 存在你这台电脑的浏览器里，下次打开不用再填

> Token 只存在本机 localStorage，不上传任何第三方。换电脑要重新填一次。

### 日常：改内容

后台左边分两块：**页面文案** 和 **四个项目**。

**A. 页面文案**（点左边第一项「页面文案」）

可改 11 处：首页大标题 / 三行介绍 / 右下角那句、关于我自述标题 + 三段、死党页九宫格标题和说明、照片墙标题和说明。

> 照片墙标题右边那个数字（22）是自动统计的照片数，不用写。

**B. 项目详情**（点左边四个项目之一）

- **卡片上显示的**：项目名称、时间、分类标签、一句话简介
- **点开后的详情**：背景（为什么做）、我的角色、我是怎么做的（一行一步）、结果（一行一条）、配图

配图：点「+ 上传图片」，选图后自动压缩到宽 1600 并上传，单张约 200–400KB。

**保存**：改完点右上角 **保存并发布**，等 30–60 秒刷新页面。

### 写详情的建议

| 板块 | 写什么 | 别写什么 |
|---|---|---|
| 背景 | 当时遇到的具体问题、为什么决定做 | 「为了锻炼自己」这种空话 |
| 我的角色 | 一个人干还是分工、负责哪几块 | 「参与其中」 |
| 我是怎么做的 | 分步骤，每步一个动作 | 罗列工具名 |
| 结果 | 具体数字、时间、对比 | 「效果不错」 |

---

## 二、Pages CMS（备用，手机上应急用）

**地址：https://app.pagescms.org**（GitHub 登录，选 `yangfuchao-portfolio`）

手机上不方便开 admin 页面时可以用它改首屏文案。字段定义在仓库根的 `.pages.yml`。

---

## 三、其他文字

作品卡、荣誉列表、技能标签这些还没接后台，要改直接编辑对应 HTML：

| 内容 | 文件 |
|---|---|
| 作品 | `docs/works.html` |
| 荣誉 | `docs/awards.html` |
| 技能 | `docs/skills.html` |
| 经历时间轴 | `docs/experience.html` |
| 联系 | `docs/contact.html` |

---

## 四、出问题怎么办

| 情况 | 处理 |
|---|---|
| 保存提示 **Token 无效或没权限** | Token 过期了，重新生成一个（Contents 必须 Read and write） |
| 保存提示 **409** | 两个人同时改。刷新页面重新连接，再保存 |
| 保存成功但网站没变 | 等 1 分钟；仍没变就 Ctrl+F5 强刷 |
| 改坏了想回退 | GitHub → Commits → 找到那次提交 → Revert |
| 图片传不上去 | 单张超过 1MB 会被拒，先自己压一下 |

---

## 五、安全

- admin 页面没有密码，但没有 Token 就什么都改不了
- Token 只在你浏览器里，别人拿到页面也调不动 API
- 建议每 90 天换一次 Token，旧的在 GitHub 里删掉
