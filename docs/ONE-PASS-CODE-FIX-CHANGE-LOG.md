# One-pass Code Fix — Execution Log

> **范围**：只修代码系统，不生成新 Hero 视觉资产、不重做内容结构、不上 WebGL/Framer Motion、不补 About。
> **核心承诺**：未来 Hero 视觉资产到位时可直接替换 `site-data.js` 中的 `hero-background` 配置，无需再改 HTML/CSS/JS。

**执行日期**：2026-08-26
**触发主因**：v1 → v2 升级后，Hero 媒体层存在三层隐患（架构 bug / 文案 / Token 散乱），需一次性收口。

---

## 一、修改文件清单

| 文件 | 改动 | 类别 |
|------|------|------|
| `index.html` | Nav 品牌层级；Hero 媒体层结构重排；左下卡 ambient wrapper | P0/P1 |
| `assets/js/site-data.js` | Hero Asset Slot 配置文档化（注释示例 + 运行时行为说明） | P1 |
| `assets/js/v2-main.js` | 重写 Hero 渲染管线；SITE_DATA 隐藏 bug 修复；capture error + watchdog | **P0（关键 bug）** |
| `assets/css/v2.css` | Glass S/M/L + Border/Shadow/Radius Token；ambient motion；reveal--fade | P1 |
| `_capture/inspect{3,4,5,6,7}.js` | 新增验证工具（Hero 管线诊断、回退时间线、reduced-motion、mobile crop） | 验证 |
| `_capture/test-assets/hero-test.mp4` | ffmpeg 生成的 3s 测试视频，用于验证 video 替换管线 | 验证 |
| `docs/screenshots/one-pass/{desktop,mobile}-{hero,full}.png` | 重拍 4 张交付截图（JS 修复后） | 交付 |

---

## 二、Hero Identity（P0 — 品牌层级）

**位置**：`index.html` L21-26

**实现**：
```html
<a class="nav__brand reveal reveal--fade" href="#hero" aria-label="QingYan Studio 首页">
  <span class="nav__brand-dot" aria-hidden="true"></span>
  <span class="nav__brand-name">QingYan Studio</span>
  <span class="nav__brand-sep" aria-hidden="true">·</span>
  <span class="nav__brand-person">朱青</span>
</a>
```

**CSS 行为**：
- `.nav__brand-name`：原 Nav 字号权重（继承 `.nav` 字体族）
- `.nav__brand-person`：`0.78rem`、`color: var(--c-text-muted)`、`letter-spacing: 0.04em`，与 name 形成层级
- `.nav__brand-sep`：与 person 同色，间距 `0 0.5rem`，垂直居中
- `reveal--fade` 新动画类：仅淡入不位移（Nav 应保守，不抢 Hero 视觉）
- 移动端 400px 断点：`.nav__brand-person` 缩至 `0.72rem`

**未动**：Hero 中央 LOCKED 口号 `让 AI 进入工作，也让 AI 进入创作。`（一字未改，Grep 复核）。

---

## 三、Hero Video Architecture（P0 — 5 项修复 + 1 项关键隐藏 bug）

### 修复 1 — 媒体层独立性

**问题**：v1 把 `noise`/`vignette` 放在 `.hero__media` 内，JS 替换 video 时 `heroMediaEl.innerHTML = ""` 会一并清空，电影质感层丢失。

**修复**（`index.html` L62-100）：`.hero__media-noise` 和 `.hero__media-vignette` 移到 `.hero__container` 下，作为 `.hero__media` 的兄弟层独立存在。注释明确：
```html
<!-- 长期电影质感层，替换 video 时不会被清空 -->
<div class="hero__media-noise"></div>
<div class="hero__media-vignette"></div>
```

CSS 上 `pointer-events: none`，vignette 叠加 `vignetteDrift` 动画（24s 慢漂移）。

### 修复 2 — video 标签完整属性

