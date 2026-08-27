# Hero Visual Implementation Plan

> QingYan Studio Portfolio v1.0
> 阶段：Visual Direction Validation / Hero Prototype
> 目标：验证 **Soft Glass Editorial Lab** 是否真的适合 QingYan Studio
> 状态：**待人类确认后再进入 Prototype 编码**

---

## 0. 先说结论（TL;DR）

1. 这是 **Hero 视觉系统的 v2 决策**，不是局部微调。
   现行设计系统是 **Modern Oriental Minimalism**（暖米白 #F5F1E8 + 墨黑 + 低饱和金 + 宋体中文）。
   新方向 **Soft Glass Editorial Lab**（冷灰底 #F0F0F0 + Glassmorphism + 视频 Hero + Neo-Grotesk 气质）是**另一套视觉语言**。
   两者在色温、字体气质、材质语言上几乎对位冲突。
2. **强烈建议**：本轮先做"隔离的 Hero Prototype 页面"（`/hero-prototype.html` 或 `/index.html?v=hero2`），不立即覆盖现有 home。验证通过后再决定是否整站切换。
3. 已有可用的真实视频素材够用，但**没有可直接作为 Hero 背景的现成 montage**。需要按本计划 §12 走"显式占位"或"精选 4–6 段 AIGC 短片"方案。
4. Hero 主标题文案已 **LOCKED**："让 AI 进入工作，也让 AI 进入创作。" — 整份计划所有候选文案均围绕这句展开，不替换、不修饰、不并置。

---

## 1. 项目现状速写（Preflight Read-Only）

### 1.1 资产清单

| 类别 | 已有 | 状态 | 备注 |
|------|------|------|------|
| 技术栈 | 纯静态 HTML/CSS/JS | ✅ | 无构建步骤，Google Fonts CDN 加载 Noto Serif/Sans SC + Cormorant Garamond |
| 当前主导航 | Selected Work / AI Lab / Creative / Method / About / Contact | 🟡 | 与本轮新定的 "Experience / Projects / AIGC Works / About" 不一致 — 不在本轮修改 |
| 当前 Hero | "构建以人为中心的 AI 系统" + SVG 装饰 | 🟡 | 与本轮 LOCKED 文案 "让 AI 进入工作，也让 AI 进入创作。" 不一致 — 不在本轮修改 |
| 字体 | Noto Serif SC / Noto Sans SC / Cormorant Garamond / Inter | ✅ | 全部 Google Fonts CDN，无需本地下载 |
| 真实图片 | 2 张 JPG（freedom-storyboard-01 / freedom-character-sheet） | ✅ | 暖色手绘 AIGC 风格，与冷灰新方向色温不一致，**不适合直接做 Hero 背景** |
| 真实视频 | 16 段 `D:\嘉定的清晨\*.mp4`（约 6–10MB/段）+ `一个人的雨夜.mp4` 30MB + 人生是一场游戏源片 10 段 | ✅ | 可拼接 6–10 秒 montage，但**没有 trailer-final.mp4** |
| Hero 视频 | 无 | ❌ | 必须用占位或显式标注 TEMP VISUAL REFERENCE |
| 联系方式 | 无 | ❌ | Contact 区域占位中 — 本轮不修改 |
| 个人照片 | 无 | ❌ | About 区域不展示 — 本轮不修改 |

### 1.2 关键判断

- **现成中文宋体（Noto Serif SC）不适合 Soft Glass Editorial Lab**。
  宋体 + 米色背景的"东方留白"语言 vs. 冷灰 + 玻璃 + 大字号无衬线，是两套气质。
  → 本轮 Prototype 必须验证中文 Neo-Grotesk 替代方案（详见 §8）。
- **现成 2 张 JPG 都是暖色 AIGC 插画**，不是 RIVR 那种 cinematic video。
  → 不能把它们直接做 Hero 背景。可考虑：视频用真实 AIGC 短片 montage；图片留作后续 AIGC Works 区域使用。
- **没有可直接用的 Hero 视频成品**。
  → Prototype 阶段必须明确区分"临时参考"与"最终素材"，绝不悄悄塞网络视频。

---

## 2. RIVR Hero 视觉语言提取

> 注：以下提取基于用户描述的视觉印象，**不复制其 DeFi 内容、品牌、数据、视觉素材**。

