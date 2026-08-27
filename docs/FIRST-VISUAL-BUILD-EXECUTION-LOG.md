# QingYan Studio Portfolio v1.0 — First Visual Build · Execution Log

**时间**：2026-08-26
**范围**：Soft Glass Editorial Lab 视觉系统首版（v2）
**策略**：Structure First → Visual First Pass → Media Slots → Real Assets Later

---

## 1. 页面入口

| 入口 | 地址 | 说明 |
|---|---|---|
| **首版（当前）** | `index.html` | Soft Glass Editorial Lab 视觉系统首版 |
| 旧版备份 | `index-v1-backup.html` | Modern Oriental Minimalism（v1，已停止使用） |
| 本地预览 | `http://localhost:8080/` | `python -m http.server 8080` |

> ⚠️ 当前 `index.html` 是 v2 视觉系统。如果决定回滚到 v1 暖米白方向，恢复 `index-v1-backup.html` 为 `index.html` 即可。

---

## 2. 创建 / 修改文件

| 路径 | 操作 | 说明 |
|---|---|---|
| `index.html` | **重写** | 30.8KB；七个 Section 全部静态 HTML |
| `index-v1-backup.html` | 新建 | v1 旧版备份 |
| `assets/css/v2.css` | 新建 | 30.9KB；完整 Soft Glass 设计系统（令牌 + 布局 + Hero + Section + 响应式） |
| `assets/js/v2-main.js` | 新建 | 7.6KB；导航 / Media Slot 替换 / Reveal 动画 |
| `assets/js/site-data.js` | 新建 | 13.1KB；中央化数据层（22 个 slot） |
| `assets/css/main.css` | 保留 | v1 设计系统（未在 v2 中引用，保留备份） |
| `assets/js/main.js` | 保留 | v1 主脚本（未在 v2 中引用） |
| `docs/HERO-VISUAL-IMPLEMENTATION-PLAN.md` | 新建 | Hero 视觉实现方案（15 章节） |
| `docs/MISSING-ASSETS.md` | 更新 | 新增 Hero 视频状态条目 |
| `docs/screenshots/desktop-full.png` | 新建 | 桌面端全页（8727px） |
| `docs/screenshots/desktop-hero.png` | 新建 | 桌面端 Hero 视口（1440×900） |
| `docs/screenshots/mobile-full.png` | 新建 | 移动端全页（11768px） |
| `docs/screenshots/mobile-hero.png` | 新建 | 移动端 Hero 视口（400×800） |
| `_capture/measure.js` | 临时 | CDP 截图脚本（保留，下次复盘可用） |
| `_capture/debug.js` | 临时 | CDP 调试脚本（保留） |

---

## 3. 已完成 Section

| # | Section | LOCKED | 状态 |
|---|---|---|---|
| 1 | **Hero** | ✅ 标题"让 AI 进入工作，也让 AI 进入创作。" + Badge "AI × Product × Creativity" | 完成（媒体占位） |
| 2 | **Experience** | — | 完成（3 项，6 个媒体占位） |
| 3 | **Selected Projects** | — | 完成（3 个项目卡，10 个媒体占位） |
| 4 | **AIGC Works** | — | 完成（4 个 gallery，4 个封面占位） |
| 5 | **How I Work** | — | 完成（3 条原则 + 流程图） |
| 6 | **About** | ⏸ 等待用户确认是否展示真实姓名/照片/简历 PDF | 完成（结构 + 占位标记） |
| 7 | **Contact** | ⏸ 联系方式待确认 | 完成（结构 + "联系方式确认中" 状态卡） |

---

## 4. 所有 Placeholder

| 类型 | 位置 | 当前显示 | 备注 |
|---|---|---|---|
| **HERO_MEDIA_PLACEHOLDER** | Hero 中央玻璃质感背景 | "HERO_MEDIA_PLACEHOLDER" 标签 + 深色径向渐变 | 等待视频拼接 |
| **About 占位** | About 区块 | "I Need 朱青 真实姓名 + 头像 / 简历 PDF 确认后填充" | 等用户决定 |
| **Contact 占位** | Contact 区块 | "联系方式确认中 / Email · GitHub · WeChat 稍后补充" | 等用户提供 |

---

## 5. 所有 Media Slot（共 22 个）

> 每个 slot 在 HTML 中以 `data-slot-id="..."` 标记，对应 `site-data.js` 的 `media` 配置对象。
> 替换真实素材时只需改 JS，无需碰 HTML。

### Hero（1）
| Slot ID | 类型 | 标签 |
|---|---|---|
| `hero-background` | video / image | 视频蒙太奇或主视觉图 |

