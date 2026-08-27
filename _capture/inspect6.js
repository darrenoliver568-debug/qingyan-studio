/*
 * inspect6.js — Hero 回退链事件序列（console 捕获 + 时间线）
 * 用法: node inspect6.js <url>
 */
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const port = 9228;
const chromePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const url = process.argv[2] || 'http://localhost:8081/';

const userDataDir = 'C:/Users/Administrator/AppData/Local/Temp/edge-inspect6-' + Date.now();
fs.mkdirSync(userDataDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  '--no-default-browser-check', '--disable-extensions', '--autoplay-policy=no-user-gesture-required',
  '--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir,
  '--window-size=1440,900', 'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'] });

let killed = false;
function cleanup() { if (killed) return; killed = true; try { chrome.kill(); } catch {} try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {} }
function fail(msg) { console.error('FAIL:', msg); cleanup(); process.exit(1); }

setTimeout(async () => {
  try {
    const info = await new Promise((resolve, reject) => {
      http.get(`http://localhost:${port}/json/version`, (res) => {
        let body = ''; res.on('data', d => body += d);
        res.on('end', () => resolve(JSON.parse(body))); res.on('error', reject);
      }).on('error', reject);
    });

    const ws = new WebSocket(info.webSocketDebuggerUrl, { perMessageDeflate: false });
    let msgId = 0;
    const pending = new Map();
    const consoleLines = [];
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        const args = (msg.params.args || []).map(a => {
          if (a.value !== undefined) return JSON.stringify(a.value);
          if (a.description) return a.description;
          return '';
        }).join(' ');
        consoleLines.push(args);
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
    function sendSession(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++msgId; pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params, sessionId }));
      });
    }
    await sendSession('Page.enable');
    await sendSession('Runtime.enable');
    await sendSession('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await sendSession('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 10000));

    console.log('=== CONSOLE EVENTS ===');
    consoleLines.forEach(l => console.log('  ', l));
    if (!consoleLines.length) console.log('  (none)');

    const state = await sendSession('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.querySelector('.hero__media');
          const kids = Array.from(el.children).map(c => {
            const cls = (c.className && c.className.baseVal !== undefined) ? c.className.baseVal : (c.className || '');
            return c.tagName + '.' + String(cls).split(' ')[0] + (c.tagName === 'IMG' ? '[ok=' + (c.complete && c.naturalWidth > 0) + ']' : '');
          });
          return JSON.stringify({ kids });
        })()
      `,
      returnByValue: true
    });
    console.log('=== FINAL STATE ===');
    console.log(state.result.value);

    ws.close(); cleanup(); process.exit(0);
  } catch (e) { fail(e.message); }
}, 1500);