| # | 视觉特征 | 本质机制 | 适合 QingYan Studio？ |
|---|---------|---------|---------------------|
| 1 | 大面积动态视频作为 Hero 背景 | cinematic video, 慢速运动, 弱化色彩 | ✅ 适合（"AI × Creativity"需要动态感） |
| 2 | 浅灰色页面底色 | 冷灰中性底，#F0F0F0 量级 | ✅ 适合（与米白/暗色相比更"工作室"） |
| 3 | 超大圆角主容器 | 40–48px hero card | ✅ 适合（区分于传统 SaaS 小圆角） |
| 4 | 半透明 Glassmorphism | 20–60% white + backdrop blur | ✅ 适合，但要克制 |
| 5 | 克制的灰蓝文字 | #5E6470 量级低饱和冷灰 | ✅ 适合（与冷灰底色协调） |
| 6 | 极简导航 | 顶部 fixed 玻璃条，字号小 | ✅ 适合 |
| 7 | 中央大 Typography | clamp 字体 + 紧凑 tracking | ✅ 适合 Editorial 感 |
| 8 | 小型玻璃 Badge | 居中 pill，glass 材质 | ✅ 适合（用来承载候选 AI × Product × Creativity） |
| 9 | 左下角悬浮信息卡 | Active Yielders 类信息卡 | ⚠️ 部分适合（结构可借鉴，**数据要替换**为真实作品集信息） |
| 10 | 右下角 faux-cutout | 挖空式异形信息块 | ✅ 适合（这是 RIVR 最有辨识度的特征之一，必须保留） |
| 11 | 轻进入动画 | fade + scale 0.98→1 | ✅ 适合 |
| 12 | 高端 / 干净 / 未来感 | 整体气质 | ✅ 适合 |
| 13 | ❌ 紫蓝渐变 / 粒子 / 机器人 | "俗套 AI 视觉" | ⛔ 明确不采用 |
| 14 | ❌ DeFi 数据/品牌 | 业务内容 | ⛔ 不复制 |
| 15 | ❌ 高饱和科技蓝 / 霓虹紫 / 荧光 | 赛博风 | ⛔ 不采用 |

**提取的关键设计原则（不是复制像素）：**

1. **冷灰中性底** + **冷灰低饱和文字** = 工作室 / Lab 气质
2. **视频 + 玻璃叠加** = 把"AI 进入创作"从抽象口号变成可感知的视觉
3. **超大圆角主容器 + 异形 faux-cutout** = 区分于普通 SaaS 落地页
4. **左下小卡 + 右下异形** = 在 hero 内部建立 editorial 式信息层级
5. **中央大字号 + 紧 tracking** = "创作者 / 作品集"而非"创业公司"

---

## 3. 不照搬的元素清单

| 不照搬 | 原因 |
|--------|------|
| RIVR 品牌名、Logo、配色（品牌蓝/绿/紫渐变） | 不是 QingYan Studio 品牌 |
| DeFi 数据、Yield、APY、Vault 卡片内容 | 业务与 QingYan 无关 |
| 链上图表、链上交互控件 | 假数据会污染作品集 |
| RIVR 字体（如果来源不明的 Helvetica 商业字体） | 必须用 Google Fonts / 系统可商用字体 |
| 任何 RIVR 真实视频帧 / 视觉素材 | 不直接用第三方品牌资产 |
| 居中大段营销文案 | QingYan 是个人 Studio，需要克制 |
| 任何形式的"AI SaaS 模板感"（CTA 上方一坨渐变按钮 / 100+ feature 图标） | 主动反 SaaS 模板 |

---

## 4. QingYan Studio Hero 最终组件结构

### 4.1 Desktop 组件树

```
<section class="hero" id="hero">
  ├── <video> (cinematic background, 静音, autoplay, loop, muted, playsinline)
  │     └── TEMP VISUAL REFERENCE — REPLACE BEFORE RELEASE (覆盖标签)
  ├── <div class="hero__overlay"> (white glass 6% + noise 微纹理)
  │
  ├── <header class="site-header"> (fixed 玻璃条，独立于 hero 容器)
  │     ├── Brand: "QingYan Studio" (左)
  │     ├── Nav: Experience / Projects / AIGC Works / About (中)
  │     └── CTA: Contact / Explore / Resume (右) — Proposed Copy
  │
  ├── <div class="hero__container"> (40–48px 圆角主容器)
  │     │
  │     ├── 中央 stack (垂直居中)
  │     │     ├── <span class="hero__badge"> AI × Product × Creativity </span>  (玻璃 Pill, 候选)
  │     │     ├── <h1 class="hero__title"> 
  │     │     │     让 AI 进入工作，<br>也让 AI 进入创作。   ← LOCKED
  │     │     │   </h1>
  │     │     └── <p class="hero__sub"> [副文案 — Placeholder] </p>
  │     │
  │     ├── 左下 <div class="hero__card hero__card--bl">
  │     │     ├── "3" (大字号) + "Selected AI Projects" (小字 EN)
  │     │     └── "View Projects →"
  │     │
  │     └── 右下 <div class="hero__cutout">  (faux-cutout 异形)
  │           ├── "Case Studies" 或 "Selected Work"
  │           └── "Explore →"
  │
  └── <a class="hero__scroll"> Scroll </a> (可选)
</section>
```

