/*
 * inspect4.js — 深度诊断 Hero video 错误回退链
 * 用途：Test B 验证——video src 404 时 error 事件是否触发、video 状态如何、网络请求结果
 * 用法: node inspect4.js <url>
 */
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const port = 9226;
const chromePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const url = process.argv[2] || 'http://localhost:8081/';

const userDataDir = 'C:/Users/Administrator/AppData/Local/Temp/edge-inspect4-' + Date.now();
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
    const networkReqs = [];
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
      if (msg.method === 'Network.responseReceived') {
        const r = msg.params.response;
        networkReqs.push({ url: r.url.slice(-50), status: r.status });
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        const args = (msg.params.args || []).map(a => a.value !== undefined ? a.value : a.description).join(' ');
        console.log('  [console]', args);
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
    await sendSession('Network.enable');
    await sendSession('Runtime.enable');
    await sendSession('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await sendSession('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 5000));

    const inspect = await sendSession('Runtime.evaluate', {
      expression: `
        (() => {
          const v = document.querySelector('.hero__media video');
          const NS = ['NETWORK_EMPTY','NETWORK_IDLE','NETWORK_LOADING','NETWORK_NO_SOURCE'];
          const RS = ['HAVE_NOTHING','HAVE_METADATA','HAVE_CURRENT_DATA','HAVE_FUTURE_DATA','HAVE_ENOUGH_DATA'];
          // 注入事件捕获探针（下一轮验证用）
          window.__probe = { err: null, events: [] };
          const v2 = document.querySelector('.hero__media video');
          if (v2) {
            ['error','loadeddata','canplay','stalled','abort','emptied'].forEach(ev => {
              v2.addEventListener(ev, () => window.__probe.events.push(ev), { capture: true });
            });
            v2.addEventListener('error', () => { window.__probe.err = { code: v2.error && v2.error.code, msg: v2.error && v2.error.message }; });
          }
          return {
            mediaChildCount: document.querySelector('.hero__media')?.children.length,
            hasVideo: !!v,
            hasScene: !!document.querySelector('.hero__media .hero__scene'),
            hasLabel: !!document.querySelector('.hero__media-label'),
            noiseExists: !!document.querySelector('.hero__media-noise'),
            vignetteExists: !!document.querySelector('.hero__media-vignette'),
            video: v ? {
              networkState: NS[v.networkState],
              readyState: RS[v.readyState],
              errorCode: v.error ? v.error.code : null,
              errorMsg: v.error ? v.error.message : null,
              paused: v.paused,
              currentSrc: (v.currentSrc || '').slice(-50),
              src: (v.getAttribute('src') || '') || (v.querySelector('source') ? v.querySelector('source').src.slice(-50) : '')
            } : null,
          };
        })()
      `,
      returnByValue: true
    });

    console.log('STATE:', JSON.stringify(inspect.result.value, null, 2));
    console.log('NETWORK (video-related):');
    networkReqs.filter(r => r.url.includes('.mp4') || r.url.includes('.webm') || r.url.includes('video')).forEach(r => console.log('  ', r.status, r.url));

    ws.close(); cleanup(); process.exit(0);
  } catch (e) { fail(e.message); }
}, 1500);
