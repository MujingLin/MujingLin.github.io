# 林沐菁作品集｜内容修改指南

网站的内容、样式和交互已经分开。日常更新只需要进入 `content/`，不必修改页面代码。

## 只需记住这 6 个文件

| 页面 | 英文 | 中文 |
| --- | --- | --- |
| Profile | `content/profile.en.md` | `content/profile.zh.md` |
| Works | `content/works.en.md` | `content/works.zh.md` |
| Compass | `content/compass.en.md` | `content/compass.zh.md` |

英文和中文应成对修改。文件都是普通 Markdown，可以直接用文本编辑器打开。

## Works：替换视频

找到这样的单行：

```md
[youtube:ceTmc52ua9E]
```

只替换冒号后面的 YouTube Video ID。不要粘贴整段 iframe，也不用修改播放器代码。

例如视频地址是：

```text
https://www.youtube.com/watch?v=abc123
```

则写成：

```md
[youtube:abc123]
```

一个作品可以连续放多个 `[youtube:...]`。

## Works：新增或删除作品

每个作品都是一个独立区块：

```md
<!-- media: track=23 chapter=narrative -->
## Film Title

[youtube:YOUTUBE_VIDEO_ID]

Film description.
```

- `track=23`：作品编号，不能与其他作品重复。
- `chapter=`：填写 `aigc`、`narrative`、`exhibition`、`reality` 或 `other`。
- 新增：复制整个区块，修改编号、标题、视频 ID 和文案。
- 删除：删除从 `<!-- media: ... -->` 到下一个作品标记之前的全部内容。
- 排序：移动整个区块。
- 英文与中文文件的编号、篇章、视频和顺序必须一致。

## Profile：修改简介与奖项

直接编辑 `profile.en.md` 和 `profile.zh.md`：

- `#` 后面是页面标题。
- 图片写法是 `![说明](/images/文件名)`。
- 普通段落可直接修改。
- 奖项以 `-` 开头；复制一行即可增加，删除整行即可移除。

CV 文件固定为 `file/CV.pdf`，使用同名 PDF 替换即可。邮箱入口位于 Profile 文件的 `profile-actions` 区块中。

## Compass：新增或删除卡片

每个 `##` 标题会自动生成一张事件卡片：

```md
## July 2026 | Event Title

![Image description](/images/compass/image-name.webp)

Short description.
```

- 新增：复制一个完整的 `##` 卡片区块。
- 删除：删除从该 `##` 到下一个 `##` 之前的全部内容。
- 排序：移动整个卡片区块。
- 一张卡片可以连续放多张图片。
- 图片放入 `images/compass/`，网页不会自行裁切。

## 更换背景、猫咪图标或首页视频

- 首页视频：`backgroundimage/home-cat-video.mp4`
- 手机轻量视频：`backgroundimage/home-cat-video-mobile.mp4`
- 首页视频封面：`backgroundimage/home-cat-video-poster.jpg`
- 页面背景和猫咪图标：`backgroundimage/`
- Profile 头像：`images/mujing.jpg`
- CV：`file/CV.pdf`

三个桌面页面的背景文件路径集中在 `assets/js/portfolio-data.js` 的 `assets` 中。

## 自动检查

运行：

```sh
npm run validate:content
```

网站会检查 Works 的中英文编号、篇章、视频和排序，Compass 的卡片数量，以及 Profile 的必要入口。检查通过后再发布，可避免增删内容时破坏页面结构。

## 私人访问统计

`assets/js/analytics.js` 只加载 Counter.dev。它不会在页面中显示任何统计组件，也不会统计 localhost 本地预览。

- Counter.dev 后台：`https://counter.dev/`

统计后台受各自账号登录保护。不要把账号密码或恢复信息写进网站文件。

## 不需要日常修改的文件

- `assets/js/portfolio.js`：页面交互与内容渲染
- `assets/css/portfolio.css`：视觉样式
- `assets/vendor/`：第三方动画库
- `scripts/`：构建和自动检查

## 原始网页归档

旧版 Jekyll 网页代码完整保存在 `_legacy-site/`。该目录不参与新站构建，
也不会出现在公开发布包中。维护新作品集时不需要修改其中的文件。
