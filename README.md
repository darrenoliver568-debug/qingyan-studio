# QingYan Studio Portfolio v1.0 — Home MVP

> AI 原生个人作品集，展示 AI Product Design、Workflow Engineering、Creative Exploration 三个方向的实践。
> 本轮范围：**仅 Home MVP + 三个项目 Placeholder 详情页**。内页内容在 Human Review 后再补充。

## 技术栈

- 纯静态 HTML / CSS / JavaScript
- 无构建步骤、无框架依赖
- 设计系统由 CSS 自定义属性实现（见 `assets/css/main.css` 开头 Token 区）
- Google Fonts CDN（Noto Serif SC / Noto Sans SC / Cormorant Garamond），带系统字体回退

## 本地预览

任选一种方式：

### 方式 A：Python 静态服务器（推荐）

```bash
# 在项目根目录（Desktop/作品集）执行
python -m http.server 8080
```

浏览器访问：http://localhost:8080

### 方式 B：npx serve

```bash
npx serve .
```

### 方式 C：VS Code Live Server

在 VS Code 中打开 `index.html`，右键 → “Open with Live Server”。

## 项目结构

```
作品集/
├── index.html                          # 首页 Home MVP
├── work/
│   ├── case-01-knowledge-extraction.html
│   └── case-02-creator-workflow.html
├── creative/
│   └── freedom-was-never-found.html
├── assets/
│   ├── css/main.css                    # 设计系统 + 响应式样式
│   ├── js/main.js                      # 头部滚动、移动菜单、滚动揭示
│   └── img/                            # 真实视觉素材
├── docs/
│   └── MISSING-ASSETS.md               # 缺失资产清单
└── README.md                           # 本文件
```

## 已使用真实资产

- `assets/img/freedom-storyboard-01.jpg`
  - 来源：`D:\freedom\分镜\1.png`
  - 用途：Creative Lab 主打项目《自由不是寻找》视觉展示
  - 处理：用 ffmpeg 缩放为 1600px 宽、JPG 压缩以适合网页

- `assets/img/freedom-character-sheet.jpg`
  - 来源：`D:\freedom\zfjnxb81387v_A_silver-haired_girls_expression_sheet...`
  - 用途：Freedom 项目 Placeholder 详情页
  - 处理：用 ffmpeg 缩放为 1200px 宽、JPG 压缩

## 设计系统：Modern Oriental Minimalism

| 令牌 | 色值 | 用途 |
|------|------|------|
| 墨黑 Ink | `#111111` | 主文字、深色区块背景 |
| 米白 Rice | `#F5F1E8` | 主背景 |
| 青灰 Teal | `#7A8B8B` | 次级文字、说明 |
| 低饱和金 Gold | `#C8A96A` | 强调、标签、Section Number |

字体：

- 中文标题：Noto Serif SC（思源宋体）
- 中文正文：Noto Sans SC（思源黑体）
- 英文点缀：Cormorant Garamond 斜体 / Inter 小号大写

## 实现原则

- 中文为主要信息语言；英文仅用于品牌标题、Section Label、项目英文名、Tag、简短副标题。
- 不虚构项目数据、成果、联系方式或个人经历。
- 已明确标注每个项目的真实状态（已验证 / 迭代中 / 视觉开发中）。
- Placeholder 页面写清了“未来将补充什么”以及“现有真实资产在哪”。

## 下一步（等待 Human Review）

1. 确认联系方式后更新 Contact 区域。
2. 确认是否展示个人照片、履历、真实姓名。
3. 补充 Case 01 详情页：真实 SRT/TXT 样本、下一阶段边界设计。
4. 补充 Case 02 详情页：真实选题、脚本版本、发布复盘。
5. 补充 Freedom 详情页：更多分镜、最终成片或预告片嵌入。
6. 迁移/重组旧视频作品集网站内容（URL/path 待提供）。
7. 决定部署目标（GitHub Pages / Vercel / Cloudflare Pages 等）。

---

v1.0 MVP · 2026 · QingYan Studio