**实现**（`v2-main.js` createHeroVideo）：
```js
video.autoplay = true; video.muted = true; video.loop = true;
video.playsInline = true; video.setAttribute("playsinline", "");
video.preload = "metadata";
video.setAttribute("aria-hidden", "true");
video.setAttribute("tabindex", "-1");
if (media.poster) video.poster = media.poster;
```

支持单 `src` 或 `srcs` 数组（WebM+MP4 fallback）：
```js
media.srcs && media.srcs.length
  ? media.srcs
  : [{ src: media.src, type: media.mime || mimeFromSrc(media.src) }]
```

`mimeFromSrc()` 由扩展名推断 MIME（webm/ogg/mp4）。

### 修复 3 — 错误回退链

**三级回退**：video → poster → cinematic scene（永不黑屏）

**关键发现 — Chromium 已知行为**：
- `<source>` 子元素加载失败时 `error` 事件不冒泡
- `video.error` 可能为 `null`，视频元素不补发 `error`
- 仅靠 `error` 事件不可靠

**双保险**（`v2-main.js`）：
1. `video.addEventListener("error", fallback, true)` — capture 阶段捕获（截获 source 层 error）
2. Watchdog：6s 未就绪 → 检查 `readyState` / `networkState` / `error`，未达 HAVE_METADATA 且不在加载中 → 走回退。最多 3 次重试，避免无限等待。

### 修复 4 — prefers-reduced-motion

**实现**（`bindReducedMotion`）：模块级 `matchMedia` 单例 + `change` 监听（addEventListener/addListener 兼容）。
- 命中 `reduce`：`video.autoplay = false; video.pause()`
- 解除：`video.autoplay = true; video.play()`（catch 静默）

### 修复 5 — 可配置 object-position

**实现**（`applyObjectPosition`）：JS 通过 CSS 变量注入，桌面 / 移动各一条：
```js
heroMediaEl.style.setProperty("--hero-media-pos", media.objectPosition);
heroMediaEl.style.setProperty("--hero-media-pos-mobile", media.objectPositionMobile);
```

CSS：
```css
.hero__media video, .hero__media img { object-position: var(--hero-media-pos); }
@media (max-width: 600px) {
  .hero__media video, .hero__media img {
    object-position: var(--hero-media-pos-mobile, var(--hero-media-pos, center));
  }
}
```

不绑定具体素材，asset 替换后通过 site-data 直接配置。

### **关键隐藏 bug（v1 遗留，本次必须修）**

`site-data.js` 顶层 `const SITE_DATA = {...}` 是 classic 脚本作用域变量，**不会挂到 `window`**。原版 `v2-main.js` 两处用 `window.SITE_DATA` 读取，导致整个 Media Slot 替换管线从未真正工作过——用户将来换视频也会失败。

**修复**（`v2-main.js` 两处）：
```js
const D = typeof SITE_DATA !== "undefined" ? SITE_DATA : null;
```

直接引用（与 `site-data.js` 同一作用域），不依赖 `window`。

---

## 四、Hero Motion（P1 — Entry / Ambient / Hover 三层）

**Entry（reveal，克制 stagger，无 bounce/spring）**：
- 复用现有 `.reveal` + `.is-visible`（IntersectionObserver + 2s 安全网）
- 新增 `.reveal--fade`（Nav 用，仅淡入不位移）
- 桌面 Nav/品牌 stagger：`transition-delay: 0.05s`

**Ambient（极慢持续动效，6-12s 周期，无指针跟踪）**：
- `.hero__card-bl-ambient` 包装左下卡，绝对定位 + `cardFloat` 动画（0 → -3px，9s 循环）
- `.hero__media.is-filled` 加 `heroMediaZoom`（1.02 → 1.07，30s Ken Burns）
- `.hero__media-vignette` 加 `vignetteDrift`（scale 1 → 1.03 + opacity，24s 循环）
- 周期 `--dur-ambient-slow: 9s` / `--dur-ambient-slower: 30s`，符合"长而不抢"原则