### Experience（7）
| Slot ID | 标签 |
|---|---|
| `exp-jiuzhou-outcomes` | 工作成果 |
| `exp-jiuzhou-tutorials` | 教程 |
| `exp-jiuzhou-drama` | AI 短剧画面 |
| `exp-content-covers` | 封面 / 发布截图 |
| `exp-content-analytics` | 数据复盘 |
| `exp-aigc-films` | 短片画面 |
| `exp-aigc-boards` | 分镜 / 概念图 |

### Selected Projects（10）
| Slot ID | 标签 |
|---|---|
| `p01-workflow` | Pipeline Workflow |
| `p01-transcript` | 直播转写 Transcript |
| `p01-review` | Review / Regression 证据 |
| `p02-product-ui` | 创作者 Agent 产品 UI |
| `p02-pad-annotation` | Pad 批注 |
| `p02-canvas` | 无限画布 |
| `p02-experiment` | 行动实验 |
| `p03-multi-ai` | Multi-AI Workflow |
| `p03-exec-log` | Execution Log |
| `p03-workstation` | Workstation |

### AIGC Works（4）
| Slot ID | 标签 | 备注 |
|---|---|---|
| `aigc-jiading-cover` | 嘉定的清晨 · 封面 | **REAL ASSET CANDIDATE** — 源素材在 `D:\嘉定的清晨\` |
| `aigc-huisheng-cover` | 回声 · 封面 | 待补 |
| `aigc-zijing-cover` | 紫荆花盛开 · 封面 | 待补 |
| `aigc-benran-cover` | 本然 · 封面 | 待补 |

---

## 6. 当前使用的临时素材

| 用途 | 临时方案 | 来源 |
|---|---|---|
| Hero 视频 | **深色径向渐变 + "HERO_MEDIA_PLACEHOLDER" 玻璃质感标签**（CSS） | `v2.css` `.hero__media--placeholder` |
| 所有媒体占位 | **虚线边框 + 中央图标 + 文案标签**（CSS 组件） | `v2.css` `.media-slot` |
| 中文字体 | Noto Sans SC（用户本地字体） | 浏览器 fallback |

> 所有占位都是 CSS 渲染，**没有引入任何虚构图、视频或外部资源**。

---

## 7. Desktop 状态（1440 × 900 视口 / 8727px 全页）

| 检查项 | 状态 | 备注 |
|---|---|---|
| 顶部导航 | ✅ | QingYan Studio / Experience Projects AIGC Works About / Contact |
| Hero 容器 | ✅ | 深色背景 + 44px 圆角 + 玻璃质感 |
| Hero Badge | ✅ | "AI × PRODUCT × CREATIVITY" 居中 |
| Hero 标题 | ✅ | "让 AI 进入工作，/ 也让 AI 进入创作。" 两行居中 |
| Hero 左下玻璃卡 | ✅ | "3 / SELECTED AI PROJECTS / View Projects →" |
| Hero 右下异形 | ✅ | 白底 "CASE STUDIES / Explore →"（带 border-top-left-radius 32px 咬合效果） |
| Experience（3 项） | ✅ | 标题 + 角色 + 时间 + 标签 + 媒体占位（横排 3 列） |
| Selected Projects（3 卡） | ✅ | 流程图 + Tag + 媒体占位（3 张大卡） |
| AIGC Works（4 卡片） | ✅ | 3:4 比例 + "嘉定的清晨" 标 REAL ASSET CANDIDATE |
| How I Work | ✅ | 3 条原则 + PLAN→EXECUTE→REVIEW→CYCLE→SHIP 流程图 |
| About | ✅ | 占位卡 + 状态列表 |
| Contact | ✅ | "CONTACT" + "联系方式确认中" 状态卡 |
| Footer | ✅ | "朱青 · 2026 · Soft Glass Editorial Lab" |

**截图**：`docs/screenshots/desktop-hero.png`（314KB）/ `desktop-full.png`（950KB）

---

## 8. Mobile 状态（400 × 800 视口 / 11768px 全页）

| 检查项 | 状态 | 备注 |
|---|---|---|
| 顶部导航 | ✅ | QingYan Studio + Contact + 汉堡菜单 |
| Hero 容器 | ✅ | 深色背景 + 24px 圆角（移动端变小） + 玻璃质感 |
| Hero Badge | ✅ | 同桌面，居中显示 |
| Hero 标题 | ✅ | 同桌面，两行 |
| Hero 左下玻璃卡 | ✅ | "3 / SELECTED AI PROJECTS / View Projects →"（横排满宽） |
| Hero 右下异形 | ✅ | "CASE STUDIES" + "Explore →" 横排 |
| Experience | ✅ | 单列堆叠，每项下方接媒体占位 |
| Selected Projects | ✅ | 单列堆叠，每张卡含 flow 图 |
| AIGC Works | ✅ | 2×2 网格（移动端断点生效） |
| How I Work | ✅ | 3 条原则 + 流程图垂直排列 |
| About / Contact / Footer | ✅ | 同桌面，单列 |

**截图**：`docs/screenshots/mobile-hero.png`（99KB）/ `mobile-full.png`（716KB）

---

## 9. 已知视觉问题

| # | 问题 | 严重度 | 处置 |
|---|---|---|---|
| 1 | **Hero 视频仍为占位渐变** | 🟡 中 | 等用户授权 `D:\嘉定的清晨\` 3 段素材或另行准备 |
| 2 | **About 用占位标记，无真实头像/姓名** | 🟡 中 | 等用户确认是否展示真实信息 |
| 3 | **Contact 用占位状态卡** | 🟡 中 | 等用户提供 Email / GitHub / WeChat |
| 4 | **Soft Glass Editorial Lab 与 QingYan 品牌温度感不一致** | 🟠 评审中 | v1 暖米白 + 宋体 vs v2 冷灰 + Neo-Grotesk 是两种气质；等用户视觉 Review 决策 |
| 5 | **桌面 Hero 右下异形与玻璃卡的视觉关系** | 🟢 低 | 待视觉 Review 确认 |
| 6 | **桌面端 3 张项目卡堆叠 8727px 超长** | 🟢 低 | 设计意图（杂志长版），可讨论是否分页 |

---

## 10. 后续需要补充的真实素材

> 等用户授权后逐项替换。所有替换点都已在 `site-data.js` 中标好，只需要改 type 和 src/poster/alt 即可。

### A. Hero 视频（1 个）
- `hero-background`：建议拼接 `D:\嘉定的清晨\` 中的 3 段素材为 15-30 秒循环蒙太奇
- 状态：⏸ **未授权，按只读处理**

### B. Experience 媒体（7 个）
- 九州 AI 短剧（3）：工作成果截图、教程封面、AI 短剧画面
- 视频号运营（2）：封面 / 发布截图、数据复盘
- AIGC 视频创作（2）：短片画面、分镜 / 概念图
- 状态：⏸ 待用户提供

### C. Projects 媒体（10 个）
- Pipeline（3）：Workflow 流程图、转写对照、回归证据
- Creator Workflow（4）：产品 UI、Pad 批注、无限画布、行动实验
- Multi-AI Workstation（3）：Multi-AI Workflow、Execution Log、Workstation
- 状态：⏸ 待用户提供

### D. AIGC Works 封面（4 个）
- 嘉定的清晨：源素材 `D:\嘉定的清晨\`，需授权后处理
- 回声 / 紫荆花盛开 / 本然：需找到对应源视频或封面帧
- 状态：⏸ 待用户提供

### E. About 真实信息
- 头像照片 / 真实姓名 / 简历 PDF
- 状态：⏸ 等用户确认是否展示

### F. Contact 联系方式
- Email / GitHub / WeChat（任选）
- 状态：⏸ 等用户提供

---

## 11. 截图复盘

本轮截图踩了两个坑，已修复：

1. **坑 1：`--window-size=1440,6800` 让 Hero `min-height: 100svh` 撑到 6800px**
   - 解决：改用 CDP `Page.captureScreenshot` + `captureBeyondViewport: true`，viewport 保持 1440×900，截取整个 `cssContentSize` 高度
2. **坑 2：CDP `Emulation.setDeviceMetricsOverride` 未显式设值时，headless 默认 mobile**
   - 解决：脚本里**显式锁定** viewport 尺寸（desktop 1440×900, mobile 400×800），并强制把 `*.reveal` 标 is-visible + 把 hero CSS 动画时长归零

截图脚本：`_capture/measure.js`（已固化，下次复盘直接调用）

---

## 12. 下一步

✅ **第一版完成。停止继续精修。等待视觉 Review。**

按用户原始指令，本轮交付后：
1. 用户对 Desktop + Mobile 截图做视觉 Review
2. 用户决定 Soft Glass Editorial Lab 方向是否继续
3. 如果继续 → 进入 Round 2：替换真实素材（Hero 视频优先）
4. 如果回滚 → 恢复 `index-v1-backup.html` 为 `index.html`，保留 v2 文件作为设计实验存档