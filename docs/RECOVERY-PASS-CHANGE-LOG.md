# QingYan Studio Portfolio v1.0 · Recovery Pass — Change Log

**输入**：上一轮 First Visual Build 存在两条 P0 偏差——擅自扩写未 LOCKED 内容；Hero 停留在静态排版，没有 Cinematic Media Layer。
**目标**：恢复 LOCKED 内容 + 重建 Hero 视觉完成度 + Projects/AIGC 视觉区分。
**状态**：完成。等待 Visual Review。

---

## 1 · 删除的自行生成内容

### Experience（删 2 条 + 1 intro）
| 旧 | 处置 |
|---|---|
| `视频号运营 · 内容创作` + `Content Operations & Creation` + `创作者 / 运营` + 自行概括正文 | **删除** |
| `AIGC 视频创作` + `AIGC Video Production` + `导演 / AI 视觉` + 自行概括正文 | **删除** |
| 区块 intro `从内容创作到 AI 工作流，真实项目中积累的实践经验。` | **删除** |

### Projects（全部重写）
| 旧 | 处置 |
|---|---|
| P01 `可靠知识提取 Pipeline` / `AI 可以生成流畅内容，但流畅并不等于真实……` / Tags: AI Reliability / Evidence Verification / Human Review / Pipeline Design | **删除**，替换为 LOCKED 文案 |
| P02 `创作者 AI 工作流` / `AI 如何进入真实创作者的内容生产流程……` | **删除** |
| P03 `个人 AI 操作系统` / `如何建立一套可长期积累认知……` | **删除** |
| 区块 intro `三个正在真实推进的 AI 项目……` | **删除** |

### AIGC Works
| 旧 | 处置 |
|---|---|
| 每件作品 subtitle `AIGC Short Film`（自行添加） | **删除** |
| 区块 intro `从概念到成片的 AIGC 影像实验……` | **删除** |

### About
| 旧 | 处置 |
|---|---|
| 三个 cap 标题 `AI Product Design / Workflow Engineering / Creative Exploration` + placeholder 描述 | **删除**，替换为单一 placeholder 卡 |

### Hero 视觉
| 旧 | 处置 |
|---|---|
| 一块深色径向渐变 + 两层 noise 的"普通深色背景" | **重做**：cinematic scene（灰阶山脊 SVG + 光雾 + 噪点 + 缓慢漂移）|
| Glass 卡文字使用深色 ink（在深背景上对比度差） | **重做**：glass 卡片文字统一改为浅色 + 玻璃内高光 |
| Badge / Title 字号偏小，缺少 editorial 重量感 | **升级**：title 升至 clamp(2.4rem, 5.8vw, 4.75rem) / 5 字重 + text-shadow |

---

## 2 · 恢复的 LOCKED 内容

### Hero LOCKED（保持）
- Brand：`QingYan Studio`（不变，禁止 QingYan Zhu）
- Name：`朱青`（仅 footer 出现）
- Title：`让 AI 进入工作，` `也让 AI 进入创作。`（不变）
- Badge：`AI × Product × Creativity`（不变）
- Nav CTA：`Contact`（不变）
- 右下 cutout label：`QingYan Studio`（替换上轮候选 `Case Studies`，用 LOCKED 品牌名）
- 左下卡：`3 / Selected AI Projects / View Projects →`（保留上轮结构文案）

### Experience · 北京九州文化传媒有限公司（LOCKED 全文恢复）
- Period：`2026.01 – 2026.03`
- Role：`AI 内容生产实习生`
- Stats：`8 部 AI 短剧 / 280 集 / 团队推广`（数字与原文匹配）
- Body 三段（精确恢复用户提供的因果链）：
  1. 参与 AI 短剧全流程生产，累计落地 8 部、280 集，覆盖剧本分析、视觉设计、AI 素材生成、剪辑配音等环节。
  2. 在实际制作中，根据短剧的流量与付费链路分配制作资源……（关键帧处理方法论）
  3. 该方法在实际项目中验证后被领导注意并认可，随后应要求整理为关键帧处理教程，并在团队内部推广复用。
- 右侧两个 media slot（保留，但视觉权重降低）：`AI 短剧 / 成片截图`、`关键帧教程 / 团队复用证据`

### Projects · 三个项目（LOCKED 精确文案）

| # | titleZh | titleEn | Status | Tags |
|---|---|---|---|---|
| 01 | Agent 方法学习与知识沉淀系统 | Agent Learning & Knowledge System | Ongoing Experiment | 知识结构化 · 方法提取 · 原文核对 · 独立 AI 审核 · 错误复测 |
| 02 | 个人 AI 学习工作台 | Personal AI Learning Workspace | 7 次迭代 · Personal MVP | 33 章内容体系 · Pad 批注 · 无限画布 · 本地数据 · AI 反馈 |
| 03 | 青砚多 AI 协作工作台 | QingYan Multi-AI Workspace | Runtime v0.1 · In Validation | 任务拆解 · 多 AI 分工 · 独立审核 · 执行边界 · 过程留痕 |

P03 单独呈现 Runtime 链：
`Human Intent → ChatGPT → WorkBuddy Review → Codex Execution → Execution Log → AI Workstation`

### AIGC Works（LOCKED 作品名）
- 01 嘉定的清晨 · 2025 · REAL ASSET
- 02 回声
- 03 紫荆花盛开
- 04 本然