### 4.2 关键结构决策

| 决策 | 理由 |
|------|------|
| **整个 Hero 是一个圆角大容器**（不是 full-bleed 视频 + 文字） | 与"传统 SaaS / 模板站"最大的区分点 |
| **视频是容器背景，不是页面背景** | 容器边界清晰，玻璃叠加更有效 |
| **左下卡 + 右下异形是容器内的子元素** | 复刻 RIVR 的"hero 内部信息层"，但不放数据 |
| **导航在 hero 容器外，顶部 fixed** | 导航是页面级，不是 hero 内部组件 |
| **Badge 玻璃 Pill 放在标题正上方** | 视觉锚点，引导视线到 LOCKED 标题 |
| **副文案为可选/Placeholder** | 不擅自补完 LOCKED 内容 |

### 4.3 候选文案 vs LOCKED 文案（重要）

| 位置 | 类型 | 内容 |
|------|------|------|
| Hero 标题 | **LOCKED** | "让 AI 进入工作，也让 AI 进入创作。" |
| Hero 副文案 | **Placeholder** | （待用户确认是否需要 / 写什么） |
| Hero Badge | **候选** | "AI × Product × Creativity" 或 "QingYan Studio · 2026" |
| 导航右 CTA | **Proposed Copy** | "Contact" / "Explore" / "Resume"（任选其一，待定） |
| 左下卡内容 | **候选** | "3 / Selected AI Projects / View Projects →" |
| 右下异形内容 | **候选** | "Case Studies / Explore →" 或 "Selected Work / AIGC Films →" |

**所有非 LOCKED 文案** 在 Prototype 中必须用 HTML 注释或 CSS class（如 `.is-candidate`）**显式标记**为 candidate，方便后续整站确认。

---

## 5. Desktop 布局

### 5.1 视觉坐标

```
┌────────────────────────────────────────────────────────────┐
│  [Header - 透明玻璃条，fixed]                                │
│  QingYan Studio      Experience Projects AIGC Works  [CTA] │
├────────────────────────────────────────────────────────────┤
│ ╭──────────────────────────────────────────────────────╮   │ ← 圆角大容器
│ │                                                      │   │   border-radius: 44px
│ │              [AI × Product × Creativity]             │   │   padding: 64–80px
│ │                  (玻璃 Badge pill)                    │   │
│ │                                                      │   │
│ │         让 AI 进入工作，                              │   │
│ │         也让 AI 进入创作。                            │   │   ← LOCKED TITLE
│ │                                                      │   │   clamp(2.5rem, 6vw, 5rem)
│ │              [副文案 Placeholder]                     │   │   weight 500
│ │                                                      │   │   tracking -0.02em
│ │                                                      │   │
│ │  ┌─────────────────┐                  ╲              │   │
│ │  │ 3               │              ╲    │              │   │ ← 左下卡 + 右下异形
│ │  │ Selected AI …   │                ╲  │              │   │
│ │  │ View Projects → │                  ╲│              │   │
│ │  └─────────────────┘                    ╲              │   │
│ ╰──────────────────────────────────────────────────────╯   │
└────────────────────────────────────────────────────────────┘
```

### 5.2 关键数值

| 项目 | 数值 | 说明 |
|------|------|------|
| 容器最大宽度 | 1280px (centered) | 与现行 `--max-width` 一致 |
| 容器圆角 | 44px (Desktop) | RIVR 视觉印象量级 |
| 容器内外边距 | 桌面：64–80px 内边距；外留 4% 页面边距 | 给冷灰底色露出 |
| 视频占比 | 容器 100% × 100% | 容器内全填 |
| 玻璃叠加 | white 6–10% + blur 4–6px | 必须极轻，**不要 SaaS 玻璃** |
| 标题字号 | clamp(2.5rem, 6vw, 5rem) | 桌面 80px，**Normal/Medium 500** |
| 标题行高 | 1.08 | 紧凑 |
| 标题 tracking | -0.02em | 紧 |
| 标题字重 | 500 (Medium) | **不**用 Heavy/Bold |
| 玻璃 Badge 字号 | 0.75rem | small |
| 左下卡宽度 | min 200–240px | 浮在容器内 |
| 左下卡 padding | 20–24px | 玻璃质感 |
| 右下异形尺寸 | ~220×100–140px | 异形剪裁 |