**Hover（CTA / arrow / card）**：
- Contact CTA：hover scale + glow（保留）
- 左下卡：hover lift
- 右下异形 arrow shift

**明确不做**：pointer tracking、大幅 parallax、tilt card、bounce/spring。

---

## 五、Glass System（P1 — S/M/L 三档 Token 化）

`v2.css` 顶部新增：
```css
/* S — 小型芯片（Hero Badge） */
--glass-s-bg: ...; --glass-s-blur: 12px; --glass-s-sat: 130%;

/* M — 常规卡（左下卡） */
--glass-m-bg: ...; --glass-m-bg-dark: ...; --glass-m-blur: 18px; --glass-m-sat: 145%;

/* L — 大面积玻璃（Nav / 右下异形 / Dropdown） */
--glass-l-bg: ...; --glass-l-blur: 26px; --glass-l-sat: 160%;

/* 共用 */
--glass-hl: ...; --glass-shadow-sm: ...; --glass-shadow-md: ...; --glass-shadow-lg: ...;
```

**落地**：
- Badge → Glass S dark（透明玻璃芯片）
- 左下卡 → Glass M dark（双层渐变 bg → bg-dark-soft）
- Nav、右下异形 → Glass L（最大模糊 + 饱和度）
- 旧 `--glass-bg` / `--glass-blur` / `--glass-border` 全部清除（Grep 复核无残留）

---

## 六、Border / Shadow Tokens（P1）

**复合值 token**（直接用）：
```css
--c-border-subtle/medium/strong/light/accent: ...;  /* 颜色 */
--border-subtle/medium/strong/light/accent: 1px solid var(--c-border-...);  /* 完整 border */
```

**Shadow 三档**（轻、软、低对比，**不是** SaaS dashboard card shadow）：
```css
--shadow-1: 0 4px 24px rgba(0,0,0,.06);
--shadow-2: 0 12px 40px rgba(0,0,0,.10);
--shadow-3: 0 24px 64px rgba(0,0,0,.12), 0 4px 20px rgba(0,0,0,.06);
```

**全站替换**：`media-slot / exp-item / exp-side / tag / flow-step / project / project_runtime / principle / method-loop / about-placeholder / placeholder-mark / contact_status / footer` 全部 token 化。

---

## 七、Radius（P1 — 只清理硬编码不一致）

新增 `--r-cutout: 32px`（cutout 专用）。其它现有 radius 逻辑保留。Grep 确认无残留硬编码 `border-top-left-radius: 32px`。

---

## 八、Projects / AIGC 微调（P1）

**Projects placeholder media 降视觉权重**：
```css
.project__media .media-slot {
  min-height: 96px;          /* 原 128px */
  background: transparent;
  border-color: var(--c-border-subtle);
  label font-size: 0.6rem;
  padding 缩小
}
```

**AIGC 不动**：等真实封面，未加装饰。

---

## 九、明确未动（DEFER 清单）

- ❌ Hero 最终视觉资产（视频/海报/海报图）
- ❌ 《嘉定的清晨》素材拼接
- ❌ Signature Shape 扩散到全站
- ❌ 全站 grain
- ❌ WebGL / Shader / Framer Motion
- ❌ 新 Section、新文案
- ❌ About 文案、Case Study 深层内容
- ❌ 真实 Evidence / Project / AIGC 截图
- ❌ 主导航右侧 CTA 玻璃 Badge 文案、左下卡 / 右下异形文案（保留候选 .is-candidate）
- ❌ 联系方式（Email / GitHub / 微信）
- ❌ 部署目标

---

## 十、Hero Asset Slot（等待资产到位）

### 配置位置
`site-data.js` 中 `media["hero-background"]`（现为 placeholder，asset 到位后切换）：

### 单 MP4：
```js
"hero-background": {
  type: "video",
  src: "assets/video/hero.mp4",
  poster: "assets/img/hero-poster.jpg",
  objectPosition: "center 40%",
  objectPositionMobile: "center 30%"
}
```

