/*
 * dead-css-audit.js — 只读审计：v2.css + case-study.css 中未被消费的 class
 * 消费来源 = 4 个活跃 HTML 的 class 属性 + JS（v2-main.js / site-data.js / HTML 内联 script）中的字符串 token
 * 输出：未消费 class 清单（按文件分组），不修改任何文件
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const CSS_FILES = [
  'assets/css/v2.css',
  'assets/css/case-study.css',
];
const ACTIVE_HTML = [
  'index.html',
  'work/case-01-knowledge-extraction.html',
  'work/case-02-personal-learning-workspace.html',
  'work/case-03-multi-ai-workspace.html',
];
const JS_FILES = [
  'assets/js/v2-main.js',
  'assets/js/site-data.js',
];

function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }

// ---- 1. 提取 CSS 中定义的 class ----
// 去注释后，匹配选择器部分的 .class（排除 @keyframes/url 等干扰）
function extractCssClasses(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const set = new Set();
  // .foo 后不能紧跟标识符字符（避免 .foo-bar 匹配成 .foo）
  const re = /\.([a-zA-Z_][a-zA-Z0-9_-]*)(?![a-zA-Z0-9_-])/g;
  let m;
  while ((m = re.exec(css))) set.add(m[1]);
  return set;
}

// ---- 2. 提取 HTML 消费的 class ----
function extractHtmlClasses(html) {
  const set = new Set();
  // class="..."（含单引号）
  const re = /class\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) {
    m[1].trim().split(/\s+/).forEach(c => set.add(c));
  }
  // 内联 <script> 里的字符串也算 JS 消费（class token 形态）
  const scripts = html.match(/<script[\s\S]*?<\/script>/g) || [];
  scripts.forEach(s => collectJsTokens(s, set));
  // data-* 属性值中的 class-like token（保守起见不算消费 class，跳过）
  return set;
}

// ---- 3. 提取 JS 消费的 class（classList / className / 模板字符串）----
function collectJsTokens(js, set) {
  // 所有引号字符串字面量
  const strs = js.match(/(["'`])(?:\\.|(?!\1)[^\\])*\1/g) || [];
  strs.forEach(s => {
    const inner = s.slice(1, -1);
    inner.split(/[\s,]+/).forEach(tok => {
      if (/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(tok)) set.add(tok);
    });
  });
}

// ---- main ----
const defined = {}; // class -> [css files]
for (const f of CSS_FILES) {
  for (const c of extractCssClasses(read(f))) {
    (defined[c] = defined[c] || []).push(path.basename(f));
  }
}

const consumed = new Set();
for (const f of ACTIVE_HTML) collectAndAdd(f);
function collectAndAdd(f) { extractHtmlClasses(read(f)).forEach(c => consumed.add(c)); }
for (const f of JS_FILES) collectJsTokens(read(f), consumed);

const dead = Object.keys(defined)
  .filter(c => !consumed.has(c))
  .sort();

// 分组输出
const byFile = {};
for (const c of dead) {
  const key = defined[c].join(' + ');
  (byFile[key] = byFile[key] || []).push(c);
}

console.log(`CSS classes defined: ${Object.keys(defined).length}`);
console.log(`Consumed (active HTML + JS): ${consumed.size} tokens`);
console.log(`DEAD candidates: ${dead.length}\n`);
for (const [files, classes] of Object.entries(byFile)) {
  console.log(`---- ${files} (${classes.length}) ----`);
  console.log(classes.join(', '));
  console.log();
}

// 附加：本轮已知退役 class 的专项状态
const RETIRED = ['ev-grid--2', 'ev-grid--3', 'ev-grid--diff', 'ev-col', 'ev-col__head',
  'ev-col__path', 'ev-wide', 'ev-wide-lg', 'ev-support', 'ev-hero', 'ev-caption',
  'film__year', 'film__badge', 'film__media', 'ev-md', 'ev-lg', 'ev-pair', 'ev-pair--3',
  'ev-source', 'ev-figcap', 'ev-plain', 'case-nav', 'demo-slot'];
console.log('---- 专项核对（本轮迁移相关 class）----');
for (const c of RETIRED) {
  const d = defined[c] ? 'defined' : 'not-defined';
  const u = consumed.has(c) ? 'CONSUMED' : 'DEAD';
  console.log(`${c.padEnd(16)} ${d.padEnd(13)} ${u}`);
}

fs.writeFileSync(path.join(__dirname, 'dead-css-report.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  cssFiles: CSS_FILES,
  activeHtml: ACTIVE_HTML,
  deadClasses: dead,
}, null, 2));
console.log('\nreport: _capture/dead-css-report.json');