### 5.3 CSS Grid 草案（仅参考，不直接进 Prototype）

```css
.hero {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 6rem 4% 4rem;
}
.hero__container {
  position: relative;
  width: 100%;
  max-width: 1280px;
  aspect-ratio: 16 / 10; /* 或 min-height: 78vh */
  border-radius: 44px;
  overflow: hidden;
  isolation: isolate;
}
```

---

## 6. Mobile 布局

### 6.1 关键挑战

| 挑战 | 解决方案 |
|------|---------|
| 容器 44px 圆角在手机上过大 | 缩到 24px，但仍保留"大容器"语言 |
| 视频裁切位置 | `object-position: center 30%`（人/主体略偏上） |
| 中央标题中文换行 | 字号缩到 2rem，2 行内必须放下 LOCKED 文案 |
| 左下卡 + 右下异形在窄屏拥挤 | **重排为堆叠**，保留 glass 视觉语言但**取消异形** |
| 玻璃 Header 与 Hero 文字冲突 | Header 玻璃加深（white 12% + blur 16px） |
| 视频流量（手机） | `<video>` 加 `preload="metadata"`，首屏静止封面 |
| 右下异形的"挖空"语言 | 移动端不强制保留 — 视觉语言可只保留"圆角+玻璃"，不复制异形 |

### 6.2 移动端简化结构

```
┌────────────────────────────┐
│ [Header Glass - 玻璃加深]   │
│ QingYan Studio        ☰    │
├────────────────────────────┤
│ ╭────────────────────────╮ │  ← 24px 圆角
│ │  [video - 容器内]        │ │
│ │                         │ │
│ │  [玻璃 Badge]            │ │
│ │  AI × Product × …       │ │
│ │                         │ │
│ │  让 AI 进入工作，         │ │  ← 2rem, line-height 1.15
│ │  也让 AI 进入创作。      │ │
│ │                         │ │
│ │  [副文案 - 1 行]         │ │
│ │                         │ │
│ │  ┌─────────────────────┐│ │
│ │  │ 3 / Selected AI …   ││ │  ← 左下卡可保留
│ │  │ View Projects →     ││ │
│ │  └─────────────────────┘│ │
│ │                         │ │
│ │  [右下异形 → 简化为单卡]  │ │
│ │  Case Studies →         │ │
│ ╰────────────────────────╯ │
│      [Scroll ↓]             │
└────────────────────────────┘
```

**原则：移动端保留核心结构（圆角大容器 + 视频 + 中央标题 + 玻璃 Badge），可重新组合异形与卡片，**不强行缩小桌面设计**。**

---

## 7. 色彩系统候选

> 以下是 **Visual Direction Candidate**，不是 LOCKED Design Tokens。
> Prototype 跑完后回看具体效果再决定哪些进入全局 Token。

| Token | 候选色值 | 用途 | 与现行差异 |
|-------|---------|------|----------|
| `--c-page` | **#F0F0F0** | 页面冷灰底 | 替代 #F5F1E8 暖米白 |
| `--c-hero-glass` | rgba(255,255,255, 0.06) | Hero 视频上的白玻璃叠加 | 新 |
| `--c-glass-card` | rgba(255,255,255, 0.45) | 左下/右下玻璃卡 | 新 |
| `--c-glass-card-border` | rgba(255,255,255, 0.6) | 玻璃边 | 新 |
| `--c-ink` | **#2D2D2D** | 主文字（深） | 替代 #111111（略柔） |
| `--c-text-primary` | #2D2D2D | 标题 | 同上 |
| `--c-text-secondary` | **#5E6470** | 副文、说明、灰蓝 | 替代 #7A8B8B 偏冷 |
| `--c-text-muted` | #8A9099 | 弱化文字 | 新 |
| `--c-accent` | **#5B7480** | 低饱和青灰，强调 | 替代 #C8A96A 金（建议） |
| `--c-accent-warm` | （待定） | 极少数点缀 | 谨慎使用 |
| `--c-border` | rgba(45,45,45, 0.10) | 默认边线 | 略柔 |
| `--c-border-strong` | rgba(45,45,45, 0.20) | 强边线 | 略柔 |

### 7.1 显式禁用

- ❌ 紫蓝渐变
- ❌ 霓虹紫、荧光绿、电光蓝
- ❌ 高饱和科技蓝
- ❌ 任何形式的"AI cyber"配色
- ❌ 复杂彩色阴影
- ❌ 大面积渐变

### 7.2 关于"金色"的态度

现行设计的 #C8A96A 金是 **Modern Oriental Minimalism** 的关键色。
**Soft Glass Editorial Lab** 的实验态度：

