# -*- coding: utf-8 -*-
"""Project 03 - Tier 1 Evidence Production (E03 / E06 / E08A / E08B)

Faithful dark-editor-style renders of REAL source files (read-only).
- Line numbers are TRUE source line numbers.
- Soft-wrap is visual only; source text is never altered.
- Highlights are translucent reading-aid bands (text never covered).
- Non-contiguous excerpts are explicitly separated and labelled.
"""
import os
import datetime
from PIL import Image, ImageDraw, ImageFont

SRC = r"D:\agent学习笔记\直播课程知识提取Pipeline"
OUT = r"C:\Users\Administrator\Desktop\作品集\Project03_Evidence_Production\Tier1"

F_TEXT = r"C:\Windows\Fonts\msyh.ttc"
F_BOLD = r"C:\Windows\Fonts\msyhbd.ttc"
F_MONO = r"C:\Windows\Fonts\consola.ttf"

# ---------- dark editor style tokens ----------
CANVAS  = (18, 20, 24)
PANEL_BG = (26, 29, 35)
TAB_BG  = (32, 35, 42)
TAB_ACT = (44, 48, 57)
TXT     = (212, 217, 226)
LN_COL  = (96, 104, 119)
PATH_COL = (126, 134, 150)
BORDER  = (49, 54, 64)
MUTED   = (148, 156, 171)
TAG_COL = (205, 168, 92)      # muted gold, label layer only
ACCENT  = (255, 193, 7)
HL_BAND = (57, 51, 27)        # ~13% amber blended over PANEL_BG
SEP_BG  = (31, 34, 41)
NOTE_BG = (32, 36, 44)
FOOT_COL = (110, 118, 133)

f_text  = ImageFont.truetype(F_TEXT, 20)
f_tab   = ImageFont.truetype(F_TEXT, 17)
f_path  = ImageFont.truetype(F_TEXT, 13)
f_ln    = ImageFont.truetype(F_MONO, 15)
f_tag   = ImageFont.truetype(F_MONO, 13)
f_kick  = ImageFont.truetype(F_MONO, 13)
f_label = ImageFont.truetype(F_MONO, 13)
f_body  = ImageFont.truetype(F_TEXT, 18)
f_note  = ImageFont.truetype(F_TEXT, 17)
f_foot  = ImageFont.truetype(F_TEXT, 12)
f_title = ImageFont.truetype(F_BOLD if os.path.exists(F_BOLD) else F_TEXT, 30)
f_big   = ImageFont.truetype(F_BOLD if os.path.exists(F_BOLD) else F_TEXT, 36)

_dummy = ImageDraw.Draw(Image.new("RGB", (8, 8)))


# ---------- wrapping (token rules: CJK wraps individually, latin runs never split) ----------
def tokenize(s):
    toks, buf = [], ""
    for ch in s:
        if ch in " \t":
            if buf:
                toks.append(buf)
                buf = ""
            toks.append(" ")
        elif ord(ch) > 0x2E7F:
            if buf:
                toks.append(buf)
                buf = ""
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
        out.append(tok[:k])
        tok = tok[k:]
    out.append(tok)
    return out


def wrap_line(text, font, maxw):
    if text.strip() == "":
        return [text]
    lines, cur = [], ""
    for t in tokenize(text):
        if t == " ":
            cur += " "
            continue
        if _dummy.textlength(t, font=font) > maxw:
            if cur.strip():
                lines.append(cur.rstrip())
            cur = ""
            for piece in _hardchunk(t, font, maxw):
                lines.append(piece)
            continue
        while cur.strip() and _dummy.textlength(cur.rstrip() + t, font=font) > maxw:
            lines.append(cur.rstrip())
            cur = ""
        cur += t
    if cur.strip():
        lines.append(cur.rstrip())
    return lines if lines else [text]


def read_lines(rel):
    with open(os.path.join(SRC, rel), encoding="utf-8-sig") as f:
        return f.read().splitlines()