### About（LOCKED 状态）
- 全文 `Placeholder`，不自行编写

### Contact（保留）
- `联系方式确认中 · Contact channels to be confirmed`
- `Email / GitHub / 微信 / 简历 PDF 待确认后更新。`

---

## 3 · Hero 增加的 Media / Motion 层

### Cinematic Media Layer（`HERO_MEDIA_PLACEHOLDER`）
- **远山脊** SVG path（灰阶渐变 `#2c313a → #191c21`，z=0 底层）
- **近山脊** SVG path（更亮一档 `#38404b → #1e2126`）
- **冷灰光晕** radial gradient ellipse（`#66717f / 0.42`），浮动在远山之上
- **电影噪点** SVG feTurbulence + mix-blend-mode: overlay，呼吸 14s
- **Vignette + 上下 letterbox falloff**（径向 + 线性叠加）
- **HERO_MEDIA_PLACEHOLDER label** 保留在左上 mono pill

### Motion（very slow drift）
| 图层 | 动画 | 时长 |
|---|---|---|
| `.hero__scene`（整层） | scale 1.02 → 1.08 + 极缓位移 | 42s alternate |
| `.hero__scene-glow` | translateX ±1.5% + opacity 0.8 → 1 | 26s alternate |
| `.hero__scene-ridge--far` | translateX -1% | 50s alternate |
| `.hero__scene-ridge--mid` | translateX +1.4%（反向） | 36s alternate-reverse |
| `.hero__media-noise` | opacity 0.35 → 0.6 | 14s alternate |

### Glass 质感升级
- Badge / Card：半透 + blur 14–18px + saturate(140%) + inset 顶部 1px 白色高光 + 投影
- 左下卡 hover：translateY(-3px) + 投影加深（克制，不复杂 parallax）
- 左下卡文字统一改为浅色（对比度问题修复）

### Hero entrance reveal 序列
- Badge delay 0.08s → Title 0.20s → 左下卡 0.42s → 右下 cutout 0.54s
- Container：heroFadeIn（scale 0.985 → 1，0.7s）保留

---

## 4 · Selected Projects vs AIGC Works 视觉区分

### Selected Projects · 理性、系统、产品
- 圆角卡片 `28px` + 浅灰背景 + 细描边 + 微阴影
- 标题左对齐，index 编号（01/02/03）+ 状态 dot
- 大量结构化标签（Tags pill）+ Flow step（流程步骤）
- 4 列 media-slot 网格（理性证据感）
- P03 单独有 Runtime 卡片（accent 色块背景）

### AIGC Works · 影像、情绪、视觉
- **无卡片容器**——媒体直接铺满背景（16:9 / 21:9）
- **大留白**：feature 占满 12 列，aspect 21:9；下面三件在 12 列网格中错位（b 下移 5rem，c 下移 9rem）
- **画面主导**：媒体尺寸占据视觉中心
- **更少文字**：caption 仅 `index + title + year`（嘉定的清晨额外有 REAL ASSET 徽标），caption 在媒体下方而非覆盖
- **Typography 切换**：section 标题位置与 Projects 一致，但作品标题字号小、克重轻、不喧宾夺主
- **节奏不同**：Projects 一眼是结构化卡片；AIGC Works 一眼是电影/画廊
- 媒体无 overlay gradient（Projects 有渐变叠加）——AIGC 让媒体本身说话

---

## 5 · Placeholder 降权（统一规则）

所有 `.media-slot`（Hero 除外）：
- 删除原 2rem 图标（避免装饰堆砌）
- 背景改为 `rgba(45,45,45,0.02)` 几近透明
- 边距更紧凑、字号更小
- 弱化为"细虚线槽位"——肉眼能识别但不抢眼

---

## 6 · 交付清单

| 文件 | 状态 |
|---|---|
| `index.html` | 重写 |
| `assets/css/v2.css` | 重写（Hero / Experience / Projects / Film Gallery / Media Slot / Animations 全部更新） |
| `assets/js/site-data.js` | 重写（LOCKED 文案同步，删除违规 items） |
| `assets/js/v2-main.js` | 微调（renderHeroMedia 适配新 scene 结构） |
| `docs/screenshots/desktop-hero.png` | 重截 |
| `docs/screenshots/desktop-full.png` | 重截（页面高度 8944px） |
| `docs/screenshots/mobile-hero.png` | 重截 |
| `docs/screenshots/mobile-full.png` | 重截（页面高度 10583px） |

**安全回退**：`index-v1-backup.html` 仍保留 Modern Oriental Minimalism 旧版。
**本地预览**：`http://localhost:8080/`（服务器存活）

---

## 7 · 已知问题 / 待 Review 决定

| # | 问题 | 状态 |
|---|---|---|
| 1 | Hero 视频源未定（`D:\嘉定的清晨\` 是否授权做只读拼接） | 等用户决定，未处理 |
| 2 | Experience 仅九州一条，是否需要补更多 LOCKED 经历 | 等用户提供 |
| 3 | About 区为单一 placeholder，是否需要补充 LOCKED 个人描述 | 等用户提供 |
| 4 | Projects 的 tag 中文化后是否够专业感（vs 英文 Tags） | 等用户 Review |
| 5 | AIGC Works 4 件作品（嘉定的清晨之外 3 件）的真实素材状态 | 仅 嘉定的清晨 有本地素材标记 |

---

**Recovery Pass 完成 · 等待 Visual Review**