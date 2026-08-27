# -*- coding: utf-8 -*-
"""Project 03 - Unified Web Evidence Production (E01-E08)

Re-skins the REAL source-file evidence into QingYan Studio's native
Soft-Glass Editorial visual language. NO dark IDE / terminal style.

Design tokens are taken verbatim from v2.css + case-study.css:
  --c-page #F0F0F0, --c-ink #2D2D2D, --c-secondary #5E6470,
  --c-muted #8A9099, --c-accent #5B7480,
  bad #A34A3F, good #4A7050, --r-card-sm 12px, --shadow-1.
Evidence cards mirror .ev-col (white-ish, subtle border, soft shadow).

- Line numbers are TRUE source line numbers.
- Soft-wrap is visual only; source text is never altered.
- Highlights are translucent reading-aid bands (text never covered).
- Non-contiguous excerpts are explicitly separated and labelled.
"""
import os
import datetime
from PIL import Image, ImageDraw, ImageFont

SRC = r"D:\agent学习笔记\直播课程知识提取Pipeline"
OUT = r"C:\Users\Administrator\Desktop\作品集\Project03_Evidence_Production\Unified_Web"

F_TEXT = r"C:\Windows\Fonts\msyh.ttc"
F_BOLD = r"C:\Windows\Fonts\msyhbd.ttc"
F_MONO = r"C:\Windows\Fonts\consola.ttf"

# ---------- QingYan Studio light/glass tokens (from v2.css / case-study.css) ----------
CANVAS      = (240, 240, 240)     # #F0F0F0  page bg
CANVAS_ALT  = (232, 232, 232)     # #E8E8E8  page-alt (pills)
CARD        = (250, 250, 251)     # rgba(255,255,255,.6) on #F0F0F0 -> ~#FAFAFB
CARD_HEAD   = (244, 245, 246)
BORDER      = (214, 216, 219)     # --c-border-subtle solid-ish
BORDER_MED  = (202, 205, 209)
INK         = (45, 45, 45)        # --c-ink
SECONDARY   = (94, 100, 112)      # --c-secondary
MUTED       = (138, 144, 153)     # --c-muted
ACCENT      = (91, 116, 128)      # --c-accent  (muted teal-slate, NOT yellow)
ACCENT_SOFT = (223, 229, 232)     # ~accent-soft band
BAD         = (163, 74, 63)       # #A34A3F
BAD_SOFT    = (244, 233, 231)
GOOD        = (74, 112, 80)       # #4A7050
GOOD_SOFT   = (230, 238, 231)
PILL        = (232, 232, 232)
SHADOW      = (222, 224, 228)     # soft lift on #F0F0F0 canvas

f_text   = ImageFont.truetype(F_TEXT, 18)
f_bold   = ImageFont.truetype(F_BOLD if os.path.exists(F_BOLD) else F_TEXT, 30)
f_title  = ImageFont.truetype(F_BOLD if os.path.exists(F_BOLD) else F_TEXT, 30)
f_sub    = ImageFont.truetype(F_TEXT, 16)
f_kick   = ImageFont.truetype(F_MONO, 12)
f_role   = ImageFont.truetype(F_TEXT, 12)
f_fname  = ImageFont.truetype(F_TEXT, 14)
f_mono_s = ImageFont.truetype(F_MONO, 11)
f_path   = ImageFont.truetype(F_TEXT, 11)
f_ln     = ImageFont.truetype(F_MONO, 14)
f_tag    = ImageFont.truetype(F_TEXT, 12)
f_leg_t  = ImageFont.truetype(F_MONO, 12)
f_leg_b  = ImageFont.truetype(F_TEXT, 15)
f_note_b = ImageFont.truetype(F_BOLD if os.path.exists(F_BOLD) else F_TEXT, 24)
f_note_s = ImageFont.truetype(F_TEXT, 15)
f_foot   = ImageFont.truetype(F_TEXT, 11)

_dummy = ImageDraw.Draw(Image.new("RGB", (8, 8)))


# ---------- wrapping (token rules: CJK wraps individually, latin runs never split) ----------
def tokenize(s):
    toks, buf = [], ""
    for ch in s:
        if ch in " \t":
            if buf:
                toks.append(buf); buf = ""
            toks.append(" ")
        elif ord(ch) > 0x2E7F:
            if buf:
                toks.append(buf); buf = ""
            toks.append(ch)
        else:
            buf += ch
    if buf:
        toks.append(buf)
    return toks