def src_mtime(rel):
    t = datetime.datetime.fromtimestamp(os.path.getmtime(os.path.join(SRC, rel)))
    return t.strftime("%Y-%m-%d %H:%M:%S")


# ---------- editor panel ----------
LH, GUT, PADL, PADR, GAP, WRAP_IND, TAB_H = 34, 48, 10, 20, 14, 26, 44
TAG_H, SEP_H, TOP_PAD, BOT_PAD = 26, 44, 16, 18


def render_panel(rel, segments, width, highlights=frozenset()):
    """segments: [(tag_label, start, end)] in file order. highlights: source line numbers."""
    lines = read_lines(rel)
    fname = os.path.basename(rel)
    dname = os.path.dirname(os.path.join(SRC, rel))
    x0 = PADL + GUT + GAP
    wrap_w = width - x0 - PADR - WRAP_IND

    rows = []
    for si, (label, start, end) in enumerate(segments):
        if label:
            rows.append(("tag", label))
        for i in range(start, end + 1):
            assert 1 <= i <= len(lines), f"line range error {rel} {i}"
            for j, p in enumerate(wrap_line(lines[i - 1], f_text, wrap_w)):
                rows.append(("line", i if j == 0 else None, p, j > 0, i in highlights))
        if si < len(segments) - 1:
            nxt = segments[si + 1]
            rows.append(("sep", "EXCERPT %s - LINES %d-%d (NON-CONTIGUOUS)"
                         % (chr(66 + si), nxt[1], nxt[2])))

    h = TAB_H + TOP_PAD + BOT_PAD
    for r in rows:
        h += TAG_H if r[0] == "tag" else (SEP_H if r[0] == "sep" else LH)

    img = Image.new("RGB", (width, h), PANEL_BG)
    dr = ImageDraw.Draw(img)
    # tab bar
    dr.rectangle([0, 0, width, TAB_H], fill=TAB_BG)
    tw = dr.textlength(fname, font=f_tab)
    dr.rounded_rectangle([14, 6, 14 + tw + 40, TAB_H - 2], radius=7, fill=TAB_ACT)
    dr.text((14 + 20, 13), fname, font=f_tab, fill=TXT)
    pw = dr.textlength(dname, font=f_path)
    dr.text((width - PADR - pw, 16), dname, font=f_path, fill=PATH_COL)
    dr.line([0, TAB_H, width, TAB_H], fill=BORDER, width=1)

    y = TAB_H + TOP_PAD
    for r in rows:
        if r[0] == "tag":
            dr.text((x0, y + 5), r[1], font=f_tag, fill=TAG_COL)
            y += TAG_H
        elif r[0] == "sep":
            dr.rectangle([0, y, width, y + SEP_H], fill=SEP_BG)
            dr.line([0, y, width, y], fill=BORDER, width=1)
            dr.line([0, y + SEP_H - 1, width, y + SEP_H - 1], fill=BORDER, width=1)
            dots = ". . . . ."
            dw = dr.textlength(dots, font=f_tag)
            dr.text(((width - dw) // 2, y + 8), dots, font=f_tag, fill=MUTED)
            sw = dr.textlength(r[1], font=f_tag)
            dr.text(((width - sw) // 2, y + 26), r[1], font=f_tag, fill=MUTED)
            y += SEP_H
        else:
            _, num, p, cont, hl = r
            if hl:
                dr.rectangle([0, y, width, y + LH], fill=HL_BAND)
                dr.rectangle([0, y, 3, y + LH], fill=ACCENT)
            if num is not None:
                s = str(num)
                nw = dr.textlength(s, font=f_ln)
                dr.text((PADL + GUT - nw, y + 8), s, font=f_ln,
                        fill=(255, 209, 102) if hl else LN_COL)
            dr.text((x0 + (WRAP_IND if cont else 0), y + 5), p, font=f_text, fill=TXT)
            y += LH
    dr.rectangle([0, 0, width - 1, h - 1], outline=BORDER, width=1)
    return img


# ---------- composition helpers ----------
def make_header(width, kicker, title):
    img = Image.new("RGB", (width, 96), CANVAS)
    dr = ImageDraw.Draw(img)
    dr.text((2, 12), kicker, font=f_kick, fill=(122, 130, 146))
    dr.text((0, 42), title, font=f_title, fill=TXT)
    return img


def make_label(width, text):
    img = Image.new("RGB", (width, 30), CANVAS)
    dr = ImageDraw.Draw(img)
    dr.text((2, 6), text, font=f_tag, fill=TAG_COL)
    return img


def make_note(width, big, small):
    pad = 24
    bw = width - pad * 2 - 8
    big_lines = wrap_line(big, f_big, bw)
    small_lines = wrap_line(small, f_note, bw)
    h = pad + len(big_lines) * 48 + 12 + len(small_lines) * 28 + pad
    img = Image.new("RGB", (width, h), NOTE_BG)
    dr = ImageDraw.Draw(img)
    dr.rectangle([0, 0, 4, h], fill=ACCENT)
    y = pad
    for ln in big_lines:
        dr.text((pad + 8, y), ln, font=f_big, fill=(245, 232, 200))
        y += 48
    y += 12 - 28 + 28
    y = pad + len(big_lines) * 48 + 12
    for ln in small_lines:
        dr.text((pad + 8, y), ln, font=f_note, fill=MUTED)
        y += 28
    dr.rectangle([0, 0, width - 1, h - 1], outline=BORDER, width=1)
    return img


def make_claim(width, proves, not_proves):
    pad = 24
    bw = width - pad * 2 - 10
    pl = wrap_line(proves, f_body, bw)
    nl = wrap_line(not_proves, f_body, bw)
    h = pad + 20 + len(pl) * 30 + 16 + 20 + len(nl) * 28 + pad
    img = Image.new("RGB", (width, h), NOTE_BG)
    dr = ImageDraw.Draw(img)
    y = pad
    dr.text((pad + 4, y), "WHAT THIS PROVES", font=f_label, fill=TAG_COL)
    y += 20
    for ln in pl:
        dr.text((pad + 4, y), ln, font=f_body, fill=TXT)
        y += 30
    y += 16
    dr.text((pad + 4, y), "WHAT THIS DOES NOT PROVE", font=f_label, fill=(140, 148, 163))
    y += 20
    for ln in nl:
        dr.text((pad + 4, y), ln, font=f_body, fill=MUTED)
        y += 28
    dr.rectangle([0, 0, width - 1, h - 1], outline=BORDER, width=1)
    return img


def make_footer(width, text):
    img = Image.new("RGB", (width, 34), CANVAS)
    dr = ImageDraw.Draw(img)
    tw = dr.textlength(text, font=f_foot)
    dr.text((width - tw, 8), text, font=f_foot, fill=FOOT_COL)
    return img


def vstack(blocks, width, canvas_bg=CANVAS):
    h = sum(b.height for b in blocks)
    img = Image.new("RGB", (width, h), canvas_bg)
    y = 0
    for b in blocks:
        img.paste(b, (0, y))
        y += b.height
    return img


def side_by_side(left, right, gap, arrow=True):
    h = max(left.height, right.height)
    w = left.width + gap + right.width
    img = Image.new("RGB", (w, h), CANVAS)
    img.paste(left, (0, 0))
    img.paste(right, (left.width + gap, 0))
    if arrow:
        dr = ImageDraw.Draw(img)
        dr.text((left.width + gap // 2 - 14, h // 2 - 30), "\u2192", font=f_big, fill=MUTED)
    return img


# ---------- assets ----------
def build_e03():
    W, M = 1568, 36
    PW = (W - 2 * M - 70) // 2
    left = render_panel(r"00_项目管理\Execution_Log\Project_Root_Migration_Log.md",
                        [("LINES 11-17", 11, 17)], PW, highlights={13, 14})
    right = render_panel(r"PROJECT.md",
                         [("LINES 13-24", 13, 24)], PW, highlights={15})
    left_col = vstack([make_label(PW, "OBSERVED DRIFT"), left], PW)
    right_col = vstack([
        make_label(PW, "LATER GOVERNANCE RULE"),
        make_label(PW, "Later governance state - modified 2026-08-27"),
        right], PW)
    row = side_by_side(left_col, right_col, 70)
    cap = Image.new("RGB", (row.width, 34), CANVAS)
    dc = ImageDraw.Draw(cap)
    t = "Drift  \u2192  Governance Upgrade"
    tw = dc.textlength(t, font=f_note)
    dc.text(((row.width - tw) // 2, 2), t, font=f_note, fill=MUTED)
    blocks = [
        make_header(W - 2 * M, "QINGYAN STUDIO PORTFOLIO / PROJECT 03 / TIER 1 EVIDENCE",
                    "E03 - Directory Drift & Governance Upgrade"),
        vstack([row, cap], row.width),
        make_claim(W - 2 * M,
                   "Directory Drift occurred in real execution, and later governance "
                   "formalized a single Project Root plus explicit project-state entry rules.",
                   "This screenshot alone does not prove that an independent reviewer "
                   "passed the wrong location."),
    ]
    foot = make_footer(W - 2 * M,
                       "Sources read-only / Project_Root_Migration_Log.md mtime %s / "
                       "PROJECT.md mtime %s / highlights are reading aids, text unaltered"
                       % (src_mtime(r"00_项目管理\Execution_Log\Project_Root_Migration_Log.md"),
                          src_mtime(r"PROJECT.md")))
    full = vstack(blocks, W - 2 * M)
    canvas = Image.new("RGB", (W, full.height + M * 2 + 34), CANVAS)
    canvas.paste(full, (M, M))
    canvas.paste(foot, (M, M + full.height))
    canvas.save(os.path.join(OUT, "E03_Directory_Drift_Governance.png"))
    print("OK E03_Directory_Drift_Governance.png", canvas.size)


def build_e06():
    W, M = 1200, 36
    BW = W - 2 * M
    panel = render_panel(r"00_项目管理\Execution_Log\v0.2_execution_log.md",
                         [("EXCERPT A - LINES 3-18", 3, 18),
                          ("EXCERPT B - LINES 103-107", 103, 107)],
                         BW, highlights={6, 7, 107})
    blocks = [
        make_header(BW, "QINGYAN STUDIO PORTFOLIO / PROJECT 03 / TIER 1 EVIDENCE",
                    "E06 - Bounded Execution"),
        make_note(BW, "PASS \u2260 KEEP GOING",
                  "PASS granted permission only for the reviewed scope."),
        panel,
        make_claim(BW,
                   "The executor acted within the reviewed scope and stopped at the next gate.",
                   "Does not prove an automatic permission system, a program-level sandbox, "
                   "or that the executor was technically unable to exceed the scope."),
    ]
    foot = make_footer(BW,
                       "Source read-only / v0.2_execution_log.md mtime %s / "
                       "highlights are reading aids, text unaltered"
                       % src_mtime(r"00_项目管理\Execution_Log\v0.2_execution_log.md"))
    full = vstack(blocks, BW)
    canvas = Image.new("RGB", (W, full.height + M * 2 + 34), CANVAS)
    canvas.paste(full, (M, M))
    canvas.paste(foot, (M, M + full.height))
    canvas.save(os.path.join(OUT, "E06_Bounded_Execution.png"))
    print("OK E06_Bounded_Execution.png", canvas.size)


def build_e08a():
    W, M = 1200, 36
    BW = W - 2 * M
    panel = render_panel(r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PostExecution_Review.md",
                         [("EXCERPT A - LINES 1-18", 1, 18),
                          ("EXCERPT B - LINES 228-228", 228, 228)],
                         BW, highlights={6, 11, 15})
    blocks = [
        make_header(BW, "QINGYAN STUDIO PORTFOLIO / PROJECT 03 / TIER 1 EVIDENCE",
                    "E08A - Final Gate"),
        make_note(BW, "The final review still said REVISE.",
                  "A later gate found two substantive manual rewrites that the "
                  "earlier PASS had not resolved."),
        panel,
        make_claim(BW,
                   "A later review gate independently inspected the execution result, "
                   "found two substantive manual rewrites, and returned REVISE.",
                   "Does not prove a final loop PASS, prompt reliability, "
                   "or guaranteed future reviewer correctness."),
    ]
    foot = make_footer(BW,
                       "Source read-only / WorkBuddy_v0.2_PostExecution_Review.md mtime %s / "
                       "highlights are reading aids, text unaltered"
                       % src_mtime(r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PostExecution_Review.md"))
    full = vstack(blocks, BW)
    canvas = Image.new("RGB", (W, full.height + M * 2 + 34), CANVAS)
    canvas.paste(full, (M, M))
    canvas.paste(foot, (M, M + full.height))
    canvas.save(os.path.join(OUT, "E08A_Post_Execution_REVISE.png"))
    print("OK E08A_Post_Execution_REVISE.png", canvas.size)


def build_e08b():
    W, M = 1200, 36
    BW = W - 2 * M
    panel = render_panel(r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PostExecution_Review.md",
                         [("LINES 99-121 - CONTINUOUS EXCERPT", 99, 121)],
                         BW, highlights={109, 119})
    blocks = [
        make_header(BW, "QINGYAN STUDIO PORTFOLIO / PROJECT 03 / TIER 1 EVIDENCE",
                    "E08B - Rewrite Evidence"),
        panel,
        make_claim(BW,
                   "A later review gate independently inspected the execution result, "
                   "found two substantive manual rewrites, and returned REVISE.",
                   "Does not prove a final loop PASS, prompt reliability, "
                   "or guaranteed future reviewer correctness."),
    ]
    foot = make_footer(BW,
                       "Source read-only / WorkBuddy_v0.2_PostExecution_Review.md mtime %s / "
                       "highlights are reading aids, text unaltered"
                       % src_mtime(r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PostExecution_Review.md"))
    full = vstack(blocks, BW)
    canvas = Image.new("RGB", (W, full.height + M * 2 + 34), CANVAS)
    canvas.paste(full, (M, M))
    canvas.paste(foot, (M, M + full.height))
    canvas.save(os.path.join(OUT, "E08B_Substantive_Rewrite_Evidence.png"))
    print("OK E08B_Substantive_Rewrite_Evidence.png", canvas.size)


def verify_anchors():
    """Console dump of every highlighted source line for byte-level self-check."""
    checks = [
        (r"00_项目管理\Execution_Log\Project_Root_Migration_Log.md", [13, 14]),
        (r"PROJECT.md", [15]),
        (r"00_项目管理\Execution_Log\v0.2_execution_log.md", [6, 7, 107]),
        (r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PostExecution_Review.md", [6, 11, 15, 109, 119]),
    ]
    print("\n---- ANCHOR VERIFICATION (raw source lines actually highlighted) ----")
    for rel, lns in checks:
        lines = read_lines(rel)
        for n in lns:
            print("[%s L%d] %s" % (os.path.basename(rel), n, lines[n - 1]))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    build_e03()
    build_e06()
    build_e08a()
    build_e08b()
    verify_anchors()
    print("\nReal source mtimes:")
    for rel in [r"00_项目管理\Execution_Log\Project_Root_Migration_Log.md", r"PROJECT.md",
                r"00_项目管理\Execution_Log\v0.2_execution_log.md",
                r"00_项目管理\WorkBuddy_Review\WorkBuddy_v0.2_PostExecution_Review.md"]:
        print("  ", rel, "->", src_mtime(rel))
