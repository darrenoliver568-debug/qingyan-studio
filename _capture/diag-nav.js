/*
 * diag-nav.js — case-03 mobile 导航溢出深度诊断（只读）
 * 用法: node diag-nav.js <baseUrl>
 * 输出: .nav / .nav__inner / 子元素 rect + computed style，body/doc 宽度
 */
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const BASE = process.argv[2] || 'http://127.0.0.1:8080';
const PAGES = [
  '/work/case-03-multi-ai-workspace.html',
  '/work/case-01-knowledge-extraction.html'
];

const port = 9560 + Math.floor(Math.random() * 100);
const chromePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const userDataDir = 'C:/Users/Administrator/AppData/Local/Temp/edge-diag-' + Date.now();
fs.mkdirSync(userDataDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  '--no-default-browser-check', '--disable-extensions',
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
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
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

  for (const p of PAGES) {
    await ss('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await ss('Page.navigate', { url: BASE + p });
    await sleep(4500);
    await ss('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await sleep(500);

    const state = await ss('Runtime.evaluate', {
      expression: `(() => {
        const de = document.documentElement;
        const body = document.body;
        const vw = de.clientWidth;
        const out = {
          vw,
          deScrollWidth: de.scrollWidth,
          bodyWidth: Math.round(body.getBoundingClientRect().width),
          bodyRect: body.getBoundingClientRect().toJSON(),
          nav: null, navInner: null, children: [], offendersDeep: []
        };
        const nav = document.querySelector('header.nav');
        const inner = document.querySelector('.nav__inner');
        if (nav) {
          const cs = getComputedStyle(nav);
          const r = nav.getBoundingClientRect();
          out.nav = { rect: { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width) },
            position: cs.position, width: cs.width, left: cs.left, right: cs.right, minWidth: cs.minWidth,
            scrollWidth: nav.scrollWidth, clientWidth: nav.clientWidth };
        }
        if (inner) {
          const cs = getComputedStyle(inner);
          const r = inner.getBoundingClientRect();
          out.navInner = { rect: { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width) },
            display: cs.display, minWidth: cs.minWidth, scrollWidth: inner.scrollWidth, clientWidth: inner.clientWidth };
          for (const ch of inner.children) {
            const cr = ch.getBoundingClientRect();
            const ccs = getComputedStyle(ch);
            out.children.push({
              sel: ch.tagName.toLowerCase() + '.' + String(ch.className).trim().split(/\\s+/).join('.'),
              rect: { l: Math.round(cr.left), r: Math.round(cr.right), w: Math.round(cr.width) },
              display: ccs.display, scrollW: ch.scrollWidth
            });
          }
        }
        // 全文档 offenders（含文字内容摘要）
        if (de.scrollWidth > vw + 1) {
          for (const el of document.querySelectorAll('body *')) {
            const r = el.getBoundingClientRect();
            if (r.right > vw + 1 && r.width > 0) {
              out.offendersDeep.push({
                sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\\s+/).slice(0, 3).join('.') : ''),
                left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
                text: (el.textContent || '').trim().slice(0, 30),
                pos: getComputedStyle(el).position
              });
            }
          }
          out.offendersDeep = out.offendersDeep.slice(0, 15);
        }
        return out;
      })()`,
      returnByValue: true
    });
    console.log('========', p);
    console.log(JSON.stringify(state.result.value, null, 1));
  }

  ws.close(); cleanup(); process.exit(0);
}

setTimeout(async () => {
  try { await main(); } catch (e) { fail(e.message); }
}, 1500);