def _hardchunk(tok, font, maxw):
    out = []
    while len(tok) > 1 and _dummy.textlength(tok, font=font) > maxw:
        k = 1
        while k < len(tok) and _dummy.textlength(tok[:k + 1], font=font) <= maxw:
            k += 1
        out.append(tok[:k]); tok = tok[k:]
    out.append(tok)
    return out


def wrap_line(text, font, maxw):
    if text.strip() == "":
        return [text]
    lines, cur = [], ""
    for t in tokenize(text):
        if t == " ":
            cur += " "; continue
        if _dummy.textlength(t, font=font) > maxw:
            if cur.strip():
                lines.append(cur.rstrip()); cur = ""
            for piece in _hardchunk(t, font, maxw):
                lines.append(piece)
            continue
        while cur.strip() and _dummy.textlength(cur.rstrip() + t, font=font) > maxw:
            lines.append(cur.rstrip()); cur = ""
        cur += t
    if cur.strip():
        lines.append(cur.rstrip())
    return lines if lines else [text]


def _resolve(rel):
    return rel if os.path.isabs(rel) else os.path.join(SRC, rel)


def read_lines(rel):
    with open(_resolve(rel), encoding="utf-8-sig") as f:
        return f.read().splitlines()


def src_mtime(rel):
    t = datetime.datetime.fromtimestamp(os.path.getmtime(_resolve(rel)))
    return t.strftime("%Y-%m-%d %H:%M:%S")


# ---------- single evidence card (mirrors .ev-col) ----------
PAD, GUT, LH, TAGH, SEPH, GAP_IND = 18, 46, 32, 26, 34, 14
HH = 66  # card header height