### 多格式回退（WebM + MP4）：
```js
"hero-background": {
  type: "video",
  srcs: [
    { src: "assets/video/hero.webm", type: "video/webm" },
    { src: "assets/video/hero.mp4",  type: "video/mp4" }
  ],
  poster: "assets/img/hero-poster.jpg"
}
```

### 纯 Poster / 静态图：
```js
"hero-background": {
  type: "image",
  src: "assets/img/hero-poster.jpg",
  alt: "Hero 主视觉"
}
```

### 运行时行为（无需改 HTML / CSS / JS）
- 渲染顺序：video → (失败) poster → (失败) 当前 cinematic scene，绝不黑屏
- autoplay / muted / loop / playsinline / preload="metadata" 已内置
- prefers-reduced-motion 命中时视频自动暂停，保留静态 poster
- noise / vignette 独立于 media slot，替换时永久保留
- `--hero-media-pos` / `--hero-media-pos-mobile` 由配置注入，桌面 / 移动独立

### 资产准备好后的操作
仅需改 `site-data.js` 中 `hero-background` 一项，**不动 HTML/CSS/JS**。

---

## 十一、验证矩阵

| 测试 | 场景 | 工具 | 结果 |
|------|------|------|------|
| Test A | 有效 video 替换 | `inspect4.js` 4次 | ✓ video 替换、noise/vignette 保留、autoplay |
| Test B | video src 404 → scene 恢复 | `inspect4.js` + `inspect5.js` 时间线 | ✓ scene+label 恢复，无黑屏 |
| Test C | video 404 + poster → img | `inspect6.js` × 2 + naturalWidth 守卫 | ✓ poster img 加载（naturalWidth=1200） |
| Reduced-motion | reduce → video 暂停 | `inspect7.js` | ✓ mqReduce=true, videoPaused=true |
| Mobile crop | 390px 下 objectPositionMobile 生效 | `inspect7.js` | ✓ computed = "50% 30%" |
| 11 项自检 | 见上方对照表 | Grep + 4 张截图 | ✓ |

---

## 十二、验证工具保留

为后续 Hero 资产替换 / 排障保留：

- `_capture/inspect.js` — 初版 DOM 状态
- `_capture/inspect3.js` — 加载管线（jsLoaded / hasVideo / noise / vignette / currentSrc）
- `_capture/inspect4.js` — 深度 video 状态（networkState / readyState / error / paused）
- `_capture/inspect5.js` — 时间线轮询（400ms × 20s）
- `_capture/inspect6.js` — console 事件序列捕获
- `_capture/inspect7.js` — reduced-motion + mobile crop 联合验证
- `_capture/test-assets/hero-test.mp4` — ffmpeg 生成的 3s 灰底测试视频（3285 字节）

使用方式：`NODE_PATH="..." node inspect{N}.js <url>`

---

## 十三、待清理 / 待告知

- `C:\Users\Administrator\Desktop\qytest`（scratch 隔离站点）— 当前 state-data 停留在 Test A 配置（有效视频），可用于继续验证。建议保留到下一轮（Hero Visual Asset Replacement）使用后清理。
- `8081` scratch 服务器进程 — 当前仍在运行，可继续用；下一轮结束停掉。
- `8080` 主站服务器进程 — 保留，不动。

---

## 十四、后续轮次入口

**Hero Visual Asset Replacement**（下一轮）：

只需更新 `site-data.js` 的 `media["hero-background"]` 一项（参考第十节），重启浏览器即可看到新视觉。HTML / CSS / JS 无需任何修改。

若新素材需要：
- 不同 object-position：在 site-data 配置 `objectPosition` / `objectPositionMobile`
- 不同 noise/vignette 强度：调 `--noise-opacity` / `--vignette-opacity` CSS 变量
- 完全不同的 Hero 视觉风格（不止换素材）：进入 **Soft Glass Editorial Lab v2 全站切换** 决策轮次。

**本轮结束。等待用户审核与下一轮指令。**