# Hero Visual Asset Replacement — Change Log

**日期**：2026-08-26
**轮次**：One-pass Code Fix 之后的第二轮（Hero 真实视觉资产接入）
**范围**：仅首屏 Hero；其余 6 个 Section 全部未动

---

## 一、本轮目标

把 One-pass Code Fix 阶段留下的深灰 cinematic placeholder scene，替换为用户已确认的湖边自然场景图片。最终效果：浅灰页面背景 `#F0F0F0` + 一整块被真实自然影像填满的大圆角 Hero 容器。

---

## 二、图片接入位置

| 文件 | 操作 |
|---|---|
| `assets/img/hero-lake.jpg` | **新增** — 用户提供的湖边自然场景 JPG，1672×941，~434 KB |

**未复制到其他位置、未设置为整站背景、Hero 视觉关键帧单一归属。**

未来若该方向验证通过进入动态版本（水面波动 / 阳光闪动 / 枝叶轻摆），仍以此图为基础制作，不另寻素材。

---

## 三、Hero Media Slot 替换方式

仅修改 `assets/js/site-data.js` 中 `media["hero-background"]` 一个槽位：

```js
"hero-background": {
  type: "image",
  src: "assets/img/hero-lake.jpg",
  alt: "湖边自然场景",
  objectPosition: "center 50%",
  objectPositionMobile: "55% 50%"
}
```

**HTML / CSS / JS 主代码 0 改动。** 完全复用 One-pass Code Fix 已建好的：

- `.hero__media` 唯一可替换区结构（noise / vignette 作为兄弟层永久保留）
- `renderHeroMedia()` 中 `type === "image"` 分支（img 注入 + error fallback + naturalWidth 守卫）
- `applyObjectPosition()` CSS 变量注入（`--hero-media-pos` / `--hero-media-pos-mobile`）
- `object-fit: cover`（既有 CSS）

**这就是 One-pass Code Fix 阶段"等资产来了以后只改一项"的承诺兑现。**

---

## 四、Desktop / Mobile object-position

### 数学依据（实测）

| 维度 | 桌面 heroMedia | 移动 heroMedia |
|---|---|---|
| 实测宽 × 高 | 1307 × 735 | 374 × 707 |
| 图宽 × 高 | 1672 × 941 | 1672 × 941 |
| scaleW / scaleH | 0.782 / 0.781 | 0.224 / 0.751 |
| cover 用 scale | scaleH ≈ scaleW（几乎等比） | scaleH（高度填满） |
| X% 是否有效 | 几乎无效 | 强有效 |
| Y% 是否有效 | 略有效 | 完全无效（高度无裁切） |
| 显示宽占图宽 | ~82% | **~29.8%** |

### Desktop：`objectPosition: "center 50%"`
- 横向几乎无裁切 → 整图基本全部可见
- 桌面构图目标已达成：左侧树干 + 上方枝叶 + 中央大面积水面 + 右下布料和番茄 → 全部进入画面
- 中央水面是标题主要留白区

### Mobile：`objectPositionMobile: "55% 50%"`
- 横向强裁切（70% 被裁），显示图区 [55%, 84.8%]
- 目标：
  - 中央水面作标题背景 ✓
  - 一点右下"人的生活痕迹"（番茄在 75%+ 进入显示区）✓
  - 一部分上方枝叶 framing（Y 满铺自然带来）✓
  - 树干无法保留（X=55% 已越出 25% 树干区）—— 这是 mobile 29.8% 显示宽的客观约束，与桌面构图不共享
- 33% 起步尝试（`30% 70%`）只看到水面 + 一点布料、番茄不可见；改 X=55% 后番茄进入右下次要位置

---

## 五、Overlay / Vignette / Noise 调整

### 评估结果：**未做减法**

One-pass Code Fix 阶段为深灰 cinematic scene 调过的 overlay（vignette `opacity ~0.92` + radial `rgba(4,5,7,0.55)` + noise `mix-blend-mode: overlay, opacity ~0.38` + hero overlay `rgba(255,255,255,0.06)`），在浅色自然场景下的视觉表现：

