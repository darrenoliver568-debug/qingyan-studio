/*
 * check-overflow.js — 一次性诊断：mobile 视口下哪些元素横向溢出
 * 用法: node check-overflow.js <url> [<url>...]
 * 输出: 每页 overflowX + 溢出元素 top 10（tag.class / right / width）
 */
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const URLS = process.argv.slice(2);
if (!URLS.length) { console.error('usage: node check-overflow.js <url>...'); process.exit(1); }

const port = 9540 + Math.floor(Math.random() * 100);
const chromePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const userDataDir = 'C:/Users/Administrator/AppData/Local/Temp/edge-ovf-' + Date.now();
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

  for (const url of URLS) {
    await ss('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await ss('Page.navigate', { url });
    await sleep(4500);
    // navigate 会重置 override，重新应用
    await ss('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await sleep(300);

    const state = await ss('Runtime.evaluate', {
      expression: `(() => {
        const de = document.documentElement;
        const vw = de.clientWidth;
        const overflowX = de.scrollWidth > vw + 1 ? de.scrollWidth - vw : 0;
        const offenders = [];
        if (overflowX > 0) {
          for (const el of document.querySelectorAll('body *')) {
            const r = el.getBoundingClientRect();
            if (r.right > vw + 1 && r.width > 0) {
              offenders.push({
                sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0, 3).join('.') : ''),
                right: Math.round(r.right), width: Math.round(r.width)
              });
            }
          }
        }
        return { overflowX, vw, offenders: offenders.slice(0, 12) };
      })()`,
      returnByValue: true
    });
    console.log('====', url);
    console.log(JSON.stringify(state.result.value, null, 1));
  }

  ws.close(); cleanup(); process.exit(0);
}

setTimeout(async () => {
  try { await main(); } catch (e) { fail(e.message); }
}, 1500);
