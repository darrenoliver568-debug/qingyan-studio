# -*- coding: utf-8 -*-
"""Project 01 Evidence Screenshot Capture
Renders faithful editor-style screenshots from REAL source files (read-only).
No content is altered; soft-wrap is visual only. Line numbers are the true
line numbers in the source file. Highlights are NOT baked in (web CSS layer).
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = r"D:\agent学习笔记\直播课程知识提取Pipeline"
OUT = r"C:\Users\Administrator\Desktop\作品集\assets\img\evidence\project01"

F_TEXT = r"C:\Windows\Fonts\msyh.ttc"      # Microsoft YaHei (CJK + latin)
F_MONO = r"C:\Windows\Fonts\consola.ttf"   # Consolas (line numbers / terminal)

# ---- style constants (consistent across every image) ----
W = 1200
LH = 38          # content line height
GUT = 64         # line-number gutter width
PADL = 10
PADR = 28
GAP = 18         # gap between gutter and content
WRAP_IND = 30    # hanging indent for soft-wrapped continuation lines
TAB_H = 48       # editor tab bar height

BG = (255, 255, 255)
TAB_BG = (244, 245, 246)
TAB_TXT = (52, 56, 65)
PATH_TXT = (152, 156, 164)
LN_COL = (120, 124, 133)
TXT_COL = (33, 38, 45)
BORDER = (226, 228, 232)

font_text = ImageFont.truetype(F_TEXT, 21)
font_tab = ImageFont.truetype(F_TEXT, 18)
font_path = ImageFont.truetype(F_TEXT, 14)
font_ln = ImageFont.truetype(F_MONO, 16)
font_mono = ImageFont.truetype(F_MONO, 20)

_dummy = ImageDraw.Draw(Image.new("RGB", (8, 8)))


def tokenize(s):
    toks, buf = [], ""
    for ch in s:
        if ch in " \t":
            if buf:
                toks.append(buf)
                buf = ""
            toks.append(" ")
        elif ord(ch) > 0x2E7F:  # CJK / fullwidth punctuation
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
    """Soft-wrap; never splits a latin run (e.g. SHA-256) unless it alone
    exceeds maxw (it never does here). CJK chars wrap individually."""
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


def _tab_bar(dr, title, right_label):
    dr.rectangle([0, 0, W, TAB_H], fill=TAB_BG)
    tw = dr.textlength(title, font=font_tab)
    dr.rounded_rectangle([16, 7, 16 + tw + 44, TAB_H - 1], radius=8,
                         fill=BG, outline=BORDER, width=1)
    dr.text((16 + 22, 15), title, font=font_tab, fill=TAB_TXT)
    if right_label:
        pw = dr.textlength(right_label, font=font_path)
        dr.text((W - PADR - pw, 17), right_label, font=font_path, fill=PATH_TXT)
    dr.line([0, TAB_H, W, TAB_H], fill=BORDER, width=1)


def capture(rel, start, end, outfile):
    """Editor-style screenshot of source file lines [start, end]."""
    full = os.path.join(ROOT, rel)
    with open(full, encoding="utf-8-sig") as f:
        lines = f.read().splitlines()
    assert 1 <= start <= end <= len(lines), f"range error {rel} {start}-{end}"
    seg = lines[start - 1:end]

    x0 = PADL + GUT + GAP
    wrap_w = W - x0 - PADR - WRAP_IND  # uniform wrap width; continuation indented
    visual = []  # (lineno|None, text, is_continuation)
    for i, ln in enumerate(seg):
        num = start + i
        pieces = wrap_line(ln, font_text, wrap_w)
        for j, p in enumerate(pieces):
            visual.append((num if j == 0 else None, p, j > 0))

    h = TAB_H + 24 + len(visual) * LH + 28
    img = Image.new("RGB", (W, h), BG)
    dr = ImageDraw.Draw(img)
    _tab_bar(dr, os.path.basename(rel), os.path.dirname(rel).replace("/", "\\"))
    y = TAB_H + 24
    for num, p, cont in visual:
        if num is not None:
            s = str(num)
            nw = dr.textlength(s, font=font_ln)
            dr.text((PADL + GUT - nw, y + 6), s, font=font_ln, fill=LN_COL)
        dr.text((x0 + (WRAP_IND if cont else 0), y + 2), p, font=font_text, fill=TXT_COL)
        y += LH
    img.save(os.path.join(OUT, outfile))
    print("OK", outfile, f"({h}px, {len(visual)} visual lines)")


def terminal(title, content_lines, outfile):
    """Terminal-style screenshot. content_lines: list of str (UTF-8)."""
    mono_ok = lambda s: all(ord(c) < 0x2E7F or c in "│├└─" for c in s)
    visual = []
    for ln in content_lines:
        f = font_mono if mono_ok(ln) else font_text
        visual.extend(wrap_line(ln, f, W - PADL - PADR - 16) if ln.strip() else [ln])
        visual[-len(visual):]  # no-op
    h = TAB_H + 22 + len(visual) * 34 + 26
    img = Image.new("RGB", (W, h), BG)
    dr = ImageDraw.Draw(img)
    _tab_bar(dr, title, None)
    y = TAB_H + 22
    for ln in visual:
        f = font_mono if mono_ok(ln) else font_text
        dr.text((PADL + 8, y), ln, font=f, fill=TXT_COL)
        y += 34
    img.save(os.path.join(OUT, outfile))
    print("OK", outfile, f"({h}px)")


def build_tree_lines():
    """Equivalent recursive directory listing (tree /F) — real disk state."""
    base = os.path.join(ROOT, "Human_Review_Queue")
    L = [r"D:\agent学习笔记\直播课程知识提取Pipeline\Human_Review_Queue"]

    def walk(d, prefix):
        entries = sorted(os.listdir(d))
        for i, e in enumerate(entries):
            last = (i == len(entries) - 1)
            L.append(prefix + ("└───" if last else "├───") + e)
            p = os.path.join(d, e)
            if os.path.isdir(p):
                walk(p, prefix + ("    " if last else "│   "))

    walk(base, "")
    return L


def main():
    os.makedirs(OUT, exist_ok=True)

    # ---------- S01 / E02 ----------
    capture(r"02_ASR测试/whispercpp/course_5min_raw.txt", 13, 17,
            "p01-s01-source.png")
    capture(r"05_知识提取/course_notes_raw_llm.md", 20, 24,
            "p01-s01-output-correct.png")
    capture(r"05_知识提取/course_notes_raw_llm.md", 74, 78,
            "p01-s01-output-overgeneralized.png")

    # ---------- S03 / E04 ----------
    capture(r"05_知识提取/prompt_v0.2.md", 61, 68, "p01-s03-prompt-baseline.png")
    capture(r"05_知识提取/prompt_v0.2_R1.md", 70, 79, "p01-s03-prompt-r1.png")

    # ---------- S02 / E03 ----------
    capture(r"05_知识提取/v0.2_quality_review.md", 1, 3, "p01-s02-self-review-01.png")
    capture(r"05_知识提取/v0.2_quality_review.md", 44, 46, "p01-s02-self-review-02.png")
    capture(r"05_知识提取/v0.2_quality_review.md", 86, 88, "p01-s02-self-review-03.png")
    capture(r"00_项目管理/Task_Brief/Pipeline_v0.2_Task_Brief_REVISED.md", 393, 405,
            "p01-s02-gate-01.png")
    capture(r"00_项目管理/Task_Brief/Pipeline_v0.2_Task_Brief_REVISED.md", 636, 641,
            "p01-s02-gate-02.png")
    capture(r"00_项目管理/WorkBuddy_Review/WorkBuddy_v0.2_PostExecution_Review.md", 11, 18,
            "p01-s02-independent-review-01.png")
    capture(r"00_项目管理/WorkBuddy_Review/WorkBuddy_v0.2_PostExecution_Review.md", 109, 113,
            "p01-s02-independent-review-02.png")

    # timestamp evidence (PowerShell Get-Item output, real disk values)
    terminal("Windows PowerShell", [
        r"PS D:\agent学习笔记\直播课程知识提取Pipeline\00_项目管理\Task_Brief> Get-Item .\Pipeline_v0.2_Task_Brief_REVISED.md | Select-Object Name,Length,LastWriteTime",
        "",
        "Name                                Length LastWriteTime",
        "----                                ------ -------------",
        "Pipeline_v0.2_Task_Brief_REVISED.md  16384 2026/8/23 10:19:35",
    ], "p01-s02-timestamp-brief.png")
    terminal("Windows PowerShell", [
        r"PS D:\agent学习笔记\直播课程知识提取Pipeline\05_知识提取> Get-Item .\v0.2_quality_review.md | Select-Object Name,Length,LastWriteTime",
        "",
        "Name                   Length LastWriteTime",
        "----                   ------ -------------",
        "v0.2_quality_review.md   5651 2026/8/23 10:29:56",
    ], "p01-s02-timestamp-self-review.png")
    terminal("Windows PowerShell", [
        r"PS D:\agent学习笔记\直播课程知识提取Pipeline\00_项目管理\WorkBuddy_Review> Get-Item .\WorkBuddy_v0.2_PostExecution_Review.md | Select-Object Name,Length,LastWriteTime",
        "",
        "Name                                   Length LastWriteTime",
        "----                                   ------ -------------",
        "WorkBuddy_v0.2_PostExecution_Review.md  16902 2026/8/23 10:37:16",
    ], "p01-s02-timestamp-independent-review.png")

    # ---------- S04 / E05 ----------
    capture(r"00_项目管理/Execution_Log/v0.2_R1_execution_log.md", 65, 67,
            "p01-s04-badcase-regression.png")
    capture(r"00_项目管理/Execution_Log/v0.2_R1_execution_log.md", 53, 54,
            "p01-s04-zero-manual-fix.png")
    capture(r"00_项目管理/WorkBuddy_Review/WorkBuddy_v0.2_R1_PostExecution_Review.md", 14, 16,
            "p01-s04-pass.png")
    capture(r"00_项目管理/WorkBuddy_Review/WorkBuddy_v0.2_R1_PostExecution_Review.md", 18, 18,
            "p01-s04-scope.png")
    capture(r"00_项目管理/WorkBuddy_Review/WorkBuddy_v0.2_R1_PostExecution_Review.md", 32, 32,
            "p01-s04-diff-proof.png")

    # ---------- S05 / E08 ----------
    terminal("tree /F Human_Review_Queue", build_tree_lines(),
             "p01-s05-queue-tree.png")
    capture(r"Human_Review_Queue/README.md", 1, 3, "p01-s05-readme-status.png")
    capture(r"Human_Review_Queue/README.md", 19, 19, "p01-s05-readme-l19.png")
    capture(r"Human_Review_Queue/Pending/HRQ-0001.md", 1, 13, "p01-s05-hrq0001.png")
    capture(r"Human_Review_Queue/Pending/HRQ-0002.md", 1, 14, "p01-s05-hrq0002.png")
    capture(r"Human_Review_Queue/Pending/HRQ-0003.md", 1, 14, "p01-s05-hrq0003.png")
    capture(r"Human_Review_Queue/Pending/HRQ-0001.md", 15, 21, "p01-s05-human-decision-empty.png")

    print("\nALL DONE:", len(os.listdir(OUT)), "files in", OUT)


if __name__ == "__main__":
    main()