def render_ev_card(rel, segments, width, highlights=None, role=None):
    """segments: [(label, start, end)] ; highlights: {line: 'bad'|'good'|'accent'}."""
    highlights = highlights or {}
    lines = read_lines(rel)
    fname = os.path.basename(rel)
    x0 = PAD + GUT + 10
    wrap_w = width - x0 - PAD

    rows = []
    for si, (label, start, end) in enumerate(segments):
        if label:
            rows.append(("tag", label))
        for i in range(start, end + 1):
            assert 1 <= i <= len(lines), f"line range error {rel} {i}"
            for j, p in enumerate(wrap_line(lines[i - 1], f_text, wrap_w)):
                rows.append(("line", i if j == 0 else None, p, j > 0, highlights.get(i)))
        if si < len(segments) - 1:
            nxt = segments[si + 1]
            rows.append(("sep", "LINES %d-%d  →  %d-%d  (NON-CONTIGUOUS)" % (start, end, nxt[1], nxt[2])))

    body_h = sum(LH if r[0] == "line" else (SEPH if r[0] == "sep" else TAGH) for r in rows)
    H = HH + body_h + PAD * 2

    img = ImageDraw.Draw(Image.new("RGB", (8, 8)))  # placeholder, real below
    img = Image.new("RGB", (width, H), CANVAS)
    dr = ImageDraw.Draw(img)
    # soft shadow + card
    dr.rounded_rectangle([0, 6, width - 1, H - 1 + 6], radius=16, fill=SHADOW)
    dr.rounded_rectangle([0, 0, width - 1, H - 1], radius=16, fill=CARD)
    dr.rounded_rectangle([0, 0, width - 1, H - 1], radius=16, outline=BORDER, width=1)
    # header divider
    dr.line([PAD, HH, width - PAD, HH], fill=BORDER, width=1)
    # role chip (eyebrow)
    if role:
        dr.text((PAD, 14), role, font=f_role, fill=ACCENT)
    # filename
    dr.text((PAD, 34), fname, font=f_fname, fill=INK)
    # timestamp pill top-right
    t = src_mtime(rel)
    tw = dr.textlength(t, font=f_mono_s)
    pw = tw + 18
    dr.rounded_rectangle([width - PAD - pw, 14, width - PAD, 38], radius=999, fill=PILL)
    dr.text((width - PAD - pw + 9, 19), t, font=f_mono_s, fill=SECONDARY)
    # short path under filename (muted, mono, may wrap)
    dname = os.path.dirname(rel).replace("\\", " / ")
    plines = wrap_line(dname, f_path, width - 2 * PAD - pw - 12) if dname else []
    py = 34 + 20
    for pl in plines[:1]:
        dr.text((PAD, py), pl, font=f_path, fill=MUTED)
        py += 15

    y = HH + PAD
    for r in rows:
        if r[0] == "tag":
            dr.text((x0, y + 4), r[1], font=f_tag, fill=MUTED)
            y += TAGH
        elif r[0] == "sep":
            dr.line([PAD, y + SEPH // 2, width - PAD, y + SEPH // 2], fill=BORDER, width=1)
            sw = dr.textlength(r[1], font=f_mono_s)
            dr.text(((width - sw) / 2, y + 10), r[1], font=f_mono_s, fill=MUTED)
            y += SEPH
        else:
            _, num, text, cont, colorkey = r
            if colorkey:
                bg = {"bad": BAD_SOFT, "good": GOOD_SOFT, "accent": ACCENT_SOFT}.get(colorkey, ACCENT_SOFT)
                bar = {"bad": BAD, "good": GOOD, "accent": ACCENT}.get(colorkey, ACCENT)
                dr.rectangle([0, y, width, y + LH], fill=bg)
                dr.rectangle([0, y, 3, y + LH], fill=bar)
            if num is not None:
                s = str(num)
                nw = dr.textlength(s, font=f_ln)
                col = BAD if colorkey == "bad" else (GOOD if colorkey == "good" else MUTED)
                dr.text((PAD + GUT - nw, y + 7), s, font=f_ln, fill=col)
            dr.text((x0 + (GAP_IND if cont else 0), y + 6), text, font=f_text, fill=INK)
            y += LH
    return img


# ---------- composition helpers (light / native) ----------
def make_header(width, kicker, title, subtitle=None, big=False):
    h = 96
    if subtitle:
        h += 28
    if big:
        h += 10
    img = Image.new("RGB", (width, h), CANVAS)
    dr = ImageDraw.Draw(img)
    dr.rectangle([0, 14, 30, 15], fill=ACCENT)            # accent rule (case-hero__label::before)
    dr.text((40, 4), kicker, font=f_kick, fill=MUTED)
    dr.text((0, 28), title, font=(f_bold if big else f_title), fill=INK)
    if subtitle:
        dr.text((0, 28 + (40 if big else 38)), subtitle, font=f_sub, fill=SECONDARY)
    return img


def make_note(width, big, small):
    pad = 22
    bw = width - pad * 2 - 10
    bl = wrap_line(big, f_note_b, bw)
    sl = wrap_line(small, f_note_s, bw)
    h = pad + len(bl) * 32 + 10 + len(sl) * 24 + pad
    img = Image.new("RGB", (width, h), CANVAS)
    dr = ImageDraw.Draw(img)
    dr.rounded_rectangle([0, 6, width - 1, h - 1 + 6], radius=14, fill=SHADOW)
    dr.rounded_rectangle([0, 0, width - 1, h - 1], radius=14, fill=CARD_HEAD)
    dr.rounded_rectangle([0, 0, width - 1, h - 1], radius=14, outline=BORDER, width=1)
    dr.rectangle([0, 0, 4, h], fill=ACCENT)              # accent left bar
    y = pad
    for ln in bl:
        dr.text((pad + 10, y), ln, font=f_note_b, fill=INK); y += 32
    y += 10 - 24 + 24
    y = pad + len(bl) * 32 + 10
    for ln in sl:
        dr.text((pad + 10, y), ln, font=f_note_s, fill=SECONDARY); y += 24
    return img


def make_legend(width, proves, not_proves, title_prove="WHAT THIS PROVES",
                title_not="WHAT THIS DOES NOT PROVE"):
    pad = 22
    bw = width - pad * 2 - 10
    pl = wrap_line(proves, f_leg_b, bw)
    nl = wrap_line(not_proves, f_leg_b, bw)
    h = pad + 22 + len(pl) * 24 + 14 + 22 + len(nl) * 24 + pad
    img = Image.new("RGB", (width, h), CANVAS)
    dr = ImageDraw.Draw(img)
    dr.rounded_rectangle([0, 6, width - 1, h - 1 + 6], radius=14, fill=SHADOW)
    dr.rounded_rectangle([0, 0, width - 1, h - 1], radius=14, fill=CARD)
    dr.rounded_rectangle([0, 0, width - 1, h - 1], radius=14, outline=BORDER, width=1)
    dr.line([PAD if False else pad, pad + 18, width - pad, pad + 18], fill=BORDER, width=1)
    y = pad
    dr.text((pad + 4, y), title_prove, font=f_leg_t, fill=MUTED)
    y += 22
    for ln in pl:
        dr.text((pad + 4, y), ln, font=f_leg_b, fill=INK); y += 24
    y += 14
    dr.text((pad + 4, y), title_not, font=f_leg_t, fill=MUTED)
    y += 22
    for ln in nl:
        dr.text((pad + 4, y), ln, font=f_leg_b, fill=MUTED); y += 24
    return img


def make_footer(width, text):
    img = Image.new("RGB", (width, 34), CANVAS)
    dr = ImageDraw.Draw(img)
    dr.text((0, 10), text, font=f_foot, fill=MUTED)
    return img


def vstack(blocks, width):
    h = sum(b.height for b in blocks) + 18 * (len(blocks) - 1)
    img = Image.new("RGB", (width, h), CANVAS)
    y = 0
    for b in blocks:
        img.paste(b, (0, y)); y += b.height + 18
    return img


def side_by_side(left, right, gap, bridge=None):
    h = max(left.height, right.height)
    W = left.width + gap + right.width
    img = Image.new("RGB", (W, h), CANVAS)
    img.paste(left, (0, 0))
    img.paste(right, (left.width + gap, 0))
    if bridge:
        dr = ImageDraw.Draw(img)
        bw = dr.textlength(bridge, font=f_path) + 22
        bx = left.width + gap // 2 - bw // 2
        by = h // 2 - 15
        dr.rounded_rectangle([bx, by, bx + bw, by + 30], radius=15, fill=PILL, outline=BORDER)
        dr.text((bx + 11, by + 8), bridge, font=f_path, fill=SECONDARY)
    return img


def build(spec):
    """spec: dict with title, kicker, subtitle, cards (list of (rel,segs,hl,role)),
    two_col (bool), bridge, note (big,small), legend (proves,not), width, big, footer."""
    W = spec["width"]
    card_w = (W - 60) // 2 if spec.get("two_col") else W
    blocks = [make_header(W, spec["kicker"], spec["title"], spec.get("subtitle"), spec.get("big", False))]
    if spec.get("two_col"):
        cards = [render_ev_card(rel, segs, card_w, hl, role)
                 for (rel, segs, hl, role) in spec["cards"]]
        row = side_by_side(cards[0], cards[1], 60, spec.get("bridge"))
        blocks.append(row)
    else:
        for (rel, segs, hl, role) in spec["cards"]:
            blocks.append(render_ev_card(rel, segs, card_w, hl, role))
    if spec.get("note"):
        blocks.append(make_note(W, spec["note"][0], spec["note"][1]))
    if spec.get("legend"):
        blocks.append(make_legend(W, spec["legend"][0], spec["legend"][1]))
    full = vstack(blocks, W)
    canvas = Image.new("RGB", (W, full.height + 30), CANVAS)
    canvas.paste(full, (0, 0))
    canvas.paste(make_footer(W, spec["footer"]), (0, full.height + 4))
    fn = spec["out"]
    canvas.save(os.path.join(OUT, fn))
    print("OK", fn, canvas.size)


# ============================================================
# E01 - Blueprint Review (single main evidence)
# ============================================================
build(dict(
    out="E01_Blueprint_Review.png",
    width=1160,
    kicker="QINGYAN STUDIO / PROJECT 03 / EVIDENCE E01",
    title="Blueprint Review — 独立审查质疑过度设计",
    subtitle="审查结论：战略方向正确，但复杂度远超个人系统实际需求；执行与审核分离值得保留。",
    cards=[(r"C:\Users\Administrator\WorkBuddy\2026-08-21-12-21-09\outputs\青砚_AI_OS_架构审查报告.md",
            [("总体评价", 14, 30)],
            {16: "bad", 22: "bad", 28: "good", 29: "good", 30: "good"},
            "INDEPENDENT ARCHITECTURE REVIEW")],
    legend=(
        "Blueprint 被独立质疑为过度设计（复杂度远超个人系统实际需求，'过于先进导致无法落地'）；"
        "同时审查明确保留'执行与审核分离'这一核心理念。",
        "审查报告本身不证明 Runtime 已落地；'值得保留'不等于'当前已实现'。"),
    footer="Source read-only / 青砚_AI_OS_架构审查报告.md / 行号为真实源行号 / 高亮仅为阅读辅助，原文未改",
))

# ============================================================
# E02 - Blueprint -> Runtime (two panels)
# ============================================================
build(dict(
    out="E02_Blueprint_to_Runtime.png",
    width=1240,
    two_col=True,
    bridge="收敛",
    kicker="QINGYAN STUDIO / PROJECT 03 / EVIDENCE E02",
    title="Blueprint → Runtime — 收缩真实发生",
    subtitle="Blueprint 保留长期方向；Registry / Lifecycle / Router / Dashboard / APS 留在 Blueprint，Runtime 为实验性最小闭环。",
    cards=[
        (r"C:\Users\Administrator\Documents\Codex\2026-08-21\ai-os-v0-1-ai-os\策略迁移记录.md",
         [("迁移信息 + 审查结论", 5, 24)],
         {14: "bad", 23: "good"},
         "BLUEPRINT / 迁移"),
        (r"C:\Users\Administrator\Documents\Codex\2026-08-21\ai-os-v0-1-ai-os\策略迁移记录.md",
         [("延后内容", 54, 62)],
         {58: "good", 59: "good", 60: "good", 61: "good", 62: "good"},
         "RUNTIME / 延后内容"),
    ],
    legend=(
        "Blueprint → Runtime 的收敛真实发生：当前阶段范围过大，未获数据支持的治理模块继续保留在 Blueprint；"
        "Agent Registry / Lifecycle / Auto Router / Dashboard / APS 明确延后至 Blueprint。",
        "本图不证明 Runtime 已产生价值验证结果；'实验性最小闭环'指 v0.1 当前定位，非已验证结论。"),
    footer="Sources read-only / 策略迁移记录.md / 行号为真实源行号 / 高亮仅为阅读辅助，原文未改",
))

# ============================================================
# E03 - Directory Drift & Governance (two panels, reuse verified ranges)
# ============================================================
build(dict(
    out="E03_Directory_Drift_Governance.png",
    width=1568,
    two_col=True,
    bridge="→",
    kicker="QINGYAN STUDIO / PROJECT 03 / EVIDENCE E03",
    title="Directory Drift & Governance Upgrade",
    subtitle="真实执行暴露了 Source of Truth 失效；后期治理引入了单一 Project Root 与显式项目状态登记规则。",
    cards=[
        (r"00_项目管理\Execution_Log\Project_Root_Migration_Log.md",
         [("OBSERVED DRIFT", 11, 17)],
         {13: "bad", 14: "bad"},
         "OBSERVED DRIFT"),
        (r"PROJECT.md",
         [("LATER GOVERNANCE RULE (2026-08-27 状态)", 13, 24)],
         {15: "good"},
         "LATER GOVERNANCE RULE"),
    ],
    legend=(
        "Directory Drift 在真实执行中发生，且后期治理正式确立了单一 Project Root 加显式 project-state 登记规则。",
        "本图单独不证明独立审查者曾'错误 PASS'了错误现实；PROJECT.md 为 2026-08-27 后期治理状态，非当时快照。"),
    footer="Sources read-only / Project_Root_Migration_Log.md mtime %s / PROJECT.md mtime %s / 高亮仅为阅读辅助，原文未改"
           % (src_mtime(r"00_项目管理\Execution_Log\Project_Root_Migration_Log.md"),
              src_mtime(r"PROJECT.md")),
))

# ============================================================
# E04 - Task Brief Contract (single panel, whole file)
# ============================================================
build(dict(
    out="E04_Task_Brief_Contract.png",
    width=1120,
    kicker="QINGYAN STUDIO / PROJECT 03 / EVIDENCE E04",
    title="Task Brief Contract — 聊天意图 → 结构化任务契约",
    subtitle="3 秒读懂：Human Intent、Gate 链、统一 Project Root、资产边界，全部在一份 Task Brief 中落盘。",
    cards=[(r"00_项目管理\Task_Brief\00_V0.1_Task_Brief.md",
            [("直播课程知识提取 Pipeline V0.1", 1, 20)],
            {5: "accent", 7: "accent", 18: "accent", 20: "accent"},
            "HUMAN INTENT → STRUCTURED CONTRACT")],
    legend=(
        "Task Brief 把聊天意图结构化为可执行契约：Human Intent 明确；Gate 链为 Codex 执行 → WorkBuddy Review → PASS/REVISE → 下一 Gate；"
        "统一 Project Root 与资产边界被显式约定。",
        "本图不证明契约已被执行或评审通过；仅为契约本身的静态证据。"),
    footer="Source read-only / 00_V0.1_Task_Brief.md / 行号为真实源行号 / 高亮仅为阅读辅助，原文未改",
))

# ============================================================
# E05 - Review Gate (two panels: REVISE -> PASS)
# ============================================================
build(dict(
    out="E05_Review_Gate.png",
    width=1240,
    two_col=True,
    bridge="Revision",
    kicker="QINGYAN STUDIO / PROJECT 03 / EVIDENCE E05",
    title="Review Gate — REVISE → R2 PASS",
    subtitle="同一 Pre-Execution Gate 两轮：首轮 REVISE（5 项 Must Fix），修正后 R2 PASS。",
    cards=[
        (r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PreExecution_Review.md",
         [("PRE-EXECUTION GATE (R1)", 10, 18)],
         {10: "bad"},
         "PRE-EXEC GATE · R1"),
        (r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PreExecution_Review_R2.md",
         [("PRE-EXECUTION GATE (R2)", 11, 18)],
         {11: "good"},
         "PRE-EXEC GATE · R2"),
    ],
    legend=(
        "首轮 Pre-Execution Review 判 REVISE（5 项 Must Fix 未落实）；修正后 R2 判 PASS，允许进入 Codex 执行。",
        "REVISE → R2 PASS 的顺序由内容、文件命名与引用关系支持；两份文件修改时间相同，因此时间戳本身不能独立证明先后。"),
    footer="Sources read-only / PreExecution_Review.md + R2.md / 行号为真实源行号 / 高亮仅为阅读辅助，原文未改",
))

# ============================================================
# E06 - Bounded Execution (single panel, two excerpts, reuse verified)
# ============================================================
build(dict(
    out="E06_Bounded_Execution.png",
    width=1180,
    kicker="QINGYAN STUDIO / PROJECT 03 / EVIDENCE E06",
    title="Bounded Execution — PASS ≠ KEEP GOING",
    subtitle="执行者在已审范围内行动，并在下一个 Gate 前停下。",
    cards=[(r"00_项目管理\Execution_Log\v0.2_execution_log.md",
            [("EXCERPT A · 执行范围", 3, 18),
             ("EXCERPT B · 当前 Gate", 103, 107)],
            {6: "bad", 7: "bad", 107: "accent"},
            "PRIMARY EVIDENCE")],
    note=("PASS ≠ KEEP GOING",
          "PASS 仅授予已审范围内的执行许可，不等于继续推进。"),
    legend=(
        "执行者在已审范围内行动（Step 1–7），并明确未执行 Step 8、v0.2 最终 PASS、v0.3、ASR 优化、Agent/RAG/UI；"
        "当前状态为 READY FOR POST-EXECUTION REVIEW。",
        "本图不证明自动权限系统、程序级沙箱，或执行者在技术上无法超出范围。"),
    footer="Source read-only / v0.2_execution_log.md mtime %s / 高亮仅为阅读辅助，原文未改"
           % src_mtime(r"00_项目管理\Execution_Log\v0.2_execution_log.md"),
))

# ============================================================
# E07 - Execution Traceability (single panel, two excerpts)
# ============================================================
build(dict(
    out="E07_Execution_Traceability.png",
    width=1180,
    kicker="QINGYAN STUDIO / PROJECT 03 / EVIDENCE E07",
    title="Execution Traceability — Done → 可复核证据",
    subtitle="每条'完成'都能落到 Raw Transcript / SHA-256 / 模型 / API 网络 / 输出时间 / 异常记录。",
    cards=[(r"00_项目管理\Execution_Log\v0.2_execution_log.md",
            [("EXCERPT A · 实际输入与 LLM", 22, 37),
             ("EXCERPT B · 执行异常", 97, 101)],
            {24: "accent", 32: "accent", 37: "accent", 101: "bad"},
            "TRACEABILITY")],
    legend=(
        "执行产物可复核：Raw Transcript 登记 SHA-256（8B14…52BB3）；执行模型 OpenAI Codex (GPT-5)；"
        "外部 API 未调用、网络检索未使用、课程外资料未使用；首次输出落盘时间 2026-08-23 10:27:52；异常被如实记录。",
        "本图不证明'全链路可观测'（full observability）；JIT 推理耗时因环境限制未拆分，未虚构数值。"),
    footer="Source read-only / v0.2_execution_log.md mtime %s / 高亮仅为阅读辅助，原文未改"
           % src_mtime(r"00_项目管理\Execution_Log\v0.2_execution_log.md"),
))

# ============================================================
# E08A - Final Gate (HERO evidence, widest/biggest)
# ============================================================
build(dict(
    out="E08A_Final_Gate_REVISE.png",
    width=1280,
    big=True,
    kicker="QINGYAN STUDIO / PROJECT 03 / EVIDENCE E08A · HERO",
    title="Final Gate — The final review still said REVISE.",
    subtitle="只读独立复核：终审发现两处实质性内容重写，不宣告 VALIDATED。",
    cards=[(r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PostExecution_Review.md",
            [("EXCERPT A · 结论与方式", 1, 18),
             ("EXCERPT B · 明确不宣告", 228, 228)],
            {6: "accent", 11: "bad", 15: "bad", 228: "accent"},
            "PRIMARY EVIDENCE · FINAL GATE")],
    note=("The final review still said REVISE.",
          "终审独立核查执行产物，发现两处实质性内容重写，未宣告 VALIDATED。"),
    legend=(
        "后期 Gate 独立（只读）复核执行结果，发现两处实质性内容重写，结论为 REVISE。",
        "本图不证明最终闭环 PASS、Prompt 可靠性，或未来审查者必然正确；不宣告 Minimum Loop VALIDATED。"),
    footer="Source read-only / WorkBuddy_v0.2_PostExecution_Review.md mtime %s / 高亮仅为阅读辅助，原文未改"
           % src_mtime(r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PostExecution_Review.md"),
))

# ============================================================
# E08B - Rewrite Evidence (continuous, lower weight)
# ============================================================
build(dict(
    out="E08B_Rewrite_Evidence.png",
    width=1100,
    kicker="QINGYAN STUDIO / PROJECT 03 / EVIDENCE E08B · SUPPORTING",
    title="Rewrite Evidence — 两处实质性内容重写",
    subtitle="连续区段：原始 LLM 输出 → 正式笔记，性质均为实质性内容重写。",
    cards=[(r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PostExecution_Review.md",
            [("LINES 99-121 · 三处修正（连续）", 99, 121)],
            {109: "bad", 119: "bad"},
            "SUPPORTING / EXPAND EVIDENCE")],
    legend=(
        "终审定位三处人工修正中的两处（修正 1、修正 2）性质为实质性内容重写："
        "最小权限建议被改为按提示选完全权限；LLM 自创步骤被替换为课程实际步骤。",
        "本图不证明最终闭环 PASS；删除级修正（修正 3）与两处实质性重写并列，但视觉权重低于 E08A。"),
    footer="Source read-only / WorkBuddy_v0.2_PostExecution_Review.md mtime %s / 高亮仅为阅读辅助，原文未改"
           % src_mtime(r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PostExecution_Review.md"),
))


# ---------- anchor verification (byte-level self-check) ----------
def verify_anchors():
    checks = [
        (r"C:\Users\Administrator\WorkBuddy\2026-08-21-12-21-09\outputs\青砚_AI_OS_架构审查报告.md", [16, 22, 28]),
        (r"C:\Users\Administrator\Documents\Codex\2026-08-21\ai-os-v0-1-ai-os\策略迁移记录.md", [14, 23, 58, 62]),
        (r"00_项目管理\Execution_Log\Project_Root_Migration_Log.md", [13, 14]),
        (r"PROJECT.md", [15]),
        (r"00_项目管理\Task_Brief\00_V0.1_Task_Brief.md", [5, 7, 18, 20]),
        (r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PreExecution_Review.md", [10]),
        (r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PreExecution_Review_R2.md", [11]),
        (r"00_项目管理\Execution_Log\v0.2_execution_log.md", [6, 7, 24, 32, 37, 101, 107]),
        (r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PostExecution_Review.md", [6, 11, 15, 109, 119, 228]),
    ]
    print("\n---- ANCHOR VERIFICATION (raw source lines actually highlighted) ----")
    for rel, lns in checks:
        lines = read_lines(rel)
        for n in lns:
            print("[%s L%d] %s" % (os.path.basename(rel), n, lines[n - 1]))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    verify_anchors()
    print("\nDone.")