- 默认不保留金色（与冷灰气质冲突）
- 如果一定要保留"中文创作者"的暖感，**降饱和到 #B5A079 量级**，且仅作为"动效/状态点"使用，**不作主背景**
- 决定权在 Prototype 跑完后

---

## 8. Typography 候选

### 8.1 现状 vs 新方向

| | 现行 | 新方向候选 |
|--|------|----------|
| 中文标题 | Noto Serif SC（宋体） | Noto Sans SC Medium 500（黑体） |
| 中文正文 | Noto Sans SC | Noto Sans SC Light/Regular |
| 英文点缀 | Cormorant Garamond Italic（衬线斜体） | Inter 500 / system-ui |
| 气质 | 东方留白、宋体温度 | Neo-Grotesk 冷静、editorial |

**核心判断**：宋体在 Soft Glass 上会**立刻破坏** Neo-Grotesk 气质。
→ Prototype 必须用 **Noto Sans SC** 承担中文，**Inter** 承担英文。

### 8.2 字体方案（推荐）

```css
--font-sans-zh: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
--font-sans-en: "Inter", "Helvetica Neue", "Arial", system-ui, sans-serif;
--font-mono:    "JetBrains Mono", ui-monospace, monospace;  /* 流程图 / 标签可选 */
```

- **Noto Sans SC** 已有 Google Fonts CDN 链接，**不增加任何新依赖**
- **Inter** 已有 `--font-sans-en` 兜底字（如已加载）
- **Cormorant Garamond** 在新方向中**降级**为可选 accent，不出现在 Hero
- 后续如需进一步强化 Neo-Grotesk，可考虑 **Inter Display** 或 **Space Grotesk**（需用户确认再加 CDN）

### 8.3 Hero 标题排印

| 项目 | 数值 |
|------|------|
| 字号 | clamp(2.25rem, 6vw, 4.5rem) |
| 字重 | **500 (Medium)** ← 关键，不要 Bold |
| 行高 | 1.08 |
| Tracking | -0.02em (略紧) |
| 颜色 | #2D2D2D |
| 装饰 | 无（不加下划线、不加渐变） |
| 装饰元素 | LOCKED 标题本身不加任何 hover 效果（保持稳定） |

### 8.4 中文保证

- Noto Sans SC Medium（500）在 60–80px 时**清晰、现代、克制**
- 不会出现"宋体温度"或"教科书感"
- 配合 Inter 英文，可形成**双语言 Neo-Grotesk 气质**
- 已与 Google Fonts 链接兼容，**零字体文件本地依赖**

---

## 9. Glass 参数（候选）

| 元素 | 背景 | 边框 | 模糊 | 阴影 |
|------|------|------|------|------|
| **视频上方叠加** | rgba(255,255,255, 0.06) | 无 | 0 | 无 |
| **Header 玻璃条** | rgba(255,255,255, 0.55) | rgba(255,255,255, 0.6) 1px | blur(20px) saturate(180%) | 极轻 0 1px 0 rgba(0,0,0,0.04) |
| **Hero Badge 玻璃** | rgba(255,255,255, 0.55) | rgba(255,255,255, 0.7) 1px | blur(12px) | 极轻 |
| **左下卡玻璃** | rgba(255,255,255, 0.50) | rgba(255,255,255, 0.65) 1px | blur(16px) | 0 8px 24px rgba(0,0,0,0.06) |
| **右下异形玻璃** | rgba(255,255,255, 0.50) | rgba(255,255,255, 0.65) 1px | blur(16px) | 同上 |
| **Glass Button** | rgba(45,45,45, 0.85) | 无 | blur(12px) | 极轻 |

### 9.1 玻璃硬约束

- ⛔ **不允许**任何"发光边框"（无 box-shadow 中的彩色阴影）
- ⛔ **不允许**backdrop blur 大于 24px（容易糊）
- ⛔ **不允许**白玻璃超过 60% opacity（要透视频）
- ✅ 必须保证 Hero 标题文字与玻璃背景对比度 ≥ 4.5:1（WCAG AA）
- ✅ 玻璃叠加在视频上时，**视频已调暗**（CSS filter: brightness(0.6) + saturate(0.85)）保证可读

---

## 10. 圆角系统（候选）

| 元素 | 圆角 | 理由 |
|------|------|------|
| **Hero 主容器（Desktop）** | **44px** | 标志性的"大圆角"语言 |
| **Hero 主容器（Mobile）** | **24px** | 缩放而非保持桌面尺寸 |
| **玻璃卡 / 左下卡** | 24–28px | 与主容器区分 |
| **玻璃 Badge Pill** | 999px (full rounded) | pill 形态 |
| **玻璃按钮** | 999px (pill) | 与 Badge 统一 |
| **右下 faux-cutout** | 24px + 异形 clip-path | clip-path: polygon(...) 形成"挖空一角" |
| **Header** | 0 (全宽) | 与 Hero 容器形成对比 |
| **内页卡片（沿用到全局）** | 16–20px | 不要所有组件都 44px |