| 检查项 | 桌面 | 移动 |
|---|---|---|
| 湖水青绿色调 | 清晰 | 清晰 |
| 阳光反射 | 可见 | 可见 |
| 布料米白 + 番茄橙红 | 质感保留 | 质感保留 |
| 中央标题可读 | 清晰 | 清晰 |
| Badge 玻璃与图片协调 | 协调 | 协调 |
| Glass Card / faux-cutout | 成立 | 成立 |
| Navbar / Hero 视觉关系 | 成立 | 成立 |

**结论**：视觉上 overlay 略偏重（边缘角有可见 vignette），但未压黑、未压灰湖水、未破坏照片质感。优先做减法的要求暂时不触发。如后续视觉评审认为边缘 vignette 太重，可单点调 `.hero__media-vignette` opacity。

---

## 六、LOCKED 内容核对

`grep` 复核 L56 / L106（Hero 主标题文案）：

```
index.html: 让 AI 进入工作，
index.html: 也让 AI 进入创作。
```

**一字未改**。

---

## 七、未修改内容（明确清单）

| 文件 / 模块 | 状态 |
|---|---|
| `index.html` | 0 改动 |
| `assets/css/v2.css` | 0 改动（overlay / Glass / motion / token 全部复用） |
| `assets/js/v2-main.js` | 0 改动（image 渲染管线 + error fallback 全部复用） |
| `assets/js/site-data.js` | **仅**修改 `media["hero-background"]` 一个对象，其他媒体槽位未动 |
| Navbar / 品牌层级 | 未动 |
| Hero LOCKED 文案 | 未动 |
| Hero Badge / 左下 Glass Card / 右下 faux-cutout | 未动 |
| Experience / Projects / AIGC Works / How I Work / About / Contact | 未动 |

---

## 八、10 项检查结果

| # | 检查项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 图片真正铺满整个 Hero | ✓ | `object-fit: cover` + 实测 heroMedia 374×707 / 1307×735 内 img 100% 覆盖 |
| 2 | 从黑色 UI 卡片变真实视觉世界 | ✓ | round2 / round4 截图 |
| 3 | 中央标题仍清晰 | ✓ | 白字在青绿水面 + vignette 浅色中央，对比足够 |
| 4 | Badge 与图片协调 | ✓ | Glass S dark 在浅色图片上有微反衬，不抢戏 |
| 5 | 左下 Glass Card 成立 | ✓ | Glass M dark，置于水面+布料过渡区 |
| 6 | 右下 faux-cutout 与番茄不打架 | ✓ | cutout 在 hero 容器底，番茄在 cutout 右上侧且位置错开 |
| 7 | Navbar 与 Hero 视觉关系成立 | ✓ | 白底 nav + 圆角 hero 自然过渡 |
| 8 | Desktop crop 成立 | ✓ | 树干 / 枝叶 / 水面 / 番茄全可见 |
| 9 | Mobile crop 成立 | ✓ | 枝叶 framing + 水面主体 + 右下番茄 |
| 10 | 图片未被 overlay 压黑 | ✓ | 青绿色调 / 阳光反射 / 布料质感均保留 |

---

## 九、交付物

```
docs/screenshots/hero-asset/
├── desktop-hero.png    桌面 Hero（1440×900）
├── desktop-full.png    桌面全页（1440×全高）
├── mobile-hero.png     移动 Hero（390×844）
└── mobile-full.png     移动全页（390×全高）
```

---

## 十、下一轮入口

**如 Hero 方向验证通过**：以本图为基础制作动态 Hero 版本（水面波动 / 阳光反射闪动 / 枝叶轻摆 / 前后景极慢运动），建议直接使用 `type: "video"` 槽位替换图片，`site-data.js` 单点修改即可，无需改 HTML/CSS/JS。

**如方向不通过**：本轮接入完全可逆——把 `type` 改回 `placeholder` 或换成其他图片即可。