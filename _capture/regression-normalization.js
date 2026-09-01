/*
 * regression-normalization.js — Structure Normalization 浏览器回归
 * 覆盖：4 页（index + case01/02/03）× Desktop(1440) / Mobile(390) 全页截图
 *       + console error / exception 收集
 *       + index 页 film-modal 打开/关闭交互验证（placeholder 态）
 * 用法: NODE_PATH=<workspace node_modules> node regression-normalization.js <baseUrl>
 * 输出: _capture/regression/*.png + 控制台 JSON 摘要
 */
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const BASE = process.argv[2] || 'http://127.0.0.1:8080';
const OUT_DIR = path.join(__dirname, 'regression');
fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  { name: 'index', url: BASE + '/index.html' },
  { name: 'case-01', url: BASE + '/work/case-01-knowledge-extraction.html' },
  { name: 'case-02', url: BASE + '/work/case-02-personal-learning-workspace.html' },
  { name: 'case-03', url: BASE + '/work/case-03-multi-ai-workspace.html' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'mobile', width: 390, height: 844, mobile: true },
];

const port = 9340 + Math.floor(Math.random() * 100);
const chromePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const userDataDir = 'C:/Users/Administrator/AppData/Local/Temp/edge-regnorm-' + Date.now();
fs.mkdirSync(userDataDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  '--no-default-browser-check', '--disable-extensions',
  '--autoplay-policy=no-user-gesture-required',
  '--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir,
  'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'] });