### 10.1 关于"不要 SaaS Card 化"

- 圆角只用于 Hero 主容器和**少数特殊玻璃元素**
- 内页 / Selected Projects / Case 详情等**继续使用 2–4px 锐角**（保持 editorial 印刷感）
- 这是"Soft Glass"与"Cyber Glass SaaS"的关键区分

---

## 11. Motion 原则

### 11.1 允许

| 动效 | 数值 | 用途 |
|------|------|------|
| Hero 内容 fade in | opacity 0→1, 0.7s | 容器内容揭示 |
| Scale 0.98 → 1 | 0.7s ease-out | 容器入场 |
| Badge 轻微 Y | translateY 8px → 0 | Badge 上浮 |
| Glass Card 淡入 | opacity 0→1, delay 200ms | 左下/右下信息层 |
| Hover scale | 1.01–1.02 | 玻璃卡 / 按钮 |
| Arrow 微位移 | translateX 4px | CTA hover |
| 视频自然播放 | autoplay muted loop playsinline | 视频背景 |
| Section reveal | IntersectionObserver, 0.8s | 整站已实现 |

### 11.2 禁止

- ⛔ 鼠标粒子 / 光圈跟随
- ⛔ 大幅 Parallax
- ⛔ Scroll Hijacking
- ⛔ 3D 旋转 / 地球
- ⛔ Loading 炫技
- ⛔ 影响招聘方快速浏览的动效

### 11.3 减弱动效

```css
@media (prefers-reduced-motion: reduce) {
  .hero *, .hero__container * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  video { display: none; }
  .hero__video-poster { display: block; }
}
```

---

## 12. Hero 视频素材方案

### 12.1 现状盘点

| 路径 | 数量 | 用途评估 |
|------|------|---------|
| `D:\嘉定的清晨\*.mp4` | 16 段 6–10MB | 短素材，可拼接 6–12s montage |
| `D:\情绪 (1)\一个人\成片\一个人的雨夜.mp4` | 30MB | 已成片，雨夜情绪 |
| `D:\青砚口播\人生是一场游戏\*` | 10+ 段 (70MB–1GB) | 源片太大，不直接用 |
| `D:\freedom\` | 多张 PNG | **没有视频**，只是分镜/角色图 |
| **trailer-final.mp4** | **不存在** | MISSING-ASSETS.md 已记录 |

### 12.2 方案候选（任选其一，必须标注）

#### 方案 A：精选 4–6 段 AIGC 短片拼接（推荐）

- 取 `D:\嘉定的清晨\` 下 4–6 段 5–8 秒横屏视频
- 用 ffmpeg 拼接 + 统一调色（降饱和 + 略压暗 + 颗粒）
- 输出 `assets/video/hero-montage.mp4`，4–6MB，15–25s loop
- 文件名标注：`hero-montage.mp4` + 旁置 `README-hero-video.md` 说明来源
- 优点：100% 真实素材；缺点：需要 ffmpeg 离线处理

#### 方案 B：用一张高清 AIGC 静态图做"动态视频"模拟

- 取 `assets/img/freedom-storyboard-01.jpg` 或新选一张 AIGC 成片
- 在容器内加极慢 Ken Burns（scale 1.0 → 1.05, 30s）
- 加白色玻璃叠加形成"伪视频"质感
- 优点：零依赖；缺点：与"动态视频背景"承诺有偏差
- 适用：Prototype 阶段**最快验证**视觉方向

#### 方案 C：TEMP VISUAL REFERENCE（占位透明）

- 不嵌入任何视频，Hero 容器使用**单一冷灰玻璃背景**
- 在容器顶部固定一行小字 `TEMP VISUAL REFERENCE — REPLACE BEFORE RELEASE`
- 优点：诚实、零资产依赖；缺点：看不出"video hero"特性
- 适用：仅在用户**完全没给可用视频**时使用

### 12.3 我的建议

**Prototype 阶段使用方案 A 的简化版**：
- 选 3–4 段 `D:\嘉定的清晨\` 中的视频
- ffmpeg 拼成 12–18s 单文件
- 在视频上方放 white glass 6% + 标题
- 视频画风本身就是 AIGC，色温偏冷，**正好与冷灰新方向契合**

> **绝不**：
> - 下载 RIVR 原视频
> - 用 Pexels / Pixabay 等"通用 stock 视频"
> - 用 AI 生成的"伪视频"占位（除非明确标注）
> - 拿 `人生是一场游戏` 的 1GB 源片直接放网页

### 12.4 视频处理要求

```bash
# 拼接 3–4 段 → 单文件
ffmpeg -f concat -safe 0 -i list.txt -c copy hero-montage.mp4

