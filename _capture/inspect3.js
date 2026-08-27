const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const port = 9225;
const chromePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const url = process.argv[2] || 'http://localhost:8081/';

const userDataDir = 'C:/Users/Administrator/AppData/Local/Temp/edge-inspect3-' + Date.now();
fs.mkdirSync(userDataDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  '--no-default-browser-check', '--disable-extensions',
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
        networkReqs.push({ url: r.url.slice(-60), status: r.status, mime: r.mimeType });
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
    await sendSession('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await sendSession('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 3500));

    const inspect = await sendSession('Runtime.evaluate', {
      expression: `
        ({
          // 真实由 v2-main.js 跑过后的状态
          jsLoadedClass: document.documentElement.classList.contains('js-loaded'),
          mediaChildCount: document.querySelector('.hero__media')?.children.length,
          hasVideo: !!document.querySelector('.hero__media video'),
          hasLabel: !!document.querySelector('.hero__media-label'),
          noiseExists: !!document.querySelector('.hero__media-noise'),
          vignetteExists: !!document.querySelector('.hero__media-vignette'),
          siteDataType: (typeof SITE_DATA === 'undefined') ? 'undef' : 'defined',
          siteDataHeroBgType: (typeof SITE_DATA !== 'undefined' && SITE_DATA.media) ? SITE_DATA.media['hero-background']?.type : 'n/a',
          videoCurrentSrc: document.querySelector('.hero__media video')?.currentSrc?.slice(-40),
          videoErrorCode: document.querySelector('.hero__media video')?.error?.code,
        })
      `,
      returnByValue: true
    });

    console.log('STATE:', JSON.stringify(inspect.result.value, null, 2));
    console.log('NETWORK (js):');
    networkReqs.filter(r => r.url.includes('.js')).forEach(r => console.log('  ', r.status, r.url));

    ws.close(); cleanup(); process.exit(0);
  } catch (e) { fail(e.message); }
}, 1500);