let killed = false;
function cleanup() {
  if (killed) return; killed = true;
  try { chrome.kill(); } catch {}
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
}
function fail(msg) { console.error('FAIL:', msg); cleanup(); process.exit(1); }

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const info = await new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}/json/version`, (res) => {
      let body = ''; res.on('data', d => body += d);
      res.on('end', () => resolve(JSON.parse(body))); res.on('error', reject);
    }).on('error', reject);
  });

  const ws = new WebSocket(info.webSocketDebuggerUrl, { perMessageDeflate: false });
  let msgId = 0;
  const pending = new Map();
  const consoleErrors = [];   // per-page collected below via closure
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      const args = (msg.params.args || []).map(a => a.value || a.description || '').join(' ');
      consoleErrors.push({ kind: 'console.error', text: args.slice(0, 300) });
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      consoleErrors.push({ kind: 'exception', text: ((d.exception && (d.exception.description || d.exception.value)) || d.text || '').slice(0, 300) });
    } else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      consoleErrors.push({ kind: 'log', text: (msg.params.entry.text + ' ' + (msg.params.entry.url || '')).slice(0, 300) });
    }
  });
  ws.on('error', (e) => fail('ws error: ' + e.message));
  await new Promise(r => ws.once('open', r));

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++msgId; pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  const targets = await send('Target.getTargets');
  const pageTarget = targets.targetInfos.find(t => t.type === 'page');
  const sessionId = (await send('Target.attachToTarget', { targetId: pageTarget.targetId, flatten: true })).sessionId;
  function ss(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++msgId; pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }

  await ss('Page.enable');
  await ss('Runtime.enable');
  await ss('Log.enable');

  const report = { pages: {}, modalTest: null };

  for (const page of PAGES) {
    for (const vp of VIEWPORTS) {
      consoleErrors.length = 0;
      await ss('Emulation.setDeviceMetricsOverride', {
        width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile
      });
      await ss('Page.navigate', { url: page.url });
      await sleep(4500); // 等待 reveal fallback(2s) + 图片解码

      // Chromium: navigate 会重置 device metrics override → 截图前必须重新应用，
      // 否则 Page.captureScreenshot 报 "Cannot take screenshot with 0 width"。
      // 重应用后仍有偶发竞态 → 带 viewport 校验 + 最多 3 次重试。
      let shot = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        await ss('Emulation.setDeviceMetricsOverride', {
          width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile
        });
        await sleep(attempt === 1 ? 300 : 900);
        // 校验 viewport override 确已生效
        const vw = await ss('Runtime.evaluate', {
          expression: 'document.documentElement.clientWidth',
          returnByValue: true
        });
        if (vw.result.value < vp.width - 20) { // 容差 20px：desktop 经典滚动条占 ~15px
          console.log(`[retry ${attempt}] viewport=${vw.result.value} (want ${vp.width}), re-applying override`);
          continue;
        }
        try {
          shot = await ss('Page.captureScreenshot', {
            format: 'png', captureBeyondViewport: true, fromSurface: true
          });
          break;
        } catch (e) {
          console.log(`[retry ${attempt}] captureScreenshot failed: ${e.message}`);
        }
      }
      if (!shot) throw new Error('captureScreenshot failed after 3 attempts: ' + page.name + '-' + vp.name);
      const file = path.join(OUT_DIR, `${page.name}-${vp.name}.png`);
      fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));

      // 基本结构断言（desktop 只跑一次即可，但两档都收集轻量指标）
      const state = await ss('Runtime.evaluate', {
        expression: `(() => {
          const de = document.documentElement;
          return {
            title: document.title.slice(0, 60),
            overflowX: de.scrollWidth > de.clientWidth + 1 ? (de.scrollWidth - de.clientWidth) : 0,
            brokenImgs: Array.from(document.images).filter(i => i.complete && i.naturalWidth === 0).length,
            revealVisible: document.querySelectorAll('.reveal.is-visible').length,
            revealTotal: document.querySelectorAll('.reveal').length,
          };
        })()`,
        returnByValue: true
      });

      report.pages[`${page.name}-${vp.name}`] = {
        screenshot: path.relative(path.join(__dirname, '..'), file),
        ...state.result.value,
        consoleErrors: consoleErrors.slice(),
      };
      console.log(`[OK] ${page.name}-${vp.name} | overflowX=${state.result.value.overflowX} brokenImgs=${state.result.value.brokenImgs} errors=${consoleErrors.length}`);
    }
  }

  // ---- index Desktop：film-modal 交互验证 ----
  consoleErrors.length = 0;
  await ss('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await ss('Page.navigate', { url: PAGES[0].url });
  await sleep(4000);

  const modalTest = await ss('Runtime.evaluate', {
    expression: `(async () => {
      const modal = document.getElementById('film-modal');
      const trigger = document.querySelector('.film__cta[data-film="aigc-jiading"]');
      if (!modal) return { ok: false, step: 'modal-not-found' };
      if (!trigger) return { ok: false, step: 'trigger-not-found' };
      trigger.click();
      await new Promise(r => setTimeout(r, 600));
      const openState = {
        isOpen: modal.classList.contains('is-open'),
        ariaHidden: modal.getAttribute('aria-hidden'),
        bodyLocked: document.body.classList.contains('is-film-modal-open'),
        title: (modal.querySelector('.film-modal__title') || {}).textContent || '',
        hasPlaceholder: !!modal.querySelector('.film-modal__placeholder'),
        hasVideo: !!modal.querySelector('.film-modal__stage video'),
      };
      // ESC 关闭
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await new Promise(r => setTimeout(r, 500));
      const closeState = {
        closedAfterEsc: !modal.classList.contains('is-open'),
        bodyUnlocked: !document.body.classList.contains('is-film-modal-open'),
      };
      return { ok: openState.isOpen && openState.hasPlaceholder && !openState.hasVideo && closeState.closedAfterEsc && closeState.bodyUnlocked, openState, closeState };
    })()`,
    returnByValue: true,
    awaitPromise: true
  });
  report.modalTest = modalTest.result.value;
  report.modalTest.consoleErrors = consoleErrors.slice();
  console.log('[MODAL]', JSON.stringify(report.modalTest, null, 2));

  // ---- case-nav 链路验证（静态 href 检查）----
  const links = await ss('Runtime.evaluate', {
    expression: `(async () => {
      const out = [];
      for (const p of ${JSON.stringify(PAGES.map(x => x.url))}) {
        const res = await fetch(p); const html = await res.text();
        const navCount = (html.match(/class="case-nav[\s\S]*?<\/nav>/g) || []).length;
        const nexts = Array.from(html.matchAll(/case-nav__next"\s+href="([^"]+)"/g)).map(m => m[1]);
        const backs = Array.from(html.matchAll(/case-nav__back"\s+href="([^"]+)"/g)).map(m => m[1]);
        out.push({ page: p.split('/').pop(), navCount, nexts, backs });
      }
      return out;
    })()`,
    returnByValue: true,
    awaitPromise: true
  });
  report.caseNav = links.result.value;
  console.log('[CASE-NAV]', JSON.stringify(report.caseNav, null, 2));

  fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  console.log('REPORT:', path.join(OUT_DIR, 'report.json'));

  ws.close(); cleanup(); process.exit(0);
}

setTimeout(async () => {
  try { await main(); } catch (e) { fail(e.message); }
}, 1500);