# 或带调色（降饱和 + 略暗）
ffmpeg -f concat -safe 0 -i list.txt \
  -vf "eq=saturation=0.85:brightness=-0.05,curves=preset=darker" \
  -c:v libx264 -crf 24 -preset slow -an hero-montage.mp4
```

> ffmpeg 是否能用、用户是否接受在 `D:\嘉定的清晨\` 做只读拷贝 — **执行前需用户确认**（避免触发"不修改资产"红线）。

---

## 13. 需要用户补充/确认的素材

| # | 项目 | 状态 | 默认行为 |
|---|------|------|---------|
| 1 | Hero 视频（4 段候选） | 🟡 | 默认用 `D:\嘉定的清晨\` 3 段拼接；如不同意则用方案 C（占位） |
| 2 | 副文案（标题下方一行） | ❌ | 默认**不显示**，留白处理；如需文案请用户给 |
| 3 | 导航右 CTA 文案 | 🟡 | 默认 "Contact"（最朴素）；候选 "Explore" / "Resume" |
| 4 | 玻璃 Badge 文案 | 🟡 | 默认 "AI × Product × Creativity"；候选 "QingYan Studio · 2026" |
| 5 | 左下卡数字 | 🟡 | 默认 "3"（与现有 3 个真实项目一致） |
| 6 | 左下卡副文 | 🟡 | 默认 "Selected AI Projects"；候选 "Selected Work" |
| 7 | 右下异形文案 | 🟡 | 默认 "Case Studies / Explore →"；候选 "Selected Work / AIGC Films →" |
| 8 | ffmpeg 处理视频权限 | ❌ | 默认**不处理**；等用户明确授权"只读拼接" |
| 9 | 是否换掉 Cormorant Garamond | 🟡 | 默认**保留**但仅在 About / 内页 accent，**不出现在 Hero** |
| 10 | 真实姓名"朱青"是否出现在 Hero 副区 | ❌ | 默认**不出现**；按 MISSING-ASSETS.md 规则 |

---

## 14. 准备创建/修改的文件

### 14.1 隔离 Prototype（不污染现有 home）

| 路径 | 类型 | 用途 |
|------|------|------|
| `prototype/hero/index.html` | **新建** | Hero Prototype 独立页面 |
| `prototype/hero/styles.css` | **新建** | Prototype 专用样式（可复制 main.css 头部 token 后增量修改） |
| `prototype/hero/main.js` | **新建** | 入场动效 / Header 行为 |
| `prototype/hero/README.md` | **新建** | 说明：TEMP PROTOTYPE / 验证依据 / 决策回退路径 |
| `assets/video/hero-montage.mp4` | **新建（需用户授权）** | 拼接后的真实视频（方案 A 选中时） |
| `docs/HERO-VISUAL-IMPLEMENTATION-PLAN.md` | **新建** | 本文件 |
| `index.html` / `assets/css/main.css` | **不动** | 现行 home + 设计系统保持稳定 |
| `docs/MISSING-ASSETS.md` | **追加** | 把"Hero 视频候选"记录进去 |

### 14.2 不创建的内容

- ⛔ 不创建任何"RIVR 风格"的子页面
- ⛔ 不创建内页新的 selected-projects / about
- ⛔ 不改 Selected Work / AI Lab / Creative 三个 case 页
- ⛔ 不动 Contact
- ⛔ 不引入新字体文件、不动 Google Fonts 链接（除非决定加 Inter Display，再单独 PR）

---

## 15. 第一轮 Prototype 的验收标准

### 15.1 必须通过（Go / No-Go）

| 维度 | 验收点 | 通过条件 |
|------|--------|---------|
| **视觉气质** | 第一眼感受 | 高级 / 克制 / 未来感 / 创作者气质 / 产品感 / **不是模板站** |
| **LOCKED 文案** | Hero 主标题 | "让 AI 进入工作，也让 AI 进入创作。"**完整、清晰、可读** |
| **色彩** | 冷灰玻璃语言 | 视频叠加后文字对比度 ≥ 4.5:1；不出现紫蓝渐变 / 霓虹 |
| **玻璃克制** | 不俗套 | backdrop blur 不超过 24px；无发光边；无彩色阴影 |
| **圆角语言** | 大圆角 + 不 SaaS 化 | Hero 主容器 44px 圆角可见；内页组件不强制同步 |
| **异形结构** | 右下 faux-cutout | 桌面端可识别为"挖空 / 异形"；移动端可降级为单卡 |
| **左下卡** | 真实信息入口 | 显示 "3" + "Selected AI Projects" + 箭头；不显示伪造数据 |
| **导航** | 不破坏现有 home | Prototype 顶部导航使用新结构（Experience/Projects/AIGC Works/About），但点击不跳转（href="#"），**不影响现有 home** |
| **响应式** | Desktop + Mobile | 桌面 1280px 视口 + 移动 375px 视口都通过截图核查 |
| **动效** | 克制 | 入场 fade + scale，0.7s 内完成；无 parallax / 粒子 / scroll hijack |
| **视频** | 诚实 | 若用方案 A，标注 `TEMP VISUAL REFERENCE — REPLACE BEFORE RELEASE` |
| **字体** | Neo-Grotesk 气质 | 中文字体不出现宋体温度；Cormorant 不出现在 Hero |
| **可访问性** | 减弱动效 | `prefers-reduced-motion: reduce` 时禁用 video + 动效 |
| **不污染** | 现行 home | 打开现行 `index.html` 仍显示 Modern Oriental Minimalism |

### 15.2 三档判定

| 档位 | 条件 | 后续 |
|------|------|------|
| **A · 整站切换** | 12 项以上 Pass，且用户主观感受"高级 / 克制 / 是 QingYan" | 进入整站视觉系统 v2 切换流程，分阶段更新内页 |
| **B · 部分采纳** | 8–11 项 Pass，但存在可识别短板（如字体、玻璃过厚） | Prototype 调优后复审一轮，再决定 A / C |
| **C · 暂不切换** | 8 项以下 Pass，或用户主观"还是喜欢旧米白" | 保留 Modern Oriental Minimalism；Hero 增量优化；本轮方向验证归档 |

### 15.3 主观感受自检（不能省略）

Prototype 跑通后，必须用一句话回答：

> "Soft Glass Editorial Lab 是不是 QingYan Studio 的视觉语言？"

如果答案是"还不够"或"不像 QingYan"——直接进 C 档，不强推切换。

---

## 16. 时间线与下一步

| 阶段 | 内容 | 等待 |
|------|------|------|
| **现在** | 本计划提交 + 等待用户确认 | ⏸ 用户确认 |
| **下一轮** | 制作 `prototype/hero/index.html` + 样式 + 视频拼接 | 用户授权 + 视频源选择 |
| **再下一轮** | Prototype 截图 / 录屏 / 视口核查 | 用户主观判定 |
| **之后** | A/B/C 档决策 → 整站切换 / 调优 / 归档 | 用户决策 |

---

## 附录 A：Prototype 文件结构（一旦启动后）

```
作品集/
├── index.html                  ← 不动
├── prototype/
│   └── hero/
│       ├── index.html          ← Hero Prototype 主页
│       ├── styles.css          ← Prototype 专用样式
│       ├── main.js             ← 入场 / Header
│       ├── README.md           ← 说明 + 决策回退
│       └── assets/
│           ├── video/          ← (可选) hero-montage.mp4
│           └── img/            ← (可选) poster
├── assets/
│   ├── css/main.css            ← 不动
│   ├── js/main.js              ← 不动
│   ├── img/                    ← 不动
│   └── video/                  ← 新建（方案 A 时使用）
├── docs/
│   ├── HERO-VISUAL-IMPLEMENTATION-PLAN.md   ← 本文件
│   └── MISSING-ASSETS.md       ← 追加 Hero 视频状态
└── README.md                   ← 不动
```

## 附录 B：Open Questions（请用户回答）

1. **视频源**：是否同意使用 `D:\嘉定的清晨\` 3 段视频做"只读拼接"作为 Prototype 视频？或者选择方案 C（无视频 + 静态玻璃）？
2. **副文案**：Hero LOCKED 标题下方是否需要一行副文案？需要的话，请提供；不需要的话，保持留白。
3. **导航右 CTA**：默认 "Contact"，还是 "Explore" / "Resume" / 其他？
4. **真实姓名**：是否在 Prototype 期间显式不展示"朱青"？（默认不展示）
5. **是否同意整站切换决策权交给我**：如果 Prototype Pass，是否允许我分阶段把 Modern Oriental Minimalism 替换为 Soft Glass Editorial Lab？（默认仅在用户明确同意后才动现行 index.html）

---

*本计划完成于 Visual Direction Validation 阶段。等待用户对 §13 候选、§15 验收标准、附录 B Open Questions 的明确回复后，进入 Prototype 编码。*
